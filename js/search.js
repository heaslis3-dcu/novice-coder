// js/search.js - Search functionality for JSON posts
class SearchService {
    constructor() {
        this.index = new Map();
    }

    buildIndex(posts) {
        this.index.clear();
        
        posts.forEach((post, index) => {
            // Combine all searchable text
            const searchableText = `
                ${post.title || ''}
                ${post.excerpt || ''}
                ${post.category || ''}
                ${post.content || ''}
                ${(post.tags || []).join(' ')}
            `.toLowerCase();
            
            // Tokenize the text
            const words = searchableText.split(/\W+/).filter(word => word.length > 2);
            
            // Add to index
            words.forEach(word => {
                if (!this.index.has(word)) {
                    this.index.set(word, new Set());
                }
                this.index.get(word).add(index);
            });
        });
    }

    search(query, posts) {
        if (!query.trim()) return posts;

        const terms = query.toLowerCase().split(/\W+/).filter(term => term.length > 2);
        const results = new Set();
        
        // Simple OR search - any term match
        terms.forEach(term => {
            if (this.index.has(term)) {
                this.index.get(term).forEach(postIndex => {
                    results.add(postIndex);
                });
            }
        });

        // Convert back to post objects
        const resultPosts = Array.from(results).map(index => posts[index]).filter(Boolean);
        
        // If no results from index, fall back to simple filter
        if (resultPosts.length === 0) {
            return posts.filter(post => 
                post.title.toLowerCase().includes(query.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
                post.category.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        return resultPosts;
    }

    // Advanced search with field-specific queries
    advancedSearch(query, posts, options = {}) {
        const { fields = ['title', 'excerpt', 'content', 'category', 'tags'] } = options;
        
        return posts.filter(post => {
            return fields.some(field => {
                if (field === 'tags' && post.tags) {
                    return post.tags.some(tag => 
                        tag.toLowerCase().includes(query.toLowerCase())
                    );
                }
                
                const fieldValue = post[field];
                return fieldValue && 
                       typeof fieldValue === 'string' && 
                       fieldValue.toLowerCase().includes(query.toLowerCase());
            });
        });
    }
}

const searchService = new SearchService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SearchService, searchService };
}
