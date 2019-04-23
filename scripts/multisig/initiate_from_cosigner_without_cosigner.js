/**
 * $ node scripts/multisig/initiate_from_cosigner_without_cosigner.js MULTISIG_PUBLIC_KEY RECIPIENT_ADDRESS AMOUNT
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiater = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);
const multisig = nem.PublicAccount.createFromPublicKey(
  process.argv[2],
  nem.NetworkType.MIJIN_TEST
);
const recipient = nem.Address.createFromRawAddress(process.argv[3]);
const amount = parseInt(process.argv[4] || '10');

console.log('Initiater:  %s', initiater.address.pretty());
console.log('Endpoint:   %s/account/%s', url, initiater.address.plain());
console.log('Multisig:   %s', multisig.address.pretty());
console.log('Endpoint:   %s/account/%s', url, multisig.address.plain());
console.log('Amount:     %d', amount);
console.log('Recipient:  %s', recipient.pretty());
console.log('Endpoint:   %s/account/%s', url, recipient.plain());
console.log('');

const transferTx = nem.TransferTransaction.create(
  nem.Deadline.create(),
  recipient,
  [nem.NetworkCurrencyMosaic.createRelative(amount)],
  nem.EmptyMessage,
  nem.NetworkType.MIJIN_TEST
);

// 1-of-m のマルチシグなら他に署名者が不要なのでコンプリートを使える
const multisigTx = nem.AggregateTransaction.createComplete(
  nem.Deadline.create(),
  [transferTx.toAggregate(multisig)],
  nem.NetworkType.MIJIN_TEST
);

util.listener(url, initiater.address, {
  onOpen: () => {
    const signedTx = initiater.sign(multisigTx);
    util.announce(url, signedTx);
  }
});
