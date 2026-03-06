# Copilot Instructions for Grove (Deno)

## Project Context
- This is a Deno TypeScript project (not Node-first).
- Prefer Deno and JSR-native patterns over Node-specific tooling.
- Keep changes focused and minimal; follow existing naming and file organization.

## Code Style
- Match the existing TypeScript style in `src/` and `example/`.
- Use semicolons and explicit `type` imports where appropriate.
- Preserve the current module structure (`mod.ts` files that re-export folder APIs).
- Keep comments concise and only where they add clarity.

## Imports and Dependencies
- Prefer import map aliases from `deno.jsonc` (for example `@std/assert`, `@cliffy/command`).
- Reuse existing local modules before introducing new dependencies.
- Avoid adding Node-only packages unless there is no Deno/JSR alternative and it is required.

## Errors and Logging
- Prefer existing error types in `src/errors/` over ad-hoc `Error` usage when applicable.
- Follow existing logging patterns and logger interfaces in `src/logging/`.
- Avoid introducing direct `console.log` usage in library/runtime code unless already established in that area.

## Testing
- Add or update `Deno.test` tests for behavior changes.
- Keep tests near the affected module pattern used in this repo (for example `*.test.ts` under `src/`).
- Prefer deterministic unit tests and reuse `@std/testing/mock` utilities where useful.

## Validation Commands
- For full checks, run:
  - `deno task check`
- For focused iteration, use:
  - `deno test src`
  - `deno fmt`
  - `deno lint`

## Scope Guidance for Changes
- Do not perform broad refactors unless requested.
- Preserve public exports from `mod.ts` and `src/mod.ts` unless the task explicitly changes the API.
- If behavior changes, update README and examples when relevant.
