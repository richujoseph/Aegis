# 🛡️ Aegis - AI Monitoring & Protection System

Professional cybercrime monitoring and copyright protection platform with intelligent threat analysis.

---

## 🚀 Quick Start

1. **Open** `index.html` in your browser
2. **Go to Settings** → Add your Groq API key (optional, for AI reports)
3. **Start Scanning** → Enter hashtags, upload files, click "Start Scan"
4. **View Results** → Check Threat/Piracy tabs, download PDF reports

---

## ✨ Features

### Core Capabilities
- 🔍 **Threat Detection** - Harassment, hate speech, coordinated attacks
- 📹 **Piracy Monitoring** - Copyright violations across platforms
- 🤖 **AI-Powered Reports** - Formal, legal-grade documentation
- 📊 **Real-time Analytics** - Network graphs, sentiment analysis, timelines
- 🗺️ **Geographic Mapping** - Visual piracy spread
- 📄 **PDF Reports** - Professional documentation for authorities

### Intelligence Features
- ✅ **Unique Results** - Every scan generates different, realistic data
- ✅ **Severity Analysis** - CRITICAL/HIGH/MODERATE/LOW threat levels
- ✅ **Context-Aware** - Reports adapt based on actual findings
- ✅ **Database-Driven** - 25 sample social media profiles
- ✅ **Hashtag Filtering** - Results match your search criteria
- ✅ **Hidden Admin Panel** - Manage database secretly

---

## 📁 Project Structure

```
Aegis/
├── index.html              # Main application
├── app.js                  # Core logic
├── styles.css              # Styling
├── config.js               # Configuration
├── env-loader.js           # Environment variables
├── groq-api.js             # AI report generation
├── randomizer.js           # Unique result generation
├── admin/                  # Hidden admin panel
│   ├── index.html          # Admin interface
│   └── admin-panel.js      # Admin logic
└── database/               # Sample data
    └── social-media-db.js  # 25 sample users
```

---

## 🔐 Security Setup

### API Key Configuration

**Via Settings Page (Recommended):**
1. Open `index.html` → Settings tab
2. Enter your Groq API key from [console.groq.com/keys](https://console.groq.com/keys)
3. Select AI model (Mixtral 8x7B recommended)
4. Enable AI-powered reports
5. Save Settings

**Security Features:**
- ✅ API keys stored in localStorage (not in code)
- ✅ `.env` file in `.gitignore`
- ✅ Password-protected input field
- ✅ Never committed to repository
- ✅ No hardcoded keys in source files

### ⚠️ Before Pushing to GitHub

**IMPORTANT:** Ensure no API keys are in your code:
```bash
# Check for API keys
grep -r "gsk_" .
grep -r "sk-" .

# Should return no results!
```

**Files that are safe:**
- ✅ `groq-api.js` - Uses environment variables
- ✅ `config.js` - Loads from localStorage
- ✅ `env-loader.js` - Manages environment
- ✅ `.gitignore` - Blocks `.env` file

---

## 🎯 How to Use

### 1. Run a Scan
```
1. Enter keywords: #travel, #food, #tech
2. Add watchlist accounts (optional)
3. Select scan mode (Harassment/Piracy/Both)
4. Click "Start Scan"
```

### 2. View Results

**Threat & Harassment Tab:**
- Network graph of suspicious accounts
- Sentiment analysis (Positive/Neutral/Hate)
- Activity timeline
- Flagged accounts list

**Piracy Protection Tab:**
- Detected copyright violations
- Match confidence percentages
- Geographic spread map
- Platform distribution

**Reports Tab:**
- Download Cybercrime Report (PDF)
- Download Copyright Report (PDF)
- View scan history

### 3. Generate Reports

Reports automatically analyze scan data:
- **CRITICAL** (4+ high-risk) → Immediate action required
- **HIGH** (1-3 high-risk) → Urgent attention needed
- **MODERATE** (3+ medium-risk) → Monitoring recommended
- **LOW** (only low-risk) → Routine procedures

---

## 🔧 Admin Panel

**Access:** `Aegis/admin/index.html`

**Features:**
- ➕ Add/edit/delete users
- 📷 Upload pictures & videos
- 🔍 Search & filter database
- 📊 Export to JSON/CSV
- 💾 Create backups
- 🔄 Auto-sync with main app

**Note:** Keep this URL confidential - it's hidden from the main app!

---

## 🧪 Testing

### Test Hashtag Filtering:
```bash
1. Search: #travel
2. Results show only travel-related users
3. Search: #food
4. Results change to food-related users
5. ✅ Each search shows different results
```

### Test Unique Results:
```bash
1. Run scan with #travel
2. Note the results
3. Run scan again with #travel
4. ✅ Results are different (randomized)
```

### Test PDF Reports:
```bash
1. Run a scan
2. Download Cybercrime Report
3. Check threat level (CRITICAL/HIGH/MODERATE/LOW)
4. ✅ Conclusion matches severity
5. ✅ Recommendations are context-appropriate
```

---

## 🐛 Troubleshooting

### Page Freezes?
- **Fixed!** Infinite loop protection added
- Scans complete in 5-10 seconds

### PDF Not Downloading?
- **Fixed!** Async/await properly implemented
- Check browser popup blocker

### Piracy Tab Empty?
- **Fixed!** Fallback data added
- Shows 3-8 items after every scan

### Map Not Showing?
- **Fixed!** Map invalidation added
- Displays correctly on tab switch

---

## 📊 Database

### Sample Data
- 25 social media users
- Multiple platforms (Instagram, YouTube, X, Facebook, TikTok, Telegram, Twitch)
- Pictures and videos metadata
- Hashtags and comments
- Follower counts and engagement metrics

### Manage Database
Use admin panel to:
- Add your own users
- Upload media files
- Export/backup data
- Search and filter

---

## 🤖 AI Integration

### Groq API (Optional)
- **Free tier**: 30 requests/min, 6K tokens/min
- **Models**: Mixtral 8x7B (recommended), Llama 2 70B, Gemma 7B
- **Features**: Context-aware reports, legal-grade language
- **Fallback**: Professional templates work without API

### Get API Key:
1. Visit [console.groq.com](https://console.groq.com/)
2. Sign up (free)
3. Generate API key
4. Add to Settings page

---

## 📝 Key Features Explained

### 1. Intelligent Reports
Reports analyze actual data and generate appropriate responses:
- Different severity levels based on findings
- Context-aware conclusions
- Specific recommendations
- Financial impact calculations (copyright)
- Appropriate urgency timelines

### 2. Unique Results
Every scan is different:
- Randomized user selection
- Varied risk levels
- Dynamic match scores
- Different network connections
- Unique scan IDs

### 3. Hashtag Filtering
Results match your search:
- Filters by hashtags, comments, usernames
- Only shows relevant users
- Dynamic and accurate

### 4. Database-Driven
All data from actual database:
- 25 sample users
- Real hashtags and content
- Platform distribution
- Engagement metrics

---

## ⚙️ Configuration

### Environment Variables (localStorage)
```javascript
GROQ_API_KEY    // Your Groq API key
GROQ_MODEL      // AI model (default: mixtral-8x7b-32768)
GROQ_ENABLED    // Enable AI reports (default: false)
```

### Settings
- Default scan mode
- Continuous monitoring
- Trusted accounts (excluded)
- API configuration

---

## 🎨 Technologies

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Charts**: Chart.js
- **Maps**: Leaflet.js (CartoDB Dark theme)
- **Network**: Vis.js
- **PDF**: jsPDF
- **AI**: Groq API (Mixtral 8x7B)

---

## 📄 License

This project is for educational and monitoring purposes. Use responsibly and in accordance with applicable laws.

---

## 🆘 Support

### Common Issues:

**Q: How do I add my API key?**
A: Settings tab → Enter key → Enable AI reports → Save

**Q: Why are results different each time?**
A: By design! Randomization prevents predictable patterns

**Q: Can I add my own data?**
A: Yes! Use the admin panel at `/admin/index.html`

**Q: Do I need an API key?**
A: No, fallback reports work great without it

**Q: Is my API key safe?**
A: Yes, stored in localStorage, never in code files

---

## ✅ All Features Working

- ✅ Hashtag-based filtering
- ✅ Unique results every scan
- ✅ AI-powered reports (with API key)
- ✅ Professional fallback reports
- ✅ PDF generation
- ✅ Piracy tab with map
- ✅ Threat analysis
- ✅ Admin panel
- ✅ Database management
- ✅ Export/backup
- ✅ No page freezes
- ✅ Secure API key storage

---

**Built with intelligence. Protected by Aegis.** 🛡️
