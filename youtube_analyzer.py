#!/usr/bin/env python3
"""
Real-time YouTube Comment Analyzer for Aegis
Analyzes YouTube videos for bot comments, spam, and copyright violations
"""

import json
import sys
import os
import re
from collections import Counter
from datetime import datetime
from youtube_comment_downloader import YoutubeCommentDownloader, SORT_BY_RECENT
from difflib import SequenceMatcher

# Fix Windows console encoding
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())

class YouTubeAnalyzer:
    def __init__(self):
        self.downloader = YoutubeCommentDownloader()
        
    def extract_video_id(self, url_or_id):
        """Extract video ID from YouTube URL or return ID if already provided"""
        if len(url_or_id) == 11 and not '/' in url_or_id:
            return url_or_id
            
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})',
            r'youtube\.com\/embed\/([a-zA-Z0-9_-]{11})',
            r'youtube\.com\/v\/([a-zA-Z0-9_-]{11})'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url_or_id)
            if match:
                return match.group(1)
        
        return None
    
    def scrape_comments(self, video_id, limit=200):
        """Scrape comments from YouTube video"""
        try:
            print(f"🔍 Scraping comments from video: {video_id}")
            comments = self.downloader.get_comments(
                youtube_id=video_id,
                sort_by=SORT_BY_RECENT,
                language='en'
            )
            
            comments_list = []
            for comment in comments:
                if len(comments_list) >= limit:
                    break
                    
                comments_list.append({
                    'id': comment.get('cid', f'comment_{len(comments_list)}'),
                    'text': comment.get('text', ''),
                    'author': comment.get('author', 'Unknown'),
                    'channel': comment.get('channel', ''),
                    'time': comment.get('time', ''),
                    'likes': comment.get('votes', 0),
                    'replies': comment.get('replies', 0),
                    'photo': comment.get('photo', ''),
                    'heart': comment.get('heart', False)
                })
            
            print(f"✅ Scraped {len(comments_list)} comments")
            return comments_list
            
        except Exception as e:
            print(f"❌ Error scraping comments: {e}")
            return []
    
    def detect_bot_comments(self, comments):
        """Detect potential bot/spam comments"""
        bot_indicators = []
        
        # Group comments by text similarity
        text_groups = {}
        for i, comment in enumerate(comments):
            text = comment['text'].lower().strip()
            
            # Check for exact duplicates
            if text in text_groups:
                text_groups[text].append(i)
            else:
                text_groups[text] = [i]
        
        # Find repeated comments (bots)
        for text, indices in text_groups.items():
            if len(indices) >= 3:  # 3 or more identical comments
                bot_indicators.append({
                    'type': 'duplicate_text',
                    'severity': 'high',
                    'text': text[:100],
                    'count': len(indices),
                    'authors': [comments[i]['author'] for i in indices],
                    'comment_ids': [comments[i]['id'] for i in indices]
                })
        
        # Check for similar comments (fuzzy matching)
        checked = set()
        for i, comment1 in enumerate(comments):
            if i in checked:
                continue
                
            similar_group = [i]
            text1 = comment1['text'].lower().strip()
            
            for j, comment2 in enumerate(comments[i+1:], start=i+1):
                if j in checked:
                    continue
                    
                text2 = comment2['text'].lower().strip()
                similarity = SequenceMatcher(None, text1, text2).ratio()
                
                if similarity > 0.85:  # 85% similar
                    similar_group.append(j)
                    checked.add(j)
            
            if len(similar_group) >= 3:
                bot_indicators.append({
                    'type': 'similar_text',
                    'severity': 'medium',
                    'text': text1[:100],
                    'count': len(similar_group),
                    'similarity': '85%+',
                    'authors': [comments[idx]['author'] for idx in similar_group],
                    'comment_ids': [comments[idx]['id'] for idx in similar_group]
                })
        
        # Check for spam patterns
        spam_patterns = [
            r'(?i)(click here|visit|check out|link in bio)',
            r'(?i)(free|win|prize|gift|giveaway)',
            r'(?i)(subscribe|sub4sub|follow)',
            r'(?i)(whatsapp|telegram|contact)',
            r'(?i)(earn money|make money|get rich)',
        ]
        
        spam_comments = []
        for comment in comments:
            text = comment['text']
            for pattern in spam_patterns:
                if re.search(pattern, text):
                    spam_comments.append({
                        'author': comment['author'],
                        'text': text[:100],
                        'pattern': pattern
                    })
                    break
        
        if spam_comments:
            bot_indicators.append({
                'type': 'spam_pattern',
                'severity': 'medium',
                'count': len(spam_comments),
                'examples': spam_comments[:5]
            })
        
        return bot_indicators
    
    def detect_harassment(self, comments):
        """Detect harassment, body shaming, and personal attacks in comments"""
        harassment_indicators = []
        
        # Harassment patterns
        harassment_patterns = [
            # Body shaming
            r'(?i)(fat|ugly|disgusting|gross|hideous)',
            r'(?i)(lose weight|too fat|too skinny|anorexic)',
            r'(?i)(pig|whale|cow|beast)',
            # Personal attacks
            r'(?i)(stupid|idiot|moron|dumb|retard)',
            r'(?i)(kill yourself|die|kys|end yourself)',
            r'(?i)(loser|failure|worthless|pathetic)',
            # Hate speech
            r'(?i)(hate you|despise|disgusting person)',
            r'(?i)(trash|garbage|scum)',
            # Threats
            r'(?i)(gonna kill|will kill|threat|hurt you)',
            r'(?i)(beat you|fight you|come after)',
        ]
        
        harassment_comments = []
        for comment in comments:
            text = comment['text']
            matched_patterns = []
            
            for pattern in harassment_patterns:
                if re.search(pattern, text):
                    matched_patterns.append(pattern)
            
            if matched_patterns:
                harassment_comments.append({
                    'author': comment['author'],
                    'text': text,
                    'time': comment['time'],
                    'likes': comment['likes'],
                    'matched_patterns': matched_patterns,
                    'severity': 'high' if len(matched_patterns) > 1 else 'medium',
                    'comment_id': comment['id'],
                    'type': self._classify_harassment_type(matched_patterns)
                })
        
        # Group by harassment type
        if harassment_comments:
            types = {}
            for h in harassment_comments:
                h_type = h['type']
                if h_type not in types:
                    types[h_type] = []
                types[h_type].append(h)
            
            for h_type, items in types.items():
                harassment_indicators.append({
                    'type': h_type,
                    'severity': 'high' if len(items) > 5 else 'medium',
                    'count': len(items),
                    'examples': items[:5]
                })
        
        return harassment_indicators, harassment_comments
    
    def _classify_harassment_type(self, patterns):
        """Classify the type of harassment based on patterns"""
        pattern_str = ' '.join(str(p) for p in patterns)
        
        if any(word in pattern_str.lower() for word in ['fat', 'ugly', 'weight', 'skinny', 'pig', 'whale']):
            return 'body_shaming'
        elif any(word in pattern_str.lower() for word in ['kill', 'die', 'kys', 'threat', 'hurt']):
            return 'threats'
        elif any(word in pattern_str.lower() for word in ['stupid', 'idiot', 'moron', 'dumb']):
            return 'personal_attacks'
        elif any(word in pattern_str.lower() for word in ['hate', 'despise', 'trash', 'garbage']):
            return 'hate_speech'
        else:
            return 'general_harassment'
    
    def detect_copyright_violations(self, comments, keywords=None):
        """Detect potential copyright violations in comments"""
        violations = []
        
        # Copyright violation patterns
        piracy_patterns = [
            r'(?i)(download|torrent|magnet|pirate)',
            r'(?i)(free download|full movie|full video)',
            r'(?i)(leaked|leak|rip)',
            r'(?i)(camrip|cam rip|dvdrip|webrip)',
            r'(?i)(watch free|stream free)',
            r'(?i)(illegal|pirated|cracked)',
        ]
        
        for comment in comments:
            text = comment['text']
            matched_patterns = []
            
            for pattern in piracy_patterns:
                if re.search(pattern, text):
                    matched_patterns.append(pattern)
            
            # Check for keyword matches if provided
            keyword_matches = []
            if keywords:
                for keyword in keywords:
                    if keyword.lower() in text.lower():
                        keyword_matches.append(keyword)
            
            if matched_patterns or keyword_matches:
                violations.append({
                    'author': comment['author'],
                    'text': text,
                    'time': comment['time'],
                    'likes': comment['likes'],
                    'matched_patterns': matched_patterns,
                    'keyword_matches': keyword_matches,
                    'severity': 'high' if matched_patterns else 'medium',
                    'comment_id': comment['id']
                })
        
        return violations
    
    def analyze_video(self, video_url_or_id, keywords=None, limit=200):
        """Complete analysis of a YouTube video"""
        video_id = self.extract_video_id(video_url_or_id)
        
        if not video_id:
            return {
                'success': False,
                'error': 'Invalid YouTube URL or video ID'
            }
        
        # Scrape comments
        comments = self.scrape_comments(video_id, limit)
        
        if not comments:
            return {
                'success': False,
                'error': 'No comments found or unable to scrape'
            }
        
        # Analyze comments
        print("🤖 Detecting bot comments...")
        bot_indicators = self.detect_bot_comments(comments)
        
        print("⚠️ Detecting harassment and personal attacks...")
        harassment_indicators, harassment_comments = self.detect_harassment(comments)
        
        print("⚖️ Detecting copyright violations...")
        copyright_violations = self.detect_copyright_violations(comments, keywords)
        
        # Calculate statistics
        total_comments = len(comments)
        bot_comment_count = sum(indicator['count'] for indicator in bot_indicators if indicator['type'] in ['duplicate_text', 'similar_text'])
        harassment_count = len(harassment_comments)
        violation_count = len(copyright_violations)
        
        # Determine threat level
        threat_level = 'LOW'
        if bot_comment_count > 20 or violation_count > 10 or harassment_count > 15:
            threat_level = 'CRITICAL'
        elif bot_comment_count > 10 or violation_count > 5 or harassment_count > 8:
            threat_level = 'HIGH'
        elif bot_comment_count > 5 or violation_count > 2 or harassment_count > 3:
            threat_level = 'MODERATE'
        
        # Generate unique conclusion based on results
        conclusion = self._generate_conclusion(
            total_comments, bot_comment_count, harassment_count, 
            violation_count, threat_level, harassment_indicators
        )
        
        result = {
            'success': True,
            'video_id': video_id,
            'video_url': f'https://www.youtube.com/watch?v={video_id}',
            'timestamp': datetime.now().isoformat(),
            'statistics': {
                'total_comments': total_comments,
                'bot_comments': bot_comment_count,
                'harassment_comments': harassment_count,
                'copyright_violations': violation_count,
                'threat_level': threat_level
            },
            'comments': comments,
            'bot_indicators': bot_indicators,
            'harassment_indicators': harassment_indicators,
            'harassment_comments': harassment_comments,
            'copyright_violations': copyright_violations,
            'conclusion': conclusion
        }
        
        return result
    
    def _generate_conclusion(self, total_comments, bot_count, harassment_count, 
                            violation_count, threat_level, harassment_indicators):
        """Generate unique conclusion based on actual results"""
        conclusions = []
        
        # Analyze harassment types
        harassment_types = []
        for indicator in harassment_indicators:
            h_type = indicator['type'].replace('_', ' ').title()
            harassment_types.append(f"{h_type} ({indicator['count']} instances)")
        
        # Build conclusion based on findings
        if threat_level == 'CRITICAL':
            conclusions.append(f"⚠️ CRITICAL THREAT DETECTED: This video has {total_comments} comments with severe issues.")
            
            if harassment_count > 15:
                conclusions.append(f"🚨 HARASSMENT ALERT: {harassment_count} comments contain harassment, including {', '.join(harassment_types[:3])}.")
                conclusions.append("Immediate action required. Multiple users are engaging in coordinated harassment and personal attacks.")
            
            if bot_count > 20:
                conclusions.append(f"🤖 BOT ACTIVITY: {bot_count} bot/spam comments detected, indicating coordinated manipulation.")
            
            if violation_count > 10:
                conclusions.append(f"⚖️ COPYRIGHT VIOLATIONS: {violation_count} comments contain piracy links or copyright violations.")
            
            conclusions.append("RECOMMENDATION: Report to platform immediately. Consider legal action for harassment and copyright violations.")
        
        elif threat_level == 'HIGH':
            conclusions.append(f"⚠️ HIGH THREAT LEVEL: Analysis of {total_comments} comments reveals significant concerns.")
            
            if harassment_count > 8:
                conclusions.append(f"🚨 {harassment_count} harassment comments detected: {', '.join(harassment_types[:2])}.")
                conclusions.append("Multiple users are engaging in harmful behavior including body shaming and personal attacks.")
            
            if bot_count > 10:
                conclusions.append(f"🤖 {bot_count} bot comments suggest coordinated spam activity.")
            
            if violation_count > 5:
                conclusions.append(f"⚖️ {violation_count} copyright violations found in comments.")
            
            conclusions.append("RECOMMENDATION: Monitor closely and report violating accounts. Document evidence for potential action.")
        
        elif threat_level == 'MODERATE':
            conclusions.append(f"⚠️ MODERATE CONCERNS: {total_comments} comments analyzed with some issues detected.")
            
            if harassment_count > 0:
                conclusions.append(f"⚠️ {harassment_count} comments contain harassment: {', '.join(harassment_types)}.")
                conclusions.append("Some users are engaging in negative behavior that should be monitored.")
            
            if bot_count > 0:
                conclusions.append(f"🤖 {bot_count} potential bot/spam comments detected.")
            
            if violation_count > 0:
                conclusions.append(f"⚖️ {violation_count} potential copyright violations found.")
            
            conclusions.append("RECOMMENDATION: Continue monitoring. Report specific violating comments to platform.")
        
        else:  # LOW
            conclusions.append(f"✅ LOW THREAT: Analysis of {total_comments} comments shows minimal concerns.")
            
            if harassment_count > 0:
                conclusions.append(f"Minor issues: {harassment_count} comments flagged for review.")
            else:
                conclusions.append("No significant harassment, bot activity, or copyright violations detected.")
            
            if bot_count == 0 and violation_count == 0 and harassment_count == 0:
                conclusions.append("This video has a healthy comment section with positive community engagement.")
            
            conclusions.append("RECOMMENDATION: Routine monitoring sufficient. Community appears well-moderated.")
        
        # Add specific harassment type warnings
        if harassment_types:
            conclusions.append(f"\n📋 HARASSMENT BREAKDOWN: {', '.join(harassment_types)}")
        
        return '\n\n'.join(conclusions)

def main():
    if len(sys.argv) < 2:
        print("Usage: python youtube_analyzer.py <video_url_or_id> [keywords]")
        print("Example: python youtube_analyzer.py dQw4w9WgXcQ")
        print("Example: python youtube_analyzer.py https://www.youtube.com/watch?v=dQw4w9WgXcQ movie,leak")
        sys.exit(1)
    
    video_input = sys.argv[1]
    keywords = sys.argv[2].split(',') if len(sys.argv) > 2 else None
    
    analyzer = YouTubeAnalyzer()
    result = analyzer.analyze_video(video_input, keywords)
    
    if result['success']:
        print("\n" + "="*60)
        print("📊 ANALYSIS RESULTS")
        print("="*60)
        print(f"Video ID: {result['video_id']}")
        print(f"Video URL: {result['video_url']}")
        print(f"Total Comments: {result['statistics']['total_comments']}")
        print(f"Bot Comments: {result['statistics']['bot_comments']}")
        print(f"Copyright Violations: {result['statistics']['copyright_violations']}")
        print(f"Threat Level: {result['statistics']['threat_level']}")
        print("="*60)
        
        # Save to file
        output_file = f"analysis_{result['video_id']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Full analysis saved to: {output_file}")
    else:
        print(f"❌ Error: {result['error']}")

if __name__ == "__main__":
    main()
