# アカウントフィルタ

アカウントにブロックチェーンレベルで動作するトランザクションのフィルタを定義する機能です。

- [アカウントフィルタ — NEM Developer Center](https://nemtech.github.io/ja/concepts/account-filter.html)

同様の機能を表現することは、アプリケーションレベルでも提供することができますが、フィルタに引っかかったトランザクションはエラーとして扱われるため、ブロックチェーンに取りこまれなくなります。


## 受信トランザクションフィルタ

アカウントに、トランザクションの受信可否をブラック・ホワイトリスト形式で設定する機能です。

- 余計なトランザクションを意図しないアカウントから受け入れたくない
- 特定のアドレスからのトランザクションを受け入れたくない


## 受信モザイクフィルタ

アカウントに、モザイクの受信可否をブラック・ホワイトリスト形式で設定する機能です。

- マーキング用のモザイク以外受け取りたくない
- 既知の不要なモザイクを受け取りたくない


## 送信トランザクションフィルタ

アカウントに、トランザクションの種類ごとに制限をかける機能です。

自分自身が設定することになるので、誤操作によるトランザクションの送信防止が主な目的のようです。


## 受信トランザクションブロックフィルタを設定する

`scripts/filter/address.js`を実行してください。

このスクリプトは第一引数にアドレスを指定し、第二引数には`block/allow`、第三引数に`add/remove`を指定します。

ここではアドレスをブロック対象に追加してみます。

```javascript
$ node filter/address.js SC3AWBHBY2ABQHQY3QAJLO4HXSJ6IZVAYLN52HO4 block add
Initiater: SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5
Endpoint:  http://localhost:3000/account/SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5
Block:     SC3AWB-HBY2AB-QHQY3Q-AJLO4H-XSJ6IZ-VAYLN5-2HO4
Property:  block
Modify:    add
Endpoint:  http://localhost:3000/account/properties/SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5
Endpoint:  http://localhost:3000/account/SC3AWBHBY2ABQHQY3QAJLO4HXSJ6IZVAYLN52HO4

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/4BE73D49A6ADFD434DEBDC868B6ED912C2A0766986DDFC7A04C5D2E9E55EB1AD
Hash:     4BE73D49A6ADFD434DEBDC868B6ED912C2A0766986DDFC7A04C5D2E9E55EB1AD
Signer:   64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0

[UNCONFIRMED] SCGUWZ...
{"type":16720,"networkType":144,"version":1,"deadline":{"value":"2019-03-24T12:36:46.748"},"fee":{"lower":0,"higher":0},"signature":"BDCE2C7D70B6BD475DAFDBCCA2CED727AF1B071FAD811AB03221C1CAC0ADCBE1EADE54C80672950A5C2257F3E2E6F66C885259008E2111BF254A95D7F83F5E00","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":0,"higher":0},"hash":"4BE73D49A6ADFD434DEBDC868B6ED912C2A0766986DDFC7A04C5D2E9E55EB1AD","merkleComponentHash":"4BE73D49A6ADFD434DEBDC868B6ED912C2A0766986DDFC7A04C5D2E9E55EB1AD"},"propertyType":129,"modifications":[{"modificationType":0,"value":"90B60B04E1C680181E18DC0095BB87BC93E466A0C2DBDD1DDC"}]}

[CONFIRMED] SCGUWZ...
{"type":16720,"networkType":144,"version":1,"deadline":{"value":"2019-03-24T12:36:46.748"},"fee":{"lower":0,"higher":0},"signature":"BDCE2C7D70B6BD475DAFDBCCA2CED727AF1B071FAD811AB03221C1CAC0ADCBE1EADE54C80672950A5C2257F3E2E6F66C885259008E2111BF254A95D7F83F5E00","signer":{"publicKey":"64DFE4120D0F960C6602B9386542768556D2CD5242975F37837C8C5F238C78C0","address":{"address":"SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5","networkType":144}},"transactionInfo":{"height":{"lower":7309,"higher":0},"hash":"4BE73D49A6ADFD434DEBDC868B6ED912C2A0766986DDFC7A04C5D2E9E55EB1AD","merkleComponentHash":"4BE73D49A6ADFD434DEBDC868B6ED912C2A0766986DDFC7A04C5D2E9E55EB1AD"},"propertyType":129,"modifications":[{"modificationType":0,"value":"90B60B04E1C680181E18DC0095BB87BC93E466A0C2DBDD1DDC"}]}
```

まだ、このスクリプトを実行したターミナルは閉じないでください。

承認されたらURLにアクセスしてみて、設定されていることを確認してください。

```json
{
    accountProperties: {
        address: "kI1LZKLI1IgIAknVJkZ/j/tceLAyXUJlvQ==",
        properties: [
            {
                propertyType: 129,
                values: [
                    "kLYLBOHGgBgeGNwAlbuHvJPkZqDC290d3A=="
                ]
            },
            {
                propertyType: 130,
                values: []
            },
            {
                propertyType: 132,
                values: []
            }
        ]
    }
}
```

値が`Base64`形式だったり、マジックナンバーでわかりにくいですが、ひとまず設定されたことだけを確認してください。

ブロック設定したアドレスからトランザクションを送ってみてください。

```shell
nem2-cli transaction transfer -r SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5 -c @cat.currency::1000000 --profile bob
```

このトランザクションがフィルタにブロックされると開いているターミナルにエラーが表示されます。

```shell
[STATUS] SCGUWZ...
{"hash":"4219FD82E70DA487841248DE75B1634F141B0B7187F2E60CBF3E59A915040222","status":"Failure_Property_Signer_Address_Interaction_Not_Allowed","deadline":{"value":"2019-03-24T13:12:49.218"}}
```

送信元のアドレスと送信先のアドレスで残高が変化していないことを確認してみてください。

```shell
$ nem2-cli account info --profile alice
```

```shell
$ nem2-cli account info --profile bob
```
