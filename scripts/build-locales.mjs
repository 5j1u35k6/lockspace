// Rebuild the on-demand dictionaries from the existing translation sources.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sandbox = { window: {} };
for (let part = 1; part <= 4; part++) {
  vm.runInNewContext(fs.readFileSync(path.join(root, `i18n-ui-${part}.js`), 'utf8'), sandbox);
}
const source = fs.readFileSync(path.join(root, 'i18n-content.js'), 'utf8');
// Extract the data declaration only; do not run the browser helpers.
const data = JSON.parse(source.slice(source.indexOf('const DATA = ') + 13, source.indexOf(';\n  window.LOCKSPACE_TASK_TRANSLATIONS')));
const ui = sandbox.window.LOCKSPACE_UI_TRANSLATIONS;
fs.mkdirSync(path.join(root, 'locales'), { recursive: true });
for (const language of new Set([...Object.keys(ui), ...Object.keys(data.tasks)])) {
  fs.writeFileSync(path.join(root, 'locales', `${language}.json`), JSON.stringify({ui: ui[language] || {}, tasks: data.tasks[language] || data.tasks.en || {}}));
}
