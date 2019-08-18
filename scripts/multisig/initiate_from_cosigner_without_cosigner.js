/**
 * $ node multisig/initiate_from_cosigner_without_cosigner.js MULTISIG_PUBLIC_KEY RECIPIENT_ADDRESS AMOUNT
 */
const {
  Account,
  PublicAccount,
  Address,
  NetworkType,
  NetworkCurrencyMosaic,
  TransferTransaction,
  AggregateTransaction,
  PlainMessage,
  Deadline
} = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  NetworkType.MIJIN_TEST
);
const multisig = PublicAccount.createFromPublicKey(
  process.argv[2],
  NetworkType.MIJIN_TEST
);
const recipient = Address.createFromRawAddress(process.argv[3]);
const amount = parseInt(process.argv[4] || '0');

console.log('Initiator:  %s', initiator.address.pretty());
console.log('Endpoint:   %s/account/%s', url, initiator.address.plain());
console.log('Multisig:   %s', multisig.address.pretty());
console.log('Endpoint:   %s/account/%s', url, multisig.address.plain());
console.log('Amount:     %d', amount);
console.log('Recipient:  %s', recipient.pretty());
console.log('Endpoint:   %s/account/%s', url, recipient.plain());
console.log('');

const transferTx = TransferTransaction.create(
  Deadline.create(),
  recipient,
  [NetworkCurrencyMosaic.createRelative(amount)],
  new PlainMessage('Transaction from multisig account signed by cosigner.'),
  NetworkType.MIJIN_TEST
);

// 1-of-m のマルチシグなら他に署名者が不要なのでコンプリートで送信できる
const multisigTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [transferTx.toAggregate(multisig)],
  NetworkType.MIJIN_TEST
);

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(multisigTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  }
});
