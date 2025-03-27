// js/script.js

document.addEventListener('DOMContentLoaded', function() {
    // Get current year for footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // GitHub username - replace with your own
    const githubUsername = 'yourusername';

    // Fetch GitHub repositories
    fetchGitHubRepos(githubUsername);

    // Form submission handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
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
});

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