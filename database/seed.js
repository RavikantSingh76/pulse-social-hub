const path = require('path');
const bcrypt = require(path.join(__dirname, '../backend/node_modules/bcryptjs'));
const { initializeDatabase, query } = require('../backend/config/db');

async function seedDatabase() {
  console.log('[SEED] Initializing database for seeding...');
  await initializeDatabase();

  // Clear existing records
  console.log('[SEED] Cleaning existing tables...');
  await query('DELETE FROM notifications');
  await query('DELETE FROM reports');
  await query('DELETE FROM blocks');
  await query('DELETE FROM saved_posts');
  await query('DELETE FROM messages');
  await query('DELETE FROM conversation_members');
  await query('DELETE FROM conversations');
  await query('DELETE FROM mentions');
  await query('DELETE FROM post_hashtags');
  await query('DELETE FROM hashtags');
  await query('DELETE FROM story_views');
  await query('DELETE FROM stories');
  await query('DELETE FROM follows');
  await query('DELETE FROM comment_likes');
  await query('DELETE FROM comments');
  await query('DELETE FROM likes');
  await query('DELETE FROM post_media');
  await query('DELETE FROM posts');
  await query('DELETE FROM users');

  console.log('[SEED] Creating default users and hashing passwords...');
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const userPassword = process.env.SEED_USER_PASSWORD;

  if (!adminPassword || !userPassword) {
    throw new Error('SEED_ADMIN_PASSWORD and SEED_USER_PASSWORD environment variables are required.');
  }

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash(adminPassword, salt);
  const userPasswordHash = await bcrypt.hash(userPassword, salt);

  const usersData = [
    {
      username: 'admin',
      email: 'admin@social.com',
      password_hash: adminPasswordHash,
      display_name: 'Platform Admin',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      bio: 'Official Administrator of the platform. Keeping the community safe and connected. 🛡️',
      website: 'https://socialplatform.io',
      role: 'ADMIN',
      is_private: 0
    },
    {
      username: 'alexmorgan',
      email: 'alex@social.com',
      password_hash: userPasswordHash,
      display_name: 'Alex Morgan',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      bio: 'Photographer, explorer & coffee addict ☕ Capturing golden moments across the globe 📸 #photography #travel',
      website: 'https://alexmorgan.design',
      role: 'USER',
      is_private: 0
    },
    {
      username: 'sarah_c',
      email: 'sarah@social.com',
      password_hash: userPasswordHash,
      display_name: 'Sarah Connor',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      cover_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
      bio: 'Product Designer & AI Researcher 🚀 Building the next generation of creative tools. #design #technology',
      website: 'https://sarahconnor.tech',
      role: 'USER',
      is_private: 0
    },
    {
      username: 'david_dev',
      email: 'david@social.com',
      password_hash: userPasswordHash,
      display_name: 'David Chen',
      avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
      cover_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      bio: 'Full-Stack Engineer building distributed systems & open source tools 💻 React + Node + Rust enthusiast. #coding #reactjs',
      website: 'https://davidchen.dev',
      role: 'USER',
      is_private: 0
    },
    {
      username: 'elena_travel',
      email: 'elena@social.com',
      password_hash: userPasswordHash,
      display_name: 'Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      cover_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
      bio: 'Private account 🔒 Travel vlogger. Exploring 40+ countries. Follow for adventures!',
      website: 'https://elenarostova.blog',
      role: 'USER',
      is_private: 1
    },
    {
      username: 'marcus_v',
      email: 'marcus@social.com',
      password_hash: userPasswordHash,
      display_name: 'Marcus Vance',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      bio: 'Music Producer & Sound Architect 🎧 Sharing studio vibes, beat breakdowns, and live jams. #music #creativity',
      website: 'https://marcusvance.fm',
      role: 'USER',
      is_private: 0
    }
  ];

  const userIds = {};
  for (const u of usersData) {
    const [result] = await query(
      `INSERT INTO users (username, email, password_hash, display_name, avatar_url, cover_url, bio, website, role, is_private)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.username, u.email, u.password_hash, u.display_name, u.avatar_url, u.cover_url, u.bio, u.website, u.role, u.is_private]
    );
    userIds[u.username] = result.insertId;
  }
  console.log('[SEED] Users created:', userIds);

  // 2. Hashtags
  console.log('[SEED] Creating Hashtags...');
  const tags = ['photography', 'travel', 'design', 'technology', 'coding', 'reactjs', 'nature', 'music', 'art', 'developer'];
  const tagIds = {};
  for (const tag of tags) {
    const [res] = await query('INSERT INTO hashtags (tag) VALUES (?)', [tag]);
    tagIds[tag] = res.insertId;
  }

  // 3. Follow Relationships
  console.log('[SEED] Creating Follows...');
  // Alex follows Sarah, David, Marcus
  await query('INSERT INTO follows (follower_id, following_id, status) VALUES (?, ?, ?)', [userIds.alexmorgan, userIds.sarah_c, 'ACCEPTED']);
  await query('INSERT INTO follows (follower_id, following_id, status) VALUES (?, ?, ?)', [userIds.alexmorgan, userIds.david_dev, 'ACCEPTED']);
  await query('INSERT INTO follows (follower_id, following_id, status) VALUES (?, ?, ?)', [userIds.alexmorgan, userIds.marcus_v, 'ACCEPTED']);
  // Sarah follows Alex and David
  await query('INSERT INTO follows (follower_id, following_id, status) VALUES (?, ?, ?)', [userIds.sarah_c, userIds.alexmorgan, 'ACCEPTED']);
  await query('INSERT INTO follows (follower_id, following_id, status) VALUES (?, ?, ?)', [userIds.sarah_c, userIds.david_dev, 'ACCEPTED']);
  // David follows Alex
  await query('INSERT INTO follows (follower_id, following_id, status) VALUES (?, ?, ?)', [userIds.david_dev, userIds.alexmorgan, 'ACCEPTED']);
  // David sent a follow request to Elena (Private account)
  await query('INSERT INTO follows (follower_id, following_id, status) VALUES (?, ?, ?)', [userIds.david_dev, userIds.elena_travel, 'PENDING']);
  // Marcus follows Alex and Sarah
  await query('INSERT INTO follows (follower_id, following_id, status) VALUES (?, ?, ?)', [userIds.marcus_v, userIds.alexmorgan, 'ACCEPTED']);
  await query('INSERT INTO follows (follower_id, following_id, status) VALUES (?, ?, ?)', [userIds.marcus_v, userIds.sarah_c, 'ACCEPTED']);

  // 4. Posts and Media
  console.log('[SEED] Creating Posts & Media...');
  const postsData = [
    {
      user_id: userIds.alexmorgan,
      caption: 'Sunset over the alpine peaks. Standing at 3,000m above the clouds reminds you how magnificent our planet truly is. Shot on 35mm. 🏔️✨ #photography #travel #nature',
      visibility: 'PUBLIC',
      post_type: 'POST',
      title: null,
      media: [
        { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', type: 'IMAGE' },
        { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80', type: 'IMAGE' }
      ],
      tags: ['photography', 'travel', 'nature']
    },
    {
      user_id: userIds.sarah_c,
      caption: 'Super excited to unveil our new design system prototype! Focused on spatial depth, micro-interactions, and accessible typography. Shoutout to @david_dev for helping integrate the tokens! 🎨🚀 #design #technology #reactjs',
      visibility: 'PUBLIC',
      post_type: 'POST',
      title: null,
      media: [
        { url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80', type: 'IMAGE' }
      ],
      tags: ['design', 'technology', 'reactjs']
    },
    {
      user_id: userIds.david_dev,
      caption: 'Late night coding sessions hit different when the build passes on the first try! 🚀 What tech stack are you building with this weekend? Drop your thoughts below! 👇 #coding #developer #reactjs',
      visibility: 'PUBLIC',
      post_type: 'POST',
      title: null,
      media: [
        { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80', type: 'IMAGE' }
      ],
      tags: ['coding', 'developer', 'reactjs']
    },
    {
      user_id: userIds.marcus_v,
      caption: 'Synthesizing ambient beats in the studio today. Testing out new modular patches and polyphonic soundscapes. Headphones recommended! 🎧🔊 #music #art',
      visibility: 'PUBLIC',
      post_type: 'VIDEO',
      title: 'Studio Sessions #12 - Ambient Modular Synthesis',
      media: [
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', type: 'VIDEO' }
      ],
      tags: ['music', 'art']
    },
    {
      user_id: userIds.alexmorgan,
      caption: 'Neon nights in Tokyo. Rain-slicked streets reflect the vibrant energy of the metropolis. Every corner tells a story. 🌧️🏮 #photography #travel',
      visibility: 'PUBLIC',
      post_type: 'POST',
      title: null,
      media: [
        { url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', type: 'IMAGE' }
      ],
      tags: ['photography', 'travel']
    },
    {
      user_id: userIds.david_dev,
      caption: 'Building a real-time reactive architecture with WebSockets and Node.js. Check out this dynamic feed demo! ⚡ #technology #coding',
      visibility: 'PUBLIC',
      post_type: 'VIDEO',
      title: 'Building Scalable Real-time Web Applications',
      media: [
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', type: 'VIDEO' }
      ],
      tags: ['technology', 'coding']
    }
  ];

  const createdPostIds = [];
  for (const p of postsData) {
    const [pRes] = await query(
      `INSERT INTO posts (user_id, caption, visibility, post_type, title, view_count)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [p.user_id, p.caption, p.visibility, p.post_type, p.title, Math.floor(Math.random() * 500) + 50]
    );
    const postId = pRes.insertId;
    createdPostIds.push(postId);

    // Insert Media
    for (let i = 0; i < p.media.length; i++) {
      await query(
        `INSERT INTO post_media (post_id, media_url, media_type, order_index)
         VALUES (?, ?, ?, ?)`,
        [postId, p.media[i].url, p.media[i].type, i]
      );
    }

    // Insert Hashtags mapping
    for (const tag of p.tags) {
      if (tagIds[tag]) {
        await query(
          `INSERT INTO post_hashtags (post_id, hashtag_id) VALUES (?, ?)`,
          [postId, tagIds[tag]]
        );
      }
    }
  }

  // 5. Likes on Posts
  console.log('[SEED] Creating Likes...');
  await query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userIds.sarah_c, createdPostIds[0]]);
  await query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userIds.david_dev, createdPostIds[0]]);
  await query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userIds.marcus_v, createdPostIds[0]]);
  await query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userIds.alexmorgan, createdPostIds[1]]);
  await query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userIds.david_dev, createdPostIds[1]]);
  await query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userIds.alexmorgan, createdPostIds[2]]);
  await query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userIds.sarah_c, createdPostIds[2]]);
  await query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userIds.alexmorgan, createdPostIds[3]]);

  // 6. Comments & Nested Replies
  console.log('[SEED] Creating Comments & Replies...');
  // Comment on Post 0 (Alex's alpine photo)
  const [c1Res] = await query(
    `INSERT INTO comments (post_id, user_id, parent_id, content) VALUES (?, ?, NULL, ?)`,
    [createdPostIds[0], userIds.sarah_c, 'Breathtaking capture Alex! The lighting on the ridge is magical ✨']
  );
  const comment1Id = c1Res.insertId;

  // Reply to Comment 1
  await query(
    `INSERT INTO comments (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)`,
    [createdPostIds[0], userIds.alexmorgan, comment1Id, 'Thanks Sarah! Woke up at 4 AM for that sunrise lighting 🙌']
  );

  // Another Comment on Post 0
  await query(
    `INSERT INTO comments (post_id, user_id, parent_id, content) VALUES (?, ?, NULL, ?)`,
    [createdPostIds[0], userIds.david_dev, 'Incredible colors! What camera body did you use?']
  );

  // Comment on Post 1 (Sarah's design system)
  const [c2Res] = await query(
    `INSERT INTO comments (post_id, user_id, parent_id, content) VALUES (?, ?, NULL, ?)`,
    [createdPostIds[1], userIds.david_dev, 'The design tokens look so clean! Loved collaborating on this 💻🚀']
  );
  const comment2Id = c2Res.insertId;

  // Reply from Sarah
  await query(
    `INSERT INTO comments (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)`,
    [createdPostIds[1], userIds.sarah_c, comment2Id, '@david_dev You crushed the implementation! 🎉']
  );

  // Comment Likes
  await query('INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)', [userIds.alexmorgan, comment1Id]);
  await query('INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)', [userIds.marcus_v, comment1Id]);
  await query('INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)', [userIds.sarah_c, comment2Id]);

  // 7. Stories (24h expiration)
  console.log('[SEED] Creating Active Stories...');
  const futureDate = new Date(Date.now() + 23 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
  
  const [s1Res] = await query(
    `INSERT INTO stories (user_id, media_url, media_type, caption, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userIds.alexmorgan,
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
      'IMAGE',
      'Morning hike view ☀️',
      futureDate
    ]
  );

  const [s2Res] = await query(
    `INSERT INTO stories (user_id, media_url, media_type, caption, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userIds.sarah_c,
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      'IMAGE',
      'Design workshop in session 💡',
      futureDate
    ]
  );

  const [s3Res] = await query(
    `INSERT INTO stories (user_id, media_url, media_type, caption, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userIds.david_dev,
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      'IMAGE',
      'New workstation setup complete ⚡',
      futureDate
    ]
  );

  // Story views
  await query('INSERT INTO story_views (story_id, user_id) VALUES (?, ?)', [s1Res.insertId, userIds.sarah_c]);
  await query('INSERT INTO story_views (story_id, user_id) VALUES (?, ?)', [s1Res.insertId, userIds.david_dev]);

  // 8. Saved Posts (Bookmarks)
  console.log('[SEED] Creating Saved Posts...');
  await query('INSERT INTO saved_posts (user_id, post_id) VALUES (?, ?)', [userIds.alexmorgan, createdPostIds[1]]);
  await query('INSERT INTO saved_posts (user_id, post_id) VALUES (?, ?)', [userIds.sarah_c, createdPostIds[0]]);
  await query('INSERT INTO saved_posts (user_id, post_id) VALUES (?, ?)', [userIds.david_dev, createdPostIds[3]]);

  // 9. Conversations & Messages
  console.log('[SEED] Creating Direct Message Conversations...');
  // Conversation between Alex & Sarah
  const [conv1] = await query('INSERT INTO conversations (created_at) VALUES (CURRENT_TIMESTAMP)');
  const conv1Id = conv1.insertId;
  await query('INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)', [conv1Id, userIds.alexmorgan]);
  await query('INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)', [conv1Id, userIds.sarah_c]);

  await query(
    'INSERT INTO messages (conversation_id, sender_id, message_text, is_read) VALUES (?, ?, ?, ?)',
    [conv1Id, userIds.sarah_c, 'Hey Alex! Loved your latest landscape photos. When are you traveling next?', 1]
  );
  await query(
    'INSERT INTO messages (conversation_id, sender_id, message_text, is_read) VALUES (?, ?, ?, ?)',
    [conv1Id, userIds.alexmorgan, 'Hey Sarah! Thanks so much! Heading to the Swiss Alps next month for a shoot.', 1]
  );
  await query(
    'INSERT INTO messages (conversation_id, sender_id, message_text, is_read) VALUES (?, ?, ?, ?)',
    [conv1Id, userIds.sarah_c, 'That sounds incredible! Let me know if you need any feedback on the edits.', 0]
  );

  // Conversation between Alex & David
  const [conv2] = await query('INSERT INTO conversations (created_at) VALUES (CURRENT_TIMESTAMP)');
  const conv2Id = conv2.insertId;
  await query('INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)', [conv2Id, userIds.alexmorgan]);
  await query('INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)', [conv2Id, userIds.david_dev]);

  await query(
    'INSERT INTO messages (conversation_id, sender_id, message_text, is_read) VALUES (?, ?, ?, ?)',
    [conv2Id, userIds.david_dev, 'Hey Alex, checkout the real-time social platform we just deployed!', 1]
  );
  await query(
    'INSERT INTO messages (conversation_id, sender_id, message_text, is_read) VALUES (?, ?, ?, ?)',
    [conv2Id, userIds.alexmorgan, 'Just logged in, the UI is super fast and smooth! 🚀', 0]
  );

  // 10. Notifications
  console.log('[SEED] Creating Notifications...');
  await query(
    `INSERT INTO notifications (recipient_id, actor_id, type, entity_id, entity_type, message, is_read)
     VALUES (?, ?, 'LIKE', ?, 'POST', 'liked your post.', 0)`,
    [userIds.alexmorgan, userIds.sarah_c, createdPostIds[0]]
  );
  await query(
    `INSERT INTO notifications (recipient_id, actor_id, type, entity_id, entity_type, message, is_read)
     VALUES (?, ?, 'COMMENT', ?, 'POST', 'commented: "Breathtaking capture Alex!..."', 0)`,
    [userIds.alexmorgan, userIds.sarah_c, createdPostIds[0]]
  );
  await query(
    `INSERT INTO notifications (recipient_id, actor_id, type, entity_id, entity_type, message, is_read)
     VALUES (?, ?, 'FOLLOW', ?, 'USER', 'started following you.', 1)`,
    [userIds.alexmorgan, userIds.marcus_v, userIds.marcus_v]
  );
  await query(
    `INSERT INTO notifications (recipient_id, actor_id, type, entity_id, entity_type, message, is_read)
     VALUES (?, ?, 'FOLLOW_REQUEST', ?, 'USER', 'requested to follow you.', 0)`,
    [userIds.elena_travel, userIds.david_dev, userIds.david_dev]
  );

  // 11. Sample Report for Admin Moderation
  console.log('[SEED] Creating Sample Report for Moderation...');
  await query(
    `INSERT INTO reports (reporter_id, reported_post_id, reason, details, status)
     VALUES (?, ?, ?, ?, ?)`,
    [userIds.marcus_v, createdPostIds[2], 'SPAM_OR_MISLEADING', 'Test report for admin moderation verification.', 'PENDING']
  );

  console.log('\n======================================================');
  console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('Demo Users Seeded:');
  console.log('  Admin User:  admin@social.com   (Password configured via SEED_ADMIN_PASSWORD)');
  console.log('  Demo User:   alex@social.com    (Password configured via SEED_USER_PASSWORD)');
  console.log('  Demo User:   sarah@social.com   (Password configured via SEED_USER_PASSWORD)');
  console.log('  Demo User:   david@social.com   (Password configured via SEED_USER_PASSWORD)');
  console.log('======================================================\n');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[SEED ERROR]:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
