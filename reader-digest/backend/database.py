from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_login import LoginManager

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
login_manager = LoginManager()

# JWT configuration callbacks
@jwt.user_identity_loader
def user_identity_lookup(user):
    """Convert user object to JWT identity"""
    return user

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    """Load user from JWT identity"""
    identity = jwt_data["sub"]
    # Import here to avoid circular imports
    from models.models import User
    return User.query.filter_by(id=identity).first()
