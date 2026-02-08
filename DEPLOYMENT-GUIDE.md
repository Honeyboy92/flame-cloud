# 🚀 FLAME CLOUD - COMPLETE DEPLOYMENT GUIDE

## 📋 Overview
- **Frontend:** Vercel (React App)
- **Backend:** Supabase (Database + Auth)
- **Domain:** flamecloud.site

---

## PART 1: SUPABASE SETUP (Backend) 🗄️

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in / Sign up
3. Click **"New Project"**
4. Fill details:
   - **Name:** Flame Cloud
   - **Database Password:** (Save this - you'll need it)
   - **Region:** Choose closest to your users
5. Wait 2-3 minutes for project creation

### Step 2: Run Database Schema
1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire content from `supabase_schema.sql` file
4. Paste it in the SQL Editor
5. Click **"Run"** button
6. ✅ You should see "Success. No rows returned"

This will create:
- All 8 tables (users, paid_plans, tickets, chat_messages, etc.)
- Default admin account (flamecloud@gmail.com)
- 9 hosting plans
- Location settings
- Initial data

### Step 3: Create Admin Auth Account
1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **"Add User"** → **"Create new user"**
3. Fill in:
   - **Email:** `flamecloud@gmail.com`
   - **Password:** `GSFY!25V$`
   - **Auto Confirm User:** ✅ YES (check this!)
4. Click **"Create User"**

### Step 4: Get Supabase Credentials
1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** section
3. Copy these values:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon public key** (long string starting with eyJ...)

**Save these! You'll need them for Vercel.**

---

## PART 2: VERCEL DEPLOYMENT (Frontend) 🌐

### Step 1: Prepare GitHub Repository
1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit - Flame Cloud"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/flame-cloud.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New"** → **"Project"**
4. Import your `flame-cloud` repository
5. Configure project:
   - **Framework Preset:** Create React App
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** `cd client && npm install && CI=false npm run build`
   - **Output Directory:** `client/build`

### Step 3: Add Environment Variables
In Vercel project settings, add these environment variables:

```
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace with YOUR Supabase credentials from Part 1, Step 4!**

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. ✅ Your site will be live at: `https://your-project.vercel.app`

### Step 5: Add Custom Domain (flamecloud.site)
1. In Vercel project, go to **Settings** → **Domains**
2. Add domain: `flamecloud.site`
3. Add domain: `www.flamecloud.site`
4. Vercel will show DNS records to add
5. Go to your domain registrar (where you bought flamecloud.site)
6. Add the DNS records Vercel shows you:
   - **A Record:** `@` → `76.76.21.21`
   - **CNAME:** `www` → `cname.vercel-dns.com`
7. Wait 10-60 minutes for DNS propagation
8. ✅ Your site will be live at: `https://flamecloud.site`

---

## PART 3: TESTING 🧪

### Test Admin Login
1. Go to your deployed site
2. Click **Login**
3. Enter:
   - Email: `flamecloud@gmail.com`
   - Password: `GSFY!25V$`
4. ✅ You should see admin panel access

### Test User Signup
1. Click **Signup**
2. Create a new account
3. ✅ Should work and redirect to dashboard

### Test Features
- ✅ View hosting plans
- ✅ Chat system
- ✅ Create support tickets
- ✅ Admin panel (manage plans, users, locations)

---

## 📝 IMPORTANT NOTES

### Security
- Change admin password after first login!
- Never commit `.env` files to GitHub
- Keep Supabase credentials private

### Supabase Free Tier Limits
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth/month
- 50,000 monthly active users

### Vercel Free Tier Limits
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS

---

## 🔧 TROUBLESHOOTING

### "User not found" error
- Make sure you created the admin user in Supabase Authentication
- Check email matches exactly: `flamecloud@gmail.com`

### "Invalid credentials" error
- Verify password is exactly: `GSFY!25V$`
- Make sure "Auto Confirm User" was checked

### Plans not showing
- Re-run the `supabase_schema.sql` in SQL Editor
- Check if tables were created in Table Editor

### Site not loading
- Check Vercel deployment logs
- Verify environment variables are set correctly
- Make sure Supabase URL and key are correct

---

## 📞 SUPPORT

If you face any issues:
1. Check Vercel deployment logs
2. Check browser console (F12)
3. Check Supabase logs (Logs section in dashboard)

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Admin user created in Supabase Auth
- [ ] Supabase credentials copied
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added in Vercel
- [ ] Site deployed successfully
- [ ] Admin login tested
- [ ] Custom domain added (optional)
- [ ] DNS records configured (optional)

---

**🔥 Your Flame Cloud is now LIVE! 🔥**
