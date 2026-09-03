package com.socialmedia.config;

import com.socialmedia.entity.*;
import com.socialmedia.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

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
    private CommentLikeRepository commentLikeRepository;

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private StoryViewRepository storyViewRepository;

    @Autowired
    private HashtagRepository hashtagRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ConversationMemberRepository conversationMemberRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private SavedPostRepository savedPostRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println("[DatabaseSeeder] Database already populated. Skipping seeder.");
            return;
        }

        System.out.println("[DatabaseSeeder] Seeding sample data for Social Media Platform...");

        // 1. Users
        String adminPwd = passwordEncoder.encode("Admin@123");
        String userPwd = passwordEncoder.encode("User@123");

        User admin = userRepository.save(User.builder()
                .username("admin")
                .email("admin@social.com")
                .password(adminPwd)
                .displayName("Platform Admin")
                .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80")
                .coverUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80")
                .bio("Official Administrator of the platform. Keeping the community safe and connected. 🛡️")
                .website("https://socialplatform.io")
                .role(User.Role.ADMIN)
                .isPrivate(false)
                .build());

        User alex = userRepository.save(User.builder()
                .username("alexmorgan")
                .email("alex@social.com")
                .password(userPwd)
                .displayName("Alex Morgan")
                .avatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80")
                .coverUrl("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80")
                .bio("Photographer & travel enthusiast ☕ Capturing golden hours worldwide 📸 #photography #travel")
                .website("https://alexmorgan.design")
                .role(User.Role.USER)
                .isPrivate(false)
                .build());

        User sarah = userRepository.save(User.builder()
                .username("sarah_c")
                .email("sarah@social.com")
                .password(userPwd)
                .displayName("Sarah Connor")
                .avatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80")
                .coverUrl("https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80")
                .bio("Product Designer & Tech Explorer 🚀 Building modern apps. #design #technology")
                .website("https://sarahconnor.tech")
                .role(User.Role.USER)
                .isPrivate(false)
                .build());

        User david = userRepository.save(User.builder()
                .username("david_dev")
                .email("david@social.com")
                .password(userPwd)
                .displayName("David Chen")
                .avatarUrl("https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80")
                .coverUrl("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80")
                .bio("Full-Stack Engineer 💻 Java Spring Boot + React + Cloud architecture. #coding #reactjs")
                .website("https://davidchen.dev")
                .role(User.Role.USER)
                .isPrivate(false)
                .build());

        User elena = userRepository.save(User.builder()
                .username("elena_travel")
                .email("elena@social.com")
                .password(userPwd)
                .displayName("Elena Rostova")
                .avatarUrl("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80")
                .coverUrl("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80")
                .bio("Private Account 🔒 Travel blogger exploring 40+ countries. Send follow request to view.")
                .website("https://elenarostova.blog")
                .role(User.Role.USER)
                .isPrivate(true)
                .build());

        User marcus = userRepository.save(User.builder()
                .username("marcus_v")
                .email("marcus@social.com")
                .password(userPwd)
                .displayName("Marcus Vance")
                .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80")
                .coverUrl("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80")
                .bio("Music Producer & Sound Designer 🎧 Synthesizing audio gems and beat sessions. #music #art")
                .website("https://marcusvance.fm")
                .role(User.Role.USER)
                .isPrivate(false)
                .build());

        // 2. Hashtags
        Hashtag photoTag = hashtagRepository.save(Hashtag.builder().tag("photography").build());
        Hashtag travelTag = hashtagRepository.save(Hashtag.builder().tag("travel").build());
        Hashtag designTag = hashtagRepository.save(Hashtag.builder().tag("design").build());
        Hashtag techTag = hashtagRepository.save(Hashtag.builder().tag("technology").build());
        Hashtag codingTag = hashtagRepository.save(Hashtag.builder().tag("coding").build());
        Hashtag musicTag = hashtagRepository.save(Hashtag.builder().tag("music").build());

        // 3. Follows
        followRepository.save(Follow.builder().follower(alex).following(sarah).status(Follow.Status.ACCEPTED).build());
        followRepository.save(Follow.builder().follower(alex).following(david).status(Follow.Status.ACCEPTED).build());
        followRepository.save(Follow.builder().follower(alex).following(marcus).status(Follow.Status.ACCEPTED).build());
        followRepository.save(Follow.builder().follower(sarah).following(alex).status(Follow.Status.ACCEPTED).build());
        followRepository.save(Follow.builder().follower(sarah).following(david).status(Follow.Status.ACCEPTED).build());
        followRepository.save(Follow.builder().follower(david).following(alex).status(Follow.Status.ACCEPTED).build());
        followRepository.save(Follow.builder().follower(david).following(elena).status(Follow.Status.PENDING).build());
        followRepository.save(Follow.builder().follower(marcus).following(alex).status(Follow.Status.ACCEPTED).build());

        // 4. Posts & Media
        Post post1 = postRepository.save(Post.builder()
                .user(alex)
                .caption("Sunset over the alpine peaks. Standing at 3,000m above the clouds reminds you how magnificent our planet truly is. Shot on 35mm. 🏔️✨ #photography #travel")
                .visibility(Post.Visibility.PUBLIC)
                .postType(Post.PostType.POST)
                .viewCount(240L)
                .hashtags(Set.of(photoTag, travelTag))
                .build());

        postMediaRepository.save(PostMedia.builder().post(post1).mediaUrl("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80").mediaType(PostMedia.MediaType.IMAGE).orderIndex(0).build());
        postMediaRepository.save(PostMedia.builder().post(post1).mediaUrl("https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80").mediaType(PostMedia.MediaType.IMAGE).orderIndex(1).build());

        Post post2 = postRepository.save(Post.builder()
                .user(sarah)
                .caption("Super excited to unveil our new design system prototype! Focused on spatial depth, micro-interactions, and accessible typography. Shoutout to @david_dev for helping integrate the tokens! 🎨🚀 #design #technology")
                .visibility(Post.Visibility.PUBLIC)
                .postType(Post.PostType.POST)
                .viewCount(180L)
                .hashtags(Set.of(designTag, techTag))
                .build());

        postMediaRepository.save(PostMedia.builder().post(post2).mediaUrl("https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80").mediaType(PostMedia.MediaType.IMAGE).orderIndex(0).build());

        Post post3 = postRepository.save(Post.builder()
                .user(david)
                .caption("Late night coding sessions hit different when the build passes on the first try! 🚀 What tech stack are you building with this weekend? #coding #technology")
                .visibility(Post.Visibility.PUBLIC)
                .postType(Post.PostType.POST)
                .viewCount(310L)
                .hashtags(Set.of(codingTag, techTag))
                .build());

        postMediaRepository.save(PostMedia.builder().post(post3).mediaUrl("https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80").mediaType(PostMedia.MediaType.IMAGE).orderIndex(0).build());

        Post post4 = postRepository.save(Post.builder()
                .user(marcus)
                .caption("Synthesizing ambient beats in the studio today. Testing out new modular patches and polyphonic soundscapes. Headphones recommended! 🎧🔊 #music")
                .visibility(Post.Visibility.PUBLIC)
                .postType(Post.PostType.VIDEO)
                .title("Studio Sessions #12 - Ambient Modular Synthesis")
                .viewCount(420L)
                .hashtags(Set.of(musicTag))
                .build());

        postMediaRepository.save(PostMedia.builder().post(post4).mediaUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4").mediaType(PostMedia.MediaType.VIDEO).orderIndex(0).build());

        // 5. Likes
        likeRepository.save(Like.builder().user(sarah).post(post1).build());
        likeRepository.save(Like.builder().user(david).post(post1).build());
        likeRepository.save(Like.builder().user(marcus).post(post1).build());
        likeRepository.save(Like.builder().user(alex).post(post2).build());
        likeRepository.save(Like.builder().user(david).post(post2).build());
        likeRepository.save(Like.builder().user(alex).post(post3).build());
        likeRepository.save(Like.builder().user(sarah).post(post3).build());
        likeRepository.save(Like.builder().user(alex).post(post4).build());

        // 6. Comments & Replies
        Comment c1 = commentRepository.save(Comment.builder()
                .post(post1)
                .user(sarah)
                .content("Breathtaking capture Alex! The lighting on the ridge is magical ✨")
                .build());

        commentRepository.save(Comment.builder()
                .post(post1)
                .user(alex)
                .parentComment(c1)
                .content("Thanks Sarah! Woke up at 4 AM for that sunrise lighting 🙌")
                .build());

        commentRepository.save(Comment.builder()
                .post(post1)
                .user(david)
                .content("Incredible colors! What camera body did you use?")
                .build());

        commentLikeRepository.save(CommentLike.builder().user(alex).comment(c1).build());
        commentLikeRepository.save(CommentLike.builder().user(marcus).comment(c1).build());

        // 7. Stories
        storyRepository.save(Story.builder()
                .user(alex)
                .mediaUrl("https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80")
                .mediaType(Story.MediaType.IMAGE)
                .caption("Morning hike view ☀️")
                .expiresAt(LocalDateTime.now().plusHours(23))
                .build());

        storyRepository.save(Story.builder()
                .user(sarah)
                .mediaUrl("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80")
                .mediaType(Story.MediaType.IMAGE)
                .caption("Design workshop in session 💡")
                .expiresAt(LocalDateTime.now().plusHours(23))
                .build());

        storyRepository.save(Story.builder()
                .user(david)
                .mediaUrl("https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80")
                .mediaType(Story.MediaType.IMAGE)
                .caption("Workstation setup complete ⚡")
                .expiresAt(LocalDateTime.now().plusHours(23))
                .build());

        // 8. Saved Posts
        savedPostRepository.save(SavedPost.builder().user(alex).post(post2).build());
        savedPostRepository.save(SavedPost.builder().user(sarah).post(post1).build());

        // 9. Conversations & Messages
        Conversation conv1 = conversationRepository.save(Conversation.builder().build());
        conversationMemberRepository.save(ConversationMember.builder().conversation(conv1).user(alex).build());
        conversationMemberRepository.save(ConversationMember.builder().conversation(conv1).user(sarah).build());

        messageRepository.save(Message.builder().conversation(conv1).sender(sarah).messageText("Hey Alex! Loved your latest landscape photos. When are you traveling next?").isRead(true).build());
        messageRepository.save(Message.builder().conversation(conv1).sender(alex).messageText("Hey Sarah! Thanks! Heading to the Swiss Alps next month for a shoot.").isRead(true).build());
        messageRepository.save(Message.builder().conversation(conv1).sender(sarah).messageText("That sounds incredible! Let me know if you need any feedback on the edits.").isRead(false).build());

        Conversation conv2 = conversationRepository.save(Conversation.builder().build());
        conversationMemberRepository.save(ConversationMember.builder().conversation(conv2).user(alex).build());
        conversationMemberRepository.save(ConversationMember.builder().conversation(conv2).user(david).build());
        messageRepository.save(Message.builder().conversation(conv2).sender(david).messageText("Hey Alex, checkout the Java Spring Boot + React social platform we just deployed!").isRead(true).build());
        messageRepository.save(Message.builder().conversation(conv2).sender(alex).messageText("Just logged in, the UI is super fast and smooth! 🚀").isRead(false).build());

        // 10. Notifications
        notificationRepository.save(Notification.builder().recipient(alex).actor(sarah).type(Notification.Type.LIKE).entityId(post1.getId()).entityType("POST").message("liked your post.").isRead(false).build());
        notificationRepository.save(Notification.builder().recipient(alex).actor(sarah).type(Notification.Type.COMMENT).entityId(post1.getId()).entityType("POST").message("commented: \"Breathtaking capture Alex!...\"").isRead(false).build());
        notificationRepository.save(Notification.builder().recipient(alex).actor(marcus).type(Notification.Type.FOLLOW).entityId(marcus.getId()).entityType("USER").message("started following you.").isRead(true).build());
        notificationRepository.save(Notification.builder().recipient(elena).actor(david).type(Notification.Type.FOLLOW_REQUEST).entityId(david.getId()).entityType("USER").message("requested to follow you.").isRead(false).build());

        // 11. Reports
        reportRepository.save(Report.builder().reporter(marcus).reportedPost(post3).reason("SPAM_OR_MISLEADING").details("Test moderation report for admin verification.").status(Report.Status.PENDING).build());

        System.out.println("✅ [DatabaseSeeder] Database seeding completed successfully!");
    }
}
