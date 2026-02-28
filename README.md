## Deployment

Deployed on Cloudflare Pages:
- Link : https://open-trivia-web-project.pages.dev/
---

# Open-Trivia

A modern Jeopardy-style trivia board builder and game runner built with **React + TypeScript + Vite**.

Create custom trivia boards, edit questions with images, and play locally with up to 4 teams — complete with scoring, fullscreen mode, and winner animations.

---

## Features

### 🛠 Create & Edit Boards
- Custom board dimensions (categories × questions)
- Points auto-increment by row
- Add:
  - Question / description
  - Answer
  - Optional image
- Mobile-friendly editor
- Unsaved changes warning before leaving

---

### Play Mode
- 1–4 teams with custom names
- Random first turn
- Turn logic:
  - Correct team keeps turn
  - Steal mechanic supported
  - If no team answers → turn cycles
- Live scoreboard
- Fullscreen mode
- Reveal answer flow
- End-game leaderboard
- Winner confetti animation

---

### Mobile Optimized
- Category picker for smaller screens
- Vertical scroll layout
- Large, readable question modal
- Tap-friendly controls

---

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- LocalStorage (for board persistence, its making maintaining the website completely free)
- Custom CSS (no heavy UI frameworks)

---

## Security Notes

- All data is stored locally in `localStorage`
- No backend or authentication required
- User input is rendered as plain text (React automatically escapes it)
- Safe to deploy as a static site

---

## Project Structure

```
src/
  pages/
    HomePage.tsx
    GameEditorPage.tsx
    PlayGamePage.tsx
  components/
    presets/
    layout/
    ui/
  hooks/
  types/
```

---

## Future Improvements

- Sound effects toggle
- Question timer mode
- TV / Presentation mode
- Shareable board export
- Optional backend for online multiplayer

---

## License

MIT License
