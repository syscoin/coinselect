const Simulation = require('./simulation')
const modules = require('./strategies')
const min = 14226 // 0.1 USD
const max = 142251558 // 1000 USD
const feeRate = 56 * 100
const results = []

// switch between two modes
// true - failed payments are discarded
// false - failed payments are queued until there is enough balance
const discardFailed = false
const walletType = 'p2pkh' // set to either p2pkh or p2sh

// data from blockchaing from ~august 2015 - august 2017
// see https://gist.github.com/runn1ng/8e2881e5bb44e01748e46b3d1c549038
// these are 2-of-3 lengths, most common p2sh (66%), percs changed so they add to 100
const scripthashScriptLengthData = {
  prob: 0.16,
  inLengthPercs: {
    252: 25.29,
    253: 49.77,
    254: 24.94
  },
  outLength: 23
}

// these are compressed key length (90% of p2pkh inputs)
// percs changed so they add to 100
const pubkeyhashScriptLengthData = {
  prob: 0.84,
  inLengthPercs: {
    105: 0.4,
    106: 50.7,
    107: 48.81,
    108: 0.09
  },
  outLength: 25
}

const selectedData = walletType === 'p2pkh' ? pubkeyhashScriptLengthData : scripthashScriptLengthData
const inLengthProbs = selectedData.inLengthPercs

const outLengthProbs = {};
[scripthashScriptLengthData, pubkeyhashScriptLengthData].forEach(({ prob, outLength }) => {
  outLengthProbs[outLength] = prob
})

// n samples
for (let j = 0; j < 100; ++j) {
  if (j % 200 === 0) console.log('Iteration', j)

  const stages = []

  for (let i = 1; i < 4; ++i) {
    const utxos = Simulation.generateTxos(20 / i, min, max, inLengthProbs)
    const txos = Simulation.generateTxos(80 / i, min, max / 3, outLengthProbs)
    stages.push({ utxos, txos })
  }

  // for each strategy
  for (const name in modules) {
    const f = modules[name]
    const simulation = new Simulation(name, f, feeRate)

    stages.forEach((stage) => {
      // supplement our UTXOs
      stage.utxos.forEach(x => {
        simulation.addUTXO(x)

        // if discardFailed == true, this should do nothing
        simulation.run(discardFailed)
      })

      // now, run stage.txos.length transactions
      stage.txos.forEach((txo) => {
        simulation.plan([txo])
        simulation.run(discardFailed)
      })
    })

    simulation.finish()
    results.push(simulation)
  }
}

function merge (results) {
  const resultMap = {}

  results.forEach(({ stats }) => {
    const result = resultMap[stats.name]

    if (result) {
      result.inputs += stats.inputs
      result.outputs += stats.outputs
      result.transactions += stats.transactions
      result.plannedTransactions += stats.plannedTransactions
      result.fees += stats.fees
      result.bytes += stats.bytes
      result.utxos += stats.utxos
      result.average = {
        nInputs: result.inputs / result.transactions,
        nOutputs: result.outputs / result.transactions,
        fee: Math.round(result.fees / result.transactions),
        feeRate: Math.round(result.fees / result.bytes)
      }
      result.totalCost += stats.totalCost
    } else {
      resultMap[stats.name] = Object.assign({}, stats)
    }
  })

  return Object.keys(resultMap).map(k => ({ stats: resultMap[k] }))
}

function pad (i) {
  if (typeof i === 'number') i = Math.round(i * 1000) / 1000
  return ('          ' + i).slice(-10)
}

merge(results).sort((a, b) => {
  if (a.stats.transactions !== b.stats.transactions) return b.stats.transactions - a.stats.transactions
  return a.stats.totalCost - b.stats.totalCost

// top 20 only
}).slice(0, 20).forEach((x, i) => {
  const { stats } = x
  const DNF = 1 - stats.transactions / stats.plannedTransactions

  console.log(
    pad(i),
    pad(stats.name),
    '| transactions', pad('' + stats.transactions),
    '| fee', pad('' + stats.average.fee),
    '| feeRate', pad('' + stats.average.feeRate),
    '| nInputs', pad(stats.average.nInputs),
    '| nOutputs', pad(stats.average.nOutputs),
    '| DNF', (100 * DNF).toFixed(2) + '%',
    '| totalCost', pad('' + Math.round(stats.totalCost / 1000)),
    '| utxos', pad('' + stats.utxos)
  )
})
