// Simple, reliable particle system with multi-colored stars and space dust effect
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced space particle system initializing with improved parallax...');
    
    // Get particle container
    const container = document.getElementById('particle-container');
    if (!container) {
        console.error('Particle container not found!');
        return;
    }
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Default configuration options for particle system
    const defaultConfig = {
        particleCount: 400,      // Number of stars
        dustCloudCount: 300,     // Number of dust particles
        floatingRate: 0.3,       // Rate of floating particles (0-1)
        parallaxStrength: 0.5,   // Multiplier for parallax effect (1-10)
        starBrightness: 1,       // Brightness of stars (0-1)
        particleMovement: 0.7    // Movement rate of particles (0-1)
    };
    
    // Load saved configuration from localStorage if available
    let config = loadParticleConfig(defaultConfig);
    
    // Function to save config to localStorage
    function saveParticleConfig(config) {
        try {
            localStorage.setItem('particleConfig', JSON.stringify(config));
            console.log('Particle settings saved to localStorage');
        } catch (e) {
            console.warn('Could not save particle settings to localStorage:', e);
        }
    }
    
    // Function to load config from localStorage
    function loadParticleConfig(defaultConfig) {
        try {
            const savedConfig = localStorage.getItem('particleConfig');
            if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                console.log('Loaded particle settings from localStorage');
                return { ...defaultConfig, ...parsedConfig };
            }
        } catch (e) {
            console.warn('Could not load particle settings from localStorage:', e);
        }
        return { ...defaultConfig };
    }
    
    // Create space background with gradient
    const spaceBackground = document.createElement('div');
    spaceBackground.className = 'space-background';
    spaceBackground.style.position = 'absolute';
    spaceBackground.style.top = '0';
    spaceBackground.style.left = '0';
    spaceBackground.style.width = '100%';
    spaceBackground.style.height = '100%';
    spaceBackground.style.zIndex = '0'; // Below stars
    spaceBackground.style.pointerEvents = 'none';
    
    // Add deep space gradient background
    spaceBackground.style.background = 'radial-gradient(ellipse at center, #1a0b2e 0%, #090422 50%, #020108 100%)';
    
    // Add nebula-like overlay for more visual interest
    const nebulaOverlay = document.createElement('div');
    nebulaOverlay.className = 'nebula-overlay';
    nebulaOverlay.style.position = 'absolute';
    nebulaOverlay.style.top = '0';
    nebulaOverlay.style.left = '0';
    nebulaOverlay.style.width = '100%';
    nebulaOverlay.style.height = '100%';
    nebulaOverlay.style.opacity = '0.3';
    nebulaOverlay.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 600 600\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")';
    nebulaOverlay.style.filter = 'hue-rotate(240deg) saturate(150%)';
    nebulaOverlay.style.mixBlendMode = 'overlay';
    nebulaOverlay.style.zIndex = '0';

    // Add to container first so stars appear above
    container.appendChild(spaceBackground);
    spaceBackground.appendChild(nebulaOverlay);
    
    // Add controls to the page
    addParticleControls(config);
    
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
        
        // Make sure space background covers the full height as well
        spaceBackground.style.height = docHeight + 'px';
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
    
    // Create static particle elements based on config
    const particleCount = config.particleCount;
    const dustCloudCount = config.dustCloudCount;
    
    // First create stars
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }
    
    // Then create dust cloud particles
    for (let i = 0; i < dustCloudCount; i++) {
        createDustParticle();
    }
    
    // Add star shape CSS to the document
    const starStyles = document.createElement('style');
    starStyles.innerHTML = `
        .star-shape {
            clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        }
        
        .tiny-star {
            clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
            transform: scale(0.8);
        }
        
        .dust-particle {
            border-radius: 50%;
        }
        
        @keyframes rotateStar {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
        
        @keyframes twinkleStar {
            0%, 100% {
                opacity: var(--base-opacity, 0.7);
                transform: scale(1) rotate(0deg);
            }
            50% {
                opacity: var(--max-opacity, 1);
                transform: scale(1.2) rotate(45deg);
            }
        }

        /* Set the body background to match our space theme */
        body {
            background-color: #090422; /* Fallback color */
        }
    `;
    document.head.appendChild(starStyles);
    
    // Enhanced particle creation with fade in/out lifecycle and star shapes
    function createParticle() {
        const particle = document.createElement('div');
        
        // Create distinct star categories for stronger parallax differentiation
        // Determine star type (background, mid, or foreground) with equal distribution
        const starType = Math.floor(Math.random() * 3); // 0, 1, or 2
        
        // Size based on star type - increased sizes across all star types
        let size;
        
        if (starType === 0) {
            // Background stars (small, move very slowly) - increased from (2-6) to (3-7)
            size = Math.random() * 4 + 3;
        } else if (starType === 1) {
            // Mid-distance stars (medium, move moderately) - increased from (3-8) to (5-10)
            size = Math.random() * 5 + 5;
        } else {
            // Foreground stars (larger, move faster) - increased from (4-11) to (8-15)
            size = Math.random() * 7 + 8;
        }
        
        // Dynamic positioning across the entire viewport
        const posX = Math.random() * 120 - 10; // Allow slight overflow
        const posY = Math.random() * 120 - 10;
        
        // Set fade-in and fade-out timing for the lifecycle - SPEED UP (reduced all times by ~50%)
        const fadeInTime = starType === 0 ? Math.random() * 1000 + 1500 : 
                          starType === 1 ? Math.random() * 800 + 1000 : 
                          Math.random() * 500 + 500;
        
        const visibleTime = starType === 0 ? Math.random() * 4000 + 8000 : 
                           starType === 1 ? Math.random() * 3000 + 5000 : 
                           Math.random() * 2500 + 2500;
        
        const fadeOutTime = starType === 0 ? Math.random() * 1500 + 1000 : 
                           starType === 1 ? Math.random() * 1000 + 800 : 
                           Math.random() * 500 + 500;
        
        // Set very different parallax depth factors based on star type
        let parallaxDepth;
        
        if (starType === 0) {
            // Background stars (move very slowly)
            parallaxDepth = 0.05 + (Math.random() * 0.05); 
            // Set dimmer brightness for background stars
            particle.dataset.brightness = 0.3;
        } else if (starType === 1) {
            // Mid-distance stars (move moderately)
            parallaxDepth = 0.3 + (Math.random() * 0.2);
            particle.dataset.brightness = 0.6;
        } else {
            // Foreground stars (move faster)
            parallaxDepth = 0.8 + (Math.random() * 0.4);
            particle.dataset.brightness = 0.9;
        }
        
        // Apply styles for star shape
        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.zIndex = starType + 3; // +3 to be above space background (z-index 0-2)
        
        // Apply star shape class instead of border-radius
        // Use different shape classes based on size to ensure visibility
        if (size < 4) {
            // Very small stars remain circular for better visibility
            particle.style.borderRadius = '50%';
        } else {
            // Use star shape for larger particles
            particle.classList.add('star-shape');
            
            // Add rotation to some stars
            if (Math.random() < 0.5) {
                const rotationAngle = Math.floor(Math.random() * 180);
                particle.style.transform = `rotate(${rotationAngle}deg)`;
            }
        }
        
        // Position
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.opacity = '0'; // Start completely invisible
        particle.style.transition = `opacity ${fadeInTime}ms ease-in`; // Initial transition for fade in
        
        // Store parallax depth and type as data attributes
        particle.dataset.parallaxDepth = parallaxDepth;
        particle.dataset.isstar = true;
        particle.dataset.startype = starType;
        particle.dataset.originalX = posX;
        particle.dataset.originalY = posY; // Store original Y position for parallax calculation
        
        // Pick a random color from the star color palette - different color schemes for different layers
        let colorIndex;
        if (starType === 0) {
            // Background stars - blues and whites
            colorIndex = Math.floor(Math.random() * 2) + 4; // Purple and white
        } else if (starType === 1) {
            // Mid-distance stars - teals and yellows
            colorIndex = Math.floor(Math.random() * 2) + 1; // Teal and light teal
        } else {
            // Foreground stars - reds and yellows
            colorIndex = Math.floor(Math.random() * 2) + 2; // Red/coral and yellow
        }
        
        const starColor = starColors[colorIndex];
        particle.style.backgroundColor = starColor;
        
        // Add glow effect based on the star's color and type - INCREASED glow size
        const glowSize = starType === 2 ? Math.random() * 12 + 8 : Math.random() * 8 + 2;
        particle.style.boxShadow = `0 0 ${glowSize}px 2px ${starColor}`;
        
        // Add animation for some stars (twinkle effect)
        if (Math.random() < 0.3) {
            const animationDuration = Math.random() * 4 + 3;
            particle.style.animation = `twinkleStar ${animationDuration}s ease-in-out infinite`;
            
            // Set CSS variables for the animation
            const baseOpacity = Math.random() * 0.3 + config.starBrightness * parseFloat(particle.dataset.brightness || 0.5);
            const maxOpacity = baseOpacity * 1.5;
            particle.style.setProperty('--base-opacity', baseOpacity);
            particle.style.setProperty('--max-opacity', maxOpacity);
        }
        
        // Start completely transparent
        particle.style.opacity = '0';
        
        // Add to container first
        container.appendChild(particle);
        
        // PHASE 1: FADE IN - Start the fade-in after a small random delay
        setTimeout(() => {
            // Calculate the target opacity based on type and config - INCREASED brightness
            const typeBrightness = parseFloat(particle.dataset.brightness || 0.5);
            const targetOpacity = Math.min(1.0, (Math.random() * 0.4 + config.starBrightness * typeBrightness + 0.2));
            
            // Fade in to the target opacity
            particle.style.opacity = targetOpacity.toString();
            
            // PHASE 2: VISIBLE DURATION - After fade in, setup the fade out
            setTimeout(() => {
                // Change the transition duration for fade out
                particle.style.transition = `opacity ${fadeOutTime}ms ease-out`;
                
                // PHASE 3: FADE OUT - Begin fading out
                setTimeout(() => {
                    // Fade to transparent
                    particle.style.opacity = '0';
                    
                    // PHASE 4: REPOSITION - After completely faded out, reposition the particle
                    setTimeout(() => {
                        // Generate new position
                        const newPosX = Math.random() * 120 - 10;
                        const newPosY = Math.random() * 120 - 10;
                        
                        // Turn off transition temporarily to avoid animating the position change
                        particle.style.transition = 'none';
                        
                        // Update position
                        particle.style.left = `${newPosX}%`;
                        particle.style.top = `${newPosY}%`;
                        particle.dataset.originalX = newPosX;
                        particle.dataset.originalY = newPosY;
                        
                        // Reset any transforms
                        particle.style.transform = '';
                        
                        // Force reflow to ensure transition is disabled during position change
                        void particle.offsetWidth;
                        
                        // Restart the cycle with fade in
                        particle.style.transition = `opacity ${fadeInTime}ms ease-in`;
                        
                        // Start the fade in again after a small delay - REDUCED delay
                        setTimeout(() => {
                            particle.style.opacity = targetOpacity.toString();
                            
                            // Set up next fade out
                            setTimeout(() => {
                                particle.style.transition = `opacity ${fadeOutTime}ms ease-out`;
                                
                                setTimeout(() => {
                                    particle.style.opacity = '0';
                                }, visibleTime);
                            }, fadeInTime + 50); // Reduced buffer time
                        }, 50); // Reduced delay
                    }, fadeOutTime + 50); // Reduced wait time
                }, visibleTime);
            }, fadeInTime + 50); // Reduced buffer after fade in
        }, Math.random() * 1500); // Reduced initial delay by 50%
        
        return particle;
    }
    
    // Function to create tiny dust cloud particles
    function createDustParticle() {
        const dust = document.createElement('div');
        
        // Tiny size for dust with more variation
        const size = Math.random() * 1.2 + 0.1;
        
        // Position randomly with more spread
        const posX = Math.random() * 120 - 10; // Allow slight overflow for more natural feel
        const posY = Math.random() * 120 - 10;
        
        // Dust particles move the fastest for extreme parallax
        const parallaxDepth = 1.2 + (1 / size) * 0.4; // Higher values for stronger movement
        
        // Setup fade timings
        const fadeInTime = Math.random() * 1000 + 500;
        const visibleTime = Math.random() * 3000 + 2000;
        const fadeOutTime = Math.random() * 1000 + 500;
        
        // Styling dust - keep dust particles as circles
        dust.style.position = 'absolute';
        dust.style.width = `${size}px`;
        dust.style.height = `${size}px`;
        dust.classList.add('dust-particle');
        dust.style.left = `${posX}%`;
        dust.style.top = `${posY}%`;
        dust.style.zIndex = '2'; // Above background, below stars
        dust.style.opacity = '0'; // Start completely invisible
        dust.style.transition = `opacity ${fadeInTime}ms ease-in`;
        
        // Store parallax depth as a data attribute
        dust.dataset.parallaxDepth = parallaxDepth;
        dust.dataset.isdust = true;
        dust.dataset.originalX = posX;
        dust.dataset.originalY = posY; // Store original Y position for parallax calculation
        
        // Random dust color
        const dustColorIndex = Math.floor(Math.random() * dustColors.length);
        dust.style.backgroundColor = dustColors[dustColorIndex];
        
        // Add to container
        container.appendChild(dust);
        
        // PHASE 1: FADE IN - Start fade in after a small delay
        setTimeout(() => {
            // Target opacity for dust particles
            const targetOpacity = Math.random() * 0.15 + 0.05;
            dust.style.opacity = targetOpacity.toString();
            
            // PHASE 2: VISIBLE DURATION - After fade in, setup fade out
            setTimeout(() => {
                // Change transition for fade out
                dust.style.transition = `opacity ${fadeOutTime}ms ease-out`;
                
                // PHASE 3: FADE OUT
                setTimeout(() => {
                    dust.style.opacity = '0';
                    
                    // PHASE 4: REPOSITION - After fade out, reposition
                    setTimeout(() => {
                        // Generate new position
                        const newPosX = Math.random() * 120 - 10;
                        const newPosY = Math.random() * 120 - 10;
                        
                        // Turn off transition temporarily
                        dust.style.transition = 'none';
                        
                        // Update position
                        dust.style.left = `${newPosX}%`;
                        dust.style.top = `${newPosY}%`;
                        dust.dataset.originalX = newPosX;
                        dust.dataset.originalY = newPosY;
                        
                        // Reset transforms
                        dust.style.transform = '';
                        
                        // Force reflow
                        void dust.offsetWidth;
                        
                        // Restart the cycle with fade in
                        dust.style.transition = `opacity ${fadeInTime}ms ease-in`;
                        
                        // Start the fade in again after a small delay
                        setTimeout(() => {
                            dust.style.opacity = targetOpacity.toString();
                            
                            // Set up next fade out
                            setTimeout(() => {
                                dust.style.transition = `opacity ${fadeOutTime}ms ease-out`;
                                
                                setTimeout(() => {
                                    dust.style.opacity = '0';
                                }, visibleTime);
                            }, fadeInTime + 100);
                        }, 100);
                    }, fadeOutTime + 100);
                }, visibleTime);
            }, fadeInTime + 100);
        }, Math.random() * 2000); // Random initial delay
        
        return dust;
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
    
    // Create occasional floating particles - based on config rate
    setInterval(function() {
        if (Math.random() < config.floatingRate) {
            const floatingParticle = document.createElement('div');
            
            // Random starting position (not just bottom)
            const startX = Math.random() * 100;
            const startY = Math.random() < 0.7 ? 100 : Math.random() * 100;
            
            // Determine particle type - only two types now for simplicity
            const isSpecial = Math.random() < 0.2;
            
            // Set size and corresponding parallax depth factor
            const size = isSpecial ? Math.random() * 6 + 3 : Math.random() * 2 + 0.5;
            const parallaxDepth = isSpecial ? 0.2 + (size / 10) : 0.35 + (1 / size) * 0.2;
            
            // Setup fade timing
            const fadeInTime = isSpecial ? 2000 : 1500;
            const fadeOutTime = isSpecial ? 4000 : 3000;
            
            // Apply styles
            floatingParticle.style.position = 'absolute';
            floatingParticle.style.zIndex = '2';
            floatingParticle.style.opacity = '0'; // Start invisible
            
            // Store parallax depth as a data attribute
            floatingParticle.dataset.parallaxDepth = parallaxDepth;
            floatingParticle.dataset.isfloating = true;
            floatingParticle.dataset.originalY = startY;
            
            if (isSpecial) {
                // Special particles are larger stars
                floatingParticle.style.width = `${size}px`;
                floatingParticle.style.height = `${size}px`;
                
                // Use star shape if large enough
                if (size > 3) {
                    floatingParticle.classList.add('star-shape');
                    
                    // Random rotation
                    const rotationAngle = Math.floor(Math.random() * 180);
                    floatingParticle.style.transform = `rotate(${rotationAngle}deg)`;
                } else {
                    floatingParticle.style.borderRadius = '50%';
                }
                
                const colorIndex = Math.floor(Math.random() * starColors.length);
                floatingParticle.style.backgroundColor = starColors[colorIndex];
                floatingParticle.style.boxShadow = `0 0 4px ${starColors[colorIndex]}`;
            } else {
                // Tiny dust particles remain circular
                floatingParticle.style.width = `${size}px`;
                floatingParticle.style.height = `${size}px`;
                floatingParticle.classList.add('dust-particle');
                
                const dustColorIndex = Math.floor(Math.random() * dustColors.length);
                floatingParticle.style.backgroundColor = dustColors[dustColorIndex];
            }
            
            floatingParticle.style.left = `${startX}%`;
            floatingParticle.style.top = `${startY}%`;
            
            // Initial transition for fade in
            floatingParticle.style.transition = `opacity ${fadeInTime}ms ease-in`;
            
            // Add to DOM
            container.appendChild(floatingParticle);
            
            // Start animation after a small delay - FADE IN first
            setTimeout(() => {
                // Fade in
                floatingParticle.style.opacity = isSpecial ? 
                    (Math.random() * 0.7 + 0.3).toString() : 
                    (Math.random() * 0.2 + 0.05).toString();
                
                // After fade in, begin movement with fade out
                setTimeout(() => {
                    // Calculate end position
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
                    
                    // Slower movement and fade out
                    const moveDuration = isSpecial ? Math.random() * 45 + 30 : Math.random() * 60 + 45;
                    floatingParticle.style.transition = `top ${moveDuration}s linear, left ${moveDuration}s ease-in-out, opacity ${fadeOutTime}ms ease-out`;
                    
                    // Apply movement and fade out
                    floatingParticle.style.left = endX;
                    floatingParticle.style.top = endY;
                    floatingParticle.style.opacity = '0';
                    
                    // Remove the element after animation completes
                    setTimeout(() => {
                        floatingParticle.remove();
                    }, moveDuration * 1000);
                }, fadeInTime + 100);
            }, 100);
        }
    }, 400);
    
    // Force an initial parallax update to position all elements
    setTimeout(updateParallax, 100);
    
    // Enhanced parallax effect on scroll with variable depth for particles
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    // Function to update parallax positions
    function updateParallax() {
        // Get all particles
        const particles = container.querySelectorAll('div');
        
        // Current scroll position
        const scrollY = window.scrollY;
        
        // Apply parallax movement to particles based on scroll position and their depth factor
        particles.forEach(particle => {
            // Get the particle's depth factor from data attribute (or use a default)
            let depthFactor = parseFloat(particle.dataset.parallaxDepth || 0.1);
            
            // Apply different movement behaviors based on particle type
            if (particle.dataset.isstar === "true") {
                // Get star type (0=background, 1=mid, 2=foreground)
                const starType = parseInt(particle.dataset.startype || 0);
                
                // Apply very different movement rates based on star type
                if (starType === 0) {
                    // Background stars move very slowly
                    depthFactor *= 0.2;
                } else if (starType === 1) {
                    // Mid-distance stars move moderately
                    depthFactor *= 1.0;
                } else {
                    // Foreground stars move quickly
                    depthFactor *= 3.0;
                }
            } else if (particle.dataset.isdust === "true") {
                // Dust moves fastest - creates foreground effect
                depthFactor *= 4.0;
            } else if (particle.dataset.isfloating === "true") {
                // Floating particles have more variable movement
                depthFactor *= (Math.random() * 0.5 + 1.2);
            }
            
            // Amplify the movement based on config strength
            depthFactor *= config.parallaxStrength;
            
            // Get original position
            const originalY = parseFloat(particle.dataset.originalY || 0);
            
            // Calculate parallax offset based on scroll position
            const parallaxOffset = scrollY * depthFactor * 0.1;
            
            // Apply transform - using absolute positioning relative to original position
            particle.style.transform = `translateY(${parallaxOffset}px)`;
        });
    }
    
    // Scroll event handler using requestAnimationFrame for performance
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateParallax();
                ticking = false;
            });
            
            ticking = true;
        }
    });
    
    // Periodically reposition some random particles for more dynamic scene
    function repositionRandomParticles() {
        // Removed the random repositioning, since particles now have a natural lifecycle
        // that handles fading in, being visible, fading out, and repositioning
    }
    
    // We don't need to periodically call repositionRandomParticles anymore
    
    // Create controls for adjusting particle count and parallax effect
    function addParticleControls(config) {
        // Create controls container
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
        
        // Toggle button to show/hide the controls
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Particle Controls';
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
                toggleButton.textContent = 'Particle Controls';
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
                labelElement.textContent = label + ': ' + slider.value;
                onChange(parseFloat(slider.value));
                // Save settings whenever a slider changes
                saveParticleConfig(config);
            });
            
            sliderContainer.appendChild(labelElement);
            sliderContainer.appendChild(slider);
            return sliderContainer;
        }
        
        // Add sliders for different particle properties
        const parallaxSlider = createSlider('Parallax Strength', 0, 10, config.parallaxStrength, 0.1, (value) => {
            config.parallaxStrength = value;
            updateParallax();
        });
        
        const starCountSlider = createSlider('Star Count', 50, 500, config.particleCount, 10, (value) => {
            // Store new value
            const newCount = Math.floor(value);
            const diff = newCount - config.particleCount;
            
            if (diff > 0) {
                // Add more stars
                for (let i = 0; i < diff; i++) {
                    createParticle();
                }
            } else if (diff < 0) {
                // Remove stars
                const stars = Array.from(container.querySelectorAll('div')).filter(el => el.dataset.isstar === "true");
                for (let i = 0; i < Math.min(Math.abs(diff), stars.length); i++) {
                    if (stars[i]) stars[i].remove();
                }
            }
            
            config.particleCount = newCount;
        });
        
        const dustCountSlider = createSlider('Dust Count', 0, 300, config.dustCloudCount, 10, (value) => {
            // Store new value
            const newCount = Math.floor(value);
            const diff = newCount - config.dustCloudCount;
            
            if (diff > 0) {
                // Add more dust
                for (let i = 0; i < diff; i++) {
                    createDustParticle();
                }
            } else if (diff < 0) {
                // Remove dust
                const dusts = Array.from(container.querySelectorAll('div')).filter(el => el.dataset.isdust === "true");
                for (let i = 0; i < Math.min(Math.abs(diff), dusts.length); i++) {
                    if (dusts[i]) dusts[i].remove();
                }
            }
            
            config.dustCloudCount = newCount;
        });
        
        const floatingRateSlider = createSlider('Floating Rate', 0, 1, config.floatingRate, 0.05, (value) => {
            config.floatingRate = value;
        });
        
        const brightnessSlider = createSlider('Star Brightness', 0, 1, config.starBrightness, 0.05, (value) => {
            config.starBrightness = value;
            
            // Update brightness of existing stars
            const stars = Array.from(container.querySelectorAll('div')).filter(el => el.dataset.isstar === "true");
            stars.forEach(star => {
                star.style.opacity = (Math.random() * 0.5 + value).toString();
            });
        });
        
        // Add movement rate slider
        const movementSlider = createSlider('Movement Rate', 0, 1, config.particleMovement, 0.05, (value) => {
            config.particleMovement = value;
        });
        
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
            // Reset to default values
            config.particleCount = defaultConfig.particleCount;
            config.dustCloudCount = defaultConfig.dustCloudCount;
            config.floatingRate = defaultConfig.floatingRate;
            config.parallaxStrength = defaultConfig.parallaxStrength;
            config.starBrightness = defaultConfig.starBrightness;
            config.particleMovement = defaultConfig.particleMovement;
            
            // Clear saved settings
            localStorage.removeItem('particleConfig');
            
            // Refresh UI
            container.innerHTML = '';
            
            // Recreate particles
            for (let i = 0; i < config.particleCount; i++) {
                createParticle();
            }
            
            for (let i = 0; i < config.dustCloudCount; i++) {
                createDustParticle();
            }
            
            // Update controls
            controlsContent.innerHTML = '';
            controlsContent.appendChild(parallaxSlider);
            controlsContent.appendChild(starCountSlider);
            controlsContent.appendChild(dustCountSlider);
            controlsContent.appendChild(floatingRateSlider);
            controlsContent.appendChild(brightnessSlider);
            controlsContent.appendChild(movementSlider);
            controlsContent.appendChild(resetButton);
            
            // Update parallax
            updateParallax();
        });
        
        // Add clear cache button
        const clearCacheButton = document.createElement('button');
        clearCacheButton.textContent = 'Clear Saved Settings';
        clearCacheButton.style.backgroundColor = '#666';
        clearCacheButton.style.border = 'none';
        clearCacheButton.style.padding = '5px 10px';
        clearCacheButton.style.borderRadius = '3px';
        clearCacheButton.style.cursor = 'pointer';
        clearCacheButton.style.fontSize = '12px';
        clearCacheButton.style.color = '#fff';
        clearCacheButton.style.width = '100%';
        clearCacheButton.style.marginTop = '10px';
        
        clearCacheButton.addEventListener('click', () => {
            // Clear saved settings
            localStorage.removeItem('particleConfig');
            
            // Show confirmation
            const message = document.createElement('div');
            message.textContent = 'Settings cleared! Refresh to load defaults.';
            message.style.color = '#ff6464';
            message.style.marginTop = '10px';
            message.style.fontSize = '11px';
            message.style.textAlign = 'center';
            
            // Replace the button with the message
            clearCacheButton.parentNode.replaceChild(message, clearCacheButton);
            
            // Remove message after 3 seconds
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.replaceChild(clearCacheButton, message);
                }
            }, 3000);
        });
        
        // Add controls to the container
        controlsContent.appendChild(parallaxSlider);
        controlsContent.appendChild(starCountSlider);
        controlsContent.appendChild(dustCountSlider);
        controlsContent.appendChild(floatingRateSlider);
        controlsContent.appendChild(brightnessSlider);
        controlsContent.appendChild(movementSlider);
        controlsContent.appendChild(resetButton);
        controlsContent.appendChild(clearCacheButton);
        
        controlsContainer.appendChild(controlsContent);
        
        // Add controls to the body
        document.body.appendChild(controlsContainer);
    }
    
    // Recalculate container height when page content changes
    // This helps ensure particles cover the entire page even as content loads
    const resizeObserver = new ResizeObserver(entries => {
        adjustContainerHeight();
    });
    
    resizeObserver.observe(document.body);
});
