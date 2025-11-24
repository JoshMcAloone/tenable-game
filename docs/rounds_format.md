# Rounds JSON Format

Each round object:
```json
{
  "id": "round1",
  "questionText": "Question?",
  "answers": [ { "text": "Answer", "revealed": false }, ... 10 total ]
}
```

Rules:
- Exactly 10 answers per round.
- Unique answer text (case-insensitive).
- `revealed` flag always false in source file.

Naming:
- Use incremental IDs: `round1`, `round2`, ... or descriptive slug.

Validation:
- Run `npm run validate:rounds` before committing new sets.

Future:
- Add categories and difficulty fields.