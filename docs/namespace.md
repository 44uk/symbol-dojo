# ネームスペース

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


## ネームスペースの用途

ネームスペースは各レベルごとにアカウントのエイリアスまたはモザイクのエイリアス(別名)として割り当てることができます。

例えば`foo`をアカウントAへ、`foo.bar`をアカウントBへ、`foo.bar.baz`をモザイクに紐付けるということができます。

基軸モザイクである`cat.currency`もモザイク定義に`cat.currency`というネームスペースが割当てられています。

エイリアスとして利用するには、後述しているエイリアスリンクトランザクションを使います。


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
