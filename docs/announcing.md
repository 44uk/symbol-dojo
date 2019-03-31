# トランザクションの発行

`nem2-sdk`を使って、`nem`の各機能のトランザクションを発信してみましょう。

今回のコードにはモニタリングをする処理も入れてあるので、トランザクションの発信後にモニタリングが始まります。

コードの実行中に問題があるようならば、捕捉で`nem2-cli`のモニタリングを活用してみてください。


## 転送トランザクション

コードを実行してモザイクの転送をしてみましょう。

- [転送トランザクション — NEM Developer Center](https://nemtech.github.io/ja/concepts/transfer-transaction.html)


### コード実行の前に

サンプルコードは`秘密鍵`と`APIのURL`を環境変数から取得するように書いてあります。

以下のように環境変数をセットしてください。

(なお`API_URL`がない場合は`http://localhost:3000`がセットされるので、ローカル環境であれば不要です)

秘密鍵には`alice`の鍵を指定してください。鍵を確認する場合は`profile list`で表示できます。

```shell
$ nem2-cli profile list
alice->
	Network:	MIJIN_TEST
	Url:		http://localhost:3000
	Address:	SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5
	PublicKey:	64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0
	PrivateKey:	25E7E5A21DD0C863B3CC3767C5CC6C081A7C7795BA4115231C74F491A97D6ED7
```

ターミナルで以下のように環境変数をセットしてください。

```shell
export API_URL=http://localhost:3000
export PRIVATE_KEY=25E7E5A21DD0C863B3CC3767C5CC6C081A7C7795BA4115231C74F491A97D6ED7
```

以降、サンプルコードでは`alice`の秘密鍵がトランザクションの発信に使用されます。

これらの変数がセットされている前提でサンプルコードを実行していきます。


### コード実行

`scripts/transfer/create_mosaic_transfer.js`を実行してみましょう。

このスクリプトは引数に宛先とモザイク(`cat.currency`の相対量)を指定します。

ここでは`bob`のアドレスへ送ってみます。

```shell
$ node scripts/transfer/create_mosaic_transfer.js SBU4GPX2BJSESXN5KBTCAI63GGDVJYQFZ62M2QTT 10
Initiater:      SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
Endpoint:       http://localhost:3000/account/SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5
Recipient:      SBU4GP-X2BJSE-SXN5KB-TCAI63-GGDVJY-QFZ62M-2QTT
Endpoint:       http://localhost:3000/account/SBU4GPX2BJSESXN5KBTCAI63GGDVJYQFZ62M2QTT

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/0293DEB85BF09AC97DE7A4A9086AADFA590C78E6325F2485D4EFBFCFE4E861F5
Hash:     0293DEB85BF09AC97DE7A4A9086AADFA590C78E6325F2485D4EFBFCFE4E861F5
Signer:   64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0

[UNCONFIRMED]
{"type":16724,"networkType":144,"version":3,"deadline":{"value":"2019-03-22T01:55:48.721"},"fee":{"lower":0,"higher":0},"signature":"F2106FF72FBD2CC1E8C477CB4C11B1C56BABBAF5F932B75C249F7542C260F308B72AAC5C8D0CA659FD0FFCDE84FD810C476BA7390D19ABE76492CA87FC9A040C","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"0293DEB85BF09AC97DE7A4A9086AADFA590C78E6325F2485D4EFBFCFE4E861F5","merkleComponentHash":"0293DEB85BF09AC97DE7A4A9086AADFA590C78E6325F2485D4EFBFCFE4E861F5"},"recipient":{"address":"SBU4GPX2BJSESXN5KBTCAI63GGDVJYQFZ62M2QTT","networkType":144},"mosaics":[{"id":{"id":{"lower":3294802500,"higher":2243684972}},"amount":{"lower":10000000,"higher":0}}],"message":{"type":0,"payload":"Ticket fee"}}

[CONFIRMED]
{"type":16724,"networkType":144,"version":3,"deadline":{"value":"2019-03-22T01:55:48.721"},"fee":{"lower":0,"higher":0},"signature":"F2106FF72FBD2CC1E8C477CB4C11B1C56BABBAF5F932B75C249F7542C260F308B72AAC5C8D0CA659FD0FFCDE84FD810C476BA7390D19ABE76492CA87FC9A040C","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":267,"higher":0},"hash":"0293DEB85BF09AC97DE7A4A9086AADFA590C78E6325F2485D4EFBFCFE4E861F5","merkleComponentHash":"0293DEB85BF09AC97DE7A4A9086AADFA590C78E6325F2485D4EFBFCFE4E861F5"},"recipient":{"address":"SBU4GPX2BJSESXN5KBTCAI63GGDVJYQFZ62M2QTT","networkType":144},"mosaics":[{"id":{"id":{"lower":3294802500,"higher":2243684972}},"amount":{"lower":10000000,"higher":0}}],"message":{"type":0,"payload":"Ticket fee"}}
```

このような出力になるはずです。

`[Unconfirmed]`と`[Confirmed]`の出力は、ネットワークが未承認トランザクションとして認知されたときとトランザクションが承認されたときに表示されます。

承認されたら`bob`の残高を確認してみましょう。

```shell
$ nem2-cli account info --profile bob
```


### コード解説

後に使用するサンプルコードと共通する部分が多いので詳細にコードを解説していきます。

```javascript
const nem = require('nem2-sdk');
const util = require('../util');
```

`nem2-sdk`を`nem`という名前でインポートしています。

`util`は共通する発信処理やモニタリング処理をまとめたものです。

```javascript
const url = process.env.API_URL || 'http://localhost:3000';
// 秘密鍵からアカウントオブジェクトを作る
const initiater = nem.Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  nem.NetworkType.MIJIN_TEST
);
```

`process.env`より秘密鍵とAPIのURLを取得してきます。

`nem.Account.createFromPrivateKey`でアカウントのオブジェクトを生成しています。

アカウントオブジェクトは対になる公開鍵やアドレスの情報などを持ち、署名のメソッドも持ちます。

```javascript
// アドレス文字列からアドレスオブジェクトを作る
const recipient = nem.Address.createFromRawAddress(process.argv[2]);
const amount = parseInt(process.argv[3]);
```

`nem.Address.createFromRawAddress`にアドレス文字列を渡すことでアドレスオブジェクトを生成しています。

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
// ここでは`nem.NetworkCurrencyMosaic`すなわち`cat.currency`モザイクオブジェクトを準備
// モザイクIDで作る場合は以下のようにする。
// 可分性がわからないので送信量は絶対値で指定する必要がある。
// new nem.Mosaic(new nem.MosaicId('7d09bf306c0b2e38'), nem.UInt64.fromUint(absoluteAmount)
const mosaics = [nem.NetworkCurrencyMosaic.createRelative(amount)];
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
const message = nem.PlainMessage.create('Ticket fee');
```

メッセージもオブジェクトでラップします。

空メッセージを送りたい場合は`EmptyMessage`を使います。

このオブジェクトの実装を覗いてみると、空文字を渡した`PlainMessage`です。

実装上問題がなければオブジェクトを使い分けずに、空文字を渡しても結果は同じです。

- [nem2\-sdk\-typescript\-javascript/PlainMessage\.ts at v0\.11\.1 · nemtech/nem2\-sdk\-typescript\-javascript](https://github.com/nemtech/nem2-sdk-typescript-javascript/blob/v0.11.1/src/model/transaction/PlainMessage.ts#L52)

```javascript
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
```

ここまでのオブジェクトを元に、トランザクションのオブジェクトを作成します。

`Deadline.create(23)`はトランザクションが署名されてからの有効な期限を示します。

設定可能な範囲は24時間未満の未来までで、引数が無い場合はデフォルトで**2時間**がセットされます。

- [nem2\-sdk\-typescript\-javascript/Deadline\.ts at v0\.11\.1 · nemtech/nem2\-sdk\-typescript\-javascript](https://github.com/nemtech/nem2-sdk-typescript-javascript/blob/v0.11.1/src/model/transaction/Deadline.ts#L42)

`js-joda`の時間単位を一緒に渡すことで、より細かい単位の時間を設定できます。


```javascript
// トランザクション成功/失敗,未承認,承認のモニタリング接続
util.listener(url, initiater.address, {
  onOpen: () => {
    // 署名して発信
    const signedTx = initiater.sign(transferTx);
    util.announce(url, signedTx);
  }
});
```

モニタリングを開始して、接続が完了し待機状態になったらトランザクションに署名をして、発信しています。

トランザクションの未承認・承認のタイミングで通知が表示されます。


### util.jsの解説

`util.js`の中身も解説しておきます。

主にトランザクションの発信やリスナーの監視の実装をまとめたものです。

```javascript
const nem = require('nem2-sdk');

exports.listener = (url, address, hooks = {}) => {
  const excerptAddress = address.plain().slice(0,6)
  const nextObserver = (label, hook) => info => {
    console.log('[%s] %s...\n%s\n', label, excerptAddress, JSON.stringify(info));
    typeof hook === 'function' && hook(info);
  };
  const errorObserver = err => console.error(err);
  // リスナーオブジェクトを用意
  const listener = new nem.Listener(url);
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

これは`RxJS`によるもので、要点だけ説明すると、`subscribe`メソッドを呼ぶことで初めてその処理が開始されます。


```javascript
// 以下は発信時に呼び出す`transactionHttp`のメソッドが異なるだけです。
exports.announce = (url, tx, ...subscriber) => {
  const transactionHttp = new nem.TransactionHttp(url)
  const subscription = transactionHttp.announce(tx)
  announceUtil(subscription, url, tx, ...subscriber)
}

exports.announceAggregateBonded = (url, tx, ...subscriber) => {
  const transactionHttp = new nem.TransactionHttp(url)
  const subscription = transactionHttp.announceAggregateBonded(tx)
  announceUtil(subscription, url, tx, subscriber)
}

exports.announceAggregateBondedCosignature = (url, tx, ...subscriber) => {
  const transactionHttp = new nem.TransactionHttp(url)
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

`subscribe`メソッドによってリクエストが開始され、成功したら、`tx`オブジェクトの内容を出力しています。

これが基本的なトランザクションオブジェクトの作成と発信です。

他のトランザクションを実行する場合も作成するオブジェクトが異なるくらいで大枠は同じです。

`nem2-sdk`は`RxJS`を使用しています。より複雑に使いこなすには`RxJS`の学習が必要です。

`RxJS`については別途公式サイトなどを確認してください。

- [ReactiveX/rxjs: A reactive programming library for JavaScript](https://github.com/ReactiveX/rxjs)


## アグリゲートトランザクション

アグリゲートトランザクションとは、複数のトランザクションを束ねて一つのトランザクションとして発信する機能です。

- [アグリゲートトランザクション — NEM Developer Center](https://nemtech.github.io/ja/concepts/aggregate-transaction.html)

束ねたトランザクションすべてが承認されるか、すべて承認されないかという原始性を実現します。

DBMSにおける「トランザクション」の概念と同じです。

内包されたトランザクションの署名が揃っているかどうかで、アグリゲートトランザクションは2種類に分類されます。


### アグリゲート「コンプリート」

`Aggregate Complete` は内包されたトランザクションの署名が全て揃った状態のアグリゲートトランザクションです。

- [アグリゲートトランザクション — NEM Developer Center](https://nemtech.github.io/ja/concepts/aggregate-transaction.html#aggregate-complete)

署名するひとだけでトランザクションが完結する場合は`Aggregate Complete`となります。

例えば、

- 複数のアカウントへ同時にトランザクションを送りたい
- 多層のネームスペースを一度のトランザクションで取得したい
- ネームスペース取得とモザイクの作成までを一度で済ませたい
- マルチシグの連署者の追加・削除を同時に行いたい
- 複数のマルチシグ署名を同時に署名したい
- 一つのトランザクションに複数のメッセージを保存したい

などの用途が考えられます。


### アグリゲート「ボンド」

`Aggregate Bonded` は内包されたトランザクションに署名を要求するトランザクションが含まれているアグリゲートトランザクションです。

- [アグリゲートトランザクション — NEM Developer Center](https://nemtech.github.io/ja/concepts/aggregate-transaction.html#aggregate-bonded)

別のアカウントが署名する必要のあるトランザクションを含む場合は`Aggregate Bonded`となります。

アグリゲートボンドを発行する前に、`LockFundsTransaction`を発行し、担保として`10 cat.currency`をネットワーク上に預け入れる必要がある。

この`10 cat.currency`は署名が完了し、アグリゲートトランザクションが受理された場合に、発行したアカウントへ戻ってきます。

トランザクションの期限が切れると`10 cat.currency`は、期限が切れる時のブロックをハーベストしたアカウントへのハーベスト報酬となり、戻ってきません。

こちらは、

- 相手のアカウントにモザイクの送信を要求したい
- 手数料分のモザイクを渡し、それを使ってモザイクを送信したい
- 複数の関係者間で順次行われるトランザクションの流れを定義したい

などの用途が考えられます。


### LockFundTransactionについて

これは他のアカウントへやらたに署名の要求を送らないための、ネットワークに対しての保証モザイクのようなものです。

- [アグリゲートトランザクション — NEM Developer Center](https://nemtech.github.io/ja/concepts/aggregate-transaction.html#hash-lock-transaction)

この保証モザイクはアグリゲートトランザクションが承認されると、アカウントに戻ってきます。

承認されなかった(つまり関係者の署名が揃わなかった、否決された)場合はハーベスト報酬となり、戻ってきません。


## 一括転送トランザクション(コンプリート)

`scripts/transfer/create_transfers_atomically.js`を実行してみましょう。

このコードは実行時に生成した3つのアカウントへ同時にモザイクを送信します。

引数に各アカウントへ送る`cat.currency`モザイクを相対量で指定します。

生成したアカウントはコンソールに出力されるだけなので、必要があれば保存してください。

```shell
$ node scripts/transfer/create_transfers_atomically.js 1
Initiater:      SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
Endpoint:       http://localhost:3000/account/SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5

- account1 ----------------------------------------------------------------
Private:  39632EB06B004A006FDD8B51E1657A4E4AFAB949E1D86F94A8313D93B39380F5
Public:   512B7AFD1E4B19DC832B90DB8CA87AED85EFA4393E7D015CA23CE2A4CED4F882
Address:  SARX6U-JDNFZX-MTJZB2-YHZ6VX-44QLEI-UZRTRY-7EPR
Endpoint: http://localhost:3000/account/SARX6UJDNFZXMTJZB2YHZ6VX44QLEIUZRTRY7EPR
- account2 ----------------------------------------------------------------
Private:  B297B375DE0FBDC1C2AD4DC7D4F82BDEF57EF831888168246C81ACC600E355B8
Public:   8074C77D05F82AC612A610BF3D0240066C135A59A945BE14D08BE4CBCCDF0B8C
Address:  SD7FAH-KVOCMW-WLVPB3-VA33X5-2JQGVQ-YXRNV3-TPQR
Endpoint: http://localhost:3000/account/SD7FAHKVOCMWWLVPB3VA33X52JQGVQYXRNV3TPQR
- account3 ----------------------------------------------------------------
Private:  8F66A374E981321E89870DB0E0B3D8911C717F6990E57A58AF73588DA9BA51F8
Public:   A0EB5F5A3261E289EEE674DCE3366FC399108D4475AAE0F5AD66BAADCCA1A170
Address:  SDYLCK-R4XWSO-TX5BK4-UXM662-72IA7K-FJO46R-EETE
Endpoint: http://localhost:3000/account/SDYLCKR4XWSOTX5BK4UXM66272IA7KFJO46REETE

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/C2470442A59B9AB68B6677DC202F819E4BFED67F8EF8D82AFB413C80809E7871
Hash:     C2470442A59B9AB68B6677DC202F819E4BFED67F8EF8D82AFB413C80809E7871
Signer:   64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0

[UNCONFIRMED]
{"type":16705,"networkType":144,"version":2,"deadline":{"value":"2019-03-22T12:00:40.649"},"fee":{"lower":0,"higher":0},"signature":"53862200F1BB4F6E58555FC7AE9E43EC97F5EC08EE2E2FFA50BF20B1A5583C7A4E87EF5FE6EBD8B116221F9BDADE2DDAFD004C41E5F8F06980CE37B4977D3C09","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"C2470442A59B9AB68B6677DC202F819E4BFED67F8EF8D82AFB413C80809E7871","merkleComponentHash":"C2470442A59B9AB68B6677DC202F819E4BFED67F8EF8D82AFB413C80809E7871"},"innerTransactions":[{"type":16724,"networkType":144,"version":3,"deadline":{"value":"2019-03-22T12:00:40.649"},"fee":{"lower":0,"higher":0},"signature":"53862200F1BB4F6E58555FC7AE9E43EC97F5EC08EE2E2FFA50BF20B1A5583C7A4E87EF5FE6EBD8B116221F9BDADE2DDAFD004C41E5F8F06980CE37B4977D3C09","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"recipient":{"address":"SARX6UJDNFZXMTJZB2YHZ6VX44QLEIUZRTRY7EPR","networkType":144},"mosaics":[{"id":{"id":{"lower":3294802500,"higher":2243684972}},"amount":{"lower":1000000,"higher":0}}],"message":{"type":0,"payload":"Tip for you"}},{"type":16724,"networkType":144,"version":3,"deadline":{"value":"2019-03-22T12:00:40.649"},"fee":{"lower":0,"higher":0},"signature":"53862200F1BB4F6E58555FC7AE9E43EC97F5EC08EE2E2FFA50BF20B1A5583C7A4E87EF5FE6EBD8B116221F9BDADE2DDAFD004C41E5F8F06980CE37B4977D3C09","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"recipient":{"address":"SD7FAHKVOCMWWLVPB3VA33X52JQGVQYXRNV3TPQR","networkType":144},"mosaics":[{"id":{"id":{"lower":3294802500,"higher":2243684972}},"amount":{"lower":1000000,"higher":0}}],"message":{"type":0,"payload":"Tip for you"}},{"type":16724,"networkType":144,"version":3,"deadline":{"value":"2019-03-22T12:00:40.649"},"fee":{"lower":0,"higher":0},"signature":"53862200F1BB4F6E58555FC7AE9E43EC97F5EC08EE2E2FFA50BF20B1A5583C7A4E87EF5FE6EBD8B116221F9BDADE2DDAFD004C41E5F8F06980CE37B4977D3C09","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"recipient":{"address":"SDYLCKR4XWSOTX5BK4UXM66272IA7KFJO46REETE","networkType":144},"mosaics":[{"id":{"id":{"lower":3294802500,"higher":2243684972}},"amount":{"lower":1000000,"higher":0}}],"message":{"type":0,"payload":"Tip for you"}}],"cosignatures":[]}

[CONFIRMED]
{"type":16705,"networkType":144,"version":2,"deadline":{"value":"2019-03-22T12:00:40.649"},"fee":{"lower":0,"higher":0},"signature":"53862200F1BB4F6E58555FC7AE9E43EC97F5EC08EE2E2FFA50BF20B1A5583C7A4E87EF5FE6EBD8B116221F9BDADE2DDAFD004C41E5F8F06980CE37B4977D3C09","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":1478,"higher":0},"hash":"C2470442A59B9AB68B6677DC202F819E4BFED67F8EF8D82AFB413C80809E7871","merkleComponentHash":"C2470442A59B9AB68B6677DC202F819E4BFED67F8EF8D82AFB413C80809E7871"},"innerTransactions":[{"type":16724,"networkType":144,"version":3,"deadline":{"value":"2019-03-22T12:00:40.649"},"fee":{"lower":0,"higher":0},"signature":"53862200F1BB4F6E58555FC7AE9E43EC97F5EC08EE2E2FFA50BF20B1A5583C7A4E87EF5FE6EBD8B116221F9BDADE2DDAFD004C41E5F8F06980CE37B4977D3C09","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"recipient":{"address":"SARX6UJDNFZXMTJZB2YHZ6VX44QLEIUZRTRY7EPR","networkType":144},"mosaics":[{"id":{"id":{"lower":3294802500,"higher":2243684972}},"amount":{"lower":1000000,"higher":0}}],"message":{"type":0,"payload":"Tip for you"}},{"type":16724,"networkType":144,"version":3,"deadline":{"value":"2019-03-22T12:00:40.649"},"fee":{"lower":0,"higher":0},"signature":"53862200F1BB4F6E58555FC7AE9E43EC97F5EC08EE2E2FFA50BF20B1A5583C7A4E87EF5FE6EBD8B116221F9BDADE2DDAFD004C41E5F8F06980CE37B4977D3C09","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"recipient":{"address":"SD7FAHKVOCMWWLVPB3VA33X52JQGVQYXRNV3TPQR","networkType":144},"mosaics":[{"id":{"id":{"lower":3294802500,"higher":2243684972}},"amount":{"lower":1000000,"higher":0}}],"message":{"type":0,"payload":"Tip for you"}},{"type":16724,"networkType":144,"version":3,"deadline":{"value":"2019-03-22T12:00:40.649"},"fee":{"lower":0,"higher":0},"signature":"53862200F1BB4F6E58555FC7AE9E43EC97F5EC08EE2E2FFA50BF20B1A5583C7A4E87EF5FE6EBD8B116221F9BDADE2DDAFD004C41E5F8F06980CE37B4977D3C09","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"recipient":{"address":"SDYLCKR4XWSOTX5BK4UXM66272IA7KFJO46REETE","networkType":144},"mosaics":[{"id":{"id":{"lower":3294802500,"higher":2243684972}},"amount":{"lower":1000000,"higher":0}}],"message":{"type":0,"payload":"Tip for you"}}],"cosignatures":[]}
```

承認されたら生成されたアカウントの残高を確認してみましょう。

表示されたアカウントのURLを開くか、`nem2-cli`で確認できます。

```shell
$ nem2-cli account info -a SARX6U-JDNFZX-MTJZB2-YHZ6VX-44QLEI-UZRTRY-7EPR
Account:        SARX6U-JDNFZX-MTJZB2-YHZ6VX-44QLEI-UZRTRY-7EPR
-------------------------------------------------------

Address:        SARX6U-JDNFZX-MTJZB2-YHZ6VX-44QLEI-UZRTRY-7EPR
at height:      1478

PublicKey:      0000000000000000000000000000000000000000000000000000000000000000
at height:      0

Importance:     0
at height:      0

Mosaics
7d09bf306c0b2e38:       1
```

結果だけ確認すると、3人それぞれに一回づつ送ったのか、集約されていたのかわかりません。

トランザクションハッシュを指定して、承認されたトランザクションを確認してみましょう。

コンソールに表示されたURLにアクセスするか、`nem2-cli`で確認してみましょう。

```shell
$ nem2-cli transaction info -h C2470442A59B9AB68B6677DC202F819E4BFED67F8EF8D82AFB413C80809E7871

AggregateTransaction:
  InnerTransactions: [
    TransferTransaction:
      Recipient:SARX6U-JDNFZX-MTJZB2-YHZ6VX-44QLEI-UZRTRY-7EPR
      Message:"Tip for you"
      Mosaics: NamespaceId:85bbea6cc462b244::1000000
      Signer:SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5 Deadline:2019-03-22
    TransferTransaction:
      Recipient:SD7FAH-KVOCMW-WLVPB3-VA33X5-2JQGVQ-YXRNV3-TPQR
      Message:"Tip for you"
      Mosaics: NamespaceId:85bbea6cc462b244::1000000
      Signer:SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5 Deadline:2019-03-22
    TransferTransaction:
      Recipient:SDYLCK-R4XWSO-TX5BK4-UXM662-72IA7K-FJO46R-EETE
      Message:"Tip for you"
      Mosaics: NamespaceId:85bbea6cc462b244::1000000
      Signer:SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5 Deadline:2019-03-22
  ]
  Signer:SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5 Deadline:2019-03-22
  Hash:C2470442A59B9AB68B6677DC202F819E4BFED67F8EF8D82AFB413C80809E7871
```

そのままの出力だとちょっと読みにくいので整形しています。

`InnerTransactions`に3つの宛先への転送トランザクションが入っていました。

このコードでは同じ量と同じメッセージを送りますが、もちろん個別に変えることもできます。


### コード解説

```javascript
const txes = recipients.map(account => {
  return nem.TransferTransaction.create(
    nem.Deadline.create(),
    account.address,
    mosaics,
    message,
    nem.NetworkType.MIJIN_TEST
  );
});

const aggregateTx = nem.AggregateTransaction.createComplete(
  nem.Deadline.create(),
  txes.map(tx => tx.toAggregate(initiater.publicAccount)),
  nem.NetworkType.MIJIN_TEST,
  []
);
```

`TransferTransaction`オブジェクトを作るところは転送と同じです。

各トランザクションオブジェクトに署名者の公開アカウントオブジェクトを渡して`toAggregate`メソッドを呼びます。

その配列を`AggregateTransaction.createComplete`に渡して、アグリゲートトランザクションオブジェクトを作ります。

このオブジェクトに署名を行って発行します。


## 転送要求トランザクション(アグリゲートボンド)

`scripts/transfer/create_pullfunds.js`を実行してみましょう。

このコードは`bob`が`10 cat.currency`を`alice`に送るよう支払いの請求を行います。

内容を確認した`bob`がアグリゲートトランザクションに署名することで、アグリゲートトランザクションが承認されます。

このコードでは`bob`も署名する必要があるので秘密鍵を渡します。

アグリゲートボンドの作成から署名し承認されるまでの流れを一つのスクリプト内で行います。

現実的な仕組みのコードではないですが、流れを掴んでもらうにはわかりやすいと思います。

```shell
$ node transfer/create_pullfunds.js 2F80B79E9D1A2BD08C9A045B4144FCDFFFC126F035B97C2E30831B63D7626A50
Initiater: SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
Endpoint:  http://localhost:3000/account/SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5
Debtor:    SC3AWB-HBY2AB-QHQY3Q-AJLO4H-XSJ6IZ-VAYLN5-2HO4
Endpoint:  http://localhost:3000/account/SC3AWBHBY2ABQHQY3QAJLO4HXSJ6IZVAYLN52HO4

connection open
connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/9C661C576A2C235B482F5D8E3C769803F765E3C5EC4707EE5036F439C1D6DAA6
Hash:     9C661C576A2C235B482F5D8E3C769803F765E3C5EC4707EE5036F439C1D6DAA6
Signer:   64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0

[UNCONFIRMED] SCGUWZ...
{"type":16712,"networkType":144,"version":1,"deadline":{"value":"2019-03-25T12:28:25.752"},"fee":{"lower":0,"higher":0},"signature":"8444357506F1602224AB8CFA7C9D29C41A85A96DF5E1D2D53B034A159A26A47E3B4B780D3F7CC79903AC751FA61B0D6138D854FBDD689915B794630C7EA37B0E","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"9C661C576A2C235B482F5D8E3C769803F765E3C5EC4707EE5036F439C1D6DAA6","merkleComponentHash":"9C661C576A2C235B482F5D8E3C769803F765E3C5EC4707EE5036F439C1D6DAA6"},"mosaic":{"id":{"id":{"lower":1812672056,"higher":2097790768}},"amount":{"lower":10000000,"higher":0}},"duration":{"lower":480,"higher":0},"hash":"6E00E13430F01082B06A9E20918314F6C435D80A7721A48FCEEE20F2D22E1A9B"}

[CONFIRMED] SCGUWZ...
{"type":16712,"networkType":144,"version":1,"deadline":{"value":"2019-03-25T12:28:25.752"},"fee":{"lower":0,"higher":0},"signature":"8444357506F1602224AB8CFA7C9D29C41A85A96DF5E1D2D53B034A159A26A47E3B4B780D3F7CC79903AC751FA61B0D6138D854FBDD689915B794630C7EA37B0E","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":10167,"higher":0},"hash":"9C661C576A2C235B482F5D8E3C769803F765E3C5EC4707EE5036F439C1D6DAA6","merkleComponentHash":"9C661C576A2C235B482F5D8E3C769803F765E3C5EC4707EE5036F439C1D6DAA6"},"mosaic":{"id":{"id":{"lower":1812672056,"higher":2097790768}},"amount":{"lower":10000000,"higher":0}},"duration":{"lower":480,"higher":0},"hash":"6E00E13430F01082B06A9E20918314F6C435D80A7721A48FCEEE20F2D22E1A9B"}

[LockFund confirmed!]

[AGGREGATE_BONDED_ADDED] SC3AWB...
{"type":16961,"networkType":144,"version":2,"deadline":{"value":"2019-03-25T12:28:24.036"},"fee":{"lower":0,"higher":0},"signature":"F75EA35C1191BB6DC6B7BDB7BBE37D74DC833C943A9D136220F8DE55886B3EFA43CAEE703C19E9B6805CD493215A58048DF704D3D403EB6E11BA253D3E51C90E","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"6E00E13430F01082B06A9E20918314F6C435D80A7721A48FCEEE20F2D22E1A9B","merkleComponentHash":"0000000000000000000000000000000000000000000000000000000000000000"},"innerTransactions":[{"type":16724,"networkType":144,"version":3,"deadline":{"value":"2019-03-25T12:28:24.036"},"fee":{"lower":0,"higher":0},"signature":"F75EA35C1191BB6DC6B7BDB7BBE37D74DC833C943A9D136220F8DE55886B3EFA43CAEE703C19E9B6805CD493215A58048DF704D3D403EB6E11BA253D3E51C90E","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"recipient":{"address":"SC3AWBHBY2ABQHQY3QAJLO4HXSJ6IZVAYLN52HO4","networkType":144},"mosaics":[],"message":{"type":0,"payload":"Request for a refund 10 cat.currency"}},{"type":16724,"networkType":144,"version":3,"deadline":{"value":"2019-03-25T12:28:24.036"},"fee":{"lower":0,"higher":0},"signature":"F75EA35C1191BB6DC6B7BDB7BBE37D74DC833C943A9D136220F8DE55886B3EFA43CAEE703C19E9B6805CD493215A58048DF704D3D403EB6E11BA253D3E51C90E","signer":{"publicKey":"0CE0BDD69DC579491FDB7AEA57FAF6E37BDB79D1E5C54DA40665D8B2F362F1DF","address":{"address":"SC3AWBHBY2ABQHQY3QAJLO4HXSJ6IZVAYLN52HO4","networkType":144}},"recipient":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144},"mosaics":[{"id":{"id":{"lower":3294802500,"higher":2243684972}},"amount":{"lower":10000000,"higher":0}}],"message":{"type":0,"payload":""}}],"cosignatures":[]}

[Aggregate Bonded Added]
Message: PlainMessage { type: 0, payload: 'Request for a refund 10 cat.currency' }
Amount: Mosaic {
  id:
   NamespaceId { id: Id { lower: 3294802500, higher: 2243684972 } },
  amount: UInt64 { lower: 10000000, higher: 0 } }

[AGGREGATE_BONDED_ADDED] SCGUWZ...
{"type":16961,"networkType":144,"version":2,"deadline":{"value":"2019-03-25T12:28:24.036"},"fee":{"lower":0,"higher":0},"signature":"F75EA35C1191BB6DC6B7BDB7BBE37D74DC833C943A9D136220F8DE55886B3EFA43CAEE703C19E9B6805CD493215A58048DF704D3D403EB6E11BA253D3E51C90E","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"6E00E13430F01082B06A9E20918314F6C435D80A7721A48FCEEE20F2D22E1A9B","merkleComponentHash":"0000000000000000000000000000000000000000000000000000000000000000"},"innerTransactions":[{"type":16724,"networkType":144,"version":3,"deadline":{"value":"2019-03-25T12:28:24.036"},"fee":{"lower":0,"higher":0},"signature":"F75EA35C1191BB6DC6B7BDB7BBE37D74DC833C943A9D136220F8DE55886B3EFA43CAEE703C19E9B6805CD493215A58048DF704D3D403EB6E11BA253D3E51C90E","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"recipient":{"address":"SC3AWBHBY2ABQHQY3QAJLO4HXSJ6IZVAYLN52HO4","networkType":144},"mosaics":[],"message":{"type":0,"payload":"Request for a refund 10 cat.currency"}},{"type":16724,"networkType":144,"version":3,"deadline":{"value":"2019-03-25T12:28:24.036"},"fee":{"lower":0,"higher":0},"signature":"F75EA35C1191BB6DC6B7BDB7BBE37D74DC833C943A9D136220F8DE55886B3EFA43CAEE703C19E9B6805CD493215A58048DF704D3D403EB6E11BA253D3E51C90E","signer":{"publicKey":"0CE0BDD69DC579491FDB7AEA57FAF6E37BDB79D1E5C54DA40665D8B2F362F1DF","address":{"address":"SC3AWBHBY2ABQHQY3QAJLO4HXSJ6IZVAYLN52HO4","networkType":144}},"recipient":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144},"mosaics":[{"id":{"id":{"lower":3294802500,"higher":2243684972}},"amount":{"lower":10000000,"higher":0}}],"message":{"type":0,"payload":""}}],"cosignatures":[]}

[COSIGNATURE_ADDED] SC3AWB...
{"parentHash":"6E00E13430F01082B06A9E20918314F6C435D80A7721A48FCEEE20F2D22E1A9B","signature":"795282A3E9781F2934C3224AED48F265BF27D4089A615A2F1D75A36210A4AC217B0DD1DA0577DD355A0746BAE494B0CEF570AE90B6ED3BD983B4EE8574577900","signer":"0CE0BDD69DC579491FDB7AEA57FAF6E37BDB79D1E5C54DA40665D8B2F362F1DF"}

[COSIGNATURE_ADDED] SCGUWZ...
{"parentHash":"6E00E13430F01082B06A9E20918314F6C435D80A7721A48FCEEE20F2D22E1A9B","signature":"795282A3E9781F2934C3224AED48F265BF27D4089A615A2F1D75A36210A4AC217B0DD1DA0577DD355A0746BAE494B0CEF570AE90B6ED3BD983B4EE8574577900","signer":"0CE0BDD69DC579491FDB7AEA57FAF6E37BDB79D1E5C54DA40665D8B2F362F1DF"}

[UNCONFIRMED] SC3AWB...
{"type":16961,"networkType":144,"version":2,"deadline":{"value":"2019-03-25T12:28:24.036"},"fee":{"lower":0,"higher":0},"signature":"F75EA35C1191BB6DC6B7BDB7BBE37D74DC833C943A9D136220F8DE55886B3EFA43CAEE703C19E9B6805CD493215A58048DF704D3D403EB6E11BA253D3E51C90E","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"6E00E13430F01082B06A9E20918314F6C435D80A7721A48FCEEE20F2D22E1A9B","merkleComponentHash":"1B9DD0EBC7D4E3810363338F5EF9A313402BBADA27F872258B6E45B92311DCD3"},"innerTransactions":[{"type":16724,"networkType":144,"version":3,"deadline":{"value":"2019-03-25T12:28:24.036"},"fee":{"lower":0,"higher":0},"signature":"F75EA35C1191BB6DC6B7BDB7BBE37D74DC833C943A9D136220F8DE55886B3EFA43CAEE703C19E9B6805CD493215A58048DF704D3D403EB6E11BA253D3E51C90E","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"recipient":{"address":"SC3AWBHBY2ABQHQY3QAJLO4HXSJ6IZVAYLN52HO4","networkType":144},"mosaics":[],"message":{"type":0,"payload":"Request for a refund 10 cat.currency"}},{"type":16724,"networkType":144,"version":3,"deadline":{"value":"2019-03-25T12:28:24.036"},"fee":{"lower":0,"higher":0},"signature":"F75EA35C1191BB6DC6B7BDB7BBE37D74DC833C943A9D136220F8DE55886B3EFA43CAEE703C19E9B6805CD493215A58048DF704D3D403EB6E11BA253D3E51C90E","signer":{"publicKey":"0CE0BDD69DC579491FDB7AEA57FAF6E37BDB79D1E5C54DA40665D8B2F362F1DF","address":{"address":"SC3AWBHBY2ABQHQY3QAJLO4HXSJ6IZVAYLN52HO4","networkType":144}},"recipient":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144},"mosaics":[{"id":{"id":{"lower":3294802500,"higher":2243684972}},"amount":{"lower":10000000,"higher":0}}],"message":{"type":0,"payload":""}}],"cosignatures":[{"signature":"795282A3E9781F2934C3224AED48F265BF27D4089A615A2F1D75A36210A4AC217B0DD1DA0577DD355A0746BAE494B0CEF570AE90B6ED3BD983B4EE8574577900","signer":{"publicKey":"0CE0BDD69DC579491FDB7AEA57FAF6E37BDB79D1E5C54DA40665D8B2F362F1DF","address":{"address":"SC3AWBHBY2ABQHQY3QAJLO4HXSJ6IZVAYLN52HO4","networkType":144}}}]}

[UNCONFIRMED] SCGUWZ...
{"type":16961,"networkType":144,"version":2,"deadline":{"value":"2019-03-25T12:28:24.036"},"fee":{"lower":0,"higher":0},"signature":"F75EA35C1191BB6DC6B7BDB7BBE37D74DC833C943A9D136220F8DE55886B3EFA43CAEE703C19E9B6805CD493215A58048DF704D3D403EB6E11BA253D3E51C90E","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"6E00E13430F01082B06A9E20918314F6C435D80A7721A48FCEEE20F2D22E1A9B","merkleComponentHash":"1B9DD0EBC7D4E3810363338F5EF9A313402BBADA27F872258B6E45B92311DCD3"},"innerTransactions":[{"type":16724,"networkType":144,"version":3,"deadline":{"value":"2019-03-25T12:28:24.036"},"fee":{"lower":0,"higher":0},"signature":"F75EA35C1191BB6DC6B7BDB7BBE37D74DC833C943A9D136220F8DE55886B3EFA43CAEE703C19E9B6805CD493215A58048DF704D3D403EB6E11BA253D3E51C90E","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"recipient":{"address":"SC3AWBHBY2ABQHQY3QAJLO4HXSJ6IZVAYLN52HO4","networkType":144},"mosaics":[],"message":{"type":0,"payload":"Request for a refund 10 cat.currency"}},{"type":16724,"networkType":144,"version":3,"deadline":{"value":"2019-03-25T12:28:24.036"},"fee":{"lower":0,"higher":0},"signature":"F75EA35C1191BB6DC6B7BDB7BBE37D74DC833C943A9D136220F8DE55886B3EFA43CAEE703C19E9B6805CD493215A58048DF704D3D403EB6E11BA253D3E51C90E","signer":{"publicKey":"0CE0BDD69DC579491FDB7AEA57FAF6E37BDB79D1E5C54DA40665D8B2F362F1DF","address":{"address":"SC3AWBHBY2ABQHQY3QAJLO4HXSJ6IZVAYLN52HO4","networkType":144}},"recipient":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144},"mosaics":[{"id":{"id":{"lower":3294802500,"higher":2243684972}},"amount":{"lower":10000000,"higher":0}}],"message":{"type":0,"payload":""}}],"cosignatures":[{"signature":"795282A3E9781F2934C3224AED48F265BF27D4089A615A2F1D75A36210A4AC217B0DD1DA0577DD355A0746BAE494B0CEF570AE90B6ED3BD983B4EE8574577900","signer":{"publicKey":"0CE0BDD69DC579491FDB7AEA57FAF6E37BDB79D1E5C54DA40665D8B2F362F1DF","address":{"address":"SC3AWBHBY2ABQHQY3QAJLO4HXSJ6IZVAYLN52HO4","networkType":144}}}]}
```

`alice`から`bob`へ`10 cat.currency`が届いていることを確認してみてください。

なお、この動作は`nem2-cli transfer pullfunds`として実装されているので、こちらも試してみてください。

- [プルトランザクションの送信 | トランザクション - クライアント — NEM Developer Center](https://nemtech.github.io/ja/cli.html#transaction)


### コード解説

```javascript
const fromInitiaterTx = nem.TransferTransaction.create(
  nem.Deadline.create(),
  debtor.address,
  [],
  nem.PlainMessage.create('Request for a refund 10 cat.currency'),
  nem.NetworkType.MIJIN_TEST
);

const fromDebtorTx = nem.TransferTransaction.create(
  nem.Deadline.create(),
  initiater.address,
  [nem.NetworkCurrencyMosaic.createRelative(10)],
  nem.EmptyMessage,
  nem.NetworkType.MIJIN_TEST
);

const aggregateTx = nem.AggregateTransaction.createBonded(
  nem.Deadline.create(),
  [
    fromInitiaterTx.toAggregate(initiater.publicAccount),
    fromDebtorTx.toAggregate(debtor.publicAccount)
  ],
  nem.NetworkType.MIJIN_TEST
);
const signedTx = initiater.sign(aggregateTx);
```

`alice`からは`"Request for a refund 10 cat.currency"`というメッセージを送るトランザクションを作ります。

そして`bob`が`10 cat.currency`送るモザイク転送トランザクションを作ります。

`bob`が`alice`のメッセージを確認し、モザイクを送るという順序で、それらをアグリゲートしています。


```javascript
util.listener(url, initiater.address, {
  onConfirmed: (info) => {
    // LockFundが承認されたらアグリゲートトランザクションを発信
    if(info.type == nem.TransactionType.LOCK) {
      console.log('LockFund confirmed!')
      util.announceAggregateBonded(url, signedTx)
    }
  }
})
```

アグリゲートトランザクションの発信は、ロックトランザクションが承認されてから行います。

```javascript
util.listener(url, debtor.address, {
  onAggregateBondedAdded: (aggregateTx) => {
    // トランザクションの署名要求が届いたらdebtorはそれに署名する
    console.log('[Aggregate Bonded Added]')
    // メッセージの内容とモザイク量について同意して署名する
    const txForInitiator = aggregateTx.innerTransactions[0]
    const txForDebtor = aggregateTx.innerTransactions[1]
    console.log('Message: %o', txForInitiator.message)
    console.log('Amount: %o', txForDebtor.mosaics[0])
    console.log('')
    const cosignatureTx = nem.CosignatureTransaction.create(aggregateTx);
    const signedCosignature = debtor.signCosignatureTransaction(cosignatureTx);
    util.announceAggregateBondedCosignature(url, signedCosignature)
  }
})
```

アグリゲートトランザクションが承認されたら、`bob`がその内容を確認して署名するという動作をしています。

```javascript
;(async () => {
  // 保証金のような役割であるLockFundTransactionを作成する
  const mosId = await new nem.NamespaceHttp(url)
    .getLinkedMosaicId(new nem.NamespaceId('cat.currency'))
    .toPromise();
  const lockFundMosaic = new nem.Mosaic(mosId, nem.UInt64.fromUint(10000000))
  const lockFundsTx = nem.LockFundsTransaction.create(
    nem.Deadline.create(),
    lockFundMosaic,
    nem.UInt64.fromUint(480),
    signedTx,
    nem.NetworkType.MIJIN_TEST
  );
  const signedLockFundsTx = initiater.sign(lockFundsTx);

  util.announce(url, signedLockFundsTx)
})();
```

アグリゲートボンドトランザクションでは、まず最初にロックファンドトランザクションが承認されている必要があります。

`10 cat.currency`を保証として添付し、署名済みのアグリゲートトランザクションを渡して`LockFundsTransaction`を作成します。

