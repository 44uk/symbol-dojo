# クロスチェーンスワップ

シークレットロックトランザクションとシークレットプルーフトランザクションを用いることで、他チェーンとの間で安全にモザイクや暗号通貨を交換することができます。

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

クロスチェーンスワップを実現できていませんが、この挙動は前述の理屈のとおり、クロスチェーンスワップに応用することができます。

ここではシークレットロック/スワップトランザクションの機能についての実演です。

このスクリプトは第一引数の宛先アドレスを、第二引数にシークレットを受け取ります。

プルーフは**10byteから100byte**の長さを指定します。

半角文字で10文字程度入力してください。渡さなかった場合はランダムな値が使用されます。

```shell
$ node secretlock/lock_and_proof.js SC3AWBHBY2ABQHQY3QAJLO4HXSJ6IZVAYLN52HO4 ALL_YOUR_BASE_ARE_BELONG_TO_US
Initiater: SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
Endpoint:  http://localhost:3000/account/SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5
Recipient: SC3AWB-HBY2AB-QHQY3Q-AJLO4H-XSJ6IZ-VAYLN5-2HO4
Endpoint:  http://localhost:3000/account/SC3AWBHBY2ABQHQY3QAJLO4HXSJ6IZVAYLN52HO4
Proof:     414C4C5F594F55525F424153455F4152455F42454C4F4E475F544F5F5553 (ALL_YOUR_BASE_ARE_BELONG_TO_US)
Secret:    53911BA20016A8C927EEDC50E456E76F2F84C5BEABACB9ADF224E23B964D8573

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/E16871D99A96965EEA864AAE06EEEED7E0A657319F9648265EBFD66B4A5D68A3
Hash:     E16871D99A96965EEA864AAE06EEEED7E0A657319F9648265EBFD66B4A5D68A3
Signer:   64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0

[UNCONFIRMED] SCGUWZ...
{"type":16722,"networkType":144,"version":1,"deadline":{"value":"2019-03-24T11:39:07.260"},"fee":{"lower":0,"higher":0},"signature":"B2D765A54C2A3186275FBA528FE3A9A2910CF84B66F141892F8ED0C77574C3F2B40D62ADF70E8C93C399C3894909C3D14783FD202F103BCDDED03EE407EDE20A","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"E16871D99A96965EEA864AAE06EEEED7E0A657319F9648265EBFD66B4A5D68A3","merkleComponentHash":"E16871D99A96965EEA864AAE06EEEED7E0A657319F9648265EBFD66B4A5D68A3"},"mosaic":{"id":{"id":{"lower":3294802500,"higher":2243684972}},"amount":{"lower":2000000,"higher":0}},"duration":{"lower":2,"higher":0},"hashType":0,"secret":"53911BA20016A8C927EEDC50E456E76F2F84C5BEABACB9ADF224E23B964D8573","recipient":{"address":"SC3AWBHBY2ABQHQY3QAJLO4HXSJ6IZVAYLN52HO4","networkType":144}}

[CONFIRMED] SCGUWZ...
{"type":16722,"networkType":144,"version":1,"deadline":{"value":"2019-03-24T11:39:07.260"},"fee":{"lower":0,"higher":0},"signature":"B2D765A54C2A3186275FBA528FE3A9A2910CF84B66F141892F8ED0C77574C3F2B40D62ADF70E8C93C399C3894909C3D14783FD202F103BCDDED03EE407EDE20A","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":7195,"higher":0},"hash":"E16871D99A96965EEA864AAE06EEEED7E0A657319F9648265EBFD66B4A5D68A3","merkleComponentHash":"E16871D99A96965EEA864AAE06EEEED7E0A657319F9648265EBFD66B4A5D68A3"},"mosaic":{"id":{"id":{"lower":3294802500,"higher":2243684972}},"amount":{"lower":2000000,"higher":0}},"duration":{"lower":2,"higher":0},"hashType":0,"secret":"53911BA20016A8C927EEDC50E456E76F2F84C5BEABACB9ADF224E23B964D8573","recipient":{"address":"SC3AWBHBY2ABQHQY3QAJLO4HXSJ6IZVAYLN52HO4","networkType":144}}

[Secret Recognized]
{"secret": "53911BA20016A8C927EEDC50E456E76F2F84C5BEABACB9ADF224E23B964D8573"}

[Transaction announced]
Endpoint: http://localhost:3000/transaction/872889BA38256158B573F17AE7637D4527A9A80B2AA50303C92C97D27FD34E4D
Hash:     872889BA38256158B573F17AE7637D4527A9A80B2AA50303C92C97D27FD34E4D
Signer:   64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0

[UNCONFIRMED] SCGUWZ...
{"type":16978,"networkType":144,"version":1,"deadline":{"value":"2019-03-24T11:39:34.682"},"fee":{"lower":0,"higher":0},"signature":"9FB58D06C74D57783063659F095643B53AB045D207D331BA225EFB07D2EC6DCB3321FC4317C40A3E6A78A93FB9817056BBC225F80834285EDC28E3E764E38703","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"872889BA38256158B573F17AE7637D4527A9A80B2AA50303C92C97D27FD34E4D","merkleComponentHash":"872889BA38256158B573F17AE7637D4527A9A80B2AA50303C92C97D27FD34E4D"},"hashType":0,"secret":"53911BA20016A8C927EEDC50E456E76F2F84C5BEABACB9ADF224E23B964D8573","proof":"414C4C5F594F55525F424153455F4152455F42454C4F4E475F544F5F5553"}

[CONFIRMED] SCGUWZ...
{"type":16978,"networkType":144,"version":1,"deadline":{"value":"2019-03-24T11:39:34.682"},"fee":{"lower":0,"higher":0},"signature":"9FB58D06C74D57783063659F095643B53AB045D207D331BA225EFB07D2EC6DCB3321FC4317C40A3E6A78A93FB9817056BBC225F80834285EDC28E3E764E38703","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":7196,"higher":0},"hash":"872889BA38256158B573F17AE7637D4527A9A80B2AA50303C92C97D27FD34E4D","merkleComponentHash":"872889BA38256158B573F17AE7637D4527A9A80B2AA50303C92C97D27FD34E4D"},"hashType":0,"secret":"53911BA20016A8C927EEDC50E456E76F2F84C5BEABACB9ADF224E23B964D8573","proof":"414C4C5F594F55525F424153455F4152455F42454C4F4E475F544F5F5553"}

[Proof Recognized]
{"proof": "414C4C5F594F55525F424153455F4152455F42454C4F4E475F544F5F5553"}
```

結果だけではわかりにくいかもしれないので`[Secret Recognized]`が表示されたときの宛先アカウントの残高と`[Proof Recognized]`が表示されたときの残高を見比べてみてください。


### コード解説

```javascript
// 入力値がない場合は10byteのランダムな値を用意します
const input = process.argv[3] || crypto.randomBytes(10).toString('hex');
// proofを16進数文字列へ変換します
const proof = convert.utf8ToHex(input).toUpperCase()
// secretを生成します(SHA3-256アルゴリズムを使用)
const secret = sha3_256(input).toUpperCase()
```

`proof`は10byteから100byteまでの値を使用します。

任意の文字列(日本語などUTF-8文字列)を扱うために16進数に変換した値を使用ています。

ここで`secret`は`proof`の値の`SHA3-256`ハッシュ値としました。

仕様可能なアルゴリズムは他にもあるので確認してみてください。

- [クロスチェーンスワップ — NEM Developer Center](https://nemtech.github.io/ja/concepts/cross-chain-swaps.html#lockhashalgorithm)

```javascript
const secretLockTx = nem.SecretLockTransaction.create(
  nem.Deadline.create(),
  nem.NetworkCurrencyMosaic.createRelative(2),
  nem.UInt64.fromUint(2),
  nem.HashType.Op_Sha3_256,
  secret,
  recipient,
  nem.NetworkType.MIJIN_TEST
);
```

先に作り出した`secret`を使って`SecretLockTransaction`オブジェクトを作成して発行します。

使用したアルゴリズムも`HashType.Op_Sha3_256`として渡している固定値と一致している必要があります。


```javascript
if(info.type === nem.TransactionType.SECRET_LOCK) {
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
```

承認された`SecretLockTransaction`から`secret`を手に入れることが出来ます。

クロスチェーンスワップであれば受信者がこの値を使って、別のチェーンで`SecretLockTransaction`を発行します。
