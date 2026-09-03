# 🚀 CodeAlpha Full Stack Development — Task 2: Social Media Platform

A modern, production-grade social media platform inspired by the visual elegance of Instagram, the rich social networking of Facebook, and the video streaming experience of YouTube. Built from the ground up with **Java 17 (Spring Boot 3)**, **Spring Security**, **JWT**, **Spring Data JPA**, **WebSockets**, and a fast **React + Vite + Tailwind CSS** frontend.

---

## 📌 Project Overview
- **Organization**: CodeAlpha Full Stack Development Internship
- **Task**: Task 2 — Social Media Platform
- **Project Name**: Pulse Social Hub
- **Architecture**: Decoupled Full-Stack Architecture (REST API + WebSockets Real-Time + Relational Database)

---

## 📸 Comprehensive Features

### 1. 🔐 Complete Authentication & Security
- User registration with Full Name, Username, Email, Password, and Password Confirmation.
- BCrypt password hashing & secure salt generation.
- Stateless JWT authentication with Bearer Token interceptor.
- Role-based authorization (`ADMIN`, `USER`).
- Protected routes with redirect guards on frontend.

### 2. 📱 Dynamic Home Feed & Ranking
- Tabbed multi-feed switcher: `For You`, `Following`, `Trending`, `Latest`, `Videos`, `Photos`.
- Multi-media carousel display for images and MP4 video players.
- **"Not Interested"** feedback mechanism to suppress unwanted topics/creators.
- Infinite scroll pagination and skeleton loading placeholders.

### 3. 👍 Multi-Reaction System
- Hover/long-press reaction picker with 6 reaction types: `Like`, `Love`, `Haha`, `Wow`, `Sad`, `Angry`.
- Real-time reaction counts and duplicate-prevention constraints.

### 4. 💬 Comment & Discussion Threads
- Nested comments with threaded replies.
- Real-time comment count updates and creator author badges.
- Edit and delete own comments with confirmation.

### 5. 👥 Follow & Close Friends Circle
- Instant Follow / Unfollow with mutual followers detection ("You both follow @...").
- **Close Friends Circle**: Manage private circles and share exclusive stories with emerald green highlight rings.

### 6. ⏱️ Ephemeral 24h Stories & Profile Highlights
- Full-screen story viewer with progress bars, tap navigation, pause-on-hold, and swipe down to close.
- Text stories with custom gradients and typography styles.
- Story reactions & replies directly routed to Direct Messages.
- **Story Highlights**: Permanent folders on creator profiles.

### 7. 🎬 Reels Short-Video Experience (`/reels`)
- Vertical full-height snap-scrolling video feed with autoplay.
- Quick action drawer for comments, reactions, saving, and link sharing.

### 8. 📊 Creator Studio (`/creator/studio`)
- KPI dashboard: Total Followers, Growth Rate, Total Posts, Views, Reactions, Shares, and Engagement Rate.
- 7-Day Audience Reach & Performance interactive chart.
- Content catalog workstation for Posts, Videos, and Reels.

### 9. 💬 Real-Time Direct Messaging & Group Chats
- Messenger split-view layout.
- Group conversation creator (name, avatar, multi-member management).
- Quote replies, delete for everyone, and in-chat message search.
- WebRTC voice and video calling signaling foundation.

### 10. 🔍 Multi-Category Search & Explore (`/search`)
- Unified search for People, Posts, Videos, and Hashtags.
- Search query history with "Clear History".
- "People You May Know" discovery cards.

### 11. 🔔 Grouped Notifications & Preferences
- Smart notification aggregation (*"Alex, Sarah and 5 others liked your post"*).
- Notification channel preferences toggle drawer.

### 12. 🛡️ Admin Moderation Center (`/admin`)
- Verified creator badge toggle (`✓`).
- Issue official warning dialogs with custom violation reasons.
- User account suspension/unsuspension and content report resolution.

### 13. 🌓 Dark / Light Mode & Mobile Experience
- Persistent theme toggle across all components.
- Mobile bottom navigation bar and offline network status banner.

---

## 🛠️ Technology Stack

### Backend
- **Language**: Java 17 (OpenJDK)
- **Framework**: Spring Boot 3.2.3
- **Security**: Spring Security 6 + JJWT (JSON Web Token)
- **Database / ORM**: Spring Data JPA + Hibernate (MySQL / H2 File Engine)
- **Real-Time**: Spring WebSocket (`/ws`)
- **Build Tool**: Apache Maven

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + PostCSS
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios with Bearer token interceptors

---

## 📁 Directory Structure

```
SocialMedia/
├── backend-java/               # Java Spring Boot 3 Backend
│   ├── src/main/java/com/socialmedia/
│   │   ├── config/            # SecurityConfig, WebMvcConfig, WebSocketConfig, DatabaseSeeder
│   │   ├── controller/        # REST Controllers (Auth, User, Post, Reel, Story, Message, Admin, etc.)
│   │   ├── dto/               # DTO Request/Response models
│   │   ├── entity/            # JPA Entities (User, Post, Reaction, Story, CloseFriend, etc.)
│   │   ├── repository/        # JPA Repositories
│   │   ├── security/          # JwtTokenProvider, JwtAuthenticationFilter, UserDetailsService
│   │   ├── service/           # Business Services
│   │   └── websocket/         # WebSocket Handler & WebRTC Signaling
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── uploads/               # Uploaded media storage
│   └── pom.xml
├── frontend/                   # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/        # Layout, Post, Story, Comment, Profile, Chat, Common
│   │   ├── context/           # AuthContext, SocketContext, ThemeContext
│   │   ├── pages/             # HomePage, ReelsPage, CreatorStudioPage, SearchPage, BookmarksPage, etc.
│   │   ├── services/          # API & WebSocket client services
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── database/                   # Database scripts and schema
│   ├── schema.sql             # Full MySQL relational schema
│   └── seed.js
├── start-all.bat               # Single-click launcher for backend & frontend
├── start-backend.bat           # Backend launcher
├── start-frontend.bat          # Frontend launcher
├── .env.example
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Single-Click Launch (Windows)
Double-click `start-all.bat` in the project root. It will:
1. Launch the Spring Boot Java Backend on `http://localhost:8080` (with automatic database schema creation & seeding).
2. Launch the React Vite Frontend on `http://localhost:5173`.

### 2. Manual Startup

#### Backend:
```bash
cd backend-java
mvn spring-boot:run
# or
java -jar target/social-media-backend-1.0.0.jar
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Demo Credentials

| Role | Email / Identifier | Password | Access / Features |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@social.com` / `admin` | `Admin@123` | Admin Panel (`/admin`), Moderation, Verification Toggle, Warnings |
| **Verified Creator** | `alex@social.com` / `alex` | `User@123` | Creator Studio (`/creator/studio`), Stories, Reels, Close Friends |
| **User (Sarah)** | `sarah@social.com` / `sarah` | `User@123` | Feeds, Direct Messages, Groups, Reactions, Saved Bookmarks |
| **User (David)** | `david@social.com` / `david` | `User@123` | Videos, Comments, Hashtag Following, Profile Highlights |

---

## 🌐 API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user account.
- `POST /api/auth/login` — Authenticate and receive JWT.
- `GET /api/auth/me` — Retrieve current authenticated user profile.

### Posts & Feeds (`/api/posts`)
- `GET /api/posts/feed?type={FOR_YOU|FOLLOWING|TRENDING|LATEST|VIDEOS|PHOTOS}` — Tabbed feeds.
- `POST /api/posts` — Create a new post.
- `POST /api/posts/upload` — Create a post with multi-media images/videos.
- `POST /api/posts/{id}/reactions` — Multi-reaction toggle (`LIKE`, `LOVE`, `HAHA`, `WOW`, `SAD`, `ANGRY`).
- `POST /api/posts/{id}/not-interested` — Suppress irrelevant post topic/creator.
- `POST /api/posts/{id}/save` — Bookmark post to collection folder.

### Creator Studio (`/api/creator/studio`)
- `GET /api/creator/studio` — Creator KPIs, impressions, audience reach graph, and content manager.

### Stories & Highlights (`/api/stories`)
- `GET /api/stories` — Active 24-hour stories.
- `POST /api/stories` — Create media story with audience (`PUBLIC`, `FOLLOWERS`, `CLOSE_FRIENDS`).
- `POST /api/stories/text` — Create text story with background gradient and typography.
- `GET/POST /api/stories/highlights/{username}` — Profile highlights.

### Close Friends (`/api/close-friends`)
- `GET /api/close-friends` — View close friends circle.
- `POST /api/close-friends/{friendId}` — Add user to close friends.
- `DELETE /api/close-friends/{friendId}` — Remove user from close friends.

### Real-Time Messaging (`/api/messages`)
- `GET /api/messages/conversations` — Active direct and group chats.
- `POST /api/messages` — Send direct message / quote reply.
- `POST /api/messages/groups` — Create group conversation.

### Notifications (`/api/notifications`)
- `GET /api/notifications` — Grouped activity alerts.
- `GET/PUT /api/notifications/preferences` — Notification channel toggles.

---

## 🎓 CodeAlpha Full Stack Development Evaluation Note
This project fulfills all criteria of **CodeAlpha Task 2**, featuring a real, fully-connected backend API, persistent database storage, real-time WebSocket communications, complete authentication guards, and a responsive mobile/desktop UI.
