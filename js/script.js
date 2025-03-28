// js/script.js

// WebGPU globals
let device, context, canvas;
let uniformBuffer, bindGroup, pipeline;

const shaderCode = `
struct Uniforms {
    mousePos: vec2f,
    resolution: vec2f,
}

@binding(0) @group(0) var<uniform> uniforms: Uniforms;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f {
    let pos = array(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f(-1.0,  1.0),
        vec2f( 1.0,  1.0),
    );
    return vec4f(pos[vertexIndex], 0.0, 1.0);
}

@fragment
fn fragmentMain(@builtin(position) pos: vec4f) -> @location(0) vec4f {
    let uv = pos.xy / uniforms.resolution;
    let center = uniforms.mousePos / uniforms.resolution;
    let dist = distance(uv, center);
    let color = 1.0 - smoothstep(0.0, 0.1, dist);
    return vec4f(0.39, 1.0, 0.85, color * 0.5); // Aqua color
}`;

// Mouse position state
let mouseX = 0;
let mouseY = 0;

async function initWebGPU() {
    // Check if WebGPU is supported
    if (!navigator.gpu) {
        console.log('WebGPU is not supported in this browser. Skipping WebGPU initialization.');
        return false;
    }
    
    try {
        // Request adapter and device
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            console.log('No appropriate WebGPU adapter found.');
            return false;
        }
        
        device = await adapter.requestDevice();

        // Setup canvas
        canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);

        // Configure canvas context
        context = canvas.getContext('webgpu');
        if (!context) {
            console.log('Failed to get WebGPU context.');
            return false;
        }
        
        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
            device,
            format: canvasFormat,
            alphaMode: 'premultiplied',
        });

        // Create uniform buffer - size 16 bytes for 2 vec2f (4 floats * 4 bytes)
        uniformBuffer = device.createBuffer({
            size: 16, 
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        // Create bind group layout
        const bindGroupLayout = device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: { type: 'uniform' }
            }]
        });

        // Create pipeline layout
        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        });

        // Create bind group
        bindGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [{
                binding: 0,
                resource: { buffer: uniformBuffer }
            }]
        });

        // Create render pipeline
        pipeline = device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: {
                module: device.createShaderModule({ code: shaderCode }),
                entryPoint: 'vertexMain',
            },
            fragment: {
                module: device.createShaderModule({ code: shaderCode }),
                entryPoint: 'fragmentMain',
                targets: [{
                    format: canvasFormat,
                    blend: {
                        color: {
                            srcFactor: 'src-alpha',
                            dstFactor: 'one-minus-src-alpha',
                        },
                        alpha: {
                            srcFactor: 'one',
                            dstFactor: 'one-minus-src-alpha',
                        },
                    },
                }],
            },
            primitive: {
                topology: 'triangle-strip',
                stripIndexFormat: undefined,
            },
        });

        // Start render loop
        requestAnimationFrame(render);
        return true;
    } catch (error) {
        console.error('WebGPU initialization failed:', error);
        return false;
    }
}

function updateUniforms() {
    if (!device || !uniformBuffer) return;
    
    const uniformData = new Float32Array([
        mouseX, mouseY,
        canvas.width, canvas.height
    ]);
    device.queue.writeBuffer(uniformBuffer, 0, uniformData);
}

function render() {
    if (!device || !context || !pipeline) return;
    
    updateUniforms();

    const commandEncoder = device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 0 },
            loadOp: 'clear',
            storeOp: 'store',
        }],
    });

    renderPass.setPipeline(pipeline);
    renderPass.setBindGroup(0, bindGroup);
    renderPass.draw(4);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(render);
}

// Initialize and setup event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const webGPUInitialized = await initWebGPU();
    
    if (webGPUInitialized) {
        // Update canvas size when window resizes
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Track mouse position
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
    }

    // Get current year for footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // GitHub username - replace with your own
    const githubUsername = 'yourusername';

    // Fetch GitHub repositories
    fetchGitHubRepos(githubUsername);

    // Form submission handler - remove the alert for Formspree forms
    const contactForm = document.getElementById('contact-form');
    if (contactForm && !contactForm.getAttribute('action').includes('formspree')) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real implementation, you would send the form data to a server
            // For now, just show a success message
            alert('Thank you for your message! This is a demonstration and the message was not actually sent.');
            contactForm.reset();
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    });

    // Email link handler
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const email = this.getAttribute('href').replace('mailto:', '');
            window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank');
        });
    });

    // Handle resume download button click
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Path to the resume file - relative to the website root
            const resumePath = 'Documents/DimasRizky-Resume.pdf';
            
            // Create an anchor element
            const downloadLink = document.createElement('a');
            downloadLink.href = resumePath;
            downloadLink.download = 'DimasRizky-Resume.pdf'; // Set the download filename
            downloadLink.target = '_blank'; // Open in new tab as fallback
            
            // Add a success message
            const message = document.createElement('div');
            message.style.position = 'fixed';
            message.style.top = '20px';
            message.style.left = '50%';
            message.style.transform = 'translateX(-50%)';
            message.style.backgroundColor = 'rgba(100, 255, 218, 0.9)';
            message.style.color = '#121212';
            message.style.padding = '10px 20px';
            message.style.borderRadius = '5px';
            message.style.zIndex = '9999';
            message.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            message.textContent = 'Downloading resume...';
            document.body.appendChild(message);
            
            // Append to the body (required for Firefox)
            document.body.appendChild(downloadLink);
            
            // Programmatically click the link to trigger download
            downloadLink.click();
            
            // Clean up
            document.body.removeChild(downloadLink);
            
            // Remove message after a delay
            setTimeout(() => {
                message.style.opacity = '0';
                message.style.transition = 'opacity 0.5s ease';
                setTimeout(() => document.body.removeChild(message), 500);
            }, 2000);
        });
    }
});

// Function to fetch GitHub repositories
function fetchGitHubRepos(username) {
    const projectsContainer = document.getElementById('github-projects');
    if (!projectsContainer) return;

    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`)
        .then(response => {
            if (!response.ok) {
                throw new Error('GitHub API request failed');
            }
            return response.json();
        })
        .then(repos => {
            // Remove loader
            const loader = document.querySelector('.project-loader');
            if (loader) {
                loader.remove();
            }

            // Filter out forked repositories (optional)
            const filteredRepos = repos.filter(repo => !repo.fork);
            
            // Display repositories
            filteredRepos.forEach(repo => {
                const card = createProjectCard(repo);
                projectsContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching GitHub repositories:', error);
            
            // Show error message
            const loader = document.querySelector('.project-loader');
            if (loader) {
                loader.textContent = 'Failed to load projects. Please check the console for details.';
            }
        });
}

// Function to create a project card
function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card';

    // Create project image placeholder
    const imageDiv = document.createElement('div');
    imageDiv.className = 'project-image';
    
    // If the repo has a homepage, we could try to get a screenshot, but for now just use a placeholder
    imageDiv.innerHTML = `<i class="fas fa-code" style="font-size: 3rem;"></i>`;
    
    // Create project info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'project-info';
    
    // Get languages for the repository (this would require additional API calls in a real implementation)
    const tagsHTML = repo.topics && repo.topics.length ? 
        repo.topics.map(topic => `<span class="project-tag">${topic}</span>`).join('') :
        '<span class="project-tag">No tags</span>';
    
    infoDiv.innerHTML = `
        <h3>${repo.name}</h3>
        <p>${repo.description || 'No description available'}</p>
        <div class="project-tags">
            ${tagsHTML}
        </div>
        <div class="project-links">
            <a href="${repo.html_url}" target="_blank"><i class="fab fa-github"></i> View Source</a>
            ${repo.homepage ? `<a href="${repo.homepage}" target="_blank"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
        </div>
    `;
    
    // Append elements to card
    card.appendChild(imageDiv);
    card.appendChild(infoDiv);
    
    return card;
}