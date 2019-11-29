/**
 * 手数料の立替によるモザイク送信
 * イニシエータは AppProvider となる。
 * アプリの操作によってトランザクションが発信される
 * Alice は直接トランザクションを送信しないで署名をするだけ
 *
 * 1. AppProvider から Alice へ 1 nem:xem (手数料分)を送信
 * 2. Alice から Bob へ 1 us:usd を送信
 *
 * $ node scripts/transfer/create_pay_others_fee.js DEBTOR_PRIVATE_KEY
 */
const nem = require('nem2-sdk');
const util = require('../scripts/util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiater = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);

const bob = nem.PublicAccount.createFromPublicKey(
  process.argv[2],
  nem.NetworkType.MIJIN_TEST
);

const carol = nem.PublicAccount.createFromPublicKey(
  process.argv[3],
  nem.NetworkType.MIJIN_TEST
);


const bobAddress = nem.Address.createFromRawAddress('SA6YCX-IVC4HX-HW7LDQ-5G4MD6-A6PSIL-GBQMDD-DHVW');

(async () => {


  const fromAppProvider = nem.TransferTransaction.create(
    nem.Deadline.create(),
    alice.address,
    [nem.NetworkCurrencyMosaic.createRelative(1)], // fee
    nem.EmptyMessage,
    nem.NetworkType.MIJIN_TEST
  );


  const mosaic = new nem.Mosaic(
    new nem.MosaicId('53e1abda17a04bec'),
    nem.UInt64.fromUint(10000) // 10.000 us.usd
  )
  const fromAlice = nem.TransferTransaction.create(
    nem.Deadline.create(),
    bobAddress,
    [mosaic], // us.usd
    nem.EmptyMessage,
    nem.NetworkType.MIJIN_TEST
  );

  const aggregateTx = nem.AggregateTransaction.createBonded(
    nem.Deadline.create(),
    [
      fromAppProvider.toAggregate(appProvider.publicAccount),
      fromAlice.toAggregate(alice)
    ],
    nem.NetworkType.MIJIN_TEST,
    []
  );

  const signedTx = appProvider.sign(aggregateTx);

  // TODO: LockHash
  // @FIX catapult-server@0.3.0.2 bug with HashLock.mosaics containing namespaceId
  const namespaceHttp = new nem.NamespaceHttp(url, nem.NetworkType.MIJIN_TEST);
  const mosaicId = await namespaceHttp.getLinkedMosaicId(new nem.NamespaceId('cat.currency')).toPromise();

  const lockMosaicId = nem.NetworkCurrencyMosaic.createRelative(10);
  const lockFundsTx = nem.LockFundsTransaction.create(
    nem.Deadline.create(),
    // lockMosaic,
    new nem.Mosaic(lockMosaicId, nem.UInt64.fromUint(10000000)),
    nem.UInt64.fromUint(1000),
    signedTx,
    nem.NetworkType.MIJIN_TEST,
  );

  util.listener(url, appProvider.address, {
    onOpen: () => {
      signedLockFundsTx = appProvider.sign(lockFundsTx);
      util.announce(url, signedLockFundsTx, () => {
        util.announce(url, signedTx);
      });
    }
  });
})()
