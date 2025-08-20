from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.models import Digest, User
from database import db
from datetime import datetime, timedelta
import json

digests_bp = Blueprint('digests', __name__)

@digests_bp.route('', methods=['GET'])
def get_digests():
    """Get all published public digests or user's own digests"""
    try:
        # Check if user is authenticated
        user_id = None
        try:
            user_id = get_jwt_identity()
        except:
            pass  # Not authenticated, show only public published digests
        
        # Query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        user_filter = request.args.get('user_id', type=int)
        view_type = request.args.get('view', 'public')  # 'public' or 'own'
        
        # Base query
        query = Digest.query
        
        if view_type == 'own' and user_id:
            # User's own digests (including unpublished ones)
            query = query.filter_by(user_id=user_id)
        else:
            # Public published digests only
            query = query.filter_by(is_public=True, is_published=True)
        
        # Apply filters
        if user_filter:
            query = query.filter_by(user_id=user_filter)
        
        # Order by week start date (most recent first)
        query = query.order_by(Digest.week_start.desc())
        
        # Paginate
        digests = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'digests': [digest.to_dict() for digest in digests.items],
            'pagination': {
                'page': digests.page,
                'per_page': digests.per_page,
                'total': digests.total,
                'pages': digests.pages,
                'has_next': digests.has_next,
                'has_prev': digests.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@digests_bp.route('', methods=['POST'])
@jwt_required()
def create_digest():
    """Create a new digest"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title') or not data.get('content'):
            return jsonify({'error': 'Title and content are required'}), 400
        
        if not data.get('week_start') or not data.get('week_end'):
            return jsonify({'error': 'Week start and end dates are required'}), 400
        
        # Parse dates
        try:
            week_start = datetime.strptime(data['week_start'], '%Y-%m-%d').date()
            week_end = datetime.strptime(data['week_end'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Create new digest
        digest = Digest(
            title=data['title'],
            content=data['content'],
            summary=data.get('summary', ''),
            week_start=week_start,
            week_end=week_end,
            is_published=data.get('is_published', False),
            is_public=data.get('is_public', True),
            user_id=user_id
        )
        
        if digest.is_published:
            digest.published_at = datetime.utcnow()
        
        db.session.add(digest)
        db.session.commit()
        
        return jsonify({
            'message': 'Digest created successfully',
            'digest': digest.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@digests_bp.route('/<int:digest_id>', methods=['GET'])
def get_digest(digest_id):
    """Get a specific digest"""
    try:
        user_id = None
        try:
            user_id = get_jwt_identity()
        except:
            pass
        
        digest = Digest.query.get(digest_id)
        
        if not digest:
            return jsonify({'error': 'Digest not found'}), 404
        
        # Check access permissions
        if not digest.is_public and digest.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # If not the owner, only show published digests
        if digest.user_id != user_id and not digest.is_published:
            return jsonify({'error': 'Digest not found'}), 404
        
        return jsonify({'digest': digest.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@digests_bp.route('/<int:digest_id>', methods=['PUT'])
@jwt_required()
def update_digest(digest_id):
    """Update a digest"""
    try:
        user_id = get_jwt_identity()
        digest = Digest.query.get(digest_id)
        
        if not digest:
            return jsonify({'error': 'Digest not found'}), 404
        
        # Check ownership
        if digest.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Update fields
        if 'title' in data:
            digest.title = data['title']
        if 'content' in data:
            digest.content = data['content']
        if 'summary' in data:
            digest.summary = data['summary']
        if 'week_start' in data:
            digest.week_start = datetime.strptime(data['week_start'], '%Y-%m-%d').date()
        if 'week_end' in data:
            digest.week_end = datetime.strptime(data['week_end'], '%Y-%m-%d').date()
        if 'is_public' in data:
            digest.is_public = data['is_public']
        
        # Handle publish/unpublish
        if 'is_published' in data:
            if data['is_published'] and not digest.is_published:
                digest.is_published = True
                digest.published_at = datetime.utcnow()
            elif not data['is_published'] and digest.is_published:
                digest.is_published = False
                digest.published_at = None
        
        db.session.commit()
        
        return jsonify({
            'message': 'Digest updated successfully',
            'digest': digest.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@digests_bp.route('/<int:digest_id>', methods=['DELETE'])
@jwt_required()
def delete_digest(digest_id):
    """Delete a digest"""
    try:
        user_id = get_jwt_identity()
        digest = Digest.query.get(digest_id)
        
        if not digest:
            return jsonify({'error': 'Digest not found'}), 404
        
        # Check ownership
        if digest.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        db.session.delete(digest)
        db.session.commit()
        
        return jsonify({'message': 'Digest deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@digests_bp.route('/generate-weekly', methods=['POST'])
@jwt_required()
def generate_weekly_digest():
    """Generate a weekly digest from user's articles (placeholder for AI integration)"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get date range (default to last week)
        if 'week_start' in data and 'week_end' in data:
            week_start = datetime.strptime(data['week_start'], '%Y-%m-%d').date()
            week_end = datetime.strptime(data['week_end'], '%Y-%m-%d').date()
        else:
            # Default to last week
            today = datetime.now().date()
            days_since_monday = today.weekday()
            week_start = today - timedelta(days=days_since_monday + 7)
            week_end = week_start + timedelta(days=6)
        
        # Get user's articles from that week
        from models.models import Article
        articles = Article.query.filter(
            Article.user_id == user_id,
            Article.reading_date >= week_start,
            Article.reading_date <= week_end
        ).order_by(Article.reading_date).all()
        
        if not articles:
            return jsonify({'error': 'No articles found for the specified week'}), 404
        
        # Generate basic digest content (placeholder for AI summarization)
        title = f"Weekly Digest: {week_start} to {week_end}"
        content = f"This week I read {len(articles)} articles:\n\n"
        
        for article in articles:
            content += f"**{article.title}** ({article.reading_date})\n"
            content += f"URL: {article.url}\n"
            if article.notes:
                content += f"Notes: {article.notes}\n"
            content += "\n"
        
        # Basic summary
        summary = f"A collection of {len(articles)} articles read between {week_start} and {week_end}."
        
        return jsonify({
            'title': title,
            'content': content,
            'summary': summary,
            'week_start': week_start.isoformat(),
            'week_end': week_end.isoformat(),
            'articles_count': len(articles)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
