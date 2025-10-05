#!/usr/bin/env python3


from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_analyzer import YouTubeAnalyzer
import sys
import os
import re
import json as _json
import requests

# Fix Windows console encoding
if sys.platform == "win32":
    import codecs
    if hasattr(sys.stdout, 'detach'):
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

analyzer = YouTubeAnalyzer()

# Default external service config (can be overridden by environment variables)
DEFAULT_APIFY_TOKEN = os.environ.get('APIFY_TOKEN')
DEFAULT_GROQ_API_KEY = os.environ.get('GROQ_API_KEY') 
DEFAULT_INSTAGRAM_ACTOR_ID = os.environ.get('ACTOR_ID')

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

@app.route('/api/instagram-analyze', methods=['POST'])
def instagram_analyze():
    """Analyze Instagram comments for toxicity/harassment using Apify and Groq.

    Body JSON accepts one of:
    - { "post_url": "https://www.instagram.com/p/SHORTCODE/" }
    - { "username": "handle" }

    Optional:
    - apify_token, groq_api_key, comments_limit (default 30)
    """
    try:
        data = request.get_json(force=True, silent=True) or {}

        post_url = data.get('post_url')
        username = data.get('username')
        comments_limit = int(data.get('comments_limit', 30))

        if not post_url and not username:
            return jsonify({ 'success': False, 'error': 'Provide either post_url or username' }), 400

        apify_token = data.get('apify_token') or DEFAULT_APIFY_TOKEN
        groq_api_key = data.get('groq_api_key') or DEFAULT_GROQ_API_KEY
        if not apify_token:
            return jsonify({ 'success': False, 'error': 'Missing Apify token (apify_token / APIFY_TOKEN)' }), 400
        if not groq_api_key:
            return jsonify({ 'success': False, 'error': 'Missing Groq API key (groq_api_key / GROQ_API_KEY)' }), 400

        # Build Apify input
        if post_url:
            direct_urls = [post_url]
        else:
            direct_urls = [f"https://www.instagram.com/{username.strip('@')}/"]

        apify_input = {
            "directUrls": direct_urls,
            "resultsType": "posts",
            "resultsLimit": 5 if username else 1,
            "comments": True,
            "includeCommentReplies": True,
            "commentsLimit": comments_limit
        }

        actor_id = DEFAULT_INSTAGRAM_ACTOR_ID
        apify_url = f"https://api.apify.com/v2/acts/{actor_id}/run-sync-get-dataset-items?token={apify_token}"
        apify_res = requests.post(apify_url, json=apify_input, timeout=60)
        if apify_res.status_code not in (200, 201):
            return jsonify({ 'success': False, 'error': f'Apify error: HTTP {apify_res.status_code}' }), 502
        items = apify_res.json()

        # Groq analysis
        from groq import Groq
        groq_client = Groq(api_key=groq_api_key)

        def analyze_comment(text: str):
            prompt = (
                "Analyze the following social media comment for toxicity, threats, and harassment.\n"
                "Provide a JSON response with the following structure:\n"
                "{\n"
                "  \"toxicity_level\": \"low/medium/high\",\n"
                "  \"threat_level\": \"none/low/medium/high\",\n"
                "  \"harassment_level\": \"none/low/medium/high\",\n"
                "  \"overall_safety\": \"safe/concerning/dangerous\",\n"
                "  \"explanation\": \"brief explanation of the analysis\"\n"
                "}\n\n"
                f"Comment to analyze: \"{text}\"\n\n"
                "Respond only with valid JSON."
            )
            try:
                resp = groq_client.chat.completions.create(
                    messages=[{ "role": "user", "content": prompt }],
                    model="llama-3.1-8b-instant",
                    temperature=0.1,
                    max_tokens=200
                )
                content = resp.choices[0].message.content
                return _json.loads(content)
            except Exception:
                return {
                    "toxicity_level": "unknown",
                    "threat_level": "unknown",
                    "harassment_level": "unknown",
                    "overall_safety": "unknown",
                    "explanation": "Analysis failed"
                }

        comments = []
        count = 0
        max_total = comments_limit
        for it in items:
            if count >= max_total:
                break
            latest = it.get('latestComments') or []
            for c in latest:
                if count >= max_total:
                    break
                username_c = c.get('ownerUsername') or 'Unknown'
                text = c.get('text') or ''
                analysis = analyze_comment(text) if text.strip() else {
                    "toxicity_level": "none",
                    "threat_level": "none",
                    "harassment_level": "none",
                    "overall_safety": "safe",
                    "explanation": "Empty comment"
                }
                comments.append({
                    'username': username_c,
                    'text': text,
                    'toxicity_analysis': analysis
                })
                count += 1

        # Summarize into app format (minimal threat view)
        high_or_medium = [c for c in comments if (c['toxicity_analysis'].get('toxicity_level') in ('medium','high') or c['toxicity_analysis'].get('harassment_level') in ('medium','high'))]
        flagged = [{
            'handle': c['username'],
            'platform': 'Instagram',
            'risk': 'High' if c['toxicity_analysis'].get('toxicity_level') == 'high' or c['toxicity_analysis'].get('harassment_level') == 'high' else 'Medium',
            'comment': c['text'],
            'lastSeen': 'Just now',
            'url': post_url or (f"https://www.instagram.com/{username.strip('@')}/" if username else '#')
        } for c in high_or_medium]

        threat = {
            'sentiment': {
                'positive': max(0, len(comments) - len(high_or_medium) - max(0, len(comments)//5)),
                'neutral': max(0, len(comments)//5),
                'hate': len(high_or_medium)
            },
            'timeline': [],
            'network': { 'nodes': [], 'edges': [] },
            'flagged': flagged,
            'scanId': 'ig_' + (username or 'post')
        }

        app_data = {
            'threat': threat,
            'piracy': { 'items': [], 'spread': [] },
            'reports': {
                'cybercrime': {
                    'title': 'Instagram Harassment Analysis Report',
                    'date': __import__('datetime').datetime.now().date().isoformat(),
                    'threatLevel': 'N/A',
                    'conclusion': f"Analyzed {len(comments)} comments; flagged {len(flagged)} potentially harmful."
                },
                'copyright': {
                    'title': 'Instagram Copyright Report',
                    'date': __import__('datetime').datetime.now().date().isoformat(),
                    'violationCount': 0,
                    'conclusion': 'No piracy analysis performed for Instagram comments.'
                }
            },
            'history': [{
                'id': threat['scanId'],
                'date': __import__('datetime').datetime.now().isoformat(timespec='seconds'),
                'type': 'harassment',
                'status': 'completed',
                'videoUrl': post_url or ''
            }]
        }

        return jsonify({ 'success': True, 'comments': comments, 'app_data': app_data })
    except Exception as e:
        return jsonify({ 'success': False, 'error': str(e) }), 500
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

@app.route('/api/integrity-check', methods=['POST'])
def integrity_check():
    """Compute file hash and perform a mock leak search.

    Expects multipart/form-data with a single field 'file'. Returns SHA-256 and a
    simulated leak status. In a real system you'd query your backend index or
    external services for matches.
    """
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Missing file upload (field name: file)'
            }), 400

        uploaded = request.files['file']
        # Read content and compute SHA-256
        import hashlib
        hasher = hashlib.sha256()
        # Stream in chunks to support large files
        while True:
            chunk = uploaded.stream.read(1024 * 1024)
            if not chunk:
                break
            hasher.update(chunk)
        sha256_hex = hasher.hexdigest()

        # Mock leak search: simple heuristic using hash characteristics
        # This is placeholder logic; replace with your actual search.
        mock_leak_score = int(sha256_hex[:2], 16)  # 0-255
        leaked = mock_leak_score > 200  # ~21% chance flagged
        sources = []
        if leaked:
            sources = [
                {
                    'platform': 'Telegram',
                    'url': 'https://t.me/suspected_channel/12345',
                    'confidence': 92
                },
                {
                    'platform': 'YouTube',
                    'url': 'https://youtube.com/watch?v=example',
                    'confidence': 81
                }
            ]

        return jsonify({
            'success': True,
            'hash': {
                'sha256': sha256_hex
            },
            'leak_check': {
                'leaked': leaked,
                'sources': sources
            }
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
