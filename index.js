const server = require('./server.js');
const cors = require("cors")
const corsOptions = {
  credentials: true,
  origin: "*"// Whitelist the domains you want to allow
};
const PORT = process.env.PORT || 5000;
require('dotenv').config()
server.use(cors(corsOptions));

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});