/**
 * $ node scripts/secretlock/lock_and_proof.js RECI{IEMT_ADDRESS PROOF
 */
const sha3_256 = require('js-sha3').sha3_256;
const crypto = require('crypto');
const convert = require('nem2-library').convert;
const nem = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiater = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);
const recipient = nem.Address.createFromRawAddress(process.argv[2])

// 入力値がない場合は10byteのランダムな値を用意します
const input = process.argv[3] || crypto.randomBytes(10).toString('hex');
// proofを16進数文字列へ変換します
const proof = convert.utf8ToHex(input).toUpperCase()
// secretを生成します(SHA3-256アルゴリズムを使用)
const secret = sha3_256(input).toUpperCase()

console.log('Initiater: %s', initiater.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiater.address.plain());
console.log('Recipient: %s', recipient.pretty());
console.log('Endpoint:  %s/account/%s', url, recipient.plain());
console.log('Proof:     %s (%s)', proof, input);
console.log('Secret:    %s', secret);
console.log('');

const secretLockTx = nem.SecretLockTransaction.create(
  nem.Deadline.create(),
  nem.NetworkCurrencyMosaic.createRelative(2),
  nem.UInt64.fromUint(2),
  nem.HashType.Op_Sha3_256,
  secret,
  recipient,
  nem.NetworkType.MIJIN_TEST
);

util.listener(url, initiater.address, {
  onOpen: () => {
    const signedTx = initiater.sign(secretLockTx);
    util.announce(url, signedTx);
  },
  onConfirmed: (info) => {
    // 承認されたトランザクションにsecretが含まれている
    // クロスチェーンスワップでは受信者がsecretを確認することができるタイミング
    // 受信者はそのsecretを使用して同様にシークレットロックトランザクションを発行する
    // 送信者は受信者のシークレットロックトランザクションに対してシークレットプルーフトランザクションを発行できる
    // シークレットプルーフトランザクションにはproofが含まれているので、
    // それを確認した受信者は最初のシークレットロックトランザクションに対応するシークレットプルーフトランザクションを発行できる
    if(info.type === nem.TransactionType.SECRET_LOCK) {
      console.log('[Secret Recognized]\n{"secret": "%s"}', info.secret)
      console.log('')

      const secretProofTx = nem.SecretProofTransaction.create(
        nem.Deadline.create(),
        nem.HashType.Op_Sha3_256,
        info.secret, // トランザクションから得られるsecret
        proof, // 本来は受信者が認知して使用するproof
        nem.NetworkType.MIJIN_TEST
      );
      const signedTx = initiater.sign(secretProofTx);
      util.announce(url, signedTx);
    }
    if(info.type === nem.TransactionType.SECRET_PROOF) {
      console.log('[Proof Recognized]\n{"proof": "%s"}', info.proof)
      console.log('')
    }
  }
});
