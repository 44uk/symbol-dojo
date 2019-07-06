# クロスチェーンスワップ

シークレットロックトランザクションとシークレットプルーフトランザクションを用いることで、他チェーンとの間で安全にモザイクを交換することができます。

- [クロスチェーンスワップ — NEM Developer Center](https://nemtech.github.io/ja/concepts/cross-chain-swaps.html)

シークレットロックトランザクションとは、プルーフ(proof)というパスワードのような値を使うトランザクションで、プルーフからシークレット(secret)を作り、そのシークレットと入力してトランザクションを発行します。

このトランザクションはネットワークに承認されるだけでは、受信者はモザイクを受け取れません。

この保留されたモザイクを受け取るためには、シークレットプルーフトランザクションを発行します。

シークレットプルーフトランザクションにはプルーフとシークレットを入力します。

このシークレットプルーフトランザクションに入力されたプルーフがシークレットの元となったものと一致していれば、承認された時点でモザイクが受信者に届きます。

クロスチェーンスワップでは、この仕組を利用します。

両者が保留状態のトランザクションをチェーン上に作り、プルーフを知っている送信者が送信者宛のモザイクを取り出すためにプルーフトランザクションを発行します。

すると受信者にもプルーフが伝わるので、受信者は受信者宛のモザイクを取り出すことができるようになります。


## シークレットロック/プルーフトランザクションを実行

このコードではクロスチェーンスワップにおいて本来受信者がすべきシークレットプルーフトランザクションを送信者が行います。

これまで使用していたネットワークだけで動作確認をします。

異なるチェーン間のスワップにはなりませんが、この挙動は前述の理屈のとおり、クロスチェーンスワップに応用することができます。

ここではシークレットロック/スワップトランザクションの機能についての実演です。

このスクリプトは第一引数の宛先アドレスを、第二引数にシークレットを受け取ります。

プルーフは**10byteから100byte**の長さを指定します。

半角文字で10文字程度入力してください。渡さなかった場合はランダムな値が使用されます。

```shell
$ node scripts/secretlock/lock_and_proof.js SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2 ALL_YOUR_BASE_ARE_BELONG_TO_US
Initiator: SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
Endpoint:  http://localhost:3000/account/SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4
Recipient: SCJ3XM-WIITJT-5DIFZY-KQ27VD-IYYKAV-XIAAMJ-W6K2
Endpoint:  http://localhost:3000/account/SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2
Proof:     414C4C5F594F55525F424153455F4152455F42454C4F4E475F544F5F5553 (ALL_YOUR_BASE_ARE_BELONG_TO_US)
Secret:    53911BA20016A8C927EEDC50E456E76F2F84C5BEABACB9ADF224E23B964D8573

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/366C702BCD42514A9FBD63DE8443E562185ED0FC7DFFE57F2432891993296A03
Hash:     366C702BCD42514A9FBD63DE8443E562185ED0FC7DFFE57F2432891993296A03
Signer:   A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0

[UNCONFIRMED] SAFPLK...
{"transaction":{"type":16722,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4081556051,23],"signature":"FA800AF3C510EC842526F1EDB64964010A80F5BCF250237B5623ABB904822BE2DF2FC0FD9F813FE3A4B6E09807EB874B1CA5EF7FE7C8694D01DA0C447434A70E","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","mosaicId":{"lower":3294802500,"higher":2243684972},"amount":[2000000,0],"duration":[2304,0],"hashAlgorithm":0,"secret":"53911BA20016A8C927EEDC50E456E76F2F84C5BEABACB9ADF224E23B964D8573","recipient":{"address":"SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2","networkType":144}}}

[CONFIRMED] SAFPLK...
{"transaction":{"type":16722,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4081556051,23],"signature":"FA800AF3C510EC842526F1EDB64964010A80F5BCF250237B5623ABB904822BE2DF2FC0FD9F813FE3A4B6E09807EB874B1CA5EF7FE7C8694D01DA0C447434A70E","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","mosaicId":{"lower":3294802500,"higher":2243684972},"amount":[2000000,0],"duration":[2304,0],"hashAlgorithm":0,"secret":"53911BA20016A8C927EEDC50E456E76F2F84C5BEABACB9ADF224E23B964D8573","recipient":{"address":"SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2","networkType":144}}}

[Secret Recognized]
{"secret": "53911BA20016A8C927EEDC50E456E76F2F84C5BEABACB9ADF224E23B964D8573"}

[Transaction announced]
Endpoint: http://localhost:3000/transaction/DA8F05DE41439A4209187E49030B0914D53047F58DE83FB56CE9818CB66C007F
Hash:     DA8F05DE41439A4209187E49030B0914D53047F58DE83FB56CE9818CB66C007F
Signer:   A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0

[Proof Recognized]
{"proof": "414C4C5F594F55525F424153455F4152455F42454C4F4E475F544F5F5553"}
```

結果だけではわかりにくいかもしれないので`[Secret Recognized]`が表示されたときの宛先アカウントの残高と`[Proof Recognized]`が表示されたときの残高を見比べてみてください。


### コード解説

```javascript
// 入力値がない場合は10byteのランダムな値を用意します
const input = process.argv[3] || crypto.randomBytes(10).toString('hex');
// proofを16進数文字列へ変換します
const proof = Convert.utf8ToHex(input).toUpperCase()
// secretを生成します(SHA3-256アルゴリズムを使用)
const secret = sha3_256(input).toUpperCase()
```

`proof`は10byteから100byteまでの値を使用します。

任意の文字列(日本語などUTF-8文字列)を扱うために16進数に変換した値を使用ています。

ここで`secret`は`proof`の値の`SHA3-256`ハッシュ値としました。

仕様可能なアルゴリズムは他にもあるので確認してみてください。

- [クロスチェーンスワップ — NEM Developer Center](https://nemtech.github.io/ja/concepts/cross-chain-swaps.html#lockhashalgorithm)

```javascript
const secretLockTx = SecretLockTransaction.create(
  Deadline.create(),
  NetworkCurrencyMosaic.createRelative(2),
  UInt64.fromUint(96 * 360 / 15),
  HashType.Op_Sha3_256,
  secret,
  recipient,
  NetworkType.MIJIN_TEST
);
```

先に作り出した`secret`を使って`SecretLockTransaction`オブジェクトを作成して発行します。

使用したアルゴリズムも`HashType.Op_Sha3_256`として渡している固定値と一致している必要があります。


```javascript
if(info.type === TransactionType.SECRET_LOCK) {
  const secretProofTx = SecretProofTransaction.create(
    Deadline.create(),
    HashType.Op_Sha3_256,
    info.secret, // トランザクションから得られるsecret
    recipient,
    proof, // 本来は受信者が認知して使用するproof
    NetworkType.MIJIN_TEST
  );
  const signedTx = initiater.sign(secretProofTx, process.env.GENERATION_HASH);
  util.announce(url, signedTx);
}
```

承認された`SecretLockTransaction`から`secret`を手に入れることが出来ます。

今回は自分でロックして、自分でアンロックする形になっています。

異なるチェーン間でスワップするのあれば、受信者がこの値を使って別のチェーンで`SecretLockTransaction`を発行します。
