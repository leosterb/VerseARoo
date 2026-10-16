# Verse collections

Add supplied verse text to `nlt.json`, `nkjv.json`, `esv.json`, and `niv.json`.
These files are intentionally empty, not KJV text labeled as other translations.

Each file uses this structure (replace the placeholder text before use):

```json
{
  "translation": "nlt",
  "verses": [
    {"reference": "Book chapter:verse", "verse": "Your supplied verse text"}
  ]
}
```

Use the matching lowercase translation code in each file. Target 500 unique
references per version. At least 100 valid entries enable that version on the
start screen. Every new game shuffles the pool and selects exactly 100 unique
entries; it does not repeat entries to fill a run. Each entry needs a nonempty
reference and English verse text of at most 500 characters. Duplicate references
are rejected, ignoring case and surrounding whitespace. No verse API is used.

The existing KJV collection remains in the root `verses.json` (100 entries).
High scores and saved runs are separate for each translation and difficulty.
Changing a collection invalidates its saved run but preserves its high score.
