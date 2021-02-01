/**
 * $ ts-node filter/address.js SDPF2RAQ6CUSOHCJD5U7YWRYF7Y3GRXNKTBL5C2V block add
 */
const {
  Account,
  NetworkType,
  Address,
  PropertyType,
  PropertyModificationType,
  AccountPropertyModification,
  AccountPropertyTransaction,
  Deadline
} = require('symbol-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = Account.createFromPrivateKey(
  process.env.INITIATOR_KEYEYEYEY,
  NetworkType.MIJIN_TEST
);

const rawAddress = process.argv[2];
const propertyType = process.argv[3] || 'block';
const modType = process.argv[4] || 'add';
const address = Address.createFromRawAddress(rawAddress);

consola.info('Initiator: %s', initiator.address.pretty());
consola.info('Endpoint:  %s/account/%s', url, initiator.address.plain());
consola.info('Subject:   %s', address.pretty());
consola.info('Property:  %s', propertyType);
consola.info('Modify:    %s', modType);
consola.info('Endpoint:  %s/account/%s/restrictions', url, initiator.publicKey);
consola.info('Endpoint:  %s/account/%s', url, address.plain());
consola.info('');

const propType = propertyType === 'allow'
  ? PropertyType.AllowAddress
  : PropertyType.BlockAddress

const propModType = modType === 'remove'
  ? PropertyModificationType.Remove
  : PropertyModificationType.Add

const addressPropertyFilter = AccountPropertyModification.createForAddress(
  propModType,
  address
);

const propModTx = AccountPropertyTransaction.createAddressPropertyModificationTransaction(
  Deadline.create(),
  propType,
  [addressPropertyFilter],
  NetworkType.MIJIN_TEST
);

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(propModTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
