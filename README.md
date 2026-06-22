# InterviewAI – AI-Powered Job-Specific Interview Preparation Platform

InterviewAI is a production-ready, full-stack MERN SaaS web application designed to help job seekers and students prepare for targeted job interviews. By leveraging the **Gemini API** and parsing PDF resumes, the platform generates personalized questions, evaluates user answers with granular metrics, performs ATS matching, and builds tailored learning paths.

---

## 🌟 Key Features

1. **AI Resume Parser**: Upload a PDF resume to extract skills, experience, projects, education, and automatically identify missing elements with improvement tips.
2. **AI Job Description Analyzer**: Analyze paste/upload JDs to extract expected roles, skills, and potential interview topics.
3. **ATS Matcher**: Compare your parsed resume directly with any job description, generating a match score (0-100%), matching/missing keywords, and actionable suggestions.
4. **Learning Roadmap (Skill Gap)**: Highlights skill discrepancies and auto-generates a weekly timeline-based study roadmap with recommended resources.
5. **Interactive Interview Simulator**:
   - Practice technical, DSA, SQL, DBMS, OOP, System Design, HR, and behavioral questions.
   - Live timer, progress indicators, and custom interview configurations.
   - Comprehensive AI feedback per question including scoring (0-10) across accuracy, communication, completeness, and relevance.
6. **Detailed Reports & Performance Analytics**:
   - Visualizing progress via interactive charts (Recharts).
   - Detailed history logs showing scores over time and weak areas.
7. **Company Intelligence Research**: Auto-generate deep company profiles, frequent topics, and technical stack details.
8. **Admin Panel**: Manage registered users, toggle statuses, and view overall platform metrics.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), React Router v6, Tailwind CSS, Axios, React Query (TanStack Query v5), Recharts, React Hot Toast, Lucide Icons.
- **Backend**: Node.js, Express.js, JWT Authentication, Multer, PDF-Parse, Helmet, Express Rate Limit, Mongo-Sanitize, XSS-Clean.
- **Database**: MongoDB & Mongoose.
- **AI Engine**: Google Gemini API (`@google/generative-ai` with `gemini-1.5-flash`).

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- MongoDB installed locally OR MongoDB Atlas cluster URI
- Gemini API Key

### Local Installation

1. **Clone the repository and go to the project directory**:
   ```bash
   cd interviewAI_project
   ```

2. **Configure Backend Environment Variables**:
   Create a `.env` file under `backend/`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/interviewai
   JWT_SECRET=interviewai_super_secret_key_change_in_production_2024
   JWT_EXPIRE=7d
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   CLIENT_URL=http://localhost:5173
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   ```

3. **Install Dependencies**:
   ```bash
   # Install Backend dependencies
   cd backend
   npm install

   # Install Frontend dependencies
   cd ../frontend
   npm install
   ```

4. **Seed Database (Users & Companies)**:
   Run the database seed script to insert demo users and company profiles:
   ```bash
   cd ../backend
   npm run seed
   ```
   **Credentials Seeded**:
   - **Admin Account**: `admin@interviewai.com` / `Admin@123`
   - **Demo User Account**: `demo@interviewai.com` / `Demo@1234`

5. **Start Dev Servers**:
   ```bash
   # Start backend (from backend/)
   npm run dev

   # Start frontend (from frontend/)
   npm run dev
   ```

Frontend will run at `http://localhost:5173/` and backend API will run at `http://localhost:5000/`.

---

## 🐳 Docker Deployment

To run the entire stack including a local MongoDB database using Docker Compose:

1. Add your `GEMINI_API_KEY` to the environment or root `.env`.
2. Build and run containers:
   ```bash
   docker-compose up --build
   ```
3. Access the frontend at `http://localhost/` and the backend api health endpoint at `http://localhost/api/health`.

---

## 📂 Project Architecture

```
interviewAI_project/
├── backend/                  # Node.js + Express API
│   ├── config/               # DB and Upload configs
│   ├── controllers/          # Request handlers (controllers)
│   ├── middleware/           # Auth, security, uploads, and errors
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express routing tables
│   ├── services/             # AI (Gemini) integrations & business logic
│   ├── seed/                 # Database seed script
│   └── server.js             # Express entrypoint
│
└── frontend/                 # React SPA (Vite)
    ├── src/
    │   ├── api/              # Axios configuration & services
    │   ├── components/       # Layouts, buttons, fields, UI components
    │   ├── contexts/         # React Auth Context state
    │   ├── pages/            # Page layouts & container modules
    │   ├── App.jsx           # Main routing & layout guard
    │   └── main.jsx          # DOM rendering root
    └── vite.config.js        # Proxy configurations & Vite build settings
```

---

## 🔒 Security Standards

- Hashed passwords using 12 rounds of bcrypt.
- JWT-based authentication with user role verification.
- HTTP security headers powered by `helmet`.
- Request rate limiting via `express-rate-limit`.
- XSS prevention and database query sanitation (`express-mongo-sanitize`).
