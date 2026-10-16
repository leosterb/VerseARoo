VerseARoo

Play online: https://leosterb.github.io/VerseARoo/

GitHub Pages serves index.html directly. Players do not need Node.js or a local server.

Verse data: Edit verses.json. Add objects with unique `reference` and `verse` fields to its `verses` array. The game uses all entries, shuffles their order for every new run, and adjusts its level count automatically. Keep verse text relatively short so the puzzle fits a small screen. Editing the file resets an in-progress run; your high score remains saved in this browser.

Source: The game first tries bible-api.com for a KJV verse (5-second timeout); if unavailable or offline, it uses the same reference from verses.json. The selected text is saved with the current round so reloading cannot change its answer. No API key is needed. The 100 local verses are King James Version text.

Play: Guess letters by clicking or typing. Four incorrect letters end the run. Retry that verse or start a new shuffled run. Score is earned per solved verse; fewer mistakes earn more points. Your high score and sound preference stay in this browser's local storage. Sound effects are generated in the browser with Web Audio after you interact with the game, so no audio files are needed. Use the Sound button to mute/unmute.

GitHub Pages: Upload index.html, app.js, game.css, mascot.bundle.js, and verses.json together at the site root. Pages serves these static files directly; no server process is required. The bundled Three.js mascot works offline, respects reduced-motion settings, and falls back to an SVG mascot when WebGL is unavailable. mascot3d.js is editable source for the bundle, not required for hosting. The game still functions if the 3D bundle cannot load.
