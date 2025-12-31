# Memorize It - Word Memorization Game

A premium, glassmorphism-styled word memorization game to help you learn new vocabulary effectively.

## Features
- **Flashcard Mode**: Active recall with "Flip to Reveal" mechanics.
- **Quiz Mode**: Test your knowledge with multiple-choice questions.
- **Customizable Data**: Easily add words to `words.json`.
- **Responsive Design**: Works perfectly on desktop and mobile.

## Project Structure
- `index.html`: The main entry point.
- `style.css`: All styling (Glassmorphism, Dark Mode).
- `script.js`: Game logic and data fetching.
- `words.json`: The word database.

## How to Run Locally

You need a local web server to run this because it fetches `words.json` (CORS security prevents direct file opening).

### Mac/Linux (Python)
Run this in your terminal:
```bash
python3 -m http.server 8080
```
Then open [http://localhost:8080](http://localhost:8080).

## How to Deploy to GitHub Pages

1.  **Create a New Repository** on GitHub.
2.  **Push your code**:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/memorization-game.git
    git branch -M main
    git push -u origin main
    ```
3.  **Enable GitHub Pages**:
    - Go to Repository **Settings** > **Pages**.
    - Set **Source** to `main` branch.
    - Click **Save**.
    - Your game will be live at `https://YOUR_USERNAME.github.io/memorization-game/`.

## Customizing Words
Open `words.json` and add your own:
```json
{
  "word": "New Word",
  "abbreviation": "NW",
  "meaning": "Definition here"
}
```
