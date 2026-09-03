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
    private LikeRepository likeRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private HashtagRepository hashtagRepository;

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
        List<User> indianUsers = seed100IndianUsers();
        seedFollowersAndConversationsForRavikant(ravikant, indianUsers);
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

    private List<User> seed100IndianUsers() {
        List<User> existingUsers = userRepository.findAll();
        if (existingUsers.size() >= 100) {
            System.out.println("[DatabaseSeeder] Indian users already seeded (" + existingUsers.size() + " users in DB).");
            return existingUsers;
        }

        System.out.println("⏳ [DatabaseSeeder] Seeding 100 Indian Professionals & Content...");

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
            "🚀 Senior Software Engineer @ Bengaluru | Java, Spring Boot & Distributed Systems | Coffee & Code ☕",
            "🎨 Lead Product Designer | Crafting intuitive design systems & micro-interactions #UIUX",
            "🤖 AI & Deep Learning Researcher | Exploring LLMs, RAG & Transformer Architectures 🧠",
            "📱 Principal Mobile Architect (Flutter & React Native) | Building apps for millions of users",
            "☁️ Cloud Infrastructure Lead | AWS Certified Solutions Architect | Kubernetes & Terraform",
            "📸 Travel & Culture Photographer | Documenting the heritage and vibrance of Incredible India 🇮🇳",
            "💡 Founder & Angel Investor | Scaling B2B SaaS platforms | Tech Enthusiast",
            "📊 Senior Data Scientist | Transforming petabytes of data into actionable insights 📈",
            "⚡ Frontend Engineer | React, Vite, Tailwind CSS & Web Performance Specialist #WebDev",
            "🎯 Product Growth Strategist | Community Builder | Sharing daily productivity insights"
        };

        String[] cities = {
            "Bengaluru, Karnataka", "New Delhi, Delhi", "Mumbai, Maharashtra",
            "Hyderabad, Telangana", "Pune, Maharashtra", "Chennai, Tamil Nadu",
            "Gurugram, Haryana", "Kolkata, West Bengal", "Noida, Uttar Pradesh",
            "Ahmedabad, Gujarat", "Jaipur, Rajasthan", "Chandigarh, Punjab"
        };

        String[] samplePostCaptions = {
            "Just deployed our latest high-concurrency microservices pipeline! Reduced API response times to under 15ms. 🚀 #tech #java #springboot #backend",
            "Golden hour at Bengaluru tech corridor! The city never stops innovating. 🌇 #bengaluru #india #technology",
            "System design tip: Never underestimate the power of idempotency and asynchronous event queues in distributed architectures. 💻 #engineering #architecture",
            "Weekend hackathon showcase! So thrilled to mentor young college developers building generative AI applications. ⚡ #startup #community #hackathon",
            "Clean workspace, dark mode UI, and continuous integration. Ready for an impactful week ahead! ☕ #productivity #developer",
            "Exploring real-time WebSocket communication and WebRTC signaling protocols. The future of collaboration is interactive! 🤖 #websockets #realtime #innovation",
            "Design philosophy: Great software is invisible. It anticipates user needs and removes friction effortlessly. ✨ #design #uiux #product",
            "Attending the national technology conference in Delhi NCR. Inspiring discussions on India's digital transformation. 🇮🇳 #digitalindia #leadership",
            "Optimized our database indexes and query cache hit rates today. Database CPU usage dropped by 40%! 📊 #database #performance",
            "Sunday reflections on mentorship and engineering leadership. Continuous learning is the key. 📚 #growth #leadership #tech"
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

        for (int i = 0; i < 100; i++) {
            String firstName = firstNames[i % firstNames.length];
            String lastName = lastNames[i % lastNames.length];
            String username = (firstName + "." + lastName + (i + 1)).toLowerCase();
            String email = (firstName + "." + lastName + (i + 1) + "@pulse.in").toLowerCase();

            if (userRepository.existsByEmailIgnoreCase(email) || userRepository.existsByUsernameIgnoreCase(username)) {
                continue;
            }

            String displayName = firstName + " " + lastName;
            String bio = techBios[i % techBios.length];
            String city = cities[i % cities.length];
            String avatarUrl = "https://api.dicebear.com/7.x/bottts/svg?seed=" + username;
            boolean isVerified = (i % 6 == 0); // Verified creator badge

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

            // Post creation
            if (i % 2 == 0) {
                String caption = samplePostCaptions[i % samplePostCaptions.length];
                Post post = Post.builder()
                        .user(savedUser)
                        .caption(caption)
                        .visibility(Post.Visibility.PUBLIC)
                        .postType(Post.PostType.POST)
                        .viewCount((long)(200 + (i * 15)))
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

            // Stories
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

        System.out.println("✅ [DatabaseSeeder] Successfully seeded 100 Indian Professionals!");
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
            "Hi Ravikant! Just checked out the 9:16 vertical Reels and Instagram-style Story viewer. Beautiful implementation!"
        };

        String[] adminReplies = {
            "Hey! Thanks so much for the kind words. Glad you're enjoying the Pulse platform experience! 🚀",
            "Hi! Thanks for reaching out. I'd love to connect and discuss more about the summit.",
            "Welcome to Pulse! Feel free to share your thoughts, posts, and feedback anytime. 🌟",
            "Thank you! We put a lot of focus into clean architecture, low-latency APIs, and seamless real-time sockets.",
            "Appreciate the support! Keep an eye out for upcoming creator studio features and new updates."
        };

        for (int i = 0; i < allUsers.size(); i++) {
            User user = allUsers.get(i);
            if (user.getId().equals(ravikant.getId())) continue;

            // 1. Make 70+ users follow Ravikant Singh
            if (i < 75 && followRepository.findByFollowerAndFollowing(user, ravikant).isEmpty()) {
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
                        .isRead(i > 3)
                        .build());
            }

            // 2. Make Ravikant follow top 18 creators back (mutual following)
            if (i < 18 && followRepository.findByFollowerAndFollowing(ravikant, user).isEmpty()) {
                followRepository.save(Follow.builder()
                        .follower(ravikant)
                        .following(user)
                        .status(Follow.Status.ACCEPTED)
                        .build());
            }

            // 3. Interconnect other users for realistic network
            if (i > 0 && i < 60) {
                User other = allUsers.get((i * 3 + 1) % allUsers.size());
                if (!other.getId().equals(user.getId()) && followRepository.findByFollowerAndFollowing(user, other).isEmpty()) {
                    followRepository.save(Follow.builder()
                            .follower(user)
                            .following(other)
                            .status(Follow.Status.ACCEPTED)
                            .build());
                }
            }

            // 4. Create Direct Messages with Ravikant Singh (first 12 users)
            if (i < 12) {
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
                            .isRead(i > 2)
                            .build());

                    // Add reply from Ravikant for top 6 chats
                    if (i < 6) {
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
}
