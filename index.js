var accumulative = require('./accumulative')
var blackjack = require('./blackjack')
var utils = require('./utils')
var ext = require('./bn-extensions')

// order by descending value, minus the inputs approximate fee
function utxoScore (x, feeRate) {
  return ext.sub(x.value, ext.mul(feeRate, utils.inputBytes(x)));
}

module.exports = function coinSelect (utxos, inputs, outputs, feeRate) {
  utxos = utxos.concat().sort(function (a, b) {
    return ext.sub(utxoScore(b, feeRate), utxoScore(a, feeRate));
  })

  // attempt to use the blackjack strategy first (no change output)
  var base = blackjack(utxos, inputs, outputs, feeRate);
  if (base.inputs) return base;

  // else, try the accumulative strategy
  return accumulative(utxos, inputs, outputs, feeRate);
}

module.exports = function coinSelectAsset (utxos, assetArray, feeRate, isNonAssetFunded) {
  // attempt to use the blackjack strategy first (no change output)
  var base = blackjackAsset(utxos, assetArray, feeRate, isNonAssetFunded);
  if (base.inputs) return base;

  // else, try the accumulative strategy
  return accumulativeAsset(utxos, assetArray, feeRate, isNonAssetFunded);
}