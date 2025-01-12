from app import app, BlogPost
import json
import os
import shutil
from datetime import datetime
import markdown

def copy_static_files():
    """Copy necessary static assets"""
    static_files = ['styles.css', 'pygments.css', 'script.js']
    for file in static_files:
        if os.path.exists(file):
            shutil.copy2(file, f'static/{file}')

def generate_static_files():
    with app.app_context():
        # Get all posts
        posts = BlogPost.query.order_by(BlogPost.date_posted.desc()).all()
        
        # Create static/blog directory if it doesn't exist
        os.makedirs('static/blog', exist_ok=True)
        
        # Copy static files
        copy_static_files()
        
        # Generate posts.json for the blog listing
        posts_data = [{
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'date_posted': post.date_posted.isoformat(),
            'slug': post.slug,
            'category': post.category
        } for post in posts]
        
        with open('static/blog/posts.json', 'w') as f:
            json.dump(posts_data, f)
        
        # Category display names mapping
        category_display_names = {
            'blogAndUpdates': 'Blog & Updates',
            'projects': 'Projects',
            'music': 'Music',
            'coolOrRandom': 'Cool & Random'
        }
        
        # Generate individual post HTML files
        for post in posts:
            post_dir = f'static/blog/{post.slug}'
            os.makedirs(post_dir, exist_ok=True)
            
            # Configure Markdown with extensions
            md = markdown.Markdown(
                extensions=[
                    'markdown.extensions.fenced_code',
                    'markdown.extensions.codehilite',
                    'markdown.extensions.extra'
                ],
                extension_configs={
                    'markdown.extensions.codehilite': {
                        'css_class': 'codehilite',
                        'noclasses': False,
                        'use_pygments': True
                    }
                }
            )
            
            post_content = md.convert(post.content)
            
            # Generate the HTML file
            html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{post.title} - Chiemeka Kalu's Blog">
    <meta name="theme-color" content="#e65100">
    <title>{post.title} - Chiemeka Kalu</title>
    <link rel="stylesheet" href="../../styles.css">
    <link rel="stylesheet" href="../../pygments.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="../../../index.html#home" class="nav-link">Home</a></li>
                <li><a href="../../../index.html#about" class="nav-link">About</a></li>
                <li><a href="../../../index.html#experience" class="nav-link">Experience</a></li>
                <li><a href="../../../index.html#projects" class="nav-link">Projects</a></li>
                <li><a href="../../../blog.html" class="nav-link active">Blog</a></li>
                <li><a href="../../../now.html" class="nav-link">Now</a></li>
                <li><a href="../../../index.html#contact" class="nav-link">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main class="container">
        <article class="blog-post-full">
            <div class="blog-post-header">
                <h1>{post.title}</h1>
                <div class="post-meta">
                    <span class="post-date">{post.date_posted.strftime('%B %d, %Y')}</span>
                    <span class="post-category">{category_display_names.get(post.category, post.category)}</span>
                </div>
            </div>

            <div class="blog-post-content markdown-content">
                {post_content}
            </div>
        </article>
    </main>

    <footer>
        <p>&copy; 2025 Chiemeka Kalu. All rights reserved.</p>
    </footer>

    <script src="../../script.js"></script>
</body>
</html>"""
            
            with open(os.path.join(post_dir, 'index.html'), 'w', encoding='utf-8') as f:
                f.write(html_content)

        print(f"Generated static files for {len(posts)} posts")

if __name__ == "__main__":
    generate_static_files()
