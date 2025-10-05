const CONFIG = {
    // Site Information
    SITE_NAME: "The Novice Coder",
    SITE_DESCRIPTION: "Beginner-friendly programming tutorials and coding journey",
    SITE_URL: "https://heaslis3-dcu.github.io/the-novice-coder-blog",
    AUTHOR: "Your Name",
    
    // GitHub Configuration (Safe - these are public)
    GITHUB_USERNAME: "yourusername",
    REPO_NAME: "the-novice-coder-blog",
    REPO_BRANCH: "main",
    
    // Social Media (Optional)
    SOCIAL: {
        github: "https://github.com/heaslis3-dcu",
        linkedin: "https://linkedin.com/in/sean-heaslip2019",
        twitter: "",
        youtube: ""
    },
    
    // Feature Flags
    FEATURES: {
        search: true,
        categories: true,
        archive: true,
        analytics: false
    },
    
    // Content Settings
    CONTENT: {
        postsPerPage: 6,
        excerptLength: 150,
        defaultImage: "default-card.jpg"
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