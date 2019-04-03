/**
 * $ node scripts/filter/mosaic.js MOSAIC_HEX block add
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiater = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

const mosaicHex = process.argv[2];
const propType = process.argv[3] || 'block';
const modType = process.argv[4] || 'add';
const mosaicId = new nem.MosaicId(mosaicHex)

console.log('Initiater: %s', initiater.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiater.address.plain());
console.log('Block:     %s', mosaicId.toHex());
console.log('Property:  %s', propType);
console.log('Modify:    %s', modType);
console.log('Endpoint:  %s/account/properties/%s', url, initiater.address.plain());
console.log('Endpoint:  %s/mosaic/%s', url, mosaicId.toHex());
console.log('');

const propertyType = propType === 'allow'
  ? nem.PropertyType.AllowMosaic
  : nem.PropertyType.BlockMosaic
const propertyModificationType = modType === 'remove'
  ? nem.PropertyModificationType.Remove
  : nem.PropertyModificationType.Add

const mosaicPropertyFilter = nem.AccountPropertyTransaction.createMosaicFilter(
  propertyModificationType,
  mosaicId
);

const propModTx = nem.AccountPropertyTransaction.createMosaicPropertyModificationTransaction(
  nem.Deadline.create(),
  propertyType,
  [mosaicPropertyFilter],
  nem.NetworkType.MIJIN_TEST
);

util.listener(url, initiater.address, {
  onOpen: () => {
    const signedTx = initiater.sign(propModTx);
    util.announce(url, signedTx);
  }
});
