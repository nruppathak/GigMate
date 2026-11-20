# 🎓 GigMate — Student Freelancing Platform

A modern, full-stack freelancing platform designed specifically for college and university students to discover freelance projects, micro-internships, and part-time opportunities tailored to their academic background and technical skills.

---

## 🌟 Key Features

### 1. 🎓 Student Profiles & Portfolio Showcase
- **Academic Verification**: University name, degree, major, and graduation year.
- **Skill Proficiency Tags**: Tag skills with proficiency levels (*Beginner*, *Intermediate*, *Expert*).
- **Portfolio Showcase**: Interactive project cards with live demo links, GitHub repositories, and image thumbnails.
- **Student Preferences**: Set hourly rates and weekly availability hours around class schedules.

### 2. ⚡ Smart Skill-Based Matching & Recommendations
- **Automated Match Scoring**: Calculates real-time compatibility:
  $$\text{Match Score} = \frac{|\text{Student Skills} \cap \text{Project Required Skills}|}{|\text{Project Required Skills}|} \times 100\%$$
- **Visual Match Indicators**: Displays matched skills in emerald chips and missing skills in slate chips.
- **Matched for You Feed**: Dedicated student feed ranking open projects by skill relevance.
- **Client Talent Matching**: Clients can see the top-matching students for their posted projects with one click.

### 3. 💼 Client Project Management & Posting
- **Student-Friendly Gig Postings**: Set fixed prices or hourly budgets, deadlines, and project scope.
- **Perks for Students**: Highlight benefits like *Letter of Recommendation*, *Mentorship with Senior Engineers*, and *Flexible Exam Scheduling*.
- **Proposal Review**: Clients can review student bids, read cover letters, inspect portfolios, and hire talent.

### 4. 📋 Application Tracking Pipeline
- **Kanban-Style Status Flow**:
  $$\text{Applied / Submitted} \longrightarrow \text{Under Review / Shortlisted} \longrightarrow \text{In Progress / Hired} \longrightarrow \text{Completed}$$
- Direct bid and timeline tracking for students and recruiters.

### 5. ⭐ Two-Way Ratings & Reviews
- Five-star rating system with written feedback upon gig completion.
- Dynamic recalculation of average ratings on student and client profile cards.

### 6. 🎭 Instant Multi-Persona Switcher
- Fast header dropdown to switch between:
  - 🎓 **Aarav Sharma** (Junior CS @ Stanford — React, TypeScript, Python)
  - 🎨 **Maya Patel** (Senior Cognitive Sci @ Berkeley — UI/UX Design, Figma)
  - 🤖 **Liam Chen** (Sophomore EECS @ MIT — PyTorch, Data Science)
  - 💼 **TechVentures Labs** (Startup Accelerator Client)
  - 🌿 **GreenCampus Initiative** (Sustainability Non-profit Client)

---

## 🏗️ Tech Stack & Directory Structure

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express 5 REST API.
- **Database**: MongoDB (via Mongoose) with seeded sample data and an in-memory development fallback.
- **Location**: `D:\student-freelance-platform`

```
D:\student-freelance-platform\
├── database\                # Mongoose connection, seed data, and models
│   ├── models\
│   └── index.js
├── frontend\                # React + Vite + Tailwind frontend
│   ├── src\
│   │   ├── components\
│   │   │   ├── Navbar.jsx              # Header, navigation, persona switcher
│   │   │   ├── LoginModal.jsx          # Login & role selection modal
│   │   │   ├── ProjectCard.jsx         # Project listing with match badge
│   │   │   ├── ProjectModal.jsx        # Project details, bidding & candidate review
│   │   │   ├── ApplicationTracker.jsx  # Kanban status pipeline
│   │   │   ├── StudentProfileModal.jsx # Student portfolio & skill manager
│   │   │   ├── ChatDrawer.jsx          # Real-time messaging drawer
│   │   │   ├── PostProjectModal.jsx    # Client gig creator with perks & skills
│   │   │   ├── ReviewModal.jsx         # 5-star review modal
│   │   │   └── TalentDirectory.jsx     # Browse student talent directory
│   │   ├── api.js                      # REST API client
│   │   ├── App.jsx                     # Core application orchestrator
│   │   └── main.jsx
│   └── dist\                # Compiled production build
├── backend\                 # Express backend
│   ├── config\              # API configuration
│   ├── controllers\         # Business logic & status tracking
│   ├── routes\              # REST API routes
│   └── index.js             # Server entry point & WebSockets
└── package.json             # Root runner scripts
```

---

## 🚀 Quick Start Guide

### 1. Launch the Application
Open PowerShell or your command terminal in `D:\student-freelance-platform`:

```bash
# Install database and backend dependencies
npm install
npm install --prefix backend

# Start the full-stack server (both API and UI served together)
npm start
```
Open your browser and visit: **[http://localhost:5000](http://localhost:5000)**

---

### 2. Frontend Development with Hot Reload (Optional)
If you wish to make live modifications to frontend components with instant hot reload:
```bash
npm run dev:client
```
Visit **http://localhost:5173** (Vite proxies all API requests to the backend at port 5000).

---

## 🧪 Verification & Core Test Flows

1. **Explore & Skill Matching**:
   - Open [http://localhost:5000](http://localhost:5000).
   - As Aarav Sharma (CS student), browse projects. Notice the **100% Skill Match** on the "AI Research Summarizer Web App UI" card.
   - Click "Matched For You" in the top bar to see gigs ordered by compatibility.
2. **Submit a Student Proposal**:
   - Click on an open project, fill in your bid ($420), delivery time ("10 days"), and cover note.
   - Submit proposal and switch to the "My Applications" tab to see it under `Submitted / Waiting`.
3. **Switch Persona to Client**:
   - Click the top right persona dropdown and switch to **TechVentures Labs**.
   - Notice the view switches to client mode.
   - Open the project, click the "Received Applications" tab to see Aarav's proposal, and click **Hire Student**.
4. **Deliver & Review**:
   - Once work is complete, mark the gig completed and submit a 5-star rating with feedback.
   - Switch back to the student profile to observe the updated rating and portfolio metrics!
