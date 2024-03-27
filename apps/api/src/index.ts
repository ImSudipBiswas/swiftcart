import express from "express";

const app = express();

const PORT: number = 8000;

app.get("/", (_, res) => {
  console.log("/ Route");
  res.send("Hello World");
});

app.listen(PORT, () => console.log("Server is running on port 8000"));
