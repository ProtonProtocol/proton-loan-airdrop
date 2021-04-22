const Decimal = require("decimal.js");
Decimal.set({ precision: 20, rounding: 4 });

const asset2dec = (assetString) => {
  return Number.parseFloat(assetString.split(` `)[0]);
};

const safeParseInt = (val) => {
  if (!(typeof val === `number` || typeof val === `string`))
    throw new Error(`safeParseInt: wrong type: ${typeof val}`);
  return Number.parseInt(val);
};

module.exports = {
  asset2dec,
  safeParseInt
};
