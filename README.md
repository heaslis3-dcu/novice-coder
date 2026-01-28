# novice-coder
Novice coder blog website code

# The Novice Coder Blog
TT
A record of my coding development, a beginner-friendly developer blog, built to document my coding journey and share learning experience with other aspiring developers. 

## Features
- ** documenting my experience coding and learning to work with various technologies and tools. 

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: CSS Grid, Flexbox, Custom Properties
- **Icons**: SVG and Emoji
- **Hosting**: GitHub Pages
- **Content**: JSON files for easy management

## Current functionality

- **Card-based** - posts display with hover effects and animations
- **Modal** - post viewing without page navigation
- **JSON-based** - content management

## 📝 JSON Post Structure

Blog posts are stored as JSON files with using both HTML string and structured array content formats, the later is the preferred solution as it is easier to maintain and edit.

```json
{
  "id": 1,
  "title": "Post Title",
  "excerpt": "Brief description",
  "content": "Full post content",
  "category": "Category Name",
  "skillLevel": "beginner",
  "date": "2023-11-15",
  "readTime": "8 min read",
  "slug": "post-slug",
  "published": true,
  "tags": ["tag1", "tag2"],
  "icon": "🚀"
} 

## TO DO 
- **TO DO** -
Category and skill level filtering
Search functionality
Responsive mobile-first design
Sci-fi themed UI with glassmorphism effects
Accessibility features 


Resolved Issues
1. JavaScript Loading Fixed - Removed duplicate embedded JavaScript from index.html, now properly loading from external main.js
2. JSON Content System Working - Posts successfully load from individual JSON files in /posts/ directory
3. Modal System Implemented - Full post content displays in modal overlay with proper formatting
4. Content Format Handling - JavaScript now handles both HTML string and structured array content formats
5. Path Resolution - Fixed file path issues for local development and GitHub Pages deployment

🚀 Quick Start

## Clone the repository
git clone https://github.com/heaslis3-dcu/the-novice-coder-blog.git

🤝 Contributing

This is a personal blog project, but suggestions and improvements are welcome!

📄 License

MIT License - feel free to use this as a template for your own learning journey blog!

Join me on my coding journey from novice to professional! 💻🚀

Created by heaslis3-dcu