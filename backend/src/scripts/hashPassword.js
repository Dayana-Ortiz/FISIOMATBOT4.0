/**
 * Utilidad de línea de comandos para generar un hash bcrypt.
 * Uso: node src/scripts/hashPassword.js "miContraseña"
 */
const bcrypt = require('bcryptjs');

const plain = process.argv[2];

if (!plain) {
  console.error('Uso: node src/scripts/hashPassword.js "miContraseña"');
  process.exit(1);
}

bcrypt.hash(plain, 10).then((hash) => {
  console.log(hash);
});
