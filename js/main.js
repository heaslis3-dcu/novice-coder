
// js/main.js - Main application logic

class BlogStore {
    constructor() {
        this.state = {
            posts: [],
            categories: [],
            currentPage: 1,
            searchQuery: '',
            activeCategory: null,
            activeSkillLevel: 'beginner',
            loading: false,
            error: null
        };
        this.subscribers = [];
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notifySubscribers();
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    notifySubscribers() {
        this.subscribers.forEach(callback => callback(this.state));
    }
}

const blogStore = new BlogStore();

// Security utility functions
const Security = {
    sanitizeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};

// Initialize the blog
document.addEventListener('DOMContentLoaded', function() {
    initializeBlog();
});

async function initializeBlog() {
    try {
        showLoading();
        
        // Load blog data from GitHub CMS or fallback
        let posts;
        if (window.githubCMS) {
            posts = await window.githubCMS.getPosts();
        } else {
            posts = getLocalFallbackPosts();
        }
        
        blogStore.setState({
            posts: posts,
            categories: [...new Set(posts.map(post => post.category))],
            loading: false
        });

        renderBlog();
        hideLoading();
        
    } catch (error) {
        console.error('Error initializing blog:', error);
        showError('Failed to load blog content. Please check your connection.');
        hideLoading();
    }
}

function renderBlog() {
    const state = blogStore.state;
    loadFeaturedPosts(state.posts);
    loadCategories(state.categories);
    loadArchive(state.posts);
    initializeHoverEffects();
    initializeSearch();
    initializeSkillLevelFilters();
    initializeMobileNavigation();
}

function loadFeaturedPosts(posts) {
    const postsGrid = document.getElementById('posts-grid');
    const recentPosts = posts.slice(0, 6);

    postsGrid.innerHTML = recentPosts.map(post => `
        <article class="post-card" data-post-id="${post.id}" role="article" aria-labelledby="post-title-${post.id}" tabindex="0">
            <div class="card-image" aria-hidden="true">
                <span>${getPostIcon(post.category)}</span>
            </div>
            <div class="card-content">
                <div>
                    <span class="category-tag">${Security.sanitizeHTML(post.category)}</span>
                    <span class="skill-level ${post.skillLevel}">${post.skillLevel}</span>
                </div>
                <h3 id="post-title-${post.id}">${Security.sanitizeHTML(post.title)}</h3>
                <p>${Security.sanitizeHTML(post.excerpt)}</p>
                <div class="card-meta">
                    <time datetime="${post.date}">${formatDate(post.date)}</time>
                    <span>${post.readTime}</span>
                </div>
            </div>
        </article>
    `).join('');

    // Add event listeners to post cards
    document.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', handlePostClick);
        card.addEventListener('keydown', handlePostKeydown);
    });
}

function getPostIcon(category) {
    const icons = {
        'Getting Started': '👋',
        'Python Basics': '🐍',
        'Web Development': '🌐',
        'Tools & Setup': '🛠️',
        'Projects': '🚀',
        'Learning Tips': '💡'
    };
    return icons[category] || '📄';
}

function handlePostClick(event) {
    const postId = this.getAttribute('data-post-id');
    viewPost(postId);
}

function handlePostKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const postId = this.getAttribute('data-post-id');
        viewPost(postId);
    }
}

function viewPost(postId) {
    const post = blogStore.state.posts.find(p => p.id === parseInt(postId));
    if (post) {
        // In a real implementation, this would show a modal or navigate
        alert(`Viewing post: ${post.title}\n\nThis would show the full post content in a real implementation.`);
        
        // Track analytics
        if (typeof window.analytics !== 'undefined') {
            window.analytics.trackPostView(postId);
        }
    }
}

function loadCategories(categories) {
    const categoriesList = document.getElementById('categories-list');
    const footerCategories = document.getElementById('footer-categories');

    categoriesList.innerHTML = categories.map(category => `
        <li><a href="#" data-category="${category}">${Security.sanitizeHTML(category)}</a></li>
    `).join('');

    footerCategories.innerHTML = categories.slice(0, 4).map(category => `
        <li><a href="#" data-category="${category}">${Security.sanitizeHTML(category)}</a></li>
    `).join('');

    // Add category filter event listeners
    document.querySelectorAll('[data-category]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            filterByCategory(category);
        });
    });
}

function initializeSkillLevelFilters() {
    document.querySelectorAll('[data-level]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const level = this.getAttribute('data-level');
            
            // Update active state
            document.querySelectorAll('[data-level]').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
            
            filterBySkillLevel(level);
        });
    });
}

function filterByCategory(category) {
    const state = blogStore.state;
    const filteredPosts = category ? 
        state.posts.filter(post => post.category === category) : 
        state.posts;
    
    blogStore.setState({
        activeCategory: category,
        posts: filteredPosts
    });
    
    loadFeaturedPosts(filteredPosts);
}

function filterBySkillLevel(level) {
    const state = blogStore.state;
    const filteredPosts = level ? 
        state.posts.filter(post => post.skillLevel === level) : 
        state.posts;
    
    blogStore.setState({
        activeSkillLevel: level,
        posts: filteredPosts
    });
    
    loadFeaturedPosts(filteredPosts);
}

function loadArchive(posts) {
    const yearList = document.getElementById('year-list');
    const archiveContent = document.getElementById('archive-content');

    // Get unique years from posts
    const years = [...new Set(posts.map(post => new Date(post.date).getFullYear()))].sort((a, b) => b - a);

    yearList.innerHTML = years.map(year => `
        <li><a href="#" data-year="${year}" class="${year === 2023 ? 'active' : ''}">${year}</a></li>
    `).join('');

    // Load archive content for current year
    loadYearArchive(2023, posts);

    // Add year filter event listeners
    document.querySelectorAll('[data-year]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const year = this.getAttribute('data-year');
            
            // Update active state
            document.querySelectorAll('[data-year]').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
            
            loadYearArchive(year, posts);
        });
    });
}

function loadYearArchive(year, posts) {
    const archiveContent = document.getElementById('archive-content');
    const yearPosts = posts.filter(post => new Date(post.date).getFullYear() == year);
    
    if (yearPosts.length === 0) {
        archiveContent.innerHTML = '<p>No posts found for this year.</p>';
        return;
    }

    // Group posts by month
    const postsByMonth = {};
    yearPosts.forEach(post => {
        const date = new Date(post.date);
        const month = date.toLocaleString('default', { month: 'long' });
        
        if (!postsByMonth[month]) postsByMonth[month] = [];
        postsByMonth[month].push(post);
    });

    archiveContent.innerHTML = Object.keys(postsByMonth).map(month => {
        const posts = postsByMonth[month];
        return `
            <div class="month-section">
                <h3 class="month-title">${month} ${year}</h3>
                <ul class="post-list">
                    ${posts.map(post => `
                        <li><a href="#" data-post-id="${post.id}">${Security.sanitizeHTML(post.title)}</a></li>
                    `).join('')}
                </ul>
            </div>
        `;
    }).join('');

    // Add click event listeners to archive posts
    document.querySelectorAll('#archive-content [data-post-id]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const postId = this.getAttribute('data-post-id');
            viewPost(postId);
        });
    });
}

function initializeSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchBox = document.querySelector('.search-box');

    if (searchBtn && searchBox) {
        searchBtn.addEventListener('click', performSearch);
        searchBox.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function performSearch() {
    const searchTerm = document.querySelector('.search-box').value.toLowerCase().trim();
    
    if (searchTerm) {
        const results = blogStore.state.posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.excerpt.toLowerCase().includes(searchTerm) ||
            post.category.toLowerCase().includes(searchTerm) ||
            (post.content && post.content.toLowerCase().includes(searchTerm))
        );

        if (results.length === 0) {
            alert(`No posts found for "${searchTerm}".`);
        } else {
            // Update UI with search results
            blogStore.setState({ posts: results, searchQuery: searchTerm });
            loadFeaturedPosts(results);
            
            // Update section title
            const sectionTitle = document.querySelector('.section-title');
            if (sectionTitle) {
                sectionTitle.textContent = `Search Results for "${searchTerm}"`;
            }
        }
    } else {
        alert('Please enter a search term.');
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function initializeHoverEffects() {
    document.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

function initializeMobileNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('nav');

    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('active');
        });

        // Close mobile nav when clicking on a link
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
}

function showLoading() {
    const loadingSpinner = document.getElementById('loading-spinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'flex';
    }
    const postsGrid = document.getElementById('posts-grid');
    if (postsGrid) {
        postsGrid.innerHTML = '';
    }
}

function hideLoading() {
    const loadingSpinner = document.getElementById('loading-spinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

function showError(message) {
    const errorBoundary = document.getElementById('error-boundary');
    if (errorBoundary) {
        errorBoundary.querySelector('p').textContent = message;
        errorBoundary.hidden = false;
    }
}

function hideError() {
    const errorBoundary = document.getElementById('error-boundary');
    if (errorBoundary) {
        errorBoundary.hidden = true;
    }
}

function getLocalFallbackPosts() {
    return [
        {
            id: 1,
            title: "Getting Started with Programming",
            excerpt: "Absolute beginner's guide to starting your coding journey. Learn what programming is and how to choose your first language.",
            category: "Getting Started",
            skillLevel: "beginner",
            date: "2023-11-15",
            readTime: "8 min read",
            slug: "getting-started-programming",
            published: true,
            content: "# Getting Started with Programming\n\nWelcome to your coding journey!"
        },
        {
            id: 2,
            title: "Python Basics: Your First Program",
            excerpt: "Learn Python fundamentals with hands-on examples. Perfect for complete beginners with no prior experience.",
            category: "Python Basics",
            skillLevel: "beginner",
            date: "2023-11-10",
            readTime: "12 min read",
            slug: "python-basics-first-program",
            published: true,
            content: "# Python Basics\n\nLearn Python step by step."
        },
        {
            id: 3,
            title: "HTML & CSS: Build Your First Website",
            excerpt: "Step-by-step guide to creating your first webpage. No prior web development knowledge required.",
            category: "Web Development",
            skillLevel: "beginner",
            date: "2023-11-05",
            readTime: "15 min read",
            slug: "html-css-first-website",
            published: true,
            content: "# HTML & CSS Basics\n\nBuild your first website."
        }
    ];
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { blogStore, initializeBlog };
}