/**
 * inject-env.js
 * 
 * Lê o arquivo .env da raiz do projeto e injeta as variáveis
 * no bloco window.__ENV__ do index.html, substituindo os
 * placeholders %%NOME_DA_VAR%% pelos valores reais.
 * 
 * USO:
 *   node inject-env.js            → gera dist/index.html
 *   node inject-env.js --watch    → reprocessa ao salvar o .env
 * 
 * O arquivo dist/index.html NÃO deve ir para o Git.
 * Adicione "dist/" ao .gitignore.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = __dirname;
const ENV_FILE  = path.join(ROOT, '.env');
const SRC_FILE  = path.join(ROOT, 'index.html');
const DIST_DIR  = path.join(ROOT, 'dist');
const OUT_FILE  = path.join(DIST_DIR, 'index.html');

// ── Helpers ────────────────────────────────────────────────

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌  Arquivo .env não encontrado em: ${filePath}`);
    console.error('    Copie .env.example → .env e preencha suas chaves.');
    process.exit(1);
  }

  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  const env   = {};

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;   // ignora comentários/vazios
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key   = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, ''); // remove aspas opcionais
    env[key] = value;
  }

  return env;
}

function injectEnv(htmlContent, env) {
  let result = htmlContent;

  for (const [key, value] of Object.entries(env)) {
    // Substitui todos os %%NOME_DA_VAR%% pelo valor real
    const placeholder = new RegExp(`%%${key}%%`, 'g');
    result = result.replace(placeholder, value);
  }

  // Avisa sobre placeholders que não foram resolvidos
  const remaining = [...result.matchAll(/%%([A-Z0-9_]+)%%/g)];
  if (remaining.length > 0) {
    console.warn('⚠️  Placeholders não resolvidos (faltam no .env):');
    remaining.forEach(m => console.warn(`   - ${m[1]}`));
  }

  return result;
}

// ── Main ───────────────────────────────────────────────────

function build() {
  console.log('🔧  Injetando variáveis de ambiente...');

  const env  = parseEnv(ENV_FILE);
  const html = fs.readFileSync(SRC_FILE, 'utf-8');
  const out  = injectEnv(html, env);

  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, out, 'utf-8');

  console.log(`✅  Gerado: dist/index.html`);
  console.log(`   Chaves injetadas: ${Object.keys(env).join(', ')}`);
}

build();

// ── Watch mode ─────────────────────────────────────────────

if (process.argv.includes('--watch')) {
  console.log('\n👀  Modo watch ativo. Aguardando mudanças no .env e index.html...\n');

  let debounce;
  const handler = () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      console.log('\n🔄  Mudança detectada, reconstruindo...');
      build();
    }, 150);
  };

  fs.watch(ENV_FILE,  handler);
  fs.watch(SRC_FILE,  handler);
}
