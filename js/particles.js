// Enhanced particles effect with bloom-like dust particles
document.addEventListener('DOMContentLoaded', function() {
    console.log('Particles script executing...');
    
    // Get the particle container
    const particleContainer = document.getElementById('particle-container');
    if (!particleContainer) {
        console.error('Particle container not found!');
        return;
    }
    
    console.log('Particle container found, creating canvas...');
    
    // Create canvas for particles with explicit dimensions
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    
    // Ensure canvas is appended to the DOM
    while (particleContainer.firstChild) {
        particleContainer.removeChild(particleContainer.firstChild);
    }
    particleContainer.appendChild(canvas);
    
    console.log('Canvas created and appended to container');
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context!');
        return;
    }
    
    // Particle system configuration with bloom effect
    const particles = [];
    const particleCount = 120; // Increased for more dust particles
    const connectionDistance = 100;
    const mouseRadius = 150;
    
    // Mouse position tracking (relative to document)
    let mouseX = 0;
    let mouseY = 0;
    
    // Track mouse position with correct coordinates
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Resize handler
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    // Bloom effect configuration
    const bloomColors = [
        '#64ffda', // Original teal
        '#9effeb', // Lighter teal
        '#50d0b8', // Darker teal
        '#c4fff2', // Very light teal
        '#ffffff'  // White for brightest particles
    ];
    
    // Particle class with bloom simulation
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            
            // Varied sizes - some very small, some larger for bloom effect
            this.baseSize = Math.random() * 2.5 + 0.5;
            
            // Randomize velocity for natural movement
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            
            // Randomize opacity
            this.baseOpacity = Math.random() * 0.5 + 0.2;
            this.opacity = this.baseOpacity;
            
            // Random color selection for varied glow appearance
            this.colorIndex = Math.floor(Math.random() * bloomColors.length);
            this.color = bloomColors[this.colorIndex];
            
            // Pulsing effect variables
            this.pulseSpeed = Math.random() * 0.03 + 0.01;
            this.pulseOffset = Math.random() * Math.PI * 2;
            this.time = 0;
            
            // Chance for some particles to be "stars" (larger and brighter)
            this.isStar = Math.random() < 0.15; // 15% chance to be a star
            if (this.isStar) {
                this.baseSize *= 2;
                this.baseOpacity *= 1.5;
                this.opacity = this.baseOpacity;
                // Stars are more likely to be white or very light
                this.colorIndex = Math.min(4, this.colorIndex + 2);
                this.color = bloomColors[this.colorIndex];
            }
        }
        
        draw() {
            // Current size with pulsing effect
            const size = this.baseSize * (1 + Math.sin(this.time * this.pulseSpeed + this.pulseOffset) * 0.3);
            
            // Simulate bloom/glow effect
            if (this.isStar || this.opacity > 0.5) {
                // Draw outer glow for brighter particles
                const glow = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, size * 3
                );
                
                glow.addColorStop(0, `rgba(100, 255, 218, ${this.opacity * 0.7})`);
                glow.addColorStop(1, 'rgba(100, 255, 218, 0)');
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, size * 3, 0, Math.PI * 2);
                ctx.fillStyle = glow;
                ctx.fill();
            }
            
            // Draw the particle
            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        update() {
            // Update time for pulsing
            this.time += 1/60; // Assuming ~60fps
            
            // Pulsing opacity for bloom effect
            this.opacity = this.baseOpacity * (0.8 + Math.sin(this.time * this.pulseSpeed + this.pulseOffset) * 0.2);
            
            // Randomly increase brightness occasionally for twinkling effect
            if (Math.random() < 0.003) { // 0.3% chance per frame
                this.opacity = Math.min(1, this.opacity * 3);
                // This bright state will reset on the next frame
            }
            
            // Basic movement
            this.x += this.vx;
            this.y += this.vy;
            
            // Mouse interaction
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouseRadius) {
                // Particle is near the cursor, increase brightness
                const angle = Math.atan2(dy, dx);
                const force = (mouseRadius - distance) / mouseRadius;
                
                // Move away from cursor
                this.vx -= Math.cos(angle) * force * 0.1;
                this.vy -= Math.sin(angle) * force * 0.1;
                
                // Increase brightness near cursor
                this.opacity = Math.min(1, this.baseOpacity * 2);
                
                // Stars become extra bright near cursor
                if (this.isStar) {
                    this.opacity = Math.min(1, this.baseOpacity * 3);
                }
            }
            
            // Boundary checks with wrap-around
            if (this.x < -20) this.x = canvas.width + 20;
            if (this.x > canvas.width + 20) this.x = -20;
            if (this.y < -20) this.y = canvas.height + 20;
            if (this.y > canvas.height + 20) this.y = -20;
            
            // Add slight randomness for natural movement
            this.vx += (Math.random() - 0.5) * 0.01;
            this.vy += (Math.random() - 0.5) * 0.01;
            
            // Dampen speed
            this.vx *= 0.99;
            this.vy *= 0.99;
        }
    }
    
    // Create particles
    console.log('Creating particles with bloom effect...');
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Draw connections between nearby particles - softer for bloom aesthetic
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    // Brighter connections between brighter particles
                    const opacity = (1 - (distance / connectionDistance)) * 
                                    Math.min(particles[i].opacity, particles[j].opacity) * 0.3;
                    
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(100, 255, 218, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }
    
    // Animation loop
    function animate() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        
        // Draw connections
        drawConnections();
        
        // Request next frame
        requestAnimationFrame(animate);
    }
    
    // Start animation
    console.log('Starting animation with bloom effect...');
    animate();
});
