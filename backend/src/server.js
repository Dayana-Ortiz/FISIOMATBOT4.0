const app = require('./app');
const { checkConnection } = require('./config/db');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await checkConnection();
    console.log('Conexión a MySQL verificada correctamente.');
  } catch (err) {
    console.error('No se pudo conectar a la base de datos:', err.message);
    console.error('Revisa las variables DB_HOST/DB_USER/DB_PASSWORD/DB_NAME o DATABASE_URL en tu .env');
  }

  app.listen(PORT, () => {
    console.log(`API de FISIOMATHBOT escuchando en el puerto ${PORT}`);
  });
}

start();
