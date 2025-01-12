from app import app, db, User
from werkzeug.security import generate_password_hash

def main():
    with app.app_context():
        # Create tables
        db.create_all()
        
        username = input("Enter admin username: ")
        password = input("Enter admin password: ")
        
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

if __name__ == "__main__":
    main()
