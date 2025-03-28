// GalaxyBackground effect for web
// Implemented based on Fabrice NEYRET's galaxy shader (August 2013)
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
        zIndex: '-1', // Main background effect
        pointerEvents: 'none',
        backgroundColor: '#0a0c14' // Dark background for galaxy
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
    
    // Add settings control - accessible by pressing 'g'
    const settingsDiv = document.createElement('div');
    Object.assign(settingsDiv.style, {
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        zIndex: '1000',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px',
        color: 'white',
        fontFamily: 'Arial',
        fontSize: '12px',
        display: 'none', // Hidden by default
        border: '1px solid #64ffda'
    });
    
    settingsDiv.innerHTML = `
        <div style="margin-bottom:5px;color:#64ffda;font-weight:bold">Galaxy Settings (Press 'G' to hide)</div>
        <label><input type="checkbox" id="galaxy-dust" checked> Show Dust</label><br>
        <label><input type="checkbox" id="galaxy-stars" checked> Show Stars</label><br>
        <label><input type="checkbox" id="galaxy-bulb" checked> Show Core</label><br>
        <label><input type="checkbox" id="galaxy-arms" checked> Show Arms</label><br>
        <label>Arms: <input type="range" id="galaxy-arm-count" min="2" max="10" value="5"></label><br>
        <label>Dust Detail: <input type="range" id="galaxy-reticulation" min="1" max="6" value="3" step="0.1"></label><br>
        <label>Speed: <input type="range" id="galaxy-speed" min="0" max="100" value="10"></label>
    `;
    
    document.body.appendChild(settingsDiv);
    
    // Toggle settings with 'g' key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'g' || e.key === 'G') {
            settingsDiv.style.display = settingsDiv.style.display === 'none' ? 'block' : 'none';
        }
    });
    
    // Galaxy parameters (directly from the shader)
    const params = {
        RETICULATION: 3.0,      // strength of dust texture
        NB_ARMS: 5.0,           // number of arms
        COMPR: 0.1,             // compression in arms
        SPEED: 0.1,             // rotation speed
        GALAXY_R: 0.5,          // galaxy radius
        BULB_R: 0.25,           // bulb/core radius
        GALAXY_COL: [0.9, 0.9, 1.0],    // galaxy color
        BULB_COL: [1.0, 0.8, 0.8],      // bulb/core color
        SKY_COL: [0.05, 0.15, 0.25],    // background sky color
        
        // Controls
        showDust: true,         // toggle dust visibility
        showStars: true,        // toggle stars visibility
        showBulb: true,         // toggle bulb/core visibility
        showArms: true          // toggle arms visibility
    };
    
    // Create noise textures (as in the shader)
    const noiseSize = 512;
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = noiseSize;
    noiseCanvas.height = noiseSize;
    const noiseCtx = noiseCanvas.getContext('2d');
    
    const stars1Canvas = document.createElement('canvas');
    stars1Canvas.width = noiseSize;
    stars1Canvas.height = noiseSize;
    const stars1Ctx = stars1Canvas.getContext('2d');
    
    const stars2Canvas = document.createElement('canvas');
    stars2Canvas.width = noiseSize;
    stars2Canvas.height = noiseSize;
    const stars2Ctx = stars2Canvas.getContext('2d');
    
    // Generate noise texture (used for gas/dust)
    function generateNoise(ctx, density = 0.5, size = 1) {
        const imgData = ctx.createImageData(noiseSize, noiseSize);
        const data = imgData.data;
        
        for (let y = 0; y < noiseSize; y++) {
            for (let x = 0; x < noiseSize; x++) {
                const i = (y * noiseSize + x) * 4;
                // Use random values for each channel
                const value = Math.random();
                data[i] = data[i+1] = data[i+2] = value * 255;
                data[i+3] = 255; // Alpha
            }
        }
        
        ctx.putImageData(imgData, 0, 0);
        
        // Apply blur for smoother noise
        ctx.filter = `blur(${size}px)`;
        ctx.drawImage(noiseCanvas, 0, 0);
        ctx.filter = 'none';
    }
    
    // Generate star field textures
    function generateStars(ctx, density = 0.005, brightness = 1) {
        const imgData = ctx.createImageData(noiseSize, noiseSize);
        const data = imgData.data;
        
        for (let y = 0; y < noiseSize; y++) {
            for (let x = 0; x < noiseSize; x++) {
                const i = (y * noiseSize + x) * 4;
                // Create sparse bright dots for stars
                const value = Math.random() < density ? brightness : 0;
                data[i] = data[i+1] = data[i+2] = value * 255;
                data[i+3] = 255; // Alpha
            }
        }
        
        ctx.putImageData(imgData, 0, 0);
        
        // Optional blur for star glow
        ctx.filter = 'blur(1px)';
        ctx.drawImage(ctx.canvas, 0, 0);
        ctx.filter = 'none';
    }
    
    // Initialize textures
    function initTextures() {
        generateNoise(noiseCtx, 0.7, 2);
        generateStars(stars1Ctx, 0.005, 1.0);
        generateStars(stars2Ctx, 0.003, 1.0);
    }
    
    // Texture sample functions
    function tex(uv) {
        // Sample from noise texture (MODE=3 - "wires" from shader)
        const tx = Math.abs(uv[0] * 0.1) % 1;
        const ty = Math.abs(uv[1] * 0.1) % 1;
        
        // Get pixel from noise canvas
        try {
            const imgData = noiseCtx.getImageData(
                Math.floor(tx * noiseSize), 
                Math.floor(ty * noiseSize), 
                1, 1
            );
            
            const n = imgData.data[0] / 255;
            
            // MODE 3 = wires (1-abs(2*n-1))
            return 1 - Math.abs(2 * n - 1);
        } catch (e) {
            // Handle potential errors
            console.error('Error sampling texture:', e);
            return 0.5;
        }
    }
    
    // Noise function with rotation and turbulence (like in shader)
    function noise(uv, time) {
        let v = 0;
        let s = 1;
        
        // Apply rotation
        const a = -params.SPEED * time;
        const co = Math.cos(a);
        const si = Math.sin(a);
        
        // Create rotation matrix
        const M = [
            [co, -si],
            [si, co]
        ];
        
        // Multiple octaves of noise (L=7 in shader)
        for (let i = 0; i < 7; i++) {
            // Apply rotation matrix
            const x = M[0][0] * uv[0] + M[0][1] * uv[1];
            const y = M[1][0] * uv[0] + M[1][1] * uv[1];
            
            // Update UV
            uv = [x, y];
            
            // Sample base noise
            const b = tex(uv.map(v => v * s));
            
            // Accumulate with turbulence (pow(b, RETICULATION))
            v += (1 / s) * Math.pow(b, params.RETICULATION);
            
            // Double frequency for next octave
            s *= 2;
        }
        
        return v / 2;
    }
    
    // Sample stars from texture
    function sampleStars(x, y, starsCtx) {
        // Map coordinates to texture space
        const tx = (x * 0.5 + 0.5) % 1;
        const ty = (y * 0.5 + 0.5) % 1;
        
        try {
            // Get pixel from stars canvas
            const imgData = starsCtx.getImageData(
                Math.floor(tx * noiseSize), 
                Math.floor(ty * noiseSize), 
                1, 1
            );
            
            return imgData.data[0] / 255;
        } catch (e) {
            console.error('Error sampling stars:', e);
            return 0;
        }
    }
    
    // Color utility functions
    function mix(color1, color2, factor) {
        return [
            color1[0] * (1 - factor) + color2[0] * factor,
            color1[1] * (1 - factor) + color2[1] * factor,
            color1[2] * (1 - factor) + color2[2] * factor
        ];
    }
    
    function colorToString(color) {
        return `rgb(${Math.floor(color[0] * 255)}, ${Math.floor(color[1] * 255)}, ${Math.floor(color[2] * 255)})`;
    }
    
    // Main rendering function (follows closely the shader mainImage function)
    function drawGalaxy(time) {
        // Update parameters from UI
        updateParams();
        
        // Clear canvas
        ctx.fillStyle = colorToString(params.SKY_COL);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Find center of screen
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Scale factor (adjust for different screen sizes)
        const scale = Math.min(canvas.width, canvas.height) * 0.8;
        
        // Create image data
        const imgData = ctx.createImageData(canvas.width, canvas.height);
        const data = imgData.data;
        
        // Process each pixel (similar to fragment shader)
        for (let y = 0; y < canvas.height; y += 1) {  // Optimization: process every other pixel
            for (let x = 0; x < canvas.width; x += 1) {
                // Convert to normalized coordinates (like in shader)
                const uv = [
                    (x - centerX) / scale,
                    (y - centerY) / scale
                ];
                
                // Calculate pixel color
                const color = calculatePixelColor(uv, time);
                
                // Set pixel data
                const i = (y * canvas.width + x) * 4;
                data[i] = Math.min(255, color[0] * 255);     // R
                data[i+1] = Math.min(255, color[1] * 255);   // G
                data[i+2] = Math.min(255, color[2] * 255);   // B
                data[i+3] = 255;                             // A
            }
        }
        
        // Draw the image data to the canvas
        ctx.putImageData(imgData, 0, 0);
    }
    
    // Calculate pixel color based on shader logic
    function calculatePixelColor(uv, time) {
        // Convert to polar coordinates
        const rho = Math.sqrt(uv[0]*uv[0] + uv[1]*uv[1]);
        const ang = Math.atan2(uv[1], uv[0]);
        
        // Spiral stretching with distance (logarithmic spiral)
        const shear = 2 * Math.log(Math.max(0.001, rho));
        const c = Math.cos(shear);
        const s = Math.sin(shear);
        
        // Rotation matrix for texture sampling
        const R = [
            [c, -s],
            [s, c]
        ];
        
        // Galaxy profile (disk)
        let r = rho / params.GALAXY_R;
        const dens = params.showArms ? Math.exp(-r*r) : 0.3;
        
        // Bulb/core profile
        r = rho / params.BULB_R;
        const bulb = params.showBulb ? Math.exp(-r*r) : 0;
        
        // Arms phase calculation
        const phase = params.NB_ARMS * (ang - shear);
        
        // Arms spirals compression - animating rotation
        const newAng = ang - params.COMPR * Math.cos(phase) + params.SPEED * time;
        
        // Convert back to cartesian for texture sampling
        const newUV = [
            rho * Math.cos(newAng),
            rho * Math.sin(newAng)
        ];
        
        // Stretched texture must be darkened by derivative
        const spires = 1 + params.NB_ARMS * params.COMPR * Math.sin(phase);
        const adjustedDens = dens * 0.7 * spires;
        
        // Gas texture
        let gazTrsp = 1;
        if (params.showDust) {
            // Apply rotation matrix to uv for noise
            const rotatedUV = [
                R[0][0] * newUV[0] + R[0][1] * newUV[1],
                R[1][0] * newUV[0] + R[1][1] * newUV[1]
            ];
            
            const gaz = noise([rotatedUV[0] * 0.09 * 1.2, rotatedUV[1] * 0.09 * 1.2], time);
            gazTrsp = Math.pow(1 - gaz * adjustedDens, 2);
        } else {
            // If dust is disabled, make it fully transparent
            gazTrsp = 1/1.7; // This matches the shader's keyboard shortcut behavior
        }
        
        // Stars effect
        let stars = 0;
        if (params.showStars) {
            // Adapt stars size to display resolution
            const ratio = 0.8;
            const stars1 = sampleStars(uv[0], uv[1], stars1Ctx);
            const stars2 = sampleStars(uv[0], uv[1], stars2Ctx);
            stars = Math.pow(1 - (1 - stars1) * (1 - stars2), 5);
        }
        
        // Mix all components (as in the shader)
        let col = mix(
            params.SKY_COL,
            mix([0, 0, 0], [1.7 * params.GALAXY_COL[0], 1.7 * params.GALAXY_COL[1], 1.7 * params.GALAXY_COL[2]], gazTrsp)
                .map((v, i) => v + 1.2 * stars),
            adjustedDens
        );
        
        // Add bulb/core
        col = mix(col, [1.2 * params.BULB_COL[0], 1.2 * params.BULB_COL[1], 1.2 * params.BULB_COL[2]], bulb);
        
        return col;
    }
    
    // Update parameters from UI
    function updateParams() {
        // Update from controls if available
        if (document.getElementById('galaxy-dust')) {
            params.showDust = document.getElementById('galaxy-dust').checked;
            params.showStars = document.getElementById('galaxy-stars').checked;
            params.showBulb = document.getElementById('galaxy-bulb').checked;
            params.showArms = document.getElementById('galaxy-arms').checked;
            params.NB_ARMS = parseFloat(document.getElementById('galaxy-arm-count').value);
            params.RETICULATION = parseFloat(document.getElementById('galaxy-reticulation').value);
            params.SPEED = parseFloat(document.getElementById('galaxy-speed').value) / 1000;
        }
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    // Show settings prompt on first load
    const settingsPrompt = document.createElement('div');
    Object.assign(settingsPrompt.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.7)',
        color: '#64ffda',
        padding: '10px 20px',
        borderRadius: '5px',
        fontSize: '14px',
        zIndex: '1000',
        opacity: '1',
        transition: 'opacity 0.5s',
        pointerEvents: 'none',
        border: '1px solid #64ffda'
    });
    settingsPrompt.textContent = 'Press "G" to adjust galaxy settings';
    document.body.appendChild(settingsPrompt);
    
    // Hide prompt after 5 seconds
    setTimeout(() => {
        settingsPrompt.style.opacity = '0';
        setTimeout(() => settingsPrompt.remove(), 500);
    }, 5000);
    
    // Initialize textures
    initTextures();
    
    // Animation variables
    let lastTime = 0;
    let animationTime = 0;
    
    // Animation loop
    function animate(timestamp) {
        // Calculate delta time
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;
        
        // Accumulate animation time
        animationTime += dt;
        
        // Draw the galaxy
        drawGalaxy(animationTime);
        
        // Continue animation
        requestAnimationFrame(animate);
    }
    
    // Start animation
    requestAnimationFrame(animate);
    
    console.log('Galaxy Background initialized');
});