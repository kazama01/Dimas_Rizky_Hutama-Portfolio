// Simple, reliable particle system with multi-colored stars and space dust effect
document.addEventListener('DOMContentLoaded', function() {
    console.log('Lightweight space particle system initializing...');
    
    // Get particle container
    const container = document.getElementById('particle-container');
    if (!container) {
        console.error('Particle container not found!');
        return;
    }
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Set container styles explicitly to ensure proper rendering
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    container.style.zIndex = '1'; 
    container.style.pointerEvents = 'none';
    
    // Multi-colored star palette (complementary colors based on teal)
    const starColors = [
        '#64ffda', // Original teal
        '#9effeb', // Light teal
        '#ff6464', // Complementary red/coral
        '#fff064', // Yellow accent
        '#c264ff', // Purple accent
        '#ffffff'  // Pure white for brightest stars
    ];
    
    // Enhanced space dust particle colors - more variety and colors
    const dustColors = [
        'rgba(100, 255, 218, 0.2)', // Teal base
        'rgba(158, 255, 235, 0.15)', // Light teal
        'rgba(200, 255, 245, 0.1)', // Very light teal
        'rgba(255, 255, 255, 0.1)', // White dust
        'rgba(170, 170, 255, 0.08)', // Blueish dust
        'rgba(255, 230, 200, 0.05)', // Yellowish/orange dust
        'rgba(200, 200, 255, 0.07)', // Light blue dust
        'rgba(255, 200, 255, 0.06)'  // Pinkish dust
    ];
    
    // Create static particle elements - reduced count for better performance
    const particleCount = 80; // Reduced count for better performance
    
    // Create dust cloud particles
    const dustCloudCount = 50; // Reduced for better performance
    
    // First create stars
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }
    
    // Then create dust cloud particles
    for (let i = 0; i < dustCloudCount; i++) {
        createDustParticle();
    }
    
    // Enhanced particle creation with fade in/out lifecycle
    function createParticle() {
        const particle = document.createElement('div');
        
        // Randomize particle properties with more dynamic behavior
        const isStar = Math.random() < 0.15;
        const size = isStar ? Math.random() * 4 + 2 : Math.random() * 2.5 + 0.5;
        
        // Dynamic positioning across the entire viewport
        const posX = Math.random() * 120 - 10; // Allow slight overflow
        const posY = Math.random() * 120 - 10;
        
        // Set dynamic lifespan for particles
        const lifespan = Math.random() * 8000 + 5000; // 5-13 seconds lifespan
        
        // Apply styles
        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = '50%';
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.opacity = '0'; // Start invisible
        particle.style.transition = 'all 1s ease-in-out';
        particle.style.zIndex = '2';
        
        if (isStar) {
            // Pick a random color from the star color palette
            const colorIndex = Math.floor(Math.random() * starColors.length);
            particle.style.backgroundColor = starColors[colorIndex];
            
            // Add glow effect based on the star's color - simplified
            particle.style.boxShadow = `0 0 ${Math.random() * 5 + 2}px 1px ${starColors[colorIndex]}`;
            
            // Brighter opacity for stars
            particle.style.opacity = Math.random() * 0.5 + 0.5;
            
            // Add a simple pulse animation for stars
            particle.style.animation = `starPulse ${Math.random() * 5 + 3}s ease-in-out infinite`;
        } else {
            // Enhanced dust particle styling with more dynamic behavior
            const dustColorIndex = Math.floor(Math.random() * dustColors.length);
            particle.style.backgroundColor = dustColors[dustColorIndex];
            
            // Fade in with random delay
            const fadeInDelay = Math.random() * 1000;
            setTimeout(() => {
                particle.style.opacity = (Math.random() * 0.3 + 0.1).toString();
                
                // Add random movement during lifetime
                const moveX = Math.random() * 20 - 10;
                const moveY = Math.random() * 20 - 10;
                particle.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }, fadeInDelay);
            
            // Start fade out sequence before removal
            setTimeout(() => {
                particle.style.opacity = '0';
                
                setTimeout(() => {
                    particle.remove();
                    // Create a replacement particle in a completely new position
                    createParticle();
                }, 1000);
            }, lifespan);
        }
        
        container.appendChild(particle);
    }
    
    // Function to create tiny dust cloud particles
    function createDustParticle() {
        const dust = document.createElement('div');
        
        // Tiny size for dust with more variation
        const size = Math.random() * 1.2 + 0.1;
        
        // Position randomly with more spread
        const posX = Math.random() * 120 - 10; // Allow slight overflow for more natural feel
        const posY = Math.random() * 120 - 10;
        
        // Styling dust
        dust.style.position = 'absolute';
        dust.style.width = `${size}px`;
        dust.style.height = `${size}px`;
        dust.style.borderRadius = '50%';
        dust.style.left = `${posX}%`;
        dust.style.top = `${posY}%`;
        dust.style.zIndex = '2';
        
        // Random dust color
        const dustColorIndex = Math.floor(Math.random() * dustColors.length);
        dust.style.backgroundColor = dustColors[dustColorIndex];
        
        // Start with zero opacity for fade in
        dust.style.opacity = '0';
        dust.style.transition = 'all 1.5s ease-in-out';
        
        // Lifespan for dust particle
        const lifespan = Math.random() * 8000 + 4000; // 4-12 seconds
        
        // Add to container
        container.appendChild(dust);
        
        // Fade in
        setTimeout(() => {
            dust.style.opacity = (Math.random() * 0.15 + 0.05).toString();
            
            // Random movement during lifetime
            const moveX = Math.random() * 15 - 7.5;
            const moveY = Math.random() * 15 - 7.5;
            dust.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }, 100);
        
        // Start fade out sequence before removal
        setTimeout(() => {
            dust.style.opacity = '0';
            
            // Remove and create new particle
            setTimeout(() => {
                dust.remove();
                createDustParticle(); // Create a new particle to maintain count
            }, 1500);
        }, lifespan);
    }
    
    // Add simplified keyframe animations with less dynamic movement
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes starPulse {
            0%, 100% {
                transform: scale(1);
                opacity: 0.5;
            }
            50% {
                transform: scale(1.5);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    console.log('Lightweight space particle system initialized');
    
    // Create occasional floating particles - reduced frequency
    setInterval(function() {
        if (Math.random() < 0.3) { // Reduced chance for new particles
            const floatingParticle = document.createElement('div');
            
            // Random starting position (not just bottom)
            const startX = Math.random() * 100;
            const startY = Math.random() < 0.7 ? 100 : Math.random() * 100;
            
            // Determine particle type - only two types now for simplicity
            const isSpecial = Math.random() < 0.2;
            
            // Apply styles
            floatingParticle.style.position = 'absolute';
            floatingParticle.style.zIndex = '2';
            
            if (isSpecial) {
                // Special particles are slightly larger and colored (stars)
                const colorIndex = Math.floor(Math.random() * starColors.length);
                floatingParticle.style.width = `${Math.random() * 4 + 2}px`;
                floatingParticle.style.height = `${Math.random() * 4 + 2}px`;
                floatingParticle.style.backgroundColor = starColors[colorIndex];
                floatingParticle.style.boxShadow = `0 0 4px ${starColors[colorIndex]}`;
                floatingParticle.style.opacity = Math.random() * 0.7 + 0.3;
            } else {
                // Tiny dust particles
                floatingParticle.style.width = `${Math.random() * 1.5 + 0.5}px`;
                floatingParticle.style.height = `${Math.random() * 1.5 + 0.5}px`;
                const dustColorIndex = Math.floor(Math.random() * dustColors.length);
                floatingParticle.style.backgroundColor = dustColors[dustColorIndex];
                floatingParticle.style.opacity = Math.random() * 0.2 + 0.05;
            }
            
            floatingParticle.style.borderRadius = '50%';
            floatingParticle.style.left = `${startX}%`;
            floatingParticle.style.top = `${startY}%`;
            
            // Reduced animation duration for better performance
            const duration = isSpecial ? Math.random() * 15 + 10 : Math.random() * 20 + 15;
            
            // Different movement directions based on starting position
            let endX, endY;
            
            if (startY >= 100) {
                // Starting from bottom, move up
                endY = '-5%';
                endX = `${startX + (Math.random() * 20 - 10)}%`;
            } else {
                // Starting from random position, move in random direction
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 15 + 5;
                endX = `${startX + Math.cos(angle) * distance}%`;
                endY = `${startY + Math.sin(angle) * distance}%`;
            }
            
            floatingParticle.style.transition = `top ${duration}s linear, left ${duration}s ease-in-out, opacity ${duration}s ease-in`;
            
            // Add to DOM
            container.appendChild(floatingParticle);
            
            // Start animation after a small delay
            setTimeout(() => {
                floatingParticle.style.left = endX;
                floatingParticle.style.top = endY;
                floatingParticle.style.opacity = '0';
                
                // Remove the element after animation completes
                setTimeout(() => {
                    floatingParticle.remove();
                }, duration * 1000);
            }, 10);
        }
    }, 400); // Reduced frequency
});
