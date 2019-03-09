# スマートアセット

`nem`では、アカウント、ネームスペース、モザイクなどのブロックチェーン上に記録される情報資産を`スマートアセット`と呼びます。

これらを賢く柔軟に扱うことができるのが`nem`の強みです。


## ネームスペースとは

ネームスペースとはその名の通りで名前を持った定義です。

- [ネームスペース — NEM Developer Center](https://nemtech.github.io/ja/concepts/namespace.html)

ネームスペースとして利用可能な文字は以下の通りです。

- a から z のアルファベット小文字
- 0 から 9 の数字
- ‘ (アポストロフィ)
- _ (アンダースコア)
- \- (ハイフン)

.(ドット)で区切ることで3階層までのネームスペースを定義することができ、それぞれサブネームスペースと呼ばれます。

具体的には`japan.tokyo.shinjuku`のようなネームスペースを指します。

`japan.tokyo.shinjuku`の場合は、`japan`がルート、`tokyo`は`jappn`のサブ、`shinjuku`は`japan.tokyo`のサブとなります。

サブネームスペースを定義するには先に親のネームスペース(`japan`もしくは`japan.tokyo`)が定義されている必要があります。

ネームスペースにはレンタル期間(ブロック数)があり、ルートネームスペースに適用されます。

つまりサブネームスペースの有効期間はルートネームスペースのレンタル期間と同じです。


### ネームスペースの用途

ネームスペースはアカウントのエイリアス、モザイクのエイリアスとして割り当てることができます。

基軸モザイクである`cat.currency`もモザイクの定期に`cat.currency`というネームスペースを割り当てたものです。


## ネームスペースの取得

`scripts/namespace/register_namespace.js`を実行してください。

このスクリプトは引数に取得したいネームスペース名を渡します。

第二引数でレンタル期間を指定できます。(ない場合は10,000ブロック)

```shell
$ node scripts/namespace/register_namespace.js test123
Initiater: SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
Endpoint:  http://localhost:3000/account/SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5
Namespace: test123 (ff87cc82daab0bbf)
Endpoint:  http://localhost:3000/namespace/ff87cc82daab0bbf
Blocks:    10000

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/3BD5D05D44E2589ACDD73E72F7BCC88CECFE46CC9ADF36817080EFB50C266DDE
Hash:     3BD5D05D44E2589ACDD73E72F7BCC88CECFE46CC9ADF36817080EFB50C266DDE
Signer:   64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0

[UNCONFIRMED] SCGUWZ...
{"type":16718,"networkType":144,"version":2,"deadline":{"value":"2019-03-23T11:09:21.889"},"fee":{"lower":0,"higher":0},"signature":"5B5E5182C9DAAB7B23B777B0A71FCA3590E507D71FC595FB124804FAA8A703E37F23E1F465C9EEF5B5FDE2C29883E6F9AC90B103FC7FC3C3287B86699EACD806","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"3BD5D05D44E2589ACDD73E72F7BCC88CECFE46CC9ADF36817080EFB50C266DDE","merkleComponentHash":"3BD5D05D44E2589ACDD73E72F7BCC88CECFE46CC9ADF36817080EFB50C266DDE"},"namespaceType":0,"namespaceName":"test123","namespaceId":{"id":{"lower":3668642751,"higher":4287089794}},"duration":{"lower":10000,"higher":0}}

[CONFIRMED] SCGUWZ...
{"type":16718,"networkType":144,"version":2,"deadline":{"value":"2019-03-23T11:09:21.889"},"fee":{"lower":0,"higher":0},"signature":"5B5E5182C9DAAB7B23B777B0A71FCA3590E507D71FC595FB124804FAA8A703E37F23E1F465C9EEF5B5FDE2C29883E6F9AC90B103FC7FC3C3287B86699EACD806","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":4256,"higher":0},"hash":"3BD5D05D44E2589ACDD73E72F7BCC88CECFE46CC9ADF36817080EFB50C266DDE","merkleComponentHash":"3BD5D05D44E2589ACDD73E72F7BCC88CECFE46CC9ADF36817080EFB50C266DDE"},"namespaceType":0,"namespaceName":"test123","namespaceId":{"id":{"lower":3668642751,"higher":4287089794}},"duration":{"lower":10000,"higher":0}}
```

承認されたらURLで確認してみましょう。

APIのレスポンスだとすこし見にくいと思うので`nem2-cli`でも確認してみましょう。

```shell
$ nem2-cli namespace info -n test123 --profile alice
Namespace: test123
------------------

hexadecimal:    ff87cc82daab0bbf
uint:           [ 3668642751, 4287089794 ]
type:           Root namespace
owner:          SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
startHeight:    4256
endHeight:      14256
```

今回作ったのはルートネームスペースなので`type`が`Root namespace`と表示されています。

他にもレンタル開始ブロックと終了ブロックなども表示されます。


### コード解説

```javascript
const [parent, child] = namespace.split(/\.(?=[^\.]+$)/)

let registerTx
if (child) {
  registerTx = nem.RegisterNamespaceTransaction.createSubNamespace(
    nem.Deadline.create(),
    child,
    parent,
    nem.NetworkType.MIJIN_TEST
  )
} else {
  registerTx = nem.RegisterNamespaceTransaction.createRootNamespace(
    nem.Deadline.create(),
    parent,
    nem.UInt64.fromUint(blocks),
    nem.NetworkType.MIJIN_TEST
  )
}
```

ルートまたはサブの定義に使うオブジェクトはそれぞれ異なるので、その場合分けを行います。

それ以降はこのオブジェクトに署名して発信するだけです。

サブネームスペースを作りたい場合は`test123.sub123`のような引数を渡してください。

この際、先にルートネームスペースが承認済みである必要があります。


## ネームスペースをアグリゲートトランザクションで取得

前述のように、サブネームスペースを取得する場合は一度ルートネームスペースを取得し、承認されたあとにサブネームスペースを指定しなければなりません。

この順序を変えることはできませんが、これらのトランザクションをアグリゲートトランザクションで1つのトランザクションにすることができます。

`scripts/namespace/register_namespace_atomically.js`を実行してください。

このスクリプトは引数にドットで区切ったサブネームスペースを含めたネームスペース名を渡します。

第二引数でレンタル期間を指定できます。(ない場合は10,000ブロック)

```shell
$ node scripts/namespace/register_namespace_atomically.js aaa.bbb.ccc 10000
Initiater: SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
Endpoint:  http://localhost:3000/account/SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5
Blocks:    10000
Namespace: aaa (acccbcfcb5ecee23)
Endpoint:  http://localhost:3000/namespace/acccbcfcb5ecee23
Namespace: aaa.bbb (9e75f2396f24994e)
Endpoint:  http://localhost:3000/namespace/9e75f2396f24994e
Namespace: aaa.bbb.ccc (bfd5304c9be87a5c)
Endpoint:  http://localhost:3000/namespace/bfd5304c9be87a5c

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/5FB7A78EE421BA9301A805CFE0C25D17C393142783BEB04BF72DA6D80C43F03D
Hash:     5FB7A78EE421BA9301A805CFE0C25D17C393142783BEB04BF72DA6D80C43F03D
Signer:   64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0

[UNCONFIRMED] SCGUWZ...
{"type":16705,"networkType":144,"version":2,"deadline":{"value":"2019-03-24T17:56:08.502"},"fee":{"lower":0,"higher":0},"signature":"FFBB213B9C3B2A07C8335223013D944C1AAB41F24CB6C677044F73CFA7D0E4F41D5A787C7B1BE2A8C19FFA22AE95E0DABF37517B1D3B563EB5269324F8D70209","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"5FB7A78EE421BA9301A805CFE0C25D17C393142783BEB04BF72DA6D80C43F03D","merkleComponentHash":"5FB7A78EE421BA9301A805CFE0C25D17C393142783BEB04BF72DA6D80C43F03D"},"innerTransactions":[{"type":16718,"networkType":144,"version":2,"deadline":{"value":"2019-03-24T17:56:08.502"},"fee":{"lower":0,"higher":0},"signature":"FFBB213B9C3B2A07C8335223013D944C1AAB41F24CB6C677044F73CFA7D0E4F41D5A787C7B1BE2A8C19FFA22AE95E0DABF37517B1D3B563EB5269324F8D70209","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"namespaceType":0,"namespaceName":"aaa","namespaceId":{"id":{"lower":3052203555,"higher":2899098876}},"duration":{"lower":10000,"higher":0}},{"type":16718,"networkType":144,"version":2,"deadline":{"value":"2019-03-24T17:56:08.502"},"fee":{"lower":0,"higher":0},"signature":"FFBB213B9C3B2A07C8335223013D944C1AAB41F24CB6C677044F73CFA7D0E4F41D5A787C7B1BE2A8C19FFA22AE95E0DABF37517B1D3B563EB5269324F8D70209","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"namespaceType":1,"namespaceName":"bbb","namespaceId":{"id":{"lower":1864669518,"higher":2658529849}},"parentId":{"id":{"lower":3052203555,"higher":2899098876}}},{"type":16718,"networkType":144,"version":2,"deadline":{"value":"2019-03-24T17:56:08.502"},"fee":{"lower":0,"higher":0},"signature":"FFBB213B9C3B2A07C8335223013D944C1AAB41F24CB6C677044F73CFA7D0E4F41D5A787C7B1BE2A8C19FFA22AE95E0DABF37517B1D3B563EB5269324F8D70209","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"namespaceType":1,"namespaceName":"ccc","namespaceId":{"id":{"lower":2615704156,"higher":3218419788}},"parentId":{"id":{"lower":1864669518,"higher":2658529849}}}],"cosignatures":[]}

[CONFIRMED] SCGUWZ...
{"type":16705,"networkType":144,"version":2,"deadline":{"value":"2019-03-24T17:56:08.502"},"fee":{"lower":0,"higher":0},"signature":"FFBB213B9C3B2A07C8335223013D944C1AAB41F24CB6C677044F73CFA7D0E4F41D5A787C7B1BE2A8C19FFA22AE95E0DABF37517B1D3B563EB5269324F8D70209","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":7946,"higher":0},"hash":"5FB7A78EE421BA9301A805CFE0C25D17C393142783BEB04BF72DA6D80C43F03D","merkleComponentHash":"5FB7A78EE421BA9301A805CFE0C25D17C393142783BEB04BF72DA6D80C43F03D"},"innerTransactions":[{"type":16718,"networkType":144,"version":2,"deadline":{"value":"2019-03-24T17:56:08.502"},"fee":{"lower":0,"higher":0},"signature":"FFBB213B9C3B2A07C8335223013D944C1AAB41F24CB6C677044F73CFA7D0E4F41D5A787C7B1BE2A8C19FFA22AE95E0DABF37517B1D3B563EB5269324F8D70209","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"namespaceType":0,"namespaceName":"aaa","namespaceId":{"id":{"lower":3052203555,"higher":2899098876}},"duration":{"lower":10000,"higher":0}},{"type":16718,"networkType":144,"version":2,"deadline":{"value":"2019-03-24T17:56:08.502"},"fee":{"lower":0,"higher":0},"signature":"FFBB213B9C3B2A07C8335223013D944C1AAB41F24CB6C677044F73CFA7D0E4F41D5A787C7B1BE2A8C19FFA22AE95E0DABF37517B1D3B563EB5269324F8D70209","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"namespaceType":1,"namespaceName":"bbb","namespaceId":{"id":{"lower":1864669518,"higher":2658529849}},"parentId":{"id":{"lower":3052203555,"higher":2899098876}}},{"type":16718,"networkType":144,"version":2,"deadline":{"value":"2019-03-24T17:56:08.502"},"fee":{"lower":0,"higher":0},"signature":"FFBB213B9C3B2A07C8335223013D944C1AAB41F24CB6C677044F73CFA7D0E4F41D5A787C7B1BE2A8C19FFA22AE95E0DABF37517B1D3B563EB5269324F8D70209","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"namespaceType":1,"namespaceName":"ccc","namespaceId":{"id":{"lower":2615704156,"higher":3218419788}},"parentId":{"id":{"lower":1864669518,"higher":2658529849}}}],"cosignatures":[]}
```

トランザクションが承認されたらURLまたは`nem2-cli`で確認してみてください。

```shell
$ nem2-cli namespace info -n aaa.bbb.ccc --profile alice
Namespace: aaa.bbb.ccc
----------------------

hexadecimal:    bfd5304c9be87a5c
uint:           [ 2615704156, 3218419788 ]
type:           Sub namespace
owner:          SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
startHeight:    7946
endHeight:      17946

Parent Id: aaa.bbb.ccc
----------------------

hexadecimal:    9e75f2396f24994e
uint:           [ 1864669518, 2658529849 ]
```


### コード解説

```javascript
// 各レベルの登録トランザクションを生成
const txes = parts.reduce((accum, part, idx, array) => {
  const parent = array.slice(0, idx).join('.');
  let registerTx;
  if (accum.length === 0) {
    registerTx = nem.RegisterNamespaceTransaction.createRootNamespace(
      nem.Deadline.create(),
      part,
      nem.UInt64.fromUint(blocks),
      nem.NetworkType.MIJIN_TEST
    );
  } else {
    registerTx = nem.RegisterNamespaceTransaction.createSubNamespace(
      nem.Deadline.create(),
      part,
      parent,
      nem.NetworkType.MIJIN_TEST
    );
  }
  accum.push(registerTx);
  return accum;
}, []);

// アグリゲートコンプリートトランザクション組み立て
// トランザクションは前から処理されるので辻褄が合うように順序には気をつける
const aggregateTx = nem.AggregateTransaction.createComplete(
  nem.Deadline.create(),
  txes.map(tx => tx.toAggregate(initiater.publicAccount)),
  // 子から作ろうとするとエラーになる
  // txes.map(tx => tx.toAggregate(initiater.publicAccount)).reverse(),
  nem.NetworkType.MIJIN_TEST,
  []
);
```

ネームスペースの定義ごとの`RegisterNamespaceTransaction`オブジェクトを作成します。

各トランザクションをアグリゲート化して、アグリゲートトランザクションとしてまとめたら、署名をして配信します。


## モザイクとは

`nem`ネットワーク上に通貨を定義する機能です。

- [モザイク — NEM Developer Center](https://nemtech.github.io/ja/concepts/mosaic.html)

基軸モザイクである`cat.currency`もモザイクで、それと同等の定義となります。

モザイクには作成時に設定できる定義があります。

- 有効期間(ブロック数)
- 可分性(少数の最小値)
- 転送許可
- 供給量変更許可
- Levy変更許可

モザイク供給量はモザイク作成後に設定するトランザクションを発信します。

モザイクは`75caa6b686e7e7ba`というようなネットワーク上で一意なIDを持ちます。

先のネームスペースをこのモザイクIDと紐づくことで`test123`という名称のモザイクとして認識されるようになります。

モザイクについて`nem1`の仕様を知っている方は「おや？」と感じたかと思います。

これについては後の仕様変更にて触れます。


### モザイクの用途

モザイクは独自のサービス用通貨として、保有によるフラグ制御や値の表現として、発行者と受信者間だけでやり取りされる権利の表現としてなど、

モザイクをどう使うかはそのサービス提供者の手腕が問われます。


## モザイクの作成

`scripts/create_mosaic.js`を実行してください。

このコードはモザイク有効期間を引数にとりますが、ない場合は`10000`を指定します。

```javascript
$ node scripts/mosaic/create_mosaic.js
Initiater:    SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
Endpoint:     http://localhost:3000/account/SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5
Mosaic Nonce: 114,2,14,52
Mosaic Hex:   75caa6b686e7e7ba
Endpoint:     http://localhost:3000/mosaic/75caa6b686e7e7ba

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/164AB63F3C01DFEB7AB07D9D55EE825A158D3974008672DE7D7386292F33E743
Hash:     164AB63F3C01DFEB7AB07D9D55EE825A158D3974008672DE7D7386292F33E743
Signer:   64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0

[UNCONFIRMED] SCGUWZ...
{"type":16717,"networkType":144,"version":3,"deadline":{"value":"2019-03-23T14:29:05.013"},"fee":{"lower":0,"higher":0},"signature":"8CC42F39B802038A2D06ADC46C4EFDE17B6C1330779B3AC913D310BCAFC5AA85C2EF35230A4255C37D12079739699EF9E3148F93120B6B94F7F7BE47C0377F03","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"164AB63F3C01DFEB7AB07D9D55EE825A158D3974008672DE7D7386292F33E743","merkleComponentHash":"164AB63F3C01DFEB7AB07D9D55EE825A158D3974008672DE7D7386292F33E743"},"nonce":873333362,"mosaicId":{"id":{"lower":2263345082,"higher":1976215222}},"mosaicProperties":{"divisibility":0,"duration":{"lower":10000,"higher":0},"supplyMutable":true,"transferable":true,"levyMutable":false}}

[CONFIRMED] SCGUWZ...
{"type":16717,"networkType":144,"version":3,"deadline":{"value":"2019-03-23T14:29:05.013"},"fee":{"lower":0,"higher":0},"signature":"8CC42F39B802038A2D06ADC46C4EFDE17B6C1330779B3AC913D310BCAFC5AA85C2EF35230A4255C37D12079739699EF9E3148F93120B6B94F7F7BE47C0377F03","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":4653,"higher":0},"hash":"164AB63F3C01DFEB7AB07D9D55EE825A158D3974008672DE7D7386292F33E743","merkleComponentHash":"164AB63F3C01DFEB7AB07D9D55EE825A158D3974008672DE7D7386292F33E743"},"nonce":873333362,"mosaicId":{"id":{"lower":2263345082,"higher":1976215222}},"mosaicProperties":{"divisibility":0,"duration":{"lower":10000,"higher":0},"supplyMutable":true,"transferable":true,"levyMutable":false}}
```

承認されたらURLで確認してみましょう。
APIのレスポンスだとすこし見にくいと思うので`nem2-cli`でも確認してみましょう。

```shell
$ nem2-cli mosaic info -h 75caa6b686e7e7ba --profile alice
Mosaic: Hex:    75caa6b686e7e7ba
Uint64:         [ 2263345082, 1976215222 ]

divisibility:   0
transferable:   true
supply mutable: true
block height:   4653
duration:       10000
owner:          SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
supply:         0
```

この時点ではまだ供給量を設定していないので、定義だけが存在していてモザイクは発行されていない状態なので`supply 0`と表示されています。

次に`scripts/mutate_mosaic_supply.js`を実行してください。

このコードは第一引数にモザイクIDを、第二引数に供給量を、第三引数に`add`(追加)または`remove`(削除)を指定します。

モザイクIDには直前に作成したモザイクの16進数文字列を指定してください。

```shell
$ node scripts/mosaic/mutate_mosaic_supply.js 75caa6b686e7e7ba 10000 add
Initiater:  SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
Endpoint:   http://localhost:3000/account/SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5
Mosaic Hex: 75caa6b686e7e7ba
Supply:     10000
Delta:      add
Endpoint:   http://localhost:3000/mosaic/75caa6b686e7e7ba

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/5678903516A4AD7F601489779FB74D85F34C38FCF3B1A9BDD0E548FE4DFF23E7
Hash:     5678903516A4AD7F601489779FB74D85F34C38FCF3B1A9BDD0E548FE4DFF23E7
Signer:   64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0

[UNCONFIRMED] SCGUWZ...
{"type":16973,"networkType":144,"version":2,"deadline":{"value":"2019-03-23T16:30:59.813"},"fee":{"lower":0,"higher":0},"signature":"2523C329452B031AA2DB767D6FB66D6BF33536789E133ACCCC413FD3BA737502118F7D368F016B6085BF585A8E5FAD6E17155D6DC14FE4F5497FE21361A64E00","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"5678903516A4AD7F601489779FB74D85F34C38FCF3B1A9BDD0E548FE4DFF23E7","merkleComponentHash":"5678903516A4AD7F601489779FB74D85F34C38FCF3B1A9BDD0E548FE4DFF23E7"},"mosaicId":{"id":{"lower":2263345082,"higher":1976215222}},"direction":1,"delta":{"lower":10000,"higher":0}}

[CONFIRMED] SCGUWZ...
{"type":16973,"networkType":144,"version":2,"deadline":{"value":"2019-03-23T16:30:59.813"},"fee":{"lower":0,"higher":0},"signature":"2523C329452B031AA2DB767D6FB66D6BF33536789E133ACCCC413FD3BA737502118F7D368F016B6085BF585A8E5FAD6E17155D6DC14FE4F5497FE21361A64E00","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":4894,"higher":0},"hash":"5678903516A4AD7F601489779FB74D85F34C38FCF3B1A9BDD0E548FE4DFF23E7","merkleComponentHash":"5678903516A4AD7F601489779FB74D85F34C38FCF3B1A9BDD0E548FE4DFF23E7"},"mosaicId":{"id":{"lower":2263345082,"higher":1976215222}},"direction":1,"delta":{"lower":10000,"higher":0}}
```

承認されたらもう一度モザイクのリソースURLを確認するか、`nem2-cli`で確認してみましょう。

```shell
$ nem2-cli mosaic info -h 75caa6b686e7e7ba --profile alice
Mosaic: Hex:    75caa6b686e7e7ba
Uint64:         [ 2263345082, 1976215222 ]

divisibility:   0
transferable:   true
supply mutable: true
block height:   4653
duration:       10000
owner:          SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
supply:         10000
```

今度は`supply`に指定した量が表示されています。さらに、`alice`の持っているモザイクにも現れました。

```shell
$ nem2-cli account info --profile alice
Account:        SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
-------------------------------------------------------

Address:        SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
at height:      64

PublicKey:      64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0
at height:      77

Importance:     0
at height:      0

Mosaics
75caa6b686e7e7ba:       10000
7d09bf306c0b2e38:       56079.909091
```

これでモザイクの定義は完了です。


### コード解説

```javascript
const definitionTx = nem.MosaicDefinitionTransaction.create(
  nem.Deadline.create(),
  nonce,
  mosId,
  nem.MosaicProperties.create({
    duration: nem.UInt64.fromUint(blocks),
    divisibility: 0,
    transferable: true,
    supplyMutable: true,
    levyMutable: false
  }),
  nem.NetworkType.MIJIN_TEST
);
```

モザイク定義は`MosaicDefinitionTransaction`オブジェクトを作成します。

`MosaicProperties.create`によってモザイクの性質プロパティを設定しています。

これに署名をして発信します。

続いて、供給量の指定のコードです。

```javascript
const supplyType = delta === 'remove'
  ? nem.MosaicSupplyType.Decrease
  : nem.MosaicSupplyType.Increase

const supplyTx = nem.MosaicSupplyChangeTransaction.create(
  nem.Deadline.create(),
  mosId,
  supplyType,
  nem.UInt64.fromUint(absSupply),
  nem.NetworkType.MIJIN_TEST
);
```

モザイクID、追加または削除の固定値、供給量を指定して`MosaicSupplyChangeTransaction`オブジェクトを作成します。

これに署名をして発信します。


## モザイクを供給量とともに定義する

前述のネームスペースのように、アグリゲートトランザクションでトランザクションをまとめることで、定義と供給量の設定を一括で行うことができます。

`scripts/create_mosaic_with_supply.js`を実行してください。

このコードは第一引数に供給量を絶対値で指定してください。

第二引数にはモザイク有効期間を引数にとりますが、ない場合は`10000`を指定します。

```shell
$ node mosaic/create_mosaic_with_supply.js 999
Initiater:    SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
Endpoint:     http://localhost:3000/account/SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5
Mosaic Nonce: 3,69,180,223
Mosaic Hex:   1d967f35b9c255dc
Blocks:       10000
Supply:       999
Endpoint:     http://localhost:3000/mosaic/1d967f35b9c255dc

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/B947E6116099ED98841AD041734F22A9972216E038226744C31A50804F69A556
Hash:     B947E6116099ED98841AD041734F22A9972216E038226744C31A50804F69A556
Signer:   64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0

[UNCONFIRMED] SCGUWZ...
{"type":16705,"networkType":144,"version":2,"deadline":{"value":"2019-03-25T08:41:08.827"},"fee":{"lower":0,"higher":0},"signature":"8BFDA54D2B4CA2FCCB4FA800B1203FBB10887614B1DB69FB89B8FEE2051E9DAB8D553B8215C9085454F76997C6BECF64FF8A04F42D7371562ACB23F098990807","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"B947E6116099ED98841AD041734F22A9972216E038226744C31A50804F69A556","merkleComponentHash":"B947E6116099ED98841AD041734F22A9972216E038226744C31A50804F69A556"},"innerTransactions":[{"type":16717,"networkType":144,"version":3,"deadline":{"value":"2019-03-25T08:41:08.827"},"fee":{"lower":0,"higher":0},"signature":"8BFDA54D2B4CA2FCCB4FA800B1203FBB10887614B1DB69FB89B8FEE2051E9DAB8D553B8215C9085454F76997C6BECF64FF8A04F42D7371562ACB23F098990807","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"nonce":3753133315,"mosaicId":{"id":{"lower":3116520924,"higher":496402229}},"mosaicProperties":{"divisibility":0,"duration":{"lower":10000,"higher":0},"supplyMutable":true,"transferable":true,"levyMutable":false}},{"type":16973,"networkType":144,"version":2,"deadline":{"value":"2019-03-25T08:41:08.827"},"fee":{"lower":0,"higher":0},"signature":"8BFDA54D2B4CA2FCCB4FA800B1203FBB10887614B1DB69FB89B8FEE2051E9DAB8D553B8215C9085454F76997C6BECF64FF8A04F42D7371562ACB23F098990807","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"mosaicId":{"id":{"lower":3116520924,"higher":496402229}},"direction":1,"delta":{"lower":999,"higher":0}}],"cosignatures":[]}

[CONFIRMED] SCGUWZ...
{"type":16705,"networkType":144,"version":2,"deadline":{"value":"2019-03-25T08:41:08.827"},"fee":{"lower":0,"higher":0},"signature":"8BFDA54D2B4CA2FCCB4FA800B1203FBB10887614B1DB69FB89B8FEE2051E9DAB8D553B8215C9085454F76997C6BECF64FF8A04F42D7371562ACB23F098990807","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":9712,"higher":0},"hash":"B947E6116099ED98841AD041734F22A9972216E038226744C31A50804F69A556","merkleComponentHash":"B947E6116099ED98841AD041734F22A9972216E038226744C31A50804F69A556"},"innerTransactions":[{"type":16717,"networkType":144,"version":3,"deadline":{"value":"2019-03-25T08:41:08.827"},"fee":{"lower":0,"higher":0},"signature":"8BFDA54D2B4CA2FCCB4FA800B1203FBB10887614B1DB69FB89B8FEE2051E9DAB8D553B8215C9085454F76997C6BECF64FF8A04F42D7371562ACB23F098990807","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"nonce":3753133315,"mosaicId":{"id":{"lower":3116520924,"higher":496402229}},"mosaicProperties":{"divisibility":0,"duration":{"lower":10000,"higher":0},"supplyMutable":true,"transferable":true,"levyMutable":false}},{"type":16973,"networkType":144,"version":2,"deadline":{"value":"2019-03-25T08:41:08.827"},"fee":{"lower":0,"higher":0},"signature":"8BFDA54D2B4CA2FCCB4FA800B1203FBB10887614B1DB69FB89B8FEE2051E9DAB8D553B8215C9085454F76997C6BECF64FF8A04F42D7371562ACB23F098990807","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"mosaicId":{"id":{"lower":3116520924,"higher":496402229}},"direction":1,"delta":{"lower":999,"higher":0}}],"cosignatures":[]}
```

前述の作業を一括で行っているだけなので省略しますが、作成されたモザイクの定義と供給量の存在を確認してみてください。


## ネームスペースのリンク

前述の通り、ネームスペースはモザイクまたはアカウントへリンクすることができます。

- [ネームスペース — NEM Developer Center](https://nemtech.github.io/ja/concepts/namespace.html#alias)

ネームスペースをモザイクへリンクすることで、ネームスペース名によってモザイクを認識することができるようになります。


### ネームスペースをモザイクにリンクする

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

`scripts/namespace/link_mosaic.js test123 75caa6b686e7e7ba`

```shell
$ node scripts/namespace/link_mosaic.js test123 75caa6b686e7e7ba
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


#### コード解説

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


### ネームスペースをアカウントにリンクする

ネームスペースをモザイクへリンクすることで、ネームスペース名によってモザイクを認識することができるようになります。

リンクする前にネームスペース名でモザイクを取得するコードを実行してみましょう。

以下はモザイクへリンクする場合とほぼ同様のコードのため、結果やコード解説を省きます。

詳しくはコードを実行したり、開いて確認してみてください。


```shell
# ネームスペース`alice`を取得
$ node scripts/namespace/register_namespace.js alice

# ネームスペースで取得に失敗することを確認
$ node scripts/namespace/fetch_account_by_alias.js alice

# ネームスペースをアカウントへリンク
$ node scripts/namespace/link_account.js alice SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5

# 取得できることを確認
$ node scripts/namespace/fetch_account_by_alias.js alice
Namespace: alice (9cf66fb0cfeed2e0)
Endpoint:  http://localhost:3000/namespace/9cf66fb0cfeed2e0

Namespace: alice
Address:   SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
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

