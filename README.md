# 🔥 Flame Cloud

Professional Minecraft Hosting Platform by Honey_boy1

## ✨ Features

- 🎮 **Premium Minecraft Server Hosting Plans** - Tiered plans with RAM, CPU, and Storage variants.
- 🌍 **Multi-Location Support** - Global server locations with availability control.
- 👤 **User Profile System** - Customizable profiles with avatars and activity tracking.
- 🎫 **Support Tickets** - Integrated ticketing system for orders and technical help.
- 💬 **Live Chat** - Real-time "Flame Cloud Team" chat with modern list-style UI.
- ⚙️ **Power Admin Panel** - Full CRUD for plans, users, partners, and locations.
- 📸 **Image Upload** - Direct image upload for YT Partners logos (Base64).
- 🌙 **Next-Gen UI** - High-premium dark theme with smooth gradients and animations.

## 🛠️ Tech Stack

- **Frontend:** React.js (Hooks, Context API)
- **Backend:** Node.js + Express
- **Database:** Local SQLite (daimond.db)
- **Auth:** JWT (Local)

## 🚀 Deployment Guide

### 1. Backend Setup

1. Deploy the `server/` folder to a Node.js hosting provider (Railway, Render, or VPS).
2. Set the following environment variables:
   - `JWT_SECRET`: Secret key for JWT auth
   - `ADMIN_EMAIL`: Default admin email
   - `ADMIN_PASSWORD`: Default admin password
3. The server will automatically initialize the `daimond.db` SQLite database.

### 2. Frontend Deployment (Vercel)

1. Push your code to GitHub.
2. Link your repo to [Vercel](https://vercel.com).
3. In Vercel, connect your domain: **flamecloud.site**.
4. Deployment will be automatic!

## 🛠️ Environment Variables

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Secret key for local JWT auth |
| `ADMIN_EMAIL` | Default admin email |
| `ADMIN_PASSWORD` | Default admin password |
| `PORT` | Server port (default 5000) |

## 👥 Authors & Team

Created by **Honey_boy1**

- **Founder:** Rameez_xD
- **Owner:** TGKFLEX
- **Management:** !Pie LEGEND
