#!/usr/bin/env node
/** Read-only public deployment check. Never modifies courses, lectures or users. */
const base = process.argv[2] || process.env.PUBLIC_URL;
if (!base) {
  console.error('Usage: node scripts/smoke-production.mjs https://your-vercel-site.vercel.app');
  process.exit(2);
}
const url = new URL(base);
if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) {
  console.error('Use an HTTPS URL (HTTP is allowed only for localhost).');
  process.exit(2);
}

let failed = 0;
const tests = [
  { path: '/', expect: 200, content: 'text/html' },
  { path: '/courses', expect: 200, content: 'text/html' },
  { path: '/admin/login', expect: 200, content: 'text/html' },
  { path: '/api/health', expect: 200, content: 'application/json', check: (obj) => obj?.data?.database === 'connected' },
  { path: '/api/courses', expect: 200, content: 'application/json', check: (obj) => obj?.success === true && Array.isArray(obj?.data) },
  { path: '/api/admin/me', expect: 401, content: 'application/json' },
  { path: '/api/does-not-exist', expect: 404, content: 'application/json' },
];
for (const t of tests) {
  try {
    const response = await fetch(new URL(t.path, url), { redirect: 'manual', signal: AbortSignal.timeout(20000) });
    const type = response.headers.get('content-type') || '';
    const body = type.includes('json') ? await response.json() : null;
    const ok = response.status === t.expect && type.includes(t.content) && (!t.check || t.check(body));
    console.log(`${ok ? 'PASS' : 'FAIL'} ${t.path} [${response.status}] ${type}`);
    if (!ok) failed++;
  } catch (error) {
    console.error(`FAIL ${t.path} — ${error.message}`);
    failed++;
  }
}
if (failed) {
  console.error(`${failed} deployment check(s) failed.`);
  process.exitCode = 1;
} else {
  console.info('All public deployment checks passed. Admin login and CRUD require manual verification.');
}
