from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.models import Article, User
from database import db
from datetime import datetime
import json

articles_bp = Blueprint('articles', __name__)

@articles_bp.route('', methods=['GET'])
def get_articles():
    """Get all public articles or user's own articles"""
    try:
        # Check if user is authenticated
        user_id = None
        try:
            user_id = get_jwt_identity()
        except:
            pass  # Not authenticated, show only public articles
        
        # Query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        user_filter = request.args.get('user_id', type=int)
        date_filter = request.args.get('date')  # YYYY-MM-DD format
        tag_filter = request.args.get('tag')
        view_type = request.args.get('view', 'public')  # 'public' or 'own'
        user_articles = request.args.get('user_articles', type=bool)
        
        # Base query
        query = Article.query
        
        if user_articles and user_id:
            # User's own articles (including private ones) - for admin page
            query = query.filter_by(user_id=user_id)
        elif view_type == 'own' and user_id:
            # User's own articles (including private ones)
            query = query.filter_by(user_id=user_id)
        else:
            # Public articles only
            query = query.filter_by(is_public=True)
        
        # Apply filters
        if user_filter:
            query = query.filter_by(user_id=user_filter)
        
        if date_filter:
            try:
                filter_date = datetime.strptime(date_filter, '%Y-%m-%d').date()
                query = query.filter_by(reading_date=filter_date)
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        if tag_filter:
            query = query.filter(Article.tags.contains(tag_filter))
        
        # Order by reading date (most recent first)
        query = query.order_by(Article.reading_date.desc(), Article.created_at.desc())
        
        # Paginate
        articles = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'articles': [article.to_dict() for article in articles.items],
            'pagination': {
                'page': articles.page,
                'per_page': articles.per_page,
                'total': articles.total,
                'pages': articles.pages,
                'has_next': articles.has_next,
                'has_prev': articles.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@articles_bp.route('', methods=['POST'])
@jwt_required()
def create_article():
    """Create a new article"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        print(f"DEBUG: User ID: {user_id}, type: {type(user_id)}")
        
        # Convert user_id to integer if it's a string
        if isinstance(user_id, str):
            try:
                user_id = int(user_id)
                print(f"DEBUG: Converted user_id to int: {user_id}")
            except ValueError:
                print(f"DEBUG: Failed to convert user_id to int: {user_id}")
                return jsonify({'error': 'Invalid user identity'}), 401
        
        print(f"DEBUG: Received data: {data}")
        
        # Validate required fields
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        if not data.get('title'):
            return jsonify({'error': 'Title is required'}), 400
            
        if not data.get('content'):
            return jsonify({'error': 'Content is required'}), 400
        
        # Process tags - convert list to JSON string if needed
        tags = data.get('tags', [])
        if isinstance(tags, list):
            tags = json.dumps(tags)
        elif not tags:
            tags = json.dumps([])
        
        # Create new article
        try:
            print(f"DEBUG: Creating article with user_id={user_id}")
            article = Article()
            article.title = data['title'].strip()
            article.url = data.get('url', '').strip() if data.get('url') else None
            article.content = data['content'].strip()
            article.notes = data.get('notes', '').strip() if data.get('notes') else None
            article.tags = tags
            article.reading_date = datetime.strptime(data.get('reading_date', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d').date()
            article.is_public = data.get('is_public', True)
            article.user_id = user_id
            
            print(f"DEBUG: Article object created: {article}")
            
            db.session.add(article)
            db.session.commit()
            print(f"DEBUG: Article saved successfully")
        except Exception as create_error:
            print(f"DEBUG: Error creating article: {create_error}")
            raise create_error
        
        return jsonify({
            'message': 'Article created successfully',
            'article': article.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/<int:article_id>', methods=['GET'])
def get_article(article_id):
    """Get a specific article"""
    try:
        user_id = None
        try:
            user_id = get_jwt_identity()
        except:
            pass
        
        article = Article.query.get(article_id)
        
        if not article:
            return jsonify({'error': 'Article not found'}), 404
        
        # Check access permissions
        if not article.is_public and article.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        return jsonify({'article': article.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/<int:article_id>', methods=['PUT'])
@jwt_required()
def update_article(article_id):
    """Update an article"""
    try:
        user_id = get_jwt_identity()
        article = Article.query.get(article_id)
        
        if not article:
            return jsonify({'error': 'Article not found'}), 404
        
        # Check ownership
        if article.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Update fields
        if 'title' in data:
            article.title = data['title']
        if 'url' in data:
            article.url = data['url']
        if 'notes' in data:
            article.notes = data['notes']
        if 'tags' in data:
            article.tags = data['tags']
        if 'reading_date' in data:
            article.reading_date = datetime.strptime(data['reading_date'], '%Y-%m-%d').date()
        if 'is_public' in data:
            article.is_public = data['is_public']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Article updated successfully',
            'article': article.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/<int:article_id>', methods=['DELETE'])
@jwt_required()
def delete_article(article_id):
    """Delete an article"""
    try:
        user_id = get_jwt_identity()
        article = Article.query.get(article_id)
        
        if not article:
            return jsonify({'error': 'Article not found'}), 404
        
        # Check ownership
        if article.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        db.session.delete(article)
        db.session.commit()
        
        return jsonify({'message': 'Article deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
