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
    
    // Configuration options for particle system - can be adjusted
    const config = {
        particleCount: 400,      // Number of stars
        dustCloudCount: 300,     // Number of dust particles
        floatingRate: 0.3,       // Rate of floating particles (0-1)
        parallaxStrength: 8,     // Multiplier for parallax effect (1-10)
        starBrightness: 0.5,     // Brightness of stars (0-1)
        particleMovement: 0.4    // Movement rate of particles (0-1)
    };
    
    // Add controls to the page if needed
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
    
    // Enhanced particle creation with fade in/out lifecycle
    function createParticle() {
        const particle = document.createElement('div');
        
        // Create distinct star categories for stronger parallax differentiation
        // Determine star type (background, mid, or foreground) with equal distribution
        const starType = Math.floor(Math.random() * 3); // 0, 1, or 2
        
        // Size based on star type - background stars are smaller, foreground stars are larger
        let size;
        let isStar = true;
        
        if (starType === 0) {
            // Background stars (small, move very slowly)
            size = Math.random() * 2 + 0.5;
        } else if (starType === 1) {
            // Mid-distance stars (medium, move moderately)
            size = Math.random() * 3 + 1.5;
        } else {
            // Foreground stars (larger, move faster)
            size = Math.random() * 4 + 2.5;
        }
        
        // Dynamic positioning across the entire viewport
        const posX = Math.random() * 120 - 10; // Allow slight overflow
        const posY = Math.random() * 120 - 10;
        
        // Set dynamic lifespan for particles - varying lifespans for more natural movement
        const lifespan = starType === 0 ? Math.random() * 15000 + 20000 : // Background stars live longer
                         starType === 1 ? Math.random() * 10000 + 10000 : // Mid stars medium lifespan
                         Math.random() * 8000 + 5000; // Foreground stars shorter lifespan
        
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
        
        // Apply styles
        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = '50%';
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.opacity = '0'; // Start invisible
        particle.style.transition = 'opacity 1s ease-in-out';
        particle.style.zIndex = starType + 1; // Layer stars by their types
        
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
        
        // Add glow effect based on the star's color and type
        const glowSize = starType === 2 ? Math.random() * 8 + 4 : Math.random() * 4 + 1;
        particle.style.boxShadow = `0 0 ${glowSize}px 1px ${starColor}`;
        
        // Adjust brightness based on config and star type
        const typeBrightness = parseFloat(particle.dataset.brightness);
        particle.style.opacity = (Math.random() * 0.3 + config.starBrightness * typeBrightness).toString();
        
        // Add pulse animation based on star type - different speeds for different layers
        const animationDuration = starType === 0 ? Math.random() * 6 + 5 : 
                                 starType === 1 ? Math.random() * 4 + 3 : 
                                 Math.random() * 3 + 2;
        
        particle.style.animation = `starPulse ${animationDuration}s ease-in-out infinite`;
        
        // Add random drift movement - slight for background stars, more for foreground
        const movementRangeX = starType === 0 ? 5 : starType === 1 ? 10 : 15;
        const movementRangeY = starType === 0 ? 5 : starType === 1 ? 10 : 15;
        const movementDuration = starType === 0 ? Math.random() * 60 + 60 : 
                                starType === 1 ? Math.random() * 40 + 40 : 
                                Math.random() * 30 + 20;
        
        // Randomize movement timing
        const movementDelay = Math.random() * 5000;
        
        // Apply random slow drift movement
        setTimeout(() => {
            const moveX = (Math.random() * movementRangeX * 2) - movementRangeX;
            const moveY = (Math.random() * movementRangeY * 2) - movementRangeY;
            
            // Smooth transition for movement
            particle.style.transition = `opacity 1s ease-in-out, transform ${movementDuration}s ease-in-out`;
            const currentTransform = particle.style.transform || '';
            particle.style.transform = `${currentTransform} translate(${moveX}px, ${moveY}px)`;
        }, movementDelay);
        
        // Star lifecycle - fade out and reposition after lifespan
        setTimeout(() => {
            // Fade out
            particle.style.opacity = '0';
            
            // Remove and create new star in a different position
            setTimeout(() => {
                particle.remove();
                createParticle(); // Create a replacement at a new random position
            }, 1000);
        }, lifespan);
        
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
        
        // Dust particles move the fastest for extreme parallax
        const parallaxDepth = 1.2 + (1 / size) * 0.4; // Higher values for stronger movement
        
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
        dust.dataset.originalX = posX;
        dust.dataset.originalY = posY; // Store original Y position for parallax calculation
        
        // Random dust color
        const dustColorIndex = Math.floor(Math.random() * dustColors.length);
        dust.style.backgroundColor = dustColors[dustColorIndex];
        
        // Start with zero opacity for fade in
        dust.style.opacity = '0';
        dust.style.transition = 'all 1.5s ease-in-out';
        
        // Randomize movement timing and direction
        const movementDelay = Math.random() * 2000;
        const movementDuration = Math.random() * 20 + 10;
        const moveRange = 20 + (Math.random() * 20);
        
        // Add to container
        container.appendChild(dust);
        
        // Fade in
        setTimeout(() => {
            dust.style.opacity = (Math.random() * 0.15 + 0.05).toString();
            
            // Random initial movement during lifetime
            const moveX = Math.random() * 15 - 7.5;
            const moveY = Math.random() * 15 - 7.5;
            dust.style.transform = `translate(${moveX}px, ${moveY}px)`;
            
            // After initial position, begin drifting
            setTimeout(() => {
                // Apply more significant movement to dust
                const newMoveX = (Math.random() * moveRange * 2) - moveRange;
                const newMoveY = (Math.random() * moveRange * 2) - moveRange;
                
                dust.style.transition = `all ${movementDuration}s ease-in-out`;
                dust.style.transform = `translate(${newMoveX}px, ${newMoveY}px)`;
            }, movementDelay);
        }, 100);
        
        // Start fade out sequence before removal with shorter lifespans for more dynamism
        const lifespan = Math.random() * 6000 + 3000; // 3-9 seconds
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
            const size = isSpecial ? Math.random() * 4 + 2 : Math.random() * 1.5 + 0.5;
            const parallaxDepth = isSpecial ? 0.2 + (size / 10) : 0.35 + (1 / size) * 0.2; // Increased from previous values
            
            // Apply styles
            floatingParticle.style.position = 'absolute';
            floatingParticle.style.zIndex = '2';
            
            // Store parallax depth as a data attribute
            floatingParticle.dataset.parallaxDepth = parallaxDepth;
            floatingParticle.dataset.isfloating = true;
            floatingParticle.dataset.originalY = startY; // Store original Y position for parallax calculation
            
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
        if (config.particleMovement > 0) {
            // Number of particles to reposition based on movement setting
            const starCount = Math.floor(config.particleCount * config.particleMovement * 0.1);
            const dustCount = Math.floor(config.dustCloudCount * config.particleMovement * 0.15);
            
            // Get all stars and choose random ones to move
            const stars = Array.from(container.querySelectorAll('div')).filter(el => el.dataset.isstar === "true");
            for (let i = 0; i < Math.min(starCount, stars.length); i++) {
                const randomIndex = Math.floor(Math.random() * stars.length);
                const star = stars[randomIndex];
                
                // Skip particles that are already transitioning
                if (star.classList.contains('moving')) continue;
                
                // Mark as moving
                star.classList.add('moving');
                
                // Prepare for transition by setting opacity to 0
                star.style.opacity = '0';
                
                // After fading out, reposition
                setTimeout(() => {
                    // New random position
                    const newPosX = Math.random() * 120 - 10;
                    const newPosY = Math.random() * 120 - 10;
                    
                    // Update position
                    star.style.left = `${newPosX}%`;
                    star.style.top = `${newPosY}%`;
                    star.dataset.originalX = newPosX;
                    star.dataset.originalY = newPosY;
                    
                    // Reset transform (clear previous movements)
                    star.style.transform = '';
                    
                    // Fade back in
                    setTimeout(() => {
                        const typeBrightness = parseFloat(star.dataset.brightness || 0.5);
                        star.style.opacity = (Math.random() * 0.3 + config.starBrightness * typeBrightness).toString();
                        star.classList.remove('moving');
                    }, 300);
                }, 500);
                
                // Remove this star from the array to prevent selecting it again
                stars.splice(randomIndex, 1);
            }
            
            // Reposition some dust particles too
            const dusts = Array.from(container.querySelectorAll('div')).filter(el => el.dataset.isdust === "true");
            for (let i = 0; i < Math.min(dustCount, dusts.length); i++) {
                const randomIndex = Math.floor(Math.random() * dusts.length);
                const dust = dusts[randomIndex];
                
                // Skip particles that are already transitioning
                if (dust.classList.contains('moving')) continue;
                
                // Mark as moving
                dust.classList.add('moving');
                
                // Prepare for transition
                dust.style.opacity = '0';
                
                // After fading out, reposition
                setTimeout(() => {
                    // New random position
                    const newPosX = Math.random() * 120 - 10;
                    const newPosY = Math.random() * 120 - 10;
                    
                    // Update position
                    dust.style.left = `${newPosX}%`;
                    dust.style.top = `${newPosY}%`;
                    dust.dataset.originalX = newPosX;
                    dust.dataset.originalY = newPosY;
                    
                    // Reset transform
                    dust.style.transform = '';
                    
                    // Fade back in
                    setTimeout(() => {
                        dust.style.opacity = (Math.random() * 0.15 + 0.05).toString();
                        dust.classList.remove('moving');
                    }, 300);
                }, 500);
                
                // Remove this dust from the array
                dusts.splice(randomIndex, 1);
            }
        }
    }
    
    // Run the reposition function periodically
    setInterval(repositionRandomParticles, 3000);
    
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
            config.particleCount = 240;
            config.dustCloudCount = 150;
            config.floatingRate = 0.3;
            config.parallaxStrength = 3;
            config.starBrightness = 0.5;
            
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
        
        // Add controls to the container
        controlsContent.appendChild(parallaxSlider);
        controlsContent.appendChild(starCountSlider);
        controlsContent.appendChild(dustCountSlider);
        controlsContent.appendChild(floatingRateSlider);
        controlsContent.appendChild(brightnessSlider);
        controlsContent.appendChild(movementSlider);
        controlsContent.appendChild(resetButton);
        
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
