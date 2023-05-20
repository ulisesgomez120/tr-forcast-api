const tipranksApi = require("./tipranks-api-v2/index.js");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/:ticker", (req, res) => {
  let ticker = req.params.ticker;
  if (ticker.length > 7) {
    res.json({ success: false });
  } else {
    tipranksApi.getPriceTargets(ticker).then((result) => res.json(result));
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
