#!/usr/bin/env python3
"""
Flask API Server for Aegis YouTube Analyzer
Provides REST API endpoints for the frontend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_analyzer import YouTubeAnalyzer
import sys
import os

# Fix Windows console encoding
if sys.platform == "win32":
    import codecs
    if hasattr(sys.stdout, 'detach'):
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

analyzer = YouTubeAnalyzer()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'online',
        'service': 'Aegis YouTube Analyzer API'
    })

@app.route('/api/analyze', methods=['POST'])
def analyze_video():
    """Analyze a YouTube video"""
    try:
        data = request.get_json()
        
        if not data or 'video_url' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing video_url parameter'
            }), 400
        
        video_url = data['video_url']
        keywords = data.get('keywords', [])
        limit = data.get('limit', 200)
        
        # Perform analysis
        result = analyzer.analyze_video(video_url, keywords, limit)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/scrape', methods=['POST'])
def scrape_comments():
    """Scrape comments from a YouTube video"""
    try:
        data = request.get_json()
        
        if not data or 'video_url' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing video_url parameter'
            }), 400
        
        video_url = data['video_url']
        limit = data.get('limit', 200)
        
        video_id = analyzer.extract_video_id(video_url)
        if not video_id:
            return jsonify({
                'success': False,
                'error': 'Invalid YouTube URL or video ID'
            }), 400
        
        comments = analyzer.scrape_comments(video_id, limit)
        
        return jsonify({
            'success': True,
            'video_id': video_id,
            'comments': comments,
            'total': len(comments)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/detect-bots', methods=['POST'])
def detect_bots():
    """Detect bot comments"""
    try:
        data = request.get_json()
        
        if not data or 'comments' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing comments parameter'
            }), 400
        
        comments = data['comments']
        bot_indicators = analyzer.detect_bot_comments(comments)
        
        return jsonify({
            'success': True,
            'bot_indicators': bot_indicators,
            'total_bots': sum(indicator['count'] for indicator in bot_indicators if indicator['type'] in ['duplicate_text', 'similar_text'])
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/detect-copyright', methods=['POST'])
def detect_copyright():
    """Detect copyright violations"""
    try:
        data = request.get_json()
        
        if not data or 'comments' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing comments parameter'
            }), 400
        
        comments = data['comments']
        keywords = data.get('keywords', [])
        
        violations = analyzer.detect_copyright_violations(comments, keywords)
        
        return jsonify({
            'success': True,
            'violations': violations,
            'total': len(violations)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Aegis YouTube Analyzer API Server...")
    print("📡 Server running on http://localhost:5000")
    print("📋 Available endpoints:")
    print("   - GET  /api/health")
    print("   - POST /api/analyze")
    print("   - POST /api/scrape")
    print("   - POST /api/detect-bots")
    print("   - POST /api/detect-copyright")
    print("\n✅ Server ready! Press Ctrl+C to stop.")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
