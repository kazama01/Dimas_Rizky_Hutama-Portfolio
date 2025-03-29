class BluePlexusEffect {
  constructor() {
    this.canvas = document.createElement('canvas');
    document.body.appendChild(this.canvas);
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    
    // Updated default configuration with user-specified values
    this.config = {
      zIndex: 0,                // Set to 0 as requested
      particleCount: 500,       // Set to 500 as requested
      particleSize: 1.0,        // Keep original default
      connectionDistance: 150,  // Keep original default
      cursorInfluenceRadius: 400, // Set to 400 as requested
      damping: 0.97,            // Set to 0.97 as requested (same as original)
      baseColor: [7/255, 207/255, 167/255], // Set to teal (7, 207, 167) as requested
      backgroundColor: [0.0, 0.02, 0.05, 0.0] // Background opacity 0 as requested
    };
    
    // Load saved configuration
    this.loadConfig();
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    this.mouse = { x: 0, y: 0 };
    this.particleCount = this.config.particleCount;
    this.connectionDistance = this.config.connectionDistance;
    this.cursorInfluenceRadius = this.config.cursorInfluenceRadius;
    
    // Set initial z-index
    this.canvas.style.zIndex = this.config.zIndex.toString();
    
    // Track mouse position
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    
    // Handle window resize
    window.addEventListener('resize', () => this.resize());
    
    this.init();
    
    // Control panel removed
  }
  
  async init() {
    if (!navigator.gpu) {
      console.error('WebGPU not supported');
      this.fallbackToCanvas();
      return;
    }
    
    try {
      // Initialize WebGPU
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        throw new Error('No appropriate GPU adapter found');
      }
      
      this.device = await adapter.requestDevice();
      this.context = this.canvas.getContext('webgpu');
      
      const format = navigator.gpu.getPreferredCanvasFormat();
      this.context.configure({
        device: this.device,
        format: format,
        alphaMode: 'premultiplied' // This allows transparency
      });
      
      // Initialize particles
      this.initParticles();
      
      // Create compute shader for particle movement
      this.createComputeShader();
      
      // Create render pipeline for drawing
      this.createRenderPipeline(format);
      
      // Start animation loop
      this.render();
    } catch (error) {
      console.error('WebGPU initialization error:', error);
      this.fallbackToCanvas();
    }
  }
  
  initParticles() {
    const particleBufferData = new Float32Array(this.particleCount * 6); // x, y, vx, vy, ax, ay
    
    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 6;
      particleBufferData[idx] = Math.random() * this.width;     // x position
      particleBufferData[idx + 1] = Math.random() * this.height; // y position
      particleBufferData[idx + 2] = (Math.random() - 0.5) * 2;   // x velocity
      particleBufferData[idx + 3] = (Math.random() - 0.5) * 2;   // y velocity
      particleBufferData[idx + 4] = 0;  // x acceleration
      particleBufferData[idx + 5] = 0;  // y acceleration
    }
    
    // Create particle buffer
    this.particleBuffer = this.device.createBuffer({
      size: particleBufferData.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true
    });
    
    new Float32Array(this.particleBuffer.getMappedRange()).set(particleBufferData);
    this.particleBuffer.unmap();
    
    // Create uniform buffer for parameters
    this.uniformBuffer = this.device.createBuffer({
      size: 16, // width, height, mouseX, mouseY
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    
    this.updateUniforms();
  }
  
  createComputeShader() {
    const computeShaderModule = this.device.createShaderModule({
      code: `
        struct Particle {
          position: vec2f,
          velocity: vec2f,
          acceleration: vec2f,
        };
        
        struct Uniforms {
          canvas: vec2f,
          mouse: vec2f,
        };
        
        @group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
        @group(0) @binding(1) var<uniform> uniforms: Uniforms;
        
        @compute @workgroup_size(64)
        fn main(@builtin(global_invocation_id) id: vec3u) {
          let i = id.x;
          if (i >= ${this.particleCount}u) { return; }
          
          var particle = particles[i];
          
          // Mouse attraction
          let mousePos = uniforms.mouse;
          let distToMouse = distance(particle.position, mousePos);
          
          if (distToMouse > 0.1 && distToMouse < ${this.cursorInfluenceRadius}.0) {
            let force = 0.5 / max(distToMouse, 50.0);
            let dir = normalize(mousePos - particle.position);
            particle.acceleration += dir * force;
          }
          
          // Add floating motion - creates gentle drifting effect
          // Use the particle's position to generate a unique seed for each particle
          let floatSeed = fract(particle.position.x * 4123.123 + particle.position.y * 8903.456);
          // Add a small random drift to each particle based on its position
          let driftX = sin(floatSeed * 6.28 + uniforms.canvas.x * 0.0001) * 0.05;
          let driftY = cos(floatSeed * 6.28 + uniforms.canvas.x * 0.00015) * 0.05;
          particle.acceleration += vec2f(driftX, driftY);
          
          // Update velocity with acceleration
          particle.velocity += particle.acceleration;
          
          // Damping
          particle.velocity *= ${this.config.damping};
          
          // Update position
          particle.position += particle.velocity;
          
          // Reset acceleration
          particle.acceleration = vec2f(0.0);
          
          // Wrap around edges
          if (particle.position.x < 0.0) { particle.position.x = uniforms.canvas.x; }
          if (particle.position.x > uniforms.canvas.x) { particle.position.x = 0.0; }
          if (particle.position.y < 0.0) { particle.position.y = uniforms.canvas.y; }
          if (particle.position.y > uniforms.canvas.y) { particle.position.y = 0.0; }
          
          particles[i] = particle;
        }
      `
    });
    
    this.computePipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: { module: computeShaderModule, entryPoint: 'main' }
    });
    
    this.computeBindGroup = this.device.createBindGroup({
      layout: this.computePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.particleBuffer } },
        { binding: 1, resource: { buffer: this.uniformBuffer } }
      ]
    });
  }
  
  createRenderPipeline(format) {
    const renderShaderModule = this.device.createShaderModule({
      code: `
        struct Particle {
          position: vec2f,
          velocity: vec2f,
          acceleration: vec2f,
        };
        
        struct Uniforms {
          canvas: vec2f,
          mouse: vec2f,
        };
        
        @group(0) @binding(0) var<storage, read> particles: array<Particle>;
        @group(0) @binding(1) var<uniform> uniforms: Uniforms;
        
        struct VertexOutput {
          @builtin(position) position: vec4f,
          @location(0) color: vec4f,
        };
        
        @vertex
        fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
          let i = vertexIndex;
          let pos = particles[i].position;
          
          var output: VertexOutput;
          output.position = vec4f(
            (pos.x / uniforms.canvas.x) * 2.0 - 1.0,
            -((pos.y / uniforms.canvas.y) * 2.0 - 1.0),
            0.0,
            1.0
          );
          
          // Blue color variation based on velocity
          let speed = length(particles[i].velocity);
          let baseColor = vec3f(${this.config.baseColor[0]}, ${this.config.baseColor[1]}, ${this.config.baseColor[2]});
          output.color = vec4f(baseColor.x, baseColor.y + speed * 0.3, baseColor.z, 0.7);
          
          return output;
        }
        
        @fragment
        fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
          return input.color;
        }
      `
    });
    
    this.renderPipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: renderShaderModule,
        entryPoint: 'vertexMain',
      },
      fragment: {
        module: renderShaderModule,
        entryPoint: 'fragmentMain',
        targets: [{ 
          format,
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
        topology: 'point-list',
      },
    });
    
    this.renderBindGroup = this.device.createBindGroup({
      layout: this.renderPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.particleBuffer } },
        { binding: 1, resource: { buffer: this.uniformBuffer } }
      ]
    });
  }
  
  updateUniforms() {
    this.device.queue.writeBuffer(
      this.uniformBuffer,
      0,
      new Float32Array([
        this.width, this.height,  // Canvas dimensions
        this.mouse.x, this.mouse.y // Mouse position
      ])
    );
  }
  
  render = () => {
    this.updateUniforms();
    
    const commandEncoder = this.device.createCommandEncoder();
    
    // Compute pass for updating particles
    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(this.computePipeline);
    computePass.setBindGroup(0, this.computeBindGroup);
    computePass.dispatchWorkgroups(Math.ceil(this.particleCount / 64));
    computePass.end();
    
    // Render pass for drawing
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: this.context.getCurrentTexture().createView(),
        clearValue: { 
          r: this.config.backgroundColor[0], 
          g: this.config.backgroundColor[1], 
          b: this.config.backgroundColor[2], 
          a: this.config.backgroundColor[3] 
        },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });
    
    renderPass.setPipeline(this.renderPipeline);
    renderPass.setBindGroup(0, this.renderBindGroup);
    renderPass.draw(this.particleCount);
    renderPass.end();
    
    this.device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(this.render);
  }
  
  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
  
  fallbackToCanvas() {
    console.log("Using fallback canvas rendering instead of WebGPU");
    // Implement a fallback canvas-based version if needed
  }
  
  recreateComputeShader() {
    if (!this.device) return;
    
    const computeShaderModule = this.device.createShaderModule({
      code: `
        struct Particle {
          position: vec2f,
          velocity: vec2f,
          acceleration: vec2f,
        };
        
        struct Uniforms {
          canvas: vec2f,
          mouse: vec2f,
        };
        
        @group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
        @group(0) @binding(1) var<uniform> uniforms: Uniforms;
        
        @compute @workgroup_size(64)
        fn main(@builtin(global_invocation_id) id: vec3u) {
          let i = id.x;
          if (i >= ${this.particleCount}u) { return; }
          
          var particle = particles[i];
          
          // Mouse attraction
          let mousePos = uniforms.mouse;
          let distToMouse = distance(particle.position, mousePos);
          
          if (distToMouse > 0.1 && distToMouse < ${this.cursorInfluenceRadius}.0) {
            let force = 0.5 / max(distToMouse, 50.0);
            let dir = normalize(mousePos - particle.position);
            particle.acceleration += dir * force;
          }
          
          // Add floating motion - creates gentle drifting effect
          // Use the particle's position to generate a unique seed for each particle  
          let floatSeed = fract(particle.position.x * 4123.123 + particle.position.y * 8903.456);
          // Add a small random drift to each particle based on its position
          let driftX = sin(floatSeed * 6.28 + uniforms.canvas.x * 0.0001) * 0.05;
          let driftY = cos(floatSeed * 6.28 + uniforms.canvas.x * 0.00015) * 0.05;
          particle.acceleration += vec2f(driftX, driftY);
          
          // Update velocity with acceleration
          particle.velocity += particle.acceleration;
          
          // Damping
          particle.velocity *= ${this.config.damping};
          
          // Update position
          particle.position += particle.velocity;
          
          // Reset acceleration
          particle.acceleration = vec2f(0.0);
          
          // Wrap around edges
          if (particle.position.x < 0.0) { particle.position.x = uniforms.canvas.x; }
          if (particle.position.x > uniforms.canvas.x) { particle.position.x = 0.0; }
          if (particle.position.y < 0.0) { particle.position.y = uniforms.canvas.y; }
          if (particle.position.y > uniforms.canvas.y) { particle.position.y = 0.0; }
          
          particles[i] = particle;
        }
      `
    });
    
    this.computePipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: { module: computeShaderModule, entryPoint: 'main' }
    });
    
    this.computeBindGroup = this.device.createBindGroup({
      layout: this.computePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.particleBuffer } },
        { binding: 1, resource: { buffer: this.uniformBuffer } }
      ]
    });
  }
  
  recreateRenderPipeline() {
    if (!this.device) return;
    
    const format = navigator.gpu.getPreferredCanvasFormat();
    const renderShaderModule = this.device.createShaderModule({
      code: `
        struct Particle {
          position: vec2f,
          velocity: vec2f,
          acceleration: vec2f,
        };
        
        struct Uniforms {
          canvas: vec2f,
          mouse: vec2f,
        };
        
        @group(0) @binding(0) var<storage, read> particles: array<Particle>;
        @group(0) @binding(1) var<uniform> uniforms: Uniforms;
        
        struct VertexOutput {
          @builtin(position) position: vec4f,
          @location(0) color: vec4f,
        };
        
        @vertex
        fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
          let i = vertexIndex;
          let pos = particles[i].position;
          
          var output: VertexOutput;
          output.position = vec4f(
            (pos.x / uniforms.canvas.x) * 2.0 - 1.0,
            -((pos.y / uniforms.canvas.y) * 2.0 - 1.0),
            0.0,
            1.0
          );
          
          // Blue color variation based on velocity
          let speed = length(particles[i].velocity);
          let baseColor = vec3f(${this.config.baseColor[0]}, ${this.config.baseColor[1]}, ${this.config.baseColor[2]});
          output.color = vec4f(baseColor.x, baseColor.y + speed * 0.3, baseColor.z, 0.7);
          
          return output;
        }
        
        @fragment
        fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
          return input.color;
        }
      `
    });
    
    this.renderPipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: renderShaderModule,
        entryPoint: 'vertexMain',
      },
      fragment: {
        module: renderShaderModule,
        entryPoint: 'fragmentMain',
        targets: [{ format }],
      },
      primitive: {
        topology: 'point-list',
      },
    });
    
    this.renderBindGroup = this.device.createBindGroup({
      layout: this.renderPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.particleBuffer } },
        { binding: 1, resource: { buffer: this.uniformBuffer } }
      ]
    });
  }
  
  // Utility method to convert rgb string to hex
  rgbToHex(rgb) {
    if (typeof rgb === 'string') {
      const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      }
    }
    return '#1a55e6'; // Default blue color
  }
  
  // Utility method to convert hex to rgb
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 26, g: 85, b: 230 }; // Default blue color
  }
  
  // Add method to save configuration to localStorage
  saveConfig() {
    try {
      localStorage.setItem('spaceCloudConfig', JSON.stringify(this.config));
    } catch (e) {
      console.warn('Could not save space clouds settings:', e);
    }
  }
  
  // Add method to load configuration from localStorage
  loadConfig() {
    try {
      const savedConfig = localStorage.getItem('spaceCloudConfig');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }
    } catch (e) {
      console.warn('Could not load space clouds settings:', e);
    }
  }
}

// Initialize the effect when the page loads
window.addEventListener('DOMContentLoaded', () => {
  new BluePlexusEffect();
});
