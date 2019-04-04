# エイリアスリンク

前述したとおり、ネームスペースをモザイクまたはアカウントへリンクすることができます。

- [ネームスペース — NEM Developer Center](https://nemtech.github.io/ja/concepts/namespace.html#alias)

ネームスペースをモザイクへリンクすることで、ネームスペース名によってモザイクを認識することができるようになります。


## エイリアスリンクの用途

アドレスに紐づけた場合は、ネームスペース名からアドレスを識別することができます。

モザイクに紐づけた場合は、ネームスペース名からモザイクを識別することができます。


## ネームスペースをモザイクにリンクする

リンクする前にネームスペース名でモザイクを取得するコードを実行してみましょう。

`scripts/mosaic/fetch_mosaic_by_alias.js test123`

```shell
$ node scripts/mosaic/fetch_mosaic_by_alias.js test123
Namespace: test123 (ff87cc82daab0bbf)
Endpoint:  http://localhost:3000/namespace/ff87cc82daab0bbf

Error:  Error: No mosaicId is linked to namespace 'undefined'
    at MapSubscriber.rxjs_1.from.pipe.operators_1.map [as project] (/Users/yukku/projects/nem2-bootcamp/node_modules/nem2-sdk/dist/src/infrastructure/NamespaceHttp.js:117:23)
    at MapSubscriber._next (/Users/yukku/projects/nem2-bootcamp/node_modules/rxjs/internal/operators/map.js:49:35)
    at MapSubscriber.Subscriber.next (/Users/yukku/projects/nem2-bootcamp/node_modules/rxjs/internal/Subscriber.js:66:18)
    at /Users/yukku/projects/nem2-bootcamp/node_modules/rxjs/internal/util/subscribeToPromise.js:7:24
    at process._tickCallback (internal/process/next_tick.js:68:7)
```

紐付ける前なのでエラーになってしまいました。

`Error:  Error: No mosaicId is linked to namespace 'undefined'`というメッセージから、`test123`という名前で紐付いたモザイクが取得できなかったことがわかります。

それではネームスペースとモザイクをリンクさせてみましょう。

`scripts/aliaslink/link_mosaic.js test123 75caa6b686e7e7ba`

```shell
$ node scripts/aliaslink/link_mosaic.js test123 75caa6b686e7e7ba
Initiater:      SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
Endpoint:   http://localhost:3000/account/SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5
Namespace:      test123
Endpoint:       http://localhost:3000/namespace/ff87cc82daab0bbf
Mosaic Hex:     75caa6b686e7e7ba
Endpoint:       http://localhost:3000/mosaic/75caa6b686e7e7ba

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/AE829D5927F963D9A71A291A033D2044731EF9958DDB21B1A56A52196BAD9307
Hash:     AE829D5927F963D9A71A291A033D2044731EF9958DDB21B1A56A52196BAD9307
Signer:   64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0

[UNCONFIRMED] SCGUWZ...
{"type":17230,"networkType":144,"version":1,"deadline":{"value":"2019-03-23T17:09:19.503"},"fee":{"lower":0,"higher":0},"signature":"EE2CEFE42138B8EF562DD2D8233F478E6A19E62B5585F2FEFFE6B8D7D63EFF671F20D56FDC5659844AC16A9B2FA917C27A77B127D0014868BAEF3DC5277FD104","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"AE829D5927F963D9A71A291A033D2044731EF9958DDB21B1A56A52196BAD9307","merkleComponentHash":"AE829D5927F963D9A71A291A033D2044731EF9958DDB21B1A56A52196BAD9307"},"namespaceId":[3668642751,4287089794],"mosaicId":[2263345082,1976215222]}

[CONFIRMED] SCGUWZ...
{"type":17230,"networkType":144,"version":1,"deadline":{"value":"2019-03-23T17:09:19.503"},"fee":{"lower":0,"higher":0},"signature":"EE2CEFE42138B8EF562DD2D8233F478E6A19E62B5585F2FEFFE6B8D7D63EFF671F20D56FDC5659844AC16A9B2FA917C27A77B127D0014868BAEF3DC5277FD104","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":4974,"higher":0},"hash":"AE829D5927F963D9A71A291A033D2044731EF9958DDB21B1A56A52196BAD9307","merkleComponentHash":"AE829D5927F963D9A71A291A033D2044731EF9958DDB21B1A56A52196BAD9307"},"namespaceId":[3668642751,4287089794],"mosaicId":[2263345082,1976215222]}
```

承認されたら、再度`scripts/namespace/fetch_mosaic_by_alias.js`を実行してみましょう。

```shell
$ node scripts/mosaic/fetch_mosaic_by_alias.js test123
Namespace: test123 (ff87cc82daab0bbf)
Endpoint:  http://localhost:3000/namespace/ff87cc82daab0bbf

Namespace:      test123
MosaicId: 75caa6b686e7e7ba [2263345082, 1976215222]
```

今度は結果を取得できました。


### コード解説

```javascript
const nsId = new nem.NamespaceId(namespace);
const mosId = new nem.MosaicId(mosaicHex);

const aliasTx = nem.MosaicAliasTransaction.create(
  nem.Deadline.create(),
  nem.AliasActionType.Link,
  nsId,
  mosId,
  nem.NetworkType.MIJIN_TEST
);
```

ネームスペースIDをネームスペース名から作り、モザイクIDを渡して、`MosaicAliasTransaction`オブジェクトを作ります。

これに署名をして発信します。

続いて、ネームスペース名からモザイクIDを取得するコードです。

```javascript
const nsId = new nem.NamespaceId(namespace);
const nsHttp = new nem.NamespaceHttp(url);

console.log('Namespace: %s (%s)', nsId.fullName, nsId.toHex());
console.log('Endpoint:  %s/namespace/%s', url, nsId.toHex());
console.log('');

nsHttp.getLinkedMosaicId(nsId).subscribe(
  data => {
    const mosId = data;
    console.log('Namespace: %s', nsId.fullName);
    console.log('MosaicId:  %s [%s, %s]',
      mosId.id.toHex(),
      mosId.id.lower,
      mosId.id.higher
    );
  },
  err => console.error('Error: ', err)
);
```

ネームスペースIDを作り、それを`NamespaceHttp#getLinkedMosaicId`に渡して取得します。

`NamespaceHttp`はネームスペースのAPIにアクセスするオブジェクトです。

`subscribe`メソッドによって購読を開始するとリクエストが開始され、情報が取得できます。


## ネームスペースをアカウントにリンクする

ネームスペースをモザイクへリンクすることで、ネームスペース名によってモザイクを認識することができるようになります。

リンクする前にネームスペース名でモザイクを取得したり、ネームスペース名を宛先とするコードを実行してみましょう。

以下はモザイクへリンクする場合とほぼ同様のコードのため、結果やコード解説を省きます。

詳しくはコードを実行したり、開いて確認してみてください。


```shell
# ネームスペース`alice`を取得
$ node scripts/namespace/register_namespace.js alice

# ネームスペースで取得に失敗することを確認
$ node scripts/namespace/fetch_account_by_alias.js alice

# ネームスペースをアカウントへリンク
$ node scripts/aliaslink/link_account.js alice SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5

# 取得できることを確認
$ node scripts/namespace/fetch_account_by_alias.js alice
Namespace: alice (9cf66fb0cfeed2e0)
Endpoint:  http://localhost:3000/namespace/9cf66fb0cfeed2e0

Namespace: alice
Address:   SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5

# ネームスペース名でモザイクを送信できることを確認
$ node scripts/transfer/create_mosaic_transfer_by_namespace.js alice 10
```


## ネームスペースをリンクさせたモザイクをアトミックに作成する

サブネームスペースをアグリゲートトランザクションで取得したように、この一連の作業もアトミックにできます。

`scripts/mosaic/create_named_mosaic_with_supply.js`を実行してください。

このスクリプトは第一引数に取得したいネームスペース名を渡し、第二引数でモザイク供給量を指定します。

第三引数でレンタル期間を指定できます。(ない場合は10,000ブロック)

コードの内容はこれまでのコードをつなぎ合わせて、アグリゲートトランザクションでまとめたものです。

中を確認してみてください。

```shell
$ node scripts/mosaic/create_named_mosaic_with_supply.js qwe.rty.uio 12345
```

実行後、ネームスペース名でモザイクが取得できるか、モザイクは作成できているかなど確認してみてください。

```shell
$ node scripts/namespace/fetch_mosaic_by_alias.js qwe.rty.uio
```

```shell
$ nem2-cli account info --profile alice
```

