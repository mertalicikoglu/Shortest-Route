"use strict";

const fs = require("fs");
const Route = require("./libs/Route").Route
const express = require("express");
const app = express();
const port = 4000;

app.use("/static", express.static('./static/'));

app.get("/", async (req, res) => {
    const raw = fs.readFileSync("./data.json");
    const data = JSON.parse(raw);
    let routes = new Route(data);
    let response = await routes.run();
    res.send(response);
});


app.get("/map", async (request, response) => {
    response.sendFile(__dirname + "/views/index.html");
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});