VerseARoo

Play: https://leosterb.github.io/VerseARoo/
GitHub Pages serves the static files directly. No API account or verse API is used.

Choose a Bible version and Easy or Hard before starting. New journeys select
100 unique verses at random from the selected collection. Resume continues the
saved journey for that version and difficulty. Version / mode returns to the
start screen. Progress, sound preference, and high scores are stored in this browser.

Easy: Four hearts are restored after every solved verse. A lost verse can be retried.
Hard: Hearts carry between rounds. One heart is earned every two solved verses,
up to four. Losing all hearts ends the run; a new run starts with four hearts.
High scores are tracked separately for every version and difficulty.

ESV is the default selection. ESV, NLT, NKJV, and NIV each contain 229 user-supplied
verses; KJV contains 100. Each run selects 100 unique entries. See verses/README.md
to expand a collection toward 500 verses.

Deploy index.html, app.js, game.css, mascot.bundle.js, verses.json, and the verses
folder together. The 3D mascot falls back to SVG if WebGL is unavailable.
server.js is an optional development helper and is not used by GitHub Pages.
