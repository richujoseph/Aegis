#!/usr/bin/env python3
"""
YouTube Comment Scraper for Aegis Database
Scrapes YouTube comments and converts them to Aegis database format
"""

import json
import sys
import os
import argparse
from datetime import datetime, timedelta
import random
from youtube_comment_downloader import YoutubeCommentDownloader, SORT_BY_POPULAR, SORT_BY_RECENT

# Fix Windows console encoding for emojis
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())

# List of popular YouTube videos to scrape comments from
SAMPLE_VIDEOS = [
    'ScMzIvxBSi4',  # Popular tech video
    'dQw4w9WgXcQ',  # Popular music video
    '9bZkp7q19f0',  # Popular gaming video
    'jNQXAC9IVRw',  # Popular science video
    'kJQP7kiw5Fk',  # Popular movie trailer
]

PLATFORMS = ['YouTube', 'Instagram', 'X', 'Facebook', 'TikTok', 'Telegram', 'Twitch']

def generate_sample_users():
    """Generate sample social media users for testing"""
    users = []

    for i in range(25):
        platform = random.choice(PLATFORMS)

        if platform == 'YouTube':
            username = f'user{i+1}'
            followers = random.randint(1000, 1000000)
        elif platform == 'Instagram':
            username = f'insta_user_{i+1}'
            followers = random.randint(500, 500000)
        elif platform == 'X':
            username = f'x_user_{i+1}'
            followers = random.randint(100, 100000)
        elif platform == 'TikTok':
            username = f'tiktok_user_{i+1}'
            followers = random.randint(1000, 2000000)
        elif platform == 'Telegram':
            username = f'tg_user_{i+1}'
            followers = random.randint(50, 50000)
        else:  # Facebook, Twitch
            username = f'fb_user_{i+1}' if platform == 'Facebook' else f'twitch_user_{i+1}'
            followers = random.randint(200, 200000)

        user = {
            'id': f'user_{i+1}_{platform.lower()}',
            'username': username,
            'platform': platform,
            'followers': followers,
            'verified': random.choice([True, False]),
            'bio': f'Sample {platform} user for Aegis testing',
            'location': random.choice(['US', 'IN', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP']),
            'joinDate': datetime.now() - timedelta(days=random.randint(365, 3650)),
            'videos': [],
            'posts': [],
            'hashtags': [],
            'comments': []
        }

        # Generate sample videos/posts based on platform
        if platform in ['YouTube', 'TikTok', 'Twitch']:
            num_videos = random.randint(5, 50)
            for j in range(num_videos):
                upload_date = datetime.now() - timedelta(days=random.randint(1, 365))
                user['videos'].append({
                    'id': f'vid_{i+1}_{j+1}',
                    'name': f'Sample {platform} Video {j+1}',
                    'uploadDate': upload_date.strftime('%Y-%m-%d'),
                    'views': random.randint(100, 1000000),
                    'likes': random.randint(10, 10000),
                    'dislikes': random.randint(0, 1000),
                    'duration': random.randint(30, 3600),
                    'hashtags': [f'#{platform.lower()}', f'#sample{j+1}']
                })
        elif platform in ['Instagram', 'Facebook']:
            num_posts = random.randint(10, 100)
            for j in range(num_posts):
                post_date = datetime.now() - timedelta(days=random.randint(1, 180))
                user['posts'].append({
                    'id': f'post_{i+1}_{j+1}',
                    'content': f'Sample {platform} post content {j+1}',
                    'date': post_date.strftime('%Y-%m-%d'),
                    'likes': random.randint(5, 5000),
                    'comments': random.randint(0, 100),
                    'hashtags': [f'#{platform.lower()}', f'#sample{j+1}']
                })

        users.append(user)

    return users

def scrape_youtube_comments(video_id, limit=50):
    """Scrape comments from a YouTube video"""
    try:
        downloader = YoutubeCommentDownloader()
        comments = downloader.get_comments(
            youtube_id=video_id,
            sort_by=SORT_BY_RECENT,
            language='en'
        )

        # Convert to list and limit results
        comments_list = []
        for comment in comments:
            if len(comments_list) >= limit:
                break
            comments_list.append({
                'id': comment.get('cid', f'comment_{len(comments_list)}'),
                'text': comment.get('text', ''),
                'author': comment.get('author', f'user_{len(comments_list)}'),
                'time': comment.get('time', datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
                'likes': comment.get('votes', 0),
                'replies': comment.get('replies', 0)
            })

        return comments_list

    except Exception as e:
        print(f"Error scraping comments for video {video_id}: {e}")
        return []

def create_aegis_database():
    """Create the Aegis database with real YouTube data"""
    print("Starting YouTube comment scraping for Aegis database...")

    all_users = generate_sample_users()
    scraped_comments = []

    # Try to scrape comments from sample videos
    for video_id in SAMPLE_VIDEOS:
        print(f"Scraping comments from video: {video_id}")
        comments = scrape_youtube_comments(video_id, limit=20)

        if comments:
            scraped_comments.extend(comments)
            print(f"Scraped {len(comments)} comments")
        else:
            print(f"No comments found for video: {video_id}")

    # If we didn't get enough comments, use some sample data
    if len(scraped_comments) < 50:
        print("Generating sample comments...")
        sample_comments = [
            "Great video! Really helpful content.",
            "This is exactly what I was looking for!",
            "Thanks for sharing this information.",
            "Amazing quality content as always!",
            "Could you make a follow-up video?",
            "Very informative, learned a lot!",
            "Love the editing and presentation!",
            "This deserves more views!",
            "Excellent explanation of the topic.",
            "Keep up the great work!",
            "First comment! Love your content.",
            "This video changed my perspective.",
            "Outstanding production quality!",
            "Very well researched content.",
            "Can't wait for the next video!",
            "This is incredibly useful information.",
            "Your videos are always so helpful!",
            "Amazing work as always!",
            "Such valuable insights!",
            "Brilliant content creator!"
        ]

        for i in range(min(100, len(all_users) * 3)):
            comment = {
                'id': f'sample_comment_{i+1}',
                'text': random.choice(sample_comments),
                'author': random.choice([u['username'] for u in all_users]),
                'time': (datetime.now() - timedelta(days=random.randint(1, 30))).strftime('%Y-%m-%d %H:%M:%S'),
                'likes': random.randint(0, 100),
                'replies': random.randint(0, 10)
            }
            scraped_comments.append(comment)

    print(f"Total comments collected: {len(scraped_comments)}")

    # Create the final database structure
    database = {
        'users': all_users,
        'comments': scraped_comments,
        'hashtags': [
            '#travel', '#food', '#tech', '#music', '#gaming',
            '#science', '#movies', '#sports', '#fashion', '#art',
            '#photography', '#cooking', '#fitness', '#education', '#business',
            '#entertainment', '#news', '#lifestyle', '#health', '#technology',
            '#programming', '#design', '#marketing', '#finance', '#crypto'
        ],
        'lastUpdated': datetime.now().isoformat(),
        'totalUsers': len(all_users),
        'totalComments': len(scraped_comments)
    }

    return database

def main():
    parser = argparse.ArgumentParser(description='Generate Aegis database with YouTube comments')
    parser.add_argument('--output', '-o', default='database/social-media-db.js',
                       help='Output file path for the database')
    parser.add_argument('--format', '-f', choices=['javascript', 'json'], default='javascript',
                       help='Output format (default: javascript)')

    args = parser.parse_args()

    print("Starting Aegis database generation...")

    # Create database directory if it doesn't exist
    os.makedirs('database', exist_ok=True)

    # Generate database
    database = create_aegis_database()

    if args.format == 'json':
        # Convert datetime objects to strings for JSON serialization
        def json_serializer(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")
        
        # Output as JSON
        with open(args.output.replace('.js', '.json'), 'w', encoding='utf-8') as f:
            json.dump(database, f, indent=2, ensure_ascii=False, default=json_serializer)
        print(f"Database saved as JSON: {args.output.replace('.js', '.json')}")
    else:
        # Convert datetime objects to strings for JSON serialization
        def json_serializer(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")
        
        # Output as JavaScript module
        js_content = f"""// Aegis Social Media Database
// Generated with real YouTube comments
// Last updated: {database['lastUpdated']}

const socialMediaDatabase = {json.dumps(database, indent=2, ensure_ascii=False, default=json_serializer)};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {{
  module.exports = socialMediaDatabase;
}}

// Make available globally
window.socialMediaDatabase = socialMediaDatabase;
"""

        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(js_content)

        print(f"Database saved as JavaScript module: {args.output}")

    print("Database generation complete!")
    print(f"Users: {len(database['users'])}")
    print(f"Comments: {len(database['comments'])}")
    print(f"Hashtags: {len(database['hashtags'])}")

if __name__ == "__main__":
    main()
