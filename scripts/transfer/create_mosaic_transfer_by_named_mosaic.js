/**
 * $ node scripts/transfer/create_mosaic_transfer_by_named_mosaic.js RECIPIENT NAMESPACE AMOUNT
 */
const {
  Account,
  NetworkType,
  Address,
  NamespaceHttp,
  NamespaceId,
  Mosaic,
  PlainMessage,
  TransferTransaction,
  UInt64,
  Deadline
} = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  NetworkType.MIJIN_TEST
);
const nsHttp = new NamespaceHttp(url);

// アドレスオブジェクトの代わりにリンクされているネームスペースIDオブジェクトを使う
const recipient = Address.createFromRawAddress(process.argv[2]);
const nsId = new NamespaceId(process.argv[3]);
const amount = parseInt(process.argv[4] || '0');

nsHttp.getLinkedMosaicId(nsId)
  .subscribe(
    mosaicId => {
      console.log('Initiator: %s', initiator.address.pretty());
      console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
      console.log('Recipient: %s', recipient.pretty());
      console.log('Endpoint:  %s/account/%s', url, recipient.plain());
      console.log('MosaicId:  %s', mosaicId.toHex());
      console.log('Endpoint:  %s/mosaic/%s', url, mosaicId.toHex());
      console.log('');

      // MosaicIdには直接NamespaceIdオブジェクトを渡せます。
      // 一度モザイクIDを引いているのはモザイクIDを表示するためです。
      const transferTx = TransferTransaction.create(
        Deadline.create(),
        recipient,
        [new Mosaic(nsId, UInt64.fromUint(amount))],
        PlainMessage.create(`Send ${mosaicId.toHex()} by ${nsId.fullName}`),
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
  )
;
