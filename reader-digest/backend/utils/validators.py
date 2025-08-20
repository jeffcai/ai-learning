import re
from typing import List, Tuple

def validate_password(password: str) -> Tuple[bool, List[str]]:
    """
    Validate password complexity requirements.
    
    Requirements:
    - At least 8 characters long
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit
    - Contains at least one special character
    
    Returns:
        Tuple[bool, List[str]]: (is_valid, list_of_error_messages)
    """
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")
    
    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")
    
    if not re.search(r'\d', password):
        errors.append("Password must contain at least one digit")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)")
    
    return len(errors) == 0, errors

def validate_email(email: str) -> bool:
    """Validate email format"""
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email) is not None

def validate_username(username: str) -> Tuple[bool, List[str]]:
    """
    Validate username requirements.
    
    Requirements:
    - 3-20 characters long
    - Only alphanumeric characters and underscores
    - Must start with a letter
    
    Returns:
        Tuple[bool, List[str]]: (is_valid, list_of_error_messages)
    """
    errors = []
    
    if len(username) < 3 or len(username) > 20:
        errors.append("Username must be between 3 and 20 characters long")
    
    if not re.match(r'^[a-zA-Z][a-zA-Z0-9_]*$', username):
        errors.append("Username must start with a letter and contain only letters, numbers, and underscores")
    
    return len(errors) == 0, errors
