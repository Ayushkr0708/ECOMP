import os
from datetime import datetime, timedelta
from jwt import encode, decode, ExpiredSignatureError, InvalidTokenError

JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

def create_token(user_id: int, username: str) -> str:
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    return encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise ValueError('Token has expired')
    except InvalidTokenError:
        raise ValueError('Invalid token')

def validate_token(token: str) -> dict:
    return decode_token(token)