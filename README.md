# coinselectsyscoin

[![TRAVIS](https://secure.travis-ci.org/bitcoinjs/coinselect.png)](http://travis-ci.org/syscoin/coinselect)
[![NPM](http://img.shields.io/npm/v/coinselect.svg)](https://www.npmjs.org/package/coinselect)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

An unspent transaction output (UTXO) selection module for syscoin.

**WARNING:** Value units are in `satoshi`s, **not** Syscoin.


## Algorithms
Accumulative - accumulates inputs until the target value (+fees) is reached, skipping detrimental inputs


**Note:** Each algorithm will add a change output if the `input - output - fee` value difference is over a dust threshold.
This is calculated independently by `utils.finalize`, irrespective of the algorithm chosen, for the purposes of safety.

**Pro-tip:** if you want to send-all inputs to an output address, `coinselectsyscoin/split` with a partial output (`.address` defined, no `.value`) can be used to send-all, while leaving an appropriate amount for the `fee`. 

## Example

``` javascript
let coinSelect = require('coinselectsyscoin')
let feeRate = 55 // satoshis per byte
let utxos = [
  ...,
  {
    txId: '...',
    vout: 0,
    ...,
    value: 10000,
    // For use with PSBT:
    // not needed for coinSelect, but will be passed on to inputs later
    nonWitnessUtxo: Buffer.from('...full raw hex of txId tx...', 'hex'),
    // OR
    // if your utxo is a segwit output, you can use witnessUtxo instead
    witnessUtxo: {
      script: Buffer.from('... scriptPubkey hex...', 'hex'),
      value: 10000 // 0.0001 BTC and is the exact same as the value above
    }
  }
]
let targets = [
  ...,
  {
    address: '1EHNa6Q4Jz2uvNExL497mE43ikXhwF6kZm',
    value: 5000
  }
]

// ...
let { inputs, outputs, fee } = coinSelect(utxos, targets, feeRate)

// the accumulated fee is always returned for analysis
console.log(fee)

// .inputs and .outputs will be undefined if no solution was found
if (!inputs || !outputs) return

let psbt = new bitcoin.Psbt()

inputs.forEach(input =>
  psbt.addInput({
    hash: input.txId,
    index: input.vout,
    nonWitnessUtxo: input.nonWitnessUtxo,
    // OR (not both)
    witnessUtxo: input.witnessUtxo,
  })
)
outputs.forEach(output => {
  // watch out, outputs may have been added that you need to provide
  // an output address/script for
  if (!output.address) {
    output.address = wallet.getChangeAddress()
    wallet.nextChangeAddress()
  }

  psbt.addOutput({
    address: output.address,
    value: output.value,
  })
})
```


## License [MIT](LICENSE)
