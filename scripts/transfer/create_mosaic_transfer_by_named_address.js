/**
 * $ node transfer/create_mosaic_transfer_by_named_address.js RECIPIENT_NAMESPACE NAMESPACE 10
 */
const {
  Account,
  NetworkCurrencyMosaic,
  NamespaceHttp,
  NamespaceId,
  PlainMessage,
  TransferTransaction,
  Deadline,
  NetworkType
} = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  NetworkType.MIJIN_TEST
);
const nsHttp = new NamespaceHttp(url);

// アドレスオブジェクトの代わりにリンクされているネームスペースIDオブジェクトを使う
const nsId = new NamespaceId(process.argv[2]);
const amount = parseInt(process.argv[3] || '0');

nsHttp.getLinkedAddress(nsId).subscribe(
  address => {
    console.log('Initiator: %s', initiator.address.pretty());
    console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
    console.log('Namespace: %s', nsId.fullName);
    console.log('Recipient: %s', address.pretty());
    console.log('Endpoint:  %s/account/%s', url, address.plain());
    console.log('');

    // recipientには直接NamespaceIdオブジェクトを渡せます。
    // 一度アドレスを引いているのは宛先アドレスを表示するためです。
    const transferTx = TransferTransaction.create(
      Deadline.create(),
      nsId,
      [NetworkCurrencyMosaic.createRelative(amount)],
      PlainMessage.create(`Send to ${address.pretty()} by ${nsId.fullName}`),
      NetworkType.MIJIN_TEST
    );

    util.listener(url, initiator.address, {
      onOpen: () => {
        const signedTx = initiator.sign(transferTx, process.env.GENERATION_HASH);
        util.announce(url, signedTx);
      },
      onConfirmed: (_, listener) => listener.close()
    });
  },
  err => console.error('Error: ', err)
);
