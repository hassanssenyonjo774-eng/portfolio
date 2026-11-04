// ============================================================
//  YOUR CONTENT — edit this file to change what the site shows.
//  Text goes between quotes. Use **double stars** for bold.
//  After editing, save and refresh the page.
// ============================================================

window.SITE = {
  name: "Hassan Ssenyonjo",
  menuName: "hassan",            // small name in the top-left menu bar

  headline: "Hi, I'm Hassan Ssenyonjo.",
  tagline: "AI-Assisted Developer · CAIDP Student",

  bio: [
    "I'm an AI-assisted web developer. I use modern AI coding tools such as Claude Code to plan, build, debug and ship real websites — quickly and to a high standard.",
    "I designed and launched this site end to end: an interactive, Mac-style portfolio with a music player, selfie camera and custom domain, deployed through GitHub and Vercel.",
    "I'm currently training as a Certified AI Developer Professional (CAIDP) at the London International Studies & Research Centre in Dubai — learning to build and ship real AI-powered apps with tools like Lovable, Azure AI Foundry and Gemini — and I'm growing toward full-stack AI products and automation for businesses.",
    "**Learn by building. Ship, then improve.**"
  ],

  // Education — shown in the résumé. Change status to "Completed" (and add the year) when you finish.
  education: {
    school: "London International Studies & Research Centre (LISRC), Dubai",
    program: "Certified AI Developer Professional (CAIDP)",
    status: "In progress",
    note: "Part of the AI & Data Science programme · accredited by KHDA (UAE Government), CPD London (UK) and the British Chamber of Commerce · 4 courses · 15 modules",
    courses: [
      { code: "01", title: "AI Foundations — Understand AI" },
      { code: "02", title: "No-Code AI App Builder Foundations" },
      { code: "03", title: "Azure AI Foundry + Lovable" },
      { code: "04", title: "Creative & Video AI with Gemini" }
    ]
  },

  // Skills — shown in the résumé and the Terminal (CAIDP course + hands-on work)
  skills: [
    { group: "AI foundations", items: ["LLMs & generative AI", "Prompt engineering", "ChatGPT", "Claude", "Gemini"] },
    { group: "AI-assisted coding", items: ["Claude Code", "Google AI Studio"] },
    { group: "AI app builders", items: ["Lovable", "Bolt.new", "v0 by Vercel", "Replit Agent", "Base44", "GitHub Spark"] },
    { group: "Building & shipping apps", items: ["MVP planning & PRDs", "Prompt-to-app", "SaaS landing pages & portfolios", "Testing & deployment"] },
    { group: "AI model platforms", items: ["Azure AI Foundry", "OpenAI", "Mistral", "Model deployment", "AI agent blueprints"] },
    { group: "Creative & media AI", items: ["Google Flow", "Gemini", "Vertex AI", "AI image", "AI audio", "AI video", "Short-form video scripting"] },
    { group: "Backends, auth & payments", items: ["Firebase", "Supabase", "Stripe", "Clerk"] },
    { group: "Web development", items: ["HTML, CSS & JavaScript", "React", "Git & GitHub", "Vercel", "Custom domains, DNS & HTTPS"] }
  ],

  // Contact — shown in the résumé (Recruiter mode)
  contact: {
    email: "hassanssenyonjo774@gmail.com",
    phone: "+971524907113",
    phoneDisplay: "+971 52 490 7113",
    linkedin: "https://www.linkedin.com/in/hassan-ssenyonjo-225558442"
  },

  // Optional: put your CV PDF next to index.html and write its name here, e.g. "Hassan-Ssenyonjo-CV.pdf"
  cv: "",

  // Profile picture in the About Me window
  avatar: "photo-3.jpg",

  // Lock screen
  lockscreen: "lockscreen.jpg",
  lockNote: {
    title: "Leave Hassan a note ✍️",
    text: "Tap here to send me a message — or swipe up to look around."
  },

  // Notes app — messages are sent to you as an Instagram DM.
  // Optional: add your email in quotes to also offer "Send by email".
  notes: {
    instagram: "lamhassan_77",
    email: "hassanssenyonjo774@gmail.com"
  },

  // Encouragement app — one is picked each day; visitors can tap for more.
  encouragement: [
    "You don't have to see the whole staircase. Just take the next step today.",
    "Small progress is still progress. Keep going.",
    "Every expert you admire was once a beginner who refused to quit.",
    "Your pace is not a problem. Stopping is the only way to lose.",
    "The thing you're scared to start is often the thing that changes everything.",
    "Bad days don't cancel good plans. Rest, then try again.",
    "You are allowed to be a work in progress and still be proud of yourself.",
    "Comparison steals joy. Measure yourself against who you were yesterday.",
    "Doubt is loud, but it isn't always right.",
    "Learn something small today. In a year, you'll be someone new.",
    "The world needs the thing only you can build. Don't hide it.",
    "Mistakes are proof that you're trying. Collect them and learn.",
    "Discipline is choosing what you want most over what you want now.",
    "You've survived every hard day so far. That's a perfect record.",
    "What you have today is enough to begin. Begin.",
    "Your dreams don't have an expiry date. Take a breath and keep moving.",
    "Be kind to yourself today. You're doing better than you think.",
    "One focused hour can move you further than a week of worrying.",
    "Ask the question. Send the message. Build the thing.",
    "Someone out there is inspired by you, even if they haven't said it yet.",

    // Quotes from others: { text, by, source } — shown with their author instead of your name.
    { text: "Education is the most powerful weapon which you can use to change the world.", by: "Nelson Mandela", source: "Speech in Johannesburg, 2003" },
    { text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.", by: "Malcolm X", source: "1964" },
    { text: "Intelligence plus character — that is the goal of true education.", by: "Martin Luther King Jr.", source: "“The Purpose of Education”, 1947" },
    { text: "Learning without thought is labour lost; thought without learning is perilous.", by: "Confucius", source: "The Analects" },
    { text: "The roots of education are bitter, but the fruit is sweet.", by: "Aristotle", source: "as quoted by Diogenes Laërtius" },
    { text: "The mind is not a vessel to be filled, but a fire to be kindled.", by: "Plutarch", source: "paraphrased from “On Listening”" },
    { text: "Seeking knowledge is an obligation upon every Muslim.", by: "Prophet Muhammad ﷺ", source: "Hadith, Sunan Ibn Mājah" },
    { text: "Wisdom is not a product of schooling but of the lifelong attempt to acquire it.", by: "Albert Einstein", source: "Letter, 1954" },
    { text: "Nothing in life is to be feared, it is only to be understood.", by: "Marie Curie" },
    { text: "From that moment, I understood the pathway from slavery to freedom.", by: "Frederick Douglass", source: "on learning to read, Narrative of the Life of Frederick Douglass, 1845" }
  ],

  // Desktop background (an image, or a .mp4 video)
  wallpaper: "wallpaper.jpg",

  // Background music — plays only when a visitor taps "Play music" in the menu bar.
  // Put the .mp3 next to index.html and write its name in src ("" = no music).
  music: {
    src: "music.mp3",
    title: "Carefree – Kevin MacLeod",
    // Credit required by the CC BY 4.0 licence — keep it (shown in About Me and on hover).
    credit: "Music: \"Carefree\" by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 — creativecommons.org/licenses/by/4.0/",
    volume: 0.25          // 0 = silent, 1 = full volume
  },

  // Photos app — put the image next to index.html and list it here
  photos: [
    "photo-1.jpg",
    "photo-2.jpg",
    "photo-3.jpg",
    "photo-4.jpg",
    "photo-5.jpg",
    "photo-6.jpg"
  ],

  // Projects app — add one block per project
  // { title, description, tags: [...], url (live site), code (GitHub link) }
  projects: [
    {
      title: "Money & Business Tips — AI-made short videos",
      description: "An Instagram channel of short money and business lessons that I script with Claude and produce as videos with Google Flow, from idea and script to visuals, voice and the final edit.",
      tags: ["AI video", "Google Flow", "Claude", "Scriptwriting", "Instagram Reels"],
      url: "https://www.instagram.com/moneybusinesstips/",
      urlLabel: "Watch the videos"
    },
    {
      title: "PassGo — AI travel & visa assistant",
      description: "A travel web app that tells you which countries you can visit with your passport, with real visa data, an AI travel assistant, live exchange rates and Google sign-in. Built with React and Firebase using AI-assisted development.",
      tags: ["React", "Firebase", "AI (Gemini)", "APIs", "Vercel"],
      url: "https://passgo-tau.vercel.app"
    },
    {
      title: "iamhassan.online — interactive portfolio",
      description: "A Mac-style personal site with an iPhone lock screen, draggable glass windows, music player, in-browser selfie camera, flashlight and a recruiter-friendly résumé view. Designed and shipped with AI-assisted development.",
      tags: ["HTML", "CSS", "JavaScript", "AI-assisted", "Vercel"],
      url: "https://www.iamhassan.online",
      code: "https://github.com/hassanssenyonjo774-eng/portfolio"
    }
  ],

  // Social links in the dock (on phones they're in the résumé instead)
  socials: {
    linkedin: "https://www.linkedin.com/in/hassan-ssenyonjo-225558442",
    github: "https://github.com/hassanssenyonjo774-eng",
    instagram: "https://www.instagram.com/lamhassan_77/",
    x: "https://x.com/lamhassan77"
  }
};
