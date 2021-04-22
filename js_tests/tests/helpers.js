const Decimal = require("decimal.js");
Decimal.set({ precision: 20, rounding: 4 });

const setOraclePrices = async (oracle, feedIndices, prices) => {
  await oracle.resetTables(`data`);
  const arr = feedIndices.map((_, index) => {
    return {
      feed_index: feedIndices[index],
      aggregate: {
        d_string: null,
        d_uint64_t: null,
        d_double: prices[index],
      },
      points: [],
    };
  });
  await oracle.loadFixtures(`data`, {
    [oracle.accountName]: arr,
  });
};

const asset2dec = (assetString) => {
  return Number.parseFloat(assetString.split(` `)[0]);
};

const compound = (rate, periods) => {
  if (typeof rate !== `number` || typeof periods !== `number`)
    throw new Error(`must provide numbers`);

  const base = new Decimal(`1.0`).plus(rate);
  return base
    .pow(periods)
    .minus(`1.0`)
    .toNumber();
};

const getRateForAPY = (desiredAPY = 1.0 /* 100 % */) => {
  if (typeof desiredAPY !== `number`) throw new Error(`must provide a number`);

  // solves desiredAPY = compund(., 1-year) for rate
  const blocksPerYear = 63072000;
  const base = new Decimal(`1.0`).plus(desiredAPY);
  return base
    .pow(new Decimal(`1.0`).div(blocksPerYear))
    .minus(`1.0`)
    .toNumber();
};

module.exports = {
  setOraclePrices,
  asset2dec,
  compound,
  getRateForAPY,
};
