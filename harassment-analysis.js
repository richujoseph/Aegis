
/**
 * Analyzes text content for harassment using OpenAI API
 * CONNECT: This function calls OpenAI API for harassment analysis
 * @param {string} text - Text content to analyze
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Object>} Analysis results
 */
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: '', // CONNECT: You can change to 'gpt-3.5-turbo' for lower cost
        messages: [
          {
            role: 'system',
            content: 'You are an expert content moderator analyzing text for harassment, hate speech, threats, and toxic behavior. Provide detailed analysis with severity scores.'
          },
          {
            role: 'user',
            content: `Analyze the following text for harassment and provide a JSON response with:
1. overall_severity (0-100)
2. categories (array of detected issues: hate_speech, threats, cyberbullying, toxic_language, sexual_harassment)
3. sentiment (positive, neutral, negative, hate)
4. key_phrases (array of problematic phrases)
5. risk_level (Low, Medium, High, Critical)
6. detailed_analysis (brief explanation)
7. recommendations (suggested actions)

Text to analyze:
"${text.replace(/"/g, '\\"')}"` 
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    // Parse JSON from response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       analysisText.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, analysisText];
      analysis = JSON.parse(jsonMatch[1]);
    } catch (e) {
      // Fallback if parsing fails
      analysis = {
        overall_severity: 50,
        categories: ['unknown'],
        sentiment: 'neutral',
        key_phrases: [],
        risk_level: 'Medium',
        detailed_analysis: analysisText,
        recommendations: ['Manual review required']
      };
    }
    
    return analysis;
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }


/**
 * Generates a comprehensive harassment analysis report
 * CONNECT: This function generates an HTML report from the analysis
 * @param {Object} analysisData - Analysis results from OpenAI
 * @param {Object} scanContext - Context from the scan (files, keywords, etc.)
 * @returns {string} HTML report content
 */
function generateHarassmentReport(analysisData, scanContext) {
  const timestamp = new Date().toLocaleString();
  const reportId = 'HR-' + Date.now();
  
  const reportHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Harassment Analysis Report - ${reportId}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 1200px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
    .report-container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { border-bottom: 3px solid #ff5c5c; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0; color: #1a1a1a; font-size: 28px; }
    .header .meta { color: #666; margin-top: 10px; font-size: 14px; }
    .section { margin: 30px 0; }
    .section h2 { color: #333; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #4aa3ff; padding-left: 12px; }
    .severity-badge { display: inline-block; padding: 8px 16px; border-radius: 4px; font-weight: 600; font-size: 14px; }
    .severity-low { background: #d4edda; color: #155724; }
    .severity-medium { background: #fff3cd; color: #856404; }
    .severity-high { background: #f8d7da; color: #721c24; }
    .severity-critical { background: #721c24; color: white; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
    .info-card { background: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #4aa3ff; }
    .info-card h3 { margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; }
    .info-card .value { font-size: 24px; font-weight: 700; color: #1a1a1a; }
    .categories { display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0; }
    .category-tag { background: #ff5c5c; color: white; padding: 6px 12px; border-radius: 20px; font-size: 13px; }
    .key-phrases { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .recommendations { background: #d4edda; padding: 20px; border-radius: 6px; margin: 15px 0; }
    .analysis-text { background: #f8f9fa; padding: 20px; border-radius: 6px; line-height: 1.6; color: #333; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    table th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #ddd; }
    table td { padding: 12px; border-bottom: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <h1>🛡️ Harassment Analysis Report</h1>
      <div class="meta">
        <strong>Report ID:</strong> ${reportId} | <strong>Generated:</strong> ${timestamp} | <strong>System:</strong> IMCPS AI Monitoring
      </div>
    </div>
    <div class="section">
      <h2>Executive Summary</h2>
      <div class="info-grid">
        <div class="info-card"><h3>Risk Level</h3><div class="value"><span class="severity-badge severity-${(analysisData.risk_level || 'medium').toLowerCase()}">${analysisData.risk_level || 'Medium'}</span></div></div>
        <div class="info-card"><h3>Severity Score</h3><div class="value">${analysisData.overall_severity || 0}/100</div></div>
        <div class="info-card"><h3>Sentiment</h3><div class="value" style="text-transform: capitalize;">${analysisData.sentiment || 'Neutral'}</div></div>
        <div class="info-card"><h3>Issues Detected</h3><div class="value">${(analysisData.categories || []).length}</div></div>
      </div>
    </div>
    <div class="section">
      <h2>Detected Categories</h2>
      <div class="categories">${(analysisData.categories || []).map(cat => `<span class="category-tag">${cat.replace(/_/g, ' ').toUpperCase()}</span>`).join('')}</div>
    </div>
    ${(analysisData.key_phrases && analysisData.key_phrases.length > 0) ? `<div class="section"><h2>Key Problematic Phrases</h2><div class="key-phrases"><strong>⚠️ Flagged phrases:</strong><ul>${analysisData.key_phrases.map(phrase => `<li>${phrase}</li>`).join('')}</ul></div></div>` : ''}
    <div class="section">
      <h2>Detailed Analysis</h2>
      <div class="analysis-text">${analysisData.detailed_analysis || 'No detailed analysis available.'}</div>
    </div>
    <div class="section">
      <h2>Recommendations</h2>
      <div class="recommendations"><strong>✅ Suggested Actions:</strong><ul>${(analysisData.recommendations || ['No recommendations available']).map(rec => `<li>${rec}</li>`).join('')}</ul></div>
    </div>
    <div class="section">
      <h2>Scan Context</h2>
      <table>
        <tr><th>Parameter</th><th>Value</th></tr>
        <tr><td>Files Analyzed</td><td>${scanContext.filesCount || 0}</td></tr>
        <tr><td>Keywords</td><td>${scanContext.keywords || 'N/A'}</td></tr>
        <tr><td>Social Media Links</td><td>${scanContext.linksCount || 0} links provided</td></tr>
        <tr><td>Scan Mode</td><td>${scanContext.scanMode || 'Harassment Analysis'}</td></tr>
      </table>
    </div>
    <div class="footer">
      <p>This report was generated by IMCPS AI Monitoring System using OpenAI GPT-4 analysis.</p>
      <p><strong>Confidential:</strong> This report contains sensitive information and should be handled accordingly.</p>
    </div>
  </div>
</body>
</html>`;
  
  return reportHTML;
}
