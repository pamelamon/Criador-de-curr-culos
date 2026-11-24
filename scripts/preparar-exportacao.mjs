import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function stylesheet(relativePath) {
  const filename = path.resolve(root, relativePath);
  return fs.readFileSync(filename, 'utf8').replace(/@import\s+url\(["']([^"']+)["']\);/g, (_, imported) =>
    stylesheet(path.relative(root, path.resolve(path.dirname(filename), imported))));
}
const styles = {
  principal: stylesheet('assets/css/style.css'),
  essencial: stylesheet('propostas/01-essencial/style.css'),
  horizonte: stylesheet('propostas/02-horizonte/style.css'),
  lavanda: stylesheet('propostas/03-lavanda/style.css')
};
fs.writeFileSync(path.join(root, 'assets/js/estilos-exportacao.js'),
  '// Gerado por scripts/preparar-exportacao.mjs para baixar o currículo sem dependências.\n'
  + `window.ResumeExportStyles = Object.freeze(${JSON.stringify(styles)});\n`, 'utf8');
console.log('Estilos das quatro versões preparados para a cópia de compartilhamento.');
