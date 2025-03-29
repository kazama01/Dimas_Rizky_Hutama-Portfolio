class SpaceBackground {
  constructor() {
    this.initialized = false;
    
    // Updated default configuration
    this.config = {
      zIndex: -10,  // Changed from -2 to -10
      nebulaOpacity: 0.55, // Changed from 0.3 to 0.55
      nebulaFilter: 'hue-rotate(240deg) saturate(150%)',
      gradientColors: {
        center: '#1a0b2e',
        middle: '#090422',
        outer: '#020108'
      },
      alpha: 1.0
    };
    
    // Load saved configuration
    this.loadConfig();
    
    // Initialize the background
    this.init();
    
    // Controller removed
  }
  
  init() {
    // Create container for the background
    this.container = document.createElement('div');
    this.container.className = 'space-background';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: ${this.config.zIndex};
      pointer-events: none;
      background: radial-gradient(ellipse at center, 
        ${this.config.gradientColors.center} 0%, 
        ${this.config.gradientColors.middle} 50%, 
        ${this.config.gradientColors.outer} 100%);
      background-attachment: fixed;
    `;
    
    // Create nebula overlay
    this.nebulaOverlay = document.createElement('div');
    this.nebulaOverlay.className = 'nebula-overlay';
    this.nebulaOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url("data:image/svg+xml,%3Csvg viewBox=\'0 0 600 600\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3C/rect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E");
      opacity: ${this.config.nebulaOpacity};
      filter: ${this.config.nebulaFilter};
      mix-blend-mode: overlay;
      pointer-events: none;
    `;
    
    // Add elements to the DOM
    this.container.appendChild(this.nebulaOverlay);
    document.body.appendChild(this.container);
    
    this.initialized = true;
  }
  
  updateStyles() {
    if (!this.initialized) return;
    
    // Update z-index
    this.container.style.zIndex = this.config.zIndex;
    
    // No need for special alpha handling now since HTML background is transparent
    // Just use the user-configured alpha value
    
    // Update background gradient with alpha
    const centerColor = this.hexToRgba(this.config.gradientColors.center, this.config.alpha);
    const middleColor = this.hexToRgba(this.config.gradientColors.middle, this.config.alpha);
    const outerColor = this.hexToRgba(this.config.gradientColors.outer, this.config.alpha);
    
    this.container.style.background = `radial-gradient(ellipse at center, 
      ${centerColor} 0%, 
      ${middleColor} 50%, 
      ${outerColor} 100%)`;
    
    // No special blend mode needed
    this.container.style.mixBlendMode = 'normal';
    
    // Update nebula overlay
    this.nebulaOverlay.style.opacity = this.config.nebulaOpacity;
    this.nebulaOverlay.style.filter = this.config.nebulaFilter;
    
    // Save configuration
    this.saveConfig();
  }
  
  // Helper function to convert hex color to rgba
  hexToRgba(hex, alpha) {
    // Remove the hash at the front if present
    hex = hex.replace(/^#/, '');
    
    // Parse the hex values
    let r, g, b;
    if (hex.length === 3) {
      // 3 digits
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      // 6 digits
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    
    // Return rgba
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  saveConfig() {
    try {
      localStorage.setItem('spaceBackgroundConfig', JSON.stringify(this.config));
    } catch (e) {
      console.warn('Could not save space background settings:', e);
    }
  }
  
  loadConfig() {
    try {
      const savedConfig = localStorage.getItem('spaceBackgroundConfig');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }
    } catch (e) {
      console.warn('Could not load space background settings:', e);
    }
  }
}

// Initialize the background when the page loads
window.addEventListener('DOMContentLoaded', () => {
  // Also add a style to ensure body background is transparent
  document.body.style.backgroundColor = 'transparent';
  
  new SpaceBackground();
});
