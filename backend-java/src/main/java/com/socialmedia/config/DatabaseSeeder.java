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
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedAdminRavikant();
        seed100IndianUsers();
    }

    private void seedAdminRavikant() {
        String email = "ravikantsinghravi7@gmail.com";
        Optional<User> existing = userRepository.findByEmailIgnoreCase(email);
        if (existing.isPresent()) {
            User u = existing.get();
            u.setAvatarUrl("/uploads/ravikant_avatar.jpg");
            u.setWebsite("https://github.com/RavikantSingh76");
            u.setDisplayName("Ravikant Singh");
            u.setIsVerified(true);
            userRepository.save(u);
            System.out.println("✅ [DatabaseSeeder] Admin Ravikant Singh avatar & GitHub link updated!");
        } else if (!userRepository.existsByUsernameIgnoreCase("ravikant")) {
            User ravikant = User.builder()
                    .username("ravikant")
                    .email(email)
                    .password(passwordEncoder.encode("Admin@123"))
                    .displayName("Ravikant Singh")
                    .avatarUrl("/uploads/ravikant_avatar.jpg")
                    .coverUrl("https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80")
                    .bio("👑 Chief Administrator & Full Stack Lead | Building next-gen social platforms | Connect with me! 🚀")
                    .website("https://github.com/RavikantSingh76")
                    .location("Bengaluru, India")
                    .role(User.Role.ADMIN)
                    .isVerified(true)
                    .isPrivate(false)
                    .build();

            userRepository.save(ravikant);
            System.out.println("✅ [DatabaseSeeder] Admin Ravikant Singh created with custom avatar (ravikantsinghravi7@gmail.com / Admin@123)");
        }
    }

    private void seed100IndianUsers() {
        if (userRepository.count() >= 95) {
            System.out.println("[DatabaseSeeder] Indian users already seeded (" + userRepository.count() + " users in DB).");
            return;
        }

        System.out.println("⏳ [DatabaseSeeder] Seeding 100 Indian Users & Content...");

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
            "🚀 Full Stack Developer @ Bengaluru | Passionate about Java, React & Open Source | Coffee & Code ☕",
            "🎨 UI/UX Designer & Creative Strategist | Crafting intuitive design systems #DesignSystem",
            "🤖 AI Researcher & Machine Learning Enthusiast | Exploring LLMs and Generative Tech 🧠",
            "📱 Mobile App Specialist (React Native & Flutter) | Building high-performance consumer apps",
            "☁️ Cloud Architect & DevOps Geek | AWS Certified | Kubernetes & Terraform Explorer",
            "📸 Photography & Travel Explorer | Capturing the essence of Incredible India 🇮🇳",
            "💡 Startup Founder & Product Strategist | Scaling digital solutions | Angel Investor",
            "📊 Data Scientist | Transforming data into strategic insights | Python & SQL wizard 📈",
            "⚡ Frontend Craftsman | Tailwind CSS & Modern Web Animations #WebDev",
            "🎯 Growth Marketer & Content Creator | Sharing daily tips on tech careers & productivity"
        };

        String[] cities = {
            "Bengaluru, Karnataka", "New Delhi, Delhi", "Mumbai, Maharashtra",
            "Hyderabad, Telangana", "Pune, Maharashtra", "Chennai, Tamil Nadu",
            "Gurugram, Haryana", "Kolkata, West Bengal", "Noida, Uttar Pradesh",
            "Ahmedabad, Gujarat", "Jaipur, Rajasthan", "Chandigarh, Punjab"
        };

        String[] samplePostCaptions = {
            "Super excited to launch our latest full-stack project built with Spring Boot 3 & React! 🚀 What a journey. #coding #tech #react #java",
            "Golden hour in the city! 🌇 Incredible India in all its vibrant glory. #travel #photography #incredibleindia",
            "Architecture review done! Clean code, decoupled microservices, and fast caching are true game changers. 💻 #backend #engineering",
            "Weekend hackathon at Bengaluru tech hub! Meeting so many inspiring founders and developers today. ⚡ #startup #community #bengaluru",
            "Morning routine: Dark mode on, fresh filter coffee, and clean commits. What are you building this week? ☕ #developer #productivity",
            "Exploring the newest Generative AI workflows. The leap in productivity is astounding! 🤖 #ai #innovation #future",
            "Designing with empathy: minimalism, accessible contrasts, and smooth micro-interactions. ✨ #design #uiux #creativity",
            "Great evening attending the national tech summit in Delhi NCR. Inspiring keynotes on India's digital public infrastructure. 🇮🇳 #technology #digitalindia",
            "Just crossed another milestone in our cloud infrastructure optimization! Reduced latency by 45%. 📊 #devops #cloud #performance",
            "Sunday vibes with good books and tech podcasts. Recharging for another high-impact week ahead! 📚 #learning #growth #weekend"
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
            String displayName = firstName + " " + lastName;
            String bio = techBios[i % techBios.length];
            String city = cities[i % cities.length];
            String avatarUrl = "https://api.dicebear.com/7.x/bottts/svg?seed=" + username;
            boolean isVerified = (i % 7 == 0); // 1 in 7 verified creators

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

            // Add realistic post for every 2nd user
            if (i % 2 == 0) {
                String caption = samplePostCaptions[i % samplePostCaptions.length];
                Post post = Post.builder()
                        .user(savedUser)
                        .caption(caption)
                        .visibility(Post.Visibility.PUBLIC)
                        .postType(Post.PostType.POST)
                        .viewCount((long)(150 + (i * 12)))
                        .build();

                Post savedPost = postRepository.save(post);

                // Add photo
                String img = sampleImages[i % sampleImages.length];
                postMediaRepository.save(PostMedia.builder()
                        .post(savedPost)
                        .mediaUrl(img)
                        .mediaType(PostMedia.MediaType.IMAGE)
                        .orderIndex(0)
                        .build());

                // Seed comments and likes
                if (i > 1 && !createdUsers.isEmpty()) {
                    User commenter = createdUsers.get(new Random().nextInt(createdUsers.size()));
                    commentRepository.save(Comment.builder()
                            .post(savedPost)
                            .user(commenter)
                            .content("Brilliant work " + firstName + "! Really inspiring. 👍")
                            .build());

                    likeRepository.save(Like.builder()
                            .post(savedPost)
                            .user(commenter)
                            .build());
                }
            }

            // Add story for creators
            if (isVerified) {
                storyRepository.save(Story.builder()
                        .user(savedUser)
                        .mediaUrl(sampleImages[(i + 3) % sampleImages.length])
                        .mediaType(Story.MediaType.IMAGE)
                        .caption("Live from " + city + " 🇮🇳")
                        .audience(Story.Audience.PUBLIC)
                        .expiresAt(LocalDateTime.now().plusHours(24))
                        .build());
            }

            // Follow previous users to create active network
            if (createdUsers.size() > 2) {
                User toFollow = createdUsers.get(new Random().nextInt(createdUsers.size() - 1));
                if (!toFollow.getId().equals(savedUser.getId()) && followRepository.findByFollowerAndFollowing(savedUser, toFollow).isEmpty()) {
                    followRepository.save(Follow.builder()
                            .follower(savedUser)
                            .following(toFollow)
                            .status(Follow.Status.ACCEPTED)
                            .build());
                }
            }
        }

        System.out.println("✅ [DatabaseSeeder] Successfully seeded 100 Indian Users with active feeds, stories, and interactions!");
    }
}
