// IMCPS Frontend Logic
// Simple, framework-free implementation with mock API wiring

(function(){
    const $ = (sel, ctx=document) => ctx.querySelector(sel);
    const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
    const statusBar = $('#status-bar');
    $('#year').textContent = new Date().getFullYear();
  
    // Navigation
    $$('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.target;
        $$('.tab').forEach(t => t.classList.remove('active'));
        $('#' + target).classList.add('active');
        // Announce
        announce(`Switched to ${btn.textContent} tab`);
        if(target === 'threat') initThreatTabOnce();
        if(target === 'piracy') {
          initPiracyTabOnce();
          // Fix map display when switching to piracy tab
          setTimeout(() => {
            if (map) {
              map.invalidateSize();
            }
          }, 100);
        }
        if(target === 'reports') initReportsTabOnce();
      });
    });
  
    // Accessibility helper
    function announce(message, type='info'){
      statusBar.hidden = false;
      statusBar.textContent = message;
      statusBar.setAttribute('data-type', type);
      // auto-hide after 5s for info
      if(type==='info') setTimeout(() => { statusBar.hidden = true; }, 5000);
    }
  
    // File uploads
    const dropZone = $('#drop-zone');
    const fileInput = $('#file-input');
    const fileList = $('#file-list');
    let selectedFiles = []; // [{id, file, url?}]
  
    function openFileDialog(){ fileInput.click(); }
  
    function allowDrop(e){ e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }
    function onDrop(e){
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      addFiles(files);
    }
    function onChangeInput(e){ addFiles(Array.from(e.target.files)); fileInput.value = ''; }
  
    function addFiles(files){
      const accepted = [
        'video/mp4','video/quicktime','audio/mpeg','audio/wav','image/jpeg','image/png','image/webp','application/pdf','application/zip'
      ];
      const newOnes = [];
      for(const f of files){
        if(!accepted.includes(f.type) && !['application/pdf','application/zip'].includes(f.type)){
          announce(`Unsupported file type: ${f.name}`, 'error');
          continue;
        }
        const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        newOnes.push({ id, file: f });
      }
      if(newOnes.length){
        selectedFiles = selectedFiles.concat(newOnes);
        renderFileList();
        announce(`${newOnes.length} file(s) added`);
      }
    }
  
    function renderFileList(){
      fileList.innerHTML = '';
      selectedFiles.forEach(item => {
        const li = document.createElement('li');
        li.className = 'file-item';
        const thumb = document.createElement('div');
        thumb.className = 'file-thumb';
        // preview for images
        if(item.file.type.startsWith('image/')){
          const img = document.createElement('img');
          img.alt = item.file.name;
          img.style.maxWidth = '100%';
          img.style.maxHeight = '100%';
          const url = URL.createObjectURL(item.file);
          img.onload = () => URL.revokeObjectURL(url);
          img.src = url;
          thumb.appendChild(img);
        } else {
          thumb.textContent = iconForType(item.file.type);
        }
        const name = document.createElement('div');
        name.className = 'file-name';
        name.textContent = `${item.file.name} • ${(item.file.size/1024/1024).toFixed(2)} MB`;
        const remove = document.createElement('button');
        remove.className = 'file-remove';
        remove.setAttribute('aria-label', `Remove ${item.file.name}`);
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => {
          selectedFiles = selectedFiles.filter(f => f.id !== item.id);
          renderFileList();
          announce(`${item.file.name} removed`);
        });
        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '8px';
        const checkBtn = document.createElement('button');
        checkBtn.className = 'btn';
        checkBtn.textContent = 'Integrity Check';
        const statusSpan = document.createElement('span');
        statusSpan.className = 'badge';
        statusSpan.style.marginLeft = '8px';
        checkBtn.addEventListener('click', async () => {
          try {
            checkBtn.disabled = true;
            statusSpan.textContent = 'Checking...';
            const fd = new FormData();
            fd.append('file', item.file, item.file.name);
            const res = await fetch(`${API_CONFIG.getEndpoint('INTEGRITY_CHECK')}`, {
              method: 'POST',
              body: fd
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Integrity check failed');
            const leaked = data.leak_check?.leaked;
            const sha = data.hash?.sha256?.slice(0, 12) || 'unknown';
            if (leaked) {
              statusSpan.textContent = `Leaked • sha256:${sha}`;
              statusSpan.className = 'badge danger';
              announce(`Leak suspected for ${item.file.name}.`, 'error');
            } else {
              statusSpan.textContent = `Clean • sha256:${sha}`;
              statusSpan.className = 'badge success';
              announce(`No leaks found for ${item.file.name}.`, 'success');
            }
          } catch (err) {
            statusSpan.textContent = 'Error';
            statusSpan.className = 'badge warn';
            announce('Integrity check error: ' + (err.message || 'Failed'), 'error');
          } finally {
            checkBtn.disabled = false;
          }
        });
        actions.appendChild(checkBtn);
        actions.appendChild(statusSpan);
        li.appendChild(thumb);
        li.appendChild(name);
        li.appendChild(actions);
        li.appendChild(remove);
        fileList.appendChild(li);
      });
    }
  
    function iconForType(type){
      if(type.startsWith('video/')) return '🎞️';
      if(type.startsWith('audio/')) return '🎵';
      if(type.startsWith('image/')) return '🖼️';
      if(type === 'application/pdf') return '📄';
      if(type === 'application/zip') return '🗜️';
      return '📁';
    }
  
    // Dropzone events
    ;['dragenter','dragover'].forEach(ev => dropZone.addEventListener(ev, e => { allowDrop(e); dropZone.classList.add('focus'); }));
    ;['dragleave','drop'].forEach(ev => dropZone.addEventListener(ev, () => dropZone.classList.remove('focus')));
    dropZone.addEventListener('drop', onDrop);
    dropZone.addEventListener('click', openFileDialog);
    dropZone.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openFileDialog(); }});
    fileInput.addEventListener('change', onChangeInput);
  
    // Form submit - YouTube Analysis
    const scanForm = $('#scan-form');
    const resetBtn = $('#reset-form');
    const API_URL = 'http://localhost:5000/api';
    
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
        if (url.length === 11 && !url.includes('/')) return url;
        return null;
    }
    
    scanForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const youtubeLink = $('#youtube-link').value.trim();
      const keywords = $('#keywords').value.trim();
      const scanMode = $('#scan-mode').value;
      const hasFiles = selectedFiles.length > 0;
      
      // Check if we have at least one input method
      if (!youtubeLink && !keywords && !hasFiles) {
          announce('Please enter YouTube URL, keywords/hashtags, or upload files to analyze', 'error');
          return;
      }
  
      try {
        showScanning();
        
        // If input looks like Instagram, call Instagram analyzer
        const igUsernameRegex = /^@?[A-Za-z0-9._]{1,30}$/;
        const igPostUrlRegex = /instagram\.com\/p\/[A-Za-z0-9_-]+\//i;
        const isInstagramUsername = !youtubeLink.includes('http') && igUsernameRegex.test(youtubeLink);
        const isInstagramPost = igPostUrlRegex.test(youtubeLink);

        if (isInstagramUsername || isInstagramPost) {
          const apifyToken = EnvConfig.get('APIFY_TOKEN') || '';
          const groqKey = EnvConfig.get('GROQ_API_KEY') || '';
          announce(`🔍 Analyzing Instagram ${isInstagramPost ? 'post' : 'user'}...`);
          const payload = isInstagramPost ? { post_url: youtubeLink } : { username: youtubeLink };
          if (apifyToken) payload.apify_token = apifyToken;
          if (groqKey) payload.groq_api_key = groqKey;
          payload.comments_limit = 30;
          const res = await fetch(API_CONFIG.getEndpoint('INSTAGRAM_ANALYZE'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const result = await res.json();
          if (!result.success) throw new Error(result.error || 'Instagram analysis failed');
          announce('✅ Instagram analysis completed successfully!', 'success');
          const appData = result.app_data;
          populateThreatTab(appData.threat);
          populatePiracyTab(appData.piracy);
          populateReports(appData.reports, appData.history);
        } else if (youtubeLink) {
          const videoId = extractVideoId(youtubeLink);
          if (!videoId) {
              announce('Invalid YouTube URL or video ID', 'error');
              hideScanning();
              return;
          }
          
          announce(`🔍 Analyzing YouTube video: ${videoId}...`);
          
          // Call YouTube Analyzer API
          const response = await fetch(`${API_URL}/analyze`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
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
          
          // Convert YouTube analysis to app format
          const appData = convertYouTubeToAppFormat(result, scanMode);
          
          // Populate tabs with result data
          populateThreatTab(appData.threat);
          populatePiracyTab(appData.piracy);
          populateReports(appData.reports, appData.history);
          
        } else {
          // Use hashtag/file-based analysis with demo data
          announce(`🔍 Analyzing based on ${keywords ? 'hashtags/keywords' : 'uploaded files'}...`);
          
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 2000));
          updateScanning(50);
          
          // Generate demo analysis
          const demoResult = typeof DemoDataGenerator !== 'undefined' 
            ? DemoDataGenerator.generateDemoAnalysis(keywords || 'general', hasFiles)
            : null;
          
          if (demoResult) {
            announce('✅ Demo analysis completed. Displaying results.');
            
            // Convert demo result to app format
            const appData = convertYouTubeToAppFormat(demoResult, scanMode);
            
            // Populate tabs with result data
            populateThreatTab(appData.threat);
            populatePiracyTab(appData.piracy);
            populateReports(appData.reports, appData.history);
          } else {
            // Fallback to old mock API
            const job = await mockApi.startScan(new FormData());
            announce('Scanning… job started: ' + job.id);
            
            const result = await mockApi.pollResult(job.id, (progress) => {
              updateScanning(progress);
            });
            
            announce('✅ Scan completed. Displaying results.');
            
            // Populate tabs with result data
            populateThreatTab(result.threat);
            populatePiracyTab(result.piracy);
            populateReports(result.reports, result.history);
          }
        }
        
        // Switch to relevant tab based on mode
        if(scanMode === 'harassment') selectTab('threat');
        else if(scanMode === 'piracy') selectTab('piracy');
        else selectTab('reports');
        
      } catch(err){
        console.error(err);
        announce('❌ Error: ' + (err.message || 'Analysis failed'), 'error');
      } finally {
        hideScanning();
      }
    });
  
    resetBtn.addEventListener('click', () => {
      selectedFiles = [];
      renderFileList();
      scanForm.reset();
      announce('Form cleared');
    });
  
    function showScanning(){
      statusBar.hidden = false;
      statusBar.textContent = 'Scanning… 0%';
      statusBar.classList.add('loading');
    }
    function updateScanning(p){
      statusBar.hidden = false;
      statusBar.textContent = `Scanning… ${p}%`;
    }
    function hideScanning(){
      statusBar.classList.remove('loading');
    }
  
    function selectTab(id){
      $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.target===id));
      $$('.tab').forEach(t => t.classList.toggle('active', t.id===id));
    }
  
    // Threat tab visuals
    let threatInit = false, sentimentChart, timelineChart, network;
    function initThreatTabOnce(){ if(threatInit) return; threatInit = true;
      // Initialize empty charts and network
      const sc = $('#sentiment-chart');
      sentimentChart = new Chart(sc, {
        type: 'doughnut',
        data: { labels: ['Positive','Neutral','Hate'], datasets: [{ data:[0,0,0], backgroundColor:['#28c76f','#74879a','#ff5c5c'] }] },
        options: { plugins:{legend:{labels:{color:'#e6edf3'}}} }
      });
      const tc = $('#timeline-chart');
      timelineChart = new Chart(tc, {
        type: 'line',
        data: { labels: [], datasets:[{ label:'Messages', data: [], borderColor:'#4aa3ff', tension:.2 }] },
        options: { scales:{ x:{ ticks:{color:'#9fb1c1'}}, y:{ ticks:{color:'#9fb1c1'} } }, plugins:{legend:{labels:{color:'#e6edf3'}}} }
      });
      const container = $('#network-graph');
      network = new vis.Network(container, {nodes:new vis.DataSet([]), edges:new vis.DataSet([])}, {
        nodes:{ shape:'dot', color:{background:'#4aa3ff', border:'#7c5cff'}, font:{color:'#e6edf3'} },
        edges:{ color:'#2b3a4b' },
        physics:{ stabilization:true }
      });
  
      // Export CSV
      $('#export-flagged').addEventListener('click', () => {
        const rows = [['Handle','Platform','Risk','Comment','LastSeen']].concat(currentFlagged.map(f => [f.handle, f.platform, f.risk, f.comment || '-', f.lastSeen]));
        const csv = rows.map(r => r.map(x => '"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');
        downloadBlob(new Blob([csv], {type:'text/csv'}), 'flagged_accounts.csv');
      });
      $('#flagged-filter').addEventListener('input', () => renderFlagged($('#flagged-filter').value));
    }
  
    function populateThreatTab(data){
      initThreatTabOnce();
      // Charts
      sentimentChart.data.datasets[0].data = [data.sentiment.positive, data.sentiment.neutral, data.sentiment.hate];
      sentimentChart.update();
      timelineChart.data.labels = data.timeline.map(p => p.t);
      timelineChart.data.datasets[0].data = data.timeline.map(p => p.v);
      timelineChart.update();
      // Network
      network.setData({ nodes: new vis.DataSet(data.network.nodes), edges: new vis.DataSet(data.network.edges) });
      // Flagged list
      currentFlagged = data.flagged;
      renderFlagged($('#flagged-filter').value);
    }
  
    let currentFlagged = [];
    function renderFlagged(filter=''){
      const tbody = $('#flagged-body');
      tbody.innerHTML = '';
      const items = currentFlagged.filter(f => (f.handle+f.platform).toLowerCase().includes(filter.toLowerCase()));
      items.forEach(f => {
        const tr = document.createElement('tr');
        const commentText = f.comment ? escapeHtml(f.comment).substring(0, 100) + (f.comment.length > 100 ? '...' : '') : '-';
        tr.innerHTML = `
          <td>${escapeHtml(f.handle)}</td>
          <td>${escapeHtml(f.platform)}</td>
          <td><span class="badge ${badgeClass(f.risk)}">${f.risk}</span></td>
          <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${f.comment ? escapeHtml(f.comment) : ''}">${commentText}</td>
          <td>${escapeHtml(f.lastSeen)}</td>
          <td>
            <a class="btn" href="${f.url}" target="_blank" rel="noopener">View</a>
          </td>`;
        tbody.appendChild(tr);
      });
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    function badgeClass(risk){
      if(risk==='High') return 'danger';
      if(risk==='Medium') return 'warn';
      return 'success';
    }
  
    // Piracy tab
    let piracyInit=false, map, piracyItems=[];
    function initPiracyTabOnce(){ if(piracyInit) return; piracyInit=true;
      map = L.map('spread-map', { zoomControl: true }).setView([20, 0], 2);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CartoDB', subdomains: 'abcd', maxZoom: 19 }).addTo(map);
      $('#filter-platform').addEventListener('change', renderPiracyList);
      $('#filter-severity').addEventListener('change', renderPiracyList);
    }
    function populatePiracyTab(data){
      initPiracyTabOnce();
      piracyItems = data.items || [];
      console.log('[Aegis] Populating Piracy tab with', piracyItems.length, 'items');
      renderPiracyList();
      
      // Clear existing markers
      if (map) {
        map.eachLayer(layer => {
          if (layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
          }
        });
      }
      
      // Map markers
      const layer = L.layerGroup();
      data.spread.forEach(p => {
        L.circleMarker([p.lat,p.lng], { radius:6, color: sevColor(p.severity) }).bindPopup(`${p.platform} • ${p.location}`).addTo(layer);
      });
      layer.addTo(map);
      
      // Fix map display after tab switch
      setTimeout(() => {
        if (map) {
          map.invalidateSize();
        }
      }, 100);
    }
    function sevColor(s){ return s==='high'?'#ff5c5c': s==='medium'?'#ffb020':'#28c76f'; }
  
    function renderPiracyList(){
      const container = $('#piracy-list');
      container.innerHTML = '';
      const pf = $('#filter-platform').value;
      const sv = $('#filter-severity').value;
      const items = piracyItems.filter(it => (pf==='all' || it.platform===pf) && (sv==='all' || it.severity===sv));
      
      console.log('[Aegis] Rendering piracy list:', items.length, 'items after filtering');
      
      if (items.length === 0) {
        container.innerHTML = '<div style="padding:40px;text-align:center;color:#999;">No piracy items detected. Run a scan to detect copyright violations.</div>';
        return;
      }
      
      items.forEach(it => {
        const row = document.createElement('div');
        row.className = 'list-item';
        row.innerHTML = `
          <div class="badge">${it.platform}</div>
          <div class="file-name">${it.title}</div>
          <div class="badge ${it.match>90?'danger':it.match>70?'warn':'success'}">${it.match}% match</div>
          <div class="badge">${it.date}</div>
          <div class="spacer"></div>
          <a class="btn" href="${it.url}" target="_blank" rel="noopener">Preview</a>
          <button class="btn danger">Generate Takedown</button>`;
        row.querySelector('.btn.danger').addEventListener('click', async () => {
          try{
            const res = await mockApi.generateTakedown(it.id);
            announce(res.message || 'Takedown prepared.');
          }catch(err){ announce('Failed to generate takedown', 'error'); }
        });
        container.appendChild(row);
      });
    }
  
    // Reports tab
    let reportsInit=false;
    function initReportsTabOnce(){ if(reportsInit) return; reportsInit=true; }
    function populateReports(reports, history){
      initReportsTabOnce();
      const rl = $('#reports-list');
      rl.innerHTML = '';
      
      // Handle new format with cybercrime and copyright reports
      if (reports.cybercrime && reports.copyright) {
        // Cybercrime report
        const cyberLi = document.createElement('li');
        cyberLi.innerHTML = `
          <div class="report-item">
            <div class="report-icon">📄</div>
            <div style="flex: 1;">
              <strong>${reports.cybercrime.title}</strong>
              <div class="report-meta">${reports.cybercrime.date}</div>
              ${reports.cybercrime.conclusion ? `<div class="report-conclusion" style="margin-top: 8px; padding: 12px; background: #0d1117; border-left: 3px solid #4aa3ff; font-size: 0.9em; white-space: pre-wrap;">${reports.cybercrime.conclusion}</div>` : ''}
            </div>
            <button class="btn">Download PDF</button>
          </div>`;
        cyberLi.querySelector('button').addEventListener('click', async ()=> {
          announce('Generating PDF report...', 'info');
          const pdfBlob = await generatePDF({type: 'Cybercrime', ...reports.cybercrime});
          downloadBlob(pdfBlob, 'cybercrime_report.pdf');
        });
        rl.appendChild(cyberLi);
        
        // Copyright report
        const copyrightLi = document.createElement('li');
        copyrightLi.innerHTML = `
          <div class="report-item">
            <div class="report-icon">⚖️</div>
            <div style="flex: 1;">
              <strong>${reports.copyright.title}</strong>
              <div class="report-meta">${reports.copyright.date}</div>
              ${reports.copyright.conclusion ? `<div class="report-conclusion" style="margin-top: 8px; padding: 12px; background: #0d1117; border-left: 3px solid #ffb74d; font-size: 0.9em; white-space: pre-wrap;">${reports.copyright.conclusion}</div>` : ''}
            </div>
            <button class="btn">Download PDF</button>
          </div>`;
        copyrightLi.querySelector('button').addEventListener('click', async ()=> {
          announce('Generating PDF report...', 'info');
          const pdfBlob = await generatePDF({type: 'Copyright', ...reports.copyright});
          downloadBlob(pdfBlob, 'copyright_report.pdf');
        });
        rl.appendChild(copyrightLi);
      } else {
        // Old format
        reports.forEach(r => {
          const li = document.createElement('li');
          li.innerHTML = `<div>${r.type} • ${r.date}</div><button class="btn">Download</button>`;
          li.querySelector('button').addEventListener('click', async ()=> {
            announce('Generating PDF report...', 'info');
            const pdfBlob = await generatePDF(r);
            downloadBlob(pdfBlob, r.filename);
          });
          rl.appendChild(li);
        });
      }
      
      const hl = $('#history-list');
      hl.innerHTML = '';
      history.forEach(h => {
        const li = document.createElement('li');
        li.innerHTML = `<div>${h.date} • Mode: ${h.type || h.mode} • ${h.videoUrl ? `Video: ${h.videoUrl}` : `Files: ${h.files || 0}`}</div><span class="badge ${h.status==='completed'||h.status==='Completed'?'success':(h.status==='Error'?'danger':'warn')}">${h.status}</span>`;
        hl.appendChild(li);
      });
    }
  
    // Settings
    const settingsForm = $('#settings-form');
    
    // Load from localStorage
    const saved = JSON.parse(localStorage.getItem('imcps:settings')||'{}');
    if(saved.defaultMode) $('#default-mode').value = saved.defaultMode;
    if(saved.continuous) $('#continuous-monitoring').checked = saved.continuous;
    if(saved.trusted) $('#trusted-accounts').value = saved.trusted;
    
    // Load API settings from environment
    $('#groq-api-key').value = EnvConfig.get('GROQ_API_KEY') || '';
    $('#groq-model').value = EnvConfig.get('GROQ_MODEL') || 'mixtral-8x7b-32768';
    $('#groq-enabled').checked = EnvConfig.get('GROQ_ENABLED') === 'true';
    
    settingsForm.addEventListener('submit', e => {
      e.preventDefault();
      
      // Save general settings
      const payload = {
        defaultMode: $('#default-mode').value,
        continuous: $('#continuous-monitoring').checked,
        trusted: $('#trusted-accounts').value
      };
      localStorage.setItem('imcps:settings', JSON.stringify(payload));
      
      // Save API settings to environment
      EnvConfig.save('GROQ_API_KEY', $('#groq-api-key').value);
      EnvConfig.save('GROQ_MODEL', $('#groq-model').value);
      EnvConfig.save('GROQ_ENABLED', $('#groq-enabled').checked ? 'true' : 'false');
      
      // Update config
      AegisConfig.groq.apiKey = $('#groq-api-key').value;
      AegisConfig.groq.model = $('#groq-model').value;
      AegisConfig.groq.enabled = $('#groq-enabled').checked;
      
      // Update Groq API
      if (typeof GroqAPI !== 'undefined') {
        GroqAPI.apiKey = $('#groq-api-key').value;
        GroqAPI.model = $('#groq-model').value;
      }
      
      announce('Settings saved successfully!');
    });
  
    // Utilities
    function downloadBlob(blob, filename){
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.href = url; a.download = filename; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  
    

    // PDF Generation with Groq API integration
    async function generatePDF(report){
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Get scan data
      const scanData = window.lastScanData || {
        flaggedAccounts: currentFlagged,
        piracyItems: piracyItems,
        keywords: 'General scan',
        totalUsers: 25,
        matchedUsers: 0,
        scanDate: new Date().toLocaleString()
      };
      
      // Generate report content using Groq API if available
      let reportContent = '';
      const reportType = report.type.includes('Cybercrime') ? 'cybercrime' : 'copyright';
      
      if (typeof GroqAPI !== 'undefined') {
        try {
          announce('Generating AI-powered report...', 'info');
          reportContent = await GroqAPI.generateReport(reportType, scanData);
        } catch (error) {
          console.error('Groq API error:', error);
          reportContent = GroqAPI.generateFallbackReport(reportType, scanData);
        }
      } else {
        // Use fallback if Groq not available
        reportContent = generateFallbackReportContent(reportType, scanData);
      }
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(74, 163, 255);
      doc.text('Aegis - AI Monitoring & Protection', 105, 20, { align: 'center' });
      
      // Report Title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(report.type, 105, 35, { align: 'center' });
      
      // Date and scan info
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${report.date}`, 105, 45, { align: 'center' });
      doc.text(`Scan Date: ${scanData.scanDate}`, 105, 50, { align: 'center' });
      doc.text(`Keywords: ${scanData.keywords}`, 105, 55, { align: 'center' });
      doc.text(`Matched: ${scanData.matchedUsers} of ${scanData.totalUsers} profiles`, 105, 60, { align: 'center' });
      
      // Divider line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 65, 190, 65);
      
      // Content
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      // Split content into lines that fit the page
      const lines = doc.splitTextToSize(reportContent, 170);
      let yPos = 75;
      const pageHeight = 280;
      const lineHeight = 6;
      
      lines.forEach(line => {
        if (yPos > pageHeight) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 20, yPos);
        yPos += lineHeight;
      });
      
      // Footer on last page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        doc.text('CONFIDENTIAL - For Authorized Use Only', 105, 285, { align: 'center' });
      }
      
      return doc.output('blob');
    }
    
    function generateFallbackReportContent(reportType, scanData) {
      const { flaggedAccounts, piracyItems, keywords, totalUsers, matchedUsers, scanDate } = scanData;
      
      if (reportType === 'cybercrime') {
        // Analyze threat severity
        const highRisk = flaggedAccounts.filter(a => a.risk === 'High').length;
        const mediumRisk = flaggedAccounts.filter(a => a.risk === 'Medium').length;
        const lowRisk = flaggedAccounts.filter(a => a.risk === 'Low').length;
        
        // Determine severity level
        const severityLevel = highRisk > 3 ? 'CRITICAL' : (highRisk > 0 ? 'HIGH' : (mediumRisk > 2 ? 'MODERATE' : 'LOW'));
        const urgency = highRisk > 3 ? 'IMMEDIATE ACTION REQUIRED' : (highRisk > 0 ? 'Urgent attention needed' : 'Standard monitoring recommended');
        
        // Analyze platforms
        const platforms = [...new Set(flaggedAccounts.map(a => a.platform))];
        const platformText = platforms.length > 1 ? `multiple platforms (${platforms.join(', ')})` : platforms[0] || 'social media';
        
        // Generate contextual summary
        let summary = '';
        if (highRisk > 3) {
          summary = `This investigation has uncovered a CRITICAL THREAT situation with ${highRisk} high-risk accounts actively engaged in potentially harmful activities. The scale and coordination of these accounts suggest an organized campaign requiring immediate intervention.`;
        } else if (highRisk > 0) {
          summary = `This investigation has identified ${highRisk} high-risk account${highRisk > 1 ? 's' : ''} that pose${highRisk === 1 ? 's' : ''} a significant threat and require urgent attention. The behavior patterns indicate serious policy violations that may escalate without intervention.`;
        } else if (mediumRisk > 2) {
          summary = `This investigation has detected ${mediumRisk} accounts with concerning behavior patterns that warrant monitoring. While not immediately critical, these accounts show indicators of potential escalation.`;
        } else {
          summary = `This investigation has completed a routine scan of ${totalUsers} profiles. ${flaggedAccounts.length} account${flaggedAccounts.length !== 1 ? 's have' : ' has'} been flagged for review based on established criteria.`;
        }
        
        // Generate threat analysis
        let threatAnalysis = '';
        if (highRisk > 0) {
          threatAnalysis = `CRITICAL FINDINGS:\n\nThe ${highRisk} high-risk account${highRisk > 1 ? 's' : ''} identified in this scan demonstrate${highRisk === 1 ? 's' : ''} clear indicators of malicious intent, including:\n- Coordinated harassment patterns\n- Targeted abuse campaigns\n- Potential threats to safety\n- Systematic policy violations\n\nThese accounts require IMMEDIATE reporting to law enforcement and platform authorities.`;
        } else if (mediumRisk > 0) {
          threatAnalysis = `The investigation identified ${mediumRisk} account${mediumRisk > 1 ? 's' : ''} with moderate risk levels showing concerning patterns such as:\n- Suspicious engagement patterns\n- Potential coordination with other accounts\n- Policy violations requiring attention\n- Behavior that may escalate\n\nContinued monitoring and documentation is recommended.`;
        } else {
          threatAnalysis = `The scan identified ${lowRisk} account${lowRisk > 1 ? 's' : ''} with low-level concerns. These accounts show minor indicators that warrant basic monitoring but do not currently pose significant threats.`;
        }
        
        return `THREAT LEVEL: ${severityLevel}
${urgency.toUpperCase()}

EXECUTIVE SUMMARY

${summary}

Scan Parameters:
- Total Profiles Analyzed: ${totalUsers}
- Matched Profiles: ${matchedUsers}
- Search Criteria: "${keywords}"
- Scan Date: ${scanDate}
- Platforms Affected: ${platformText}

THREAT ASSESSMENT - ${severityLevel} SEVERITY

Total Flagged Accounts: ${flaggedAccounts.length}
├─ High-Risk (Immediate Action): ${highRisk}
├─ Medium-Risk (Urgent Monitoring): ${mediumRisk}
└─ Low-Risk (Standard Review): ${lowRisk}

${threatAnalysis}

DETAILED ACCOUNT ANALYSIS

${flaggedAccounts.map((acc, idx) => {
  let accountAnalysis = `${idx + 1}. @${acc.handle} (${acc.platform})\n   Risk Level: ${acc.risk.toUpperCase()}`;
  
  if (acc.risk === 'High') {
    accountAnalysis += `\n   ⚠️ CRITICAL: This account requires immediate reporting to authorities.\n   Threat Indicators: Active harassment, coordinated attacks, or severe policy violations.\n   Recommended Action: File reports with platform and law enforcement within 24 hours.`;
  } else if (acc.risk === 'Medium') {
    accountAnalysis += `\n   ⚡ URGENT: This account shows concerning patterns requiring monitoring.\n   Threat Indicators: Suspicious activity, potential coordination, policy violations.\n   Recommended Action: Document activity and file platform reports within 48 hours.`;
  } else {
    accountAnalysis += `\n   ℹ️ MONITOR: This account shows minor indicators warranting observation.\n   Threat Indicators: Low-level concerns, potential future escalation.\n   Recommended Action: Continue monitoring and document any changes.`;
  }
  
  accountAnalysis += `\n   Last Activity: ${acc.lastSeen}\n   Profile URL: ${acc.url}`;
  return accountAnalysis;
}).join('\n\n')}

RECOMMENDED ACTIONS - PRIORITY ORDER

${highRisk > 0 ? `IMMEDIATE (Within 24 Hours):
1. Report all ${highRisk} high-risk account${highRisk > 1 ? 's' : ''} to platform trust & safety teams
2. File formal complaints with law enforcement cybercrime units
3. Document all evidence and preserve screenshots
4. Consider emergency protective measures for affected parties
5. Notify legal counsel for potential civil/criminal proceedings

` : ''}${mediumRisk > 0 ? `URGENT (Within 48 Hours):
1. Report ${mediumRisk} medium-risk account${mediumRisk > 1 ? 's' : ''} to platform abuse departments
2. Establish continuous monitoring protocols
3. Document all activity patterns and evidence
4. Prepare formal complaints for escalation if needed

` : ''}ONGOING:
1. Maintain active monitoring of all flagged accounts
2. Update documentation with new evidence
3. Review and reassess threat levels weekly
4. Implement preventive measures and security protocols

LEGAL CONSIDERATIONS

${highRisk > 0 ? 'CRITICAL: ' : ''}This report contains evidence that may be used in:
- Criminal cybercrime investigations
- Civil harassment restraining orders
- Platform Terms of Service enforcement actions
- Federal/state law enforcement proceedings
${highRisk > 0 ? '\nDue to the critical nature of findings, immediate legal consultation is recommended.' : ''}

CONCLUSION

${highRisk > 3 ? `⚠️ CRITICAL ALERT: This investigation has uncovered a serious threat situation requiring IMMEDIATE ACTION. The ${highRisk} high-risk accounts identified pose a clear and present danger. Law enforcement notification and emergency protective measures should be implemented without delay.` : 
  highRisk > 0 ? `⚠️ URGENT: This investigation has identified ${highRisk} high-risk account${highRisk > 1 ? 's' : ''} requiring immediate attention. Swift action is necessary to prevent potential escalation and protect affected parties.` :
  mediumRisk > 2 ? `This investigation has identified concerning patterns across ${mediumRisk} accounts. While not immediately critical, these findings warrant prompt attention and continued monitoring.` :
  `This investigation has completed a standard security scan. ${flaggedAccounts.length} account${flaggedAccounts.length !== 1 ? 's have' : ' has'} been flagged for review. Continue routine monitoring protocols.`}

Report Classification: ${severityLevel}
Next Review: ${highRisk > 0 ? '24 hours' : mediumRisk > 0 ? '48 hours' : '7 days'}`;
      } else {
        // Analyze piracy severity
        const highSeverity = piracyItems.filter(i => i.severity === 'high').length;
        const mediumSeverity = piracyItems.filter(i => i.severity === 'medium').length;
        const lowSeverity = piracyItems.filter(i => i.severity === 'low').length;
        
        // Determine urgency level
        const urgencyLevel = highSeverity > 5 ? 'CRITICAL' : (highSeverity > 2 ? 'HIGH' : (highSeverity > 0 ? 'MODERATE' : 'LOW'));
        const actionRequired = highSeverity > 5 ? 'IMMEDIATE LEGAL ACTION REQUIRED' : (highSeverity > 0 ? 'Urgent DMCA takedowns needed' : 'Standard enforcement recommended');
        
        // Analyze platforms
        const platforms = [...new Set(piracyItems.map(i => i.platform))];
        const avgMatch = Math.round(piracyItems.reduce((sum, i) => sum + i.match, 0) / piracyItems.length);
        
        // Generate contextual summary
        let summary = '';
        if (highSeverity > 5) {
          summary = `This investigation has uncovered a CRITICAL COPYRIGHT INFRINGEMENT situation with ${highSeverity} high-severity violations across ${platforms.length} platform${platforms.length > 1 ? 's' : ''}. The scale and match confidence (avg ${avgMatch}%) indicate systematic, large-scale piracy requiring immediate legal intervention.`;
        } else if (highSeverity > 2) {
          summary = `This investigation has identified ${highSeverity} high-severity copyright violations with an average match confidence of ${avgMatch}%. The evidence suggests organized content theft requiring urgent DMCA takedown actions.`;
        } else if (highSeverity > 0) {
          summary = `This investigation has detected ${piracyItems.length} instances of potential copyright infringement, including ${highSeverity} high-severity violation${highSeverity > 1 ? 's' : ''}. Prompt action is recommended to prevent further distribution.`;
        } else {
          summary = `This investigation has completed a copyright monitoring scan detecting ${piracyItems.length} potential violation${piracyItems.length !== 1 ? 's' : ''} across ${platforms.length} platform${platforms.length > 1 ? 's' : ''}. Standard enforcement procedures are recommended.`;
        }
        
        return `INFRINGEMENT LEVEL: ${urgencyLevel}
${actionRequired.toUpperCase()}

EXECUTIVE SUMMARY

${summary}

Scan Parameters:
- Total Profiles Analyzed: ${totalUsers}
- Matched Profiles: ${matchedUsers}
- Search Criteria: "${keywords}"
- Scan Date: ${scanDate}
- Average Match Confidence: ${avgMatch}%
- Platforms Affected: ${platforms.join(', ')}

COPYRIGHT VIOLATION ANALYSIS - ${urgencyLevel} PRIORITY

Total Violations Detected: ${piracyItems.length}
├─ High-Severity (Immediate Takedown): ${highSeverity}
├─ Medium-Severity (48-Hour Action): ${mediumSeverity}
└─ Low-Severity (Standard Monitoring): ${lowSeverity}

${highSeverity > 5 ? `⚠️ CRITICAL ALERT: The ${highSeverity} high-severity violations indicate a large-scale, organized piracy operation. This level of infringement suggests commercial piracy activity that may result in significant financial damages. Immediate legal counsel and law enforcement notification is strongly recommended.` :
  highSeverity > 2 ? `⚠️ URGENT: ${highSeverity} high-severity violations detected with high match confidence. This indicates active, widespread content theft requiring immediate DMCA takedown notices and potential legal action.` :
  highSeverity > 0 ? `${highSeverity} high-severity violation${highSeverity > 1 ? 's have' : ' has'} been detected. While not at critical levels, these violations require prompt DMCA action to prevent further distribution.` :
  `The scan detected ${piracyItems.length} potential violation${piracyItems.length !== 1 ? 's' : ''} of varying severity. Standard copyright enforcement procedures should be followed.`}

DETAILED INFRINGEMENT ANALYSIS

${piracyItems.map((item, idx) => {
  let analysis = `${idx + 1}. ${item.platform} - "${item.title}"\n   Match Confidence: ${item.match}%\n   Severity: ${item.severity.toUpperCase()}`;
  
  if (item.severity === 'high') {
    analysis += `\n   ⚠️ CRITICAL VIOLATION: High match confidence indicates clear copyright infringement.\n   Evidence: ${item.match}% content match detected\n   Action Required: File DMCA takedown notice within 24 hours\n   Legal Impact: Potential statutory damages and injunctive relief available`;
  } else if (item.severity === 'medium') {
    analysis += `\n   ⚡ URGENT VIOLATION: Significant match confidence suggests copyright infringement.\n   Evidence: ${item.match}% content match detected\n   Action Required: File DMCA takedown notice within 48 hours\n   Legal Impact: Document for potential escalation`;
  } else {
    analysis += `\n   ℹ️ MONITOR: Moderate match confidence warrants investigation.\n   Evidence: ${item.match}% content match detected\n   Action Required: Review and document, file DMCA if confirmed\n   Legal Impact: Standard enforcement procedures`;
  }
  
  analysis += `\n   Detection Date: ${item.date}\n   Platform URL: ${item.url}`;
  return analysis;
}).join('\n\n')}

DMCA TAKEDOWN STRATEGY - PRIORITY ORDER

${highSeverity > 0 ? `IMMEDIATE (Within 24 Hours):
1. File DMCA takedown notices for all ${highSeverity} high-severity violation${highSeverity > 1 ? 's' : ''}
2. Preserve all evidence (screenshots, URLs, timestamps, match data)
3. Document infringer information for repeat offender tracking
4. Notify legal counsel for potential statutory damages claims
5. Consider emergency injunctive relief if damages are substantial

` : ''}${mediumSeverity > 0 ? `URGENT (Within 48 Hours):
1. File DMCA takedown notices for ${mediumSeverity} medium-severity violation${mediumSeverity > 1 ? 's' : ''}
2. Monitor for compliance and re-uploads
3. Document all enforcement actions taken
4. Prepare escalation procedures for non-compliance

` : ''}ONGOING ENFORCEMENT:
1. Monitor all platforms for re-uploads and derivative works
2. Track repeat infringers for potential legal action
3. Update takedown notices as new violations are detected
4. Implement automated content ID systems where available
5. Review enforcement effectiveness monthly

PLATFORM-SPECIFIC ACTIONS

${platforms.map(platform => {
  const platformItems = piracyItems.filter(i => i.platform === platform);
  const platformHigh = platformItems.filter(i => i.severity === 'high').length;
  return `${platform}:
- Total Violations: ${platformItems.length}
- High-Severity: ${platformHigh}
- Action: ${platformHigh > 0 ? 'IMMEDIATE DMCA filing required' : 'Standard takedown procedures'}
- Contact: ${platform} Copyright Team / DMCA Agent`;
}).join('\n\n')}

LEGAL CONSIDERATIONS

${highSeverity > 5 ? '⚠️ CRITICAL LEGAL ALERT: ' : ''}This report documents copyright infringement evidence for:
- DMCA takedown notices (17 U.S.C. § 512)
- Statutory damages claims (up to $150,000 per work)
- Injunctive relief proceedings
- Criminal copyright infringement referrals (if willful, commercial scale)
${highSeverity > 5 ? '\nDue to the scale of infringement, immediate consultation with intellectual property counsel is strongly recommended. Consider filing for emergency injunctive relief and pursuing statutory damages.' : ''}

FINANCIAL IMPACT ASSESSMENT

${highSeverity > 5 ? `Estimated Potential Damages:
- Statutory Damages Range: $${(highSeverity * 750).toLocaleString()} - $${(highSeverity * 30000).toLocaleString()}
- Enhanced Damages (if willful): Up to $${(highSeverity * 150000).toLocaleString()}
- Actual Damages: Requires detailed analysis of distribution and views
- Attorney Fees: Recoverable under 17 U.S.C. § 505

The scale of infringement suggests commercial piracy activity warranting maximum statutory damages.` :
  highSeverity > 0 ? `Estimated Potential Damages:
- Statutory Damages Range: $${(highSeverity * 750).toLocaleString()} - $${(highSeverity * 30000).toLocaleString()}
- Actual Damages: Document views/downloads for calculation
- Attorney Fees: Potentially recoverable

Consider pursuing statutory damages for high-severity violations.` :
  `Standard copyright enforcement recommended. Document actual damages for potential future claims.`}

CONCLUSION

${highSeverity > 5 ? `⚠️ CRITICAL COPYRIGHT EMERGENCY: This investigation has uncovered large-scale, systematic copyright infringement with ${highSeverity} high-severity violations. The evidence suggests organized, commercial piracy operations. IMMEDIATE LEGAL ACTION is required including emergency DMCA takedowns, legal counsel consultation, and potential law enforcement notification. Delay may result in substantial financial damages and continued widespread infringement.` :
  highSeverity > 2 ? `⚠️ URGENT COPYRIGHT VIOLATION: ${highSeverity} high-severity infringements detected requiring immediate DMCA takedown actions. The match confidence levels indicate clear copyright theft. Swift enforcement action within 24 hours is necessary to prevent further distribution and preserve legal remedies.` :
  highSeverity > 0 ? `This investigation has identified ${highSeverity} high-severity copyright violation${highSeverity > 1 ? 's' : ''} requiring prompt DMCA takedown notices. While not at critical levels, timely action is necessary to protect intellectual property rights and prevent escalation.` :
  `This investigation has completed a standard copyright monitoring scan. ${piracyItems.length} potential violation${piracyItems.length !== 1 ? 's have' : ' has'} been documented. Follow standard DMCA enforcement procedures and continue routine monitoring.`}

Report Classification: ${urgencyLevel} PRIORITY
Next Review: ${highSeverity > 5 ? '12 hours' : highSeverity > 0 ? '24 hours' : mediumSeverity > 0 ? '48 hours' : '7 days'}
Legal Action Timeline: ${highSeverity > 0 ? 'IMMEDIATE' : mediumSeverity > 0 ? 'Within 48 hours' : 'Standard procedures'}`;
      }
    }

// Mock API to simulate backend
    const mockApi = {
      startScan(formData){
        return new Promise((resolve) => setTimeout(() => resolve({ id: 'job_'+Math.random().toString(36).slice(2,8) }), 500));
      },
      pollResult(jobId, onProgress){
        return new Promise((resolve, reject) => {
          let p = 0; const t = setInterval(() => { p += Math.floor(Math.random()*15)+5; if(p>100) p=100; onProgress?.(p); if(p>=100){ clearInterval(t); setTimeout(()=> resolve(sampleResult()), 600); } }, 500);
        });
      },
      generateTakedown(itemId){
        return new Promise((resolve) => setTimeout(() => resolve({ ok:true, message:`Takedown notice generated for ${itemId}` }), 600));
      }
    };
  



    // Convert YouTube analysis result to app format
    function convertYouTubeToAppFormat(ytResult, scanMode) {
      const stats = ytResult.statistics;
      const harassmentComments = ytResult.harassment_comments || [];
      const copyrightViolations = ytResult.copyright_violations || [];
      
      // Build flagged accounts from harassment
      const flaggedAccounts = harassmentComments.map(h => ({
        handle: h.author,
        platform: 'YouTube',
        risk: h.severity === 'high' ? 'High' : 'Medium',
        comment: h.text,
        lastSeen: h.time,
        url: ytResult.video_url
      }));
      
      // Build sentiment from harassment types
      const totalComments = stats.total_comments;
      const harassmentCount = stats.harassment_comments;
      const sentiment = {
        positive: Math.max(0, totalComments - harassmentCount - Math.floor(totalComments * 0.2)),
        neutral: Math.floor(totalComments * 0.2),
        hate: harassmentCount
      };
      
      // Build timeline (mock for now)
      const timeline = Array.from({length: 12}, (_,i)=> ({ 
        t: new Date(Date.now()- (11-i)*3600*1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), 
        v: Math.floor(Math.random()*50)+10 
      }));
      
      // Build network from harassment authors
      const uniqueAuthors = [...new Set(harassmentComments.map(h => h.author))].slice(0, 10);
      const network = {
        nodes: uniqueAuthors.map((author, idx) => ({
          id: idx + 1,
          label: author,
          value: 10
        })),
        edges: []
      };
      
      // Build piracy items from copyright violations
      const piracyItems = copyrightViolations.map((v, idx) => ({
        id: 'yt_' + idx,
        platform: 'YouTube',
        title: v.text.substring(0, 50) + '...',
        match: 85 + Math.floor(Math.random() * 15),
        date: v.time,
        url: ytResult.video_url,
        severity: v.severity
      }));
      
      // Build piracy spread (mock locations)
      const locations = [
        {lat: 37.7749, lng: -122.4194, location: 'San Francisco', platform: 'YouTube', severity: 'high'},
        {lat: 40.7128, lng: -74.0060, location: 'New York', platform: 'YouTube', severity: 'medium'},
        {lat: 51.5074, lng: -0.1278, location: 'London', platform: 'YouTube', severity: 'medium'},
      ];
      
      return {
        threat: {
          sentiment: sentiment,
          timeline: timeline,
          network: network,
          flagged: flaggedAccounts,
          scanId: 'yt_' + ytResult.video_id
        },
        piracy: {
          items: piracyItems,
          spread: locations.slice(0, Math.min(piracyItems.length, 5))
        },
        reports: {
          cybercrime: {
            title: 'YouTube Harassment Analysis Report',
            date: new Date().toLocaleDateString(),
            threatLevel: stats.threat_level,
            conclusion: ytResult.conclusion
          },
          copyright: {
            title: 'YouTube Copyright Violation Report',
            date: new Date().toLocaleDateString(),
            violationCount: stats.copyright_violations,
            conclusion: ytResult.conclusion
          }
        },
        history: [
          {
            id: ytResult.video_id,
            date: new Date().toLocaleString(),
            type: scanMode,
            status: 'completed',
            videoUrl: ytResult.video_url
          }
        ]
      };
    }
    
    function sampleResult(){
      const now = new Date();
      const scanId = typeof ResultRandomizer !== 'undefined' ? ResultRandomizer.generateScanId() : 'scan_' + Date.now();
      
      // Get user inputs
      const keywords = $('#keywords').value.toLowerCase().trim();
      const watchlist = $('#watchlist').value.toLowerCase().trim();
      
      // Use social media database if available
      const dbUsers = typeof socialMediaDatabase !== 'undefined' ? socialMediaDatabase.users : [];
      
      // Shuffle users for variety each time
      const shuffledUsers = typeof ResultRandomizer !== 'undefined' 
        ? ResultRandomizer.shuffle(dbUsers) 
        : dbUsers.sort(() => Math.random() - 0.5);
      
      // Filter users based on keywords and hashtags
      let matchedUsers = shuffledUsers;
      if (keywords) {
        const keywordList = keywords.split(',').map(k => k.trim().replace('#', ''));
        matchedUsers = shuffledUsers.filter(user => {
          const userContent = (user.hashtags + ' ' + user.comments + ' ' + user.username).toLowerCase();
          return keywordList.some(keyword => userContent.includes(keyword));
        });
      }
      
      // Filter by watchlist
      if (watchlist) {
        const watchAccounts = watchlist.split('\n').map(a => a.trim().toLowerCase().replace('@', ''));
        const watchFiltered = shuffledUsers.filter(user => 
          watchAccounts.some(acc => user.username.toLowerCase().includes(acc))
        );
        matchedUsers = [...new Set([...matchedUsers, ...watchFiltered])];
      }
      
      // If no matches, use random subset of all users
      if (matchedUsers.length === 0) {
        matchedUsers = typeof ResultRandomizer !== 'undefined'
          ? ResultRandomizer.randomSubset(shuffledUsers, 5, 15)
          : shuffledUsers.slice(0, 10);
      } else {
        // Randomize matched users order
        matchedUsers = typeof ResultRandomizer !== 'undefined'
          ? ResultRandomizer.shuffle(matchedUsers)
          : matchedUsers.sort(() => Math.random() - 0.5);
      }
      
      // Generate threat data with randomization
      const suspiciousKeywords = ['leak', 'piracy', 'free download', 'camrip', 'troll', 'hate', 'spam', 'fake', 'scam', 'bot'];
      const potentialFlags = matchedUsers.filter(user => {
        const content = (user.hashtags + ' ' + user.comments).toLowerCase();
        return suspiciousKeywords.some(keyword => content.includes(keyword));
      });
      
      // Get random subset of flagged accounts (different each time)
      const flagCount = Math.min(potentialFlags.length, Math.floor(Math.random() * 8) + 3);
      const selectedFlags = typeof ResultRandomizer !== 'undefined'
        ? ResultRandomizer.randomSubset(potentialFlags, Math.min(3, flagCount), flagCount)
        : potentialFlags.slice(0, flagCount);
      
      const flaggedAccounts = selectedFlags.map(user => ({
        handle: user.username,
        platform: user.platform,
        risk: typeof ResultRandomizer !== 'undefined' 
          ? ResultRandomizer.randomRisk() 
          : (Math.random() < 0.3 ? 'High' : (Math.random() < 0.6 ? 'Medium' : 'Low')),
        lastSeen: new Date(Date.now() - Math.random() * 86400000 * 7).toLocaleString(),
        url: 'https://' + user.platform.toLowerCase().replace(' ', '') + '.com/' + user.username
      }));
      
      // Add some random non-suspicious users as low risk
      const additionalUsers = matchedUsers.filter(u => !selectedFlags.includes(u));
      if (additionalUsers.length > 0 && Math.random() < 0.5) {
        const extraCount = Math.floor(Math.random() * 3) + 1;
        const extras = typeof ResultRandomizer !== 'undefined'
          ? ResultRandomizer.randomSubset(additionalUsers, 1, extraCount)
          : additionalUsers.slice(0, extraCount);
        
        extras.forEach(user => {
          flaggedAccounts.push({
            handle: user.username,
            platform: user.platform,
            risk: 'Low',
            lastSeen: new Date(Date.now() - Math.random() * 86400000 * 3).toLocaleString(),
            url: 'https://' + user.platform.toLowerCase().replace(' ', '') + '.com/' + user.username
          });
        });
      }
      
      // Calculate sentiment with randomization
      const totalComments = matchedUsers.length;
      const sentiment = typeof ResultRandomizer !== 'undefined'
        ? ResultRandomizer.randomSentiment(totalComments)
        : {
            positive: Math.floor(totalComments * (0.2 + Math.random() * 0.2)),
            neutral: Math.floor(totalComments * (0.4 + Math.random() * 0.2)),
            hate: 0
          };
      sentiment.hate = totalComments - sentiment.positive - sentiment.neutral;
      
      // Generate unique timeline
      const timeline = typeof ResultRandomizer !== 'undefined'
        ? ResultRandomizer.randomTimeline(12)
        : Array.from({length: 12}, (_,i)=> ({ 
            t: new Date(now.getTime()- (11-i)*3600*1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), 
            v: Math.floor(Math.random()*120)+10 
          }));
      
      // Build unique network from matched users
      const networkUsers = typeof ResultRandomizer !== 'undefined'
        ? ResultRandomizer.randomSubset(matchedUsers, 5, Math.min(10, matchedUsers.length))
        : matchedUsers.slice(0, 8);
      
      const network = typeof ResultRandomizer !== 'undefined'
        ? ResultRandomizer.generateNetwork(networkUsers)
        : {
            nodes: networkUsers.map((user, idx) => ({
              id: idx + 1,
              label: '@' + user.username,
              value: Math.floor(user.followers / 10000) + 5
            })),
            edges: []
          };
      
      // Threat data
      const threat = {
        sentiment: sentiment,
        timeline: timeline,
        network: network,
        flagged: flaggedAccounts,
        scanId: scanId
      };
  
      // Piracy data with randomization
      const piracyUsers = matchedUsers.filter(user => user.videos && user.videos.length > 0);
      
      let selectedPiracy;
      if (piracyUsers.length === 0) {
        // If no users with videos, use some matched users anyway for demo
        selectedPiracy = typeof ResultRandomizer !== 'undefined'
          ? ResultRandomizer.randomSubset(matchedUsers, 3, Math.min(5, matchedUsers.length))
          : matchedUsers.slice(0, 3);
      } else {
        const piracyCount = Math.min(piracyUsers.length, Math.floor(Math.random() * 8) + 3);
        selectedPiracy = typeof ResultRandomizer !== 'undefined'
          ? ResultRandomizer.randomSubset(piracyUsers, Math.min(3, piracyCount), piracyCount)
          : piracyUsers.slice(0, piracyCount);
      }
      
      const piracyItemsData = selectedPiracy.map((user, idx) => {
        const baseMatch = 95 - (idx * 5);
        const match = typeof ResultRandomizer !== 'undefined'
          ? ResultRandomizer.randomMatch(baseMatch, 8)
          : baseMatch + Math.floor(Math.random() * 10 - 5);
        
        const severity = typeof ResultRandomizer !== 'undefined'
          ? ResultRandomizer.randomSeverity(match)
          : (match > 90 ? 'high' : (match > 75 ? 'medium' : 'low'));
        
        return {
          id: 'db_' + user.id + '_' + Math.random().toString(36).substr(2, 5),
          platform: user.platform,
          title: user.videos[0]?.name || user.username + ' content',
          match: match,
          date: user.videos[0]?.uploadDate || new Date(Date.now() - Math.random() * 86400000 * 30).toLocaleDateString(),
          url: 'https://' + user.platform.toLowerCase().replace(' ', '') + '.com/' + user.username,
          severity: severity
        };
      });
      
      // Generate unique geographic spread
      const platformLocations = {
        'YouTube': { lat: 37.77, lng: -122.42, location: 'US' },
        'Instagram': { lat: 40.71, lng: -74.00, location: 'US' },
        'Facebook': { lat: -23.55, lng: -46.63, location: 'BR' },
        'X': { lat: 51.50, lng: -0.12, location: 'UK' },
        'Telegram': { lat: 19.07, lng: 72.88, location: 'IN' },
        'TikTok': { lat: 35.68, lng: 139.65, location: 'JP' },
        'Twitch': { lat: 48.85, lng: 2.35, location: 'FR' }
      };
      
      const spreadData = [];
      const platformCounts = {};
      matchedUsers.forEach(user => {
        platformCounts[user.platform] = (platformCounts[user.platform] || 0) + 1;
      });
      
      Object.keys(platformCounts).forEach(platform => {
        const baseLoc = platformLocations[platform] || { lat: 0, lng: 0, location: 'Unknown' };
        const loc = typeof ResultRandomizer !== 'undefined'
          ? ResultRandomizer.varyLocation(baseLoc.lat, baseLoc.lng, 3)
          : baseLoc;
        
        const severity = platformCounts[platform] > 5 ? 'high' : (platformCounts[platform] > 2 ? 'medium' : 'low');
        
        spreadData.push({
          platform: platform,
          location: baseLoc.location,
          lat: loc.lat,
          lng: loc.lng,
          severity: severity,
          count: platformCounts[platform]
        });
      });
      
      const piracy = {
        items: piracyItemsData,
        spread: spreadData.length > 0 ? spreadData : [
          {platform:'YouTube', location:'US', lat:37.77, lng:-122.42, severity:'high', count: 1},
          {platform:'Telegram', location:'IN', lat:19.07, lng:72.88, severity:'medium', count: 1}
        ],
        scanId: scanId
      };
  
      // Store unique scan data for report generation
      window.lastScanData = {
        flaggedAccounts: flaggedAccounts,
        piracyItems: piracyItemsData,
        keywords: keywords || 'All content',
        totalUsers: dbUsers.length,
        matchedUsers: matchedUsers.length,
        scanDate: new Date().toLocaleString(),
        scanId: scanId,
        uniqueHash: Math.random().toString(36).substr(2, 9)
      };
  
      // Reports
      const reports = [
        {type:'Cybercrime Report (PDF)', date: new Date().toLocaleString(), filename:`cybercrime_report_${scanId}.pdf`, scanId: scanId},
        {type:'Copyright Report (PDF)', date: new Date().toLocaleString(), filename:`copyright_report_${scanId}.pdf`, scanId: scanId}
      ];
      const history = [
        {date: new Date().toLocaleString(), mode: $('#scan-mode').value, files: selectedFiles.length, status:'Completed', scanId: scanId}
      ];
  
      console.log(`[Aegis] Generated unique scan: ${scanId} with ${matchedUsers.length} matched users`);
      return { threat, piracy, reports, history };
    }
  
    // Initialize default mode from settings
    const defaultMode = $('#default-mode').value;
    $('#scan-mode').value = defaultMode || 'both';
  })();
  