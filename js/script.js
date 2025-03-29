// js/script.js

document.addEventListener('DOMContentLoaded', function() {
    // Get current year for footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // GitHub username - replace with your own
    const githubUsername = 'yourusername';

    // Fetch GitHub repositories
    fetchGitHubRepos(githubUsername);

    // Initialize scroll progress indicator
    initScrollProgressIndicator();
    
    // Initialize 3D tilt effect
    init3DTiltEffect();

    // Form submission handler - remove the alert for Formspree forms
    const contactForm = document.getElementById('contact-form');
    if (contactForm && !contactForm.getAttribute('action').includes('formspree')) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real implementation, you would send the form data to a server
            // For now, just show a success message
            alert('Thank you for your message! This is a demonstration and the message was not actually sent.');
            contactForm.reset();
        });
    }

    // Smooth scrolling for navigation links
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

    // Email link handler
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const email = this.getAttribute('href').replace('mailto:', '');
            window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank');
        });
    });

    // Handle resume download button click
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Path to the resume file - relative to the website root
            const resumePath = 'Documents/DimasRizky-Resume.pdf';
            
            // Create an anchor element
            const downloadLink = document.createElement('a');
            downloadLink.href = resumePath;
            downloadLink.download = 'DimasRizky-Resume.pdf'; // Set the download filename
            downloadLink.target = '_blank'; // Open in new tab as fallback
            
            // Add a success message
            const message = document.createElement('div');
            message.style.position = 'fixed';
            message.style.top = '20px';
            message.style.left = '50%';
            message.style.transform = 'translateX(-50%)';
            message.style.backgroundColor = 'rgba(100, 255, 218, 0.9)';
            message.style.color = '#121212';
            message.style.padding = '10px 20px';
            message.style.borderRadius = '5px';
            message.style.zIndex = '9999';
            message.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            message.textContent = 'Downloading resume...';
            document.body.appendChild(message);
            
            // Append to the body (required for Firefox)
            document.body.appendChild(downloadLink);
            
            // Programmatically click the link to trigger download
            downloadLink.click();
            
            // Clean up
            document.body.removeChild(downloadLink);
            
            // Remove message after a delay
            setTimeout(() => {
                message.style.opacity = '0';
                message.style.transition = 'opacity 0.5s ease';
                setTimeout(() => document.body.removeChild(message), 500);
            }, 2000);
        });
    }

    // Initialize typewriter effect
    initTypewriterEffect();
});

// Add interactive mouse effect with fixed position tracking
document.addEventListener('mousemove', function(e) {
    let mouseEffect = document.getElementById('mouse-effect');
    if (!mouseEffect) {
        mouseEffect = document.createElement('div');
        mouseEffect.id = 'mouse-effect';
        document.body.appendChild(mouseEffect);
    }
    
    // Use clientX/Y for accurate cursor position
    mouseEffect.style.left = `${e.clientX}px`;
    mouseEffect.style.top = `${e.clientY}px`;
});

// Handle mouse leaving and entering the window
document.addEventListener('mouseleave', function() {
    const mouseEffect = document.getElementById('mouse-effect');
    if (mouseEffect) {
        mouseEffect.style.opacity = '0';
    }
});

document.addEventListener('mouseenter', function(e) {
    const mouseEffect = document.getElementById('mouse-effect');
    if (mouseEffect) {
        mouseEffect.style.opacity = '1';
        mouseEffect.style.left = `${e.clientX}px`;
        mouseEffect.style.top = `${e.clientY}px`;
    }
});

// Add dynamic section transition
document.addEventListener('scroll', function() {
    document.querySelectorAll('section').forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            section.classList.add('visible');
            section.classList.add('enhanced'); // Add enhanced effect when section is in viewport
        } else {
            section.classList.remove('enhanced');
            section.classList.remove('visible');
        }
    });
    
    // Update scroll progress indicator
    updateScrollProgress();
});

// Add fade-in effects for elements as they scroll into view
document.addEventListener('scroll', function() {
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
});

// Enhance hover effects for buttons, links, and images
document.querySelectorAll('button, a, img').forEach(element => {
    element.addEventListener('mouseenter', () => {
        element.style.transition = 'transform 0.3s, box-shadow 0.3s';
        element.style.transform = 'scale(1.05)';
        element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    });
    element.addEventListener('mouseleave', () => {
        element.style.transform = 'scale(1)';
        element.style.boxShadow = 'none';
    });
});

// Function to initialize scroll progress indicator
function initScrollProgressIndicator() {
    // Create the scroll progress elements if they don't exist yet
    if (!document.querySelector('.scroll-progress-container')) {
        const container = document.createElement('div');
        container.className = 'scroll-progress-container';
        
        const bar = document.createElement('div');
        bar.className = 'scroll-progress-bar';
        
        container.appendChild(bar);
        document.body.prepend(container);
    }
    
    // Initial update
    updateScrollProgress();
}

// Function to update scroll progress indicator
function updateScrollProgress() {
    const scrollProgress = document.querySelector('.scroll-progress-bar');
    if (scrollProgress) {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        
        scrollProgress.style.width = `${scrollPercent}%`;
    }
}

// Function to initialize 3D tilt effect
function init3DTiltEffect() {
    // Add tilt effect to gallery items, skill categories, and about image only
    const tiltElements = document.querySelectorAll('.gallery-item, .skill-category, .about-image');

    tiltElements.forEach(element => {
        element.classList.add('tilt-element');

        // Add event listeners for mouse movement
        element.addEventListener('mousemove', handleTiltMove);
        element.addEventListener('mouseleave', handleTiltLeave);
    });
}

// Function to handle mouse movement for tilt effect
function handleTiltMove(e) {
    const element = e.currentTarget;
    const elementRect = element.getBoundingClientRect();
    
    // Calculate mouse position relative to the element
    const x = e.clientX - elementRect.left;
    const y = e.clientY - elementRect.top;
    
    // Calculate position as a percentage of the element's dimensions
    const xPercent = (x / elementRect.width) * 100;
    const yPercent = (y / elementRect.height) * 100;
    
    // Calculate the tilt - maximum tilt of 10 degrees
    const maxTilt = 5;
    const xTilt = (xPercent / 50 - 1) * maxTilt; // -maxTilt to +maxTilt
    const yTilt = (yPercent / 50 - 1) * -maxTilt; // +maxTilt to -maxTilt (inverted)
    
    // Add a subtle "lift" effect
    const scale = 1.02;
    
    // Apply transform
    element.style.transform = `perspective(1000px) rotateX(${yTilt}deg) rotateY(${xTilt}deg) scale(${scale})`;
    
    // Add a subtle sheen/glow effect based on mouse position for some elements
    if (element.classList.contains('gallery-item') || element.classList.contains('about-image')) {
        // Calculate the light position
        const shine = `radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 80%)`;
        
        // Apply the shine effect
        element.style.background = shine;
        
        // Ensure the original background content is visible
        if (element.querySelector('img')) {
            element.querySelector('img').style.position = 'relative';
            element.querySelector('img').style.zIndex = '1';
        }
    }
}

// Function to handle mouse leave for tilt effect
function handleTiltLeave(e) {
    const element = e.currentTarget;
    
    // Reset transform and background
    element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    
    // If it's a gallery item with shine effect, reset it but keep any original background
    if (element.classList.contains('gallery-item') || element.classList.contains('about-image')) {
        element.style.background = '';
    }
}

// Function to fetch GitHub repositories
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

            // Filter out forked repositories (optional)
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

// Function to create a project card
function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card';

    // Create project image placeholder
    const imageDiv = document.createElement('div');
    imageDiv.className = 'project-image';
    
    // If the repo has a homepage, we could try to get a screenshot, but for now just use a placeholder
    imageDiv.innerHTML = `<i class="fas fa-code" style="font-size: 3rem;"></i>`;
    
    // Create project info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'project-info';
    
    // Get languages for the repository (this would require additional API calls in a real implementation)
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
    
    // Append elements to card
    card.appendChild(imageDiv);
    card.appendChild(infoDiv);
    
    return card;
}

// Add typewriter effect to elements with the class 'typewriter'
function initTypewriterEffect() {
    const typewriterElements = document.querySelectorAll('.typewriter');

    typewriterElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        let index = 0;

        function typeCharacter() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(typeCharacter, 100); // Adjust typing speed here
            }
        }

        typeCharacter();
    });
}

// Text reveal with typing effect on scroll
document.addEventListener('DOMContentLoaded', () => {
    const revealText = document.querySelector('.reveal-text');
    if (!revealText) return;
    
    // Save original content properly
    const originalContent = revealText.innerHTML;
    revealText.innerHTML = ''; // Clear the text initially

    function simulateTyping() {
        // Create a temporary div to parse the HTML correctly
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalContent;
        
        // Get all paragraphs or create one if none exist
        let paragraphs = tempDiv.querySelectorAll('p');
        
        // If no paragraphs found, wrap content in a paragraph
        if (paragraphs.length === 0) {
            const content = tempDiv.innerHTML;
            tempDiv.innerHTML = `<p>${content}</p>`;
            paragraphs = tempDiv.querySelectorAll('p');
        }
        
        let currentParagraphIndex = 0;
        let cursor = null;
        
        // Function to type a single paragraph
        function typeParagraph() {
            if (currentParagraphIndex >= paragraphs.length) {
                return; // Finished all paragraphs
            }
            
            const paragraphContent = paragraphs[currentParagraphIndex].textContent.trim();
            const para = document.createElement('p');
            para.className = 'typing-paragraph';
            
            // Only add cursor to the last paragraph
            const isLastParagraph = currentParagraphIndex === paragraphs.length - 1;
            
            // Create text span to hold characters
            const textSpan = document.createElement('span');
            para.appendChild(textSpan);
            
            // Add the paragraph to the DOM
            revealText.appendChild(para);
            
            // Create cursor if needed (only for last paragraph)
            if (isLastParagraph) {
                if (cursor) {
                    // Remove any existing cursor first
                    cursor.remove();
                }
                cursor = document.createElement('span');
                cursor.className = 'typing-cursor';
                para.appendChild(cursor);
            }
            
            let charIndex = 0;
            
            // Function to type each character
            function typeChar() {
                if (charIndex < paragraphContent.length) {
                    // Get next character and add it to text span
                    const char = paragraphContent.charAt(charIndex);
                    textSpan.textContent += char;
                    charIndex++;
                    
                    // Schedule next character
                    setTimeout(typeChar, 5);
                } else {
                    // Move to next paragraph
                    currentParagraphIndex++;
                    setTimeout(typeParagraph, 100);
                }
            }
            
            // Start typing characters
            typeChar();
        }
        
        // Begin typing the first paragraph
        typeParagraph();
    }

    function checkIfVisible() {
        const rect = revealText.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        
        if (rect.top <= windowHeight * 0.8) {
            simulateTyping();
            window.removeEventListener('scroll', checkIfVisible);
        }
    }
    
    // Check visibility immediately
    if (revealText.getBoundingClientRect().top <= window.innerHeight * 0.8) {
        simulateTyping();
    } else {
        window.addEventListener('scroll', checkIfVisible);
    }
});

// Ensure "Download Resume" is treated as a button
document.addEventListener('DOMContentLoaded', () => {
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const resumePath = 'Documents/DimasRizky-Resume.pdf';
            
            // Create a download notification
            const message = document.createElement('div');
            message.style.position = 'fixed';
            message.style.top = '20px';
            message.style.left = '50%';
            message.style.transform = 'translateX(-50%)';
            message.style.backgroundColor = 'rgba(100, 255, 218, 0.9)';
            message.style.color = '#121212';
            message.style.padding = '10px 20px';
            message.style.borderRadius = '5px';
            message.style.zIndex = '9999';
            message.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            message.textContent = 'Downloading resume...';
            document.body.appendChild(message);
            
            // Create an iframe that will handle the download without navigating
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.onload = function() {
                // After iframe loads, remove it from the DOM
                setTimeout(() => document.body.removeChild(iframe), 1000);
            };
            
            // Set iframe source to the PDF file
            document.body.appendChild(iframe);
            iframe.src = resumePath;
            
            // Remove message after a delay
            setTimeout(() => {
                message.style.opacity = '0';
                message.style.transition = 'opacity 0.5s ease';
                setTimeout(() => document.body.removeChild(message), 500);
            }, 2000);
        });
    }
});