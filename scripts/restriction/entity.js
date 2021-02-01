/**
 * $ ts-node filter/entity.js type block add
 */
const {
  Account,
  NetworkType,
  PropertyType,
  TransactionType,
  PropertyModificationType,
  AccountPropertyTransaction,
  AccountPropertyModification,
  Deadline
} = require('symbol-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = Account.createFromPrivateKey(
  process.env.INITIATOR_KEYEY,
  NetworkType.MIJIN_TEST
);

const entType = process.argv[2] || 'TRANSFER';
const propType = process.argv[3] || 'block';
const modType = process.argv[4] || 'add';

console.log('Initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('Subject:   %s', entType);
console.log('Property:  %s', propType);
console.log('Modify:    %s', modType);
console.log('Endpoint:  %s/account/%s/restrictions', url, initiator.publicKey);
console.log('');

const entityType = TransactionType[entType];

const propertyType = propType === 'allow'
  ? PropertyType.AllowTransaction
  : PropertyType.BlockTransaction
const propertyModificationType = modType === 'remove'
  ? PropertyModificationType.Remove
  : PropertyModificationType.Add

const entityTypePropertyFilter = AccountPropertyModification.createForEntityType(
  propertyModificationType,
  entityType
);

const propModTx = AccountPropertyTransaction.createEntityTypePropertyModificationTransaction(
  Deadline.create(),
  propertyType,
  [entityTypePropertyFilter],
  NetworkType.MIJIN_TEST
);

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(propModTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
