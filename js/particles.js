// Enhanced particles effect with dust-like particles
document.addEventListener('DOMContentLoaded', function() {
    const particleContainer = document.getElementById('particle-container');
    
    // Add a console log to verify script execution
    console.log('Particles script loaded and running.');
    
    // Create canvas for particles
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    particleContainer.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Particle system configuration - increased count and variety
    const particles = [];
    const particleCount = 200; // Increased number of particles
    const connectionDistance = 120;
    const mouseRadius = 150;
    
    // Mouse position tracking
    let mouseX = 0;
    let mouseY = 0;
    
    // Track mouse position
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Resize handler
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    // Particle class with more dust-like properties
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            
            // Varied velocities to create more natural movement
            this.vx = (Math.random() - 0.5) * 0.7;
            this.vy = (Math.random() - 0.5) * 0.7;
            
            // Varied sizes for more natural look
            this.radius = Math.random() * 2.5 + 0.5;
            
            // Varied opacity for depth effect
            this.opacity = Math.random() * 0.5 + 0.3;
            
            // Varied colors for a more interesting look
            const colors = ['#64ffda', '#9effeb', '#50e5c3', '#40d1b0'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.originalColor = this.color;
            this.highlightColor = '#ffffff';
            
            // Random "float" effect
            this.floatAmplitude = Math.random() * 1.5;
            this.floatSpeed = Math.random() * 0.01;
            this.floatOffset = Math.random() * Math.PI * 2;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        update(time) {
            // Add "floating" sine wave motion for dust-like effect
            this.y += Math.sin(time * this.floatSpeed + this.floatOffset) * this.floatAmplitude * 0.05;
            
            // Check mouse proximity for interactive effect
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouseRadius) {
                // Particle is near the mouse cursor
                this.color = this.highlightColor;
                this.opacity = 0.8;
                
                // Push the particle gently away from the cursor
                const angle = Math.atan2(dy, dx);
                const force = (mouseRadius - distance) / mouseRadius;
                this.vx -= Math.cos(angle) * force * 0.3;
                this.vy -= Math.sin(angle) * force * 0.3;
            } else {
                this.color = this.originalColor;
                this.opacity = Math.random() * 0.5 + 0.3; // Slightly randomize opacity for a flicker effect
            }
            
            // Update position
            this.x += this.vx;
            this.y += this.vy;
            
            // Boundary check with wrap-around for a more continuous effect
            if (this.x < -50) this.x = canvas.width + 50;
            if (this.x > canvas.width + 50) this.x = -50;
            if (this.y < -50) this.y = canvas.height + 50;
            if (this.y > canvas.height + 50) this.y = -50;
            
            // Dampen velocity (friction)
            this.vx *= 0.99;
            this.vy *= 0.99;
            
            // Add slight randomness to movement for dust-like behavior
            this.vx += (Math.random() - 0.5) * 0.03;
            this.vy += (Math.random() - 0.5) * 0.03;
        }
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Draw connections between nearby particles - more connections for "web" effect
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
                    
                    // Opacity based on distance - more visible
                    const opacity = 1 - (distance / connectionDistance);
                    ctx.strokeStyle = `rgba(100, 255, 218, ${opacity * 0.2})`;
                    ctx.lineWidth = 0.3;
                    ctx.stroke();
                }
            }
        }
    }
    
    // Add occasional "dust puff" effect
    function addDustPuff() {
        // Random position
        const puffX = Math.random() * canvas.width;
        const puffY = Math.random() * canvas.height;
        
        // Add several particles from this point
        for (let i = 0; i < 5; i++) {
            const p = new Particle();
            p.x = puffX + (Math.random() - 0.5) * 20;
            p.y = puffY + (Math.random() - 0.5) * 20;
            
            // Explode outward
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            
            // Replace an existing particle
            const replaceIndex = Math.floor(Math.random() * particles.length);
            particles[replaceIndex] = p;
        }
    }
    
    // Occasionally add dust puffs
    setInterval(addDustPuff, 3000);
    
    // Animation loop with time parameter for floating effect
    let time = 0;
    function animate() {
        time += 0.1;
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections first (under particles)
        drawConnections();
        
        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update(time);
            particles[i].draw();
        }
    }
    
    // Start animation
    animate();
});
