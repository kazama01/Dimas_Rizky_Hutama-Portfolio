// GalaxyBackground effect for web
// Inspired by shadertoy galaxy shaders but implemented with standard web technologies
document.addEventListener('DOMContentLoaded', function() {
    console.log('Galaxy Background initializing...');
    
    // Create a dedicated container for the galaxy effect
    let galaxyContainer = document.getElementById('galaxy-container');
    
    // If container doesn't exist, create it
    if (!galaxyContainer) {
        galaxyContainer = document.createElement('div');
        galaxyContainer.id = 'galaxy-container';
        document.body.insertBefore(galaxyContainer, document.body.firstChild);
    }
    
    // Set styles for galaxy container
    Object.assign(galaxyContainer.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: '-2', // Behind particles
        pointerEvents: 'none',
        backgroundColor: 'transparent'
    });
    
    // Create canvas for galaxy
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Style canvas
    Object.assign(canvas.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%'
    });
    
    // Add canvas to container
    galaxyContainer.appendChild(canvas);
    
    // Galaxy parameters
    const params = {
        starCount: 2000,             // Number of stars
        coreRadius: 0.05,            // Galaxy core radius
        spiralFactor: 3.5,           // How tight the spiral is
        armWidth: 0.4,               // Width of spiral arms
        armCount: 2,                 // Number of spiral arms
        hueRange: [180, 240],        // Hue range for stars (blue-purple range)
        rotationSpeed: 0.00005,      // Rotation speed of galaxy
        parallaxDepth: 3,            // Parallax effect depth multiplier
        mouseInfluence: 0.0003       // How much mouse movement affects the galaxy
    };
    
    // Star array
    let stars = [];
    
    // Mouse tracking for parallax
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    
    // Track mouse position
    document.addEventListener('mousemove', function(e) {
        targetX = e.clientX;
        targetY = e.clientY;
    });
    
    // Initialize stars with galaxy distribution
    function initStars() {
        stars = [];
        
        for (let i = 0; i < params.starCount; i++) {
            // Create stars with spiral galaxy distribution
            
            // Random distance from center (with concentration toward center)
            const distance = Math.pow(Math.random(), 0.5) * 0.9; 
            
            // Random angle
            const angle = Math.random() * Math.PI * 2;
            
            // Add spiral distortion
            const armOffset = (Math.floor(angle / (Math.PI * 2 / params.armCount)) / params.armCount) * Math.PI * 2;
            const spiralAngle = angle + distance * params.spiralFactor + armOffset;
            
            // Distance variation to create arm width
            const armDistMod = 1 - Math.exp(-Math.pow(
                Math.cos(angle * params.armCount - distance * params.spiralFactor) * params.armWidth, 
                2
            ));
            
            const distMod = distance * (1 - params.coreRadius) + params.coreRadius;
            
            // Final position
            const x = Math.cos(spiralAngle) * distance * distMod * armDistMod;
            const y = Math.sin(spiralAngle) * distance * distMod * armDistMod;
            
            // 3D depth effect (z between 0 and 1, with 0 being closest)
            const z = Math.random();
            
            // Star brightness and size based on distance from center
            const brightness = 0.5 + 0.5 * (1 - distance) + Math.random() * 0.2;
            
            // Core stars are brighter and more teal
            const isCore = distance < params.coreRadius * 2;
            
            // Random hue in the blue-teal range
            let hue;
            if (isCore) {
                hue = 180 + Math.random() * 20; // More teal for core
            } else {
                // Full range for arm stars
                hue = params.hueRange[0] + Math.random() * (params.hueRange[1] - params.hueRange[0]);
            }
            
            // Size inversely related to z (closer stars are bigger)
            const size = (0.5 + Math.random() * 1.5) * (1 - z * 0.7);
            
            stars.push({
                x, y, z,
                origX: x,
                origY: y,
                size: size,
                brightness: brightness,
                hue: hue,
                saturation: isCore ? 80 + Math.random() * 20 : 60 + Math.random() * 30,
                twinkleSpeed: 0.01 + Math.random() * 0.03,
                twinkleOffset: Math.random() * Math.PI * 2,
                time: 0
            });
        }
    }
    
    // Draw the galaxy
    function drawGalaxy() {
        // Clear canvas with very subtle gradient background
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width * 0.7
        );
        
        gradient.addColorStop(0, 'rgba(10, 15, 25, 0.3)');
        gradient.addColorStop(0.5, 'rgba(10, 12, 20, 0.2)');
        gradient.addColorStop(1, 'rgba(5, 8, 15, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Smooth mouse movement for parallax
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;
        
        // Calculate mouse offset from center (normalized -1 to 1)
        const offsetX = (mouseX - canvas.width / 2) / (canvas.width / 2);
        const offsetY = (mouseY - canvas.height / 2) / (canvas.height / 2);
        
        // Current time for animations
        const now = performance.now() * 0.001;
        
        // Draw each star
        for (let i = 0; i < stars.length; i++) {
            const star = stars[i];
            
            // Update time for twinkling
            star.time += star.twinkleSpeed;
            
            // Apply rotation over time
            const rotationOffset = now * params.rotationSpeed;
            const distance = Math.sqrt(star.origX * star.origX + star.origY * star.origY);
            const angle = Math.atan2(star.origY, star.origX) + rotationOffset * (1 - distance * 0.5);
            
            // Calculate new position based on original position plus rotation
            const baseX = Math.cos(angle) * distance;
            const baseY = Math.sin(angle) * distance;
            
            // Add parallax effect based on z (depth) and mouse position
            const parallaxAmount = (1 - star.z) * params.parallaxDepth;
            star.x = baseX + offsetX * parallaxAmount * params.mouseInfluence * canvas.width;
            star.y = baseY + offsetY * parallaxAmount * params.mouseInfluence * canvas.height;
            
            // Twinkling effect
            const twinkle = 0.7 + 0.3 * Math.sin(star.time + star.twinkleOffset);
            
            // Scale positions to screen
            const screenX = (star.x * 0.5 + 0.5) * canvas.width;
            const screenY = (star.y * 0.5 + 0.5) * canvas.height;
            
            // Calculate final brightness with twinkling
            const finalBrightness = star.brightness * twinkle;
            
            // Draw the star glow (larger stars have glow)
            if (star.size > 1.2 || distance < params.coreRadius * 2) {
                const glowSize = star.size * (2.5 + Math.sin(star.time) * 0.5);
                const gradient = ctx.createRadialGradient(
                    screenX, screenY, 0,
                    screenX, screenY, glowSize * 4
                );
                
                const starColor = `hsla(${star.hue}, ${star.saturation}%, 70%, ${finalBrightness * 0.4})`;
                gradient.addColorStop(0, starColor);
                gradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(screenX, screenY, glowSize * 4, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw the star
            ctx.fillStyle = `hsla(${star.hue}, ${star.saturation}%, ${60 + finalBrightness * 40}%, ${finalBrightness})`;
            ctx.beginPath();
            ctx.arc(screenX, screenY, star.size * twinkle, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initStars();
    });
    
    // Animation loop
    function animate() {
        drawGalaxy();
        requestAnimationFrame(animate);
    }
    
    // Initialize and start animation
    initStars();
    animate();
    
    console.log('Galaxy Background initialized');
});