# Harassment Analysis with OpenAI - Integration Guide

## Overview
This guide explains how to integrate OpenAI-powered harassment analysis into your IMCPS application. All connection points are marked with `// CONNECT:` comments.

## Files Created
1. **harassment-analysis.js** - Contains the harassment analysis functions
2. **settings-update.html** - HTML snippet for the API key input field
3. **INTEGRATION_GUIDE.md** - This file

## Step-by-Step Integration

### Step 1: Add OpenAI API Key Field to Settings

**File:** `index.html`  
**Location:** Around line 228, inside the `<form id="settings-form">` section

Add this field BEFORE the "Trusted Accounts" textarea:

```html
<label for="openai-api-key">OpenAI API Key (for Harassment Analysis)</label>
<input 
  id="openai-api-key" 
  type="password" 
  placeholder="sk-..." 
  aria-describedby="api-key-tip"
/>
<div id="api-key-tip" class="tip">
  Required for AI-powered harassment analysis. Get your API key from 
  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">OpenAI Platform</a>. 
  Your key is stored locally and never sent to our servers.
</div>
```

### Step 2: Add Harassment Analysis Functions to app.js

**File:** `app.js`  
**Location:** Around line 356, BEFORE `// Mock API to simulate backend`

Copy the two main functions from `harassment-analysis.js`:
1. `analyzeHarassmentWithOpenAI(text, apiKey)`
2. `generateHarassmentReport(analysisData, scanContext)`

### Step 3: Update mockApi Object

**File:** `app.js`  
**Location:** Around line 370, inside the `mockApi` object

Add this method after `generateTakedown`:

```javascript
async analyzeHarassment(text, apiKey) {
  return await analyzeHarassmentWithOpenAI(text, apiKey);
}
```

### Step 4: Update Form Submit Handler

**File:** `app.js`  
**Location:** Around line 140, inside `scanForm.addEventListener('submit', ...)`

**Add AFTER `showScanning();` and BEFORE `const job = await mockApi.startScan(data);`:**

```javascript
// CONNECT: Check if harassment analysis is selected
const scanMode = $('#scan-mode').value;
let harassmentAnalysis = null;
let harassmentReport = null;

if (scanMode === 'harassment' || scanMode === 'both') {
  const apiKey = localStorage.getItem('imcps:openai_key');
  
  if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
    announce('⚠️ OpenAI API key not configured. Please add it in Settings.', 'error');
  } else {
    try {
      announce('Analyzing harassment with OpenAI...');
      
      // CONNECT: Collect text content from various sources
      const textToAnalyze = `
        Keywords: ${$('#keywords').value}
        Watchlist: ${$('#watchlist').value}
        Links: ${$('#links').value}
      `.trim();
      
      if (textToAnalyze.length > 20) {
        harassmentAnalysis = await mockApi.analyzeHarassment(textToAnalyze, apiKey);
        
        const scanContext = {
          filesCount: selectedFiles.length,
          keywords: $('#keywords').value,
          linksCount: ($('#links').value.split('\n').filter(l => l.trim()).length),
          scanMode: scanMode
        };
        
        harassmentReport = generateHarassmentReport(harassmentAnalysis, scanContext);
        announce('✅ Harassment analysis completed with OpenAI');
      }
    } catch (apiError) {
      console.error('OpenAI API Error:', apiError);
      announce('⚠️ OpenAI analysis failed: ' + apiError.message, 'error');
    }
  }
}
```

**Add AFTER `const result = await mockApi.pollResult(...);`:**

```javascript
// CONNECT: Add harassment report to results if available
if (harassmentReport) {
  result.reports.unshift({
    type: 'Harassment Analysis Report (HTML)',
    date: new Date().toLocaleString(),
    filename: `harassment_report_${Date.now()}.html`,
    content: harassmentReport,
    analysis: harassmentAnalysis
  });
}
```

### Step 5: Update populateReports Function

**File:** `app.js`  
**Location:** Around line 319, inside `populateReports` function

**Replace this line:**
```javascript
li.querySelector('button').addEventListener('click', ()=> downloadBlob(new Blob([r.content], {type:'application/pdf'}), r.filename));
```

**With:**
```javascript
li.querySelector('button').addEventListener('click', ()=> {
  // CONNECT: Determine content type based on file extension
  const isHTML = r.filename.endsWith('.html');
  const contentType = isHTML ? 'text/html' : 'application/pdf';
  downloadBlob(new Blob([r.content], {type: contentType}), r.filename);
});
```

### Step 6: Update Settings Form Handler

**File:** `app.js`  
**Location:** Around line 334-347, in the Settings section

**Add AFTER line 337 (after loading saved settings):**

```javascript
// CONNECT: Load OpenAI API key if exists
const savedApiKey = localStorage.getItem('imcps:openai_key');
if (savedApiKey && $('#openai-api-key')) {
  $('#openai-api-key').value = savedApiKey;
}
```

**Replace the submit handler (around line 338-347) with:**

```javascript
settingsForm.addEventListener('submit', e => {
  e.preventDefault();
  const payload = {
    defaultMode: $('#default-mode').value,
    continuous: $('#continuous-monitoring').checked,
    trusted: $('#trusted-accounts').value
  };
  localStorage.setItem('imcps:settings', JSON.stringify(payload));
  
  // CONNECT: Save OpenAI API key
  const apiKeyInput = $('#openai-api-key');
  if (apiKeyInput && apiKeyInput.value.trim()) {
    localStorage.setItem('imcps:openai_key', apiKeyInput.value.trim());
    announce('Settings saved (including OpenAI API key)');
  } else {
    announce('Settings saved');
  }
});
```

## How It Works

1. **User enters OpenAI API key** in Settings page
2. **Key is stored** in localStorage (client-side only)
3. **When "Harassment Analysis" mode is selected**, the system:
   - Collects text from keywords, watchlist, and social media links
   - Sends the text to OpenAI API for analysis
   - Receives structured analysis with severity, categories, sentiment, etc.
   - Generates a professional HTML report
   - Adds the report to the Reports tab
4. **User can download** the HTML report with all analysis details

## API Key Setup

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the key (starts with `sk-`)
5. Paste it in the Settings page of your IMCPS app
6. Save settings

## Cost Considerations

- **GPT-4**: ~$0.03 per analysis (more accurate)
- **GPT-3.5-turbo**: ~$0.002 per analysis (faster, cheaper)

To switch models, change line 23 in `harassment-analysis.js`:
```javascript
model: 'gpt-3.5-turbo', // Instead of 'gpt-4'
```

## Security Notes

- API key is stored in browser's localStorage
- Key is never sent to your server
- Key is only sent to OpenAI's API
- Use environment variables for production deployments
- Consider implementing server-side API key management for production

## Testing

1. Add your OpenAI API key in Settings
2. Go to Home tab
3. Enter some test keywords (e.g., "hate speech, threats, bullying")
4. Select "Harassment Analysis" mode
5. Click "Start Scan"
6. Wait for analysis to complete
7. Go to Reports tab
8. Download the "Harassment Analysis Report (HTML)"
9. Open the HTML file in a browser

## Troubleshooting

### "OpenAI API key not configured"
- Go to Settings and add your API key
- Make sure it starts with `sk-`

### "OpenAI analysis failed"
- Check browser console for error details
- Verify API key is valid
- Check OpenAI account has credits
- Verify internet connection

### Report not appearing
- Check browser console for errors
- Ensure text content is provided (keywords, links, or watchlist)
- Verify the scan mode is "Harassment Analysis" or "Both"

## Future Enhancements

1. **Real-time monitoring** - Continuous analysis of social media feeds
2. **Multi-language support** - Analyze content in different languages
3. **Custom training** - Fine-tune models for specific use cases
4. **Batch processing** - Analyze multiple files at once
5. **Integration with social media APIs** - Direct analysis of posts/comments
6. **Alert system** - Automatic notifications for high-risk content

## Support

For questions or issues, refer to:
- OpenAI API Documentation: https://platform.openai.com/docs
- This integration guide
- The commented code in harassment-analysis.js
