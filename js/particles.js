// Enhanced particles effect with dust-like particles
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
    canvas.style.position = 'fixed'; // Use fixed instead of absolute
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
    
    // Particle system configuration
    const particles = [];
    const particleCount = 100; // Reduced for performance
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
        console.log('Canvas resized:', canvas.width, canvas.height);
    });
    
    // Particle class with simplified properties for better performance
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.3;
            
            // Simple color scheme
            this.color = '#64ffda';
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        update() {
            // Basic movement
            this.x += this.vx;
            this.y += this.vy;
            
            // Mouse interaction
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouseRadius) {
                const angle = Math.atan2(dy, dx);
                const force = (mouseRadius - distance) / mouseRadius;
                this.vx -= Math.cos(angle) * force * 0.1;
                this.vy -= Math.sin(angle) * force * 0.1;
                this.opacity = 0.8;
            }
            
            // Boundary checks
            if (this.x < 0 || this.x > canvas.width || 
                this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
            
            // Add slight randomness
            this.vx += (Math.random() - 0.5) * 0.01;
            this.vy += (Math.random() - 0.5) * 0.01;
            
            // Dampen speed
            this.vx *= 0.99;
            this.vy *= 0.99;
        }
    }
    
    // Create particles
    console.log('Creating particles...');
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Draw connections between nearby particles
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    
                    // Opacity based on distance
                    const opacity = 1 - (distance / connectionDistance);
                    ctx.strokeStyle = `rgba(100, 255, 218, ${opacity * 0.2})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }
    
    // Animation loop
    function animate() {
        // Clear the whole canvas with each frame
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
    console.log('Starting animation loop...');
    animate();
});
