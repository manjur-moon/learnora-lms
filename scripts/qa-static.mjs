/** Dependency-light source checks; not a substitute for `npm run build` or end-to-end tests. */
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join, dirname, extname, relative } from 'node:path';

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '..');
let failures = 0;
const read = (path) => readFileSync(join(root, path), 'utf8');
const pass = (name, ok) => {
  process.stdout.write(`${ok ? 'PASS' : 'FAIL'} ${name}\n`);
  if (!ok) failures++;
};

function load(name) {
  try { return require(name); }
  catch {
    try {
      const globalModules = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
      return require(join(globalModules, name));
    } catch { return null; }
  }
}
function walk(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path, files);
    else if (['.ts', '.tsx'].includes(extname(entry.name))) files.push(path);
  }
  return files;
}
const ts = load('typescript');
if (!ts) {
  console.error('TypeScript unavailable. Run npm install before this check.');
  process.exit(2);
}

const files = [...walk(join(root, 'client/src')), ...walk(join(root, 'server/src'))];
const syntaxErrors = [];
const missingImports = [];
for (const file of files) {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true,
    file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  for (const issue of source.parseDiagnostics) {
    syntaxErrors.push(`${relative(root, file)}: ${ts.flattenDiagnosticMessageText(issue.messageText, ' ')}`);
  }
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) continue;
    const spec = statement.moduleSpecifier?.text;
    if (!spec?.startsWith('.')) continue;
    const path = resolve(dirname(file), spec);
    const candidates = [path, `${path}.ts`, `${path}.tsx`, `${path}/index.ts`, `${path}/index.tsx`];
    if (spec.endsWith('.js')) candidates.push(`${path.slice(0, -3)}.ts`, `${path.slice(0, -3)}.tsx`);
    if (!candidates.some(existsSync)) missingImports.push(`${relative(root, file)} -> ${spec}`);
  }
}
pass(`TypeScript/TSX parsing (${files.length} files)`, syntaxErrors.length === 0);
pass('Relative imports', missingImports.length === 0);
[...syntaxErrors, ...missingImports].forEach((error) => console.error(' ', error));

const postcss = load('postcss');
if (postcss) {
  const cssFiles = [join(root, 'client/src/index.css'), ...readdirSync(join(root, 'client/src/styles')).map((name) => join(root, 'client/src/styles', name))];
  let cssErrors = 0;
  for (const path of cssFiles) {
    try { postcss.parse(readFileSync(path, 'utf8'), { from: path }); }
    catch (error) { cssErrors++; console.error(error.message); }
  }
  pass(`CSS parsing (${cssFiles.length} files)`, cssErrors === 0);
} else {
  console.log('WARN CSS parser unavailable (install dependencies to enable this check)');
}

for (const path of ['package.json', 'client/package.json', 'server/package.json', 'client/tsconfig.json', 'server/tsconfig.json']) {
  try { JSON.parse(read(path)); pass(`JSON ${path}`, true); }
  catch { pass(`JSON ${path}`, false); }
}
const app = read('client/src/App.tsx');
pass('Public and protected app routes',
  ['path="/"', 'path="/courses"', 'path="/courses/:courseId"', 'path="/admin/dashboard"',
    'path="/admin/courses"', 'path="/admin/courses/new"', 'path="/admin/courses/:courseId/edit"',
    'path="/admin/courses/:courseId/lectures"'].every((route) => app.includes(route)) &&
  app.includes('<Route element={<AdminShell />}>') && app.includes('<AdminGuard>'));
const server = read('server/src/app.ts');
pass('Better Auth registered before body parser', server.indexOf('app.all("/api/auth/*splat"') >= 0 &&
  server.indexOf('app.all("/api/auth/*splat"') < server.indexOf('app.use(express.json('));
const admin = read('server/src/routes/admin.routes.ts');
pass('Admin CRUD behind authorization', admin.indexOf('adminRouter.use(requireAdmin)') >= 0 &&
  admin.indexOf('adminRouter.use(requireAdmin)') < admin.indexOf('adminRouter.post('));
pass('Public sign-up disabled', read('server/src/config/auth.ts').includes('disableSignUp: true'));
pass('PostgreSQL cascade delete', read('server/sql/001_lms_schema.sql').includes('ON DELETE CASCADE'));
pass('UUID validation in both API and client', read('server/src/middleware/validate.ts').includes('{8}-') && read('client/src/hooks/useCourseDetails.ts').includes('{8}-'));
pass('Better Auth PostgreSQL pool', read('server/src/config/auth.ts').includes('database: pool'));
pass('PostgreSQL connection URL required', read('server/src/config/env.ts').includes('DATABASE_URL'));
pass('No MongoDB dependencies', !Object.keys(JSON.parse(read('server/package.json')).dependencies).some((name) => ['mongoose','mongodb','@better-auth/mongo-adapter'].includes(name)));
pass('No bundled credentials', !existsSync(join(root, 'server/.env')) && existsSync(join(root, 'server/.env.example')));
pass('No phase placeholder page', !existsSync(join(root, 'client/src/pages/PhaseNoticePage.tsx')));
console.log(`\n${files.length} source files checked; ${failures} failure(s).`);
process.exitCode = failures ? 1 : 0;
