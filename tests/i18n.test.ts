import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { languages, messages, resolveLanguage, translate } from "../src/shared/i18n.js";
import { defaultConfig, validateConfig, validateCommand } from "../src/shared/model.js";
import { ConfigStore } from "../src/main/config.js";

test("system language matching handles regions, POSIX locales, preferences and fallback", () => {
  for (const [locale, expected] of [["en-GB", "en"], ["pl_PL.UTF-8", "pl"], ["de-DE", "de"], ["fr_CA", "fr"], ["es-419", "es"], ["it_IT@euro", "it"], ["C", "en"], ["ja-JP", "en"], ["", "en"]] as const) assert.equal(resolveLanguage("auto", locale), expected);
  assert.equal(resolveLanguage("auto", ["ja-JP", "fr-CA", "en"]), "fr");
  assert.equal(resolveLanguage("auto", []), "en");
  assert.equal(resolveLanguage("pl", ["de-DE"]), "pl");
});
test("older settings migrate without changing account data; locale IPC is strict and persists", () => {
  const old = { ...defaultConfig(), settings: { closeToTray: false } };
  assert.equal(validateConfig(old).settings.language, "auto");
  for (const value of ["xx", "PL", "", null, 1, {}, undefined]) {
    assert.throws(() => validateCommand({ type: "language", language: value }));
    if (value !== undefined) assert.throws(() => validateConfig({ ...old, settings: { closeToTray: false, language: value } }));
  }
  const dir = mkdtempSync(join(tmpdir(), "monochat-language-"));
  try {
    const store = new ConfigStore(dir);
    for (const language of ["auto", ...languages] as const) {
      assert.deepEqual(validateCommand({ type: "language", language }), { type: "language", language });
      const config = structuredClone(store.value); config.settings.language = language; store.save(config);
      assert.equal(new ConfigStore(dir).value.settings.language, language);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test("all translations are complete and preserve interpolation parameters", () => {
  const placeholders = (s: string) => [...s.matchAll(/\{\w+\}/g)].map(m => m[0]).sort();
  for (const [source, translations] of Object.entries(messages)) {
    assert.equal(translations.length, 5);
    for (const text of translations) { assert.ok(text.trim()); assert.deepEqual(placeholders(text), placeholders(source), source); }
  }
  assert.equal(translate("de", "Usunąć „{name}”?", { name: "<Private>" }), "„<Private>“ entfernen?");
});
