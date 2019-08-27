/**
 * $ node transfer/raw_private_key_transaction.js PRIVATE_KEY RECIPIENT
 */
const {
  Account,
  Address,
  NetworkCurrencyMosaic,
  EmptyMessage,
  TransferTransaction,
  Deadline,
  NetworkType
} = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';

const initiator = Account.createFromPrivateKey(
  process.argv[2],
  NetworkType.MIJIN_TEST
);
const recipient = process.argv[3] ?
  Address.createFromRawAddress(process.argv[3]):
  initiator.address
;

console.log('Initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('Recipient: %s', recipient.pretty());
console.log('Endpoint:  %s/account/%s', url, recipient.plain());
console.log('');

const mosaics = [NetworkCurrencyMosaic.createRelative(0)];
const transferTx = TransferTransaction.create(
  Deadline.create(23),
  recipient,
  mosaics,
  EmptyMessage,
  NetworkType.MIJIN_TEST
);

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(transferTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
