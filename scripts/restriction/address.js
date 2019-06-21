/**
 * $ node scripts/filter/address.js SDPF2RAQ6CUSOHCJD5U7YWRYF7Y3GRXNKTBL5C2V block add
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

const rawAddress = process.argv[2];
const propertyType = process.argv[3] || 'block';
const modType = process.argv[4] || 'add';
const address = nem.Address.createFromRawAddress(rawAddress);

console.log('initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('Block:     %s', address.pretty());
console.log('Property:  %s', propertyType);
console.log('Modify:    %s', modType);
console.log('Endpoint:  %s/account/%s/properties', url, initiator.address.plain());
console.log('Endpoint:  %s/account/%s', url, address.plain());
console.log('');

const propType = propertyType === 'allow'
  ? nem.PropertyType.AllowAddress
  : nem.PropertyType.BlockAddress

const propModType = modType === 'remove'
  ? nem.PropertyModificationType.Remove
  : nem.PropertyModificationType.Add

const addressPropertyFilter = nem.AccountPropertyModification.createForAddress(
  propModType,
  address
);

const propModTx = nem.AccountPropertyTransaction.createAddressPropertyModificationTransaction(
  nem.Deadline.create(),
  propType,
  [addressPropertyFilter],
  nem.NetworkType.MIJIN_TEST
);

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(propModTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
