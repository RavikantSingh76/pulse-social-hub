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
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        User ravikant = seedAdminRavikant();
        List<User> proUsers = seed200ProfessionalUsers();
        seedFollowersAndConversationsForRavikant(ravikant, proUsers);
        seedReels(ravikant, proUsers);
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
            "https://assets.mixkit.co/videos/preview/mixkit-vertical-city-traffic-at-night-42261-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-vertical-coding-on-a-laptop-in-a-dark-room-41885-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-vertical-hands-typing-on-a-laptop-keyboard-41589-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-vertical-modern-buildings-in-a-financial-district-42469-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-vertical-sun-setting-over-the-ocean-horizon-41571-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-vertical-neon-lights-in-a-cyberpunk-city-street-42512-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-vertical-woman-recording-a-dance-with-her-phone-41489-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-vertical-night-sky-with-stars-and-a-full-moon-41617-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-vertical-waves-crashing-on-a-sandy-beach-42407-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-vertical-drone-view-of-a-winding-mountain-road-42354-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-vertical-people-working-in-a-modern-office-42488-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-vertical-tokyo-street-at-night-with-neon-signs-42490-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-vertical-forest-stream-in-the-sunlight-42468-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-vertical-city-street-in-the-rain-42502-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-vertical-fog-over-the-pine-trees-in-the-mountains-42463-large.mp4"
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

        System.out.println("✅ [DatabaseSeeder] Successfully seeded " + seeded + " professional reels for Chief Admin Ravikant Singh! (Total: 100)");
    }
}
