const express = require("express");
const app = express();

const PORT =  3000;

app.get("/", (req, res) => {
  res.json({
    message: "Response from backend server",
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", port: PORT });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
