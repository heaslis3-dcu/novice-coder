
/*
Log console in browser - testing JavaScript file is loading correctly
// main.js - Add this at the VERY TOP
console.log('=== MAIN.JS LOADED ===');
alert('JavaScript is loaded!');

*/

class BlogStore {
    constructor() {
        this.state = {
            posts: [],
            categories: [],
            currentPage: 1,
            searchQuery: '',
            activeCategory: null,
            activeSkillLevel: null,
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
    }
};

// Initialize the blog
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing blog...');
    initializeBlog();
});

async function initializeBlog() {
    try {
        console.log('Starting blog initialization...');
        showLoading();
        
        // Load posts from JSON files
        const posts = await loadPostsFromJSON();
        
        console.log('Posts loaded:', posts);
        
        blogStore.setState({
            posts: posts,
            categories: [...new Set(posts.map(post => post.category))],
            loading: false
        });

        renderBlog();
        hideLoading();
        
    } catch (error) {
        console.error('Error initializing blog:', error);
        showError('Failed to load blog content: ' + error.message);
        hideLoading();
    }
}

//REPLACE loadPostsFromJSON with debug version
// async function loadPostsFromJSON() {
//     try {
//         console.log('=== DEBUG: Starting JSON Load ===');
        
//         // Test if metadata file exists
//         console.log('🔍 Checking metadata file...');
//         const metadataResponse = await fetch('./data/posts-metadata.json');
//         console.log('📁 Metadata response status:', metadataResponse.status);
        
//         if (!metadataResponse.ok) {
//             throw new Error(`Metadata failed: ${metadataResponse.status}`);
//         }
        
//         const metadata = await metadataResponse.json();
//         console.log('✅ Metadata loaded:', metadata);
        
//         // Test if we can load individual posts
//         console.log('🔍 Testing post file loading...');
//         const testPostResponse = await fetch('./posts/getting-started-programming.json');
//         console.log('📄 Test post response status:', testPostResponse.status);
        
//         if (testPostResponse.ok) {
//             const testPost = await testPostResponse.json();
//             console.log('✅ Test post loaded:', testPost.title);
//         } else {
//             console.log('❌ Test post failed to load');
//         }
        
//         // Your existing loading code continues here...
//         const posts = await Promise.all(
//             metadata.posts.map(async (postMeta) => {
//                 try {
//                     console.log(`🔍 Loading: ${postMeta.slug}.json`);
//                     const postResponse = await fetch(`./posts/${postMeta.slug}.json`);
//                     console.log(`📄 ${postMeta.slug} status:`, postResponse.status);
                    
//                     if (postResponse.ok) {
//                         const postData = await postResponse.json();
//                         console.log(`✅ Loaded: ${postData.title}`);
//                         return {
//                             ...postMeta,
//                             ...postData
//                         };
//                     } else {
//                         console.log(`❌ Using fallback for: ${postMeta.slug}`);
//                         return {
//                             ...postMeta,
//                             content: `<p>${postMeta.excerpt}</p><p><em>Full post content coming soon!</em></p>`,
//                             icon: getPostIcon(postMeta.category),
//                             tags: postMeta.tags || []
//                         };
//                     }
//                 } catch (error) {
//                     console.error(`💥 Error loading ${postMeta.slug}:`, error);
//                     return {
//                         ...postMeta,
//                         content: `<p>Error loading post.</p>`,
//                         icon: getPostIcon(postMeta.category),
//                         tags: []
//                     };
//                 }
//             })
//         );
        
//         console.log('🎯 Final posts loaded:', posts.length);
//         console.log('📝 Posts:', posts.map(p => ({ title: p.title, slug: p.slug })));
        
//         return posts.filter(post => post.published !== false)
//                    .sort((a, b) => new Date(b.date) - new Date(a.date));
        
//     } catch (error) {
//         console.error('💥 CRITICAL ERROR in loadPostsFromJSON:', error);
//         console.log('🔄 Using fallback posts');
//         return getLocalFallbackPosts();
//     }
// }

 
async function loadPostsFromJSON() {
    try {
        // Load posts metadata - using your current structure
        const metadataResponse = await fetch('./data/posts-metadata.json');
        if (!metadataResponse.ok) throw new Error('Failed to load posts metadata');
        
        const metadata = await metadataResponse.json();
        
        // Your metadata already contains full post info, but we still need to load individual posts for content
        const posts = await Promise.all(
            metadata.posts.map(async (postMeta) => {
                try {
                    // Try to load the individual post file for full content
                    const postResponse = await fetch(`./posts/${postMeta.slug}.json`);
                    if (postResponse.ok) {
                        const postData = await postResponse.json();
                        // Merge metadata with post data (post data takes precedence)
                        return {
                            ...postMeta, // Your existing metadata
                            ...postData  // Full post content overrides any metadata fields
                        };
                    } else {
                        // If individual post file doesn't exist, use metadata as fallback
                        console.log(`Using metadata for post: ${postMeta.slug}`);
                        return {
                            ...postMeta,
                            content: postMeta.content || `<p>${postMeta.excerpt}</p><p><em>Full post content coming soon!</em></p>`,
                            icon: postMeta.icon || getPostIcon(postMeta.category),
                            tags: postMeta.tags || []
                        };
                    }
                } catch (error) {
                    console.error(`Error loading post ${postMeta.slug}:`, error);
                    // Fallback to metadata only
                    return {
                        ...postMeta,
                        content: postMeta.content || `<p>${postMeta.excerpt}</p><p><em>Full post content coming soon!</em></p>`,
                        icon: postMeta.icon || getPostIcon(postMeta.category),
                        tags: postMeta.tags || []
                    };
                }
            })
        );
        
        return posts
            .filter(post => post.published !== false)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
    } catch (error) {
        console.error('Error loading posts from JSON:', error);
        // Fallback to local posts if JSON loading fails
        return getLocalFallbackPosts();
    }
}


function renderBlog() {
    console.log('Rendering blog...');
    const state = blogStore.state;
    console.log('Current state:', state);
    
    loadFeaturedPosts(state.posts);
    loadCategories(state.categories);
    loadArchive(state.posts);
    initializeHoverEffects();
    initializeSearch();
    initializeSkillLevelFilters();
    initializeMobileNavigation();
}

function loadFeaturedPosts(posts) {
    console.log('Loading featured posts:', posts);
    const postsGrid = document.getElementById('posts-grid');
    
    if (!postsGrid) {
        console.error('Posts grid element not found!');
        return;
    }

    const recentPosts = posts.slice(0, 6);

    postsGrid.innerHTML = recentPosts.map(post => `
        <article class="post-card" data-post-id="${post.id}" role="article" aria-labelledby="post-title-${post.id}" tabindex="0">
            <div class="card-image" aria-hidden="true">
                <span>${post.icon || getPostIcon(post.category)}</span>
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

    console.log('Posts grid updated with', recentPosts.length, 'posts');

    // Add event listeners to post cards
    const postCards = document.querySelectorAll('.post-card');
    console.log('Found post cards:', postCards.length);
    
    postCards.forEach(card => {
        card.addEventListener('click', handlePostClick);
        card.addEventListener('keydown', handlePostKeydown);
        console.log('Event listeners added to card:', card.getAttribute('data-post-id'));
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
    console.log('Card clicked!');
    const postId = this.getAttribute('data-post-id');
    console.log('Post ID:', postId);
    viewPost(postId);
}

function handlePostKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        console.log('Card keyboard activated!');
        const postId = this.getAttribute('data-post-id');
        viewPost(postId);
    }
}
//Replace viewPost code for debugging in browser

// function viewPost(postId) {
//     console.log('=== DEBUG VIEWPOST START ===');
//     console.log('Post ID clicked:', postId);
    
//     const post = blogStore.state.posts.find(p => p.id === parseInt(postId));
    
//     if (post) {
//         console.log('Post found:', post.title);
//         console.log('Content type:', typeof post.content);
//         console.log('Content value:', post.content);
        
//         // Check if content is array and show first item
//         if (Array.isArray(post.content)) {
//             console.log('First content item:', post.content[0]);
//         }
        
//         showPostModal(post);
//     } else {
//         console.log('Post NOT found!');
//     }
//     console.log('=== DEBUG VIEWPOST END ===');
// }

/*
// DEBUG viewPost
function viewPost(postId) {
    alert('DEBUG: Clicked post ID: ' + postId);
    
    const post = blogStore.state.posts.find(p => p.id === parseInt(postId));
    
    if (post) {
        alert('DEBUG: Found post: ' + post.title + '\nContent type: ' + typeof post.content);
        showPostModal(post);
    } else {
        alert('DEBUG: Post not found!');
    }
}
*/

function viewPost(postId) {
    console.log('Viewing post:', postId);
    const post = blogStore.state.posts.find(p => p.id === parseInt(postId));
    if (post) {
        showPostModal(post);
    } else {
        console.error('Post not found:', postId);
        showError('Post not found. Please try again.');
    }
}

/* Updated on 7th October 
FIXED - Checks if content is a string or array
HANDLES: 
[a] HTML Strings (uses original post) and 
[b] Structured Arrays: converts to HTML
IN folder posts/
Trialing
*/
function showPostModal(post) {
    console.log('🔄 Showing modal for post:', post.title);
    console.log('📝 Content type:', typeof post.content);
    console.log('📝 Content value:', post.content);
    
    // Close any existing modal first
    closePostModal();
    
    // Render content based on format
    const renderedContent = renderContent(post.content);
    console.log('🎨 Rendered content:', renderedContent);
    
    // Create modal HTML and display full post content
    const modalHTML = `
        <div class="modal-overlay" id="post-modal" role="dialog" aria-labelledby="modal-title" aria-modal="true">
            <div class="modal-content">
                <button class="modal-close" aria-label="Close modal">×</button>
                <article class="post-full">
                    <header class="post-header">
                        <div class="post-categories">
                            <span class="category-tag">${Security.sanitizeHTML(post.category)}</span>
                            <span class="skill-level ${post.skillLevel}">${post.skillLevel}</span>
                        </div>
                        <h1 id="modal-title">${Security.sanitizeHTML(post.title)}</h1>
                        <div class="post-meta">
                            <time datetime="${post.date}">${formatDate(post.date)}</time>
                            <span>${post.readTime}</span>
                        </div>
                    </header>
                    <div class="post-body">
                        ${renderedContent}
                    </div>
                    <footer class="post-footer">
                        <div class="post-tags">
                            ${post.tags ? post.tags.map(tag => `<span class="post-tag">${Security.sanitizeHTML(tag)}</span>`).join('') : ''}
                        </div>
                    </footer>
                </article>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add CSS for modal if not already present
    addModalStyles();
    
    // Add event listeners for closing modal
    const modal = document.getElementById('post-modal');
    const closeBtn = modal.querySelector('.modal-close');
    
    closeBtn.addEventListener('click', closePostModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closePostModal();
    });
    
    // Add keyboard support
    document.addEventListener('keydown', handleModalKeydown);
    
    // Focus management for accessibility
    closeBtn.focus();
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

function renderContent(content) {
    console.log('🔍 Rendering content:', content);
    
    // If content is already HTML string, return it directly
    if (typeof content === 'string') {
        console.log('📄 Processing as HTML string');
        return content;
    }
    
    // If content is an array of structured objects, convert to HTML
    if (Array.isArray(content)) {
        console.log('🔄 Processing as structured array');
        const result = content.map(item => {
            console.log('📦 Processing item:', item);
            
            if (!item || typeof item !== 'object') {
                console.warn('⚠️ Invalid item:', item);
                return '';
            }
            
            switch(item.type) {
                case 'heading':
                    return `<h${item.level}>${Security.sanitizeHTML(item.text)}</h${item.level}>`;
                case 'paragraph':
                    return `<p>${Security.sanitizeHTML(item.text)}</p>`;
                case 'code':
                    return `<pre><code class="language-${item.language || 'text'}">${Security.sanitizeHTML(item.code)}</code></pre>`;
                case 'list':
                    const tag = item.style === 'ordered' ? 'ol' : 'ul';
                    const items = (item.items || []).map(i => `<li>${Security.sanitizeHTML(i)}</li>`).join('');
                    return `<${tag}>${items}</${tag}>`;
                case 'image':
                    return `<figure><img src="${item.src}" alt="${Security.sanitizeHTML(item.alt || '')}">${item.caption ? `<figcaption>${Security.sanitizeHTML(item.caption)}</figcaption>` : ''}</figure>`;
                case 'quote':
                    return `<blockquote>${Security.sanitizeHTML(item.text)}${item.author ? `<cite>— ${Security.sanitizeHTML(item.author)}</cite>` : ''}</blockquote>`;
                default:
                    console.warn('❌ Unknown content type:', item.type);
                    return `<p>Unknown content type: ${item.type}</p>`;
            }
        }).join('\n');
        
        console.log('✅ Final rendered content:', result);
        return result;
    }
    
    // Fallback for unexpected formats
    console.error('❌ Unsupported content format:', typeof content, content);
    return '<p>Content format not supported.</p>';
}

function renderContent(content) {
    // If content is already HTML string, return it directly
    if (typeof content === 'string') {
        return content;
    }
    
    // If content is an array of structured objects, convert to HTML
    if (Array.isArray(content)) {
        return content.map(item => {
            switch(item.type) {
                case 'heading':
                    return `<h${item.level}>${Security.sanitizeHTML(item.text)}</h${item.level}>`;
                case 'paragraph':
                    return `<p>${Security.sanitizeHTML(item.text)}</p>`;
                case 'code':
                    return `<pre><code class="language-${item.language}">${Security.sanitizeHTML(item.code)}</code></pre>`;
                case 'list':
                    const tag = item.style === 'ordered' ? 'ol' : 'ul';
                    const items = item.items.map(i => `<li>${Security.sanitizeHTML(i)}</li>`).join('');
                    return `<${tag}>${items}</${tag}>`;
                case 'image':
                    return `<figure><img src="${item.src}" alt="${Security.sanitizeHTML(item.alt)}">${item.caption ? `<figcaption>${Security.sanitizeHTML(item.caption)}</figcaption>` : ''}</figure>`;
                case 'quote':
                    return `<blockquote>${Security.sanitizeHTML(item.text)}${item.author ? `<cite>— ${Security.sanitizeHTML(item.author)}</cite>` : ''}</blockquote>`;
                default:
                    return '';
            }
        }).join('\n');
    }
    
    // Fallback for unexpected formats
    return '<p>Content format not supported.</p>';
}

function addModalStyles() {
    // Only add styles if they haven't been added already
    if (document.getElementById('modal-styles')) return;
    
    const modalStyles = `
        <style id="modal-styles">
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(10, 25, 47, 0.95);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
            }
            
            .modal-content {
                background: var(--secondary);
                border: 1px solid rgba(100, 255, 218, 0.3);
                border-radius: var(--border-radius);
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), var(--glow);
            }
            
            .modal-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: rgba(100, 255, 218, 0.1);
                border: 1px solid var(--accent);
                color: var(--accent);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 20px;
                cursor: pointer;
                z-index: 1001;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--transition);
            }
            
            .modal-close:hover {
                background: var(--accent);
                color: var(--primary);
            }
            
            .post-full {
                padding: 40px;
            }
            
            .post-header {
                margin-bottom: 2rem;
                border-bottom: 1px solid rgba(100, 255, 218, 0.2);
                padding-bottom: 1.5rem;
            }
            
            .post-categories {
                display: flex;
                gap: 10px;
                margin-bottom: 1rem;
                flex-wrap: wrap;
            }
            
            .post-full .post-header h1 {
                font-size: 2.5rem;
                margin-bottom: 1rem;
                color: var(--text-primary);
                line-height: 1.2;
            }
            
            .post-meta {
                display: flex;
                gap: 20px;
                color: var(--text-secondary);
                font-size: 0.9rem;
            }
            
            .post-body {
                line-height: 1.7;
                font-size: 1.1rem;
            }
            
            .post-body h1, .post-body h2, .post-body h3, .post-body h4 {
                color: var(--accent);
                margin: 2rem 0 1rem 0;
            }
            
            .post-body h1 { font-size: 2rem; }
            .post-body h2 { font-size: 1.75rem; }
            .post-body h3 { font-size: 1.5rem; }
            .post-body h4 { font-size: 1.25rem; }
            
            .post-body p {
                margin-bottom: 1.5rem;
            }
            
            .post-body ul, .post-body ol {
                margin-bottom: 1.5rem;
                padding-left: 2rem;
            }
            
            .post-body li {
                margin-bottom: 0.5rem;
            }
            
            .post-body code {
                background: rgba(100, 255, 218, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                color: var(--accent);
            }
            
            .post-body pre {
                background: var(--primary);
                border: 1px solid rgba(100, 255, 218, 0.2);
                border-radius: var(--border-radius);
                padding: 1.5rem;
                overflow-x: auto;
                margin: 1.5rem 0;
            }
            
            .post-body pre code {
                background: none;
                padding: 0;
                color: var(--text-primary);
            }
            
            .post-body a {
                color: var(--accent);
                text-decoration: none;
                border-bottom: 1px solid rgba(100, 255, 218, 0.3);
                transition: var(--transition);
            }
            
            .post-body a:hover {
                border-bottom-color: var(--accent);
            }
            
            .post-footer {
                margin-top: 3rem;
                padding-top: 2rem;
                border-top: 1px solid rgba(100, 255, 218, 0.2);
            }
            
            .post-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .post-tag {
                background: rgba(100, 255, 218, 0.1);
                color: var(--accent);
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                border: 1px solid rgba(100, 255, 218, 0.2);
            }
            
            @media (max-width: 768px) {
                .modal-content {
                    margin: 10px;
                    max-height: 95vh;
                }
                
                .post-full {
                    padding: 20px;
                }
                
                .post-full .post-header h1 {
                    font-size: 1.75rem;
                }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', modalStyles);
}

function closePostModal() {
    const modal = document.getElementById('post-modal');
    if (modal) {
        modal.remove();
        document.removeEventListener('keydown', handleModalKeydown);
        document.body.style.overflow = '';
    }
}

function handleModalKeydown(e) {
    if (e.key === 'Escape') {
        closePostModal();
    }
}

function loadCategories(categories) {
    const categoriesList = document.getElementById('categories-list');
    const footerCategories = document.getElementById('footer-categories');

    if (categoriesList) {
        categoriesList.innerHTML = categories.map(category => `
            <li><a href="#" data-category="${category}" class="${blogStore.state.activeCategory === category ? 'active' : ''}">${Security.sanitizeHTML(category)}</a></li>
        `).join('');
    }

    if (footerCategories) {
        footerCategories.innerHTML = categories.slice(0, 4).map(category => `
            <li><a href="#" data-category="${category}">${Security.sanitizeHTML(category)}</a></li>
        `).join('');
    }

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
        activeSkillLevel: null
    });
    
    // Update UI active states
    document.querySelectorAll('[data-category]').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-category') === category);
    });
    
    document.querySelectorAll('[data-level]').forEach(item => {
        item.classList.remove('active');
    });
    
    loadFeaturedPosts(filteredPosts);
    updateSectionTitle(category ? `Category: ${category}` : 'Featured Posts');
}

function filterBySkillLevel(level) {
    const state = blogStore.state;
    const filteredPosts = level ? 
        state.posts.filter(post => post.skillLevel === level) : 
        state.posts;
    
    blogStore.setState({
        activeSkillLevel: level,
        activeCategory: null
    });
    
    // Update UI active states
    document.querySelectorAll('[data-level]').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-level') === level);
    });
    
    document.querySelectorAll('[data-category]').forEach(item => {
        item.classList.remove('active');
    });
    
    loadFeaturedPosts(filteredPosts);
    updateSectionTitle(level ? `Skill Level: ${level}` : 'Featured Posts');
}

function updateSectionTitle(title) {
    const sectionTitle = document.querySelector('.section-title');
    if (sectionTitle) {
        sectionTitle.textContent = title;
    }
}

function loadArchive(posts) {
    const yearList = document.getElementById('year-list');
    const archiveContent = document.getElementById('archive-content');

    if (yearList) {
        // Get unique years from posts
        const years = [...new Set(posts.map(post => new Date(post.date).getFullYear()))].sort((a, b) => b - a);

        yearList.innerHTML = years.map(year => `
            <li><a href="#" data-year="${year}" class="${year === new Date().getFullYear() ? 'active' : ''}">${year}</a></li>
        `).join('');

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

    // Load archive content for current year
    const currentYear = new Date().getFullYear();
    loadYearArchive(currentYear, posts);
}

function loadYearArchive(year, posts) {
    const archiveContent = document.getElementById('archive-content');
    if (!archiveContent) return;
    
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

    // Sort months chronologically
    const sortedMonths = Object.keys(postsByMonth).sort((a, b) => {
        const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return monthOrder.indexOf(b) - monthOrder.indexOf(a);
    });

    archiveContent.innerHTML = sortedMonths.map(month => {
        const posts = postsByMonth[month].sort((a, b) => new Date(b.date) - new Date(a.date));
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
            (post.content && post.content.toLowerCase().includes(searchTerm)) ||
            (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );

        if (results.length === 0) {
            alert(`No posts found for "${searchTerm}".`);
        } else {
            // Update UI with search results
            blogStore.setState({ 
                posts: results, 
                searchQuery: searchTerm,
                activeCategory: null,
                activeSkillLevel: null
            });
            loadFeaturedPosts(results);
            
            // Update section title and clear active filters
            updateSectionTitle(`Search Results for "${searchTerm}"`);
            document.querySelectorAll('[data-category], [data-level]').forEach(item => {
                item.classList.remove('active');
            });
        }
    } else {
        // Reset to all posts if search is empty
        blogStore.setState({ 
            posts: blogStore.state.posts, 
            searchQuery: '',
            activeCategory: null,
            activeSkillLevel: null
        });
        loadFeaturedPosts(blogStore.state.posts);
        updateSectionTitle('Featured Posts');
        document.querySelectorAll('[data-category], [data-level]').forEach(item => {
            item.classList.remove('active');
        });
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
    console.error('Blog error:', message);
    const errorBoundary = document.getElementById('error-boundary');
    if (errorBoundary) {
        errorBoundary.querySelector('p').textContent = message;
        errorBoundary.style.display = 'block';
    }
}

function hideError() {
    const errorBoundary = document.getElementById('error-boundary');
    if (errorBoundary) {
        errorBoundary.style.display = 'none';
    }
}

function getLocalFallbackPosts() {
    return [
        {
            id: 1,
            title: "Getting Started with Programming",
            excerpt: "Absolute beginner's guide to starting your coding journey. Learn what programming is and how to choose your first language.",
            content: "<p>This is a fallback post content. In production, posts would be loaded from JSON files on GitHub.</p>",
            category: "Getting Started",
            skillLevel: "beginner",
            date: "2023-11-15",
            readTime: "8 min read",
            slug: "getting-started-programming",
            published: true,
            tags: ["programming", "beginner", "tutorial"],
            icon: "👋"
        },
        {
            id: 2,
            title: "Python Basics: Your First Program",
            excerpt: "Learn Python fundamentals with hands-on examples. Perfect for complete beginners with no prior experience.",
            content: "<p>This is a fallback post content. In production, posts would be loaded from JSON files on GitHub.</p>",
            category: "Python Basics",
            skillLevel: "beginner",
            date: "2023-11-10",
            readTime: "12 min read",
            slug: "python-basics-first-program",
            published: true,
            tags: ["python", "basics", "tutorial"],
            icon: "🐍"
        },
        {
            id: 3,
            title: "HTML & CSS: Build Your First Website",
            excerpt: "Step-by-step guide to creating your first webpage. No prior web development knowledge required.",
            content: "<p>This is a fallback post content. In production, posts would be loaded from JSON files on GitHub.</p>",
            category: "Web Development",
            skillLevel: "beginner",
            date: "2023-11-05",
            readTime: "15 min read",
            slug: "html-css-first-website",
            published: true,
            tags: ["html", "css", "web development"],
            icon: "🌐"
        }
    ];
}

// Add global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showError('A JavaScript error occurred: ' + e.message);
});

// Export for potential future use
window.BlogStore = BlogStore;
window.blogStore = blogStore;