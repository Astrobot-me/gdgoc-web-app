<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project quick facts

- App Router source lives under [src/app](src/app); the default entry is [src/app/page.tsx](src/app/page.tsx).
- Scripts and runtime commands are in [package.json](package.json) (`dev`, `build`, `start`, `lint`).
- TypeScript path alias `@/*` maps to `src/*` (see [tsconfig.json](tsconfig.json)).
- Prisma schema is in [prisma/schema.prisma](prisma/schema.prisma).
- Shared UI primitives are in [src/components/ui](src/components/ui).
- Project-level lint rules live in [eslint.config.mjs](eslint.config.mjs).
- When in doubt about framework behavior, consult [node_modules/next/dist/docs/](node_modules/next/dist/docs/).
