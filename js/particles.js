// Simple, reliable particle system with multi-colored stars and space dust effect
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced space particle system initializing...');
    
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
    // Modified z-index to be above separator but below text/images
    container.style.zIndex = '5'; 
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
    
    // New space dust colors - more subtle
    const spaceDustColors = [
        'rgba(255, 255, 255, 0.03)', // Very faint white
        'rgba(200, 220, 255, 0.02)', // Very faint blue
        'rgba(255, 220, 200, 0.025)', // Very faint orange
        'rgba(220, 255, 220, 0.02)', // Very faint green
        'rgba(255, 220, 255, 0.015)' // Very faint pink
    ];
    
    // New cloud/nebula colors with higher opacity for better visibility
    const nebulaColors = [
        'rgba(100, 255, 218, 0.07)', // Teal nebula
        'rgba(158, 235, 255, 0.06)', // Light blue nebula
        'rgba(255, 150, 150, 0.05)', // Pink/red nebula
        'rgba(255, 240, 150, 0.06)', // Yellow nebula
        'rgba(190, 150, 255, 0.05)', // Purple nebula
        'rgba(150, 150, 255, 0.04)'  // Blue nebula
    ];
    
    // Create canvas for nebula effect
    const nebulaCanvas = document.createElement('canvas');
    nebulaCanvas.style.position = 'absolute';
    nebulaCanvas.style.top = '0';
    nebulaCanvas.style.left = '0';
    nebulaCanvas.style.width = '100%';
    nebulaCanvas.style.height = '100%';
    nebulaCanvas.style.opacity = '0.3'; // Increased opacity for better visibility
    nebulaCanvas.style.filter = 'blur(40px)'; // Heavy blur for nebula-like effect
    // Adjusted z-index to be higher than separator but lower than particles
    nebulaCanvas.style.zIndex = '6'; 
    container.appendChild(nebulaCanvas);
    
    // Set canvas dimensions
    nebulaCanvas.width = window.innerWidth;
    nebulaCanvas.height = window.innerHeight;
    const nebulaCtx = nebulaCanvas.getContext('2d');
    
    // Draw nebula effect with enhanced cloud-like formations
    function drawNebula() {
        // Clear canvas with fading instead of complete clear for smoother transitions
        nebulaCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        nebulaCtx.fillRect(0, 0, nebulaCanvas.width, nebulaCanvas.height);
        
        // Draw multiple overlapping nebula clouds for richer effect
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * nebulaCanvas.width;
            const y = Math.random() * nebulaCanvas.height;
            const radius = Math.random() * 400 + 150; // Larger clouds
            
            // Random nebula color
            const colorIndex = Math.floor(Math.random() * nebulaColors.length);
            const color = nebulaColors[colorIndex];
            
            // Create radial gradient with multiple color stops for more complex cloud effect
            const gradient = nebulaCtx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.4, color.replace(', 0.', ', 0.02')); // Fade middle
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparent edge
            
            nebulaCtx.fillStyle = gradient;
            
            // Draw cloud-like shapes using multiple overlapping circles
            nebulaCtx.beginPath();
            nebulaCtx.arc(x, y, radius, 0, Math.PI * 2);
            nebulaCtx.fill();
            
            // Add smaller cloud formations around the main cloud
            const cloudlets = Math.floor(Math.random() * 4) + 2;
            for (let j = 0; j < cloudlets; j++) {
                const cloudletX = x + (Math.random() * radius * 0.8) - (radius * 0.4);
                const cloudletY = y + (Math.random() * radius * 0.8) - (radius * 0.4);
                const cloudletRadius = radius * (Math.random() * 0.4 + 0.2);
                
                // Create smaller gradient
                const cloudletGradient = nebulaCtx.createRadialGradient(
                    cloudletX, cloudletY, 0, 
                    cloudletX, cloudletY, cloudletRadius
                );
                cloudletGradient.addColorStop(0, color);
                cloudletGradient.addColorStop(0.6, color.replace(', 0.', ', 0.01'));
                cloudletGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                nebulaCtx.fillStyle = cloudletGradient;
                nebulaCtx.beginPath();
                nebulaCtx.arc(cloudletX, cloudletY, cloudletRadius, 0, Math.PI * 2);
                nebulaCtx.fill();
            }
        }
    }
    
    // Draw initial nebula
    drawNebula();
    
    // Redraw nebula occasionally for subtle movement - more frequent updates
    setInterval(drawNebula, 5000);
    
    // Create additional cloud layer for smoky effect
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.style.position = 'absolute';
    cloudCanvas.style.top = '0';
    cloudCanvas.style.left = '0';
    cloudCanvas.style.width = '100%';
    cloudCanvas.style.height = '100%';
    cloudCanvas.style.opacity = '1';
    cloudCanvas.style.filter = 'blur(70px)'; // Heavy blur for smoky clouds
    cloudCanvas.style.zIndex = '5.5'; // Between particles and nebula
    container.appendChild(cloudCanvas);
    
    // Set cloud canvas dimensions
    cloudCanvas.width = window.innerWidth;
    cloudCanvas.height = window.innerHeight;
    const cloudCtx = cloudCanvas.getContext('2d');
    
    // Collection of cloud positions for animation
    const clouds = [];
    for (let i = 0; i < 15; i++) {
        clouds.push({
            x: Math.random() * cloudCanvas.width,
            y: Math.random() * cloudCanvas.height,
            radius: Math.random() * 200 + 100,
            color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)],
            vx: Math.random() * 0.2 - 0.1,
            vy: Math.random() * 0.2 - 0.1
        });
    }
    
    // Draw and animate space clouds
    function animateClouds() {
        // Clear with fade
        cloudCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        cloudCtx.fillRect(0, 0, cloudCanvas.width, cloudCanvas.height);
        
        clouds.forEach(cloud => {
            // Move cloud
            cloud.x += cloud.vx;
            cloud.y += cloud.vy;
            
            // Wrap around edges
            if (cloud.x < -cloud.radius) cloud.x = cloudCanvas.width + cloud.radius;
            if (cloud.x > cloudCanvas.width + cloud.radius) cloud.x = -cloud.radius;
            if (cloud.y < -cloud.radius) cloud.y = cloudCanvas.height + cloud.radius;
            if (cloud.y > cloudCanvas.height + cloud.radius) cloud.y = -cloud.radius;
            
            // Draw cloud
            const gradient = cloudCtx.createRadialGradient(
                cloud.x, cloud.y, 0,
                cloud.x, cloud.y, cloud.radius
            );
            gradient.addColorStop(0, cloud.color);
            gradient.addColorStop(0.7, cloud.color.replace(', 0.', ', 0.01'));
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            cloudCtx.fillStyle = gradient;
            cloudCtx.beginPath();
            cloudCtx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
            cloudCtx.fill();
        });
        
        // Request next frame
        requestAnimationFrame(animateClouds);
    }
    
    // Start cloud animation
    animateClouds();
    
    // Create dust layer canvas for deeper space effect
    const dustLayerCanvas = document.createElement('canvas');
    dustLayerCanvas.style.position = 'absolute';
    dustLayerCanvas.style.top = '0';
    dustLayerCanvas.style.left = '0';
    dustLayerCanvas.style.width = '100%';
    dustLayerCanvas.style.height = '100%';
    dustLayerCanvas.style.opacity = '1';
    // Adjusted z-index to be higher than separator but lower than nebula
    dustLayerCanvas.style.zIndex = '5';
    container.appendChild(dustLayerCanvas);
    
    // Set dust canvas dimensions
    dustLayerCanvas.width = window.innerWidth;
    dustLayerCanvas.height = window.innerHeight;
    const dustCtx = dustLayerCanvas.getContext('2d');
    
    // Draw space dust layer
    function drawSpaceDust() {
        // Slightly fade previous frame instead of clearing
        dustCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        dustCtx.fillRect(0, 0, dustLayerCanvas.width, dustLayerCanvas.height);
        
        // Draw many tiny dust particles
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * dustLayerCanvas.width;
            const y = Math.random() * dustLayerCanvas.height;
            const size = Math.random() * 0.8 + 0.1;
            
            // Random dust color
            const colorIndex = Math.floor(Math.random() * spaceDustColors.length);
            dustCtx.fillStyle = spaceDustColors[colorIndex];
            
            dustCtx.beginPath();
            dustCtx.arc(x, y, size, 0, Math.PI * 2);
            dustCtx.fill();
        }
    }
    
    // Draw dust effect and periodically update
    drawSpaceDust();
    setInterval(drawSpaceDust, 200);
    
    // Create static particle elements - increased count for more particles
    const particleCount = 200; // Doubled count for more dense space feel
    
    // Create dust cloud particles
    const dustCloudCount = 300; // Additional tiny dust particles
    
    // Add more micro dust particles to fill the space
    const microDustCount = 500; // Many micro dust particles
    
    // First create stars
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }
    
    // Then create dust cloud particles
    for (let i = 0; i < dustCloudCount; i++) {
        createDustParticle();
    }
    
    // Finally create micro dust particles
    for (let i = 0; i < microDustCount; i++) {
        createMicroDustParticle();
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
        const lifespan = Math.random() * 8000 + 3000; // 3-11 seconds lifespan
        
        // Apply styles
        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = '50%';
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.opacity = '0'; // Start invisible
        particle.style.transition = 'all 1s ease-in-out';
        // Add z-index to ensure particles appear above separator
        particle.style.zIndex = '5';
        
        if (isStar) {
            // Pick a random color from the star color palette
            const colorIndex = Math.floor(Math.random() * starColors.length);
            particle.style.backgroundColor = starColors[colorIndex];
            
            // Add glow effect based on the star's color
            const glowColor = starColors[colorIndex].replace('#', '');
            particle.style.boxShadow = `0 0 ${Math.random() * 8 + 5}px 2px rgba(${parseInt(glowColor.substring(0, 2), 16)}, ${parseInt(glowColor.substring(2, 4), 16)}, ${parseInt(glowColor.substring(4, 6), 16)}, 0.8)`;
            
            // Brighter opacity for stars
            particle.style.opacity = Math.random() * 0.5 + 0.5;
            
            // Add a longer pulse animation for stars
            particle.style.animation = `
                float ${Math.random() * 60 + 20}s linear infinite ${Math.random() * 10}s,
                starPulse ${Math.random() * 3 + 2}s ease-in-out infinite,
                glowPulse ${Math.random() * 4 + 3}s ease-in-out infinite
            `;
        } else {
            // Enhanced dust particle styling with more dynamic behavior
            const dustColorIndex = Math.floor(Math.random() * dustColors.length);
            particle.style.backgroundColor = dustColors[dustColorIndex];
            
            // Fade in with random delay
            const fadeInDelay = Math.random() * 1000;
            setTimeout(() => {
                particle.style.opacity = (Math.random() * 0.3 + 0.1).toString();
                
                // Add random movement during lifetime
                const moveX = Math.random() * 40 - 20;
                const moveY = Math.random() * 40 - 20;
                particle.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }, fadeInDelay);
            
            // Add dynamic movement animation
            const duration = Math.random() * 60 + 30;
            particle.style.animation = `
                float ${duration}s linear infinite,
                pulse ${Math.random() * 4 + 3}s ease-in-out infinite,
                opacityPulse ${Math.random() * 5 + 4}s ease-in-out infinite
            `;
            
            // Start fade out sequence before removal
            setTimeout(() => {
                particle.style.opacity = '0';
                particle.style.transform = `translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px)`;
                
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
        // Add z-index to ensure dust appears above separator
        dust.style.zIndex = '5';
        
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
            const moveX = Math.random() * 30 - 15;
            const moveY = Math.random() * 30 - 15;
            dust.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }, 100);
        
        // Start fade out sequence before removal
        setTimeout(() => {
            dust.style.opacity = '0';
            dust.style.transform = `translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px)`;
            
            // Remove and create new particle
            setTimeout(() => {
                dust.remove();
                createDustParticle(); // Create a new particle to maintain count
            }, 1500);
        }, lifespan);
        
        // Add subtle pulsing animation
        const duration = Math.random() * 60 + 30;
        const delay = Math.random() * 5;
        dust.style.animation = `
            dustPulse ${Math.random() * 4 + 3}s ease-in-out infinite ${delay}s,
            dustDrift ${duration}s linear infinite ${delay}s
        `;
    }
    
    // Function to create micro-dust particles for space effect
    function createMicroDustParticle() {
        const microDust = document.createElement('div');
        
        // Extremely tiny size for micro dust
        const size = Math.random() * 0.5 + 0.1;
        
        // Position randomly
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        // Styling micro dust
        microDust.style.position = 'absolute';
        microDust.style.width = `${size}px`;
        microDust.style.height = `${size}px`;
        microDust.style.borderRadius = '50%';
        microDust.style.left = `${posX}%`;
        microDust.style.top = `${posY}%`;
        
        // Very faint coloring
        microDust.style.backgroundColor = spaceDustColors[Math.floor(Math.random() * spaceDustColors.length)];
        
        // Extremely transparent
        microDust.style.opacity = Math.random() * 0.1 + 0.02;
        
        // Updated z-index for proper layering
        microDust.style.zIndex = 5;
        
        // Very slow or static for background dust
        if (Math.random() < 0.3) {
            const duration = Math.random() * 180 + 120; // Extremely slow movement
            const delay = Math.random() * 30;
            microDust.style.animation = `
                microDustFloat ${duration}s linear infinite ${delay}s
            `;
        }
        
        // Add to container
        container.appendChild(microDust);
    }
    
    // Add new function to create smoke-like particles
    function createSmokeParticle() {
        const smoke = document.createElement('div');
        
        // Larger size for smoke effect
        const size = Math.random() * 20 + 10;
        
        // Position randomly
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        // Styling smoke
        smoke.style.position = 'absolute';
        smoke.style.width = `${size}px`;
        smoke.style.height = `${size}px`;
        smoke.style.borderRadius = '50%';
        smoke.style.left = `${posX}%`;
        smoke.style.top = `${posY}%`;
        smoke.style.zIndex = '5';
        
        // Very faint styling with higher blur
        const colorIndex = Math.floor(Math.random() * nebulaColors.length);
        smoke.style.backgroundColor = nebulaColors[colorIndex];
        smoke.style.opacity = '0';
        smoke.style.filter = `blur(${Math.random() * 10 + 5}px)`;
        smoke.style.transition = 'all 3s ease-in-out';
        
        // Add to container
        container.appendChild(smoke);
        
        // Animate smoke
        setTimeout(() => {
            smoke.style.opacity = (Math.random() * 0.1 + 0.02).toString();
            
            // Slow expansion
            smoke.style.transform = `scale(${Math.random() * 1.5 + 1.5})`;
            
            // Set lifespan for smoke particle
            setTimeout(() => {
                smoke.style.opacity = '0';
                
                setTimeout(() => {
                    smoke.remove();
                    createSmokeParticle(); // Create a replacement
                }, 3000);
            }, Math.random() * 15000 + 10000); // 10-25 second lifespan
        }, 100);
    }
    
    // Create initial smoke particles
    for (let i = 0; i < 15; i++) {
        createSmokeParticle();
    }
    
    // Add enhanced keyframe animations with more dynamic movement
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes float {
            0% {
                transform: translateY(0) translateX(0) rotate(0deg);
            }
            25% {
                transform: translateY(-${Math.random() * 30 + 15}px) translateX(${Math.random() * 30 - 15}px) rotate(${Math.random() * 30}deg);
            }
            50% {
                transform: translateY(${Math.random() * 30 + 15}px) translateX(${Math.random() * 30 - 15}px) rotate(${Math.random() * 30}deg);
            }
            75% {
                transform: translateY(-${Math.random() * 30 + 15}px) translateX(-${Math.random() * 30 - 15}px) rotate(-${Math.random() * 30}deg);
            }
            100% {
                transform: translateY(0) translateX(0) rotate(0deg);
            }
        }
        
        @keyframes slowFloat {
            0% {
                transform: translateY(0) translateX(0);
            }
            50% {
                transform: translateY(-${Math.random() * 10 + 5}px) translateX(${Math.random() * 10 - 5}px);
            }
            100% {
                transform: translateY(0) translateX(0);
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
                opacity: 0.3;
            }
            50% {
                transform: scale(1.2);
                opacity: 0.6;
            }
        }
        
        @keyframes starPulse {
            0%, 100% {
                transform: scale(1);
                opacity: 0.5;
            }
            50% {
                transform: scale(1.5);
                opacity: 1;
            }
            75% {
                transform: scale(0.8);
                opacity: 0.7;
            }
        }
        
        @keyframes dustDrift {
            0%, 100% {
                transform: translateX(0);
            }
            50% {
                transform: translateX(${Math.random() * 10 - 5}px);
            }
        }
        
        @keyframes microDustFloat {
            0% {
                transform: translateY(0) translateX(0);
                opacity: 0.03;
            }
            25% {
                opacity: 0.07;
            }
            50% {
                transform: translateY(-${Math.random() * 5 + 2}px) translateX(${Math.random() * 5 - 2}px);
                opacity: 0.05;
            }
            75% {
                opacity: 0.02;
            }
            100% {
                transform: translateY(0) translateX(0);
                opacity: 0.03;
            }
        }
        
        @keyframes glowPulse {
            0%, 100% {
                filter: brightness(1);
            }
            50% {
                filter: brightness(1.5);
            }
        }
        
        @keyframes opacityPulse {
            0%, 100% {
                opacity: 0.05;
            }
            25% {
                opacity: 0.2;
            }
            50% {
                opacity: 0.15;
            }
            75% {
                opacity: 0.1;
            }
        }
        
        @keyframes dustPulse {
            0%, 100% {
                opacity: 0.05;
                transform: scale(1);
            }
            50% {
                opacity: 0.15;
                transform: scale(1.2);
            }
        }
        
        @keyframes dustDrift {
            0% {
                transform: translate(0, 0);
            }
            25% {
                transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px);
            }
            50% {
                transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px);
            }
            75% {
                transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px);
            }
            100% {
                transform: translate(0, 0);
            }
        }
        
        @keyframes smokeFloat {
            0% {
                transform: translateY(0) translateX(0) scale(1) rotate(0deg);
                opacity: 0.02;
            }
            33% {
                transform: translateY(-${Math.random() * 20 + 10}px) translateX(${Math.random() * 20 - 10}px) scale(1.2) rotate(${Math.random() * 10}deg);
                opacity: 0.04;
            }
            66% {
                transform: translateY(${Math.random() * 20 + 10}px) translateX(${Math.random() * 20 - 10}px) scale(1.4) rotate(${Math.random() * 20}deg);
                opacity: 0.03;
            }
            100% {
                transform: translateY(0) translateX(0) scale(1.6) rotate(${Math.random() * 30}deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    console.log('Space-like particle system initialized with enhanced nebula and cloud effects');
    
    // Create floating particles with enhanced behavior
    setInterval(function() {
        if (Math.random() < 0.7) { // Increased chance for new particles
            const floatingParticle = document.createElement('div');
            
            // Random starting position (not just bottom)
            const startX = Math.random() * 100;
            const startY = Math.random() < 0.7 ? 100 : Math.random() * 100;
            
            // Determine particle type
            const particleType = Math.random();
            // 10% stars, 30% special dust, 60% regular dust
            const isSpecial = particleType < 0.1;
            const isMediumDust = particleType >= 0.1 && particleType < 0.4;
            
            // Apply styles
            floatingParticle.style.position = 'absolute';
            // Add z-index to ensure floating particles appear above separator
            floatingParticle.style.zIndex = '5';
            
            if (isSpecial) {
                // Special particles are slightly larger and colored (stars)
                const colorIndex = Math.floor(Math.random() * starColors.length);
                floatingParticle.style.width = `${Math.random() * 5 + 2}px`;
                floatingParticle.style.height = `${Math.random() * 5 + 2}px`;
                floatingParticle.style.backgroundColor = starColors[colorIndex];
                floatingParticle.style.boxShadow = `0 0 5px ${starColors[colorIndex]}`;
                floatingParticle.style.opacity = Math.random() * 0.7 + 0.3;
            } else if (isMediumDust) {
                // Medium dust particles
                floatingParticle.style.width = `${Math.random() * 3 + 1}px`;
                floatingParticle.style.height = `${Math.random() * 3 + 1}px`;
                const dustColorIndex = Math.floor(Math.random() * dustColors.length);
                floatingParticle.style.backgroundColor = dustColors[dustColorIndex];
                floatingParticle.style.opacity = Math.random() * 0.4 + 0.1;
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
            
            // Float animation with different durations based on type
            const duration = isSpecial ? Math.random() * 20 + 15 : 
                            isMediumDust ? Math.random() * 15 + 10 : 
                            Math.random() * 25 + 20; // Slower for tiny dust
            
            // Different movement directions based on starting position
            let endX, endY;
            
            if (startY >= 100) {
                // Starting from bottom, move up
                endY = '-5%';
                endX = `${startX + (Math.random() * 30 - 15)}%`;
            } else {
                // Starting from random position, move in random direction
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 20 + 10;
                endX = `${startX + Math.cos(angle) * distance}%`;
                endY = `${startY + Math.sin(angle) * distance}%`;
                
                // Ensure particles don't go off screen
                if (parseFloat(endX) < 0) endX = '0%';
                if (parseFloat(endX) > 100) endX = '100%';
                if (parseFloat(endY) < 0) endY = '0%';
                if (parseFloat(endY) > 100) endY = '100%';
            }
            
            floatingParticle.style.transition = `top ${duration}s linear, left ${duration}s ease-in-out, opacity ${duration}s ease-in, transform ${duration / 4}s ease-in-out`;
            
            // Add to DOM
            container.appendChild(floatingParticle);
            
            // Start animation after a small delay
            setTimeout(() => {
                // Add some random rotation for special particles
                if (isSpecial) {
                    floatingParticle.style.transform = `rotate(${Math.random() * 360}deg)`;
                }
                
                floatingParticle.style.left = endX;
                floatingParticle.style.top = endY;
                floatingParticle.style.opacity = '0';
                
                // Remove the element after animation completes
                setTimeout(() => {
                    floatingParticle.remove();
                }, duration * 1000);
            }, 10);
            
            // Create random space dust streams
            if (Math.random() < 0.2) { // 20% chance to create dust streams
                createDustStream();
            }
        }
    }, 150); // More frequent particle creation
    
    // Function to create dust streams (groups of dust that move together)
    function createDustStream() {
        const streamOriginX = Math.random() * 100;
        const streamOriginY = Math.random() * 100;
        const streamDirection = Math.random() * Math.PI * 2;
        const streamLength = Math.floor(Math.random() * 10) + 5;
        
        for (let i = 0; i < streamLength; i++) {
            const dustParticle = document.createElement('div');
            
            // Small size for dust stream particles
            const size = Math.random() * 0.8 + 0.2;
            
            // Position with slight offset from stream origin
            const offset = i * (Math.random() * 2 + 1);
            const offsetX = Math.cos(streamDirection) * offset;
            const offsetY = Math.sin(streamDirection) * offset;
            
            // Position
            dustParticle.style.position = 'absolute';
            dustParticle.style.width = `${size}px`;
            dustParticle.style.height = `${size}px`;
            dustParticle.style.borderRadius = '50%';
            dustParticle.style.left = `${streamOriginX + offsetX}%`;
            dustParticle.style.top = `${streamOriginY + offsetY}%`;
            // Add z-index to ensure dust stream appears above separator
            dustParticle.style.zIndex = '5';
            
            // Very faint styling
            dustParticle.style.backgroundColor = spaceDustColors[Math.floor(Math.random() * spaceDustColors.length)];
            dustParticle.style.opacity = Math.random() * 0.1 + 0.02;
            
            // Set transition for movement
            const duration = Math.random() * 15 + 10;
            dustParticle.style.transition = `all ${duration}s linear`;
            
            // Add to container
            container.appendChild(dustParticle);
            
            // Move dust along the stream direction
            setTimeout(() => {
                const moveDistance = 20 + Math.random() * 20;
                const newX = streamOriginX + offsetX + Math.cos(streamDirection) * moveDistance;
                const newY = streamOriginY + offsetY + Math.sin(streamDirection) * moveDistance;
                
                dustParticle.style.left = `${newX}%`;
                dustParticle.style.top = `${newY}%`;
                dustParticle.style.opacity = '0';
                
                // Remove after animation completes
                setTimeout(() => {
                    dustParticle.remove();
                }, duration * 1000);
            }, 10);
        }
    }
    
    // Add a new function to create nebula bursts occasionally
    function createNebulaBurst() {
        // Create a burst point
        const burstX = Math.random() * 100;
        const burstY = Math.random() * 100; 
        const particleCount = Math.floor(Math.random() * 10) + 5;
        
        // Color for this burst
        const colorIndex = Math.floor(Math.random() * starColors.length);
        const burstColor = starColors[colorIndex];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            
            // Size
            const size = Math.random() * 8 + 3;
            
            // Styling
            particle.style.position = 'absolute';
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = burstColor;
            particle.style.boxShadow = `0 0 ${Math.random() * 10 + 5}px 2px ${burstColor}`;
            particle.style.left = `${burstX}%`;
            particle.style.top = `${burstY}%`;
            particle.style.opacity = '0';
            particle.style.zIndex = '7';
            particle.style.transition = 'all 0.5s ease-out';
            
            // Add to container
            container.appendChild(particle);
            
            // Animate outward
            setTimeout(() => {
                const angle = (Math.PI * 2) * (i / particleCount);
                const distance = Math.random() * 50 + 20;
                const moveX = Math.cos(angle) * distance;
                const moveY = Math.sin(angle) * distance;
                
                particle.style.transform = `translate(${moveX}px, ${moveY}px)`;
                particle.style.opacity = '1';
                
                // Fade out
                setTimeout(() => {
                    particle.style.opacity = '0';
                    
                    // Remove
                    setTimeout(() => {
                        particle.remove();
                    }, 1000);
                }, Math.random() * 800 + 200);
            }, Math.random() * 200);
        }
    }
    
    // Create occasional nebula bursts
    setInterval(createNebulaBurst, 5000);
    
    // Modify regenerateParticles function for smoother transitions
    function regenerateParticles() {
        const particles = Array.from(container.getElementsByTagName('div'));
        const nonStarParticles = particles.filter(p => 
            !p.style.boxShadow.includes('rgba')); // Filter out stars
        
        if (nonStarParticles.length > 0) {
            const particlesToUpdate = Math.floor(Math.random() * 5) + 3; // Update 3-8 particles
            
            for (let i = 0; i < particlesToUpdate; i++) {
                if (nonStarParticles.length > 0) {
                    const randomIndex = Math.floor(Math.random() * nonStarParticles.length);
                    const particle = nonStarParticles[randomIndex];
                    
                    // New random position within a different sector
                    const newSector = (Math.floor(Math.random() * 8) + 1 + parseInt(particle.dataset.sector)) % 9;
                    const sectorWidth = 100 / 3;
                    const sectorHeight = 100 / 3;
                    
                    const newSectorX = (newSector % 3) * sectorWidth;
                    const newSectorY = Math.floor(newSector / 3) * sectorHeight;
                    
                    const newPosX = newSectorX + Math.random() * sectorWidth;
                    const newPosY = newSectorY + Math.random() * sectorHeight;
                    
                    // Smooth transition to new position
                    particle.style.transition = 'all 2s ease-in-out';
                    particle.style.left = `${newPosX}%`;
                    particle.style.top = `${newPosY}%`;
                    
                    // Random opacity change
                    particle.style.opacity = (Math.random() * 0.3 + 0.1).toString();
                    
                    nonStarParticles.splice(randomIndex, 1);
                }
            }
        }
    }
    
    // More frequent regeneration
    setInterval(regenerateParticles, 2000); // Every 2 seconds
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // Resize canvas elements
        nebulaCanvas.width = window.innerWidth;
        nebulaCanvas.height = window.innerHeight;
        cloudCanvas.width = window.innerWidth;
        cloudCanvas.height = window.innerHeight;
        dustLayerCanvas.width = window.innerWidth;
        dustLayerCanvas.height = window.innerHeight;
        
        // Redraw effects
        drawNebula();
        drawSpaceDust();
    });
});
