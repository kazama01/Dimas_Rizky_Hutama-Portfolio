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
        particleCount: 4000,       // Updated to match the image
        starBrightness: 5,         // Updated to match the image
        minBrightness: 0.3,        // Updated to match the image
        maxBrightness: 1,          // Updated to match the image
        starSize: 1,               // Updated to match the image
        minStarSize: 0.25,          // Updated to match the image
        maxStarSize: 1,          // Updated to match the image
        lifetime: 1,               // Updated to match the image
        minLifetime: 0.1,          // Updated to match the image
        maxLifetime: 0.5,          // Updated to match the image
        colorShift: 0,             // Updated to match the image
        zIndex: 0                  // Updated to match the image
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
    canvas.style.position = 'fixed'; 
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = config.zIndex.toString();
    canvas.style.pointerEvents = 'none';

    // Remove background-related code, this will be in its own file
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%'; 
    container.style.height = '100%';
    container.style.zIndex = config.zIndex.toString();
    container.style.pointerEvents = 'none';
    container.style.overflow = 'visible';
    
    container.appendChild(canvas);
    
    // Set the canvas size to match window size
    function resizeCanvas() {
        const devicePixelRatio = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        
        // Update resolution buffer if it exists
        if (typeof device !== 'undefined' && resolutionBuffer) {
            device.queue.writeBuffer(
                resolutionBuffer,
                0,
                new Float32Array([canvas.width, canvas.height])
            );
        }
    }
    
    // Call resize initially and on window resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
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
        console.log("Requesting WebGPU adapter...");
        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance'
        });
        
        if (!adapter) {
            throw new Error('No appropriate GPUAdapter found.');
        }
        
        console.log("WebGPU adapter found, requesting device...");
        const device = await adapter.requestDevice({
            requiredFeatures: [],
            requiredLimits: {}
        });
        
        console.log("WebGPU device created, configuring canvas...");
        const context = canvas.getContext('webgpu');
        
        const devicePixelRatio = window.devicePixelRatio || 1;
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        console.log("Using presentation format:", presentationFormat);
        
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
        
        // Create particles with random properties - moved to a separate function
        let particleCount = config.particleCount;
        let particlesBuffer;
        
        // Function to create particle data and buffer
        function createParticleBuffer(count) {
            console.log("Creating particle buffer with", count, "particles");
            particleCount = count;
            // Change to 12 floats per particle to include cycleDuration and brightness variation
            const particlesData = new Float32Array(particleCount * 12); 
        
            // Distribute particles across entire document height rather than just viewport
            const documentHeight = Math.max(
                document.body.scrollHeight, 
                document.documentElement.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.offsetHeight,
                document.body.clientHeight,
                document.documentElement.clientHeight
            );
            
            // Calculate viewport to document ratio for better distribution
            const viewportRatio = window.innerHeight / documentHeight;
            
            // Create more particles to ensure better coverage
            for (let i = 0; i < particleCount; i++) {
                const baseIndex = i * 12; // Update index calculation for 12 values
                const starType = Math.floor(Math.random() * 3); // 0, 1, or 2
                
                // Position stars across a wider area for better scrolling coverage
                // Extend the range to ensure particles appear in all sections
                particlesData[baseIndex] = Math.random() * 2.4 - 1.2;     // x: wider range
                
                // Position y within -1.5 to 1.5 instead of -1 to 1 for better coverage
                particlesData[baseIndex + 1] = Math.random() * 3 - 1.5;   // y: much wider range
                
                // Size (with the same distribution as original, but using min/max size range)
                // Calculate a base size based on star type
                let baseSize;
                if (starType === 0) {
                    baseSize = 0.01; // Small stars base
                } else if (starType === 1) {
                    baseSize = 0.025; // Medium stars base
                } else {
                    baseSize = 0.035; // Large stars base
                }
                
                // Apply random size variation based on min/max settings
                const sizeVariation = Math.random() * (config.maxStarSize - config.minStarSize) + config.minStarSize;
                const size = baseSize * sizeVariation * config.starSize;
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
                
                // Get base color and apply color shift if needed
                const color = getShiftedColor(starColors[colorIndex], config.colorShift);
                particlesData[baseIndex + 3] = color[0]; // r
                particlesData[baseIndex + 4] = color[1]; // g
                particlesData[baseIndex + 5] = color[2]; // b
                
                // Alpha/Opacity - Initialize with a visible value
                particlesData[baseIndex + 6] = 0.7; // Start with some visibility
                
                // Animation timings - use random lifetime between min and max
                // This prevents all stars from fading at the same time
                const randLifetime = Math.random() * (config.maxLifetime - config.minLifetime) + config.minLifetime;
                
                // Distribute the lifetime into three phases (fade in, visible, fade out)
                const fadeInTime = (Math.random() * 0.2 + 0.1) * randLifetime;
                const visibleTime = (Math.random() * 0.5 + 0.3) * randLifetime;
                const fadeOutTime = 1 - fadeInTime - visibleTime;
                
                // Store animation parameters
                particlesData[baseIndex + 7] = fadeInTime;                // normalized fade in time
                particlesData[baseIndex + 8] = fadeInTime + visibleTime;  // normalized fade out start time
                particlesData[baseIndex + 9] = Math.random() * 1000;      // offset to start animation at different times
                
                // Add unique cycle duration for each star (5000-15000ms)
                // Stars with longer lifetimes get longer cycle duration
                particlesData[baseIndex + 10] = 5000 + (randLifetime * 10000);
                
                // NEW: Use min/max brightness settings for randomization
                const brightnessFactor = Math.random() * (config.maxBrightness - config.minBrightness) + config.minBrightness;
                particlesData[baseIndex + 11] = brightnessFactor;
            }
        
            try {
                // Create a buffer to store the particle data with more robust error handling
                const buffer = device.createBuffer({
                    size: particlesData.byteLength,
                    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE, // Add STORAGE usage
                    mappedAtCreation: true
                });
        
                // Write initial data to the buffer
                new Float32Array(buffer.getMappedRange()).set(particlesData);
                buffer.unmap();
                
                console.log("Particle buffer created successfully");
                return buffer;
            } catch (error) {
                console.error("Error creating particle buffer:", error);
                // Create a recovery indicator
                showRecoveryMessage();
                // Return null to indicate failure - the render loop will handle this
                return null;
            }
        }
        
        // New function to shift colors using HSL conversion
        function getShiftedColor(baseColor, hueShift) {
            if (hueShift === 0) return baseColor;
            
            // Convert RGB to HSL
            const r = baseColor[0], g = baseColor[1], b = baseColor[2];
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
        
            if (max === min) {
                h = s = 0; // achromatic
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                
                if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
                else if (max === g) h = (b - r) / d + 2;
                else h = (r - g) / d + 4;
                
                h /= 6;
            }
        
            // Apply hue shift (normalized 0-1)
            h = (h + hueShift / 360) % 1;
        
            // Convert back to RGB
            let r1, g1, b1;
            if (s === 0) {
                r1 = g1 = b1 = l; // achromatic
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                
                r1 = hue2rgb(p, q, h + 1/3);
                g1 = hue2rgb(p, q, h);
                b1 = hue2rgb(p, q, h - 1/3);
            }
        
            return [r1, g1, b1, baseColor[3]];
        }
        
        // Create initial particle buffer
        particlesBuffer = createParticleBuffer(particleCount);
        
        // Define the vertex shader (WGSL)
        const vertexShaderModule = device.createShaderModule({
            code: `
                struct Uniforms {
                    time: f32,
                    scrollOffset: f32,
                };

                struct VertexOutput {
                    @builtin(position) position: vec4f,
                    @location(0) color: vec4f,
                    @location(1) uv: vec2f,
                };
                
                @group(0) @binding(0) var<uniform> uniforms: Uniforms;
                @group(0) @binding(1) var<uniform> resolution: vec2f;
                @group(0) @binding(2) var<uniform> brightness: f32;
                
                @vertex
                fn vertexMain(
                    @location(0) position: vec2f,
                    @location(1) size: f32,
                    @location(2) colorR: f32,
                    @location(3) colorG: f32,
                    @location(4) colorB: f32,
                    @location(5) opacity: f32,
                    @location(6) fadeInTime: f32,
                    @location(7) fadeOutStart: f32,
                    @location(8) timeOffset: f32,
                    @location(9) cycleDuration: f32,
                    @location(10) brightnessFactor: f32,
                    @location(11) quadPosition: vec2f,
                ) -> VertexOutput {
                    var parallaxStrength = 0.0;
                    if (brightnessFactor < 0.5) {
                        parallaxStrength = 0.05;
                    } else if (brightnessFactor < 0.8) {
                        parallaxStrength = 0.2;
                    } else {
                        parallaxStrength = 0.4;
                    }
                    
                    var adjustedPosition = vec2f(
                        position.x, 
                        position.y + uniforms.scrollOffset * parallaxStrength
                    );
                    
                    if (adjustedPosition.y > 1.8) {
                        adjustedPosition.y = -1.8;
                    } else if (adjustedPosition.y < -1.8) {
                        adjustedPosition.y = 1.8;
                    }
                    
                    var animTime = fract((uniforms.time + timeOffset) / cycleDuration);
                    var particleOpacity = 0.0;
                    
                    if (animTime < fadeInTime) {
                        particleOpacity = animTime / fadeInTime;
                    } else if (animTime < fadeOutStart) {
                        particleOpacity = 1.0;
                    } else {
                        particleOpacity = 1.0 - (animTime - fadeOutStart) / (1.0 - fadeOutStart);
                    }
                    
                    particleOpacity = particleOpacity * brightness * brightnessFactor;
                    var twinkle = sin(uniforms.time * 0.001 + timeOffset) * 0.2 + 0.8;
                    particleOpacity = particleOpacity * twinkle;
                    
                    var particleSize = size;
                    if (animTime > fadeOutStart) {
                        particleSize = size * (1.0 - (animTime - fadeOutStart) * 0.6);
                    }
                    
                    // Correct aspect ratio to ensure circular stars
                    var aspect = resolution.x / resolution.y;
                    var correctedQuadPosition = vec2f(
                        quadPosition.x / aspect,
                        quadPosition.y
                    );
                    
                    var pos = vec2f(
                        adjustedPosition.x + correctedQuadPosition.x * particleSize,
                        adjustedPosition.y + correctedQuadPosition.y * particleSize
                    );
                    
                    var output: VertexOutput;
                    output.position = vec4f(pos, 0.0, 1.0);
                    output.color = vec4f(colorR, colorG, colorB, particleOpacity * opacity);
                    output.uv = quadPosition * 0.5 + 0.5;
                    
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
                    var dist = distance(uv, vec2f(0.5, 0.5)) * 2.0;
                    var alpha = smoothstep(1.0, 0.0, dist) * color.a;
                    return vec4f(color.rgb, alpha);
                }
            `
        });
        
        // Create a buffer for time uniform
        const timeBuffer = device.createBuffer({
            size: 2 * Float32Array.BYTES_PER_ELEMENT, // Now holds two floats
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
        
        // Create a buffer for lifetime uniform
        const lifetimeBuffer = device.createBuffer({
            size: Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        
        // Update the lifetime buffer with initial value
        device.queue.writeBuffer(
            lifetimeBuffer,
            0,
            new Float32Array([config.lifetime])
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
        console.log("Creating vertex buffers...");
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
                // Individual particle properties
                arrayStride: 12 * Float32Array.BYTES_PER_ELEMENT, // Updated for 12 floats
                stepMode: 'instance',
                attributes: [
                    { shaderLocation: 0, offset: 0, format: 'float32x2' },   // position
                    { shaderLocation: 1, offset: 8, format: 'float32' },     // size
                    { shaderLocation: 2, offset: 12, format: 'float32' },    // colorR
                    { shaderLocation: 3, offset: 16, format: 'float32' },    // colorG
                    { shaderLocation: 4, offset: 20, format: 'float32' },    // colorB
                    { shaderLocation: 5, offset: 24, format: 'float32' },    // opacity
                    { shaderLocation: 6, offset: 28, format: 'float32' },    // fadeInTime
                    { shaderLocation: 7, offset: 32, format: 'float32' },    // fadeOutStart
                    { shaderLocation: 8, offset: 36, format: 'float32' },    // timeOffset
                    { shaderLocation: 9, offset: 40, format: 'float32' },    // cycleDuration
                    { shaderLocation: 10, offset: 44, format: 'float32' },   // brightnessFactor (NEW)
                ]
            },
            {
                // Quad vertices (2 triangles for each particle)
                arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
                stepMode: 'vertex',
                attributes: [
                    { shaderLocation: 11, offset: 0, format: 'float32x2' }   // quadPosition (updated location)
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
        
        // Improved scroll handling with RAF for smoother movement
        let lastScrollY = window.scrollY || document.documentElement.scrollTop;
        let scrollOffsetY = 0;
        let rafPending = false;
        let lastScrollUpdateTime = 0;
        
        // Use a more robust scroll handler with animation frame
        function updateScrollOffset() {
            // Get current scroll position
            const currentScrollY = window.scrollY || document.documentElement.scrollTop;
            
            // Calculate delta
            const delta = currentScrollY - lastScrollY;
            lastScrollY = currentScrollY;
            
            // Apply to scroll offset with dampening
            scrollOffsetY += delta * 0.0004;
            
            // Keep the offset within reasonable bounds
            if (Math.abs(scrollOffsetY) > 1.0) {
                scrollOffsetY = Math.sign(scrollOffsetY);
            }
            
            // Update scroll offset in shader
            if (device && timeBuffer) {
                device.queue.writeBuffer(
                    timeBuffer,
                    Float32Array.BYTES_PER_ELEMENT,
                    new Float32Array([scrollOffsetY])
                );
            }
            
            rafPending = false;
            lastScrollUpdateTime = performance.now();
        }
        
        // Replace existing scroll listener with better version
        window.removeEventListener('scroll', null);
        window.addEventListener('scroll', () => {
            if (!rafPending) {
                rafPending = true;
                requestAnimationFrame(updateScrollOffset);
            }
        });
        
        // Periodically check if we need to update scroll effects (helps with continuous scrolling)
        setInterval(() => {
            const now = performance.now();
            // If it's been more than 100ms since the last update and we're scrolling, force an update
            if (now - lastScrollUpdateTime > 100 && Math.abs(window.scrollY - lastScrollY) > 5) {
                lastScrollY = window.scrollY || document.documentElement.scrollTop;
                requestAnimationFrame(updateScrollOffset);
            }
        }, 100);
        
        // Animation and render loop with improved error handling and recovery
        function render(currentTime) {
            try {
                // Ensure particlesBuffer exists before trying to use it
                if (!particlesBuffer) {
                    // Try to recreate it if missing
                    particlesBuffer = createParticleBuffer(particleCount);
                    if (!particlesBuffer) {
                        // Schedule next frame even if we can't render this one
                        requestAnimationFrame(render);
                        return;
                    }
                }
        
                // Convert to milliseconds
                currentTime *= 1;
                
                // Update time uniform
                device.queue.writeBuffer(timeBuffer, 0, new Float32Array([currentTime]));
                
                // Apply scroll offset directly as an offset in the shader
                // We'll send this value to the shader instead of modifying the buffer
                device.queue.writeBuffer(
                    timeBuffer, // Reuse the existing buffer but at a different offset
                    Float32Array.BYTES_PER_ELEMENT, // 4 bytes offset to avoid overwriting time
                    new Float32Array([scrollOffsetY])
                );
                
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
                
                // Always update scroll effect even if scroll events aren't firing
                if (Math.abs(window.scrollY - lastScrollY) > 5 && !rafPending) {
                    updateScrollOffset();
                }
            } catch (error) {
                console.error("Render error:", error);
                showRecoveryMessage();
            }
            
            // Always request the next frame to keep the loop running
            requestAnimationFrame(render);
        }
        
        // Optimized function to update particle positions during scrolling
        function updateParticlePositions() {
            try {
                console.log("Updating particle positions for scroll");
                
                // Create staging buffer for writing updated positions
                const stagingBuffer = device.createBuffer({
                    size: particlesBuffer.size,
                    usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE,
                });
                
                // Get a mapping of the staging buffer to modify the data directly
                stagingBuffer.mapAsync(GPUMapMode.WRITE).then(() => {
                    const mappedRange = stagingBuffer.getMappedRange();
                    const updatedParticles = new Float32Array(mappedRange);
                    
                    // Create a temporary read buffer to get current data
                    const commandEncoder = device.createCommandEncoder();
                    const tempReadBuffer = device.createBuffer({
                        size: particlesBuffer.size,
                        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
                    });
                    
                    // Copy current particle data to the temp read buffer
                    commandEncoder.copyBufferToBuffer(
                        particlesBuffer, 0,
                        tempReadBuffer, 0,
                        particlesBuffer.size
                    );
                    device.queue.submit([commandEncoder.finish()]);
                    
                    // Read the current data and apply changes
                    tempReadBuffer.mapAsync(GPUMapMode.READ).then(() => {
                        const originalData = new Float32Array(tempReadBuffer.getMappedRange());
                        
                        // Copy existing data
                        updatedParticles.set(originalData);
                        
                        // Calculate movement amount based on scroll direction and speed
                        const moveAmount = -scrollDirection * scrollSpeed;
                        console.log(`Applying scroll movement: ${moveAmount}`);
                        
                        // Update each particle position
                        for (let i = 0; i < particleCount; i++) {
                            const baseIndex = i * 12; // 12 floats per particle
                            
                            // Update Y position based on scroll
                            updatedParticles[baseIndex + 1] += moveAmount;
                            
                            // Wrap particles that go off-screen
                            if (updatedParticles[baseIndex + 1] > 1.2) {
                                updatedParticles[baseIndex + 1] = -1.2;
                                // Randomize X position when wrapping
                                updatedParticles[baseIndex] = Math.random() * 2 - 1;
                                // Randomize brightness factor for newly appearing stars
                                updatedParticles[baseIndex + 11] = Math.random() * 0.7 + 0.3;
                            } else if (updatedParticles[baseIndex + 1] < -1.2) {
                                updatedParticles[baseIndex + 1] = 1.2;
                                // Randomize X position when wrapping
                                updatedParticles[baseIndex] = Math.random() * 2 - 1;
                                // Randomize brightness factor for newly appearing stars
                                updatedParticles[baseIndex + 11] = Math.random() * 0.7 + 0.3;
                            }
                        }
                        
                        // Unmap buffers
                        tempReadBuffer.unmap();
                        stagingBuffer.unmap();
                        
                        // Copy updated data back to the particle buffer
                        const updateCommandEncoder = device.createCommandEncoder();
                        updateCommandEncoder.copyBufferToBuffer(
                            stagingBuffer, 0,
                            particlesBuffer, 0,
                            particlesBuffer.size
                        );
                        
                        // Submit the command encoder
                        device.queue.submit([updateCommandEncoder.finish()]);
                        console.log("Particle positions updated successfully");
                    }).catch(err => {
                        console.error("Error reading particle data:", err);
                        tempReadBuffer.unmap();
                        stagingBuffer.unmap();
                    });
                }).catch(err => {
                    console.error("Error mapping staging buffer:", err);
                });
            } catch (error) {
                console.error("Error in updateParticlePositions:", error);
            }
        }
        
        // Start the render loop
        console.log("Starting render loop with", particleCount, "particles");
        requestAnimationFrame(render);
        
        // Create controls for the particle system
        addControls(config, device, brightnessBuffer);
        
        // Add preload function to ensure particles are visible immediately
        function preloadParticles() {
            // Force multiple render frames to ensure particles are visible on load
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    if (device && particlesBuffer) {
                        const commandEncoder = device.createCommandEncoder();
                        const textureView = context.getCurrentTexture().createView();
                        
                        const renderPass = commandEncoder.beginRenderPass({
                            colorAttachments: [{
                                view: textureView,
                                clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
                                loadOp: 'clear',
                                storeOp: 'store'
                            }]
                        });
                        
                        renderPass.setPipeline(renderPipeline);
                        renderPass.setBindGroup(0, bindGroup);
                        renderPass.setVertexBuffer(0, particlesBuffer);
                        renderPass.setVertexBuffer(1, quadBuffer);
                        renderPass.draw(4, particleCount, 0, 0);
                        renderPass.end();
                        
                        device.queue.submit([commandEncoder.finish()]);
                    }
                }, i * 100); // Stagger the frames
            }
        }
        
        // Call preload after initialization
        setTimeout(preloadParticles, 500);
        
        console.log('WebGPU particle system initialized successfully!');
        
    } catch (error) {
        console.error('WebGPU initialization failed:', error);
        console.log('Falling back to DOM-based particles...');
        const fallbackScript = document.createElement('script');
        fallbackScript.src = 'js/particles.js';
        document.head.appendChild(fallbackScript);
        
        // Ensure the fallback script loads
        fallbackScript.onload = () => {
            console.log("Fallback particle system loaded successfully");
        };
        
        fallbackScript.onerror = () => {
            console.error("Failed to load fallback particle system");
        };
    }
    
    // Enhanced controls for WebGPU version
    function addControls(config, device, brightnessBuffer) {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'particle-controls';
        controlsContainer.style.position = 'fixed';
        controlsContainer.style.bottom = '20px';
        controlsContainer.style.right = '20px';
        controlsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        controlsContainer.style.padding = '10px';
        controlsContainer.style.borderRadius = '5px';
        controlsContainer.style.zIndex = '9999'; // Ensure high z-index
        controlsContainer.style.color = '#fff';
        controlsContainer.style.fontSize = '12px';
        controlsContainer.style.transition = 'opacity 0.3s';
        controlsContainer.style.opacity = '0.3';
        controlsContainer.style.pointerEvents = 'auto'; 
        
        // Make sure the container is not affected by pointer-events of parent elements
        document.body.addEventListener('pointerdown', function(e) {
            if (e.target.closest('.particle-controls')) {
                e.stopPropagation();
            }
        }, true);
        
        // Show controls fully on hover
        controlsContainer.addEventListener('mouseenter', () => {
            controlsContainer.style.opacity = '1';
        });
        
        controlsContainer.addEventListener('mouseleave', () => {
            controlsContainer.style.opacity = '0.3';
        });
        
        // Toggle button
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Star Controls';  // Changed from 'WebGPU Controls' to 'Star Controls'
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
        controlsContent.id = 'star-controls-content'; // Changed ID to avoid conflicts
        controlsContent.style.display = 'none';
        
        toggleButton.addEventListener('click', () => {
            if (controlsContent.style.display === 'none') {
                controlsContent.style.display = 'block';
                toggleButton.textContent = 'Hide Star Controls';
            } else {
                controlsContent.style.display = 'none';
                toggleButton.textContent = 'Star Controls';
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
        
        // Particle count slider
        const particleCountSlider = createSlider('Particle Count', 1000, 20000, config.particleCount, 1000, (value) => {
            const newCount = Math.floor(value);
            config.particleCount = newCount;
            
            // Recreate particle buffer with new count
            particlesBuffer = createParticleBuffer(newCount);
            
            // Save to localStorage
            saveParticleConfig(config);
        });
        
        // Brightness slider - updated range from 0-5 (was 0-2)
        const brightnessSlider = createSlider('Star Brightness', 0, 5, config.starBrightness, 0.1, (value) => {
            device.queue.writeBuffer(brightnessBuffer, 0, new Float32Array([value]));
            config.starBrightness = value;
            saveParticleConfig(config);
        });
        
        // Star size slider
        const starSizeSlider = createSlider('Star Size', 0.1, 1.0, config.starSize, 0.05, (value) => {
            config.starSize = value;
            // Recreate particle buffer with new size
            particlesBuffer = createParticleBuffer(config.particleCount);
            saveParticleConfig(config);
        });
        
        // NEW: Min star size slider
        const minStarSizeSlider = createSlider('Min Star Size', 0.1, 1.0, config.minStarSize, 0.05, (value) => {
            // Ensure min is always less than max
            if (value >= config.maxStarSize) {
                config.maxStarSize = Math.min(1.0, value + 0.1);
                // Update max star size slider if it exists
                const maxSlider = document.querySelector('input[id="max-star-size-slider"]');
                if (maxSlider) {
                    maxSlider.value = config.maxStarSize;
                    maxSlider.previousElementSibling.textContent = 'Max Star Size: ' + config.maxStarSize;
                }
            }
            config.minStarSize = value;
            // Regenerate particles with new size range
            particlesBuffer = createParticleBuffer(config.particleCount);
            saveParticleConfig(config);
        });
        
        // NEW: Max star size slider
        const maxStarSizeSlider = createSlider('Max Star Size', 0.1, 1.0, config.maxStarSize, 0.05, (value) => {
            // Ensure max is always greater than min
            if (value <= config.minStarSize) {
                config.minStarSize = Math.max(0.1, value - 0.1);
                // Update min star size slider if it exists
                const minSlider = document.querySelector('input[id="min-star-size-slider"]');
                if (minSlider) {
                    minSlider.value = config.minStarSize;
                    minSlider.previousElementSibling.textContent = 'Min Star Size: ' + config.minStarSize;
                }
            }
            config.maxStarSize = value;
            // Regenerate particles with new size range
            particlesBuffer = createParticleBuffer(config.particleCount);
            saveParticleConfig(config);
        });
        
        // Add IDs to the new sliders for referencing
        minStarSizeSlider.querySelector('input').id = "min-star-size-slider";
        maxStarSizeSlider.querySelector('input').id = "max-star-size-slider";
        
        // NEW: Min brightness slider
        const minBrightnessSlider = createSlider('Min Brightness', 0.1, 1.0, config.minBrightness, 0.05, (value) => {
            // Ensure min is always less than max
            if (value >= config.maxBrightness) {
                config.maxBrightness = Math.min(1.0, value + 0.1);
                // Update max brightness slider if it exists
                const maxSlider = document.querySelector('input[id="max-brightness-slider"]');
                if (maxSlider) {
                    maxSlider.value = config.maxBrightness;
                    maxSlider.previousElementSibling.textContent = 'Max Brightness: ' + config.maxBrightness;
                }
            }
            config.minBrightness = value;
            // Regenerate particles with new brightness range
            particlesBuffer = createParticleBuffer(config.particleCount);
            saveParticleConfig(config);
        });
        
        // NEW: Max brightness slider
        const maxBrightnessSlider = createSlider('Max Brightness', 0.1, 1.0, config.maxBrightness, 0.05, (value) => {
            // Ensure max is always greater than min
            if (value <= config.minBrightness) {
                config.minBrightness = Math.max(0.1, value - 0.1);
                // Update min brightness slider if it exists
                const minSlider = document.querySelector('input[id="min-brightness-slider"]');
                if (minSlider) {
                    minSlider.value = config.minBrightness;
                    minSlider.previousElementSibling.textContent = 'Min Brightness: ' + config.minBrightness;
                }
            }
            config.maxBrightness = value;
            // Regenerate particles with new brightness range
            particlesBuffer = createParticleBuffer(config.particleCount);
            saveParticleConfig(config);
        });
        
        // Add IDs to the new sliders for referencing
        minBrightnessSlider.querySelector('input').id = "min-brightness-slider";
        maxBrightnessSlider.querySelector('input').id = "max-brightness-slider";
        
        // Lifetime slider (base lifetime)
        const lifetimeSlider = createSlider('Base Lifetime', 0.1, 1.0, config.lifetime, 0.05, (value) => {
            config.lifetime = value;
            // Regenerate particles with new lifetime
            particlesBuffer = createParticleBuffer(config.particleCount);
            saveParticleConfig(config);
        });
        
        // Min lifetime slider
        const minLifetimeSlider = createSlider('Min Lifetime', 0.1, 0.6, config.minLifetime, 0.05, (value) => {
            // Ensure min is always less than max
            if (value >= config.maxLifetime) {
                config.maxLifetime = Math.min(1.0, value + 0.1);
                // Update max lifetime slider if it exists
                const maxSlider = document.querySelector('input[id="max-lifetime-slider"]');
                if (maxSlider) {
                    maxSlider.value = config.maxLifetime;
                    maxSlider.previousElementSibling.textContent = 'Max Lifetime: ' + config.maxLifetime;
                }
            }
            config.minLifetime = value;
            // Regenerate particles with new lifetime range
            particlesBuffer = createParticleBuffer(config.particleCount);
            saveParticleConfig(config);
        });
        
        // Max lifetime slider
        const maxLifetimeSlider = createSlider('Max Lifetime', 0.4, 1.0, config.maxLifetime, 0.05, (value) => {
            // Ensure max is always greater than min
            if (value <= config.minLifetime) {
                config.minLifetime = Math.max(0.1, value - 0.1);
                // Update min lifetime slider if it exists
                const minSlider = document.querySelector('input[id="min-lifetime-slider"]');
                if (minSlider) {
                    minSlider.value = config.minLifetime;
                    minSlider.previousElementSibling.textContent = 'Min Lifetime: ' + config.minLifetime;
                }
            }
            config.maxLifetime = value;
            // Regenerate particles with new lifetime range
            particlesBuffer = createParticleBuffer(config.particleCount);
            saveParticleConfig(config);
        });
        
        // Add ID to sliders for referencing
        minLifetimeSlider.querySelector('input').id = "min-lifetime-slider";
        maxLifetimeSlider.querySelector('input').id = "max-lifetime-slider";
        
        // Color shift slider
        const colorSlider = createSlider('Color Shift', 0, 360, config.colorShift, 15, (value) => {
            config.colorShift = value;
            // Regenerate particles with new color
            particlesBuffer = createParticleBuffer(config.particleCount);
            saveParticleConfig(config);
        });
        
        // Z-index slider to control particle layer
        const zIndexSlider = createSlider('Z-Index', -10, 2000, config.zIndex, 10, (value) => {
            const newZIndex = Math.floor(value);
            config.zIndex = newZIndex;
            canvas.style.zIndex = newZIndex.toString();
            container.style.zIndex = newZIndex.toString();
            saveParticleConfig(config);
        });
        
        // Add all sliders to container in a logical order
        controlsContent.appendChild(particleCountSlider);
        controlsContent.appendChild(brightnessSlider);
        controlsContent.appendChild(minBrightnessSlider);
        controlsContent.appendChild(maxBrightnessSlider);
        controlsContent.appendChild(starSizeSlider);
        controlsContent.appendChild(minStarSizeSlider);
        controlsContent.appendChild(maxStarSizeSlider);
        controlsContent.appendChild(lifetimeSlider);
        controlsContent.appendChild(minLifetimeSlider);
        controlsContent.appendChild(maxLifetimeSlider);
        controlsContent.appendChild(colorSlider);
        controlsContent.appendChild(zIndexSlider);
        
        // Add reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset to Defaults';
        resetButton.style.backgroundColor = '#ff6464';
        resetButton.style.border = 'none';
        resetButton.style.padding = '5px 10px';
        resetButton.style.borderRadius = '3px';
        resetButton.style.cursor = 'pointer';
        resetButton.style.fontSize = '12px';
        resetButton.style.color = '#fff';
        resetButton.style.width = '100%';
        resetButton.style.marginTop = '10px';
        
        resetButton.addEventListener('click', () => {
            // Reset to defaults (update to include new properties)
            config.particleCount = defaultConfig.particleCount;
            config.starBrightness = defaultConfig.starBrightness;
            config.zIndex = defaultConfig.zIndex;
            config.starSize = defaultConfig.starSize;
            config.minStarSize = defaultConfig.minStarSize;
            config.maxStarSize = defaultConfig.maxStarSize;
            config.lifetime = defaultConfig.lifetime;
            config.minLifetime = defaultConfig.minLifetime;
            config.maxLifetime = defaultConfig.maxLifetime;
            config.minBrightness = defaultConfig.minBrightness;
            config.maxBrightness = defaultConfig.maxBrightness;
            config.colorShift = defaultConfig.colorShift;
            
            // Update UI
            particlesBuffer = createParticleBuffer(config.particleCount);
            device.queue.writeBuffer(brightnessBuffer, 0, new Float32Array([config.starBrightness]));
            canvas.style.zIndex = config.zIndex.toString();
            container.style.zIndex = config.zIndex.toString();
            
            // Clear localStorage
            localStorage.removeItem('particleConfig');
            
            // Reload the page to apply changes
            location.reload();
        });
        
        controlsContent.appendChild(resetButton);
        
        // Add restart button
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart Particles';
        restartButton.style.backgroundColor = '#ffa500';
        restartButton.style.border = 'none';
        restartButton.style.padding = '5px 10px';
        restartButton.style.borderRadius = '3px';
        restartButton.style.cursor = 'pointer';
        restartButton.style.fontSize = '12px';
        restartButton.style.color = '#fff';
        restartButton.style.width = '100%';
        restartButton.style.marginTop = '10px';
        
        restartButton.addEventListener('click', () => {
            // Regenerate particles buffer with current settings
            particlesBuffer = createParticleBuffer(config.particleCount);
            
            // Show success message
            const message = document.createElement('div');
            message.textContent = 'Particles restarted!';
            message.style.color = '#64ffda';
            message.style.marginTop = '10px';
            message.style.fontSize = '11px';
            message.style.textAlign = 'center';
            
            // Replace the button with the message
            restartButton.parentNode.replaceChild(message, restartButton);
            
            // Restore button after 3 seconds
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.replaceChild(restartButton, message);
                }
            }, 3000);
        });
        
        // Add the restart button after the reset button
        controlsContent.appendChild(restartButton);
        
        // Help text
        const helpText = document.createElement('div');
        helpText.style.marginTop = '15px';
        helpText.style.fontSize = '11px';
        helpText.style.color = '#aaa';
        helpText.innerHTML = 'Using WebGPU for hardware-accelerated rendering.<br>Adjust particle count for performance.<br>Background has separate controls in its own panel.';
        
        controlsContent.appendChild(helpText);
        
        controlsContainer.appendChild(controlsContent);
        document.body.appendChild(controlsContainer);
    }

    // Add a recovery message function to inform the user when something goes wrong
    function showRecoveryMessage() {
        let recoveryMsg = document.getElementById('particle-recovery-msg');
        if (!recoveryMsg) {
            recoveryMsg = document.createElement('div');
            recoveryMsg.id = 'particle-recovery-msg';
            recoveryMsg.style.position = 'fixed';
            recoveryMsg.style.top = '10px';
            recoveryMsg.style.left = '50%';
            recoveryMsg.style.transform = 'translateX(-50%)';
            recoveryMsg.style.backgroundColor = 'rgba(255, 100, 100, 0.9)';
            recoveryMsg.style.color = 'white';
            recoveryMsg.style.padding = '10px 20px';
            recoveryMsg.style.borderRadius = '5px';
            recoveryMsg.style.zIndex = '9998'; // Increased from 2000 to 9998
            recoveryMsg.style.fontFamily = 'sans-serif';
            recoveryMsg.style.fontSize = '14px';
            recoveryMsg.style.pointerEvents = 'auto'; // Enable pointer events
            document.body.appendChild(recoveryMsg);
        }
        
        recoveryMsg.textContent = 'Recovering particle system...';
        
        // Auto-reload after a short delay
        setTimeout(() => {
            recoveryMsg.textContent = 'Reloading particles...';
            // Instead of full reload, try to recreate the particles
            if (device) {
                try {
                    particlesBuffer = createParticleBuffer(particleCount);
                    if (particlesBuffer) {
                        recoveryMsg.textContent = 'Particles restored!';
                        setTimeout(() => {
                            recoveryMsg.style.opacity = '0';
                            setTimeout(() => recoveryMsg.remove(), 500);
                        }, 2000);
                    } else {
                        // If recovery failed, suggest refresh
                        recoveryMsg.textContent = 'Please refresh the page to restore particles';
                    }
                } catch (e) {
                    console.error("Recovery failed:", e);
                    recoveryMsg.textContent = 'Please refresh the page to restore particles';
                }
            } else {
                recoveryMsg.textContent = 'Please refresh the page to restore particles';
            }
        }, 1500);
    }

    // Apply document height monitoring to dynamically adjust when content changes
    const resizeObserver = new ResizeObserver(entries => {
        // When the document size changes, update canvas size and particle distribution
        resizeCanvas();
        
        // If document height changed significantly, consider recreating particles
        const documentHeight = Math.max(
            document.body.scrollHeight, 
            document.documentElement.scrollHeight
        );
        
        // Force a render with updated values
        if (device && timeBuffer) {
            device.queue.writeBuffer(
                timeBuffer,
                0,
                new Float32Array([performance.now()])
            );
        }
    });
    
    // Observe both body and html for size changes
    resizeObserver.observe(document.body);
    resizeObserver.observe(document.documentElement);

    // Additional code to fix the container and ensure proper layering
    // Add this at the end of the DOMContentLoaded event function
    setTimeout(() => {
        // Force the controls to be rendered above all other elements
        const controlsElements = document.querySelectorAll('.particle-controls, #particle-recovery-msg');
        controlsElements.forEach(el => {
            if (el) {
                // Move the element to be a direct child of body to avoid inheritance issues
                document.body.appendChild(el);
                
                // Make sure it has high z-index and pointer events enabled
                el.style.zIndex = '9999';
                el.style.pointerEvents = 'auto';
                
                // Make it visible in case it was hidden
                el.style.visibility = 'visible';
                el.style.display = el.classList.contains('particle-controls') ? 'block' : el.style.display;
            }
        });
    }, 1000);
});