import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const loader = html.slice(html.indexOf('    const languageLoads ='), html.indexOf('    Object.assign(TRANSLATIONS.ja'));
function harness(fetch) {
  const context = vm.createContext({ fetch, AbortSignal, TRANSLATIONS: {en:{Reviewed:'Approved'}}, Map });
  vm.runInContext(loader + '\nthis.load = ensureLanguage;', context);
  return context;
}
test('Traditional Chinese needs no language download', async () => {
  const ctx = harness(() => { throw new Error('Unexpected request'); });
  await ctx.load('zh-Hant');
});
test('concurrent requests share one download and retain reviewed copy', async () => {
  let count = 0;
  const ctx = harness(async () => { count++; return { ok:true, json: async () => ({ui:{Reviewed:'Unreviewed',Hello:'Hello'},tasks:{}}) }; });
  await Promise.all([ctx.load('en'),ctx.load('en')]);
  await ctx.load('en');
  assert.equal(count,1);
  assert.equal(ctx.TRANSLATIONS.en.Reviewed,'Approved');
  assert.equal(ctx.TRANSLATIONS.en.Hello,'Hello');
});
test('failed language requests can be retried', async () => {
  let count = 0;
  const ctx = harness(async () => ({ok:++count > 1,json:async()=>({ui:{},tasks:{}})}));
  await assert.rejects(ctx.load('en'));
  await ctx.load('en');
  assert.equal(count,2);
});
test('every supported non-default language has a valid dictionary', () => {
  const select = html.match(/<select id="languageSelect"[\s\S]*?<\/select>/)[0];
  for (const [,language] of select.matchAll(/value="([^"]+)"/g)) {
    if (language==='zh-Hant') continue;
    const data=JSON.parse(fs.readFileSync(new URL(`../locales/${language}.json`,import.meta.url),'utf8'));
    assert.ok(data.ui && data.tasks,language);
  }
});
