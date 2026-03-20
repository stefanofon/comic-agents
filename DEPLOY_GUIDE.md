# 🚀 COMIC AGENTS — Deploy to Vercel in 15 Minutes

## What You Need
- A computer (Mac or Windows)
- A free GitHub account (github.com)
- A free Vercel account (vercel.com)

---

## STEP 1: Install Node.js (5 min)

1. Go to **https://nodejs.org**
2. Click the big green **"LTS"** download button
3. Run the installer — click Next/Continue through everything
4. To verify: open Terminal (Mac) or Command Prompt (Windows), type:
   ```
   node --version
   ```
   You should see something like `v20.x.x` — you're good!

---

## STEP 2: Create a GitHub Account (2 min)

1. Go to **https://github.com**
2. Click **Sign Up** and create a free account
3. Verify your email

---

## STEP 3: Install Git (2 min)

**Mac:** Open Terminal, type:
```
git --version
```
If it asks to install, click Install.

**Windows:** Download from https://git-scm.com/download/win and install.

---

## STEP 4: Upload Project to GitHub (5 min)

1. Go to **https://github.com/new**
2. Repository name: `comic-agents`
3. Keep it **Public**
4. Click **Create Repository**
5. Open Terminal/Command Prompt
6. Navigate to the downloaded project folder:
   ```
   cd path/to/comic-agents-deploy
   ```
7. Run these commands one by one:
   ```
   npm install
   git init
   git add .
   git commit -m "first commit - comic agents launch"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/comic-agents.git
   git push -u origin main
   ```
   (Replace YOUR_USERNAME with your actual GitHub username)

---

## STEP 5: Deploy on Vercel (3 min)

1. Go to **https://vercel.com**
2. Click **Sign Up** → choose **Continue with GitHub**
3. Click **Add New** → **Project**
4. Find your `comic-agents` repo and click **Import**
5. Vercel will auto-detect it's a Vite project
6. Click **Deploy**
7. Wait 1-2 minutes...
8. 🎉 **YOUR SITE IS LIVE!**

Vercel gives you a URL like: `comic-agents-abc123.vercel.app`

---

## STEP 6: Connect Your Domain (2 min)

1. In Vercel dashboard, go to your project → **Settings** → **Domains**
2. Type: `comicagents.com`
3. Click **Add**
4. Vercel will show you DNS records
5. Go to your domain registrar (where you bought comicagents.com)
6. Update the DNS settings to point to Vercel's servers
7. Wait 5-30 minutes for DNS to propagate
8. 🎉 **comicagents.com is LIVE!**

---

## Troubleshooting

**"npm install" gives errors?**
→ Make sure Node.js is installed. Close and reopen Terminal, try again.

**"git push" asks for credentials?**
→ GitHub now requires a Personal Access Token. Go to:
  GitHub → Settings → Developer Settings → Personal Access Tokens → Generate New Token
  Use that token as your password when pushing.

**Build fails on Vercel?**
→ Check that all files are uploaded. The most common issue is a missing file.

**Site works but API calls fail?**
→ This is expected! The Anthropic API requires proper CORS headers.
  For now this works as a demo. For production, you'll need a backend proxy.

---

## What's Next?

Your demo is live! Share it with:
- Alex (your advisor)
- Friends who want to test
- Post on Twitter/Reddit for early feedback

For the full production version, you'll need:
- A backend (Supabase or similar) for database + auth
- An API proxy server so API keys aren't in the browser
- Telegram bot integration

But for NOW — you have a live, shareable, impressive demo. Ship it! 🚀
