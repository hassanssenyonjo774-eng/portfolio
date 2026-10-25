# Hassan's Mac-style portfolio

## Change your content
Everything you see on the site lives in **`content.js`**. Open it, edit the text, save, and refresh the page.

- **Bio / headline:** edit `headline`, `tagline`, `bio`
All images sit next to `index.html` (no folders), so uploading to GitHub is one drag.

- **Lock screen photo:** replace `lockscreen.jpg` (keep the same name)
- **Wallpaper:** replace `wallpaper.jpg`, or use a video: add `wallpaper.mp4` and set `wallpaper: "wallpaper.mp4"`
- **Photos app:** add the picture next to `index.html` and add its name to the `photos` list
- **Projects app:** add `{ title: "...", description: "...", url: "https://..." }` to `projects`
- **Social links:** edit `socials`

## Preview on your computer
In this folder, run:

```
python -m http.server 5173
```

Then open http://localhost:5173

## Files
- `index.html` – page structure
- `style.css` – the look
- `app.js` – lock screen, windows, dock, terminal
- `content.js` – **your content (the only file you normally need to edit)**
