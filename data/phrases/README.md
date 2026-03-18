# Phrase Data (Per-Scenario Format)

Each file is named by scenario (e.g. `small_talk.json`, `restaurant.json`).

## Format

```json
[
  {
    "phrase": "Hello",
    "translations": {
      "es": "Hola",
      "fr": "Bonjour",
      "it": "Ciao",
      "en": "Hello"
    },
    "difficulty": "Beginner"
  }
]
```

- **phrase**: English source / canonical text
- **translations**: Object with language codes (`es`, `fr`, `it`, `en`) as keys and the translated phrase as value
- **difficulty**: `Beginner`, `Intermediate`, or `Advanced`

## Adding Content

**New phrase in existing scenario:** Add one object to the scenario's JSON file.

**New scenario:** 
1. Add scenario metadata to `../scenarios.json`
2. Create `{scenario_id}.json` in this folder with the same format

**New language:** Add a new key to each phrase's `translations` object (e.g. `"de": "Hallo"`).
