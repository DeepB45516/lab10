// src/server.js

const app = require('./app');

// Use environment port (important for Docker/Netlify)
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});