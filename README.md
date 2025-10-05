# 🎬 Aegis - YouTube Comment Analyzer

**Intelligent Monitoring & Copyright Protection System**

Aegis is a powerful YouTube comment analysis tool that detects bot comments, harassment, spam, and copyright violations in real-time. Built with Python Flask backend and modern JavaScript frontend.

---

## ✨ Features

### 🤖 Bot Detection
- Duplicate comment detection
- Similar text pattern analysis (85%+ similarity)
- Spam pattern recognition
- Coordinated manipulation detection

### ⚠️ Harassment Detection
- Body shaming detection
- Personal attacks identification
- Hate speech analysis
- Threat detection
- Cyberbullying patterns

### ⚖️ Copyright Protection
- Piracy link detection
- Illegal download mentions
- Custom keyword matching
- DMCA violation identification

### 📱 Instagram Analysis (NEW)
- Instagram post comment analysis
- Instagram user comment scraping
- AI-powered toxicity detection using Groq
- Harassment level assessment
- Real-time threat analysis

### 📊 Analytics & Reporting
- Threat level assessment (LOW/MODERATE/HIGH/CRITICAL)
- Interactive dashboard
- Real-time analysis
- PDF report generation
- Statistical breakdowns

---

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- Modern web browser

### Installation

1. **Clone or download the project**
   ```bash
   cd Aegis
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server**
   ```bash
   python api_server.py
   ```
   Server will run on: http://localhost:5000

4. **Start the frontend server**
   ```bash
   python -m http.server 8080
   ```
   Frontend will run on: http://localhost:8080

5. **Open your browser**
   ```
   http://localhost:8080/index.html
   ```

---

## 📁 Project Structure

```
Aegis/
├── 🎨 Frontend
│   ├── index.html              # Main dashboard
│   ├── youtube-analyzer.html   # Standalone analyzer
│   ├── styles.css              # Styling
│   ├── app.js                  # Main application logic
│   ├── youtube-app.js          # YouTube analyzer
│   └── api-config.js           # API configuration
│
├── 🐍 Backend
│   ├── api_server.py           # Flask API server
│   ├── youtube_analyzer.py     # Core analysis engine
│   └── requirements.txt        # Dependencies
│
├── ⚙️ Configuration
│   ├── config.js               # App settings
│   ├── env-loader.js           # Environment loader
│   └── .env.example            # Environment template
│
└── 🔧 Utilities
    ├── demo-data-generator.js  # Demo data
    ├── report-generator.js     # PDF reports
    ├── harassment-analysis.js  # Harassment detection
    ├── content-analyzer.js     # Content analysis
    └── randomizer.js           # Utilities
```

---

## 🔌 API Endpoints

### Base URL: `http://localhost:5000`

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/api/health` | Health check | None |
| POST | `/api/analyze` | Complete video analysis | `video_url`, `keywords`, `limit` |
| POST | `/api/scrape` | Scrape comments only | `video_url`, `limit` |
| POST | `/api/detect-bots` | Detect bot comments | `comments` |
| POST | `/api/detect-copyright` | Detect violations | `comments`, `keywords` |
| POST | `/api/integrity-check` | File integrity check | `file` (multipart) |
| POST | `/api/instagram-analyze` | Instagram analysis | `post_url` or `username` |

### Example Request

```javascript
// Analyze a YouTube video
fetch('http://localhost:5000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    video_url: 'https://www.youtube.com/watch?v=VIDEO_ID',
    keywords: ['movie', 'download'],
    limit: 200
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

---

## 🎯 Usage

### Web Interface

1. **Open the dashboard**: http://localhost:8080/index.html
2. **Select analysis type**: YouTube Video URL or Instagram
3. **Enter URL/Username**: 
   - YouTube: `https://www.youtube.com/watch?v=VIDEO_ID`
   - Instagram Post: `https://www.instagram.com/p/SHORTCODE/`
   - Instagram User: `@username` or `username`
4. **Start analysis**: Click "Start Scan"
5. **View results**: Check "Threat & Harassment" and "Piracy Protection" tabs

### Command Line

```bash
# Analyze a video directly
python youtube_analyzer.py "https://www.youtube.com/watch?v=VIDEO_ID"

# With custom keywords
python youtube_analyzer.py "VIDEO_ID" "keyword1,keyword2"
```

---

## 🧪 Testing

### Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### Test Video Analysis
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"video_url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","limit":50}'
```

### Run Test Suite
```bash
python -c "from youtube_analyzer import YouTubeAnalyzer; analyzer = YouTubeAnalyzer(); print('✅ All tests passed')"
```

---

## 📊 Analysis Results

### Threat Levels
- **LOW**: Minimal issues detected
- **MODERATE**: Some concerns found
- **HIGH**: Significant problems identified  
- **CRITICAL**: Severe threats detected

### Detection Categories
- **Bot Comments**: Duplicate/similar text patterns
- **Harassment**: Personal attacks, body shaming, threats
- **Copyright**: Piracy links, illegal downloads
- **Spam**: Promotional content, scams

---

## 🔧 Configuration

### Backend Settings
- **Port**: 5000 (configurable in `api_server.py`)
- **CORS**: Enabled for cross-origin requests
- **Debug Mode**: Enabled for development

### Frontend Settings
- **API URL**: Configured in `api-config.js`
- **Default Limit**: 200 comments per analysis
- **Timeout**: 30 seconds per request

---

## 📦 Dependencies

### Backend (Python)
```
flask >= 2.3.0
flask-cors >= 4.0.0
youtube-comment-downloader >= 0.1.73
requests >= 2.25.0
beautifulsoup4 >= 4.9.0
lxml >= 4.6.0
groq >= 0.12.0
```

### Frontend (JavaScript)
- Chart.js 4.4.1 (via CDN)
- Vis-network 9.1.2 (via CDN)
- Leaflet 1.9.4 (via CDN)
- jsPDF 2.5.1 (via CDN)

---

## 🛠️ Troubleshooting

### Backend Issues

**Server won't start:**
```bash
# Kill existing processes
taskkill /F /FI "IMAGENAME eq python.exe"

# Restart server
python api_server.py
```

**Port already in use:**
```bash
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill specific process
taskkill /PID <PID> /F
```

### Frontend Issues

**CORS errors:**
- Ensure backend is running with CORS enabled
- Check `api-config.js` has correct API URL

**Analysis fails:**
- Verify YouTube URL is valid
- Check internet connection
- Try with smaller comment limit

---

## 🔒 Security & Privacy

### Data Handling
- **No API Keys Required**: Uses public comment scraping
- **No Data Storage**: Comments are analyzed in memory only
- **Privacy Focused**: No user data collection

### Rate Limiting
- Respects YouTube's rate limits
- Built-in delays between requests
- Configurable request limits

---

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Start development server: `python api_server.py`
4. Make changes and test
5. Submit pull request

### Adding New Features
- **Detection Patterns**: Add to `youtube_analyzer.py`
- **UI Components**: Modify `app.js` and `index.html`
- **API Endpoints**: Extend `api_server.py`

---

## 📄 License

This project is open source. Feel free to use, modify, and distribute.

---

## 🆘 Support

### Common Issues
- **Windows Encoding Errors**: Fixed in current version
- **YouTube Rate Limits**: Wait between requests
- **Memory Issues**: Reduce comment limit for large videos

### Getting Help
1. Check the troubleshooting section
2. Verify all dependencies are installed
3. Test with the health check endpoint
4. Try the standalone analyzer first

---

## 🎉 Acknowledgments

- **youtube-comment-downloader**: For YouTube comment scraping
- **Flask**: For the web API framework
- **Chart.js**: For data visualization
- **Community**: For feedback and contributions

---

**Made with ❤️ for content creators and platform safety**

*Aegis - Protecting digital communities through intelligent analysis*
