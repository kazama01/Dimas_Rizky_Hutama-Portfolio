// Main JavaScript functionality for the portfolio website

// Wait for DOM content to be fully loaded before executing code
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
});

/**
 * Initialize the page with all required functionality
 */
function initializePage() {
    // Update footer with current year
    updateFooterYear();
    
    // Setup GitHub projects if applicable
    const githubUsername = 'yourusername';
    fetchGitHubRepos(githubUsername);
    
    // Initialize UI components
    initScrollProgressIndicator();
    init3DTiltEffect();
    initTypewriterEffect();
    initTextRevealAnimation();
}

/**
 * Set up all event listeners for the page
 */
function setupEventListeners() {
    // Form submission handling
    setupFormHandler();
    
    // Smooth scrolling for navigation
    setupSmoothScrolling();
    
    // Email link handler
    setupEmailLinks();
    
    // Resume download functionality
    setupResumeDownload();
    
    // Mouse effect tracking
    setupMouseEffects();
    
    // Section visibility and scroll effects
    setupScrollEffects();
    
    // Hover effects for interactive elements
    setupHoverEffects();
}

/**
 * Update the footer with the current year
 */
function updateFooterYear() {
    document.getElementById('current-year').textContent = new Date().getFullYear();
}

/**
 * Handle form submissions
 */
function setupFormHandler() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm && !contactForm.getAttribute('action').includes('formspree')) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! This is a demonstration and the message was not actually sent.');
            contactForm.reset();
        });
    }
}

/**
 * Setup smooth scrolling for navigation links
 */
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Setup custom handling for email links
 */
function setupEmailLinks() {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const email = this.getAttribute('href').replace('mailto:', '');
            window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank');
        });
    });
}

/**
 * Setup resume download functionality
 */
function setupResumeDownload() {
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', handleResumeDownload);
    }
}

/**
 * Handle the resume download process
 */
function handleResumeDownload(e) {
    e.preventDefault();
    
    // Path to the resume file
    const resumePath = 'Documents/DimasRizky-Resume.pdf';
    
    // Show download notification
    const message = createNotification('Downloading resume...', 'rgba(100, 255, 218, 0.9)');
    document.body.appendChild(message);
    
    // Create and trigger download
    const downloadLink = document.createElement('a');
    downloadLink.href = resumePath;
    downloadLink.download = 'DimasRizky-Resume.pdf';
    downloadLink.target = '_blank';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Remove notification after delay
    setTimeout(() => {
        fadeOutAndRemove(message);
    }, 2000);
}

/**
 * Setup mouse effect tracking
 */
function setupMouseEffects() {
    // Mouse movement tracking
    document.addEventListener('mousemove', updateMouseEffectPosition);
    
    // Mouse enter/leave window
    document.addEventListener('mouseleave', hideMouseEffect);
    document.addEventListener('mouseenter', showMouseEffect);
}

/**
 * Update the position of the mouse effect element
 */
function updateMouseEffectPosition(e) {
    let mouseEffect = document.getElementById('mouse-effect');
    if (!mouseEffect) {
        mouseEffect = document.createElement('div');
        mouseEffect.id = 'mouse-effect';
        document.body.appendChild(mouseEffect);
    }
    
    mouseEffect.style.left = `${e.clientX}px`;
    mouseEffect.style.top = `${e.clientY}px`;
}

/**
 * Hide the mouse effect when mouse leaves window
 */
function hideMouseEffect() {
    const mouseEffect = document.getElementById('mouse-effect');
    if (mouseEffect) {
        mouseEffect.style.opacity = '0';
    }
}

/**
 * Show and position the mouse effect when mouse enters window
 */
function showMouseEffect(e) {
    const mouseEffect = document.getElementById('mouse-effect');
    if (mouseEffect) {
        mouseEffect.style.opacity = '1';
        mouseEffect.style.left = `${e.clientX}px`;
        mouseEffect.style.top = `${e.clientY}px`;
    }
}

/**
 * Setup section visibility and scroll effects
 */
function setupScrollEffects() {
    // Handle section visibility on scroll
    document.addEventListener('scroll', () => {
        updateSectionVisibility();
        updateScrollProgress();
    });
}

/**
 * Update section visibility based on scroll position
 */
function updateSectionVisibility() {
    document.querySelectorAll('section').forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            section.classList.add('visible');
            section.classList.add('enhanced');
        } else {
            section.classList.remove('enhanced');
            section.classList.remove('visible');
        }
    });
}

/**
 * Setup hover effects for interactive elements
 */
function setupHoverEffects() {
    document.querySelectorAll('button, a, img').forEach(element => {
        element.addEventListener('mouseenter', () => {
            applyHoverEffect(element);
        });
        element.addEventListener('mouseleave', () => {
            removeHoverEffect(element);
        });
    });
}

/**
 * Apply hover effect to an element
 */
function applyHoverEffect(element) {
    element.style.transition = 'transform 0.3s, box-shadow 0.3s';
    element.style.transform = 'scale(1.05)';
    element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
}

/**
 * Remove hover effect from an element
 */
function removeHoverEffect(element) {
    element.style.transform = 'scale(1)';
    element.style.boxShadow = 'none';
}

/**
 * Initialize the scroll progress indicator
 */
function initScrollProgressIndicator() {
    if (!document.querySelector('.scroll-progress-container')) {
        const container = document.createElement('div');
        container.className = 'scroll-progress-container';
        
        const bar = document.createElement('div');
        bar.className = 'scroll-progress-bar';
        
        container.appendChild(bar);
        document.body.prepend(container);
    }
    
    updateScrollProgress();
}

/**
 * Update the scroll progress indicator based on current scroll position
 */
function updateScrollProgress() {
    const scrollProgress = document.querySelector('.scroll-progress-bar');
    if (scrollProgress) {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        
        scrollProgress.style.width = `${scrollPercent}%`;
    }
}

/**
 * Initialize 3D tilt effect on designated elements
 */
function init3DTiltEffect() {
    const tiltElements = document.querySelectorAll('.gallery-item, .skill-category, .about-image');

    tiltElements.forEach(element => {
        element.classList.add('tilt-element');
        element.addEventListener('mousemove', handleTiltMove);
        element.addEventListener('mouseleave', handleTiltLeave);
    });
}

/**
 * Handle mouse movement for the tilt effect
 */
function handleTiltMove(e) {
    const element = e.currentTarget;
    const elementRect = element.getBoundingClientRect();
    
    // Calculate mouse position relative to the element
    const x = e.clientX - elementRect.left;
    const y = e.clientY - elementRect.top;
    
    // Calculate position as a percentage
    const xPercent = (x / elementRect.width) * 100;
    const yPercent = (y / elementRect.height) * 100;
    
    // Calculate the tilt angles
    const maxTilt = 5;
    const xTilt = (xPercent / 50 - 1) * maxTilt;
    const yTilt = (yPercent / 50 - 1) * -maxTilt;
    
    // Apply transform
    element.style.transform = `perspective(1000px) rotateX(${yTilt}deg) rotateY(${xTilt}deg) scale(1.02)`;
    
    // Add shine effect for certain elements
    if (element.classList.contains('gallery-item') || element.classList.contains('about-image')) {
        applyShineEffect(element, xPercent, yPercent);
    }
}

/**
 * Apply a shine/highlight effect based on mouse position
 */
function applyShineEffect(element, xPercent, yPercent) {
    const shine = `radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 80%)`;
    element.style.background = shine;
    
    // Ensure the original content remains visible
    if (element.querySelector('img')) {
        element.querySelector('img').style.position = 'relative';
        element.querySelector('img').style.zIndex = '1';
    }
}

/**
 * Handle mouse leave for the tilt effect
 */
function handleTiltLeave(e) {
    const element = e.currentTarget;
    
    // Reset transform and background
    element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    
    if (element.classList.contains('gallery-item') || element.classList.contains('about-image')) {
        element.style.background = '';
    }
}

/**
 * Fetch and display GitHub repositories
 */
function fetchGitHubRepos(username) {
    const projectsContainer = document.getElementById('github-projects');
    if (!projectsContainer) return;

    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`)
        .then(response => {
            if (!response.ok) {
                throw new Error('GitHub API request failed');
            }
            return response.json();
        })
        .then(repos => {
            // Remove loader
            const loader = document.querySelector('.project-loader');
            if (loader) {
                loader.remove();
            }

            // Filter out forked repositories
            const filteredRepos = repos.filter(repo => !repo.fork);
            
            // Display repositories
            filteredRepos.forEach(repo => {
                const card = createProjectCard(repo);
                projectsContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching GitHub repositories:', error);
            
            // Show error message
            const loader = document.querySelector('.project-loader');
            if (loader) {
                loader.textContent = 'Failed to load projects. Please check the console for details.';
            }
        });
}

/**
 * Create a project card for a GitHub repository
 */
function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card';

    // Create project image placeholder
    const imageDiv = document.createElement('div');
    imageDiv.className = 'project-image';
    imageDiv.innerHTML = `<i class="fas fa-code" style="font-size: 3rem;"></i>`;
    
    // Create project info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'project-info';
    
    // Format repository tags
    const tagsHTML = repo.topics && repo.topics.length ? 
        repo.topics.map(topic => `<span class="project-tag">${topic}</span>`).join('') :
        '<span class="project-tag">No tags</span>';
    
    infoDiv.innerHTML = `
        <h3>${repo.name}</h3>
        <p>${repo.description || 'No description available'}</p>
        <div class="project-tags">
            ${tagsHTML}
        </div>
        <div class="project-links">
            <a href="${repo.html_url}" target="_blank"><i class="fab fa-github"></i> View Source</a>
            ${repo.homepage ? `<a href="${repo.homepage}" target="_blank"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
        </div>
    `;
    
    card.appendChild(imageDiv);
    card.appendChild(infoDiv);
    
    return card;
}

/**
 * Initialize typewriter effect for elements with class 'typewriter'
 */
function initTypewriterEffect() {
    const typewriterElements = document.querySelectorAll('.typewriter');

    typewriterElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        animateTypewriter(element, text);
    });
}

/**
 * Animate the typewriter effect on an element
 */
function animateTypewriter(element, text, index = 0, speed = 100) {
    if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(() => animateTypewriter(element, text, index, speed), speed);
    }
}

/**
 * Initialize text reveal animation with typing effect
 */
function initTextRevealAnimation() {
    const revealText = document.querySelector('.reveal-text');
    if (!revealText) return;
    
    // Save original content
    const originalContent = revealText.innerHTML;
    revealText.innerHTML = '';

    function checkVisibility() {
        const rect = revealText.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        
        if (rect.top <= windowHeight * 0.8) {
            simulateTyping(revealText, originalContent);
            window.removeEventListener('scroll', checkVisibility);
        }
    }
    
    // Check visibility immediately or set up scroll listener
    if (revealText.getBoundingClientRect().top <= window.innerHeight * 0.8) {
        simulateTyping(revealText, originalContent);
    } else {
        window.addEventListener('scroll', checkVisibility);
    }
}

/**
 * Simulate typing effect for text reveal
 */
function simulateTyping(container, originalContent) {
    // Parse HTML content correctly
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalContent;
    
    // Get or create paragraphs
    let paragraphs = tempDiv.querySelectorAll('p');
    if (paragraphs.length === 0) {
        tempDiv.innerHTML = `<p>${tempDiv.innerHTML}</p>`;
        paragraphs = tempDiv.querySelectorAll('p');
    }
    
    // Start typing paragraphs in sequence
    typeParagraphSequence(container, paragraphs);
}

/**
 * Type a sequence of paragraphs one after another
 */
function typeParagraphSequence(container, paragraphs, currentIndex = 0, cursor = null) {
    if (currentIndex >= paragraphs.length) return;
    
    const content = paragraphs[currentIndex].textContent.trim();
    const para = document.createElement('p');
    para.className = 'typing-paragraph';
    
    // Create text span for characters
    const textSpan = document.createElement('span');
    para.appendChild(textSpan);
    container.appendChild(para);
    
    // Add cursor to the last paragraph
    const isLastParagraph = currentIndex === paragraphs.length - 1;
    if (isLastParagraph) {
        if (cursor) cursor.remove();
        cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        para.appendChild(cursor);
    }
    
    // Start typing characters
    typeCharacters(textSpan, content, 0, 5, () => {
        currentIndex++;
        setTimeout(() => typeParagraphSequence(container, paragraphs, currentIndex, cursor), 100);
    });
}

/**
 * Type characters one by one with a callback when complete
 */
function typeCharacters(element, text, index = 0, speed = 5, onComplete = null) {
    if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(() => typeCharacters(element, text, index, speed, onComplete), speed);
    } else if (onComplete) {
        onComplete();
    }
}

/**
 * Create a notification element
 */
function createNotification(message, bgColor = 'rgba(100, 255, 218, 0.9)', textColor = '#121212') {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = bgColor;
    notification.style.color = textColor;
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '9999';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    notification.textContent = message;
    return notification;
}

/**
 * Fade out and remove an element
 */
function fadeOutAndRemove(element, duration = 500) {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease`;
    setTimeout(() => element.remove(), duration);
}

// Additional resume download handler with iframe approach for better browser support
document.addEventListener('DOMContentLoaded', () => {
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const resumePath = 'Documents/DimasRizky-Resume.pdf';
            
            // Create a download notification
            const message = createNotification('Downloading resume...', 'rgba(100, 255, 218, 0.9)');
            document.body.appendChild(message);
            
            // Create an iframe for the download
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.onload = function() {
                setTimeout(() => document.body.removeChild(iframe), 1000);
            };
            
            document.body.appendChild(iframe);
            iframe.src = resumePath;
            
            // Remove message after a delay
            setTimeout(() => {
                fadeOutAndRemove(message);
            }, 2000);
        });
    }
});