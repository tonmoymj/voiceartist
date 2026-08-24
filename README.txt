VoiceCast — Design Package
============================

FILES:
- index.html    → Home page
- search.html   → Browse / Search page
- profile.html  → Artist profile page
- signup.html   → Sign up page
- VoiceCast_Planning_Document.docx → Full functional planning document

HOW TO VIEW LOCALLY:
Just double-click index.html to open it in your browser. All pages are
linked to each other (nav, "View Profile", "Join as Artist", etc.)

HOW TO DEPLOY (Vercel + GitHub):
1. Create a new GitHub repo and push these files (keep index.html at the root)
2. Go to vercel.com → Continue with GitHub → Import your repo
3. Click Deploy — no build settings needed, these are plain HTML files
4. You'll get a free *.vercel.app link instantly
5. Add your custom domain later under Project Settings → Domains

NOTE ON FONTS:
These pages load Google Fonts (Space Grotesk / Inter / Fraunces / Playfair)
over the internet. They'll render with a fallback system font if opened
offline, but will look correct once hosted live or opened with an internet
connection.

NOTE:
These are static front-end designs only (no backend yet). Buttons like
"Send inquiry", "Search", "Log in" etc. are visual/interactive mockups —
see the planning document for the database, auth, and backend plan.
