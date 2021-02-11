const nem = require('symbol-sdk');
const crypto = require('crypto');
const util = require('../util');

const url = env.API_URL || 'http://catapult-test.44uk.net:3000';
const mosaicHex = process.argv[2];
const mosaicId = new nem.MosaicId(mosaicHex);

// burnアドレスの作り方と証明
// seed文字列のハッシュを公開鍵として公開アドレスを作る
// 原則として公開鍵から秘密鍵を割り出せない
// このハッシュ(公開鍵)の元の文字列がわかる=秘密鍵は逆算できないし知らないことを証明できる
const seed = 'THE_BURN_ADDRESS_SEED'
const hasher = crypto.createHash('sha256')
const publicKey = hasher.update(seed).digest('hex')

// 秘密鍵の存在しないアカウントを作成
// このアカウントは`seed`から再構築できる
const burnAccount = nem.PublicAccount.createFromPublicKey(
  publicKey,
  nem.NetworkType.MIJIN_TEST
)
console.log('seed:        %s', seed)
console.log('publicKey:   %s', publicKey)
console.log('BurnAccount: %s', burnAccount.address.pretty());
console.log('Endpoint:    %s/account/%s', url, burnAccount.address.plain());
console.log('');

// 1. アカウントを生成
// 2. このアカウントにフィルタを設定
// 3. BURNアカウントを連署者としてマルチシグ化
const account = nem.Account.generateNewAccount(nem.NetworkType.MIJIN_TEST)
console.log('Account:  %s', account.address.pretty());
console.log('PrivKey:  %s', account.privateKey);
console.log('Endpoint: %s/account/%s', url, account.address.plain());
console.log('');

// フィルタ設定
const mosaicPropertyFilter = nem.AccountPropertyTransaction.createMosaicFilter(
  nem.PropertyModificationType.Add,
  mosaicId
);
const propModTx = nem.AccountPropertyTransaction.createMosaicPropertyModificationTransaction(
  nem.Deadline.create(),
  nem.PropertyType.AllowMosaic,
  [mosaicPropertyFilter],
  nem.NetworkType.MIJIN_TEST
);

// burnアカウントを連署者に設定
const cosignatoryModifications = [
  new nem.MultisigCosignatoryModification(
    nem.MultisigCosignatoryModificationType.Add,
    burnAccount
  )
];

const convertIntoMultisigTx = nem.ModifyMultisigAccountTransaction.create(
  nem.Deadline.create(),
  1,
  1,
  cosignatoryModifications,
  nem.NetworkType.MIJIN_TEST
);

const aggregatedTx = nem.AggregateTransaction.createComplete(
  nem.Deadline.create(),
  [ propModTx.toAggregate(account.publicAccount),
    convertIntoMultisigTx.toAggregate(account.publicAccount) ],
  nem.NetworkType.MIJIN_TEST
)

const signedTx = account.sign(aggregatedTx)

util.listener(url, account.address, {
  onOpen: () => {
    util.announce(url, signedTx);
  }
})
