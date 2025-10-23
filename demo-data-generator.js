// Demo Data Generator for Hashtag/Keyword Analysis

const DemoDataGenerator = {
  // Sample hashtags by category
  hashtags: {
    movies: ['#movie', '#film', '#cinema', '#hollywood', '#bollywood', '#trailer', '#movienight'],
    piracy: ['#download', '#free', '#leaked', '#torrent', '#fullmovie', '#hdrip', '#camrip'],
    tech: ['#tech', '#technology', '#gadgets', '#innovation', '#ai', '#coding', '#programming'],
    gaming: ['#gaming', '#gamer', '#gameplay', '#esports', '#twitch', '#streamer', '#ps5'],
    music: ['#music', '#song', '#artist', '#album', '#spotify', '#concert', '#musician'],
    trending: ['#viral', '#trending', '#fyp', '#foryou', '#explore', '#popular', '#trend']
  },

  // Sample usernames by platform
  generateUsername(platform) {
    const prefixes = ['pro', 'real', 'official', 'the', 'mr', 'ms', 'king', 'queen'];
    const names = ['gamer', 'creator', 'fan', 'lover', 'master', 'expert', 'ninja', 'legend'];
    const suffixes = ['2024', 'hd', 'official', 'real', 'pro', 'tv', 'channel'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix}_${name}_${suffix}`;
  },

  // Sample comments with harassment patterns
  generateComments(keywords, count = 50) {
    const normalComments = [
      "Great content! Keep it up!",
      "This is amazing, thank you for sharing",
      "Love this! Can't wait for more",
      "Awesome work, very helpful",
      "Thanks for the information",
      "Interesting perspective on this",
      "Well explained and detailed",
      "This deserves more views",
      "Subscribed! Looking forward to more content",
      "Very informative, learned a lot"
    ];

    const harassmentComments = [
      "You're so ugly, nobody wants to see this",
      "Fat loser, go away",
      "This is disgusting, you should be ashamed",
      "Stupid idiot, you know nothing",
      "Kill yourself, nobody likes you",
      "You're pathetic and worthless",
      "Hate you so much, trash content",
      "You're a failure, give up already",
      "Disgusting pig, lose some weight",
      "Moron, stop making videos"
    ];

    const piracyComments = [
      "Download link: bit.ly/free-movie-2024",
      "Full movie available for free download",
      "Leaked version here: torrent-site.com",
      "Watch free HD rip on my channel",
      "Camrip available, DM for link",
      "Free download, no registration needed",
      "Pirated copy uploaded, check description",
      "Torrent magnet link in bio",
      "Stream free on my website",
      "Illegal download available now"
    ];

    const botComments = [
      "Click here for free prizes! bit.ly/win-now",
      "Make money online! Visit my profile",
      "Subscribe to my channel for giveaway",
      "Free gift cards! Check link in bio",
      "Earn $500 daily! Contact on WhatsApp"
    ];

    const comments = [];
    const keywordLower = keywords.toLowerCase();
    
    // Determine comment distribution based on keywords
    let harassmentRatio = 0.1;
    let piracyRatio = 0.1;
    let botRatio = 0.1;

    if (keywordLower.includes('leak') || keywordLower.includes('piracy') || keywordLower.includes('download')) {
      piracyRatio = 0.3;
    }
    if (keywordLower.includes('hate') || keywordLower.includes('harassment')) {
      harassmentRatio = 0.3;
    }

    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let commentText;
      let type = 'normal';

      if (rand < harassmentRatio) {
        commentText = harassmentComments[Math.floor(Math.random() * harassmentComments.length)];
        type = 'harassment';
      } else if (rand < harassmentRatio + piracyRatio) {
        commentText = piracyComments[Math.floor(Math.random() * piracyComments.length)];
        type = 'piracy';
      } else if (rand < harassmentRatio + piracyRatio + botRatio) {
        commentText = botComments[Math.floor(Math.random() * botComments.length)];
        type = 'bot';
      } else {
        commentText = normalComments[Math.floor(Math.random() * normalComments.length)];
      }

      comments.push({
        id: `demo_comment_${i}`,
        text: commentText,
        author: this.generateUsername('YouTube'),
        time: this.randomTimeAgo(),
        likes: Math.floor(Math.random() * 100),
        replies: Math.floor(Math.random() * 20),
        type: type
      });
    }

    return comments;
  },

  // Generate random time ago
  randomTimeAgo() {
    const units = [
      { name: 'second', max: 60 },
      { name: 'minute', max: 60 },
      { name: 'hour', max: 24 },
      { name: 'day', max: 30 },
      { name: 'month', max: 12 }
    ];

    const unit = units[Math.floor(Math.random() * units.length)];
    const value = Math.floor(Math.random() * unit.max) + 1;
    return `${value} ${unit.name}${value > 1 ? 's' : ''} ago`;
  },

  // Generate sample accounts based on keywords
  generateAccounts(keywords, count = 20) {
    const platforms = ['YouTube', 'Instagram', 'X', 'Facebook', 'TikTok', 'Telegram'];
    const accounts = [];

    for (let i = 0; i < count; i++) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const username = this.generateUsername(platform);
      
      accounts.push({
        id: `demo_account_${i}`,
        username: username,
        platform: platform,
        followers: Math.floor(Math.random() * 100000) + 1000,
        verified: Math.random() < 0.2,
        bio: `Content creator | ${keywords.split(',')[0]} enthusiast`,
        location: ['US', 'IN', 'UK', 'CA', 'AU'][Math.floor(Math.random() * 5)],
        riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        hashtags: keywords.split(',').map(k => k.trim()),
        lastActive: this.randomTimeAgo()
      });
    }

    return accounts;
  },

  // Generate piracy items
  generatePiracyItems(keywords, count = 10) {
    const platforms = ['YouTube', 'Telegram', 'Facebook', 'X', 'Torrent Sites'];
    const items = [];

    for (let i = 0; i < count; i++) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const match = 70 + Math.floor(Math.random() * 30); // 70-100% match
      
      items.push({
        id: `demo_piracy_${i}`,
        platform: platform,
        title: `${keywords.split(',')[0]} - Leaked/Pirated Copy`,
        match: match,
        date: this.randomTimeAgo(),
        url: `https://${platform.toLowerCase().replace(' ', '')}.com/pirated-content-${i}`,
        severity: match > 90 ? 'high' : (match > 75 ? 'medium' : 'low'),
        description: `Unauthorized distribution of copyrighted content found on ${platform}`
      });
    }

    return items;
  },

  // Generate complete demo analysis
  generateDemoAnalysis(keywords, hasFiles = false) {
    const comments = this.generateComments(keywords, 100);
    const accounts = this.generateAccounts(keywords, 25);
    const piracyItems = this.generatePiracyItems(keywords, 8);

    // Count harassment and piracy
    const harassmentComments = comments.filter(c => c.type === 'harassment');
    const piracyComments = comments.filter(c => c.type === 'piracy');
    const botComments = comments.filter(c => c.type === 'bot');

    // Determine threat level
    let threatLevel = 'LOW';
    if (harassmentComments.length > 15 || piracyComments.length > 10 || botComments.length > 20) {
      threatLevel = 'CRITICAL';
    } else if (harassmentComments.length > 8 || piracyComments.length > 5 || botComments.length > 10) {
      threatLevel = 'HIGH';
    } else if (harassmentComments.length > 3 || piracyComments.length > 2 || botComments.length > 5) {
      threatLevel = 'MODERATE';
    }

    return {
      success: true,
      demo: true,
      keywords: keywords,
      timestamp: new Date().toISOString(),
      statistics: {
        total_comments: comments.length,
        total_accounts: accounts.length,
        bot_comments: botComments.length,
        harassment_comments: harassmentComments.length,
        copyright_violations: piracyComments.length + piracyItems.length,
        threat_level: threatLevel
      },
      comments: comments,
      accounts: accounts,
      harassment_comments: harassmentComments.map(c => ({
        author: c.author,
        text: c.text,
        time: c.time,
        likes: c.likes,
        severity: 'high',
        type: 'harassment',
        comment_id: c.id
      })),
      harassment_indicators: this.generateHarassmentIndicators(harassmentComments),
      bot_indicators: this.generateBotIndicators(botComments),
      copyright_violations: piracyComments.map(c => ({
        author: c.author,
        text: c.text,
        time: c.time,
        likes: c.likes,
        severity: 'high',
        matched_patterns: ['download', 'free', 'leaked'],
        comment_id: c.id
      })),
      piracy_items: piracyItems,
      conclusion: this.generateConclusion(threatLevel, harassmentComments.length, piracyComments.length, botComments.length)
    };
  },

  generateHarassmentIndicators(harassmentComments) {
    const types = {};
    harassmentComments.forEach(c => {
      const text = c.text.toLowerCase();
      let type = 'general_harassment';
      
      if (text.includes('fat') || text.includes('ugly') || text.includes('disgusting')) {
        type = 'body_shaming';
      } else if (text.includes('kill') || text.includes('die')) {
        type = 'threats';
      } else if (text.includes('stupid') || text.includes('idiot') || text.includes('moron')) {
        type = 'personal_attacks';
      } else if (text.includes('hate') || text.includes('trash')) {
        type = 'hate_speech';
      }

      if (!types[type]) types[type] = [];
      types[type].push(c);
    });

    return Object.keys(types).map(type => ({
      type: type,
      severity: types[type].length > 5 ? 'high' : 'medium',
      count: types[type].length,
      examples: types[type].slice(0, 3)
    }));
  },

  generateBotIndicators(botComments) {
    if (botComments.length === 0) return [];

    return [{
      type: 'spam_pattern',
      severity: 'medium',
      count: botComments.length,
      examples: botComments.slice(0, 5)
    }];
  },

  generateConclusion(threatLevel, harassmentCount, piracyCount, botCount) {
    if (threatLevel === 'CRITICAL') {
      return `⚠️ CRITICAL THREAT DETECTED: Demo analysis shows ${harassmentCount} harassment comments, ${piracyCount} piracy-related comments, and ${botCount} bot/spam comments.\n\nThis is a demonstration of what Aegis would detect in real scenarios. Immediate action would be required for actual content with these patterns.\n\nRECOMMENDATION: In real scenarios, report to platform immediately and consider legal action.`;
    } else if (threatLevel === 'HIGH') {
      return `⚠️ HIGH THREAT LEVEL: Demo analysis reveals ${harassmentCount} harassment comments and ${piracyCount} piracy violations.\n\nThis demonstration shows how Aegis identifies harmful patterns. In real scenarios, close monitoring and reporting would be necessary.\n\nRECOMMENDATION: Monitor closely and document evidence for potential action.`;
    } else if (threatLevel === 'MODERATE') {
      return `⚠️ MODERATE CONCERNS: Demo analysis found ${harassmentCount} harassment comments and ${piracyCount} piracy-related content.\n\nThis is a demonstration of Aegis detection capabilities. Real scenarios would require continued monitoring.\n\nRECOMMENDATION: Continue monitoring and report specific violations.`;
    } else {
      return `✅ LOW THREAT: Demo analysis shows minimal concerns with ${harassmentCount} flagged comments.\n\nThis demonstration shows Aegis working with clean content. The system successfully identifies when communities are well-moderated.\n\nRECOMMENDATION: Routine monitoring sufficient.`;
    }
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.DemoDataGenerator = DemoDataGenerator;
}
