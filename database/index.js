import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { User } from './models/User.js';
import { Project } from './models/Project.js';
import { Application } from './models/Application.js';
import { Review } from './models/Review.js';
import { Message } from './models/Message.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_freelance';

export let isMongoConnected = false;

// Initial Seed Data Store (also used as graceful in-memory fallback if Mongo is offline)
export const fallbackStore = {
  users: [
    {
      id: 'usr_student_1',
      _id: 'usr_student_1',
      name: 'Nrup Pathak',
      email: 'nrup.pathak_cs24@gla.ac.in',
      password: '$2a$10$wS2zXz1bX1v1x1y1z1w1ueqg4m5Y6U7I8O9P0A1S2D3F4G5H6J7K', // password123
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      headline: 'Backend Developer | Node.js, Express & MongoDB Specialist',
      bio: 'B.Tech CS Student at GLA University, Mathura (Section 3FB, Roll No: 2415001066). Passionate about developing scalable REST APIs, database architecture, and full-stack web applications.',
      college: 'GLA University, Mathura',
      major: 'Computer Science & Engineering',
      grad_year: 2026,
      hourly_rate: 30,
      availability_hours: 20,
      rating_avg: 4.9,
      rating_count: 7,
      completed_projects_count: 5,
      skills: [
        { skill_name: 'React', level: 'Expert' },
        { skill_name: 'TypeScript', level: 'Intermediate' },
        { skill_name: 'Node.js', level: 'Intermediate' },
        { skill_name: 'Tailwind CSS', level: 'Expert' },
        { skill_name: 'Python', level: 'Intermediate' },
        { skill_name: 'SQL', level: 'Intermediate' }
      ],
      portfolios: [
        {
          id: 'port_1',
          title: 'ClubSync - Student Org Event Manager',
          description: 'Full-stack management portal for 25+ university clubs featuring ticket RSVP, budget tracking, and real-time announcements.',
          project_url: 'https://clubsync-demo.vercel.app',
          github_url: 'https://github.com/nruppathak/clubsync',
          image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
          tags: 'React, Tailwind CSS, Node.js, MongoDB'
        },
        {
          id: 'port_2',
          title: 'StudyPulse - Collaborative Pomodoro App',
          description: 'Gamified study room app with sync timers, task boards, and Spotify study playlist embed.',
          project_url: 'https://studypulse-app.dev',
          github_url: 'https://github.com/nruppathak/studypulse',
          image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
          tags: 'React, TypeScript, WebSocket'
        }
      ]
    },
    {
      id: 'usr_student_2',
      _id: 'usr_student_2',
      name: 'Nancy Singh',
      email: 'nancy.singh_cs24@gla.ac.in',
      password: '$2a$10$wS2zXz1bX1v1x1y1z1w1ueqg4m5Y6U7I8O9P0A1S2D3F4G5H6J7K',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      headline: 'Frontend & UI/UX Designer | React.js & Figma Specialist',
      bio: 'B.Tech CS Student at GLA University, Mathura (Section 3FB, Roll No: 2415001013). Crafts intuitive user experiences, Figma design systems, and responsive React interfaces.',
      college: 'GLA University, Mathura',
      major: 'Computer Science & Engineering',
      grad_year: 2026,
      hourly_rate: 35,
      availability_hours: 15,
      rating_avg: 5.0,
      rating_count: 6,
      completed_projects_count: 6,
      skills: [
        { skill_name: 'Figma', level: 'Expert' },
        { skill_name: 'UI/UX Design', level: 'Expert' },
        { skill_name: 'Tailwind CSS', level: 'Intermediate' },
        { skill_name: 'React', level: 'Intermediate' },
        { skill_name: 'Prototyping', level: 'Expert' },
        { skill_name: 'Graphic Design', level: 'Intermediate' }
      ],
      portfolios: [
        {
          id: 'port_3',
          title: 'FinTrack Gen-Z Mobile Banking UI',
          description: 'A vibrant, minimalist financial literacy mobile app design system created for college students with 40+ responsive screens in Figma.',
          project_url: 'https://figma.com/@nancydesign/fintrack',
          github_url: null,
          image_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80',
          tags: 'Figma, UI/UX Design, Design System'
        }
      ]
    },
    {
      id: 'usr_student_3',
      _id: 'usr_student_3',
      name: 'Naman Sharma',
      email: 'naman.sharma_cs24@gla.ac.in',
      password: '$2a$10$wS2zXz1bX1v1x1y1z1w1ueqg4m5Y6U7I8O9P0A1S2D3F4G5H6J7K',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      headline: 'Database Manager | MongoDB & Python Architect',
      bio: 'B.Tech CS Student at GLA University, Mathura (Section 3FB, Roll No: 2415001009). Specialized in MongoDB document design, query optimization, and data pipelines.',
      college: 'GLA University, Mathura',
      major: 'Computer Science & Engineering',
      grad_year: 2026,
      hourly_rate: 32,
      availability_hours: 18,
      rating_avg: 4.8,
      rating_count: 4,
      completed_projects_count: 4,
      skills: [
        { skill_name: 'Python', level: 'Expert' },
        { skill_name: 'MongoDB', level: 'Expert' },
        { skill_name: 'SQL', level: 'Intermediate' },
        { skill_name: 'Data Analysis', level: 'Expert' },
        { skill_name: 'Web Scraping', level: 'Expert' }
      ],
      portfolios: []
    },
    {
      id: 'usr_student_4',
      _id: 'usr_student_4',
      name: 'Kuldeep Kumar',
      email: 'kuldeep.kumar_cs24@gla.ac.in',
      password: '$2a$10$wS2zXz1bX1v1x1y1z1w1ueqg4m5Y6U7I8O9P0A1S2D3F4G5H6J7K',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      headline: 'Testing & Documentation Manager | QA Engineer',
      bio: 'B.Tech CS Student at GLA University, Mathura (Section 3FB, Roll No: 2415000861). Testing system functionality, fixing errors, and authoring technical documentation.',
      college: 'GLA University, Mathura',
      major: 'Computer Science & Engineering',
      grad_year: 2026,
      hourly_rate: 28,
      availability_hours: 20,
      rating_avg: 5.0,
      rating_count: 5,
      completed_projects_count: 4,
      skills: [
        { skill_name: 'Testing & QA', level: 'Expert' },
        { skill_name: 'JavaScript', level: 'Intermediate' },
        { skill_name: 'React', level: 'Intermediate' },
        { skill_name: 'Technical Writing', level: 'Expert' }
      ],
      portfolios: []
    },
    {
      id: 'usr_client_1',
      _id: 'usr_client_1',
      name: 'TechVentures Labs',
      email: 'contact@techventures.io',
      password: '$2a$10$wS2zXz1bX1v1x1y1z1w1ueqg4m5Y6U7I8O9P0A1S2D3F4G5H6J7K',
      role: 'client',
      avatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80',
      headline: 'Tech Incubator & Seed Startup Accelerator',
      bio: 'We build AI-first tools and love working with talented, ambitious university students on focused agile sprints.',
      rating_avg: 4.9,
      rating_count: 12,
      completed_projects_count: 10,
      skills: [],
      portfolios: []
    },
    {
      id: 'usr_client_2',
      _id: 'usr_client_2',
      name: 'GreenCampus Initiative',
      email: 'partnerships@greencampus.org',
      password: '$2a$10$wS2zXz1bX1v1x1y1z1w1ueqg4m5Y6U7I8O9P0A1S2D3F4G5H6J7K',
      role: 'client',
      avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&auto=format&fit=crop&q=80',
      headline: 'University Sustainability Non-Profit',
      bio: 'Non-profit promoting campus sustainability through student-led carbon footprint tracking and clean energy campaigns.',
      rating_avg: 5.0,
      rating_count: 5,
      completed_projects_count: 4,
      skills: [],
      portfolios: []
    }
  ],
  projects: [
    {
      id: 'proj_1',
      _id: 'proj_1',
      client_id: 'usr_client_1',
      title: 'AI Research Summarizer Web App UI',
      description: 'We need a clean, responsive React dashboard that displays AI-generated summaries of medical and CS papers. The backend REST API is already built; we need student help to craft a sleek frontend with Tailwind and search filters.',
      category: 'Web & Mobile',
      budget_type: 'fixed',
      budget_amount: 450,
      duration: '2-3 weeks',
      experience_level: 'Entry / Student-friendly',
      perks: 'Mentorship with ex-Google Senior Engineer, Flexible exam schedule, Letter of Recommendation',
      status: 'open',
      skills: ['React', 'Tailwind CSS', 'TypeScript'],
      created_at: new Date('2026-09-08 10:00:00')
    },
    {
      id: 'proj_2',
      _id: 'proj_2',
      client_id: 'usr_client_2',
      title: 'Campus Carbon Tracker Landing Page & Figma Mockups',
      description: 'Looking for a creative design student to build interactive mockups and design assets for our university climate action portal. Help us turn raw carbon audit data into delightful student infographics!',
      category: 'Design & Creative',
      budget_type: 'fixed',
      budget_amount: 350,
      duration: '1-2 weeks',
      experience_level: 'Entry / Student-friendly',
      perks: 'Official Certificate of Contribution, Flexible milestone deadlines',
      status: 'open',
      skills: ['Figma', 'UI/UX Design', 'Prototyping'],
      created_at: new Date('2026-09-09 14:30:00')
    },
    {
      id: 'proj_3',
      _id: 'proj_3',
      client_id: 'usr_client_1',
      title: 'University Course Syllabus Data Scraper & Parser',
      description: 'Build an automated Python scraper to extract and normalize weekly readings, grading criteria, and exam schedules from 50 public university catalog PDFs into clean JSON/SQL tables.',
      category: 'Data & Analytics',
      budget_type: 'fixed',
      budget_amount: 400,
      duration: '2 weeks',
      experience_level: 'Intermediate',
      perks: 'Direct code review from Tech Lead, Potential summer internship interview fast-track',
      status: 'open',
      skills: ['Python', 'Web Scraping', 'SQL'],
      created_at: new Date('2026-09-10 09:15:00')
    },
    {
      id: 'proj_4',
      _id: 'proj_4',
      client_id: 'usr_client_2',
      title: 'Student Volunteer Recruitment Portal',
      description: 'Full-stack mini portal allowing students to sign up for campus cleanups and tree-planting drives. Needs student auth and an RSVP management table.',
      category: 'Web & Mobile',
      budget_type: 'fixed',
      budget_amount: 600,
      duration: '3-4 weeks',
      experience_level: 'Intermediate',
      perks: 'Letter of Commendation from University Dean of Sustainability',
      status: 'in_progress',
      skills: ['React', 'Node.js', 'SQL'],
      created_at: new Date('2026-09-02 11:00:00')
    },
    {
      id: 'proj_5',
      _id: 'proj_5',
      client_id: 'usr_client_1',
      title: 'Fine-Tune Open-Source LLaMA 3 for Student Exam Helper',
      description: 'Looking for an AI / ML student to fine-tune an open-source LLaMA model on university curriculum notes and past question papers. Deliver clean Python inference notebooks and API integration.',
      category: 'AI & Machine Learning',
      budget_type: 'fixed',
      budget_amount: 550,
      duration: '2-3 weeks',
      experience_level: 'Intermediate',
      perks: 'GPU compute credits provided, Letter of Recommendation from AI Founder',
      status: 'open',
      skills: ['Python', 'Machine Learning', 'PyTorch'],
      created_at: new Date('2026-09-12 10:00:00')
    },
    {
      id: 'proj_6',
      _id: 'proj_6',
      client_id: 'usr_client_2',
      title: 'Technical Documentation & Developer Guide for Campus API',
      description: 'Author comprehensive OpenAPI documentation, code tutorials, and integration guides for the student developer community. Needs clear technical writing and sample request snippets.',
      category: 'Writing & Content',
      budget_type: 'fixed',
      budget_amount: 320,
      duration: '1-2 weeks',
      experience_level: 'Entry / Student-friendly',
      perks: 'Author credit on official developer documentation site, Flexible exam deadlines',
      status: 'open',
      skills: ['Technical Writing', 'Documentation', 'JavaScript'],
      created_at: new Date('2026-09-13 15:30:00')
    },
    {
      id: 'proj_7',
      _id: 'proj_7',
      client_id: 'usr_client_1',
      title: 'Campus Ambassador Growth & Social Media Campaign',
      description: 'Drive awareness for our student tech hackathon across Instagram, LinkedIn, and campus clubs. Help us design engaging visual posts, reels, and execute student outreach.',
      category: 'Marketing & Social Media',
      budget_type: 'fixed',
      budget_amount: 300,
      duration: '2 weeks',
      experience_level: 'Entry / Student-friendly',
      perks: 'Free VIP Hackathon Pass, Certificate of Brand Ambassador Excellence',
      status: 'open',
      skills: ['Social Media', 'Content Strategy', 'Canva'],
      created_at: new Date('2026-09-14 11:00:00')
    }
  ],
  applications: [
    {
      id: 'app_1',
      _id: 'app_1',
      project_id: 'proj_1',
      student_id: 'usr_student_1',
      cover_letter: 'Hi TechVentures team! I have built several React + Tailwind dashboards including ClubSync (see portfolio). I have extensive experience consuming REST APIs and would love to deliver a smooth, accessible interface for your AI summarizer within 2 weeks.',
      bid_amount: 420,
      delivery_timeline: '12 days',
      status: 'under_review',
      created_at: new Date('2026-09-09 11:20:00')
    },
    {
      id: 'app_2',
      _id: 'app_2',
      project_id: 'proj_2',
      student_id: 'usr_student_2',
      cover_letter: 'Hello GreenCampus! I am a B.Tech student studying CS & UI/UX at GLA University. I have previously designed 3 environmental campaign landing pages and can create high-fidelity Figma components that resonate with student audiences.',
      bid_amount: 350,
      delivery_timeline: '7 days',
      status: 'applied',
      created_at: new Date('2026-09-10 16:45:00')
    },
    {
      id: 'app_3',
      _id: 'app_3',
      project_id: 'proj_4',
      student_id: 'usr_student_1',
      cover_letter: 'I previously worked on student event portals and can handle both the React UI and Node.js backend seamlessly with flexible exam hours.',
      bid_amount: 580,
      delivery_timeline: '18 days',
      status: 'accepted',
      created_at: new Date('2026-09-03 14:00:00')
    }
  ],
  reviews: [
    {
      id: 'rev_1',
      _id: 'rev_1',
      project_id: 'proj_4',
      reviewer_id: 'usr_client_2',
      reviewee_id: 'usr_student_1',
      rating: 5,
      comment: 'Nrup is an outstanding student developer. Communication was exceptional, he delivered clean modular React code ahead of schedule, and was super proactive in accommodating our feedback!',
      created_at: new Date('2026-08-25 15:00:00')
    },
    {
      id: 'rev_2',
      _id: 'rev_2',
      project_id: 'proj_4',
      reviewer_id: 'usr_student_1',
      reviewee_id: 'usr_client_2',
      rating: 5,
      comment: 'Fantastic client to work with! Requirements were crystal clear from day one, and they were very understanding during my midterms week.',
      created_at: new Date('2026-08-26 10:00:00')
    }
  ],
  messages: [
    {
      id: 'msg_1',
      _id: 'msg_1',
      project_id: 'proj_1',
      sender_id: 'usr_student_1',
      receiver_id: 'usr_client_1',
      message: 'Hi TechVentures! Thanks for reviewing my proposal. I have already drafted a responsive component structure in React with Tailwind CSS.',
      created_at: new Date('2026-09-09 11:30:00')
    },
    {
      id: 'msg_2',
      _id: 'msg_2',
      project_id: 'proj_1',
      sender_id: 'usr_client_1',
      receiver_id: 'usr_student_1',
      message: 'Hi Nrup! We checked your ClubSync project and were really impressed by your component architecture. Do you have time today for a quick sync on the backend API schema?',
      created_at: new Date('2026-09-09 12:15:00')
    },
    {
      id: 'msg_3',
      _id: 'msg_3',
      project_id: 'proj_1',
      sender_id: 'usr_student_1',
      receiver_id: 'usr_client_1',
      message: 'Yes, definitely! I am free today after 3:30 PM PST right after my Database Systems lecture.',
      created_at: new Date('2026-09-09 12:20:00')
    },
    {
      id: 'msg_4',
      _id: 'msg_4',
      project_id: 'proj_1',
      sender_id: 'usr_client_1',
      receiver_id: 'usr_student_1',
      message: 'Sounds great! We look forward to collaborating with you.',
      created_at: new Date('2026-09-09 12:45:00')
    },
    {
      id: 'msg_5',
      _id: 'msg_5',
      project_id: 'proj_2',
      sender_id: 'usr_client_2',
      receiver_id: 'usr_student_2',
      message: 'Hi Nancy, your FinTrack mobile UI work on Figma is fantastic. How soon could we start drafting the campus climate wireframes?',
      created_at: new Date('2026-09-10 17:00:00')
    },
    {
      id: 'msg_6',
      _id: 'msg_6',
      project_id: 'proj_2',
      sender_id: 'usr_student_2',
      receiver_id: 'usr_client_2',
      message: 'Hello GreenCampus! I can share initial component moodboards and layout wireframes by Friday afternoon!',
      created_at: new Date('2026-09-10 17:15:00')
    }
  ]
};

// Seed MongoDB database
export async function seedMongoDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding MongoDB collections...');
      await User.insertMany(fallbackStore.users);
      await Project.insertMany(fallbackStore.projects);
      await Application.insertMany(fallbackStore.applications);
      await Review.insertMany(fallbackStore.reviews);
      await Message.insertMany(fallbackStore.messages);
      console.log('✅ MongoDB database seeded successfully!');
    }
  } catch (err) {
    console.error('Error seeding MongoDB:', err.message);
  }
}

// Connect to MongoDB
export async function initDatabase() {
  mongoose.connection.on('error', (err) => {
    isMongoConnected = false;
  });

  try {
    console.log(`🔌 Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log('🍃 Connected to MongoDB successfully!');
    await seedMongoDatabase();
  } catch (err) {
    isMongoConnected = false;
    console.warn(`⚠️ MongoDB connection warning: ${err.message}`);
    console.log('💡 Running with full in-memory Mongoose fallback store on D: drive.');
    console.log('📌 To connect to MongoDB Atlas, add your connection string to backend/.env:');
    console.log('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/student_freelance');
  }
}

export { User, Project, Application, Review, Message };
