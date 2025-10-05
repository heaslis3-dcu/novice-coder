// js/archive.js - Archive management for JSON posts
class ArchiveManager {
    constructor() {
        this.currentYear = new Date().getFullYear();
    }

    organizeByYear(posts) {
        const archive = {};
        
        posts.forEach(post => {
            const date = new Date(post.date);
            const year = date.getFullYear().toString();
            const month = date.toLocaleString('default', { month: 'long' });
            
            if (!archive[year]) archive[year] = {};
            if (!archive[year][month]) archive[year][month] = [];
            
            archive[year][month].push(post.id);
        });
        
        return archive;
    }

    getRecentPosts(posts, count = 6) {
        return posts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, count);
    }

    getPostsByCategory(posts, category) {
        return posts.filter(post => post.category === category);
    }

    getPostsBySkillLevel(posts, level) {
        return posts.filter(post => post.skillLevel === level);
    }

    getPostsByYear(posts, year) {
        return posts.filter(post => new Date(post.date).getFullYear() === parseInt(year));
    }

    getPostsByMonth(posts, year, month) {
        return posts.filter(post => {
            const postDate = new Date(post.date);
            return postDate.getFullYear() === parseInt(year) && 
                   postDate.toLocaleString('default', { month: 'long' }) === month;
        });
    }

    getAvailableYears(posts) {
        const years = [...new Set(posts.map(post => new Date(post.date).getFullYear()))];
        return years.sort((a, b) => b - a);
    }

    getAvailableCategories(posts) {
        const categories = [...new Set(posts.map(post => post.category))];
        return categories.sort();
    }

    getAvailableSkillLevels(posts) {
        const levels = [...new Set(posts.map(post => post.skillLevel))];
        return levels.sort();
    }

    // Get posts statistics
    getStats(posts) {
        return {
            totalPosts: posts.length,
            categories: this.getAvailableCategories(posts).length,
            years: this.getAvailableYears(posts).length,
            skillLevels: this.getAvailableSkillLevels(posts).length,
            latestPost: posts.length > 0 ? new Date(posts[0].date) : null
        };
    }
}

const archiveManager = new ArchiveManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ArchiveManager, archiveManager };
}
