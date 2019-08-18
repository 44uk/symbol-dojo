# トランザクションの発行

`nem2-sdk`を使いJavaScriptコードを用いて`nem`の転送トランザクションを発信してみましょう。

今回のコードにはモニタリングをする処理も入れてあるので、トランザクションの発信後にモニタリングが始まります。

コードの実行中に問題があるようならば、補足で`nem2-cli`のモニタリングを活用して問題を発見してみてください。


## 転送トランザクション

コードを実行してモザイクの転送をしてみましょう。

サンプルコードの内容とは異なりますが、参考のためにnem公式が公開している資料のリンクを貼っておきます。

- [転送トランザクション — NEM Developer Center](https://nemtech.github.io/ja/concepts/transfer-transaction.html)


### コードを実行する前に

サンプルコードでは`APIのURL`と`秘密鍵`と`GENERATION_HASH`を環境変数から取得するように書いてあります。

ターミナルで以下のように環境変数をセットしてください。

```shell
export API_URL=http://localhost:3000
export GENERATION_HASH=53F73344A12341618CEE455AC412A0B57D41CEC058965511C0BA016156F4BF47
export PRIVATE_KEY=7EF4AAA5507C7DBDFDD30D52922DF3AC46D2384593FA2E620D19848ED7F60636
```

(なお`API_URL`は設定しなかった場合、スクリプト内で`http://localhost:3000`がセットされるので、ローカル環境を使用するのであれば不要です)

`GENERATION_HASH`は`http://localhost:3000/block/1`にアクセスすることで表示される`generationHash`の値を使用してください。

```shell
# curlでGENERATION_HASHだけを取得する例
$ curl -s http://localhost:3000/block/1 | grep -oE '"generationHash":"[0-9A-Z]{64}"' | sed 's/"//g' | sed 's/generationHash://'
53F73344A12341618CEE455AC412A0B57D41CEC058965511C0BA016156F4BF47
```

`PRIVATE_KEY`には`alice`の鍵を指定してください。鍵を確認する場合は`profile list`で表示できます。

```shell
$ nem2-cli profile list
alice->
	Network:	MIJIN_TEST
	Url:		http://localhost:3000
	Address:	SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5
	PublicKey:	64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0
	PrivateKey:	25E7E5A21DD0C863B3CC3767C5CC6C081A7C7795BA4115231C74F491A97D6ED7
```

以降、サンプルコードでは`alice`の秘密鍵がトランザクションの発信に使用されます。

これらの変数がセットされている前提でサンプルコードを実行していきます。


### コード実行

`transfer/create_mosaic_transfer.js`を実行してみましょう。

このスクリプトは引数に宛先アドレスとモザイク(`cat.currency`の相対量)を指定します。

ここでは`bob`のアドレスへ送ってみます。

```shell
$ node transfer/create_mosaic_transfer.js SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2 10
initiator: SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
Endpoint:  http://localhost:3000/account/SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4
Recipient: SCJ3XM-WIITJT-5DIFZY-KQ27VD-IYYKAV-XIAAMJ-W6K2
Endpoint:  http://localhost:3000/account/SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/E875E81E0578D5697B2512E8F59C3591A53C6CFE6109AA90DEA00C2D51657212
Hash:     E875E81E0578D5697B2512E8F59C3591A53C6CFE6109AA90DEA00C2D51657212
Signer:   A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0

[UNCONFIRMED] SAFPLK...
{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4133686008,23],"signature":"2A596DEFDF44F4C4FD171686EFE7BFA60A8FFE53067A70E48B5C53F58A2935E91303E05E6824AFDDB1461E6CCB764E879C03F64FBAC68D625F6CCF62A4E4CC0D","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","recipient":{"address":"SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2","networkType":144},"mosaics":[{"amount":[10000000,0],"id":[3294802500,2243684972]}],"message":{"type":0,"payload":"Ticket fee"}}}

[CONFIRMED] SAFPLK...
{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4133686008,23],"signature":"2A596DEFDF44F4C4FD171686EFE7BFA60A8FFE53067A70E48B5C53F58A2935E91303E05E6824AFDDB1461E6CCB764E879C03F64FBAC68D625F6CCF62A4E4CC0D","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","recipient":{"address":"SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2","networkType":144},"mosaics":[{"amount":[10000000,0],"id":[3294802500,2243684972]}],"message":{"type":0,"payload":"Ticket fee"}}}
```

このような出力になるはずです。

`[Unconfirmed]`と`[Confirmed]`の出力はネットワークが未承認トランザクションとして認知されたときとトランザクションが承認されたときに表示されます。

承認されたら`bob`の残高を確認してみましょう。

```shell
$ nem2-cli account info --profile bob
Account:	SCJ3XM-WIITJT-5DIFZY-KQ27VD-IYYKAV-XIAAMJ-W6K2
-------------------------------------------------------

Address:	SCJ3XM-WIITJT-5DIFZY-KQ27VD-IYYKAV-XIAAMJ-W6K2
at height:	382

PublicKey:	0000000000000000000000000000000000000000000000000000000000000000
at height:	0

Importance:	0
at height:	0

Mosaics
3f859f237d36c3ae:	20
```


### コード解説

後に使用するサンプルコードと共通する部分が多いので詳細にコードを解説していきます。

```javascript
const {
  Account,
  Address,
  NetworkCurrencyMosaic,
  PlainMessage,
  TransferTransaction,
  Deadline,
  NetworkType
} = require('nem2-sdk');
const util = require('../util');
```

`nem2-sdk`内の各クラスをインポートしています。

この部分はコード内で仕様されるクラスによってインポートするものが異なります。

`util`は共通する発信処理やモニタリング処理をまとめたもので、詳細は後述しています。

```javascript
const url = process.env.API_URL || 'http://localhost:3000';
// 秘密鍵からアカウントオブジェクトを作る
const initiater = Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  NetworkType.MIJIN_TEST
);
```

`process.env`より秘密鍵とAPIのURLを取得してきます。

`Account.createFromPrivateKey`でアカウントのオブジェクトを生成しています。

アカウントオブジェクトは対になる公開鍵やアドレスの情報などを持ち、署名のメソッドも持ちます。

```javascript
// アドレス文字列からアドレスオブジェクトを作る
const recipient = Address.createFromRawAddress(process.argv[2]);
const amount = parseInt(process.argv[3]);
```

`Address.createFromRawAddress`にアドレス文字列を渡すことでアドレスオブジェクトを生成しています。

SDKでアドレスを扱う場合は、アドレス文字列をオブジェクトでラップした形で使用します。

```javascript
// 確認用の情報を出力
console.log('Initiater: %s', initiater.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiater.address.plain());
console.log('Recipient: %s', recipient.pretty());
console.log('Endpoint:  %s/account/%s', url, recipient.plain());
console.log('');
```

ここでは確認用に情報を出力しています。

APIのリソースURLも出しているので、ブラウザで開けば内容を確認することができます。

```javascript
// 送信するモザイク配列
// ここでは`NetworkCurrencyMosaic`すなわち`cat.currency`モザイクオブジェクトを準備
// モザイクIDで作る場合は以下のようにする。
// 可分性がわからないので送信量は絶対値で指定する必要がある。
// new Mosaic(new MosaicId('7d09bf306c0b2e38'), UInt64.fromUint(absoluteAmount)
const mosaics = [NetworkCurrencyMosaic.createRelative(amount)];
```

転送したいモザイクの配列を作成しています。

配列には`NetworkCurrencyMosaic`だけを入れています。

複数のモザイクを送りたい場合は配列にモザイク定義を入れることでまとめて送ることができます。

`NetworkCurrencyMosaic`とは基軸通貨である`cat.currency`を指します。

`createRelative`メソッドは可分性`6`を考慮してくれます。

特定のモザイクを16進数のモザイクIDで送信する場合はコメントにあるコードを使います。

こちらの場合は可分性の情報が無いため、絶対値で指定する必要があります。

```javascript
// メッセージオブジェクトを作成
// 空メッセージを送る場合は EmptyMessage を使います。
const message = PlainMessage.create('Ticket fee');
```

メッセージもオブジェクトでラップします。

空メッセージを送りたい場合は`EmptyMessage`を使います。

このオブジェクトの実装を覗いてみると、空文字を渡した`PlainMessage`です。

実装上問題がなければオブジェクトを使い分けずに、空文字を渡しても結果は同じです。

- [nem2\-sdk\-typescript\-javascript/PlainMessage\.ts at v0\.13\.0 · nemtech/nem2\-sdk\-typescript\-javascript](https://github.com/nemtech/nem2-sdk-typescript-javascript/blob/v0.13.0/src/model/transaction/PlainMessage.ts#L53)

```javascript
// トランザクションオブジェクトを作成
// Deadline.create() デフォルトでは2時間。引数の単位は`時間`です。(第二引数で単位を変えられる)
// SDKでは最大24時間未満とされているので、`24`を渡すとエラーになります。
// Deadline.create(1439, jsJoda.ChronoUnit.MINUTES) // ex) 23時間59分
const transferTx = TransferTransaction.create(
  Deadline.create(23),
  recipient,
  mosaics,
  message,
  NetworkType.MIJIN_TEST
);
```

ここまでのオブジェクトを元に、トランザクションのオブジェクトを作成します。

`Deadline.create(23)`はトランザクションが署名されてからの有効な期限を示します。

設定可能な範囲は24時間未満の未来までで、引数が無い場合はデフォルトで**2時間**がセットされます。

- [nem2\-sdk\-typescript\-javascript/Deadline\.ts at v0\.13\.0 · nemtech/nem2\-sdk\-typescript\-javascript](https://github.com/nemtech/nem2-sdk-typescript-javascript/blob/v0.13.0/src/model/transaction/Deadline.ts#L42)

またコメント部に記述しましたが、`js-joda`の時間単位を一緒に渡すことでより細かい単位の時間を設定できます。


```javascript
// トランザクション成功/失敗,未承認,承認のモニタリング接続
util.listener(url, initiater.address, {
  onOpen: () => {
    // 署名して発信
    const signedTx = initiater.sign(transferTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
```

モニタリングを開始し、接続が完了して待機状態になったらトランザクションに署名をして、発信しています。

トランザクション署名時に発信したいネットワークのネメシスブロックの`generationHash`の値を渡す必要があります。

トランザクションの未承認・承認のタイミングで通知が表示され、承認されたら終了します。


### util.jsの解説

`util.js`の中身も解説しておきます。

主にトランザクションの発信やリスナーの監視の実装をまとめたものです。

```javascript
const {
  Listener,
  TransactionHttp,
} = require('nem2-sdk');

exports.listener = (url, address, hooks = {}) => {
  const excerptAddress = address.plain().slice(0,6);
  const nextObserver = (label, hook) => info => {
    console.log('[%s] %s...\n%s\n', label, excerptAddress, JSON.stringify(info));
    typeof hook === 'function' && hook(info);
  };
  const errorObserver = err => console.error(err);
  // リスナーオブジェクトを用意
  const listener = new Listener(url);
```

アカウントのステータスをモニタリングするにはリスナーオブジェクトを作ります。

APIのURLを渡してオブジェクトを作成します。


```javascript
  // リスナーを開いて接続を試みる
  listener.open().then(() => {
    hooks.onOpen && hooks.onOpen();
    // 接続されたら各アクションの監視を定義
    listener
      .status(address)
      .subscribe(nextObserver('STATUS', hooks.onStatus), errorObserver);
    listener
      .unconfirmedAdded(address)
      .subscribe(
        nextObserver('UNCONFIRMED', hooks.onUnconfirmed),
        errorObserver
      );
    listener
      .confirmed(address)
      .subscribe(nextObserver('CONFIRMED', hooks.onConfirmed), errorObserver);
    listener
      .aggregateBondedAdded(address)
      .subscribe(nextObserver('AGGREGATE_BONDED_ADDED', hooks.onAggregateBondedAdded), errorObserver);
    listener
      .cosignatureAdded(address)
      .subscribe(nextObserver('COSIGNATURE_ADDED', hooks.onCosignatureAdded), errorObserver);
  });
  return listener;
};
```

アドレスを渡して作成した`listener`には各イベントを購読するためのメソッドがあります。

`subscribe`によってその購読が開始されます。

これは`RxJS`によるもので、要点だけ説明すると、`subscribe`メソッドを呼ぶことではじめてその処理が開始されます。


```javascript
// 以下は発信時に呼び出す`transactionHttp`のメソッドが異なるだけです。
exports.announce = (url, tx, ...subscriber) => {
  const transactionHttp = new TransactionHttp(url)
  const subscription = transactionHttp.announce(tx)
  announceUtil(subscription, url, tx, ...subscriber)
}

exports.announceAggregateBonded = (url, tx, ...subscriber) => {
  const transactionHttp = new TransactionHttp(url)
  const subscription = transactionHttp.announceAggregateBonded(tx)
  announceUtil(subscription, url, tx, subscriber)
}

exports.announceAggregateBondedCosignature = (url, tx, ...subscriber) => {
  const transactionHttp = new TransactionHttp(url)
  const subscription = transactionHttp.announceAggregateBondedCosignature(tx)
  announceUtil(subscription, url, tx, subscriber)
}
```

トランザクションをリクエストするには`TransactionHttp`のオブジェクトを作成します。

ここでの実装は、呼び出すメソッドを選べるように実装しています。

基本的には`announce****`メソッドに署名済みトランザクションオブジェクトを渡すことで`RxJS`の購読オブジェクトが取得できます。


```javascript
// 発信用の便利関数
const announceUtil = (subscription, url, tx, ...subscriber) => {
  if (0 < subscriber.length && subscriber.length <= 3) {
    return subscription.subscribe(...subscriber);
  }
  // `announce`メソッドに署名済みトランザクションオブジェクトを渡す
  // `subscribe`メソッドで処理が開始される
  return subscription.subscribe(
    () => {
      // 流れてくるレスポンスは常に成功しか返さないので`tx`の情報を出力する。
      console.log('[Transaction announced]');
      console.log('Endpoint: %s/transaction/%s', url, tx.hash);
      console.log('Hash:     %s', tx.hash);
      console.log('Signer:   %s', tx.signer);
      console.log('');
    },
    err => {
      console.log(
        'Error: %s',
        err.response !== undefined ? err.response.text : err
      );
    }
  );
};
```

ここでは渡されてきた購読オブジェクトの購読を開始しています。

`subscribe`メソッドによってリクエストが開始され、成功したら`tx`オブジェクトの内容を出力しています。

これが基本的なトランザクションオブジェクトの作成と発信です。

他のトランザクションを実行する場合も作成するオブジェクトが異なるくらいで大枠は同じです。

`nem2-sdk`は`RxJS`を使用しています。より複雑に使いこなすには`RxJS`の学習が必要です。

`RxJS`については別途公式サイトなどを確認してください。

- [ReactiveX/rxjs: A reactive programming library for JavaScript](https://github.com/ReactiveX/rxjs)


## アグリゲートトランザクション

アグリゲートトランザクションとは、複数のトランザクションを束ねてひとつのトランザクションとして発信する機能です。

- [アグリゲートトランザクション — NEM Developer Center](https://nemtech.github.io/ja/concepts/aggregate-transaction.html)

束ねたトランザクションすべてが承認されるか、すべて承認されないかという原始性を実現します。

内包するトランザクションに一つでもエラーが含まれる場合はいずれのトランザクションも承認されずに破棄されます。

DBMSにおける「トランザクション」と同じような概念です。

内包されたトランザクションの署名が揃っているかどうかで、アグリゲートトランザクションは2種類に分類されます。


### アグリゲート「コンプリート」

`Aggregate Complete` は内包されたトランザクションの署名が全て揃った状態のアグリゲートトランザクションです。

- [アグリゲートトランザクション — NEM Developer Center](https://nemtech.github.io/ja/concepts/aggregate-transaction.html#aggregate-complete)

署名するひとだけでトランザクションが完結する場合は`Aggregate Complete`となります。

たとえば、

- 複数のアカウントへ同時にトランザクションを送りたい
- 多層のネームスペースを一度のトランザクションで取得したい
- ネームスペース取得とモザイクの作成までを一度で済ませたい
- マルチシグの連署者の追加・削除を同時に行いたい
- 複数のマルチシグ署名を同時に署名したい
- ひとつのトランザクションに複数のメッセージを保存したい

などの用途が考えられます。


### アグリゲート「ボンド」

`Aggregate Bonded`は内包されたトランザクションに署名を要求するトランザクションが含まれているアグリゲートトランザクションです。

- [アグリゲートトランザクション — NEM Developer Center](https://nemtech.github.io/ja/concepts/aggregate-transaction.html#aggregate-bonded)

別のアカウントが署名する必要のあるトランザクションを含む場合は`Aggregate Bonded`となります。

アグリゲートボンドを発行する前に`LockFundsTransaction`を発行し、担保として`10 cat.currency`をネットワーク上に預け入れる必要がある。

この`10 cat.currency`は署名が完了し、アグリゲートトランザクションが受理された場合に、発行したアカウントへ戻ってきます。

トランザクションの期限が切れると`10 cat.currency`は、期限が切れる時のブロックをハーベストしたアカウントへのハーベスト報酬となり戻ってきません。

こちらは、

- 相手のアカウントにモザイクの送信を要求したい
- 手数料分のモザイクを渡し、それを使ってモザイクを送信したい
- 複数の関係者間で順次行われるトランザクションの流れを定義したい
- マルチシグ連署者に署名を求めるトランザクションを発信したい
- マルチシグ連署者としてアカウントを加える場合に使用する

などの用途が考えられます。


### LockFundTransactionについて

これは他のアカウントへむやみに署名の要求を送らないための、ネットワークに対しての保証モザイクのようなものです。

- [アグリゲートトランザクション — NEM Developer Center](https://nemtech.github.io/ja/concepts/aggregate-transaction.html#hash-lock-transaction)

この保証モザイクはアグリゲートトランザクションが承認されるとアカウントに戻ってきます。

承認されなかった(つまり関係者の署名が揃わなかった、否決された)場合はハーベスト報酬となり戻ってきません。


## 一括転送トランザクション(アグリゲートコンプリート)

`transfer/create_transfers_atomically.js`を実行してみましょう。

このコードは便宜上、実行時に生成した3つのアカウントへ同時にモザイクを送信します。

引数に各アカウントへ送る`cat.currency`モザイクを相対量で指定します。

生成したアカウントはコンソールに出力されるだけなので、必要があれば保存してください。

```shell
$ node transfer/create_transfers_atomically.js 10
initiator: SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
Endpoint:  http://localhost:3000/account/SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4

- account1 ----------------------------------------------------------------
Private:  53762A5736B976D29A910284C436ACC8A877C5220296BD622BE4D908A6470A37
Public:   27CBA8BA36B2005377C17FF53FFF2B34A01C102DE5728CDF7AE95BB113524D60
Address:  SBDQMO-E6PGO2-VB7COT-4VM6O7-WUTZNH-VW7UIY-PH57
Endpoint: http://localhost:3000/account/SBDQMOE6PGO2VB7COT4VM6O7WUTZNHVW7UIYPH57
- account2 ----------------------------------------------------------------
Private:  8BC180F3E981B327DC7C6ACF1D9F6632B684579B8DBE01C11E325B71DCD130E7
Public:   BEAC333A15129DE3891D19DABBE51AD902D6DBC4AA37C5E5B04D92B1DABDBF24
Address:  SBM7MY-QPWA24-2NPI5C-2L6RR6-PK2D6R-DF42SF-UDBU
Endpoint: http://localhost:3000/account/SBM7MYQPWA242NPI5C2L6RR6PK2D6RDF42SFUDBU
- account3 ----------------------------------------------------------------
Private:  5751186B0FCFACC9004C1A51881251CC71AC0FBCC4FC9A4B24313E8CD2CD18CD
Public:   AAFFF4695562E17190FF8DFC0B52513450AE0B1FCFAC627BD0B05A2A2B4CE115
Address:  SBAZUS-PXMG55-H5YVS7-SXMXXT-MVVUIP-OMSOWE-U2XH
Endpoint: http://localhost:3000/account/SBAZUSPXMG55H5YVS7SXMXXTMVVUIPOMSOWEU2XH

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/3E53164B56AEE04F286D25BF85CD5E13E0205A36299A0798FF900263FBCB6940
Hash:     3E53164B56AEE04F286D25BF85CD5E13E0205A36299A0798FF900263FBCB6940
Signer:   A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0

[UNCONFIRMED] SAFPLK...
{"transaction":{"type":16705,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058504364,23],"signature":"504E6736A7284A182DFDC5F718D5BA85E34477DC65C7468B217F5A9F346A054DA0040DCC1F06F9AC5335CA6372163BFD33F9693358B8E9C6E36D5AEA4806AB0D","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","transactions":[{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058504364,23],"signature":"504E6736A7284A182DFDC5F718D5BA85E34477DC65C7468B217F5A9F346A054DA0040DCC1F06F9AC5335CA6372163BFD33F9693358B8E9C6E36D5AEA4806AB0D","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","recipient":{"address":"SBDQMOE6PGO2VB7COT4VM6O7WUTZNHVW7UIYPH57","networkType":144},"mosaics":[{"amount":[10000000,0],"id":[3294802500,2243684972]}],"message":{"type":0,"payload":"Tip for you"}}},{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058504364,23],"signature":"504E6736A7284A182DFDC5F718D5BA85E34477DC65C7468B217F5A9F346A054DA0040DCC1F06F9AC5335CA6372163BFD33F9693358B8E9C6E36D5AEA4806AB0D","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","recipient":{"address":"SBM7MYQPWA242NPI5C2L6RR6PK2D6RDF42SFUDBU","networkType":144},"mosaics":[{"amount":[10000000,0],"id":[3294802500,2243684972]}],"message":{"type":0,"payload":"Tip for you"}}},{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058504364,23],"signature":"504E6736A7284A182DFDC5F718D5BA85E34477DC65C7468B217F5A9F346A054DA0040DCC1F06F9AC5335CA6372163BFD33F9693358B8E9C6E36D5AEA4806AB0D","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","recipient":{"address":"SBAZUSPXMG55H5YVS7SXMXXTMVVUIPOMSOWEU2XH","networkType":144},"mosaics":[{"amount":[10000000,0],"id":[3294802500,2243684972]}],"message":{"type":0,"payload":"Tip for you"}}}],"cosignatures":[]}}

[CONFIRMED] SAFPLK...
{"transaction":{"type":16705,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058504364,23],"signature":"504E6736A7284A182DFDC5F718D5BA85E34477DC65C7468B217F5A9F346A054DA0040DCC1F06F9AC5335CA6372163BFD33F9693358B8E9C6E36D5AEA4806AB0D","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","transactions":[{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058504364,23],"signature":"504E6736A7284A182DFDC5F718D5BA85E34477DC65C7468B217F5A9F346A054DA0040DCC1F06F9AC5335CA6372163BFD33F9693358B8E9C6E36D5AEA4806AB0D","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","recipient":{"address":"SBDQMOE6PGO2VB7COT4VM6O7WUTZNHVW7UIYPH57","networkType":144},"mosaics":[{"amount":[10000000,0],"id":[3294802500,2243684972]}],"message":{"type":0,"payload":"Tip for you"}}},{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058504364,23],"signature":"504E6736A7284A182DFDC5F718D5BA85E34477DC65C7468B217F5A9F346A054DA0040DCC1F06F9AC5335CA6372163BFD33F9693358B8E9C6E36D5AEA4806AB0D","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","recipient":{"address":"SBM7MYQPWA242NPI5C2L6RR6PK2D6RDF42SFUDBU","networkType":144},"mosaics":[{"amount":[10000000,0],"id":[3294802500,2243684972]}],"message":{"type":0,"payload":"Tip for you"}}},{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058504364,23],"signature":"504E6736A7284A182DFDC5F718D5BA85E34477DC65C7468B217F5A9F346A054DA0040DCC1F06F9AC5335CA6372163BFD33F9693358B8E9C6E36D5AEA4806AB0D","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","recipient":{"address":"SBAZUSPXMG55H5YVS7SXMXXTMVVUIPOMSOWEU2XH","networkType":144},"mosaics":[{"amount":[10000000,0],"id":[3294802500,2243684972]}],"message":{"type":0,"payload":"Tip for you"}}}],"cosignatures":[]}}
```

承認されたら生成されたアカウントの残高を確認してみましょう。

表示されたアカウントのURLを開くか、`nem2-cli`の`-a`オプションにアドレスを渡すことで確認できます。

```shell
$ nem2-cli account info -a SBDQMO-E6PGO2-VB7COT-4VM6O7-WUTZNH-VW7UIY-PH57 --profile alice
Account:        SBDQMO-E6PGO2-VB7COT-4VM6O7-WUTZNH-VW7UIY-PH57
-------------------------------------------------------

Address:        SBDQMO-E6PGO2-VB7COT-4VM6O7-WUTZNH-VW7UIY-PH57
at height:      513

PublicKey:      0000000000000000000000000000000000000000000000000000000000000000
at height:      0

Importance:     0
at height:      0

Mosaics
3f859f237d36c3ae:       10
```

モザイクは届いているようですが、結果だけ確認すると3人それぞれに一回づつ送ったのか、集約されていたのかわかりません。

トランザクションハッシュを指定して、承認されたトランザクションを確認してみましょう。

コンソールに表示されたURLにアクセスするか、`nem2-cli`の`-h`オプションで確認してみましょう。

```shell
$ nem2-cli transaction info -h 3E53164B56AEE04F286D25BF85CD5E13E0205A36299A0798FF900263FBCB6940 --profile alice

AggregateTransaction:  InnerTransactions: [ TransferTransaction: Recipient:SBDQMO-E6PGO2-VB7COT-4VM6O7-WUTZNH-VW7UIY-PH57 Message:"Tip for you" Mosaics: NamespaceId:85bbea6cc462b244::10000000 Signer:SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4 Deadline:2019-07-05 TransferTransaction: Recipient:SBM7MY-QPWA24-2NPI5C-2L6RR6-PK2D6R-DF42SF-UDBU Message:"Tip for you" Mosaics: NamespaceId:85bbea6cc462b244::10000000 Signer:SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4 Deadline:2019-07-05 TransferTransaction: Recipient:SBAZUS-PXMG55-H5YVS7-SXMXXT-MVVUIP-OMSOWE-U2XH Message:"Tip for you" Mosaics: NamespaceId:85bbea6cc462b244::10000000 Signer:SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4 Deadline:2019-07-05 ] Signer:SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4 Deadline:2019-07-05 Hash:3E53164B56AEE04F286D25BF85CD5E13E0205A36299A0798FF900263FBCB6940
```

`InnerTransactions`に3つの宛先への転送トランザクションが入っていました。

このコードでは同じ量と同じメッセージを送っていますが、もちろん個別に変えることもできます。


### コード解説

```javascript
const txes = recipients.map(account => {
  return TransferTransaction.create(
    Deadline.create(),
    account.address,
    mosaics,
    message,
    NetworkType.MIJIN_TEST
  );
});

const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  txes.map(tx => tx.toAggregate(initiater.publicAccount)),
  NetworkType.MIJIN_TEST,
  []
);
```

`TransferTransaction`オブジェクトを作るところは転送と同じです。

各トランザクションオブジェクトに署名者の公開アカウントオブジェクトを渡して`toAggregate`メソッドを呼びます。

その配列を`AggregateTransaction.createComplete`に渡して、アグリゲートトランザクションオブジェクトを作ります。

このオブジェクトに署名を行って発行します。


## 転送要求トランザクション(アグリゲートボンド)

`transfer/create_pullfunds.js`を実行してください。

このコードは`alice`が`10 cat.currency`の支払いの請求を行い、請求を受取った`bob`はそれを支払うシーンです。

メッセージの内容を確認した`alice`が署名をすることで、アグリゲートトランザクションが承認されます。

このコードでは`bob`も署名する必要があるので、引数に`bob`の秘密鍵を渡します。

アグリゲートボンドの作成から署名し承認されるまでの流れをひとつのスクリプト内で行っており、

現実的な仕組みのコードではないですが、トランザクションや署名タイミングの流れを掴んでください。

```shell
$ node transfer/create_pullfunds.js 72524C849DF216E0FE96A5011B1329107993D9DE39D0574835CB47511253AD61
initiator: SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
Endpoint:  http://localhost:3000/account/SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4
Debtor:    SCJ3XM-WIITJT-5DIFZY-KQ27VD-IYYKAV-XIAAMJ-W6K2
Endpoint:  http://localhost:3000/account/SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2

connection open
connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/9634434AD9777C3C54C4C4BCF4F5B1E52A74F0013F3B91CE11F11B96D1359A4D
Hash:     9634434AD9777C3C54C4C4BCF4F5B1E52A74F0013F3B91CE11F11B96D1359A4D
Signer:   A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0

[UNCONFIRMED] SAFPLK...
{"transaction":{"type":16712,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699524,23],"signature":"CACABB0EE2173C14EEC9C9B3BDBA6F2B5CC89002D526D63D80C2B68B73847AF45889E7996BAEFE6CDF15A4BB9EA8419D48F5921E54B5DD414C835222E8D5A504","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","mosaicId":{"lower":2100741038,"higher":1065721635},"amount":[10000000,0],"duration":[480,0],"hash":"5D48B2362FD2857B74E891B390E28BEC2934C98AB5E84385C335E0B4364A9017"}}

[CONFIRMED] SAFPLK...
{"transaction":{"type":16712,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699524,23],"signature":"CACABB0EE2173C14EEC9C9B3BDBA6F2B5CC89002D526D63D80C2B68B73847AF45889E7996BAEFE6CDF15A4BB9EA8419D48F5921E54B5DD414C835222E8D5A504","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","mosaicId":{"lower":2100741038,"higher":1065721635},"amount":[10000000,0],"duration":[480,0],"hash":"5D48B2362FD2857B74E891B390E28BEC2934C98AB5E84385C335E0B4364A9017"}}

[LockFund confirmed!]

[Transaction announced]
Endpoint: http://localhost:3000/transaction/5D48B2362FD2857B74E891B390E28BEC2934C98AB5E84385C335E0B4364A9017
Hash:     5D48B2362FD2857B74E891B390E28BEC2934C98AB5E84385C335E0B4364A9017
Signer:   A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0

[AGGREGATE_BONDED_ADDED] SCJ3XM...
{"transaction":{"type":16961,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","transactions":[{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","recipient":{"address":"SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2","networkType":144},"mosaics":[],"message":{"type":0,"payload":"Request for a refund 10 cat.currency"}}},{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"97980E89374802B5A0DD63D32A3897496431486E9DB210B00B43A9B41D08550B","recipient":{"address":"SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4","networkType":144},"mosaics":[{"amount":[10000000,0],"id":[3294802500,2243684972]}],"message":{"type":0,"payload":""}}}],"cosignatures":[]}}

[Aggregate Bonded Added]
Message: PlainMessage { type: 0, payload: 'Request for a refund 10 cat.currency' }
Amount: Mosaic {
  id:
   NamespaceId { id: Id { lower: 3294802500, higher: 2243684972 } },
  amount: UInt64 { lower: 10000000, higher: 0 } }

[AGGREGATE_BONDED_ADDED] SAFPLK...
{"transaction":{"type":16961,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","transactions":[{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","recipient":{"address":"SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2","networkType":144},"mosaics":[],"message":{"type":0,"payload":"Request for a refund 10 cat.currency"}}},{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"97980E89374802B5A0DD63D32A3897496431486E9DB210B00B43A9B41D08550B","recipient":{"address":"SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4","networkType":144},"mosaics":[{"amount":[10000000,0],"id":[3294802500,2243684972]}],"message":{"type":0,"payload":""}}}],"cosignatures":[]}}

[Transaction announced]
Endpoint: http://localhost:3000/transaction/undefined
Hash:     undefined
Signer:   97980E89374802B5A0DD63D32A3897496431486E9DB210B00B43A9B41D08550B

[COSIGNATURE_ADDED] SCJ3XM...
{"parentHash":"5D48B2362FD2857B74E891B390E28BEC2934C98AB5E84385C335E0B4364A9017","signature":"DCA5B8ABEA6A0476D6BF0591CCED2B63F0D89A86E71B5F3E36A30710C7722471BF26645627465DB0A7C129BF662649539635C689ECE4F4BA953176FBDD80F10C","signer":"97980E89374802B5A0DD63D32A3897496431486E9DB210B00B43A9B41D08550B"}

[COSIGNATURE_ADDED] SAFPLK...
{"parentHash":"5D48B2362FD2857B74E891B390E28BEC2934C98AB5E84385C335E0B4364A9017","signature":"DCA5B8ABEA6A0476D6BF0591CCED2B63F0D89A86E71B5F3E36A30710C7722471BF26645627465DB0A7C129BF662649539635C689ECE4F4BA953176FBDD80F10C","signer":"97980E89374802B5A0DD63D32A3897496431486E9DB210B00B43A9B41D08550B"}

[UNCONFIRMED] SCJ3XM...
{"transaction":{"type":16961,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","transactions":[{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","recipient":{"address":"SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2","networkType":144},"mosaics":[],"message":{"type":0,"payload":"Request for a refund 10 cat.currency"}}},{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"97980E89374802B5A0DD63D32A3897496431486E9DB210B00B43A9B41D08550B","recipient":{"address":"SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4","networkType":144},"mosaics":[{"amount":[10000000,0],"id":[3294802500,2243684972]}],"message":{"type":0,"payload":""}}}],"cosignatures":[{"signature":"DCA5B8ABEA6A0476D6BF0591CCED2B63F0D89A86E71B5F3E36A30710C7722471BF26645627465DB0A7C129BF662649539635C689ECE4F4BA953176FBDD80F10C","signer":{"publicKey":"97980E89374802B5A0DD63D32A3897496431486E9DB210B00B43A9B41D08550B","address":{"address":"SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2","networkType":144}}}]}}

[UNCONFIRMED] SAFPLK...
{"transaction":{"type":16961,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","transactions":[{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","recipient":{"address":"SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2","networkType":144},"mosaics":[],"message":{"type":0,"payload":"Request for a refund 10 cat.currency"}}},{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"97980E89374802B5A0DD63D32A3897496431486E9DB210B00B43A9B41D08550B","recipient":{"address":"SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4","networkType":144},"mosaics":[{"amount":[10000000,0],"id":[3294802500,2243684972]}],"message":{"type":0,"payload":""}}}],"cosignatures":[{"signature":"DCA5B8ABEA6A0476D6BF0591CCED2B63F0D89A86E71B5F3E36A30710C7722471BF26645627465DB0A7C129BF662649539635C689ECE4F4BA953176FBDD80F10C","signer":{"publicKey":"97980E89374802B5A0DD63D32A3897496431486E9DB210B00B43A9B41D08550B","address":{"address":"SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2","networkType":144}}}]}}

[CONFIRMED] SCJ3XM...
{"transaction":{"type":16961,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","transactions":[{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","recipient":{"address":"SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2","networkType":144},"mosaics":[],"message":{"type":0,"payload":"Request for a refund 10 cat.currency"}}},{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"97980E89374802B5A0DD63D32A3897496431486E9DB210B00B43A9B41D08550B","recipient":{"address":"SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4","networkType":144},"mosaics":[{"amount":[10000000,0],"id":[3294802500,2243684972]}],"message":{"type":0,"payload":""}}}],"cosignatures":[{"signature":"DCA5B8ABEA6A0476D6BF0591CCED2B63F0D89A86E71B5F3E36A30710C7722471BF26645627465DB0A7C129BF662649539635C689ECE4F4BA953176FBDD80F10C","signer":{"publicKey":"97980E89374802B5A0DD63D32A3897496431486E9DB210B00B43A9B41D08550B","address":{"address":"SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2","networkType":144}}}]}}

[CONFIRMED] SAFPLK...
{"transaction":{"type":16961,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","transactions":[{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0","recipient":{"address":"SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2","networkType":144},"mosaics":[],"message":{"type":0,"payload":"Request for a refund 10 cat.currency"}}},{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[4058699290,23],"signature":"D7608306A6090F0C6CDAB88639CEFE00E4A80427A004180535C590F49092A4E0C62EDD1693DF9936B637F27D9B23BE9F27BFFD93E37D6799B13BA0A4E8FACE0B","signer":"97980E89374802B5A0DD63D32A3897496431486E9DB210B00B43A9B41D08550B","recipient":{"address":"SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4","networkType":144},"mosaics":[{"amount":[10000000,0],"id":[3294802500,2243684972]}],"message":{"type":0,"payload":""}}}],"cosignatures":[{"signature":"DCA5B8ABEA6A0476D6BF0591CCED2B63F0D89A86E71B5F3E36A30710C7722471BF26645627465DB0A7C129BF662649539635C689ECE4F4BA953176FBDD80F10C","signer":{"publicKey":"97980E89374802B5A0DD63D32A3897496431486E9DB210B00B43A9B41D08550B","address":{"address":"SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2","networkType":144}}}]}}
```

`bob`が`alice`へ`10 cat.currency`を送信して残高が減少していることを確認してみてください。

```shell
$ nem2-cli account info --profile bob
Mosaics
3f859f237d36c3ae:	10
```

なお、この動作は`nem2-cli transfer pullfunds`として実装されているので、こちらも試してみてください。

- [プルトランザクションの送信 | トランザクション - クライアント — NEM Developer Center](https://nemtech.github.io/ja/cli.html#transaction)

今回は`alice`からメッセージだけを送りましたが、相手方とモザイクの交換をしたい場合にも同じ操作をすることで、安全に交換することができます。

- [アグリゲートボンドトランザクションを使ったエスクローの作成 — NEM Developer Center](https://nemtech.github.io/ja/guides/transaction/creating-an-escrow-with-aggregate-bonded-transaction.html)


### コード解説

```javascript
const fromInitiaterTx = TransferTransaction.create(
  Deadline.create(),
  debtor.address,
  [],
  PlainMessage.create('Request for a refund 10 cat.currency'),
  NetworkType.MIJIN_TEST
);

const fromDebtorTx = TransferTransaction.create(
  Deadline.create(),
  initiater.address,
  [NetworkCurrencyMosaic.createRelative(10)],
  EmptyMessage,
  NetworkType.MIJIN_TEST
);

const aggregateTx = AggregateTransaction.createBonded(
  Deadline.create(),
  [
    fromInitiaterTx.toAggregate(initiater.publicAccount),
    fromDebtorTx.toAggregate(debtor.publicAccount)
  ],
  NetworkType.MIJIN_TEST
);
const signedTx = initiater.sign(aggregateTx, process.env.GENERATION_HASH);
```

`alice`からは`"Request for a refund 10 cat.currency"`というメッセージを送るトランザクションを作ります。

そして`bob`が`10 cat.currency`を送るモザイク転送トランザクションを作ります。

トランザクション配列はその順序通りに処理されるので、`bob`が`alice`からのメッセージを確認し、モザイクを送るという順序でアグリゲートしています。


```javascript
util.listener(url, initiater.address, {
  onConfirmed: (info) => {
    // LockFundが承認されたらアグリゲートトランザクションを発信
    if(info.type == TransactionType.LOCK) {
      console.log('LockFund confirmed!');
      util.announceAggregateBonded(url, signedTx);
    }
  }
})
```

アグリゲートトランザクションの発信は、ロックトランザクションが承認されてから行います。

```javascript
util.listener(url, debtor.address, {
  onAggregateBondedAdded: (aggregateTx) => {
    // トランザクションの署名要求が届いたらdebtorはそれに署名する
    console.log('[Aggregate Bonded Added]');
    // メッセージの内容とモザイク量について同意して署名する
    const txForInitiator = aggregateTx.innerTransactions[0];
    const txForDebtor = aggregateTx.innerTransactions[1];
    console.log('Message: %o', txForInitiator.message);
    console.log('Amount: %o', txForDebtor.mosaics[0]);
    console.log('');
    const cosignatureTx = CosignatureTransaction.create(aggregateTx);
    const signedCosignature = debtor.signCosignatureTransaction(cosignatureTx);
    util.announceAggregateBondedCosignature(url, signedCosignature);
  }
})
```

アグリゲートトランザクションが承認されたら、`bob`がその内容を確認して署名するという動作をしています。

```javascript
;(async () => {
  // 保証金のような役割であるLockFundTransactionを作成する
  const mosId = await new NamespaceHttp(url)
    .getLinkedMosaicId(new NamespaceId('cat.currency'))
    .toPromise();
  const lockFundMosaic = new Mosaic(mosId, UInt64.fromUint(10000000));
  const lockFundsTx = LockFundsTransaction.create(
    Deadline.create(),
    lockFundMosaic,
    UInt64.fromUint(480),
    signedTx,
    NetworkType.MIJIN_TEST
  );
  const signedLockFundsTx = initiater.sign(lockFundsTx);

  util.announce(url, signedLockFundsTx);
})();
```

アグリゲートボンドトランザクションでは、先にロックファンドトランザクションが承認されている必要があります。

`10 cat.currency`を保証とし、署名済みのアグリゲートトランザクションを渡して`LockFundsTransaction`を作成したら発信します。
