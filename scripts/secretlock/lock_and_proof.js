/**
 * $ node secretlock/lock_and_proof.js RECI{IEMT_ADDRESS PROOF
 */
const sha3_256 = require('js-sha3').sha3_256;
const crypto = require('crypto');
const {
  Account,
  NetworkType,
  Address,
  Convert,
  Deadline,
  NetworkCurrencyMosaic,
  UInt64,
  HashType,
  TransactionType,
  SecretLockTransaction,
  SecretProofTransaction
} = require('nem2-sdk');
const util = require('../util');

const url = process.env.API_URL || 'http://localhost:3000';
const initiator = Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  NetworkType.MIJIN_TEST
);
const recipient = Address.createFromRawAddress(process.argv[2])

// 入力値がない場合は10byteのランダムな値を用意します
const input = process.argv[3] || crypto.randomBytes(10).toString('hex');
// proofを16進数文字列へ変換します
const proof = Convert.utf8ToHex(input).toUpperCase()
// secretを生成します(SHA3-256アルゴリズムを使用)
const secret = sha3_256(input).toUpperCase()

console.log('Initiator: %s', initiator.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
console.log('Recipient: %s', recipient.pretty());
console.log('Endpoint:  %s/account/%s', url, recipient.plain());
console.log('Proof:     %s (%s)', proof, input);
console.log('Secret:    %s', secret);
console.log('');

const secretLockTx = SecretLockTransaction.create(
  Deadline.create(),
  NetworkCurrencyMosaic.createRelative(2),
  UInt64.fromUint(96 * 360 / 15),
  HashType.Op_Sha3_256,
  secret,
  recipient,
  NetworkType.MIJIN_TEST
);

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(secretLockTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  },
  onConfirmed: (info, listener) => {
    // 承認されたトランザクションにsecretが含まれている
    // クロスチェーンスワップでは受信者がsecretを確認することができるタイミング
    // 受信者はそのsecretを使用して同様にシークレットロックトランザクションを発行する
    // 送信者は受信者のシークレットロックトランザクションに対してシークレットプルーフトランザクションを発行できる
    // シークレットプルーフトランザクションにはproofが含まれているので、
    // それを確認した受信者は最初のシークレットロックトランザクションに対応するシークレットプルーフトランザクションを発行できる
    if(info.type === TransactionType.SECRET_LOCK) {
      console.log('[Secret Recognized]\n{"secret": "%s"}', info.secret);
      console.log('');

      const secretProofTx = SecretProofTransaction.create(
        Deadline.create(),
        HashType.Op_Sha3_256,
        info.secret, // トランザクションから得られるsecret
        recipient,
        proof, // 本来は受信者が認知して使用するproof
        NetworkType.MIJIN_TEST
      );
      const signedTx = initiator.sign(secretProofTx, process.env.GENERATION_HASH);
      util.announce(url, signedTx);
    }
    if(info.type === TransactionType.SECRET_PROOF) {
      console.log('[Proof Recognized]\n{"proof": "%s"}', info.proof);
      console.log('');
      listener.close();
    }
  }
});
