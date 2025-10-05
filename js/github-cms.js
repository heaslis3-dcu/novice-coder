// js/github-cms.js - GitHub-based JSON content management
const GITHUB_USERNAME = 'heaslis3-dcu';
const REPO_NAME = 'novice-coder';
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
            
            // Load posts metadata first
            const metadataResponse = await fetch(`${this.rawBaseURL}/data/posts-metadata.json`);
            if (!metadataResponse.ok) {
                throw new Error(`HTTP error! status: ${metadataResponse.status}`);
            }
            
            const metadata = await metadataResponse.json();
            const postsWithContent = [];
            
            // Load individual post JSON files
            for (const postMeta of metadata.posts) {
                if (postMeta.published !== false) {
                    const postData = await this.getPostData(postMeta.slug);
                    if (postData) {
                        postsWithContent.push(postData);
                    }
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

    async getPostData(slug) {
        try {
            const cacheKey = `post-${slug}`;
            const cached = this.cache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }

            const response = await fetch(`${this.rawBaseURL}/posts/${slug}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const postData = await response.json();
            
            // Validate required fields
            if (!postData.id || !postData.title) {
                throw new Error('Invalid post data structure');
            }
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: postData,
                timestamp: Date.now()
            });
            
            return postData;
        } catch (error) {
            console.error(`Error loading post ${slug}:`, error);
            return null;
        }
    }

    async getPostBySlug(slug) {
        return await this.getPostData(slug);
    }

    async getPostsByCategory(category) {
        const allPosts = await this.getPosts();
        return allPosts.filter(post => post.category === category);
    }

    async getPostsBySkillLevel(level) {
        const allPosts = await this.getPosts();
        return allPosts.filter(post => post.skillLevel === level);
    }

    getLocalFallbackPosts() {
        return [
            {
                id: 1,
                title: "Welcome to The Novice Coder",
                excerpt: "This is a fallback post when GitHub is unavailable. The blog will load normally when connected.",
                content: "This content is loaded locally. Check your internet connection to load the latest posts from GitHub.",
                category: "Getting Started",
                skillLevel: "beginner",
                date: new Date().toISOString().split('T')[0],
                readTime: "1 min read",
                slug: "welcome-fallback",
                published: true,
                tags: ["welcome", "introduction"],
                icon: "👋"
            }
        ];
    }

    clearCache() {
        this.cache.clear();
        console.log('Cache cleared');
    }

    // Utility method to check if we're online
    async checkConnection() {
        try {
            const response = await fetch(`${this.rawBaseURL}/data/posts-metadata.json`, { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Create global instance
window.githubCMS = new GitHubCMS();