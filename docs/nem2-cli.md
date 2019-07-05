# nem2-cli

アカウントを登録して、nemネットワークからAPI経由で情報を取得したり、トランザクションを発行したりすることができるコマンドラインツールです。

- [クライアント — NEM Developer Center](https://nemtech.github.io/ja/cli.html)


## プロファイルの登録

ウォレットのようにアカウントにプロファイル名をつけて保存し、呼び出して使うことができます。

プロファイルは`~/.nem2rc.json`としてこのように保存されます。

```json
{"alice":{"privateKey":"7EF4AAA5507C7DBDFDD30D52922DF3AC46D2384593FA2E620D19848ED7F60636","networkType":144,"url":"http://localhost:3000","networkGenerationHash":"53F73344A12341618CEE455AC412A0B57D41CEC058965511C0BA016156F4BF47"}}
```


### アカウントの生成

新しいアカウントを生成します。

オプションで指定することで、生成と同時にプロファイルとして保存もします。

```shell
$ nem2-cli account generate -n MIJIN_TEST -u http://localhost:3000 -s --profile alice
New Account:	SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
Public Key:	A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0
Private Key:	7EF4AAA5507C7DBDFDD30D52922DF3AC46D2384593FA2E620D19848ED7F60636

Stored alice profile
```

ここでは各設定をオプションで渡しましたが、指定しない場合は対話式で入力していきます。

`--profile`オプションで、プロファイルに`alice`と名付けました。

今後このプロファイルを使ってコマンドを実行するときには`--profile alice`を指定します。

```shell
$ nem2-cli account info --profile alice
Error {"code":"ResourceNotFound","message":"no resource exists with id 'SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4'"}
```

まだこのアカウントはネットワーク上で認識されていないため`ResourceNotFound`が返ってきますが、このようにしてプロファイルの指定をします。

もう一つ`bob`というプロファイル名でアカウントを作っておきます。

```shell
$ nem2-cli account generate -n MIJIN_TEST -u http://localhost:3000 -s --profile bob
New Account:	SCJ3XM-WIITJT-5DIFZY-KQ27VD-IYYKAV-XIAAMJ-W6K2
Public Key:	97980E89374802B5A0DD63D32A3897496431486E9DB210B00B43A9B41D08550B
Private Key:	72524C849DF216E0FE96A5011B1329107993D9DE39D0574835CB47511253AD61

Stored bob profile
```

なお、`--profile`オプションを省略した場合は`default`という名前が使用されます。

今回は登録していませんが、`--profile`を指定しなかった場合は`default`という名前で登録したプロファイルで動作します。


### プロファイルの登録(ローカルにネットワークを構築している場合)

ウォレットのようにプロファイルという形でアカウントを登録します。

ここでは初期分配されたアカウントを登録してみましょう。

`addresses.yml`の`nemesis_addresses:`セクションのうち、**前20件**から任意のアカウントの秘密鍵を選んでください。

```shell
nem2-cli profile create -n MIJIN_TEST -p 7F4AFBB8B8C009EA21F1AF243DC20CD2B551FD79D4B5877054186BDDAE012FA6 -u http://localhost:3000 --profile nemesis1

Profile stored correctly
nemesis1->
	Network:	MIJIN_TEST
	Url:		http://localhost:3000
	GenerationHash:	53F73344A12341618CEE455AC412A0B57D41CEC058965511C0BA016156F4BF47
	Address:	SCD3UFCNDZ3AYOAX5SMYW56OWITPWK4DGHRIASPI
	PublicKey:	9D5F3C543293458521020F5260B1CEBCFEF6846AAD4EC9DE5E1D658F1B850023
	PrivateKey:	7F4AFBB8B8C009EA21F1AF243DC20CD2B551FD79D4B5877054186BDDAE012FA6
```

`--profile nemesis1`にて`nemesis1`というプロファイル名をつけました。

こちらも同様に、プロファイルを使ってコマンドを叩く際には`--profile nemesis1`をつけて実行します。


### アカウント情報の取得

先程の初期分配アドレスの確認ではアドレスを直接指定しましたが、今度はプロファイルを指定してみます。

```shell
$ nem2-cli account info --profile nemesis1
Account:	SCMK5Y-DNUATK-IFHBV4-Y22VEX-3N4YBV-BT5YG4-AX5V
-------------------------------------------------------

Address:	SCMK5Y-DNUATK-IFHBV4-Y22VEX-3N4YBV-BT5YG4-AX5V
at height:	1

PublicKey:	0000000000000000000000000000000000000000000000000000000000000000
at height:	0

Importance:	3750000
at height:	1

Mosaics
75bd75ce0203c054:	3750
3f859f237d36c3ae:	449949999.9
```

先の確認と同じフォーマットで結果が表示されます。

こちらは初期分配を受け取っており、ネットワーク上に認識されたアカウントなので情報を表示できます。


## 転送トランザクション

モザイクを送るトランザクションを発信してみましょう。


### 初期分配アカウントから配布する(ローカルにネットワークを構築している場合)

`10,000 cat.currency`ほど`nemesis1`から`alice`へ配布してください。

`@cat.currency::10000000000`は`cat.currency`というネームスペースが紐付けられたモザイクを意味します。

絶対値で指定する必要があるので、可分性`6`を加味した`10000000000`を指定します。

```shell
$ nem2-cli transaction transfer -r SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4 -c @cat.currency::10000000000 --profile nemesis1
Transaction announced correctly
Hash:    711B9A48414D3BDB92B12A4D113420BA948A8CCC090F6F776DF9C83E6B61A900
Signer:  7F4AFBB8B8C009EA21F1AF243DC20CD2B551FD79D4B5877054186BDDAE012FA6
```

表示された`Hash`を引数に`transaction status`コマンドでトランザクションの成功を確認してみます。

```shell
$ nem2-cli transaction status -h D99B59C76C9ABA91D5BC9DDD5DCBBDC3EF38FFDC044DA00B51ABAB769F0FFFC5 --profile nemesis1
group: confirmed
status: Success
hash: < D99B59C76C9ABA91D5BC9DDD5DCBBDC3EF38FFDC044DA00B51ABAB769F0FFFC5 >
deadline: 2019-07-05T15:32:12.974
height: 298
```

`group`が`confirmed`となっていればブロックチェーンに書き込まれています。

宛先の`alice`に`10,000 cat.currency`届いているかを確認してみましょう。

```shell
$ nem2-cli account info --profile alice
Account:	SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
-------------------------------------------------------

Address:	SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
at height:	298

PublicKey:	0000000000000000000000000000000000000000000000000000000000000000
at height:	0

Importance:	0
at height:	0

Mosaics
3f859f237d36c3ae:	10000
```

`nem2-cli`を用いてモザイクを送りたい場合はこのようにして送信できます。


### 初期分配アカウントの秘密鍵がわからない場合(用意されたネットワークを使用している場合など)

公開されているネットワークを使用している場合は、そのネットワークの管理者から`alice`のアカウントへ`10000 cat.currency`を入手してください。

ネットワーク提供者が誰でも利用可能な蛇口などを公開している場合はそれを利用してください。


### aliceからbobへ受け渡す

`alice`から`bob`へ`10 cat.currency`とメッセージを送ってみましょう。

```shell
$ nem2-cli transaction transfer -r SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2 -c @cat.currency::10000000 -m "Hello, Bob" --profile alice
Transaction announced correctly
Hash:    38298286E32D18CA73B53314870972BBD56F27C1819ABB1592A273741A69DE5D
Signer:  A29FE98485D2841C7C68A2B521156EE5D0170FF6AFF2ED3BF4E908500EC083B0
```

こちらもオプションを指定しなかった場合は対話的に入力を求められます。

レスポンスの通り、トランザクションが受理されたので、少し待ってから`bob`の残高を確認します。


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
3f859f237d36c3ae:	10
```

`Mosaics`の部分に受け取ったモザイクが表示されました。

16進数のモザイクIDで表示されるので若干わかりにくいですが、`3f859f237d36c3ae`は`cat.currency`を表します。

(`3f859f237d36c3ae`というモザイクIDはネットワークごとに異なる場合があります)


## アカウントのモニタリング

今度はアカウントがトランザクションを受け取ったり、受理されたり、エラーになったかどうかを確認してみます。

`monitor`のサブコマンドを実行すると待機状態になり、ステータスが変わるたびにその情報が流れてきます。


### トランザクションのエラーの捕捉

トランザクションを発信したとき、それに関するエラーが起きた場合に通知がきます。

例えばアカウントの残高が足りていなかったり、登録しようとしたネームスペースが既に取得されていた場合、署名が壊れていた場合などです。

試しに`alice`が持ち合わせていない量のモザイクを送ろうとしてみましょう。

もう一つターミナルを開いて、モニタリングを開始します。

```shell
$ nem2-cli monitor status --profile alice
Monitoring SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4 using http://localhost:3000
connection open
```


続いて、持ち合わせていない量のモザイクを指定して、トランザクションを送信します。

```shell
$ nem2-cli transaction transfer -r SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2 -c @cat.currency::409090909000000 --profile alice
Transaction announced correctly
Hash:    1813FDF4A9AA43147AB5B035140A2D321ABA4674494C8D1A4F902A551BE07739
Signer:  294D4385F2AB9EA0D3A4070C9219784E269A96EDEB8A1679EA938BE639509826
```

`Transaction announced correctly`となり、発行はエラーになりませんがモニタリングしている方へ通知が届きます。

```shell
Hash: 1055E87CB6018DB55CFA1A88EBF3E78A7821B61C9F726B31596FBCAC419FD97A
Error code: Failure_Core_Insufficient_Balance
Deadline: 2019-07-05 15:57:29.685
```

`Failure_Core_Insufficient_Balance`は残高不足の意味です。

なお、各種エラーメッセージの内容は以下で確認できます。

- [REST API — NEM Developer Center](https://nemtech.github.io/ja/api.html#status-errors)

トランザクションのエラーはこのようにしてモニタリング(`websocket`を経由)して補足できます。

APIサーバへのトランザクション送信は残高不足などのトランザクションに不備があっても必ず成功レスポンスを返却します。

そのトランザクションがネットワークに受理されたかどうかはモニタリングでエラーを捕捉するか、

`http://localhost:3000/transaction/<TRANSACTION_HASH>/status` にアクセスすることでトランザクションの状態を確認することができます。

```json
{
    hash: "1813FDF4A9AA43147AB5B035140A2D321ABA4674494C8D1A4F902A551BE07739",
    status: "Failure_Core_Insufficient_Balance",
    deadline: [
        2620885366,
        23
    ],
    group: "failed"
}
```

`status`を取得するコマンドも`nem2-cli`に用意されています。

```shell
$ nem2-cli transaction status -h 1055E87CB6018DB55CFA1A88EBF3E78A7821B61C9F726B31596FBCAC419FD97A --profile alice
group: failed
status: Failure_Core_Insufficient_Balance
hash: < 1055E87CB6018DB55CFA1A88EBF3E78A7821B61C9F726B31596FBCAC419FD97A >
deadline: 2019-07-05T15:57:29.685
```


### 未承認トランザクションの捕捉

`bob`が受け取るトランザクションが発生したときに、それを取得してみます。

```shell
$ nem2-cli monitor unconfirmed --profile bob
Monitoring SCJ3XM-WIITJT-5DIFZY-KQ27VD-IYYKAV-XIAAMJ-W6K2 using http://localhost:3000
connection open
```

未承認トランザクションが発生したとき、情報が流れてきます。

`alice`がトランザクションを発信した直後に流れてくるでしょう。

上記のコマンドを実行して、モニタリングが始まった状態で`alice`からモザイクを送ってみてください。

```shell
$ nem2-cli transaction transfer -r SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2 -c @cat.currency::1000000 -m "Bob monitors unconfirmed" --profile alice
```

するとモニタしていたウィンドウにトランザクションが現れます。

```shell
$ nem2-cli monitor unconfirmed --profile bob
Monitoring SCJ3XM-WIITJT-5DIFZY-KQ27VD-IYYKAV-XIAAMJ-W6K2 using http://localhost:3000
connection open

TransferTransaction: Recipient:SCJ3XM-WIITJT-5DIFZY-KQ27VD-IYYKAV-XIAAMJ-W6K2 Message:"Bob monitors unconfirmed" Mosaics: NamespaceId:85bbea6cc462b244::1000000 Signer:SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4 Deadline:2019-07-05 Hash:80819891793B5271F0798DCFA99547A14ADBF901A09474F4A040E33F8D1380C0
```

未承認状態として追加されたトランザクションが表示されました。


### 承認トランザクションの捕捉

同様にトランザクションが承認されたときの情報を取得してみます。

```shell
$ nem2-cli monitor confirmed --profile bob
Monitoring SCJ3XM-WIITJT-5DIFZY-KQ27VD-IYYKAV-XIAAMJ-W6K2 using http://localhost:3000
connection open
```

トランザクションが承認されると、情報が流れてきます。

`alice`のトランザクションが承認され`bob`の残高に反映されるときに流れてきます。

上記のコマンドを実行して、モニタリングが始まった状態で`alice`からモザイクを送ってみてください。

```shell
$ nem2-cli transaction transfer -r SCJ3XMWIITJT5DIFZYKQ27VDIYYKAVXIAAMJW6K2 -c @cat.currency::1000000 -m "Bob monitors confirmed" --profile alice
```

しばらくしてトランザクションが承認されると、モニタしていたウィンドウにトランザクションが現れます。

```shell
$ nem2-cli monitor confirmed --profile bob
Monitoring SCJ3XM-WIITJT-5DIFZY-KQ27VD-IYYKAV-XIAAMJ-W6K2 using http://localhost:3000
connection open

TransferTransaction: Recipient:SCJ3XM-WIITJT-5DIFZY-KQ27VD-IYYKAV-XIAAMJ-W6K2 Message:"Bob monitors confirmed" Mosaics: NamespaceId:85bbea6cc462b244::1000000 Signer:SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4 Deadline:2019-07-05 Hash:D95716F627ED74DC2594F59E2074B2CDD5026157FF08AB443FA1950163C11866
```


### その他のトランザクションタイプ

自分が関係するアグリゲートトランザクションやマルチシグなどで署名が必要なトランザクションのモニターなどがあります。

```shell
$ nem2-cli monitor

  USAGE

    nem2-cli monitor <subcommand>

  SUBCOMMANDS

    aggregatebonded - Monitor aggregate bonded transactions added
    block           - Monitor new blocks
    confirmed       - Monitor confirmed transactions added
    cosignature     - Monitor cosignatures added
    status          - Monitor transaction status error
    unconfirmed     - Monitor unconfirmed transactions added
```

モニタリングしたいトランザクションのタイプを指定して監視を始めます。

複数のタイプを監視したい場合は複数枚のウィンドウを開いて、それぞれでコマンドを叩いてください。

```shell
$ nem2-cli monitor block --profile bob
Using http://localhost:3000
connection open


BlockInfo {
  hash:
   '30A396B34CCBDB477AF962F721A6C2E5951948D500197F7FA7AB77C0BF32C76A',
  generationHash:
   '1B15EB6062E7F2DCF01CAAF12813517E558E4337302E6C6D04CE449995D34C49',
  totalFee: UInt64 { lower: 0, higher: 0 },
  numTransactions: undefined,
  signature:
   'EF2C80D87A12EFD38BC6FEC460377E8846DD7CF0ED7926A6427670B532679DB72056B8BBDBA4BD81884AE1936FEF92F1642338FF7D66196FFEEDE59120AF1D08',
  signer:
   PublicAccount {
     publicKey:
      '1657E5568F833E4A2AEBBA56BF9265E9CFBDAD2CCD2181BB699FE918EF89B56E',
     address:
      Address {
        address: 'SBWSQTF63PRCCLHLUF3ITZAVNLJESQ6N4KMHN5PB',
        networkType: 144 } },
  networkType: 144,
  version: 3,
  type: 33091,
  height: UInt64 { lower: 440, higher: 0 },
  timestamp: UInt64 { lower: 4050218533, higher: 23 },
  difficulty: UInt64 { lower: 1010403612, higher: 8773 },
  feeMultiplier: undefined,
  previousBlockHash:
   '0000000058C368685EBD494A949A1ED22B1D974E8108F8872462128ACD597183',
  blockTransactionsHash:
   'A00E794D00000000000000000000000000000000000000000000000000000000',
  blockReceiptsHash: undefined,
  stateHash: undefined,
  beneficiaryPublicKey: undefined }
```

例えばこれは`monitor block`の結果で、ブロックが生成されるとこのようなデータを受信します。


## 各種トランザクションの発行

`nem2-cli`は他のトランザクション操作も実行することができます。

ここでは扱いませんが、各コマンドヘルプやドキュメントを参照してみてください。

- [クライアント — NEM Developer Center](https://nemtech.github.io/ja/cli.html#commands)
