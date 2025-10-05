// js/security.js - Security utilities for JSON content
class Security {
    static sanitizeHTML(str) {
        if (!str) return '';
        
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    static escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    static isValidURL(str) {
        try {
            const url = new URL(str);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    }

    static sanitizeUserInput(input) {
        if (typeof input !== 'string') return '';
        
        return input
            .trim()
            .substring(0, 1000) // Limit length
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    static validatePostData(postData) {
        const requiredFields = ['id', 'title', 'excerpt', 'category', 'date'];
        const optionalFields = ['content', 'readTime', 'slug', 'published', 'tags', 'icon', 'skillLevel'];
        
        // Check required fields
        for (const field of requiredFields) {
            if (!postData.hasOwnProperty(field)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        // Validate field types
        if (typeof postData.id !== 'number') {
            throw new Error('Post ID must be a number');
        }
        
        if (typeof postData.title !== 'string' || postData.title.length === 0) {
            throw new Error('Post title must be a non-empty string');
        }
        
        if (typeof postData.excerpt !== 'string') {
            throw new Error('Post excerpt must be a string');
        }
        
        // Validate date format
        if (isNaN(Date.parse(postData.date))) {
            throw new Error('Invalid date format');
        }
        
        return true;
    }

    static sanitizePostData(postData) {
        // Create a sanitized copy
        const sanitized = { ...postData };
        
        // Sanitize string fields
        if (sanitized.title) sanitized.title = this.sanitizeHTML(sanitized.title);
        if (sanitized.excerpt) sanitized.excerpt = this.sanitizeHTML(sanitized.excerpt);
        if (sanitized.content) sanitized.content = this.sanitizeHTML(sanitized.content);
        if (sanitized.category) sanitized.category = this.sanitizeHTML(sanitized.category);
        
        // Ensure boolean fields are properly typed
        if (sanitized.published !== undefined) {
            sanitized.published = Boolean(sanitized.published);
        }
        
        return sanitized;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Security };
}