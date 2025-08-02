// server.js
const { createServer } = require('vite');

async function start() {
  const server = await createServer({
    server: {
      port: 3000, // Or any open port
    },
  });

  await server.listen();
  console.log('Vite dev server running on http://localhost:3000');
}

start();