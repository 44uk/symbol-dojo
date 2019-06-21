/**
 * $ node scripts/transfer/create_transfers_atomically.js 1
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

const amount = parseInt(process.argv[2]);

console.log('initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('');

// 便宜上宛先として新しいアカウントを生成
const recipients = [...Array(3)].map((_, idx) => {
  const account = nem.Account.generateNewAccount(nem.NetworkType.MIJIN_TEST);
  console.log(`- account${idx + 1} ${'-'.repeat(64)}`);
  console.log('Private:  %s', account.privateKey);
  console.log('Public:   %s', account.publicKey);
  console.log('Address:  %s', account.address.pretty());
  console.log('Endpoint: %s/account/%s', url, account.address.plain());
  return account;
});
console.log('');

const mosaics = [nem.NetworkCurrencyMosaic.createRelative(amount)];
const message = nem.PlainMessage.create('Tip for you');
const txes = recipients.map(account => {
  return nem.TransferTransaction.create(
    nem.Deadline.create(),
    account.address,
    mosaics,
    message,
    nem.NetworkType.MIJIN_TEST
  );
});

const aggregateTx = nem.AggregateTransaction.createComplete(
  nem.Deadline.create(),
  txes.map(tx => tx.toAggregate(initiator.publicAccount)),
  nem.NetworkType.MIJIN_TEST,
  []
);

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(aggregateTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
