const http = require("https");
const express = require("express");
const PORT = process.env.PORT | 3000 | 5000 | 8080;
const app = express();
const prefix = "/";

app.get("/", (req, res) => res.send("MEOW MEOW"));

app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}\n`));

app.use("/", (req, res) => {
  res.send(new Date());
});

app.listen(() => console.log("SERVER STARTED!\n\n"));

app.get("/", (req, res) => res.sendStatus(200));
