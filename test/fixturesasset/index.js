const BN = require('bn.js')
const utils = require('../utils')

module.exports = [{
  description: '3 asset outputs with different guids, no asset change',
  feeRate: new BN(10),
  txVersion: utils.SYSCOIN_TX_VERSION_ASSET_SEND,
  assetMap: new Map([
    ['1234', { changeAddress: 'changeAddr1', outputs: [{ value: new BN(100), address: 'addr1' }] }],
    ['12345', { changeAddress: 'changeAddr2', outputs: [{ value: new BN(1000), address: 'addr2' }] }],
    ['12346', { changeAddress: 'changeAddr3', outputs: [{ value: new BN(10000), address: 'addr3' }] }]
  ]),
  utxos: [
    { value: new BN(102001) },
    { assetInfo: { assetGuid: '1234', value: new BN(100) }, value: new BN(680) },
    { assetInfo: { assetGuid: '12345', value: new BN(1000) }, value: new BN(680) },
    { assetInfo: { assetGuid: '12346', value: new BN(10000) }, value: new BN(680) }
  ],
  expected: {
    inputs: [
      {
        i: 1,
        assetInfo: { assetGuid: '1234', value: new BN(100) },
        value: new BN(680)
      },
      {
        i: 2,
        assetInfo: { assetGuid: '12345', value: new BN(1000) },
        value: new BN(680)
      },
      {
        i: 3,
        assetInfo: { assetGuid: '12346', value: new BN(10000) },
        value: new BN(680)
      }],
    outputs: [
      {

        address: 'addr1',
        type: 'BECH32',
        assetInfo: { assetGuid: '1234', value: new BN(100) },
        value: new BN(680)
      },
      {

        address: 'addr2',
        type: 'BECH32',
        assetInfo: { assetGuid: '12345', value: new BN(1000) },
        value: new BN(680)
      },
      {

        address: 'addr3',
        type: 'BECH32',
        assetInfo: { assetGuid: '12346', value: new BN(10000) },
        value: new BN(680)
      }],
    assetAllocations: [
      { assetGuid: '1234', values: [{ n: 0, value: new BN(100) }], notarysig: Buffer.from('') },
      { assetGuid: '12345', values: [{ n: 1, value: new BN(1000) }], notarysig: Buffer.from('') },
      { assetGuid: '12346', values: [{ n: 2, value: new BN(10000) }], notarysig: Buffer.from('') }
    ]
  }
},
{
  description: 'multiple asset outputs per asset with multiple change, out of order utxo',
  feeRate: new BN(10),
  txVersion: utils.SYSCOIN_TX_VERSION_ASSET_SEND,
  assetMap: new Map([
    ['1234', { changeAddress: 'changeAddr1', outputs: [{ value: new BN(100), address: 'addr1' }, { value: new BN(50), address: 'addr1a' }] }],
    ['12345', { changeAddress: 'changeAddr2', outputs: [{ value: new BN(1000), address: 'addr2' }, { value: new BN(100), address: 'addr2a' }, { value: new BN(10), address: 'addr2b' }] }],
    ['12346', { changeAddress: 'changeAddr3', outputs: [{ value: new BN(10000), address: 'addr3' }, { value: new BN(100000), address: 'addr3a' }] }]
  ]),
  utxos: [
    { value: new BN(102001) },
    { assetInfo: { assetGuid: '1234', value: new BN(10) }, value: new BN(680) },
    { assetInfo: { assetGuid: '1234', value: new BN(100) }, value: new BN(680) },
    { assetInfo: { assetGuid: '1234', value: new BN(25) }, value: new BN(680) },
    { assetInfo: { assetGuid: '1234', value: new BN(35) }, value: new BN(680) },
    { assetInfo: { assetGuid: '12345', value: new BN(2000) }, value: new BN(680) },
    { assetInfo: { assetGuid: '12346', value: new BN(10000) }, value: new BN(680) },
    { assetInfo: { assetGuid: '12346', value: new BN(100000) }, value: new BN(680) }
  ],
  expected: {
    inputs: [
      {
        i: 2,
        assetInfo: { assetGuid: '1234', value: new BN(100) },
        value: new BN(680)
      },
      {
        i: 4,
        assetInfo: { assetGuid: '1234', value: new BN(35) },
        value: new BN(680)
      },
      {
        i: 3,
        assetInfo: { assetGuid: '1234', value: new BN(25) },
        value: new BN(680)
      },
      {
        i: 5,
        assetInfo: { assetGuid: '12345', value: new BN(2000) },
        value: new BN(680)
      },
      {
        i: 7,
        assetInfo: { assetGuid: '12346', value: new BN(100000) },
        value: new BN(680)
      },
      {
        i: 6,
        assetInfo: { assetGuid: '12346', value: new BN(10000) },
        value: new BN(680)
      }],
    outputs: [
      {

        address: 'addr1',
        type: 'BECH32',
        assetInfo: { assetGuid: '1234', value: new BN(100) },
        value: new BN(680)
      },
      {

        address: 'addr1a',
        type: 'BECH32',
        assetInfo: { assetGuid: '1234', value: new BN(50) },
        value: new BN(680)
      },
      // changeAddr1
      {
        assetChangeIndex: 2,
        type: 'BECH32',
        assetInfo: { assetGuid: '1234', value: new BN(10) },
        value: new BN(680)
      },
      {

        address: 'addr2',
        type: 'BECH32',
        assetInfo: { assetGuid: '12345', value: new BN(1000) },
        value: new BN(680)
      },
      {

        address: 'addr2a',
        type: 'BECH32',
        assetInfo: { assetGuid: '12345', value: new BN(100) },
        value: new BN(680)
      },
      {

        address: 'addr2b',
        type: 'BECH32',
        assetInfo: { assetGuid: '12345', value: new BN(10) },
        value: new BN(680)
      },
      // changeAddr2
      {
        assetChangeIndex: 3,
        type: 'BECH32',
        assetInfo: { assetGuid: '12345', value: new BN(890) },
        value: new BN(680)
      },
      {

        address: 'addr3',
        type: 'BECH32',
        assetInfo: { assetGuid: '12346', value: new BN(10000) },
        value: new BN(680)
      },
      {

        address: 'addr3a',
        type: 'BECH32',
        assetInfo: { assetGuid: '12346', value: new BN(100000) },
        value: new BN(680)
      }],
    assetAllocations: [
      { assetGuid: '1234', values: [{ n: 0, value: new BN(100) }, { n: 1, value: new BN(50) }, { n: 2, value: new BN(10) }], notarysig: Buffer.from('') },
      { assetGuid: '12345', values: [{ n: 3, value: new BN(1000) }, { n: 4, value: new BN(100) }, { n: 5, value: new BN(10) }, { n: 6, value: new BN(890) }], notarysig: Buffer.from('') },
      { assetGuid: '12346', values: [{ n: 7, value: new BN(10000) }, { n: 8, value: new BN(100000) }], notarysig: Buffer.from('') }
    ]
  }
}
]
