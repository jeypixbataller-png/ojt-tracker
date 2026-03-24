# OJT Tracker v5 — Supabase Edition
> Full-stack Internship Management System with real database, auth, and real-time updates.

---

## ⚡ QUICK OVERVIEW
- **Frontend**: React + Vite
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password)
- **Real-time**: Supabase Realtime subscriptions
- **Deploy**: Vercel (free)

---

## 🗂️ STEP 1 — Create a Supabase Project

1. Go to **https://supabase.com** → Sign up (free)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `ojt-tracker` (or anything)
   - **Database Password**: create a strong password (save it!)
   - **Region**: pick the closest to your users
4. Click **"Create new project"** and wait ~2 minutes for it to spin up

---

## 🗃️ STEP 2 — Set Up the Database

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file `supabase-setup.sql` from this project folder
4. Copy the **entire contents** and paste it into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see: `Success. No rows returned`

---

## 🔑 STEP 3 — Get Your API Keys

1. In Supabase, go to **Settings** → **API** (left sidebar)
2. Copy these two values:
   - **Project URL** → looks like `https://abcdefgh.supabase.co`
   - **anon public** key → a long JWT string

---

## ⚙️ STEP 4 — Configure the App

1. In your project folder, find the file `.env.example`
2. Create a new file called `.env` (same folder)
3. Paste this into `.env` and fill in your values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> ⚠️ Never share your `.env` file or commit it to GitHub!

---

## 💻 STEP 5 — Run Locally (VS Code)

Make sure you have **Node.js** installed: https://nodejs.org

Open VS Code → Open the project folder → Open Terminal (`Ctrl+\``)

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open your browser at: **http://localhost:5173**

---

## 👤 STEP 6 — Create Your Admin Account

1. Open the app → Click **"Sign Up"**
2. Enter your name, school, email, and password
3. Click **"Create Account"**
4. Go back to Supabase → **SQL Editor** → Run this query:

```sql
update public.profiles set role = 'admin' where email = 'YOUR@EMAIL.com';
```

Replace `YOUR@EMAIL.com` with the email you just signed up with.

5. **Sign out** and **sign back in** → you'll now see "User Management" in the sidebar!

---

## 🚀 STEP 7 — Deploy to Vercel (Free)

### Option A: Deploy via GitHub (Recommended)
1. Push your project to GitHub (without `.env` file!)
2. Go to **https://vercel.com** → Sign up with GitHub
3. Click **"Add New Project"** → Import your repo
4. In the **Environment Variables** section, add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
5. Click **"Deploy"** → Your app is live! 🎉

### Option B: Deploy via CLI
```bash
npm install -g vercel
vercel --prod
```
Follow the prompts and add your env variables when asked.

---

## 🗂️ PROJECT STRUCTURE

```
ojt-tracker/
├── src/
│   ├── lib/
│   │   └── supabase.js          ← Supabase client
│   ├── hooks/
│   │   ├── useAuth.js           ← Auth state & methods
│   │   └── useData.js           ← Logs, Tasks, Notes, Announcements
│   ├── pages/
│   │   ├── AuthPage.jsx         ← Sign in / Sign up
│   │   ├── Dashboard.jsx        ← Main dashboard with charts
│   │   ├── LogsPage.jsx         ← Time logs CRUD
│   │   ├── TasksPage.jsx        ← Kanban task board
│   │   ├── AnnouncementsPage.jsx← Admin posts, users read
│   │   ├── NotesPage.jsx        ← Personal notes
│   │   ├── SettingsPage.jsx     ← Profile settings
│   │   └── AdminPanel.jsx       ← User management (admin only)
│   ├── components/
│   │   ├── Sidebar.jsx          ← Desktop + mobile sidebar
│   │   └── Toast.jsx            ← Notification toasts
│   ├── utils/
│   │   └── helpers.js           ← Date, hour, CSV helpers
│   ├── App.jsx                  ← Root component
│   ├── main.jsx                 ← Entry point
│   └── index.css                ← Global styles
├── supabase-setup.sql           ← Run this in Supabase SQL Editor
├── .env.example                 ← Copy to .env and fill in keys
├── package.json
├── vite.config.js
└── vercel.json
```

---

## 🔧 FEATURES

| Feature | Description |
|---|---|
| **Auth** | Email/password login, signup, forgot password |
| **Dashboard** | Charts, progress, stats, streak |
| **Time Logs** | Add/edit/delete daily logs, CSV export |
| **Tasks** | Kanban board (To Do / In Progress / Done) |
| **Announcements** | Admin posts, all users see them (real-time) |
| **Notes** | Personal sticky notes with colors |
| **Settings** | Profile, company, OJT duration settings |
| **Admin Panel** | View all users, edit roles, deactivate accounts |
| **Mobile** | Fully responsive with bottom nav + drawer |
| **Real-time** | Live updates via Supabase subscriptions |

---

## ❓ TROUBLESHOOTING

**"Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY"**
→ Make sure you created `.env` (not `.env.example`) with your real keys.

**Logs/Tasks not loading**
→ Make sure you ran the full `supabase-setup.sql` in the SQL Editor.

**Can't see Admin Panel**
→ Run the SQL to set your role: `update public.profiles set role = 'admin' where email = 'your@email.com';`

**Sign-up works but profile is empty**
→ The trigger in `supabase-setup.sql` auto-creates the profile. Make sure you ran the full SQL.

**Deployed but app shows blank / errors**
→ Check that env variables are set in Vercel dashboard → Settings → Environment Variables.
