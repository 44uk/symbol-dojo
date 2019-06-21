/**
 * $ node scripts/transfer/create_mosaic_transfer_by_namespace.js RECIPIENT_NAMESPACE 10
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);
const nsHttp = new nem.NamespaceHttp(url);

// アドレスオブジェクトの代わりにリンクされているネームスペースIDオブジェクトを使う
const recipient = new nem.NamespaceId(process.argv[2]);
const amount = parseInt(process.argv[3]);

const next = (address) => {
  console.log('initiator: %s', initiator.address.pretty());
  console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
  console.log('Namespace: %s', recipient.fullName);
  console.log('Recipient: %s', address.pretty());
  console.log('Endpoint:  %s/account/%s', url, address.plain());
  console.log('');

  const mosaics = [nem.NetworkCurrencyMosaic.createRelative(amount)];
  const message = nem.PlainMessage.create('Ticket fee');
  const transferTx = nem.TransferTransaction.create(
    nem.Deadline.create(23),
    recipient,
    mosaics,
    message,
    nem.NetworkType.MIJIN_TEST
  );

  util.listener(url, initiator.address, {
    onOpen: () => {
      const signedTx = initiator.sign(transferTx, process.env.GENERATION_HASH);
      util.announce(url, signedTx);
    },
    onConfirmed: (_, listener) => listener.close()
  });
}

nsHttp.getLinkedAddress(recipient).subscribe(
  next,
  err => console.error('Error: ', err)
);
