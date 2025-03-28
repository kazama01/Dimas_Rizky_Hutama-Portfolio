// Simple, reliable particle system for background effect
document.addEventListener('DOMContentLoaded', function() {
    console.log('Basic particle system initializing...');
    
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
    
    // Create static particle elements instead of using canvas
    const particleCount = 80;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }
    
    function createParticle() {
        const particle = document.createElement('div');
        
        // Randomize particle properties
        const size = Math.random() * 4 + 1;
        const isStar = Math.random() < 0.2; // 20% chance to be a "star" particle
        
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
        
        // Different colors for normal particles vs stars
        if (isStar) {
            particle.style.backgroundColor = '#ffffff';
            particle.style.boxShadow = '0 0 10px 2px rgba(100, 255, 218, 0.8)';
            particle.style.opacity = Math.random() * 0.3 + 0.7;
        } else {
            particle.style.backgroundColor = '#64ffda';
            particle.style.opacity = Math.random() * 0.3 + 0.1;
        }
        
        // Apply animation
        particle.style.animation = `
            float ${duration}s linear infinite ${delay}s,
            pulse ${Math.random() * 4 + 2}s ease-in-out infinite
        `;
        
        // Add to container
        container.appendChild(particle);
    }
    
    // Add animation keyframes to document
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes float {
            0% {
                transform: translateY(0) translateX(0) rotate(0deg);
            }
            25% {
                transform: translateY(-${Math.random() * 20 + 10}px) translateX(${Math.random() * 20 - 10}px) rotate(${Math.random() * 20}deg);
            }
            50% {
                transform: translateY(${Math.random() * 20 + 10}px) translateX(${Math.random() * 20 - 10}px) rotate(${Math.random() * 20}deg);
            }
            75% {
                transform: translateY(-${Math.random() * 20 + 10}px) translateX(-${Math.random() * 20 - 10}px) rotate(-${Math.random() * 20}deg);
            }
            100% {
                transform: translateY(0) translateX(0) rotate(0deg);
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
                opacity: 0.5;
            }
            50% {
                transform: scale(1.2);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    console.log('Static particle system initialized');
    
    // Create a few floating particles with random movement
    setInterval(function() {
        if (Math.random() < 0.3) { // 30% chance to add a new floating particle
            const floatingParticle = document.createElement('div');
            
            // Starting position is somewhere at the bottom of the screen
            const startX = Math.random() * 100;
            
            // Apply styles
            floatingParticle.style.position = 'absolute';
            floatingParticle.style.width = `${Math.random() * 3 + 1}px`;
            floatingParticle.style.height = `${Math.random() * 3 + 1}px`;
            floatingParticle.style.backgroundColor = '#64ffda';
            floatingParticle.style.borderRadius = '50%';
            floatingParticle.style.left = `${startX}%`;
            floatingParticle.style.top = '100%';
            floatingParticle.style.opacity = Math.random() * 0.5 + 0.1;
            
            // Float upward animation
            const duration = Math.random() * 15 + 10;
            floatingParticle.style.transition = `top ${duration}s linear, left ${duration}s ease-in-out, opacity ${duration}s ease-in`;
            
            // Add to DOM
            container.appendChild(floatingParticle);
            
            // Start animation after a small delay to ensure the element is rendered
            setTimeout(() => {
                // Random horizontal drift as it rises
                const drift = Math.random() * 20 - 10; // -10% to +10% horizontal drift
                floatingParticle.style.left = `${startX + drift}%`;
                floatingParticle.style.top = '-5%';
                floatingParticle.style.opacity = '0';
                
                // Remove the element after animation completes
                setTimeout(() => {
                    floatingParticle.remove();
                }, duration * 1000);
            }, 10);
        }
    }, 300); // Try to add a new particle roughly every 300ms
});
