from app import app, db, User
from werkzeug.security import generate_password_hash

def create_admin(username, password):
    with app.app_context():
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            print("User already exists!")
            return
        
        # Create new admin user
        admin = User(
            username=username,
            password_hash=generate_password_hash(password)
        )
        db.session.add(admin)
        db.session.commit()
        print("Admin user created successfully!")
