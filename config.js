// config.example.js - Safe configuration template
// Copy this to config.js and fill in your details

const CONFIG = {
    // Site Information
    SITE_NAME: "The Novice Coder",
    SITE_DESCRIPTION: "Beginner-friendly programming tutorials and coding journey",
    SITE_URL: "https://heaslis3-dcu.github.io/the-novice-coder-blog",
    AUTHOR: "heaslis3-dcu",
    
    // GitHub Configuration
    GITHUB_USERNAME: "heaslis3-dcu",
    REPO_NAME: "novice-coder",
    REPO_BRANCH: "main",
    
    // Content Settings
    CONTENT: {
        postsPerPage: 6,
        excerptLength: 150,
        defaultImage: "default-card.jpg",
        postsDirectory: "posts"
    },
    
    // Feature Flags
    FEATURES: {
        search: true,
        categories: true,
        archive: true,
        skillLevels: true,
        analytics: false
    }
};

// Environment-specific settings
const ENV = {
    development: {
        debug: true,
        cacheTimeout: 300000, // 5 minutes
        useLocalData: true
    },
    production: {
        debug: false,
        cacheTimeout: 1800000, // 30 minutes
        useLocalData: false
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ENV };
}