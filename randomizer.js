
const ResultRandomizer = {
  // Shuffle array using Fisher-Yates algorithm
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  
  randomSubset(array, min, max) {
    const shuffled = this.shuffle(array);
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    return shuffled.slice(0, Math.min(count, array.length));
  },

  // Generate random sentiment distribution
  randomSentiment(total) {
    const positive = Math.floor(Math.random() * total * 0.4) + Math.floor(total * 0.1);
    const hate = Math.floor(Math.random() * total * 0.3) + Math.floor(total * 0.05);
    const neutral = total - positive - hate;
    return { positive, neutral, hate };
  },

  // Generate unique timeline data
  randomTimeline(hours = 12) {
    const now = new Date();
    return Array.from({length: hours}, (_, i) => {
      const time = new Date(now.getTime() - (hours - i - 1) * 3600 * 1000);
      const baseValue = Math.floor(Math.random() * 80) + 20;
      const variance = Math.floor(Math.random() * 40) - 20;
      return {
        t: time.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
        v: Math.max(5, baseValue + variance)
      };
    });
  },

  // Assign random risk levels with weighted probability
  randomRisk() {
    const rand = Math.random();
    if (rand < 0.2) return 'High';
    if (rand < 0.6) return 'Medium';
    return 'Low';
  },

  // Generate varied match percentages
  randomMatch(baseMatch, variance = 10) {
    const match = baseMatch + (Math.random() * variance * 2 - variance);
    return Math.max(50, Math.min(99, Math.floor(match)));
  },

  // Create unique network connections
  generateNetwork(users, maxConnections = 15) {
    const nodes = users.map((user, idx) => ({
      id: idx + 1,
      label: '@' + user.username,
      value: Math.floor(user.followers / 10000) + Math.floor(Math.random() * 5) + 3
    }));

    const edges = [];
    const maxPossible = (nodes.length * (nodes.length - 1)) / 2; // Maximum possible connections
    const connectionCount = Math.min(maxConnections, maxPossible, Math.floor(nodes.length * 1.5));
    
    let attempts = 0;
    const maxAttempts = connectionCount * 3; // Prevent infinite loop
    
    while (edges.length < connectionCount && attempts < maxAttempts) {
      attempts++;
      
      const from = Math.floor(Math.random() * nodes.length);
      let to = Math.floor(Math.random() * nodes.length);
      
      // Ensure no self-connections
      if (to === from) {
        continue;
      }
      
      // Check if connection already exists
      const exists = edges.some(e => 
        (e.from === nodes[from].id && e.to === nodes[to].id) ||
        (e.from === nodes[to].id && e.to === nodes[from].id)
      );
      
      if (!exists) {
        edges.push({
          from: nodes[from].id,
          to: nodes[to].id,
          value: Math.floor(Math.random() * 5) + 1
        });
      }
    }

    return { nodes, edges };
  },

  // Vary geographic spread
  varyLocation(baseLat, baseLng, variance = 5) {
    return {
      lat: baseLat + (Math.random() * variance * 2 - variance),
      lng: baseLng + (Math.random() * variance * 2 - variance)
    };
  },

  // Generate unique scan ID
  generateScanId() {
    return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Add time-based variation
  timeBasedVariation() {
    const hour = new Date().getHours();
    // More activity during day hours
    if (hour >= 9 && hour <= 17) {
      return 1.3; // 30% more activity
    } else if (hour >= 18 && hour <= 23) {
      return 1.1; // 10% more activity
    }
    return 0.8; // 20% less activity at night
  },

  // Randomize severity levels
  randomSeverity(matchScore) {
    if (matchScore > 90) {
      return Math.random() < 0.8 ? 'high' : 'medium';
    } else if (matchScore > 75) {
      return Math.random() < 0.6 ? 'medium' : (Math.random() < 0.5 ? 'high' : 'low');
    } else {
      return Math.random() < 0.7 ? 'low' : 'medium';
    }
  },

  // Generate unique engagement patterns
  randomEngagement(baseEngagement) {
    const patterns = ['high', 'medium', 'low'];
    const weights = {
      'high': [0.6, 0.3, 0.1],
      'medium': [0.2, 0.6, 0.2],
      'low': [0.1, 0.3, 0.6]
    };
    
    const weight = weights[baseEngagement] || [0.33, 0.34, 0.33];
    const rand = Math.random();
    
    if (rand < weight[0]) return 'high';
    if (rand < weight[0] + weight[1]) return 'medium';
    return 'low';
  },

  // Add noise to prevent identical results
  addNoise(value, noisePercent = 10) {
    const noise = (Math.random() * noisePercent * 2 - noisePercent) / 100;
    return Math.floor(value * (1 + noise));
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResultRandomizer;
}
