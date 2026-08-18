# CareerRail — Job Portal + StudyHub (Placement Prep, Coding, Quizzes, Notes)

A full-stack job portal **and student learning platform** built with **HTML, CSS,
JavaScript (vanilla)** on the frontend and **Node.js, Express, MongoDB** on the backend.

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

### StudyHub (new)

- **Coding practice** — searchable problem list (by title/tag/difficulty), each with an
  in-browser JavaScript code editor. **Run** checks visible test cases; **Submit** runs
  visible + hidden test cases via a lightweight server-side judge (Node's `vm` module,
  2-second timeout per test). Admins add problems from Manage Content.
- **Quizzes** — searchable quiz list by subject, a timed MCQ attempt flow (countdown timer,
  auto-submit on time-up), instant scoring with a full right/wrong answer review, and a
  personal quiz history page. Admins build quizzes question-by-question from Manage Content.
- **Study notes** — searchable PDF notes library by title/subject/tag, opens in an in-page
  PDF viewer (or a new tab), with a view counter. Admins upload PDFs directly from the
  Notes page (20MB limit).

### Platform polish

- **Home page** — hero search, StudyHub highlight section, career-track explainer, featured
  jobs, top companies (pulled from live job data), testimonials, FAQ accordion, footer with
  social links
- **Dark / light mode** toggle (persisted per browser)
- **Toast notifications** for actions (apply, save, status updates, quiz/coding results, errors)
- Fully responsive, custom "career track" themed UI (no framework, no Bootstrap)

## ⚠️ A note on the coding judge

The coding practice "Run/Submit" feature executes student-submitted JavaScript on the
server using Node's built-in `vm` module with a timeout. This is a fine, common approach
for a **college project running locally or on a trusted network** — it stops infinite
loops and scopes what the code can see. It is **not** a hardened, production-grade sandbox
(a determined attacker could still find ways to abuse `vm` in Node). If you ever deploy
this publicly, swap the judge for a real sandboxed runner (e.g. Docker containers, Judge0,
or a serverless code-execution API) before opening it up to the internet.

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
| Uploads   | Multer (resumes: PDF/DOC/DOCX, 5MB · notes: PDF, 20MB) |
| Judge     | Node's built-in `vm` module (see the note above) |

## Folder structure

```
job-portal/
├── server/                  # Express + MongoDB backend
│   ├── config/db.js
│   ├── models/               # User, Job, Application, Note, Quiz, QuizAttempt, CodingProblem
│   ├── middleware/            # auth (JWT), upload (resumes), uploadNote (notes PDF)
│   ├── routes/                # auth, jobs, applications, admin, upload, prep,
│   │                          #   notes, quizzes, coding
│   ├── uploads/resumes/       # uploaded resumes get stored here
│   ├── uploads/notes/         # uploaded PDF notes get stored here
│   ├── seedAdmin.js           # creates the first admin account
│   ├── seedContent.js         # adds sample coding problems + a quiz (optional, re-runnable)
│   ├── server.js
│   └── package.json
└── client/                   # Static frontend, served by Express
    ├── index.html              (landing page)
    ├── login.html / signup.html
    ├── jobs.html                (search & filter)
    ├── job-detail.html          (view + apply + save)
    ├── my-applications.html     (student dashboard)
    ├── profile.html              (resume upload)
    ├── recruiter-dashboard.html
    ├── post-job.html
    ├── admin-dashboard.html
    ├── admin-content.html       (create quizzes & coding problems)
    ├── placement-prep.html
    ├── coding-practice.html / coding-problem.html
    ├── quizzes.html / quiz-attempt.html / quiz-history.html
    ├── notes.html
    ├── css/style.css
    └── js/ (api.js, nav.js, toast.js, theme.js)
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

### 5. (Optional) Seed sample StudyHub content
```bash
node seedContent.js
```
Adds 5 sample coding problems (Two Sum, Reverse String, FizzBuzz, etc.) and a
"JavaScript Basics" quiz, so Coding Practice and Quizzes aren't empty on first run.
Safe to re-run — it skips anything that already exists.

### 6. Start the server
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
3. Back in the job seeker window → Browse Jobs → open the job → Apply. Try saving a job too (❤️).
4. Visit **Coding Practice** → open "Two Sum" → click Run, then Submit.
5. Visit **Quizzes** → start "JavaScript Basics" → answer and submit → see the review.
6. Visit **Notes** → (as admin) upload a PDF → (as student) search and read it.
7. Log in as **admin** (`admin@jobportal.com` / `Admin@123`) → see platform-wide stats,
   approve/suspend jobs, block/unblock users, and use **Manage Content** to add more
   quizzes/coding problems.

## Notes for placement / project submission

- Passwords are hashed with bcrypt; sessions are stateless JWTs stored in `localStorage`.
- Resume and note files are stored on disk under `server/uploads/` and served statically.
- The Placement Preparation content (`/api/prep`) is currently static JSON on the backend —
  it's a natural next step to move it into its own MongoDB collection with an admin editor.
- The coding judge (`/api/coding/:id/run` and `/submit`) supports **JavaScript only** and
  runs via Node's `vm` module — see the warning above before ever exposing it publicly.
- Quiz correct answers are never sent to the client until after submission — the
  `/start` endpoint strips `correctIndex` from every question.
- To deploy, point `MONGO_URI` at an Atlas cluster, set a strong `JWT_SECRET`, and host the
  `server/` folder on any Node host (Render, Railway, etc.) — it already serves the `client/`
  folder as static files, so one deployment covers the whole app.
