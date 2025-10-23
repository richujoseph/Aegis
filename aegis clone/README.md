# Instagram Follower Scraper

A Python script to scrape Instagram followers using the Instagram API.

## Features
- Secure session management using environment variables
- Pagination support for large follower lists
- Error handling and rate limiting

## Setup

1. Install dependencies:
   ```bash
   pip install requests python-dotenv
   ```

2. Create a `.env` file with your Instagram session ID:
   ```
   INSTAGRAM_SESSION_ID=your_session_id_here
   ```

3. Run the script:
   ```bash
   python instagram_scraper.py
   ```

## Security

- Never share your Instagram session ID
- The `.env` file is included in `.gitignore` by default
- Session IDs provide full account access - handle with care

## Output

Scraped user IDs are saved to `idsUser.txt` (one ID per line).
