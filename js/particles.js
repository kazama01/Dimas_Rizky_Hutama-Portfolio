// Simple, reliable particle system with multi-colored stars and blur effect
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced particle system initializing...');
    
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
    container.style.zIndex = '0';
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
    
    // Normal dust particle colors
    const dustColors = [
        'rgba(100, 255, 218, 0.2)', // Teal base
        'rgba(158, 255, 235, 0.15)', // Light teal
        'rgba(200, 255, 245, 0.1)' // Very light teal
    ];
    
    // Create static particle elements
    const particleCount = 100; // Increased count
    
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }
    
    function createParticle() {
        const particle = document.createElement('div');
        
        // Randomize particle properties
        const isStar = Math.random() < 0.2; // 20% chance to be a "star" particle
        
        // Different size ranges for stars vs dust
        const size = isStar ? Math.random() * 4 + 2 : Math.random() * 3 + 0.5;
        
        // Position randomly within viewport
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        // Set animation duration and delay
        const duration = Math.random() * 60 + 20;
        const delay = Math.random() * 10;
        
        // Apply styles directly to element
        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = '50%';
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        
        // Different styling for stars vs dust particles
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
                float ${duration}s linear infinite ${delay}s,
                starPulse ${Math.random() * 3 + 2}s ease-in-out infinite
            `;
        } else {
            // Regular dust particles
            const dustColorIndex = Math.floor(Math.random() * dustColors.length);
            particle.style.backgroundColor = dustColors[dustColorIndex];
            particle.style.opacity = Math.random() * 0.3 + 0.1;
            
            // Regular animation for dust
            particle.style.animation = `
                float ${duration}s linear infinite ${delay}s,
                pulse ${Math.random() * 4 + 3}s ease-in-out infinite
            `;
        }
        
        // Add to container
        container.appendChild(particle);
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
    `;
    document.head.appendChild(style);
    
    console.log('Multi-colored particle system initialized');
    
    // Create floating particles with enhanced behavior
    setInterval(function() {
        if (Math.random() < 0.4) { // 40% chance to add a new floating particle
            const floatingParticle = document.createElement('div');
            
            // Starting position is somewhere at the bottom of the screen
            const startX = Math.random() * 100;
            
            // Determine if this should be a special particle
            const isSpecial = Math.random() < 0.15; // 15% chance for a special particle
            
            // Apply styles
            floatingParticle.style.position = 'absolute';
            
            if (isSpecial) {
                // Special particles are slightly larger and colored
                const colorIndex = Math.floor(Math.random() * starColors.length);
                floatingParticle.style.width = `${Math.random() * 5 + 2}px`;
                floatingParticle.style.height = `${Math.random() * 5 + 2}px`;
                floatingParticle.style.backgroundColor = starColors[colorIndex];
                floatingParticle.style.boxShadow = `0 0 5px ${starColors[colorIndex]}`;
            } else {
                // Normal floating dust
                floatingParticle.style.width = `${Math.random() * 3 + 1}px`;
                floatingParticle.style.height = `${Math.random() * 3 + 1}px`;
                floatingParticle.style.backgroundColor = '#64ffda';
            }
            
            floatingParticle.style.borderRadius = '50%';
            floatingParticle.style.left = `${startX}%`;
            floatingParticle.style.top = '100%';
            floatingParticle.style.opacity = Math.random() * 0.5 + 0.1;
            
            // Float upward animation with different durations based on type
            const duration = isSpecial ? Math.random() * 20 + 15 : Math.random() * 15 + 10;
            floatingParticle.style.transition = `top ${duration}s linear, left ${duration}s ease-in-out, opacity ${duration}s ease-in, transform ${duration / 4}s ease-in-out`;
            
            // Add to DOM
            container.appendChild(floatingParticle);
            
            // Start animation after a small delay
            setTimeout(() => {
                // Random horizontal drift as it rises
                const drift = Math.random() * 30 - 15; // -15% to +15% horizontal drift
                
                // Add some random rotation for special particles
                if (isSpecial) {
                    floatingParticle.style.transform = `rotate(${Math.random() * 360}deg)`;
                }
                
                floatingParticle.style.left = `${startX + drift}%`;
                floatingParticle.style.top = '-5%';
                floatingParticle.style.opacity = '0';
                
                // Remove the element after animation completes
                setTimeout(() => {
                    floatingParticle.remove();
                }, duration * 1000);
            }, 10);
        }
    }, 250); // Add particles more frequently
});
