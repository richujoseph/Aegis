// Social Media Database Module
// This contains sample data for scanning and testing purposes

const socialMediaDatabase = {
  users: [
    {
      id: 1,
      username: 'sarah_travels',
      platform: 'Instagram',
      pictures: [
        { name: 'thailand_beach.jpg', size: 2048576, type: 'image/jpeg', uploadDate: '2024-01-15' },
        { name: 'mountain_view.jpg', size: 1536000, type: 'image/jpeg', uploadDate: '2024-01-20' }
      ],
      videos: [
        { name: 'travel_vlog.mp4', size: 15728640, type: 'video/mp4', uploadDate: '2024-01-18' }
      ],
      hashtags: '#travel, #adventure, #nature',
      comments: 'Love exploring new places! Currently in Thailand 🌍',
      followers: 45200,
      engagement: 'high'
    },
    {
      id: 2,
      username: 'mike_fitness',
      platform: 'YouTube',
      pictures: [
        { name: 'gym_setup.jpg', size: 1843200, type: 'image/jpeg', uploadDate: '2024-02-01' }
      ],
      videos: [
        { name: 'workout_routine.mp4', size: 25165824, type: 'video/mp4', uploadDate: '2024-02-03' },
        { name: 'diet_tips.mp4', size: 18874368, type: 'video/mp4', uploadDate: '2024-02-05' }
      ],
      hashtags: '#fitness, #health, #gym',
      comments: 'Stay motivated and keep pushing! New workout video up 💪',
      followers: 78900,
      engagement: 'high'
    },
    {
      id: 3,
      username: 'anna_foodie',
      platform: 'Instagram',
      pictures: [
        { name: 'pasta_dish.jpg', size: 2097152, type: 'image/jpeg', uploadDate: '2024-02-10' },
        { name: 'dessert_plate.jpg', size: 1572864, type: 'image/jpeg', uploadDate: '2024-02-12' }
      ],
      videos: [
        { name: 'cooking_tutorial.mp4', size: 20971520, type: 'video/mp4', uploadDate: '2024-02-11' }
      ],
      hashtags: '#food, #cooking, #recipes',
      comments: 'Trying out new pasta recipe today! Recipe in bio',
      followers: 32100,
      engagement: 'medium'
    },
    {
      id: 4,
      username: 'robert_music',
      platform: 'X',
      pictures: [
        { name: 'studio_session.jpg', size: 1310720, type: 'image/jpeg', uploadDate: '2024-02-15' }
      ],
      videos: [
        { name: 'guitar_cover.mp4', size: 12582912, type: 'video/mp4', uploadDate: '2024-02-16' }
      ],
      hashtags: '#music, #guitar, #livemusic',
      comments: 'Just finished recording my new single! Drop coming soon',
      followers: 56700,
      engagement: 'high'
    },
    {
      id: 5,
      username: 'richu_tech',
      platform: 'YouTube',
      pictures: [
        { name: 'tech_setup.jpg', size: 2621440, type: 'image/jpeg', uploadDate: '2024-02-20' }
      ],
      videos: [
        { name: 'tech_review.mp4', size: 31457280, type: 'video/mp4', uploadDate: '2024-02-21' },
        { name: 'unboxing.mp4', size: 22020096, type: 'video/mp4', uploadDate: '2024-02-23' }
      ],
      hashtags: '#technology, #coding, #programming',
      comments: 'New tech review is live! Check out this amazing setup',
      followers: 92300,
      engagement: 'high'
    },
    {
      id: 6,
      username: 'dayo_art',
      platform: 'Instagram',
      pictures: [
        { name: 'painting_1.jpg', size: 3145728, type: 'image/jpeg', uploadDate: '2024-02-25' },
        { name: 'sketch_work.jpg', size: 1048576, type: 'image/jpeg', uploadDate: '2024-02-27' }
      ],
      videos: [],
      hashtags: '#art, #painting, #creative',
      comments: 'Finished this piece after 20 hours of work! What do you think?',
      followers: 28400,
      engagement: 'medium'
    },
    {
      id: 7,
      username: 'antony_photos',
      platform: 'Instagram',
      pictures: [
        { name: 'landscape_1.jpg', size: 4194304, type: 'image/jpeg', uploadDate: '2024-03-01' },
        { name: 'golden_hour.jpg', size: 3670016, type: 'image/jpeg', uploadDate: '2024-03-02' },
        { name: 'mountain_sunset.jpg', size: 3932160, type: 'image/jpeg', uploadDate: '2024-03-03' }
      ],
      videos: [],
      hashtags: '#photography, #landscape, #nature',
      comments: 'Golden hour at the mountains. Best time for photography!',
      followers: 67800,
      engagement: 'high'
    },
    {
      id: 8,
      username: 'annmariya_fashion',
      platform: 'Instagram',
      pictures: [
        { name: 'outfit_1.jpg', size: 2359296, type: 'image/jpeg', uploadDate: '2024-03-05' },
        { name: 'spring_collection.jpg', size: 2621440, type: 'image/jpeg', uploadDate: '2024-03-06' }
      ],
      videos: [
        { name: 'fashion_haul.mp4', size: 28311552, type: 'video/mp4', uploadDate: '2024-03-07' }
      ],
      hashtags: '#fashion, #style, #ootd',
      comments: 'Spring collection haul! Loving these new pieces',
      followers: 41200,
      engagement: 'medium'
    },
    {
      id: 9,
      username: 'ashin_gaming',
      platform: 'Twitch',
      pictures: [
        { name: 'gaming_setup.jpg', size: 2097152, type: 'image/jpeg', uploadDate: '2024-03-10' }
      ],
      videos: [
        { name: 'gameplay_highlights.mp4', size: 41943040, type: 'video/mp4', uploadDate: '2024-03-11' },
        { name: 'tournament_win.mp4', size: 35651584, type: 'video/mp4', uploadDate: '2024-03-12' }
      ],
      hashtags: '#gaming, #streamer, #esports',
      comments: 'Epic win streak today! Going live again tomorrow at 8pm',
      followers: 103400,
      engagement: 'high'
    },
    {
      id: 10,
      username: 'goldy_pets',
      platform: 'Instagram',
      pictures: [
        { name: 'charlie_portrait.jpg', size: 1835008, type: 'image/jpeg', uploadDate: '2024-03-15' },
        { name: 'dog_park.jpg', size: 2097152, type: 'image/jpeg', uploadDate: '2024-03-16' }
      ],
      videos: [
        { name: 'new_trick.mp4', size: 10485760, type: 'video/mp4', uploadDate: '2024-03-17' }
      ],
      hashtags: '#pets, #dogs, #animals',
      comments: 'Charlie learned a new trick today! So proud of him',
      followers: 19800,
      engagement: 'medium'
    },
    {
      id: 11,
      username: 'stebin_vlogs',
      platform: 'YouTube',
      pictures: [],
      videos: [
        { name: 'daily_vlog_1.mp4', size: 52428800, type: 'video/mp4', uploadDate: '2024-03-20' },
        { name: 'behind_scenes.mp4', size: 38797312, type: 'video/mp4', uploadDate: '2024-03-21' }
      ],
      hashtags: '#vlog, #daily, #lifestyle',
      comments: 'Day in my life as a content creator! Full vlog out now',
      followers: 87600,
      engagement: 'high'
    },
    {
      id: 12,
      username: 'harsh_sports',
      platform: 'Instagram',
      pictures: [
        { name: 'game_action.jpg', size: 2621440, type: 'image/jpeg', uploadDate: '2024-03-25' }
      ],
      videos: [
        { name: 'game_highlights.mp4', size: 29360128, type: 'video/mp4', uploadDate: '2024-03-26' }
      ],
      hashtags: '#sports, #basketball, #fitness',
      comments: 'Game highlights from yesterday! We won by 12 points',
      followers: 34500,
      engagement: 'medium'
    },
    {
      id: 13,
      username: 'ckement_books',
      platform: 'YouTube',
      pictures: [
        { name: 'book_collection.jpg', size: 2359296, type: 'image/jpeg', uploadDate: '2024-04-01' }
      ],
      videos: [
        { name: 'book_review.mp4', size: 18874368, type: 'video/mp4', uploadDate: '2024-04-02' }
      ],
      hashtags: '#books, #reading, #literature',
      comments: 'Just finished this amazing novel! Full review on my channel',
      followers: 23400,
      engagement: 'medium'
    },
    {
      id: 14,
      username: 'jayalekshmi_dance',
      platform: 'Instagram',
      pictures: [
        { name: 'dance_pose.jpg', size: 1572864, type: 'image/jpeg', uploadDate: '2024-04-05' }
      ],
      videos: [
        { name: 'choreography_1.mp4', size: 24117248, type: 'video/mp4', uploadDate: '2024-04-06' },
        { name: 'performance.mp4', size: 31457280, type: 'video/mp4', uploadDate: '2024-04-07' }
      ],
      hashtags: '#dance, #choreography, #performance',
      comments: 'New choreography to trending song! Hope you all like it',
      followers: 52100,
      engagement: 'high'
    },
    {
      id: 15,
      username: 'sona_beauty',
      platform: 'YouTube',
      pictures: [
        { name: 'makeup_look.jpg', size: 2097152, type: 'image/jpeg', uploadDate: '2024-04-10' }
      ],
      videos: [
        { name: 'makeup_tutorial.mp4', size: 26214400, type: 'video/mp4', uploadDate: '2024-04-11' },
        { name: 'skincare_routine.mp4', size: 19922944, type: 'video/mp4', uploadDate: '2024-04-12' }
      ],
      hashtags: '#beauty, #makeup, #skincare',
      comments: 'Full glam makeup tutorial! Products linked in bio',
      followers: 61200,
      engagement: 'high'
    },
    {
      id: 16,
      username: 'alex_developer',
      platform: 'YouTube',
      pictures: [
        { name: 'coding_setup.jpg', size: 2359296, type: 'image/jpeg', uploadDate: '2024-04-15' }
      ],
      videos: [
        { name: 'coding_tutorial.mp4', size: 44040192, type: 'video/mp4', uploadDate: '2024-04-16' }
      ],
      hashtags: '#coding, #webdev, #javascript',
      comments: 'Building a full-stack app from scratch! Part 3 is up',
      followers: 78900,
      engagement: 'high'
    },
    {
      id: 17,
      username: 'priya_yoga',
      platform: 'Instagram',
      pictures: [
        { name: 'yoga_pose_1.jpg', size: 1835008, type: 'image/jpeg', uploadDate: '2024-04-20' }
      ],
      videos: [
        { name: 'morning_flow.mp4', size: 22020096, type: 'video/mp4', uploadDate: '2024-04-21' }
      ],
      hashtags: '#yoga, #wellness, #meditation',
      comments: 'Morning yoga flow to start your day right! Namaste',
      followers: 38700,
      engagement: 'medium'
    },
    {
      id: 18,
      username: 'kevin_cars',
      platform: 'YouTube',
      pictures: [
        { name: 'mustang_photo.jpg', size: 3145728, type: 'image/jpeg', uploadDate: '2024-04-25' }
      ],
      videos: [
        { name: 'car_review.mp4', size: 36700160, type: 'video/mp4', uploadDate: '2024-04-26' }
      ],
      hashtags: '#cars, #automotive, #supercars',
      comments: 'Test driving the new Mustang! What a beast',
      followers: 94300,
      engagement: 'high'
    },
    {
      id: 19,
      username: 'lisa_plants',
      platform: 'Instagram',
      pictures: [
        { name: 'monstera.jpg', size: 2097152, type: 'image/jpeg', uploadDate: '2024-05-01' },
        { name: 'plant_collection.jpg', size: 2621440, type: 'image/jpeg', uploadDate: '2024-05-02' }
      ],
      videos: [],
      hashtags: '#plants, #gardening, #green',
      comments: 'My monstera is thriving! Here are my care tips',
      followers: 27600,
      engagement: 'medium'
    },
    {
      id: 20,
      username: 'john_finance',
      platform: 'YouTube',
      pictures: [],
      videos: [
        { name: 'market_analysis.mp4', size: 28311552, type: 'video/mp4', uploadDate: '2024-05-05' },
        { name: 'investing_tips.mp4', size: 24117248, type: 'video/mp4', uploadDate: '2024-05-06' }
      ],
      hashtags: '#finance, #investing, #stocks',
      comments: 'Market analysis for this week! Key trends to watch',
      followers: 112300,
      engagement: 'high'
    },
    {
      id: 21,
      username: 'maria_baking',
      platform: 'Instagram',
      pictures: [
        { name: 'chocolate_cake.jpg', size: 2359296, type: 'image/jpeg', uploadDate: '2024-05-10' }
      ],
      videos: [
        { name: 'baking_tutorial.mp4', size: 20971520, type: 'video/mp4', uploadDate: '2024-05-11' }
      ],
      hashtags: '#baking, #desserts, #homemade',
      comments: 'Chocolate cake recipe that never fails! Try it out',
      followers: 43200,
      engagement: 'medium'
    },
    {
      id: 22,
      username: 'ryan_comedy',
      platform: 'YouTube',
      pictures: [],
      videos: [
        { name: 'standup_clip.mp4', size: 15728640, type: 'video/mp4', uploadDate: '2024-05-15' }
      ],
      hashtags: '#comedy, #funny, #entertainment',
      comments: 'New stand-up clip from last night! Thanks for all the laughs',
      followers: 156700,
      engagement: 'high'
    },
    {
      id: 23,
      username: 'emma_diy',
      platform: 'YouTube',
      pictures: [
        { name: 'diy_project.jpg', size: 1835008, type: 'image/jpeg', uploadDate: '2024-05-20' }
      ],
      videos: [
        { name: 'room_decor.mp4', size: 26214400, type: 'video/mp4', uploadDate: '2024-05-21' }
      ],
      hashtags: '#diy, #crafts, #handmade',
      comments: 'DIY room decor on a budget! Under $20 project',
      followers: 38900,
      engagement: 'medium'
    },
    {
      id: 24,
      username: 'david_motivation',
      platform: 'Instagram',
      pictures: [
        { name: 'motivational_quote.jpg', size: 1048576, type: 'image/jpeg', uploadDate: '2024-05-25' }
      ],
      videos: [
        { name: 'motivational_speech.mp4', size: 18874368, type: 'video/mp4', uploadDate: '2024-05-26' }
      ],
      hashtags: '#motivation, #inspiration, #mindset',
      comments: 'Never give up on your dreams! Keep pushing forward',
      followers: 89400,
      engagement: 'high'
    },
    {
      id: 25,
      username: 'sophia_travel',
      platform: 'YouTube',
      pictures: [
        { name: 'bali_beach.jpg', size: 3670016, type: 'image/jpeg', uploadDate: '2024-06-01' }
      ],
      videos: [
        { name: 'bali_guide.mp4', size: 48234496, type: 'video/mp4', uploadDate: '2024-06-02' }
      ],
      hashtags: '#travel, #wanderlust, #explore',
      comments: 'Bali travel guide! Top 10 places you must visit',
      followers: 72100,
      engagement: 'high'
    }
  ],

  // Helper methods
  getUserById(id) {
    return this.users.find(user => user.id === id);
  },

  getUsersByPlatform(platform) {
    return this.users.filter(user => user.platform === platform);
  },

  searchUsers(query) {
    const lowerQuery = query.toLowerCase();
    return this.users.filter(user => 
      user.username.toLowerCase().includes(lowerQuery) ||
      user.hashtags.toLowerCase().includes(lowerQuery) ||
      user.comments.toLowerCase().includes(lowerQuery)
    );
  },

  getUsersByHashtag(hashtag) {
    return this.users.filter(user => 
      user.hashtags.toLowerCase().includes(hashtag.toLowerCase())
    );
  },

  getTotalMediaCount() {
    return this.users.reduce((total, user) => {
      return total + user.pictures.length + user.videos.length;
    }, 0);
  },

  getHighEngagementUsers() {
    return this.users.filter(user => user.engagement === 'high');
  },

  exportToCSV() {
    const headers = ['ID', 'Username', 'Platform', 'Pictures', 'Videos', 'Hashtags', 'Comments', 'Followers', 'Engagement'];
    const rows = this.users.map(user => [
      user.id,
      user.username,
      user.platform,
      user.pictures.length,
      user.videos.length,
      user.hashtags,
      user.comments,
      user.followers,
      user.engagement
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = socialMediaDatabase;
}


// Sync with localStorage if available
if (typeof localStorage !== 'undefined') {
  const saved = localStorage.getItem('aegis_social_media_db');
  if (saved) {
    try {
      const savedData = JSON.parse(saved);
      if (savedData.users && savedData.users.length > 0) {
        socialMediaDatabase.users = savedData.users;
      }
    } catch (e) {
      console.warn('Could not load saved database:', e);
    }
  }
}