# ⚡ QUICK DEPLOYMENT STEPS

## 🎯 SUPABASE (5 minutes)

1. **Create Project:** [supabase.com](https://supabase.com) → New Project
2. **Run SQL:** SQL Editor → Paste `supabase_schema.sql` → Run
3. **Create Admin:** Authentication → Users → Add User:
   - Email: `flamecloud@gmail.com`
   - Password: `GSFY!25V$`
   - ✅ Auto Confirm User
4. **Get Keys:** Settings → API → Copy:
   - Project URL
   - anon public key

---

## 🚀 VERCEL (5 minutes)

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Deploy Flame Cloud"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/flame-cloud.git
git push -u origin main
```

2. **Deploy:** [vercel.com](https://vercel.com) → Import Project → Select repo

3. **Add Environment Variables:**
```
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Deploy!** → Wait 2-3 minutes → ✅ DONE!

---

## 🌐 CUSTOM DOMAIN (Optional)

Vercel → Settings → Domains → Add `flamecloud.site`

---

## 🔑 LOGIN

- Email: `flamecloud@gmail.com`
- Password: `GSFY!25V$`

**🔥 DONE! Your site is LIVE! 🔥**
