
// js/github-cms.js - Safe GitHub-based content management
const GITHUB_USERNAME = 'heaslis3-dcu';
const REPO_NAME = 'the-novice-coder-blog';
const REPO_BRANCH = 'main';

class GitHubCMS {
    constructor() {
        this.rawBaseURL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/${REPO_BRANCH}`;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    async getPosts() {
        try {
            console.log('Loading posts from GitHub...');
            
            // Load posts metadata
            const metadataResponse = await fetch(`${this.rawBaseURL}/data/posts-metadata.json`);
            if (!metadataResponse.ok) {
                throw new Error(`HTTP error! status: ${metadataResponse.status}`);
            }
            
            const metadata = await metadataResponse.json();
            const postsWithContent = [];
            
            // Load content for each post
            for (const postMeta of metadata.posts) {
                if (postMeta.published !== false) {
                    const content = await this.getPostContent(postMeta.slug);
                    postsWithContent.push({
                        ...postMeta,
                        content: content
                    });
                }
            }
            
            // Sort by date, newest first
            return postsWithContent.sort((a, b) => new Date(b.date) - new Date(a.date));
            
        } catch (error) {
            console.error('Error loading posts from GitHub:', error);
            // Fallback to local data
            return this.getLocalFallbackPosts();
        }
    }

    async getPostContent(slug) {
        try {
            const cacheKey = `post-${slug}`;
            const cached = this.cache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }

            const response = await fetch(`${this.rawBaseURL}/posts/${slug}.md`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const content = await response.text();
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: content,
                timestamp: Date.now()
            });
            
            return content;
        } catch (error) {
            console.error(`Error loading post ${slug}:`, error);
            return '# Post content not available\n\nPlease check your internet connection.';
        }
    }

    getLocalFallbackPosts() {
        return [
            {
                id: 1,
                title: "Welcome to The Novice Coder",
                excerpt: "This is a fallback post when GitHub is unavailable. The blog will load normally when connected.",
                content: "# Welcome\n\nThis content is loaded locally. Check your internet connection to load the latest posts from GitHub.",
                category: "Getting Started",
                skillLevel: "beginner",
                date: new Date().toISOString().split('T')[0],
                readTime: "1 min read",
                slug: "welcome-fallback",
                published: true
            }
        ];
    }

    clearCache() {
        this.cache.clear();
        console.log('Cache cleared');
    }
}

// Create global instance
window.githubCMS = new GitHubCMS();