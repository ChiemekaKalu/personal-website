# Chiemeka Kalu's Personal Website

## Overview
This is my personal website, where you can find information about me, my projects, and my interests. It is built to be relatively lightweight and easy to maintain.

## Technologies
- HTML
- CSS
- JavaScript
- Python/Flask (for development and blog management) 
- SQLite (for blog database)
- Markdown (for blog post content)
- Pygments (for code syntax highlighting)

## Features
- Responsive design that works on desktop and mobile
- Blog system with markdown support and syntax highlighting
- Static site generation for improved performance
- Clean and modern UI
- Category-based blog organization

## Project Structure
```
personal-website/
├── static/              # Static assets
│   ├── styles.css      # Main stylesheet
│   ├── pygments.css    # Syntax highlighting styles
│   ├── script.js       # JavaScript functionality
│   └── blog/           # Generated static blog posts
├── templates/          # Flask templates
│   ├── blog_post.html  # Template for blog posts
│   └── admin/         # Admin interface templates
├── dev_tools/         # Development utilities
│   ├── generate_static.py     # Static site generator
│   ├── generate_pygments_css.py  # Syntax highlighting styles generator
│   └── blogTools.md          # Documentation for blog tools
├── images/            # Image assets
├── blog.html          # Blog listing page
├── blog.js           # Blog functionality
├── index.html         # Main landing page
├── now.html          # "Now" page
├── now.js            # "Now" page functionality
├── spotify-now.js    # Spotify integration for Now page
├── script.js         # Main JavaScript functionality
├── styles.css        # Main stylesheet
├── requirements.txt  # Python dependencies
└── app.example.py    # Example Flask application template
```

## Setup for Development

(These steps are for my own local development for when I switch machines, but they should work for you too if you like)
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/personal-website.git
   cd personal-website
   ```

2. Set up Python environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Configure the application:
   ```bash
   cp app.example.py app.py
   # Edit app.py to set your SECRET_KEY and other configurations
   ```

4. Initialize the database:
   ```bash
   python
   >>> from app import db
   >>> db.create_all()
   >>> exit()
   ```

5. Run the development server:
   ```bash
   python app.py
   ```

## Blog Post Management (more personal notes)
1. Access the admin interface at `/admin` (requires setup)
2. Create or edit blog posts using markdown
3. Use code blocks with syntax highlighting:
   ````markdown
   ```python
   def hello_world():
       print("Hello, World!")
   ```
   ````
4. Generate static pages after creating/editing posts

## Deployment
1. Generate static files:
   ```bash
   python generate_static.py
   ```
2. Deploy the static files to your web server
3. For GitHub Pages, push to the main branch

## License
MIT License - See LICENSE file for details


## current issues
- can't delete blog posts easily 
- blog updates must be done from the dev side (could be fixed by making all the blog posts static or by using a real hosted database)
- various ui issues


## future features
- blog search
- images in blog posts
- better styling all around everywhere 
- dark mode toggle
- project showcase
- something cool


## Contact
Feel free to reach out to me through the contact form on my website or via:
- GitHub: [@ChiemekaKalu](https://github.com/ChiemekaKalu)
- Email: chiemekakalu@ucla.edu  
