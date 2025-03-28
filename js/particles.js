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
    container.style.position = 'absolute'; // Changed from 'fixed' to 'absolute' to scroll with page
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    container.style.zIndex = '1'; 
    container.style.pointerEvents = 'none';
    
    // Extend the container to cover the full page height
    function adjustContainerHeight() {
        const docHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        container.style.height = docHeight + 'px';
    }
    
    // Call initially and on window resize
    adjustContainerHeight();
    window.addEventListener('resize', adjustContainerHeight);
    
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
    
    // Create static particle elements - increased count for more stars
    const particleCount = 240; // Increased 3x from 80 for more stars
    
    // Create dust cloud particles
    const dustCloudCount = 150; // Increased 3x from 50 for more dust particles
    
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
        
        // More dramatic parallax depth factor based on size
        // Stars are divided into 3 layers with different parallax effects
        const starLayer = Math.floor(Math.random() * 3); // 0, 1, or 2
        let parallaxDepth;
        
        if (isStar) {
            // Three layers of stars with increasing depth factors
            if (starLayer === 0) {
                // Distant stars (move very slowly)
                parallaxDepth = 0.05 + (size / 20); 
            } else if (starLayer === 1) {
                // Mid-distance stars
                parallaxDepth = 0.15 + (size / 15);
            } else {
                // Closer stars (move more noticeably)
                parallaxDepth = 0.25 + (size / 10);
            }
        } else {
            // Regular dust particles
            parallaxDepth = 0.3 + (1 / size) * 0.2;
        }
        
        // Apply styles
        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = '50%';
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.opacity = '0'; // Start invisible
        particle.style.transition = 'opacity 1s ease-in-out';
        particle.style.zIndex = '2';
        
        // Store parallax depth as a data attribute
        particle.dataset.parallaxDepth = parallaxDepth;
        particle.dataset.isstar = isStar;
        particle.dataset.starlayer = isStar ? starLayer : -1;
        
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
        
        // Increased parallax depth factor for dust - smaller particles move faster
        const parallaxDepth = 0.4 + (1 / size) * 0.25; // Increased from previous values
        
        // Styling dust
        dust.style.position = 'absolute'; // Changed from fixed to absolute to scroll with page
        dust.style.width = `${size}px`;
        dust.style.height = `${size}px`;
        dust.style.borderRadius = '50%';
        dust.style.left = `${posX}%`;
        dust.style.top = `${posY}%`;
        dust.style.zIndex = '2';
        
        // Store parallax depth as a data attribute
        dust.dataset.parallaxDepth = parallaxDepth;
        dust.dataset.isdust = true;
        
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
            
            // Set size and corresponding parallax depth factor
            const size = isSpecial ? Math.random() * 4 + 2 : Math.random() * 1.5 + 0.5;
            const parallaxDepth = isSpecial ? 0.2 + (size / 10) : 0.35 + (1 / size) * 0.2; // Increased from previous values
            
            // Apply styles
            floatingParticle.style.position = 'absolute';
            floatingParticle.style.zIndex = '2';
            
            // Store parallax depth as a data attribute
            floatingParticle.dataset.parallaxDepth = parallaxDepth;
            floatingParticle.dataset.isfloating = true;
            
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
            
            // Increased animation duration to slow down the particles by 3x
            const duration = isSpecial ? Math.random() * 45 + 30 : Math.random() * 60 + 45;
            
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
    
    // Enhanced parallax effect on scroll with variable depth for particles
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                // Get all particles
                const particles = container.querySelectorAll('div');
                const scrollDiff = window.scrollY - lastScrollY;
                
                // Apply effect regardless of scroll amount for more consistent parallax
                // Apply parallax movement to particles when scrolling based on their depth factor
                particles.forEach(particle => {
                    // Get the particle's depth factor from data attribute (or use a default)
                    let depthFactor = parseFloat(particle.dataset.parallaxDepth || 0.1);
                    
                    // Apply different movement behaviors based on particle type
                    if (particle.dataset.isstar === "true") {
                        // Apply different movements based on star layer
                        const starLayer = parseInt(particle.dataset.starlayer || 0);
                        
                        if (starLayer === 0) {
                            // Distant stars move very slowly
                            depthFactor *= 0.8;
                        } else if (starLayer === 1) {
                            // Mid-distance stars
                            depthFactor *= 1.5;
                        } else {
                            // Closer stars move most noticeably
                            depthFactor *= 2.2;
                        }
                    } else if (particle.dataset.isdust === "true") {
                        // Dust moves faster - creates foreground effect
                        depthFactor *= 2.0;
                    } else if (particle.dataset.isfloating === "true") {
                        // Floating particles have more variable movement
                        depthFactor *= (Math.random() * 0.5 + 1.2);
                    }
                    
                    // Amplify the movement for more visible effect
                    depthFactor *= 1.5;
                    
                    const currentTransform = particle.style.transform || '';
                    
                    // Extract current translateY if it exists
                    let currentY = 0;
                    const match = currentTransform.match(/translateY\(([^)]+)px\)/);
                    if (match) {
                        currentY = parseFloat(match[1]);
                    }
                    
                    // Update translateY with scroll effect and depth factor
                    const newY = currentY - (scrollDiff * depthFactor);
                    
                    // Update transform, preserving other transform properties
                    let newTransform = currentTransform.replace(/translateY\([^)]+px\)/, '');
                    newTransform += ` translateY(${newY}px)`;
                    
                    // Apply the transform with no transition for immediate effect
                    particle.style.transition = particle.style.transition.replace(/transform [^,]+,?/, '');
                    particle.style.transform = newTransform;
                });
                
                lastScrollY = window.scrollY;
                ticking = false;
            });
            
            ticking = true;
        }
    });
    
    // Recalculate container height when page content changes
    // This helps ensure particles cover the entire page even as content loads
    const resizeObserver = new ResizeObserver(entries => {
        adjustContainerHeight();
    });
    
    resizeObserver.observe(document.body);
});
