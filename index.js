const server = require('./server.js');

const PORT = process.env.PORT || 5000;
require('dotenv').config()

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});