/**
 * $ node scripts/filter/address.js SDPF2RAQ6CUSOHCJD5U7YWRYF7Y3GRXNKTBL5C2V block add
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiater = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

const rawAddress = process.argv[2];
const propType = process.argv[3] || 'block';
const modType = process.argv[4] || 'add';
const address = nem.Address.createFromRawAddress(rawAddress);

console.log('Initiater: %s', initiater.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiater.address.plain());
console.log('Block:     %s', address.pretty());
console.log('Property:  %s', propType);
console.log('Modify:    %s', modType);
console.log('Endpoint:  %s/account/properties/%s', url, initiater.address.plain());
console.log('Endpoint:  %s/account/%s', url, address.plain());
console.log('');

const propertyType = propType === 'allow'
  ? nem.PropertyType.AllowAddress
  : nem.PropertyType.BlockAddress

const propertyModificationType = modType === 'remove'
  ? nem.PropertyModificationType.Remove
  : nem.PropertyModificationType.Add

const addressPropertyFilter = nem.AccountPropertyTransaction.createAddressFilter(
  propertyModificationType,
  address
);

const propModTx = nem.AccountPropertyTransaction.createAddressPropertyModificationTransaction(
  nem.Deadline.create(),
  propertyType,
  [addressPropertyFilter],
  nem.NetworkType.MIJIN_TEST
);

util.listener(url, initiater.address, {
  onOpen: () => {
    const signedTx = initiater.sign(propModTx);
    util.announce(url, signedTx);
  }
});
