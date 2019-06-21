/**
 * $ node scripts/transfer/create_mosaic_transfer.js RECIPIENT_ADDRESS 10
 */
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
// 秘密鍵からアカウントオブジェクトを作る
const initiator = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

// アドレス文字列からアドレスオブジェクトを作る
const recipient = nem.Address.createFromRawAddress(process.argv[2]);
const amount = parseInt(process.argv[3]);

// 確認用の情報を出力
console.log('initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('Recipient: %s', recipient.pretty());
console.log('Endpoint:  %s/account/%s', url, recipient.plain());
console.log('');

// 送信するモザイク配列
// ここでは`nem.NetworkCurrencyMosaic`すなわち`cat.currency`モザイクオブジェクトを準備
// モザイクIDで作る場合は以下のようにする。
// 可分性がわからないので送信量は絶対値で指定する必要がある。
// const mosaics = [new nem.Mosaic(new nem.MosaicId('__MOSAIC_ID__'), nem.UInt64.fromUint(absoluteAmount))];
const mosaics = [nem.NetworkCurrencyMosaic.createRelative(amount)];

// メッセージオブジェクトを作成
// 空メッセージを送る場合は nem.EmptyMessage を使います。
const message = nem.PlainMessage.create('Ticket fee');

// トランザクションオブジェクトを作成
// nem.Deadline.create() デフォルトでは2時間。引数の単位は`時間`です。(第二引数で単位を変えられる)
// SDKでは最大24時間とされているので、`24`を渡すとエラーになります。
const transferTx = nem.TransferTransaction.create(
  nem.Deadline.create(23),
  recipient,
  mosaics,
  message,
  nem.NetworkType.MIJIN_TEST
);

// トランザクション成功/失敗,未承認,承認のモニタリング接続
util.listener(url, initiator.address, {
  onOpen: () => {
    // 署名して発信
    const signedTx = initiator.sign(transferTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
