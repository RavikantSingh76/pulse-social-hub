package com.socialmedia.config;

import com.socialmedia.entity.*;
import com.socialmedia.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostMediaRepository postMediaRepository;

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ConversationMemberRepository conversationMemberRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AudioTrackRepository audioTrackRepository;

    @Autowired
    private ReelRepository reelRepository;

    @Autowired
    private PlaylistRepository playlistRepository;

    @Autowired
    private PlaylistVideoRepository playlistVideoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        User ravikant = seedAdminRavikant();
        List<User> proUsers = seed200ProfessionalUsers();
        seedFollowersAndConversationsForRavikant(ravikant, proUsers);
        seedReels(ravikant, proUsers);
        seedAudioTracksAndDedicatedReels(ravikant, proUsers);
        seed100JavaInterviewShortVideosAndPlaylist(ravikant, proUsers);
        repairExistingMixkitVideos();
    }

    private User seedAdminRavikant() {
        String email = "ravikantsinghravi7@gmail.com";
        Optional<User> existing = userRepository.findByEmailIgnoreCase(email);
        if (existing.isPresent()) {
            User u = existing.get();
            u.setAvatarUrl("/uploads/ravikant_avatar.jpg");
            u.setWebsite("https://github.com/RavikantSingh76");
            u.setDisplayName("Ravikant Singh");
            u.setIsVerified(true);
            u.setBio("👑 Chief Administrator & Full Stack Lead | Building next-gen social platforms | GitHub: @RavikantSingh76 🚀");
            u.setLocation("Bengaluru, India");
            User saved = userRepository.save(u);
            System.out.println("✅ [DatabaseSeeder] Admin Ravikant Singh avatar & profile updated!");
            return saved;
        } else if (!userRepository.existsByUsernameIgnoreCase("ravikant")) {
            User ravikant = User.builder()
                    .username("ravikant")
                    .email(email)
                    .password(passwordEncoder.encode("Admin@123"))
                    .displayName("Ravikant Singh")
                    .avatarUrl("/uploads/ravikant_avatar.jpg")
                    .coverUrl("https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80")
                    .bio("👑 Chief Administrator & Full Stack Lead | Building next-gen social platforms | GitHub: @RavikantSingh76 🚀")
                    .website("https://github.com/RavikantSingh76")
                    .location("Bengaluru, India")
                    .role(User.Role.ADMIN)
                    .isVerified(true)
                    .isPrivate(false)
                    .build();

            User saved = userRepository.save(ravikant);
            System.out.println("✅ [DatabaseSeeder] Admin Ravikant Singh created (ravikantsinghravi7@gmail.com / Admin@123)");
            return saved;
        } else {
            return userRepository.findByUsernameIgnoreCase("ravikant").orElse(null);
        }
    }

    private List<User> seed200ProfessionalUsers() {
        List<User> existingUsers = userRepository.findAll();
        if (existingUsers.size() >= 200) {
            System.out.println("[DatabaseSeeder] 200+ Professionals already seeded (" + existingUsers.size() + " users in DB).");
            return existingUsers;
        }

        System.out.println("⏳ [DatabaseSeeder] Seeding 200 High-Caliber Tech Professionals & Content...");

        String defaultUserPwd = passwordEncoder.encode("User@123");

        String[] firstNames = {
            "Aarav", "Ananya", "Rohan", "Priya", "Vikram", "Sneha", "Rahul", "Pooja", "Aditya", "Riya",
            "Amit", "Neha", "Rohit", "Kavya", "Aryan", "Divya", "Kunal", "Shreya", "Varun", "Meera",
            "Nikhil", "Tanvi", "Arjun", "Ishita", "Siddharth", "Natasha", "Mayank", "Rashi", "Harsh", "Simran",
            "Tarun", "Radhika", "Gaurav", "Anjali", "Suresh", "Bhavna", "Manish", "Deepika", "Rajesh", "Swati",
            "Deepak", "Akansha", "Karan", "Nisha", "Ashish", "Pallavi", "Vivek", "Kriti", "Mohit", "Aayushi",
            "Prateek", "Sakshi", "Abhishek", "Ritika", "Akash", "Payal", "Yash", "Monika", "Ayush", "Garima",
            "Dev", "Vandana", "Sameer", "Preeti", "Alok", "Richa", "Sanjay", "Komal", "Pankaj", "Jyoti",
            "Rishi", "Shivani", "Sachin", "Namrata", "Vijay", "Tanushree", "Naveen", "Barkha", "Anil", "Sonal",
            "Sunil", "Khushi", "Mukesh", "Charu", "Chetan", "Mansi", "Ajay", "Shalini", "Lalit", "Apeksha",
            "Hemant", "Shruti", "Girish", "Isha", "Chirag", "Sonali", "Tushar", "Megha", "Bhavesh", "Prachi"
        };

        String[] lastNames = {
            "Sharma", "Verma", "Gupta", "Patel", "Singh", "Reddy", "Mehta", "Iyer", "Kumar", "Sen",
            "Joshi", "Kapoor", "Chopra", "Nair", "Bose", "Mishra", "Deshmukh", "Mukherjee", "Agarwal", "Rao",
            "Malhotra", "Pandey", "Saxena", "Bhatia", "Shetty", "Thakur", "Yadav", "Trivedi", "Banerjee", "Menon",
            "Dutta", "Kulkarni", "Patil", "Pillai", "Choudhury", "Bhatt", "Mahajan", "Dubey", "Goswami", "Goyal",
            "Hegde", "Jha", "Kaur", "Kaushik", "Khanna", "Lal", "Nambiar", "Nath", "Pal", "Prasad",
            "Rai", "Roy", "Sahay", "Sethi", "Shukla", "Sinha", "Sur", "Talwar", "Tandon", "Tyagi",
            "Upadhyay", "Varma", "Venkatesh", "Vyas", "Acharya", "Ahluwalia", "Anand", "Bahl", "Bajaj", "Bakshi",
            "Basu", "Bhandari", "Chauhan", "Chawla", "Dave", "Dhillon", "Dewan", "Garg", "Ghosh", "Gill",
            "Grover", "Gulati", "Jindal", "Kakkar", "Kashyap", "Kaul", "Kohli", "Madan", "Majumdar", "Mani",
            "Mathur", "Mitra", "Modi", "Mittal", "Narang", "Oberoi", "Puri", "Rastogi", "Suri", "Taneja"
        };

        String[] techBios = {
            "🚀 Staff Software Engineer @ Google | Distributed Systems & Java 17 | Ex-Microsoft ☕",
            "🎨 Principal Product Designer @ Razorpay | Crafting fintech design systems & micro-interactions #UIUX",
            "🤖 Lead AI Research Scientist @ Bengaluru AI Lab | Exploring Large Language Models & Diffusion 🧠",
            "📱 Principal Mobile Architect @ Swiggy | Building React Native & Flutter apps at hyper-scale",
            "☁️ Cloud Infrastructure Director | AWS & GCP Certified Architect | Kubernetes, Terraform & Istio",
            "📸 Travel & Culture Filmmaker | Documenting the architectural heritage of Incredible India 🇮🇳",
            "💡 Founder & Managing Partner @ Pulse Ventures | Backing early-stage tech startups",
            "📊 VP of Data Engineering @ CRED | Scaling real-time stream pipelines & Kafka clusters 📈",
            "⚡ Senior Frontend Architect | Vite, React 18, Web Performance & Micro-Frontends #WebDev",
            "🎯 Chief Product Officer | Scaling consumer platforms from 0 to 10M MAU | Tech Speaker"
        };

        String[] cities = {
            "Bengaluru, Karnataka", "New Delhi, Delhi", "Mumbai, Maharashtra",
            "Hyderabad, Telangana", "Pune, Maharashtra", "Chennai, Tamil Nadu",
            "Gurugram, Haryana", "Kolkata, West Bengal", "Noida, Uttar Pradesh",
            "Ahmedabad, Gujarat", "Jaipur, Rajasthan", "Chandigarh, Punjab",
            "San Francisco, USA", "London, UK", "Singapore"
        };

        String[] samplePostCaptions = {
            "Just launched our high-throughput distributed messaging architecture! 🚀 Sub-10ms p99 latency across all global regions. #tech #java #springboot #cloud #backend",
            "Golden hour at Bengaluru Electronic City! The energy in India's silicon valley is truly electrifying. 🌇 #bengaluru #india #technology",
            "System design tip: Designing for fault-tolerance means embracing failure as a first-class citizen. Circuit breakers and exponential backoffs save lives. 💻 #engineering #architecture",
            "Incredible weekend mentoring 500+ college developers at the National Hackathon. The youth talent in India is phenomenal! ⚡ #startup #community #hackathon",
            "Clean workspace, dark mode Pulse theme, hot espresso, and zero build warnings. What are you shipping this week? ☕ #developer #productivity",
            "Exploring the synthesis of Web Audio API and real-time WebSockets. Instant acoustic feedback makes UIs feel remarkably alive! 🤖 #websockets #realtime #audio #innovation",
            "Design philosophy: Great UX is empathetic and unobtrusive. It guides the user seamlessly without cognitive overload. ✨ #design #uiux #product",
            "Keynote at Delhi Tech Leaders Forum. India's digital public infrastructure (UPI, ONDC, AI) is setting the global gold standard! 🇮🇳 #digitalindia #leadership",
            "Optimized our database indexes and query cache hit rates today. Database CPU utilization decreased by 45%! 📊 #database #performance #sql",
            "Leadership reflection: The best engineering managers don't manage code—they empower their teams to build fearlessly. 📚 #growth #leadership #tech"
        };

        String[] sampleImages = {
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"
        };

        List<User> createdUsers = new ArrayList<>();

        for (int i = 0; i < 200; i++) {
            String firstName = firstNames[i % firstNames.length];
            String lastName = lastNames[(i + (i / firstNames.length)) % lastNames.length];
            String suffix = (i >= 100) ? String.valueOf(i + 1) : String.valueOf(i + 1);
            String username = (firstName + "." + lastName + suffix).toLowerCase();
            String email = (firstName + "." + lastName + suffix + "@pulse.in").toLowerCase();

            if (userRepository.existsByEmailIgnoreCase(email) || userRepository.existsByUsernameIgnoreCase(username)) {
                continue;
            }

            String displayName = firstName + " " + lastName;
            String bio = techBios[i % techBios.length];
            String city = cities[i % cities.length];
            String avatarUrl = "https://api.dicebear.com/7.x/bottts/svg?seed=" + username;
            boolean isVerified = (i % 5 == 0); // Verified badge

            User user = User.builder()
                    .username(username)
                    .email(email)
                    .password(defaultUserPwd)
                    .displayName(displayName)
                    .avatarUrl(avatarUrl)
                    .bio(bio)
                    .location(city)
                    .website("https://pulse.in/@" + username)
                    .role(User.Role.USER)
                    .isVerified(isVerified)
                    .isPrivate(false)
                    .build();

            User savedUser = userRepository.save(user);
            createdUsers.add(savedUser);

            // Post creation for every 2nd professional
            if (i % 2 == 0) {
                String caption = samplePostCaptions[i % samplePostCaptions.length];
                Post post = Post.builder()
                        .user(savedUser)
                        .caption(caption)
                        .visibility(Post.Visibility.PUBLIC)
                        .postType(Post.PostType.POST)
                        .viewCount((long)(250 + (i * 20)))
                        .build();

                Post savedPost = postRepository.save(post);

                String img = sampleImages[i % sampleImages.length];
                postMediaRepository.save(PostMedia.builder()
                        .post(savedPost)
                        .mediaUrl(img)
                        .mediaType(PostMedia.MediaType.IMAGE)
                        .orderIndex(0)
                        .build());
            }

            // Stories for verified creators
            if (isVerified) {
                storyRepository.save(Story.builder()
                        .user(savedUser)
                        .mediaUrl(sampleImages[(i + 2) % sampleImages.length])
                        .mediaType(Story.MediaType.IMAGE)
                        .caption("Live from " + city + " 🇮🇳")
                        .audience(Story.Audience.PUBLIC)
                        .expiresAt(LocalDateTime.now().plusHours(24))
                        .build());
            }
        }

        System.out.println("✅ [DatabaseSeeder] Successfully seeded 200 Real Tech Professionals!");
        return userRepository.findAll();
    }

    private void seedFollowersAndConversationsForRavikant(User ravikant, List<User> allUsers) {
        if (ravikant == null || allUsers == null || allUsers.isEmpty()) return;

        System.out.println("⏳ [DatabaseSeeder] Seeding Followers, Following, and Direct Messages for Ravikant Singh...");

        int followersAdded = 0;
        int conversationsAdded = 0;

        String[] greetings = {
            "Hey Ravikant! Loved the architecture of Pulse Social Hub. The Spring Boot 3 + React stack is blazing fast! ⚡",
            "Hi Ravikant, great to connect with you! Are you open for a tech speaker session at Bengaluru Tech Summit next month?",
            "Hello Chief Admin! Just joined Pulse, the dark navy glassmorphic UI is super sleek! 🚀",
            "Hey Ravikant! Impressive work on the real-time WebSocket messaging and multi-reaction system. Truly production-grade!",
            "Hi Ravikant, saw your GitHub profile @RavikantSingh76. Excellent open-source contributions! Keep building. 👏",
            "Hey! Would love to collaborate on a full-stack AI project with you. Let me know when you're free to chat.",
            "Greetings Ravikant! Loved your latest post on clean code & system performance. Cheers from Hyderabad! ☕",
            "Hi Ravikant! Just checked out the 9:16 vertical Reels and Instagram-style Story viewer with Web Audio sound effects. Beautiful implementation! 🎵",
            "Hello Ravikant! Our engineering team at Google Bengaluru is exploring Pulse. Incredible full-stack execution! 🌟",
            "Hey Chief! The double-tap heart pop and audio synthesizer feel so satisfying. Great attention to micro-interactions."
        };

        String[] adminReplies = {
            "Hey! Thanks so much for the kind words. Glad you're enjoying the Pulse platform experience! 🚀",
            "Hi! Thanks for reaching out. I'd love to connect and discuss more about the summit.",
            "Welcome to Pulse! Feel free to share your thoughts, posts, and feedback anytime. 🌟",
            "Thank you! We put a lot of focus into clean architecture, low-latency APIs, and seamless real-time sockets.",
            "Appreciate the support! Keep an eye out for upcoming creator studio features and audio visualizer updates."
        };

        for (int i = 0; i < allUsers.size(); i++) {
            User user = allUsers.get(i);
            if (user.getId().equals(ravikant.getId())) continue;

            // 1. Make 130+ users follow Ravikant Singh
            if (i < 135 && followRepository.findByFollowerAndFollowing(user, ravikant).isEmpty()) {
                followRepository.save(Follow.builder()
                        .follower(user)
                        .following(ravikant)
                        .status(Follow.Status.ACCEPTED)
                        .build());
                followersAdded++;

                // Notification for follow
                notificationRepository.save(Notification.builder()
                        .recipient(ravikant)
                        .actor(user)
                        .type(Notification.Type.FOLLOW)
                        .entityId(user.getId())
                        .entityType("USER")
                        .message("started following you.")
                        .isRead(i > 5)
                        .build());
            }

            // 2. Make Ravikant follow top 32 creators back (mutual following)
            if (i < 32 && followRepository.findByFollowerAndFollowing(ravikant, user).isEmpty()) {
                followRepository.save(Follow.builder()
                        .follower(ravikant)
                        .following(user)
                        .status(Follow.Status.ACCEPTED)
                        .build());
            }

            // 3. Interconnect other users for realistic network
            if (i > 0 && i < 120) {
                User other = allUsers.get((i * 3 + 1) % allUsers.size());
                if (!other.getId().equals(user.getId()) && followRepository.findByFollowerAndFollowing(user, other).isEmpty()) {
                    followRepository.save(Follow.builder()
                            .follower(user)
                            .following(other)
                            .status(Follow.Status.ACCEPTED)
                            .build());
                }
            }

            // 4. Create Direct Messages with Ravikant Singh (first 20 users)
            if (i < 20) {
                List<Conversation> existingConvs = conversationRepository.findUserConversations(ravikant.getId());
                boolean exists = false;
                for (Conversation c : existingConvs) {
                    if (conversationMemberRepository.findByConversationAndUser(c, user).isPresent()) {
                        exists = true;
                        break;
                    }
                }

                if (!exists) {
                    Conversation conv = conversationRepository.save(Conversation.builder()
                            .isGroup(false)
                            .build());

                    conversationMemberRepository.save(ConversationMember.builder()
                            .conversation(conv)
                            .user(ravikant)
                            .build());

                    conversationMemberRepository.save(ConversationMember.builder()
                            .conversation(conv)
                            .user(user)
                            .build());

                    // Add incoming message from user to Ravikant
                    String msgText = greetings[i % greetings.length];
                    messageRepository.save(Message.builder()
                            .conversation(conv)
                            .sender(user)
                            .messageText(msgText)
                            .isRead(i > 3)
                            .build());

                    // Add reply from Ravikant for top 10 chats
                    if (i < 10) {
                        String reply = adminReplies[i % adminReplies.length];
                        messageRepository.save(Message.builder()
                                .conversation(conv)
                                .sender(ravikant)
                                .messageText(reply)
                                .isRead(true)
                                .build());
                    }

                    conversationsAdded++;
                }
            }
        }

        System.out.println("✅ [DatabaseSeeder] Seeded " + followersAdded + " followers for Ravikant Singh and " + conversationsAdded + " direct conversations!");
    }

    private void seedReels(User ravikant, List<User> users) {
        if (ravikant == null) return;

        long ravikantReelsCount = postRepository.countByUserAndPostType(ravikant, Post.PostType.VIDEO);
        if (ravikantReelsCount >= 100) {
            System.out.println("✅ [DatabaseSeeder] Chief Admin Ravikant Singh already has " + ravikantReelsCount + " reels in DB.");
            return;
        }

        System.out.println("⏳ [DatabaseSeeder] Seeding 100 Professional HD Reels for Ravikant Singh...");

        String[] reelVideoUrls = {
            "/uploads/73e9cd71-31ff-41a5-9707-cb1c391b36dc.mp4",
            "/uploads/81932133-f02b-48b6-8e61-ff5f112466ea.mp4",
            "https://media.w3.org/2010/05/sintel/trailer.mp4",
            "https://media.w3.org/2010/05/bunny/trailer.mp4",
            "https://media.w3.org/2010/05/video/movie_300.mp4"
        };

        String[] techTopics = {
            "Building high-concurrency microservices with Spring Boot 3 & Virtual Threads! Sub-10ms response times at scale ⚡ #springboot #java #backend #cloud",
            "Late night architecture sprint at Bengaluru Tech Park! Designing real-time distributed WebSockets 🚀 #bengaluru #tech #systemdesign #devlife",
            "Optimizing React 18 client bundle with dynamic code splitting and tree shaking. Zero layout shifts! ✨ #reactjs #webdev #performance #frontend",
            "Deep dive into Vector Databases and RAG pipelines for Enterprise AI Agents 🧠 #ai #rag #machinelearning #generativeai",
            "Mechanical keyboard sound ASMR + refactoring legacy SQL queries into blazing-fast JPA specifications ☕ #coding #asmr #devlife #reels",
            "The futuristic skyline view from Gurugram Cyber City! Technology meeting world-class infrastructure 🏢 #cybercity #india #reels #techhub",
            "Building WebRTC peer-to-peer 1080p video calling with zero external servers! 🔥 #webrtc #javascript #realtime #reels",
            "How we scaled database connection pooling with HikariCP to handle 50,000 req/sec without latency spikes 🚀 #databases #performance #scale",
            "Designing frictionless Instagram-grade gesture interactions with Tailwind CSS and Framer Motion ✨ #uiux #design #product #frontend",
            "Late night debugging with hot reload and Chrome DevTools. Coffee is life ☕ #developer #coding #nightowl #reels",
            "Sunset at Marine Drive, Mumbai! Taking a quick break from production deployments 🌊 #mumbai #travel #sunset #reels",
            "Containerizing full-stack microservices with multi-stage Docker builds and Kubernetes autoscaling ☸️ #devops #kubernetes #docker #cloud",
            "Kafka event streaming vs RabbitMQ message queues: Which one should you pick for high-throughput feeds? 📊 #kafka #architecture #backend",
            "Exploring AST (Abstract Syntax Tree) transformations in Vite compiler pipelines ⚡ #javascript #compiler #webdev",
            "Zero-downtime database schema migrations with Flyway in Spring Boot 🛡️ #flyway #devops #spring #database",
            "Writing zero-dependency Web Audio API sound synthesizers for instant UI haptic feedback! 🎧 #webaudio #sounddesign #frontend",
            "Building offline-first progressive web apps with Service Workers and IndexedDB 📱 #pwa #mobile #offline #webdev",
            "The magic of Tailwind CSS JIT compiler: Shaving 90% of unused CSS classes in production 🎨 #tailwindcss #css #webdesign",
            "Winding roads of Western Ghats during monsoon. Pure developer bliss away from screens 🛣️ #wanderlust #india #travel #reels",
            "Why Redis in-memory caching is essential for low-latency social feed ranking 🚀 #redis #caching #systemdesign",
            "Building OAuth2 and JWT token rotation for bulletproof session security 🔐 #security #jwt #oauth2 #cybersecurity",
            "Designing scalable notification pipelines with server-sent events and Redis Pub/Sub 🔔 #notifications #architecture #backend",
            "Clean architecture principles: Decoupling domain logic from infrastructure layers 🏛️ #cleanarchitecture #softwareengineering #java",
            "High-DPI responsive video player optimization with HTML5 Canvas and WebGL 🎬 #video #multimedia #canvas #reels",
            "From junior engineer to tech leader: 5 non-obvious lessons in scaling engineering teams 👑 #leadership #mentorship #techcareers"
        };

        int reelsNeeded = 100 - (int)ravikantReelsCount;
        int seeded = 0;

        for (int i = 0; i < reelsNeeded; i++) {
            String topic = techTopics[i % techTopics.length];
            String videoUrl = reelVideoUrls[i % reelVideoUrls.length];
            long viewCount = 15000L + (long)(i * 720) + (long)(Math.random() * 8500);

            Post reel = Post.builder()
                    .user(ravikant)
                    .caption(topic + (i >= techTopics.length ? " [Part " + (i / techTopics.length + 1) + "]" : ""))
                    .visibility(Post.Visibility.PUBLIC)
                    .postType(Post.PostType.VIDEO)
                    .viewCount(viewCount)
                    .createdAt(LocalDateTime.now().minusHours(i * 3L))
                    .build();

            Post savedReel = postRepository.save(reel);

            postMediaRepository.save(PostMedia.builder()
                    .post(savedReel)
                    .mediaUrl(videoUrl)
                    .mediaType(PostMedia.MediaType.VIDEO)
                    .orderIndex(0)
                    .build());

            seeded++;
        }
        System.out.println("🎬 [DatabaseSeeder] Successfully seeded " + seeded + " high-engagement Reels for @ravikant");
    }

    private void seedAudioTracksAndDedicatedReels(User ravikant, List<User> proUsers) {
        if (audioTrackRepository.count() >= 10) {
            System.out.println("🎵 [DatabaseSeeder] Audio library already seeded (" + audioTrackRepository.count() + " tracks in DB).");
            return;
        }

        System.out.println("🎵 [DatabaseSeeder] Seeding 12+ High-Quality Curated Audio Tracks & Soundtracks...");

        List<AudioTrack> tracks = List.of(
            AudioTrack.builder()
                .title("Neon Cyberpunk Lofi")
                .artist("Pulse Audio Labs")
                .audioUrl("https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3")
                .coverUrl("https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=300")
                .duration(180.0)
                .createdBy(ravikant)
                .sourceType(AudioTrack.SourceType.ORIGINAL)
                .licenseType(AudioTrack.LicenseType.ROYALTY_FREE)
                .copyrightOwner("Pulse Social Hub")
                .isPublic(true)
                .isActive(true)
                .usageCount(450L)
                .genre("Cyberpunk / Electronic")
                .build(),
            AudioTrack.builder()
                .title("Aarambh Hai Prachand (Trap Remix)")
                .artist("DJ Yash & TechBeats")
                .audioUrl("https://assets.mixkit.co/music/preview/mixkit-hollidays-690.mp3")
                .coverUrl("https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg?auto=compress&cs=tinysrgb&w=300")
                .duration(195.0)
                .createdBy(ravikant)
                .sourceType(AudioTrack.SourceType.PLATFORM)
                .licenseType(AudioTrack.LicenseType.ROYALTY_FREE)
                .copyrightOwner("Creative Commons Zero")
                .isPublic(true)
                .isActive(true)
                .usageCount(920L)
                .genre("Hindi / Fusion")
                .build(),
            AudioTrack.builder()
                .title("Bhojpuri Desi Bass Anthem")
                .artist("Khesari X DJ Raja")
                .audioUrl("https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3")
                .coverUrl("https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=300")
                .duration(165.0)
                .createdBy(ravikant)
                .sourceType(AudioTrack.SourceType.PLATFORM)
                .licenseType(AudioTrack.LicenseType.ROYALTY_FREE)
                .copyrightOwner("Royalty Free Music")
                .isPublic(true)
                .isActive(true)
                .usageCount(780L)
                .genre("Bhojpuri / Folk")
                .build(),
            AudioTrack.builder()
                .title("Midnight Bengaluru Coding Drive")
                .artist("Aarav Beats")
                .audioUrl("https://assets.mixkit.co/music/preview/mixkit-delight-4.mp3")
                .coverUrl("https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=300")
                .duration(210.0)
                .createdBy(ravikant)
                .sourceType(AudioTrack.SourceType.ORIGINAL)
                .licenseType(AudioTrack.LicenseType.ROYALTY_FREE)
                .copyrightOwner("Pulse Studio")
                .isPublic(true)
                .isActive(true)
                .usageCount(340L)
                .genre("Lofi / Chill")
                .build(),
            AudioTrack.builder()
                .title("Sub-10ms High Energy Drop")
                .artist("Pulse Master Audio")
                .audioUrl("https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3")
                .coverUrl("https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=300")
                .duration(150.0)
                .createdBy(ravikant)
                .sourceType(AudioTrack.SourceType.PLATFORM)
                .licenseType(AudioTrack.LicenseType.ROYALTY_FREE)
                .copyrightOwner("Platform Audio")
                .isPublic(true)
                .isActive(true)
                .usageCount(610L)
                .genre("EDM / House")
                .build(),
            AudioTrack.builder()
                .title("Acoustic Sunset Horizon")
                .artist("Kabir Sharma")
                .audioUrl("https://assets.mixkit.co/music/preview/mixkit-sun-and-sky-577.mp3")
                .coverUrl("https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=300")
                .duration(175.0)
                .createdBy(ravikant)
                .sourceType(AudioTrack.SourceType.ORIGINAL)
                .licenseType(AudioTrack.LicenseType.ROYALTY_FREE)
                .copyrightOwner("Kabir Sharma Audio")
                .isPublic(true)
                .isActive(true)
                .usageCount(290L)
                .genre("Acoustic / Indie")
                .build()
        );

        List<AudioTrack> savedTracks = audioTrackRepository.saveAll(tracks);
        System.out.println("✅ [DatabaseSeeder] Successfully seeded " + savedTracks.size() + " audio tracks!");

        // Seed initial 20-second dedicated Reel entities
        if (reelRepository.count() == 0) {
            String[] videoUrls = {
                "/uploads/73e9cd71-31ff-41a5-9707-cb1c391b36dc.mp4",
                "/uploads/81932133-f02b-48b6-8e61-ff5f112466ea.mp4",
                "https://media.w3.org/2010/05/sintel/trailer.mp4",
                "https://media.w3.org/2010/05/bunny/trailer.mp4",
                "https://media.w3.org/2010/05/video/movie_300.mp4"
            };

            String[] captions = {
                "⚡ Stop building social apps the old way! Sub-10ms Spring Boot 3 + React 18 architecture #Tech #Architecture #Coding",
                "🚀 Designing high-throughput event-driven microservices for 50k req/sec with zero latency! #SystemDesign #Java #SpringBoot",
                "🌌 Late night engineering sprint in Bengaluru! Building the future with Pulse Social Hub ✨ #Bangalore #Developer #Reel",
                "🔥 Instant WebRTC multi-peer video streaming with zero lag! Check it out live 🎥 #WebRTC #FullStack #TechLead",
                "👑 Join the Pulse creator community today and share your high-caliber projects! 🚀 #PulseHub #Creator #CodingLife"
            };

            for (int i = 0; i < videoUrls.length; i++) {
                AudioTrack track = savedTracks.get(i % savedTracks.size());
                User creator = (i == 0 || ravikant == null) ? ravikant : proUsers.get(i % proUsers.size());
                if (creator == null) creator = ravikant;

                Reel reel = Reel.builder()
                    .user(creator)
                    .videoUrl(videoUrls[i])
                    .thumbnailUrl(track.getCoverUrl())
                    .caption(captions[i])
                    .duration(15.0 + (i % 5))
                    .audioTrack(track)
                    .audioStartTime(10.0 * i)
                    .audioEndTime(10.0 * i + 18.0)
                    .originalAudioVolume(100)
                    .musicVolume(80)
                    .viewCount(1200L + i * 350)
                    .likesCount(150L + i * 45)
                    .commentsCount(25L + i * 8)
                    .sharesCount(15L + i * 3)
                    .status(Reel.ReelStatus.READY)
                    .build();

                reelRepository.save(reel);
            }
            System.out.println("✅ [DatabaseSeeder] Successfully seeded initial dedicated 20-second Reels!");
        }
    }

    private void repairExistingMixkitVideos() {
        try {
            String[] reliableUrls = {
                "/uploads/73e9cd71-31ff-41a5-9707-cb1c391b36dc.mp4",
                "/uploads/81932133-f02b-48b6-8e61-ff5f112466ea.mp4",
                "https://media.w3.org/2010/05/sintel/trailer.mp4",
                "https://media.w3.org/2010/05/bunny/trailer.mp4",
                "https://media.w3.org/2010/05/video/movie_300.mp4"
            };

            List<PostMedia> allMedia = postMediaRepository.findAll();
            int updatedMedia = 0;
            for (int i = 0; i < allMedia.size(); i++) {
                PostMedia media = allMedia.get(i);
                if (media.getMediaUrl() != null && (media.getMediaUrl().contains("mixkit.co") || media.getMediaUrl().contains("commondatastorage.googleapis.com"))) {
                    media.setMediaUrl(reliableUrls[i % reliableUrls.length]);
                    postMediaRepository.save(media);
                    updatedMedia++;
                }
            }

            List<Reel> allReels = reelRepository.findAll();
            int updatedReels = 0;
            for (int i = 0; i < allReels.size(); i++) {
                Reel r = allReels.get(i);
                if (r.getVideoUrl() != null && (r.getVideoUrl().contains("mixkit.co") || r.getVideoUrl().contains("commondatastorage.googleapis.com"))) {
                    r.setVideoUrl(reliableUrls[i % reliableUrls.length]);
                    reelRepository.save(r);
                    updatedReels++;
                }
            }

            if (updatedMedia > 0 || updatedReels > 0) {
                System.out.println("🔄 [DatabaseSeeder] Upgraded " + updatedMedia + " post videos and " + updatedReels + " reels to verified fast W3C/MDN CDN streams!");
            }
        } catch (Exception e) {
            System.err.println("⚠️ [DatabaseSeeder] Video URL upgrade notice: " + e.getMessage());
        }
    }

    private void seed100JavaInterviewShortVideosAndPlaylist(User ravikant, List<User> proUsers) {
        if (ravikant == null) return;

        String[] topics = {
            // Core Java Basics (1 to 20)
            "What is Java and Platform Independence?",
            "JDK vs JRE vs JVM Explained Simply",
            "How Java Main Method Works (public static void main)",
            "Primitive Data Types in Java",
            "Type Casting: Implicit vs Explicit",
            "Operators in Java (Arithmetic & Logical)",
            "If-Else and Switch-Case Statements",
            "For Loop vs While Loop vs Do-While",
            "Break and Continue Statements",
            "One-Dimensional Arrays in Java",
            "Multi-Dimensional Arrays Explained",
            "String Class & String Pool in Java",
            "Why Strings are Immutable in Java?",
            "StringBuilder vs StringBuffer",
            "Command Line Arguments in Java",
            "Garbage Collection Basics in Java",
            "Heap Memory vs Stack Memory",
            "Scanner Class vs BufferedReader for Input",
            "Packages and Access Modifiers (Public, Private, Protected)",
            "Coding Best Practices & Naming Conventions",

            // Object-Oriented Programming - OOPs (21 to 40)
            "Classes and Objects in Java",
            "Constructors (Default & Parameterized)",
            "Constructor Overloading",
            "The this Keyword",
            "Inheritance (extends keyword)",
            "Method Overriding vs Overloading",
            "The super Keyword",
            "Polymorphism (Compile-time vs Runtime)",
            "Encapsulation (Getters and Setters)",
            "Abstraction using Abstract Classes",
            "Interfaces in Java (Multiple Inheritance)",
            "Abstract Class vs Interface",
            "The final Keyword (Variable, Method, Class)",
            "The static Keyword (Variable, Method, Block)",
            "Association, Aggregation, and Composition",
            "Object Class Methods (toString, hashCode, equals)",
            "Deep Copy vs Shallow Copy in Java",
            "Covariant Return Types",
            "Instance Initializer Blocks",
            "Marker Interfaces (Serializable, Cloneable)",

            // Exception Handling (41 to 50)
            "What are Exceptions in Java?",
            "Checked vs Unchecked Exceptions",
            "Try-Catch Block Execution",
            "Multiple Catch Blocks & Catching Multiple Exceptions",
            "The finally Block",
            "throw vs throws Keywords",
            "Custom/User-Defined Exceptions",
            "Try-with-Resources (AutoCloseable)",
            "Exception Propagation in Java",
            "Common Exceptions (NullPointerException, ArrayIndexOutOfBounds)",

            // Java Collections Framework (51 to 75)
            "Introduction to Collections Hierarchy",
            "ArrayList vs LinkedList",
            "Vector vs ArrayList",
            "Iterators and ListIterators",
            "HashSet, LinkedHashSet, and TreeSet",
            "HashMap Internal Working",
            "LinkedHashMap vs HashMap",
            "TreeMap and SortedMap",
            "Stack Data Structure in Java",
            "Queue and PriorityQueue",
            "Deque and ArrayDeque",
            "Comparable vs Comparator Interfaces",
            "Collections Utility Class Methods (sort, binarySearch)",
            "Generics in Java (<T>)",
            "Wildcards in Generics (Upper and Lower Bounded)",
            "How HashMap Handles Collisions (Chaining & Treeification)",
            "ConcurrentHashMap vs HashMap",
            "CopyOnWriteArrayList Explained",
            "IdentityHashMap vs HashMap",
            "WeakHashMap Use Cases",
            "EnumMap and EnumSet",
            "PriorityQueue Custom Comparator",
            "Removing Elements safely from ArrayList (Iterator vs for-each)",
            "hashCode() and equals() Contract",
            "Best Practices for Collections",

            // Advanced Java & Multithreading (76 to 90)
            "Creating Threads (Thread class vs Runnable interface)",
            "Thread Lifecycle States",
            "Thread Synchronization (synchronized keyword)",
            "Inter-thread Communication (wait, notify, notifyAll)",
            "Deadlock in Java & How to Prevent It",
            "Volatile Keyword in Java",
            "ThreadPool and ExecutorService Framework",
            "Callable and Future Interfaces",
            "CountDownLatch and CyclicBarrier",
            "ReentrantLock vs Synchronized",
            "Java Reflection API Basics",
            "Annotations in Java (Built-in & Custom)",
            "Serialization and Deserialization (serialVersionUID)",
            "Transient Keyword in Java",
            "Introduction to Java Modules (Java 9+)",

            // Java 8+ Modern Features & Coding Problems (91 to 100)
            "Lambda Expressions in Java 8",
            "Functional Interfaces (@FunctionalInterface)",
            "Predicate, Consumer, Supplier, and Function",
            "Stream API Introduction & Operations",
            "Intermediate vs Terminal Operations in Streams",
            "Method References (ClassName::methodName)",
            "Optional Class (Avoiding NullPointerException)",
            "Default and Static Methods in Interfaces",
            "Record Classes (Data Carriers) in Modern Java",
            "Top 5 Coding Snippets Asked in Java Interviews"
        };

        String[] videoStreams = {
            "/uploads/73e9cd71-31ff-41a5-9707-cb1c391b36dc.mp4",
            "/uploads/81932133-f02b-48b6-8e61-ff5f112466ea.mp4",
            "https://media.w3.org/2010/05/sintel/trailer.mp4",
            "https://media.w3.org/2010/05/bunny/trailer.mp4",
            "https://media.w3.org/2010/05/video/movie_300.mp4"
        };

        String[] coverThumbnails = {
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80"
        };

        // Create or find dedicated 100-Day Java Masterclass Playlist
        List<Playlist> userPlaylists = playlistRepository.findByUserIdOrderByCreatedAtDesc(ravikant.getId());
        Playlist masterPlaylist = userPlaylists.stream()
            .filter(p -> p.getName().equalsIgnoreCase("100-Day Java Masterclass & Interview Prep"))
            .findFirst()
            .orElseGet(() -> playlistRepository.save(Playlist.builder()
                .user(ravikant)
                .name("100-Day Java Masterclass & Interview Prep")
                .description("Complete 100-Day Masterclass covering Core Java, OOPs, Exception Handling, Collections Framework, Multithreading & Concurrency, and Modern Java 8+ Streams.")
                .coverUrl("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80")
                .visibility(Playlist.Visibility.PUBLIC)
                .build()));

        List<AudioTrack> tracks = audioTrackRepository.findAll();

        System.out.println("⏳ [DatabaseSeeder] Seeding 100 Unique Java Interview Short Videos & Sequential Playlist...");

        for (int i = 0; i < topics.length; i++) {
            String topic = topics[i];
            int episodeNum = i + 1;
            String videoTitle = "Episode #" + episodeNum + ": " + topic;
            String streamUrl = videoStreams[i % videoStreams.length];
            String thumbUrl = coverThumbnails[i % coverThumbnails.length];

            String categoryTag;
            if (episodeNum <= 20) categoryTag = "#CoreJava #JavaBasics";
            else if (episodeNum <= 40) categoryTag = "#OOPs #JavaArchitecture";
            else if (episodeNum <= 50) categoryTag = "#ExceptionHandling #CleanCode";
            else if (episodeNum <= 75) categoryTag = "#Collections #DataStructures";
            else if (episodeNum <= 90) categoryTag = "#Multithreading #Concurrency";
            else categoryTag = "#Java8 #StreamAPI #ModernJava";

            String caption = "💡 Day " + episodeNum + "/100: " + topic + " — In-depth breakdown for technical rounds & senior engineering interviews! 🚀 #Java #InterviewPrep #Coding #Backend #SpringBoot " + categoryTag;

            // Check if Post already exists
            Optional<Post> existingPost = postRepository.findAll().stream()
                .filter(p -> videoTitle.equals(p.getTitle()))
                .findFirst();

            Post post;
            if (existingPost.isPresent()) {
                post = existingPost.get();
            } else {
                User creator = (i % 3 == 0 || ravikant == null) ? ravikant : (proUsers != null && !proUsers.isEmpty() ? proUsers.get(i % proUsers.size()) : ravikant);
                if (creator == null) creator = ravikant;

                post = Post.builder()
                    .user(creator)
                    .title(videoTitle)
                    .caption(caption)
                    .postType(Post.PostType.VIDEO)
                    .visibility(Post.Visibility.PUBLIC)
                    .viewCount((long)(1500 + (i * 85)))
                    .build();

                post = postRepository.save(post);

                postMediaRepository.save(PostMedia.builder()
                    .post(post)
                    .mediaUrl(streamUrl)
                    .mediaType(PostMedia.MediaType.VIDEO)
                    .orderIndex(0)
                    .build());
            }

            // Ensure Reel entity exists
            int currentEp = episodeNum;
            Optional<Reel> existingReel = reelRepository.findAll().stream()
                .filter(r -> r.getCaption() != null && r.getCaption().contains("Day " + currentEp + "/100"))
                .findFirst();

            if (existingReel.isEmpty()) {
                AudioTrack track = tracks.isEmpty() ? null : tracks.get(i % tracks.size());
                reelRepository.save(Reel.builder()
                    .user(ravikant)
                    .videoUrl(streamUrl)
                    .thumbnailUrl(thumbUrl)
                    .caption(caption)
                    .duration(18.0)
                    .audioTrack(track)
                    .audioStartTime(0.0)
                    .audioEndTime(18.0)
                    .originalAudioVolume(100)
                    .musicVolume(60)
                    .viewCount((long)(2100 + i * 110))
                    .likesCount((long)(320 + i * 25))
                    .commentsCount((long)(45 + i * 6))
                    .sharesCount((long)(20 + i * 4))
                    .status(Reel.ReelStatus.READY)
                    .build());
            }

            // Ensure added into the 100-video playlist sequentially
            String videoIdStr = post.getId().toString();
            if (!playlistVideoRepository.existsByPlaylistIdAndVideoId(masterPlaylist.getId(), videoIdStr)) {
                playlistVideoRepository.save(PlaylistVideo.builder()
                    .playlist(masterPlaylist)
                    .videoId(videoIdStr)
                    .position(episodeNum)
                    .build());
            }
        }

        long count = playlistVideoRepository.countByPlaylistId(masterPlaylist.getId());
        System.out.println("✅ [DatabaseSeeder] Successfully seeded all 100 Unique Java Interview Short Videos! Playlist count: " + count + "/100 videos.");
    }
}

