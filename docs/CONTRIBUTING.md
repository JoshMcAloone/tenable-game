# Contributing Guidelines

## Code Style
- TypeScript strict mode; avoid `any`.
- Prettier enforced (`npm run format`).
- ESLint must pass before PR merge.

## Branching
- Feature branches: `feat/<short-description>`.
- Fix branches: `fix/<issue-id>`.

## Commits
- Conventional style (feat:, fix:, docs:, chore:, test:).

## PR Checklist
- Reference related issue.
- Include tests for new logic.
- Update docs if data model changes.

## Testing
- Run `npm run test`.
- Add edge case tests for reducers.

## Adding Rounds
- Update JSON file.
- Run `npm run validate:rounds`.

## Accessibility
- Prefer semantic HTML elements.
- Ensure aria labels for dynamic regions.

## Release
- Update CHANGELOG (future addition) for notable changes.