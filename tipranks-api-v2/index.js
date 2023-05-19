#!/usr/bin/env node
/*
"author": "Jan Schroeder",
"url": "git+https://github.com/janlukasschroeder/tipranks-api-v2.git"
all credits to author for tipranks-api-v2 code, had to tweak return values
*/

const h = require("./helpers");
const config = require("./config");
const moment = require("moment");

/**
 * Get price targets of symbol
 * @param symbol
 * @returns {Promise.<TResult>}
 */
module.exports.getPriceTargets = (symbol) => {
  const timestamp = moment().unix();
  const query =
    config.tipranks.baseUrl + `getData/?name=${symbol.toLowerCase()}&benchmark=1&period=3&break=${timestamp}`;

  return h.fetch(query).then((result) => {
    return formatPriceTargets(result);
  });
};
const formatPriceTargets = (result) => {
  if (!result.ticker) {
    return { success: false };
  }
  let sum = 0;
  let estimates = [];
  let t = {
    mean: 0,
    median: 0,
    highest: 0,
    lowest: 100000,
  };
  let out = {
    ticker: result.ticker,
    price_target: 0,
    price_percentage: 0,
    header_concensus_rating_count: 0,
    header_concensus_rating: "",
    success: true,
  };

  result.experts.forEach((expert) => {
    const recordDate = moment(expert.ratings[0].time);
    if (moment().diff(recordDate, "months") < 4 && expert.ratings[0].priceTarget !== null) {
      t.highest = expert.ratings[0].priceTarget > t.highest ? expert.ratings[0].priceTarget : t.highest;
      t.lowest = expert.ratings[0].priceTarget < t.lowest ? expert.ratings[0].priceTarget : t.lowest;
      out.header_concensus_rating_count++;
      estimates.push(expert.ratings[0].priceTarget);
      sum += expert.ratings[0].priceTarget;
    }
  });
  out.price_percentage = ((result.portfolioHoldingData.priceTarget / result.momentum.latestPrice - 1) * 100).toFixed(2);
  out.header_concensus_rating = result.portfolioHoldingData.analystConsensus.consensus;
  out.price_target = result.portfolioHoldingData.priceTarget;
  t.mean = sum / out.header_concensus_rating_count;
  t.median = h.median(estimates);

  return out;
};

const printCliInfo = () => {
  console.log('\nCall with "command" and "ticker". E.g.\n');
  console.log("\ttipranks-api-v2 price-targets TSLA\n");
  console.log("\tOR\n");
  console.log("\ttipranks-api-v2 news-sentiment TSLA\n");
  console.log("\tOR\n");
  console.log("\ttipranks-api-v2 trending\n");
};

const printResult = (result) => {
  console.log(JSON.stringify(result, null, 2));
};

const getArgs = () => {
  if (process.argv.length !== 4) {
    printCliInfo();
    process.exit();
  }
  return [process.argv[2], process.argv[3]];
};

if (require.main === module) {
  const [command, ticker] = getArgs();
  let fn;

  switch (command) {
    case "price-targets":
    case "price-target":
      fn = this.getPriceTargets;
      break;
    case "news-sentiment":
    case "news-sentiments":
      fn = this.getNewsSentimentData;
      break;
    case "trending":
      fn = this.getTrendingStocks;
      break;
    default:
      printCliInfo();
      process.exit();
  }

  fn(ticker).then(printResult).catch(printResult);
}
