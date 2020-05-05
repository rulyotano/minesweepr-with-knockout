const express = require("express");
const app = express();

const PORT = 3005;

const options = {
  root: __dirname
};

app.use(express.static("public"));

// respond with "hello world" when a GET request is made to the homepage
app.get("/", function(req, res) {
  res.sendFile("./minesweeper.html", options);
});

app.listen(3005);

console.log(`Wine Sweeper is running on: http://localhost:${PORT}`);
