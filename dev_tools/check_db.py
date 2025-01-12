from app import app, db, BlogPost

def check_posts():
    with app.app_context():
        posts = BlogPost.query.all()
        if not posts:
            print("No posts found in database!")
        else:
            print(f"Found {len(posts)} posts:")
            for post in posts:
                print(f"- {post.title} (slug: {post.slug})")

if __name__ == "__main__":
    check_posts()
