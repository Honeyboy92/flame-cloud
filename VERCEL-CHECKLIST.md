# ✅ VERCEL DEPLOYMENT CHECKLIST

## Before Deployment

- [ ] Supabase project created
- [ ] `supabase_schema.sql` executed successfully
- [ ] Admin user created in Supabase Auth (flamecloud@gmail.com)
- [ ] Supabase URL and anon key copied
- [ ] Code pushed to GitHub repository

---

## Vercel Configuration

### Project Settings
- **Framework:** Create React App
- **Root Directory:** `./`
- **Build Command:** `cd client && npm install && CI=false npm run build`
- **Output Directory:** `client/build`
- **Install Command:** `npm install`

### Environment Variables (REQUIRED!)
Add these in Vercel → Settings → Environment Variables:

```
REACT_APP_SUPABASE_URL
REACT_APP_SUPABASE_ANON_KEY
```

**Important:** 
- Apply to: Production, Preview, Development (all three)
- No quotes needed in Vercel UI

---

## After Deployment

- [ ] Deployment successful (green checkmark)
- [ ] Visit deployed URL
- [ ] Test login with admin credentials
- [ ] Check if plans are loading
- [ ] Test user signup
- [ ] Test chat system
- [ ] Test admin panel access

---

## Custom Domain Setup (flamecloud.site)

1. Vercel → Settings → Domains
2. Add domain: `flamecloud.site`
3. Add domain: `www.flamecloud.site`
4. Copy DNS records shown by Vercel
5. Add to your domain registrar:
   - **A Record:** `@` → `76.76.21.21`
   - **CNAME:** `www` → `cname.vercel-dns.com`
6. Wait 10-60 minutes for DNS propagation

---

## Troubleshooting

### Build Fails
- Check if environment variables are set
- Verify build command is correct
- Check Vercel build logs

### Site Loads but Login Fails
- Verify Supabase credentials are correct
- Check if admin user exists in Supabase Auth
- Check browser console for errors

### Plans Not Showing
- Verify database schema was executed
- Check Supabase Table Editor for data
- Check browser network tab for API errors

---

## Admin Credentials

**Email:** flamecloud@gmail.com  
**Password:** GSFY!25V$

**⚠️ Change password after first login!**

---

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Check deployment logs in Vercel dashboard
- Check browser console (F12) for frontend errors
