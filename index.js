const tipranksApi = require("./tipranks-api-v2/index.js");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hellos");
  // tipranksApi.getPriceTargets("aapl").then((result) => res.json(result));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
