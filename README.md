# CareerRail — Job Portal (with Placement Preparation)

A full-stack job portal built with **HTML, CSS, JavaScript (vanilla)** on the
frontend and **Node.js, Express, MongoDB** on the backend.

## Features

- **Job seeker signup/login** — profile with skills, resume upload (PDF/DOC/DOCX)
- **Recruiter signup/login** — post jobs, manage postings, view & shortlist applicants
- **Admin dashboard** — platform stats, approve/suspend job postings, block users
- **Search & filter jobs** — keyword, location, job type, work mode, experience, salary
- **Apply for jobs** — one-click apply using the uploaded resume, application tracking
- **Save jobs** — heart icon on any job card, dedicated "Saved jobs" tab on the dashboard
- **Student dashboard** — profile completion %, applied jobs with a status timeline
  (Applied → Shortlisted → Interview → Selected/Rejected), saved jobs
- **Recruiter dashboard** — job management, applicant review, real applicant/selected counts
- **Placement Preparation section** — 6 tracks (Aptitude, DSA, CS Fundamentals, System Design,
  HR rounds, Resume building), each topic opens **real study notes** in a modal (not just a
  topic list) + mock interview tips + company-wise interview pattern table
- **Home page** — hero search, career-track explainer, featured jobs, top companies
  (pulled from live job data), testimonials, FAQ accordion, footer with social links
- **Dark / light mode** toggle (persisted per browser)
- **Toast notifications** for actions (apply, save, status updates, errors)
- Fully responsive, custom "career track" themed UI (no framework, no Bootstrap)

## Roadmap (not included yet — needs extra infrastructure)

These came up as feature requests but need services or a bigger rewrite beyond a single
Express + vanilla-JS project, so they're intentionally left as next steps rather than
half-implemented:

- **Email verification / forgot-password flow** — needs a transactional email provider
  (e.g. SendGrid, Resend) and a mail-sending setup; unsafe to fake.
- **Cloudinary for resumes** — currently resumes are stored on local disk via Multer;
  swapping to Cloudinary just means changing the storage adapter in `middleware/upload.js`.
- **React + Redux/Context rewrite** — the current frontend is vanilla JS on purpose (zero
  build step, easy to run for a college project); migrating to React is a valid next
  version but is a separate rewrite, not an incremental patch.
- **Interview scheduling & recruiter analytics charts** — needs a new `Interview` model
  and a charting library; straightforward to add once the core flow is stable.
- **Live deployment (Vercel + Render)** — works well with this structure (client is
  static, server is a standard Node app) but needs your own accounts/domains to set up.

## Tech stack

| Layer     | Tech |
|-----------|------|
| Frontend  | HTML5, CSS3 (custom design system), vanilla JavaScript |
| Backend   | Node.js, Express.js |
| Database  | MongoDB + Mongoose |
| Auth      | JWT + bcrypt password hashing |
| Uploads   | Multer (resume PDF/DOC/DOCX, 5MB limit) |

## Folder structure

```
job-portal/
├── server/              # Express + MongoDB backend
│   ├── config/db.js
│   ├── models/          # User, Job, Application
│   ├── middleware/       # auth (JWT), upload (multer)
│   ├── routes/           # auth, jobs, applications, admin, upload, prep
│   ├── uploads/resumes/  # uploaded resumes get stored here
│   ├── seedAdmin.js      # creates the first admin account
│   ├── server.js
│   └── package.json
└── client/               # Static frontend, served by Express
    ├── index.html         (landing page)
    ├── login.html / signup.html
    ├── jobs.html           (search & filter)
    ├── job-detail.html     (view + apply)
    ├── my-applications.html
    ├── profile.html        (resume upload)
    ├── recruiter-dashboard.html
    ├── post-job.html
    ├── admin-dashboard.html
    ├── placement-prep.html
    ├── css/style.css
    └── js/ (api.js, nav.js)
```

## Setup & run locally

### 1. Prerequisites
- [Node.js](https://nodejs.org) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally, or a free
  [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### 2. Install dependencies
```bash
cd server
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```
Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/job_portal
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
```

### 4. Create the admin account
```bash
node seedAdmin.js
```
This prints the default admin login:
```
Email: admin@jobportal.com
Password: Admin@123
```
(Override with `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars before running if you want different credentials.)

### 5. Start the server
```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start
```

The server serves **both** the API and the frontend — open:
```
http://localhost:5000
```

That's it — no separate frontend server or build step needed.

## Default test flow

1. Go to `/signup.html` → create a **Job Seeker** account → go to Profile → upload a resume.
2. Open a private/incognito window → sign up as a **Recruiter** → Post a Job.
3. Back in the job seeker window → Browse Jobs → open the job → Apply.
4. Log in as **admin** (`admin@jobportal.com` / `Admin@123`) → see platform-wide stats,
   approve/suspend jobs, block/unblock users.

## Notes for placement / project submission

- Passwords are hashed with bcrypt; sessions are stateless JWTs stored in `localStorage`.
- Resume files are stored on disk under `server/uploads/resumes` and served statically.
- The Placement Preparation content (`/api/prep`) is currently static JSON on the backend —
  it's a natural next step to move it into its own MongoDB collection with an admin editor.
- To deploy, point `MONGO_URI` at an Atlas cluster, set a strong `JWT_SECRET`, and host the
  `server/` folder on any Node host (Render, Railway, etc.) — it already serves the `client/`
  folder as static files, so one deployment covers the whole app.
