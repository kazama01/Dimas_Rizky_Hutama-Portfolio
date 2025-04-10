// Simple, reliable particle system with multi-colored stars and space dust effect
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced space particle system initializing with stars only...');
    
    // Get particle container
    const container = document.getElementById('particle-container');
    if (!container) {
        console.error('Particle container not found!');
        return;
    }
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Default configuration options for particle system - removed dust options
    const defaultConfig = {
        particleCount: 600,      // Increased number of stars (was 400)
        floatingRate: 0.3,       // Rate of floating particles (0-1)
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
    container.style.position = 'absolute'; // Keep absolute so stars scroll with the page
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    container.style.zIndex = '0';  
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
        container.style.height = docHeight + 'px'; // Use document height instead of viewport height
        
        // Make sure space background covers the full height as well
        spaceBackground.style.height = docHeight + 'px'; // Match background to document height
    }
    
    // Call initially and on window resize
    adjustContainerHeight();
    window.addEventListener('resize', adjustContainerHeight);
    window.addEventListener('load', adjustContainerHeight); // Also adjust on load to catch all content
    
    // Multi-colored star palette (complementary colors based on teal)
    const starColors = [
        '#64ffda', // Original teal
        '#9effeb', // Light teal
        '#ff6464', // Complementary red/coral
        '#fff064', // Yellow accent
        '#c264ff', // Purple accent
        '#ffffff'  // Pure white for brightest stars
    ];
    
    // Create star elements based on config
    const particleCount = config.particleCount;
    
    // Initialize a particles array to track all created particles
    const particles = [];
    
    // Create stars
    for (let i = 0; i < particleCount; i++) {
        const particle = createParticle();
        if (particle) particles.push(particle);
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
        
        // Create distinct star categories for parallax differentiation
        // Determine star type (background, mid, or foreground) with equal distribution
        const starType = Math.floor(Math.random() * 3); // 0, 1, or 2
        
        // Size based on star type - increased sizes across all star types
        let size;
        
        if (starType === 0) {
            // Background stars (small)
            size = Math.random() * 4 + 3;
        } else if (starType === 1) {
            // Mid-distance stars (medium)
            size = Math.random() * 5 + 5;
        } else {
            // Foreground stars (larger)
            size = Math.random() * 7 + 8;
        }
        
        // Store the original size to use during animations
        const originalSize = size;
        
        // Dynamic positioning across the entire document
        const posX = Math.random() * 120 - 10; // Allow slight overflow
        const posY = Math.random() * document.body.scrollHeight; // Use absolute position in document
        
        // Convert posY to percentage for consistent positioning
        const posYPercent = (posY / document.body.scrollHeight) * 100;
        
        // All stars must have fade in/out animation - adjust timings
        // Make fade timings different for each star type for variety
        const fadeInTime = starType === 0 ? Math.random() * 1000 + 1500 : 
                          starType === 1 ? Math.random() * 800 + 1000 : 
                          Math.random() * 500 + 500;
        
        const visibleTime = starType === 0 ? Math.random() * 4000 + 8000 : 
                           starType === 1 ? Math.random() * 3000 + 5000 : 
                           Math.random() * 2500 + 2500;
        
        const fadeOutTime = starType === 0 ? Math.random() * 1500 + 1000 : 
                           starType === 1 ? Math.random() * 1000 + 800 : 
                           Math.random() * 500 + 500;
        
        // Apply styles for star shape
        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.zIndex = starType + 3; // +3 to be above space background
        
        // Apply star shape class
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
        particle.style.top = `${posYPercent}%`; // Use percentage based on document height
        particle.style.opacity = '0'; // Start completely invisible
        particle.style.transition = `opacity ${fadeInTime}ms ease-in, width ${fadeOutTime}ms ease-out, height ${fadeOutTime}ms ease-out`; // Added size transition
        
        // Store original values for animations
        particle.dataset.originalSize = originalSize;
        particle.dataset.isstar = true;
        particle.dataset.startype = starType;
        particle.dataset.originalX = posX;
        particle.dataset.originalY = posY;
        
        // Random color selection based on star type
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
        
        // Add glow effect based on the star's color and type
        const glowSize = starType === 2 ? Math.random() * 12 + 8 : Math.random() * 8 + 2;
        particle.style.boxShadow = `0 0 ${glowSize}px 2px ${starColor}`;
        
        // Add twinkle animation to all stars (was previously only 30%)
        const animationDuration = Math.random() * 4 + 3;
        particle.style.animation = `twinkleStar ${animationDuration}s ease-in-out infinite`;
        
        // Set CSS variables for the animation
        const baseOpacity = Math.random() * 0.3 + config.starBrightness * (starType === 0 ? 0.3 : starType === 1 ? 0.6 : 0.9);
        const maxOpacity = baseOpacity * 1.5;
        particle.style.setProperty('--base-opacity', baseOpacity);
        particle.style.setProperty('--max-opacity', maxOpacity);
        
        // Start completely transparent
        particle.style.opacity = '0';
        
        // Add to container
        container.appendChild(particle);
        
        // PHASE 1: FADE IN - Start the fade-in after a small random delay
        setTimeout(() => {
            // Calculate the target opacity based on type and config
            const typeBrightness = starType === 0 ? 0.3 : starType === 1 ? 0.6 : 0.9;
            const targetOpacity = Math.min(1.0, (Math.random() * 0.4 + config.starBrightness * typeBrightness + 0.2));
            
            // Fade in to the target opacity
            particle.style.opacity = targetOpacity.toString();
            
            // PHASE 2: VISIBLE DURATION - After fade in, setup the fade out
            setTimeout(() => {
                // Change the transition duration for fade out
                particle.style.transition = `opacity ${fadeOutTime}ms ease-out, width ${fadeOutTime}ms ease-out, height ${fadeOutTime}ms ease-out, box-shadow ${fadeOutTime}ms ease-out`;
                
                // PHASE 3: FADE OUT - Begin fading out
                setTimeout(() => {
                    // Reduce size during fadeout for a nice effect
                    const shrinkSize = originalSize * 0.4;
                    particle.style.width = `${shrinkSize}px`;
                    particle.style.height = `${shrinkSize}px`;
                    
                    // Reduce glow during fadeout
                    particle.style.boxShadow = `0 0 ${glowSize * 0.3}px 1px ${starColor}`;
                    
                    // Fade to transparent
                    particle.style.opacity = '0';
                    
                    // PHASE 4: REPOSITION - After completely faded out, reposition the particle
                    setTimeout(() => {
                        // Generate new position
                        const newPosX = Math.random() * 120 - 10;
                        const newPosY = Math.random() * document.body.scrollHeight;
                        const newPosYPercent = (newPosY / document.body.scrollHeight) * 100;
                        
                        // Reset size, position, and opacity
                        particle.style.transition = 'none';
                        particle.style.width = `${originalSize}px`;
                        particle.style.height = `${originalSize}px`;
                        particle.style.left = `${newPosX}%`;
                        particle.style.top = `${newPosYPercent}%`;
                        particle.style.opacity = '0';
                        
                        // Force reflow and restart the cycle
                        void particle.offsetWidth;
                        particle.style.transition = `opacity ${fadeInTime}ms ease-in, width ${fadeOutTime}ms ease-out, height ${fadeOutTime}ms ease-out`;
                        particle.style.opacity = targetOpacity.toString();
                    }, fadeOutTime + 50);
                }, visibleTime);
            }, fadeInTime + 50);
        }, Math.random() * 1500);
        
        return particle;
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
        // Reduce rate of particle creation for better performance
        if (Math.random() < config.floatingRate * 0.7) { // Reduced by 30%
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
    }, 600); // Increased from 400ms to 600ms
    
    // Force an initial parallax update to position all elements
    setTimeout(() => {
        updateParallax();
    }, 100);
    
    // Variable to track animation frame requests
    let ticking = false;
    
    // Remove the parallax scroll event completely
    window.removeEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Empty the updateParallax function since we don't want parallax effect
    function updateParallax() {
        // Function intentionally left empty - no parallax effect
    }
    
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
        
        // Add sliders for different particle properties - removed dust slider
        const starCountSlider = createSlider('Star Count', 50, 800, config.particleCount, 10, (value) => {
            // Store new value
            const newCount = Math.floor(value);
            const diff = newCount - config.particleCount;
            
            if (diff > 0) {
                // Add more stars
                for (let i = 0; i < diff; i++) {
                    const particle = createParticle();
                    if (particle) particles.push(particle);
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
            config.floatingRate = defaultConfig.floatingRate;
            config.starBrightness = defaultConfig.starBrightness;
            config.particleMovement = defaultConfig.particleMovement;
            
            // Clear saved settings
            localStorage.removeItem('particleConfig');
            
            // Refresh UI
            container.innerHTML = '';
            
            // Add back space background
            container.appendChild(spaceBackground);
            
            // Recreate particles
            for (let i = 0; i < config.particleCount; i++) {
                createParticle();
            }
            
            // Update controls
            controlsContent.innerHTML = '';
            controlsContent.appendChild(starCountSlider);
            controlsContent.appendChild(floatingRateSlider);
            controlsContent.appendChild(brightnessSlider);
            controlsContent.appendChild(movementSlider);
            controlsContent.appendChild(resetButton);
            controlsContent.appendChild(clearCacheButton);
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
        
        // Add controls to the container - removed dust slider
        controlsContent.appendChild(starCountSlider);
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
    
    // Also adjust container on scroll to ensure proper coverage as user scrolls
    document.addEventListener('scroll', function() {
        adjustContainerHeight();
    });
});
