2026-05-29T17:08:17.131480842Z 
2026-05-29T17:08:17.131624009Z 247 packages are looking for funding
2026-05-29T17:08:17.131748726Z   run `npm fund` for details
2026-05-29T17:08:17.156100227Z 
2026-05-29T17:08:17.156110237Z 2 moderate severity vulnerabilities
2026-05-29T17:08:17.156112968Z 
2026-05-29T17:08:17.156117778Z To address all issues (including breaking changes), run:
2026-05-29T17:08:17.156121208Z   npm audit fix --force
2026-05-29T17:08:17.156123488Z 
2026-05-29T17:08:17.156127798Z Run `npm audit` for details.
2026-05-29T17:08:17.87099363Z 
2026-05-29T17:08:17.871020271Z > smshive@1.0.0 build
2026-05-29T17:08:17.871025672Z > npm run build --workspaces --if-present
2026-05-29T17:08:17.871029142Z 
2026-05-29T17:08:17.994127568Z 
2026-05-29T17:08:17.99414806Z > api@0.0.1 build
2026-05-29T17:08:17.99415211Z > nest build
2026-05-29T17:08:17.99415593Z 
2026-05-29T17:08:23.061973095Z 
2026-05-29T17:08:23.062005967Z > web@0.1.0 build
2026-05-29T17:08:23.062010647Z > next build
2026-05-29T17:08:23.062014507Z 
2026-05-29T17:08:23.424800614Z ⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
2026-05-29T17:08:23.436218245Z ▲ Next.js 16.2.6 (Turbopack)
2026-05-29T17:08:23.436372593Z 
2026-05-29T17:08:23.458080676Z   Creating an optimized production build ...
2026-05-29T17:08:26.069508661Z (node:246) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
2026-05-29T17:08:26.069544043Z (Use `node --trace-deprecation ...` to show where the warning was created)
2026-05-29T17:08:30.324584635Z 
2026-05-29T17:08:30.324621617Z > Build error occurred
2026-05-29T17:08:30.327316018Z Error: Turbopack build failed with 1 errors:
2026-05-29T17:08:30.327325509Z ./web/dashboard/src/app/globals.css
2026-05-29T17:08:30.327330409Z Error evaluating Node.js code
2026-05-29T17:08:30.327334839Z Error: Cannot find native binding. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.
2026-05-29T17:08:30.32733939Z     [at Object.<anonymous> (/opt/render/project/src/node_modules/@tailwindcss/oxide/index.js:563:11)]
2026-05-29T17:08:30.32734381Z     [at Module._compile (node:internal/modules/cjs/loader:1873:14)]
2026-05-29T17:08:30.32734841Z     [at Object..js (node:internal/modules/cjs/loader:2013:10)]
2026-05-29T17:08:30.327365851Z     [at Module.load (node:internal/modules/cjs/loader:1596:32)]
2026-05-29T17:08:30.327370431Z     [at Module._load (node:internal/modules/cjs/loader:1398:12)]
2026-05-29T17:08:30.327374372Z     [at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)]
2026-05-29T17:08:30.327378332Z     [at Module.require (node:internal/modules/cjs/loader:1619:12)]
2026-05-29T17:08:30.327382572Z     [at require (node:internal/modules/helpers:191:16)]
2026-05-29T17:08:30.327386582Z     [at Object.<anonymous> (/opt/render/project/src/node_modules/@tailwindcss/postcss/dist/index.js:1:1406)]
2026-05-29T17:08:30.327390732Z     [at Module._compile (node:internal/modules/cjs/loader:1873:14)]
2026-05-29T17:08:30.327394462Z Caused by: Error: Cannot find module '@tailwindcss/oxide-linux-x64-gnu'
2026-05-29T17:08:30.327398323Z Require stack:
2026-05-29T17:08:30.327402893Z - /opt/render/project/src/node_modules/@tailwindcss/oxide/index.js
2026-05-29T17:08:30.327407113Z - /opt/render/project/src/node_modules/@tailwindcss/postcss/dist/index.js
2026-05-29T17:08:30.327410714Z - /opt/render/project/src/web/dashboard/.next/build/chunks/[root-of-the-server]__0~.s0zk._.js
2026-05-29T17:08:30.327413163Z - /opt/render/project/src/web/dashboard/.next/build/chunks/[turbopack]_runtime.js
2026-05-29T17:08:30.327415534Z - /opt/render/project/src/web/dashboard/.next/build/postcss.js
2026-05-29T17:08:30.327417954Z     [at Module._resolveFilename (node:internal/modules/cjs/loader:1519:15)]
2026-05-29T17:08:30.327420374Z     [at wrapResolveFilename (node:internal/modules/cjs/loader:1073:27)]
2026-05-29T17:08:30.327422724Z     [at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1097:10)]
2026-05-29T17:08:30.327425334Z     [at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1124:12)]
2026-05-29T17:08:30.327427804Z     [at Module._load (node:internal/modules/cjs/loader:1296:5)]
2026-05-29T17:08:30.327430235Z     [at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)]
2026-05-29T17:08:30.327432664Z     [at Module.require (node:internal/modules/cjs/loader:1619:12)]
2026-05-29T17:08:30.327435225Z     [at require (node:internal/modules/helpers:191:16)]
2026-05-29T17:08:30.327437665Z     [at requireNative (/opt/render/project/src/node_modules/@tailwindcss/oxide/index.js:288:27)]
2026-05-29T17:08:30.327440085Z     [at Object.<anonymous> (/opt/render/project/src/node_modules/@tailwindcss/oxide/index.js:526:17)]
2026-05-29T17:08:30.327442425Z Caused by: Error: Cannot find module './tailwindcss-oxide.linux-x64-gnu.node'
2026-05-29T17:08:30.327444875Z Require stack:
2026-05-29T17:08:30.327447275Z - /opt/render/project/src/node_modules/@tailwindcss/oxide/index.js
2026-05-29T17:08:30.327449616Z - /opt/render/project/src/node_modules/@tailwindcss/postcss/dist/index.js
2026-05-29T17:08:30.327451976Z - /opt/render/project/src/web/dashboard/.next/build/chunks/[root-of-the-server]__0~.s0zk._.js
2026-05-29T17:08:30.327454296Z - /opt/render/project/src/web/dashboard/.next/build/chunks/[turbopack]_runtime.js
2026-05-29T17:08:30.327456746Z - /opt/render/project/src/web/dashboard/.next/build/postcss.js
2026-05-29T17:08:30.327459196Z     [at Module._resolveFilename (node:internal/modules/cjs/loader:1519:15)]
2026-05-29T17:08:30.327461566Z     [at wrapResolveFilename (node:internal/modules/cjs/loader:1073:27)]
2026-05-29T17:08:30.327463886Z     [at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1097:10)]
2026-05-29T17:08:30.327466226Z     [at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1124:12)]
2026-05-29T17:08:30.327468637Z     [at Module._load (node:internal/modules/cjs/loader:1296:5)]
2026-05-29T17:08:30.327476507Z     [at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)]
2026-05-29T17:08:30.327479767Z     [at Module.require (node:internal/modules/cjs/loader:1619:12)]
2026-05-29T17:08:30.327482237Z     [at require (node:internal/modules/helpers:191:16)]
2026-05-29T17:08:30.327484617Z     [at requireNative (/opt/render/project/src/node_modules/@tailwindcss/oxide/index.js:283:18)]
2026-05-29T17:08:30.327487158Z     [at Object.<anonymous> (/opt/render/project/src/node_modules/@tailwindcss/oxide/index.js:526:17)]
2026-05-29T17:08:30.327489447Z 
2026-05-29T17:08:30.327491968Z Import trace:
2026-05-29T17:08:30.327494328Z   Client Component Browser:
2026-05-29T17:08:30.327496768Z     ./web/dashboard/src/app/globals.css [Client Component Browser]
2026-05-29T17:08:30.327499168Z     ./web/dashboard/src/app/layout.tsx [Server Component]
2026-05-29T17:08:30.327501498Z 
2026-05-29T17:08:30.327503688Z 
2026-05-29T17:08:30.327506039Z     at ignore-listed frames
2026-05-29T17:08:30.378684001Z npm error Lifecycle script `build` failed with error:
2026-05-29T17:08:30.3788567Z npm error code 1
2026-05-29T17:08:30.378986347Z npm error path /opt/render/project/src/web/dashboard
2026-05-29T17:08:30.379097183Z npm error workspace web@0.1.0
2026-05-29T17:08:30.379211799Z npm error location /opt/render/project/src/web/dashboard
2026-05-29T17:08:30.379304964Z npm error command failed
2026-05-29T17:08:30.379498094Z npm error command sh -c next build
2026-05-29T17:08:30.37962104Z 
2026-05-29T17:08:30.380360069Z 
2026-05-29T17:08:30.38036984Z > @smshive/shared-types@1.0.0 build
2026-05-29T17:08:30.38037231Z > tsc
2026-05-29T17:08:30.38037425Z 
2026-05-29T17:08:31.381750726Z ==> Build failed 😞
2026-05-29T17:08:31.381767107Z ==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys