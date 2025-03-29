// WebGPU implementation of the particle system
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing WebGPU particle system...');
    
    // Get or create particle container
    let container = document.getElementById('particle-container');
    if (!container) {
        console.error('Particle container not found!');
        return;
    }
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Default configuration options for particle system
    const defaultConfig = {
        particleCount: 10000,     // Significantly increased count for GPU processing
        starBrightness: 1,        // Brightness of stars (0-1)
        particleMovement: 0.7,    // Movement rate of particles (0-1)
        floatingRate: 0.3         // Rate of floating effects
    };
    
    // Load saved configuration from localStorage if available
    let config = loadParticleConfig(defaultConfig);
    
    // Function to save/load config
    function saveParticleConfig(config) {
        try {
            localStorage.setItem('particleConfig', JSON.stringify(config));
        } catch (e) {
            console.warn('Could not save particle settings:', e);
        }
    }
    
    function loadParticleConfig(defaultConfig) {
        try {
            const savedConfig = localStorage.getItem('particleConfig');
            if (savedConfig) {
                return { ...defaultConfig, ...JSON.parse(savedConfig) };
            }
        } catch (e) {
            console.warn('Could not load particle settings:', e);
        }
        return { ...defaultConfig };
    }
    
    // Create canvas element for WebGPU rendering
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);
    
    // Set the canvas size to match window size
    function resizeCanvas() {
        const devicePixelRatio = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
    }
    
    // Call resize initially and on window resize
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
        if (renderer) {
            renderer.resize(canvas.width, canvas.height);
        }
    });
    
    // Check for WebGPU support
    if (!navigator.gpu) {
        console.error('WebGPU not supported! Falling back to DOM-based particles');
        const fallbackScript = document.createElement('script');
        fallbackScript.src = 'js/particles.js';
        document.head.appendChild(fallbackScript);
        return;
    }
    
    try {
        // Initialize WebGPU
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error('No appropriate GPUAdapter found.');
        }
        
        const device = await adapter.requestDevice();
        const context = canvas.getContext('webgpu');
        
        const devicePixelRatio = window.devicePixelRatio || 1;
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        
        context.configure({
            device,
            format: presentationFormat,
            alphaMode: 'premultiplied'
        });
        
        // Star colors (same as original, but in RGB format)
        const starColors = [
            [0.39, 1.0, 0.85, 1.0],   // Teal
            [0.62, 1.0, 0.92, 1.0],   // Light teal
            [1.0, 0.39, 0.39, 1.0],   // Red/coral
            [1.0, 0.94, 0.39, 1.0],   // Yellow
            [0.76, 0.39, 1.0, 1.0],   // Purple
            [1.0, 1.0, 1.0, 1.0]      // White
        ];
        
        // Create particles with random properties
        const particleCount = config.particleCount;
        const particlesData = new Float32Array(particleCount * 10); // 10 floats per particle
        
        for (let i = 0; i < particleCount; i++) {
            const baseIndex = i * 10;
            const starType = Math.floor(Math.random() * 3); // 0, 1, or 2
            
            // Position (x, y) in normalized device coordinates (-1 to 1)
            particlesData[baseIndex] = Math.random() * 2 - 1;     // x
            particlesData[baseIndex + 1] = Math.random() * 2 - 1; // y
            
            // Size (with the same distribution as original)
            let size;
            if (starType === 0) {
                size = Math.random() * 0.02 + 0.01; // Small stars
            } else if (starType === 1) {
                size = Math.random() * 0.03 + 0.02; // Medium stars
            } else {
                size = Math.random() * 0.04 + 0.03; // Large stars
            }
            particlesData[baseIndex + 2] = size;
            
            // Color (pick from starColors array based on type)
            let colorIndex;
            if (starType === 0) {
                colorIndex = Math.floor(Math.random() * 2) + 4; // Purple and white
            } else if (starType === 1) {
                colorIndex = Math.floor(Math.random() * 2) + 1; // Teal and light teal
            } else {
                colorIndex = Math.floor(Math.random() * 2) + 2; // Red/coral and yellow
            }
            
            const color = starColors[colorIndex];
            particlesData[baseIndex + 3] = color[0]; // r
            particlesData[baseIndex + 4] = color[1]; // g
            particlesData[baseIndex + 5] = color[2]; // b
            
            // Alpha/Opacity - will be animated
            particlesData[baseIndex + 6] = 0; // Start invisible
            
            // Animation timings
            const fadeInTime = (Math.random() * 2 + 1) * 1000;    // 1-3 seconds
            const visibleTime = (Math.random() * 5 + 3) * 1000;   // 3-8 seconds
            const fadeOutTime = (Math.random() * 2 + 1) * 1000;   // 1-3 seconds
            const totalCycleTime = fadeInTime + visibleTime + fadeOutTime;
            
            // Store animation parameters
            particlesData[baseIndex + 7] = fadeInTime / totalCycleTime;       // normalized fade in time
            particlesData[baseIndex + 8] = (fadeInTime + visibleTime) / totalCycleTime; // normalized fade out start time
            particlesData[baseIndex + 9] = Math.random() * 1000;              // offset to start animation at different times
        }
        
        // Create a buffer to store the particle data
        const particlesBuffer = device.createBuffer({
            size: particlesData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        
        // Write initial data to the buffer
        new Float32Array(particlesBuffer.getMappedRange()).set(particlesData);
        particlesBuffer.unmap();
        
        // Define the vertex shader (WGSL)
        const vertexShaderModule = device.createShaderModule({
            code: `
                struct VertexOutput {
                    @builtin(position) position: vec4f,
                    @location(0) color: vec4f,
                    @location(1) uv: vec2f,
                };
                
                struct Particle {
                    position: vec2f,
                    size: f32,
                    color: vec3f,
                    opacity: f32,
                    fadeInTime: f32,
                    fadeOutStart: f32,
                    timeOffset: f32,
                }
                
                @group(0) @binding(0) var<uniform> time: f32;
                @group(0) @binding(1) var<uniform> resolution: vec2f;
                @group(0) @binding(2) var<uniform> brightness: f32;
                
                @vertex
                fn vertexMain(
                    @location(0) particle: Particle,
                    @location(7) quadPosition: vec2f,
                ) -> VertexOutput {
                    // Calculate animation cycle
                    var animTime = fract((time + particle.timeOffset) / 10000.0);
                    var opacity = 0.0;
                    
                    // Fade in phase
                    if (animTime < particle.fadeInTime) {
                        opacity = animTime / particle.fadeInTime;
                    }
                    // Visible phase
                    else if (animTime < particle.fadeOutStart) {
                        opacity = 1.0;
                    }
                    // Fade out phase
                    else {
                        opacity = 1.0 - (animTime - particle.fadeOutStart) / (1.0 - particle.fadeOutStart);
                    }
                    
                    // Apply brightness modifier
                    opacity = opacity * brightness;
                    
                    // Twinkle effect
                    var twinkle = sin(time * 0.001 + particle.timeOffset) * 0.2 + 0.8;
                    opacity = opacity * twinkle;
                    
                    // Calculate size including animation
                    var size = particle.size;
                    if (animTime > particle.fadeOutStart) {
                        // Shrink during fadeout
                        size = size * (1.0 - (animTime - particle.fadeOutStart) * 0.6);
                    }
                    
                    // Apply aspect ratio correction
                    var aspect = resolution.x / resolution.y;
                    
                    // Calculate vertex position based on quad corner and particle position/size
                    var pos = vec2f(
                        particle.position.x + quadPosition.x * size,
                        particle.position.y + quadPosition.y * size / aspect
                    );
                    
                    var output: VertexOutput;
                    output.position = vec4f(pos, 0.0, 1.0);
                    output.color = vec4f(particle.color, opacity);
                    output.uv = quadPosition * 0.5 + 0.5; // Transform to 0-1 range for fragment shader
                    
                    return output;
                }
            `
        });
        
        // Define the fragment shader (WGSL)
        const fragmentShaderModule = device.createShaderModule({
            code: `
                @fragment
                fn fragmentMain(
                    @location(0) color: vec4f,
                    @location(1) uv: vec2f
                ) -> @location(0) vec4f {
                    // Calculate distance from center for circular/star shape
                    var dist = distance(uv, vec2f(0.5, 0.5)) * 2.0;
                    
                    // Apply radial falloff for glow effect
                    var alpha = smoothstep(1.0, 0.0, dist) * color.a;
                    
                    // Return final color with glow
                    return vec4f(color.rgb, alpha);
                }
            `
        });
        
        // Create a buffer for time uniform
        const timeBuffer = device.createBuffer({
            size: Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        
        // Create a buffer for resolution uniform
        const resolutionBuffer = device.createBuffer({
            size: 2 * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        
        // Create a buffer for brightness uniform
        const brightnessBuffer = device.createBuffer({
            size: Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        
        // Update the resolution buffer
        device.queue.writeBuffer(
            resolutionBuffer,
            0,
            new Float32Array([canvas.width, canvas.height])
        );
        
        // Update the brightness buffer with initial value
        device.queue.writeBuffer(
            brightnessBuffer,
            0,
            new Float32Array([config.starBrightness])
        );
        
        // Create the bind group layout and pipeline layout
        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: 'uniform' }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: 'uniform' }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: 'uniform' }
                }
            ]
        });
        
        const bindGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: { buffer: timeBuffer }
                },
                {
                    binding: 1,
                    resource: { buffer: resolutionBuffer }
                },
                {
                    binding: 2,
                    resource: { buffer: brightnessBuffer }
                }
            ]
        });
        
        // Create vertex buffers for quad positions (2 triangles forming a square)
        const quadPositions = new Float32Array([
            -1, -1,  // bottom left
             1, -1,  // bottom right
            -1,  1,  // top left
             1,  1,  // top right
        ]);
        
        const quadBuffer = device.createBuffer({
            size: quadPositions.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true
        });
        
        new Float32Array(quadBuffer.getMappedRange()).set(quadPositions);
        quadBuffer.unmap();
        
        // Define how the vertex data is laid out in memory
        const vertexBufferLayout = [
            {
                // Particle properties
                arrayStride: 10 * Float32Array.BYTES_PER_ELEMENT,
                stepMode: 'instance',
                attributes: [
                    { shaderLocation: 0, offset: 0, format: 'float32x2' },   // position
                    { shaderLocation: 1, offset: 8, format: 'float32' },     // size
                    { shaderLocation: 2, offset: 12, format: 'float32x3' },  // color
                    { shaderLocation: 5, offset: 24, format: 'float32' },    // opacity
                    { shaderLocation: 6, offset: 28, format: 'float32' },    // fadeInTime
                    { shaderLocation: 7, offset: 32, format: 'float32' },    // fadeOutStart
                    { shaderLocation: 8, offset: 36, format: 'float32' },    // timeOffset
                ]
            },
            {
                // Quad vertices (2 triangles for each particle)
                arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
                stepMode: 'vertex',
                attributes: [
                    { shaderLocation: 9, offset: 0, format: 'float32x2' }    // quadPosition
                ]
            }
        ];
        
        // Create the render pipeline
        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        });
        
        const renderPipeline = device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: {
                module: vertexShaderModule,
                entryPoint: 'vertexMain',
                buffers: vertexBufferLayout
            },
            fragment: {
                module: fragmentShaderModule,
                entryPoint: 'fragmentMain',
                targets: [{ format: presentationFormat, blend: {
                    color: {
                        srcFactor: 'src-alpha',
                        dstFactor: 'one',
                        operation: 'add'
                    },
                    alpha: {
                        srcFactor: 'one',
                        dstFactor: 'one-minus-src-alpha',
                        operation: 'add'
                    }
                }}]
            },
            primitive: {
                topology: 'triangle-strip',
                stripIndexFormat: 'uint16'
            }
        });
        
        // Animation and render loop
        let lastTime = 0;
        
        function render(currentTime) {
            // Convert to milliseconds
            currentTime *= 1;
            
            // Update time uniform
            device.queue.writeBuffer(timeBuffer, 0, new Float32Array([currentTime]));
            
            // Get the current texture from the context and create a view
            const textureView = context.getCurrentTexture().createView();
            
            // Create a command encoder
            const commandEncoder = device.createCommandEncoder();
            
            // Start a render pass
            const renderPass = commandEncoder.beginRenderPass({
                colorAttachments: [{
                    view: textureView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
                    loadOp: 'clear',
                    storeOp: 'store'
                }]
            });
            
            // Set the pipeline and bind group
            renderPass.setPipeline(renderPipeline);
            renderPass.setBindGroup(0, bindGroup);
            
            // Set the vertex buffers
            renderPass.setVertexBuffer(0, particlesBuffer);
            renderPass.setVertexBuffer(1, quadBuffer);
            
            // Draw the particles
            renderPass.draw(4, particleCount, 0, 0); // 4 vertices per quad, one quad per particle
            
            // End the render pass and submit the commands
            renderPass.end();
            device.queue.submit([commandEncoder.finish()]);
            
            // Request the next frame
            requestAnimationFrame(render);
        }
        
        // Start the render loop
        requestAnimationFrame(render);
        
        // Create a simplified version of the controls
        addControls(config, device, brightnessBuffer);
        
        console.log('WebGPU particle system initialized successfully!');
        
    } catch (error) {
        console.error('WebGPU initialization failed:', error);
        console.log('Falling back to DOM-based particles...');
        const fallbackScript = document.createElement('script');
        fallbackScript.src = 'js/particles.js';
        document.head.appendChild(fallbackScript);
    }
    
    // Add simplified controls for WebGPU version
    function addControls(config, device, brightnessBuffer) {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'particle-controls';
        controlsContainer.style.position = 'fixed';
        controlsContainer.style.bottom = '20px';
        controlsContainer.style.right = '20px';
        controlsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        controlsContainer.style.padding = '10px';
        controlsContainer.style.borderRadius = '5px';
        controlsContainer.style.zIndex = '1000';
        controlsContainer.style.color = '#fff';
        controlsContainer.style.fontSize = '12px';
        controlsContainer.style.transition = 'opacity 0.3s';
        controlsContainer.style.opacity = '0.3';
        
        // Show controls fully on hover
        controlsContainer.addEventListener('mouseenter', () => {
            controlsContainer.style.opacity = '1';
        });
        
        controlsContainer.addEventListener('mouseleave', () => {
            controlsContainer.style.opacity = '0.3';
        });
        
        // Toggle button
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'WebGPU Controls';
        toggleButton.style.backgroundColor = '#64ffda';
        toggleButton.style.border = 'none';
        toggleButton.style.padding = '5px 10px';
        toggleButton.style.borderRadius = '3px';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.fontSize = '12px';
        toggleButton.style.color = '#000';
        toggleButton.style.width = '100%';
        toggleButton.style.marginBottom = '10px';
        
        const controlsContent = document.createElement('div');
        controlsContent.id = 'particle-controls-content';
        controlsContent.style.display = 'none';
        
        toggleButton.addEventListener('click', () => {
            if (controlsContent.style.display === 'none') {
                controlsContent.style.display = 'block';
                toggleButton.textContent = 'Hide Controls';
            } else {
                controlsContent.style.display = 'none';
                toggleButton.textContent = 'WebGPU Controls';
            }
        });
        
        controlsContainer.appendChild(toggleButton);
        
        // Helper function to create sliders
        function createSlider(label, min, max, value, step, onChange) {
            const sliderContainer = document.createElement('div');
            sliderContainer.style.marginBottom = '8px';
            
            const labelElement = document.createElement('label');
            labelElement.textContent = label + ': ' + value;
            labelElement.style.display = 'block';
            labelElement.style.marginBottom = '3px';
            
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = min;
            slider.max = max;
            slider.step = step;
            slider.value = value;
            slider.style.width = '100%';
            
            slider.addEventListener('input', () => {
                const newValue = parseFloat(slider.value);
                labelElement.textContent = label + ': ' + newValue;
                onChange(newValue);
                config[label.toLowerCase().replace(' ', '')] = newValue;
                saveParticleConfig(config);
            });
            
            sliderContainer.appendChild(labelElement);
            sliderContainer.appendChild(slider);
            return sliderContainer;
        }
        
        // Brightness slider
        const brightnessSlider = createSlider('Star Brightness', 0, 1, config.starBrightness, 0.05, (value) => {
            device.queue.writeBuffer(brightnessBuffer, 0, new Float32Array([value]));
        });
        
        // Help text
        const helpText = document.createElement('div');
        helpText.style.marginTop = '15px';
        helpText.style.fontSize = '11px';
        helpText.style.color = '#aaa';
        helpText.innerHTML = 'Using WebGPU for hardware-accelerated rendering.<br>For more options, reload the page.';
        
        // Add slider to the container
        controlsContent.appendChild(brightnessSlider);
        controlsContent.appendChild(helpText);
        
        controlsContainer.appendChild(controlsContent);
        document.body.appendChild(controlsContainer);
    }
});
