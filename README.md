# AI-Use Reflection

> Structured reflection; anti rubber-stamp guardrail blocks empty attestations

**LegalBlocks module package** `reflection` v0.1.0

- **Execution**: backend (provides screen `reflect`)
- **Entrypoint**: `reflection.ts`
- **Inputs**: `memo` (optional)
- **Outputs**: `reflection`
- **Artifact I/O**: via [`@legalblocks/module-runtime`](../module-runtime) (configurable adapter: localStorage by default, HTTP endpoint when configured)


## Registering with LegalBlocks

This module is a standalone, publishable package. To register it:

1. `npm publish` (or push to its own git repo).
2. Add the package to a LegalBlocks builder project; the builder reads `package.manifest.json` and exposes the inputs, outputs, and configuration above.

## Local development

This package depends on unpublished workspace packages (`@legalblocks/*`, `@lawnotation/*`). Until they are published, link them locally:

```bash
npm link @legalblocks/module-runtime   # if this module does artifact I/O
npm install
npm test
```
