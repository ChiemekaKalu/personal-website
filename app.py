from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_from_directory, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import markdown
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this to a secure secret key
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog.db'
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)

class BlogPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    date_posted = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    category = db.Column(db.String(50), nullable=False, default='blogAndUpdates')

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/admin/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            return redirect(url_for('admin_dashboard'))
        flash('Invalid username or password')
    return render_template('admin/login.html')

@app.route('/admin/dashboard')
@login_required
def admin_dashboard():
    posts = BlogPost.query.order_by(BlogPost.date_posted.desc()).all()
    return render_template('admin/dashboard.html', posts=posts)

@app.route('/admin/post/new', methods=['GET', 'POST'])
@login_required
def new_post():
    if request.method == 'POST':
        title = request.form.get('title')
        content = request.form.get('content')
        slug = request.form.get('slug')
        category = request.form.get('category')
        
        post = BlogPost(title=title, content=content, slug=slug, category=category)
        db.session.add(post)
        db.session.commit()
        
        return redirect(url_for('admin_dashboard'))
    return render_template('admin/edit_post.html', post=None)

@app.route('/admin/post/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def edit_post(id):
    post = BlogPost.query.get_or_404(id)
    if request.method == 'POST':
        post.title = request.form.get('title')
        post.content = request.form.get('content')
        post.slug = request.form.get('slug')
        post.category = request.form.get('category')
        db.session.commit()
        return redirect(url_for('admin_dashboard'))
    return render_template('admin/edit_post.html', post=post)

@app.route('/api/posts')
def get_posts():
    posts = BlogPost.query.order_by(BlogPost.date_posted.desc()).all()
    print(f"Found {len(posts)} posts in database")  # Debug print
    
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
    
    result = [{
        'id': post.id,
        'title': post.title,
        'content': md.convert(post.content),
        'date_posted': post.date_posted.isoformat(),
        'slug': post.slug,
        'category': post.category
    } for post in posts]
    print(f"Returning posts: {result}")  # Debug print
    return jsonify(result)

@app.route('/api/posts/<slug>')
def get_post(slug):
    post = BlogPost.query.filter_by(slug=slug).first_or_404()
    
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
    
    return jsonify({
        'id': post.id,
        'title': post.title,
        'content': md.convert(post.content),
        'date_posted': post.date_posted.isoformat(),
        'slug': post.slug,
        'category': post.category
    })

@app.route('/blog/<slug>')
def view_post(slug):
    post = BlogPost.query.filter_by(slug=slug).first_or_404()
    category_display_names = {
        'blogAndUpdates': 'Blog & Updates',
        'projects': 'Projects',
        'music': 'Music',
        'coolOrRandom': 'Cool & Random'
    }
    
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
    
    return render_template('blog_post.html', 
                         post=post, 
                         post_content=post_content, 
                         category_display_names=category_display_names)

# Serve static files
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
