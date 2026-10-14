// Vercel deploys only the compiled dist/ folder as the API function, without api/package.json.
// Node needs "type": "module" next to the code to load our ES module imports, so the build writes it here.
import { writeFileSync } from 'node:fs';

writeFileSync(new URL('../dist/package.json', import.meta.url), `${JSON.stringify({ type: 'module' })}\n`);
