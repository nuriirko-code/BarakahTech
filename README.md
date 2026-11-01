# Barakah Academy

**What problem do you want to solve?**

Barakah Academy is a web platform that guides young people from an idea toward a real opportunity. Learners can explore community sessions, develop relevant skills through structured courses and live one-to-one tutoring, build a first version, and work toward a better life.

> INSA Summer Camp Final Project (MERN Stack), October 2026

## Demo Video

A screen-recorded walkthrough of the application (approximately 25 minutes and 39 seconds) is included in the repository:

- [Watch or download the Barakah Academy demo](./client/src/assets/Video/Barakah-Academy-demo.mp4)
- File: `client/src/assets/Video/Barakah-Academy-demo.mp4`

## The Barakah Journey

The current landing page presents these stages:

```text
Brainstorm -> Analyze -> Learn -> Build -> Launch -> Live Better -> Join Us
```

| Stage | What the learner does | Platform feature |
|---|---|---|
| Brainstorm | Brings a problem, idea, or curiosity to a small group | Community Idea Labs and session reservations |
| Analyze | Explores who has the problem and gets feedback | Facilitators, guest mentors, and published session outcomes |
| Learn | Develops skills relevant to the idea | Published courses and live tutors |
| Build | Works toward a first version with support | Tutor booking and messaging |
| Launch | Shares or presents the work | Community sessions and showcases |
| Live Better | Applies learning toward personal goals and opportunities | Courses and tutoring |
| Join Us | Creates an account and participates in the platform | Student registration |

Portfolio and opportunity-matching features are future work; the platform does not guarantee employment.

## Main Features

### Community

- Browse upcoming and past community sessions.
- Reserve or cancel a seat in a session, subject to its capacity.
- Join a live meeting when the session opens.
- Administrators can create and start sessions and publish summaries, problem statements, resources, and next steps.

### Courses

- Teacher applications with administrator approval.
- Course creation, publication, rich-text lessons, and video links.
- Lesson assessments and learner progress tracking.
- Paid courses provide a trial of the first 20% of lessons before full enrollment.
- Free courses are available for enrollment without payment.

### Live tutoring

- Live-tutor applications and administrator approval.
- Public tutor profiles, weekly availability, and booking.
- Browser-based video sessions using Jitsi Meet.
- Session feedback and payment/earning workflows.

### Platform

- Manual payment options using Telebirr and CBE Birr, with administrator verification.
- In-platform messaging with contact-sharing protection.
- Email notifications and password-reset support.
- Interface languages: English, Amharic, and Afaan Oromo. 
- Role-based access for students, teachers, live tutors, and administrators.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router, Tailwind CSS, Axios, i18next |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens and bcryptjs |
| Video | Jitsi Meet |
| Email | Resend |

## Project Structure

```text
BarakahTech/
├── client/                         React frontend
│   ├── public/
│   │   └── images/                 Landing and page images
│   └── src/
│       ├── assets/
│       │   └── Video/              Screen-recorded project demo
│       ├── components/
│       │   ├── common/
│       │   ├── courses/
│       │   └── landing/
│       ├── context/
│       ├── i18n/
│       │   └── locales/            English, Amharic, Afaan Oromo
│       ├── pages/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   └── public/
│       ├── services/
│       └── utils/
├── server/                         Express backend
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   └── utils/
└── README.md
```

## Run Locally

### Requirements

- Node.js 20.19 or newer (or Node.js 22.12 or newer)
- MongoDB locally or a MongoDB Atlas connection
- Git

### Backend

In a terminal:

```bash
cd server
npm install
```

Copy `server/.env.example` to `server/.env`, then set the values for your environment. Start the server:

```bash
npm run dev
```

### Frontend

In a second terminal:

```bash
cd client
npm install
```

Copy `client/.env.example` to `client/.env` and update any values you need. Start the Vite development server:

```bash
npm run dev
```

Open the local address printed by Vite, usually `http://localhost:5173`.

### Environment variables

The example files document the supported settings:

- `server/.env.example` — server port, MongoDB connection (`MONGO_URI`), JWT secret, frontend origin, email, payments, and support contact.
- `client/.env.example` — API URL and public payment/support settings.

Use your own strong JWT secret and real service/account values where needed. Never commit real secrets or `.env` files; the client and server each have their own `.gitignore`.

### Sample community sessions

With the backend environment configured and MongoDB running, run:

```bash
cd server
npm run seed:community
```

This inserts demonstration sessions with `[Demo]` in their titles.

## Test Accounts

Create student and teacher accounts through the registration pages. Administrator accounts are created directly in the database and cannot be registered through the public signup flow. Do not include real credentials in this README.

## Known Limitations

- Payments are verified manually by an administrator; automated payment processing is not currently available.
- Jitsi video sessions work best when the application is deployed over HTTPS.
- Amharic and Afaan Oromo translations should be reviewed by native speakers.
- Course titles, tutor bios, and other user-created content remain in the language in which they were entered.
- Portfolio and opportunity-matching features are planned, not currently implemented.

## Future Work

Automated payment processing, portfolios and an opportunity board, an AI learning assistant, mobile apps, group learning tools, and certificates.

## Team

Complete these details before submission:

- **Team name:Barakah Academy Team
- **Members:Nuri Irko (others will be added after mvp)
- **Mentor:Dibora Taggesse
