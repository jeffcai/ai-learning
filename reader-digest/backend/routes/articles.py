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
        
        # Base query
        query = Article.query
        
        if view_type == 'own' and user_id:
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
        
        # Validate required fields
        if not data.get('title') or not data.get('url'):
            return jsonify({'error': 'Title and URL are required'}), 400
        
        # Create new article
        article = Article(
            title=data['title'],
            url=data['url'],
            notes=data.get('notes', ''),
            tags=data.get('tags', ''),
            reading_date=datetime.strptime(data.get('reading_date', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d').date(),
            is_public=data.get('is_public', True),
            user_id=user_id
        )
        
        db.session.add(article)
        db.session.commit()
        
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
