from app import app, db, BlogPost
from datetime import datetime

def import_first_post():
    with app.app_context():
        content = """Welcome to my new personal website! I'm excited to share my thoughts, projects, and experiences with you. In this first post, I want to discuss the tech stack and features I've implemented.

## The Tech Stack

For this website, I chose to keep things simple yet modern. Here's what I'm using:

* **Frontend:** Pure HTML, CSS, and JavaScript
* **Styling:** Custom CSS with modern features like CSS variables and flexbox
* **Animations:** Subtle CSS transitions for smooth interactions
* **Icons:** Feather icons for a clean, consistent look

## Key Features

Some of the main features I've implemented include:

* Responsive design that works great on all devices
* Dark/light mode support (coming soon)
* Blog system with categories and filters
* Real-time location and activity updates on the Now page
* Integration with Spotify to show my current music

## What's Next?

I have several features planned for future updates:

* Adding a dark mode toggle
* Implementing a search function for blog posts
* Adding a projects showcase section
* Creating an RSS feed for the blog

Stay tuned for more updates and posts about my projects, thoughts on technology, and other interesting topics!"""

        post = BlogPost(
            title="Welcome to My Blog!",
            content=content,
            date_posted=datetime(2025, 1, 8),
            slug="welcome-to-my-blog",
            category="blogAndUpdates"
        )
        
        # Check if post already exists
        existing_post = BlogPost.query.filter_by(slug="welcome-to-my-blog").first()
        if not existing_post:
            db.session.add(post)
            db.session.commit()
            print("First blog post imported successfully!")
        else:
            print("Post already exists!")

if __name__ == "__main__":
    import_first_post()
