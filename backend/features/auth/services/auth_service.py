from ..models.user import User, db
from ..utils.security import hash_password, verify_password
from ..utils.token import create_token
from flask import jsonify

class AuthService:
    @staticmethod
    def register(username: str, email: str, password: str):
        existing_user = User.query.filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            return None, 'Username or email already exists'
        
        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password)
        )
        db.session.add(user)
        db.session.commit()
        
        token = create_token(user.id, user.username)
        return {'user': user.to_dict(), 'token': token}, None

    @staticmethod
    def login(username: str, password: str):
        user = User.query.filter_by(username=username).first()
        
        if not user or not verify_password(password, user.password_hash):
            return None, 'Invalid username or password'
        
        token = create_token(user.id, user.username)
        return {'user': user.to_dict(), 'token': token}, None

    @staticmethod
    def get_user_by_id(user_id: int):
        return User.query.get(user_id)