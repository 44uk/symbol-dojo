/**
 * $ node scripts/filter/entity_type.js type block add
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiater = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

// onst txType = nem.TransactionType.MODIFY_ACCOUNT_PROPERTY_ENTITY_TYPE
// const txType = nem.TransactionType.TRANSFER
const entityType = process.argv[2];
const propType = process.argv[3] || 'block';
const modType = process.argv[4] || 'add';

console.log('Initiater: %s', initiater.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiater.address.plain());
console.log('Allow:     %s', txType.toString());
console.log('Type:      %s', modType);
console.log('Endpoint:  %s/account/properties/%s', url, initiater.address.plain());
console.log('');

const propertyType = propType === 'allow'
  ? nem.PropertyType.AllowMosaic
  : nem.PropertyType.BlockMosaic
const propertyModificationType = modType === 'remove'
  ? nem.PropertyModificationType.Remove
  : nem.PropertyModificationType.Add

const entityTypePropertyFilter = nem.AccountPropertyTransaction.createEntityTypeFilter(
  propertyModificationType,
  txType
);

const propModTx = nem.AccountPropertyTransaction.createEntityTypePropertyModificationTransaction(
  nem.Deadline.create(),
  propertyType
  [entityTypePropertyFilter],
  nem.NetworkType.MIJIN_TEST
);

util.listener(url, initiater.address, {
  onOpen: () => {
    const signedTx = initiater.sign(propModTx);
    util.announce(url, signedTx);
  }
});
