// Aegis YouTube Analyzer Frontend
// Real-time YouTube comment analysis with bot detection and copyright violation detection

(function(){
    const $ = (sel, ctx=document) => ctx.querySelector(sel);
    const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
    const statusBar = $('#status-bar');
    const API_URL = 'http://localhost:5000/api';
    
    $('#year').textContent = new Date().getFullYear();
  
    // Navigation
    $$('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.target;
        $$('.tab').forEach(t => t.classList.remove('active'));
        $('#' + target).classList.add('active');
        announce(`Switched to ${btn.textContent} tab`);
        if(target === 'threat') initThreatTabOnce();
        if(target === 'piracy') {
          initPiracyTabOnce();
          setTimeout(() => {
            if (map) {
              map.invalidateSize();
            }
          }, 100);
        }
        if(target === 'results') initResultsTabOnce();
      });
    });
  
    function announce(message, type='info'){
      statusBar.hidden = false;
      statusBar.textContent = message;
      statusBar.setAttribute('data-type', type);
      if(type==='info') setTimeout(() => { statusBar.hidden = true; }, 5000);
    }

    // Check API health
    async function checkAPIHealth() {
        try {
            const response = await fetch(`${API_URL}/health`);
            const data = await response.json();
            if (data.status === 'online') {
                announce('✅ Connected to YouTube Analyzer API', 'success');
                return true;
            }
        } catch (error) {
            announce('❌ API Server not running. Please start: python api_server.py', 'error');
            return false;
        }
    }

    // Extract video ID from YouTube URL
    function extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        
        // Check if it's already a video ID
        if (url.length === 11 && !url.includes('/')) {
            return url;
        }
        
        return null;
    }

    // Form submit - Analyze YouTube video
    const scanForm = $('#scan-form');
    const resetBtn = $('#reset-form');
    
    scanForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const youtubeLink = $('#youtube-link').value.trim();
      const keywords = $('#keywords').value.trim();
      
      if (!youtubeLink) {
          announce('Please enter a YouTube URL or video ID', 'error');
          return;
      }

      const videoId = extractVideoId(youtubeLink);
      if (!videoId) {
          announce('Invalid YouTube URL or video ID', 'error');
          return;
      }

      try {
        showScanning();
        announce(`🔍 Analyzing YouTube video: ${videoId}...`);
        
        // Call API to analyze video
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                video_url: youtubeLink,
                keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
                limit: 200
            })
        });

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Analysis failed');
        }

        announce('✅ Analysis completed successfully!', 'success');
        
        // Display results
        displayResults(result);
        
        // Switch to results tab
        selectTab('results');
        
      } catch(err){
        console.error(err);
        announce('❌ Error: ' + (err.message || 'Analysis failed'), 'error');
      } finally {
        hideScanning();
      }
    });
  
    resetBtn.addEventListener('click', () => {
      scanForm.reset();
      announce('Form cleared');
    });
  
    function showScanning(){
      statusBar.hidden = false;
      statusBar.textContent = 'Analyzing YouTube video...';
      statusBar.classList.add('loading');
    }
    
    function hideScanning(){
      statusBar.classList.remove('loading');
    }
  
    function selectTab(id){
      $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.target===id));
      $$('.tab').forEach(t => t.classList.toggle('active', t.id===id));
    }

    // Display analysis results
    let currentResult = null;
    
    function displayResults(result) {
        currentResult = result;
        
        // Update statistics
        $('#total-comments').textContent = result.statistics.total_comments;
        $('#bot-comments').textContent = result.statistics.bot_comments;
        $('#copyright-violations').textContent = result.statistics.copyright_violations;
        $('#threat-level').textContent = result.statistics.threat_level;
        $('#threat-level').className = `badge ${getThreatClass(result.statistics.threat_level)}`;
        
        // Update video info
        $('#video-id-display').textContent = result.video_id;
        $('#video-url-display').href = result.video_url;
        $('#video-url-display').textContent = result.video_url;
        
        // Display comments
        displayComments(result.comments);
        
        // Display bot indicators
        displayBotIndicators(result.bot_indicators);
        
        // Display copyright violations
        displayCopyrightViolations(result.copyright_violations);
    }
    
    function getThreatClass(level) {
        switch(level) {
            case 'CRITICAL': return 'danger';
            case 'HIGH': return 'danger';
            case 'MODERATE': return 'warn';
            case 'LOW': return 'success';
            default: return 'success';
        }
    }
    
    function displayComments(comments) {
        const container = $('#comments-list');
        container.innerHTML = '';
        
        comments.slice(0, 50).forEach(comment => {
            const div = document.createElement('div');
            div.className = 'comment-item';
            div.innerHTML = `
                <div class="comment-header">
                    <img src="${comment.photo || 'https://via.placeholder.com/40'}" 
                         alt="${comment.author}" 
                         class="comment-avatar"
                         onerror="this.src='https://via.placeholder.com/40'">
                    <div class="comment-meta">
                        <strong>${escapeHtml(comment.author)}</strong>
                        <span class="comment-time">${escapeHtml(comment.time)}</span>
                    </div>
                </div>
                <div class="comment-text">${escapeHtml(comment.text)}</div>
                <div class="comment-stats">
                    <span>👍 ${comment.likes}</span>
                    <span>💬 ${comment.replies}</span>
                </div>
            `;
            container.appendChild(div);
        });
        
        if (comments.length > 50) {
            const more = document.createElement('div');
            more.className = 'comment-more';
            more.textContent = `... and ${comments.length - 50} more comments`;
            container.appendChild(more);
        }
    }
    
    function displayBotIndicators(indicators) {
        const container = $('#bot-indicators-list');
        container.innerHTML = '';
        
        if (indicators.length === 0) {
            container.innerHTML = '<div class="no-results">✅ No bot activity detected</div>';
            return;
        }
        
        indicators.forEach(indicator => {
            const div = document.createElement('div');
            div.className = `bot-indicator severity-${indicator.severity}`;
            
            let content = `
                <div class="indicator-header">
                    <span class="badge ${indicator.severity === 'high' ? 'danger' : 'warn'}">${indicator.severity.toUpperCase()}</span>
                    <strong>${indicator.type.replace('_', ' ').toUpperCase()}</strong>
                </div>
                <div class="indicator-details">
                    <p><strong>Count:</strong> ${indicator.count} occurrences</p>
            `;
            
            if (indicator.text) {
                content += `<p><strong>Text:</strong> "${escapeHtml(indicator.text)}"</p>`;
            }
            
            if (indicator.authors && indicator.authors.length > 0) {
                content += `<p><strong>Authors:</strong> ${indicator.authors.slice(0, 5).map(a => escapeHtml(a)).join(', ')}${indicator.authors.length > 5 ? '...' : ''}</p>`;
            }
            
            if (indicator.similarity) {
                content += `<p><strong>Similarity:</strong> ${indicator.similarity}</p>`;
            }
            
            content += `</div>`;
            div.innerHTML = content;
            container.appendChild(div);
        });
    }
    
    function displayCopyrightViolations(violations) {
        const container = $('#copyright-violations-list');
        container.innerHTML = '';
        
        if (violations.length === 0) {
            container.innerHTML = '<div class="no-results">✅ No copyright violations detected</div>';
            return;
        }
        
        violations.forEach(violation => {
            const div = document.createElement('div');
            div.className = `violation-item severity-${violation.severity}`;
            div.innerHTML = `
                <div class="violation-header">
                    <span class="badge ${violation.severity === 'high' ? 'danger' : 'warn'}">${violation.severity.toUpperCase()}</span>
                    <strong>${escapeHtml(violation.author)}</strong>
                    <span class="violation-time">${escapeHtml(violation.time)}</span>
                </div>
                <div class="violation-text">${escapeHtml(violation.text)}</div>
                <div class="violation-matches">
                    ${violation.matched_patterns.length > 0 ? `<p><strong>Patterns:</strong> ${violation.matched_patterns.length} piracy patterns detected</p>` : ''}
                    ${violation.keyword_matches.length > 0 ? `<p><strong>Keywords:</strong> ${violation.keyword_matches.map(k => escapeHtml(k)).join(', ')}</p>` : ''}
                </div>
                <div class="violation-stats">
                    <span>👍 ${violation.likes} likes</span>
                </div>
            `;
            container.appendChild(div);
        });
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Download results as JSON
    $('#download-results').addEventListener('click', () => {
        if (!currentResult) {
            announce('No results to download', 'error');
            return;
        }
        
        const dataStr = JSON.stringify(currentResult, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aegis_analysis_${currentResult.video_id}_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        announce('Results downloaded successfully', 'success');
    });
    
    // Initialize results tab
    let resultsInit = false;
    function initResultsTabOnce() {
        if (resultsInit) return;
        resultsInit = true;
        console.log('Results tab initialized');
    }
    
    // Piracy tab (legacy support)
    let piracyInit = false, map;
    function initPiracyTabOnce() {
        if (piracyInit) return;
        piracyInit = true;
        // Initialize map if needed
    }
    
    // Threat tab (legacy support)
    let threatInit = false;
    function initThreatTabOnce() {
        if (threatInit) return;
        threatInit = true;
        // Initialize charts if needed
    }
    
    // Check API on load
    window.addEventListener('load', () => {
        checkAPIHealth();
    });
    
})();
