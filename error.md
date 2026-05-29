2026-05-29T16:50:41.484128723Z ==> Cloning from https://github.com/NilambarSonu/SMSHIVE
2026-05-29T16:50:43.756605297Z ==> Checking out commit 2af6c3bd6b77687efc7e862641ac5ce393f321fc in branch main
2026-05-29T16:50:45.525826067Z ==> Requesting Node.js version >=20.0.0
2026-05-29T16:50:45.750131854Z ==> Using Node.js version 26.2.0 via /opt/render/project/src/package.json
2026-05-29T16:50:45.750150545Z ==> Docs on specifying a Node.js version: https://render.com/docs/node-version
2026-05-29T16:50:45.750289062Z ==> Installing Node.js version 26.2.0...
2026-05-29T16:50:46.986472202Z ==> Running build command 'npm install && npm run build'...
2026-05-29T16:51:12.86750241Z 
2026-05-29T16:51:12.867537522Z added 1033 packages, and audited 1040 packages in 26s
2026-05-29T16:51:12.867551952Z 
2026-05-29T16:51:12.867683049Z 246 packages are looking for funding
2026-05-29T16:51:12.867766713Z   run `npm fund` for details
2026-05-29T16:51:12.893653377Z 
2026-05-29T16:51:12.893673618Z 2 moderate severity vulnerabilities
2026-05-29T16:51:12.893679738Z 
2026-05-29T16:51:12.893686618Z To address all issues (including breaking changes), run:
2026-05-29T16:51:12.893693148Z   npm audit fix --force
2026-05-29T16:51:12.893698609Z 
2026-05-29T16:51:12.893704379Z Run `npm audit` for details.
2026-05-29T16:51:13.12250159Z 
2026-05-29T16:51:13.122594295Z > smshive@1.0.0 build
2026-05-29T16:51:13.122601645Z > npm run build --workspaces --if-present
2026-05-29T16:51:13.122686369Z 
2026-05-29T16:51:13.246956778Z 
2026-05-29T16:51:13.246980159Z > api@0.0.1 build
2026-05-29T16:51:13.246984829Z > nest build
2026-05-29T16:51:13.246988889Z 
2026-05-29T16:51:18.649277151Z 
2026-05-29T16:51:18.649317033Z > web@0.1.0 build
2026-05-29T16:51:18.649326014Z > next build
2026-05-29T16:51:18.649333264Z 
2026-05-29T16:51:18.998057026Z ⚠ turbopack.root should be absolute, using: /opt/render/project/src
2026-05-29T16:51:18.998869707Z ⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
2026-05-29T16:51:19.015389672Z ▲ Next.js 16.2.6 (Turbopack)
2026-05-29T16:51:19.01555059Z 
2026-05-29T16:51:19.037320938Z   Creating an optimized production build ...
2026-05-29T16:51:25.931861965Z 
2026-05-29T16:51:25.931895117Z > Build error occurred
2026-05-29T16:51:25.934435384Z Error: Turbopack build failed with 1 errors:
2026-05-29T16:51:25.934444684Z ./web/dashboard/src/app/globals.css
2026-05-29T16:51:25.934450094Z Error evaluating Node.js code
2026-05-29T16:51:25.934456885Z Error: Cannot find module '../lightningcss.linux-x64-gnu.node'
2026-05-29T16:51:25.934460815Z Require stack:
2026-05-29T16:51:25.934465385Z - /opt/render/project/src/node_modules/lightningcss/node/index.js
2026-05-29T16:51:25.934469255Z - /opt/render/project/src/node_modules/@tailwindcss/node/dist/index.js
2026-05-29T16:51:25.934473146Z - /opt/render/project/src/node_modules/@tailwindcss/postcss/dist/index.js
2026-05-29T16:51:25.934497587Z - /opt/render/project/src/web/dashboard/.next/build/chunks/[root-of-the-server]__0~.s0zk._.js
2026-05-29T16:51:25.934503027Z - /opt/render/project/src/web/dashboard/.next/build/chunks/[turbopack]_runtime.js
2026-05-29T16:51:25.934519798Z - /opt/render/project/src/web/dashboard/.next/build/postcss.js
2026-05-29T16:51:25.934522618Z     [at Module._resolveFilename (node:internal/modules/cjs/loader:1519:15)]
2026-05-29T16:51:25.934525158Z     [at wrapResolveFilename (node:internal/modules/cjs/loader:1073:27)]
2026-05-29T16:51:25.934527598Z     [at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1097:10)]
2026-05-29T16:51:25.934530188Z     [at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1124:12)]
2026-05-29T16:51:25.934532738Z     [at Module._load (node:internal/modules/cjs/loader:1296:5)]
2026-05-29T16:51:25.934535109Z     [at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)]
2026-05-29T16:51:25.934537579Z     [at Module.require (node:internal/modules/cjs/loader:1619:12)]
2026-05-29T16:51:25.934539989Z     [at require (node:internal/modules/helpers:191:16)]
2026-05-29T16:51:25.934542939Z     [at Object.<anonymous> (/opt/render/project/src/node_modules/lightningcss/node/index.js:20:12)]
2026-05-29T16:51:25.934545309Z     [at Module._compile (node:internal/modules/cjs/loader:1873:14)]
2026-05-29T16:51:25.934547569Z 
2026-05-29T16:51:25.934550029Z Import trace:
2026-05-29T16:51:25.934552519Z   Client Component Browser:
2026-05-29T16:51:25.93455494Z     ./web/dashboard/src/app/globals.css [Client Component Browser]
2026-05-29T16:51:25.93455736Z     ./web/dashboard/src/app/layout.tsx [Server Component]
2026-05-29T16:51:25.93455973Z 
2026-05-29T16:51:25.93456196Z 
2026-05-29T16:51:25.93456432Z     at ignore-listed frames
2026-05-29T16:51:25.995636401Z npm error Lifecycle script `build` failed with error:
2026-05-29T16:51:25.99581078Z npm error code 1
2026-05-29T16:51:25.995917925Z npm error path /opt/render/project/src/web/dashboard
2026-05-29T16:51:25.996100084Z npm error workspace web@0.1.0
2026-05-29T16:51:25.99621335Z npm error location /opt/render/project/src/web/dashboard
2026-05-29T16:51:25.996338376Z npm error command failed
2026-05-29T16:51:25.996540756Z npm error command sh -c next build
2026-05-29T16:51:25.996680993Z 
2026-05-29T16:51:25.997307235Z 
2026-05-29T16:51:25.997313495Z > @smshive/shared-types@1.0.0 build
2026-05-29T16:51:25.997315975Z > tsc
2026-05-29T16:51:25.997317885Z 
2026-05-29T16:51:27.096748314Z ==> Build failed 😞
2026-05-29T16:51:27.096765625Z ==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploysread