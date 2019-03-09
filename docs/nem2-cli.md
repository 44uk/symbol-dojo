# nem2-cli

アカウントを登録して、nemネットワークからAPI経由で情報を取得したり、トランザクションを発行したりすることができるコマンドラインツールです。

- [クライアント — NEM Developer Center](https://nemtech.github.io/ja/cli.html)


## プロファイルの登録

ウォレットのようにアカウントにプロファイル名をつけて保存し、呼び出して使うことができます。

プロファイルは`~/.nem2rc.json`として保存されます。


### アカウントの生成

新しいアカウントを生成します。

オプションで指定することで、生成と同時にプロファイルとして保存もします。

```shell
$ nem2-cli account generate -n MIJIN_TEST -u http://localhost:3000 -s --profile alice
New Account:    SB4WQN-WTACKJ-SJSJNK-BPKG5A-NNWCSL-JSJCYF-SW4I
Public Key:     76D17FB217FB46930D0A4C071716FE4D825DCB268F1262EB0A391484E04DD5E9
Private Key:    490C117FE03A265FF9D0CEEB7DD59098867B078A86B04E1E1E1A93CF141029A1
```

ここでは各設定をオプションで渡しましたが、指定しない場合は対話式で入力していきます。

`--profile`オプションで、プロファイルに`alice`と名付けました。

このプロファイルを使ってコマンドを実行するときには`--profile alice`を指定します。

```shell
$ nem2-cli account info --profile alice
Error {"code":"ResourceNotFound","message":"no resource exists with id 'SB4WQNWTACKJSJSJNKBPKG5ANNWCSLJSJCYFSW4I'"}
```

まだこのアカウントはネットワーク上で認識されていないため`ResourceNotFound`が返ってきますが、このようにしてプロファイルの指定をします。

もう一つ、`bob`というプロファイル名でアカウントを作っておきます。

```shell
$ nem2-cli account generate -n MIJIN_TEST -u http://localhost:3000 -s --profile bob
```

なお、`--profile`オプションを省略した場合は`default`という名前が使用されます。

今回は登録していませんが、`--profile`を指定しなかった場合は`default`で登録したプロファイルで動作します。


### プロファイルの登録(ローカルにネットワークを構築している場合)

ウォレットのようにプロファイルという形でアカウントを登録します。

ここでは初期分配されたアカウントを登録してみましょう。

`addresses.yml`から任意のアカウントの秘密鍵を選んでください。

```shell
$ nem2-cli profile create -n MIJIN_TEST -p B0C900E7E4270B60BB0B1199205A190F77BD1D0BBCD1B305E8790290A08C23F6 -u http://localhost:3000 --profile nemesis1

Profile stored correctly
nemesis1->
        Network:        MIJIN_TEST
        Url:            http://localhost:3000
        Address:        SBPKTXJYSCHBGHRAFEETGITGW6AS22KX4GI5WZ25
        PublicKey:      F02D33764A08DEBEF4B9FFD514FE99DFB084879F09C32E183F087610246C8BB2
        PrivateKey:     57062D8B532D0423B324998E251DD77B972802B6FB3DDB57289BCF9246284AE0
```

`--profile nemesis1`にて`nemesis1`というプロファイル名をつけました。

こちらも同様に、プロファイルを使ってコマンドを叩く際には`--profile nemesis1`をつけて実行します。


### アカウント情報の取得

先程の初期分配アドレスの確認ではアドレスを直接指定しましたが、今度はプロファイルを指定してみます。

```shell
$ nem2-cli account info --profile nemesis1
```

先の確認と同じフォーマットで結果が表示されます。

こちらは初期分配を受け取っており、ネットワーク上に認識されたアカウントなので情報を表示できます。


## 転送トランザクション

モザイクを送るトランザクションを発信してみましょう。


### 初期分配アカウントから配布する(ローカルにネットワークを構築している場合)

`cat.currency`を`10,000`ほど`nemesis1`から`alice`へ配布してください。

`@cat.currency::10000000000`は`cat.currency`というネームスペースが紐付けられたモザイクを意味します。

絶対値で指定する必要があるので、可分性`6`を加味した`10000000000`を指定します。

```shell
$ nem2-cli transaction transfer -r SCGUWZFCZDKIQCACJHKSMRT7R75VY6FQGJOUEZN5 -c @cat.currency::10000000000 --profile nemesis1
Transaction announced correctly
Hash:    7BD02193E7D0F97356C3DC7FBBB29BCF889876BC58D9A0E451DC1F3482064B42
Signer:  294D4385F2AB9EA0D3A4070C9219784E269A96EDEB8A1679EA938BE639509826
```


### 初期分配アカウントの秘密鍵がわからない場合(用意されたネットワークを使用している場合など)

公開されているネットワークを使用している場合は、そのネットワーク管理者から入手してください。

ネットワーク提供者が蛇口を公開している場合はそれを利用してください。


### aliceからbobへ受け渡す

`alice`から`bob`へ`10 cat.currency`送ってみましょう。

```shell
$ nem2-cli transaction transfer -r SBU4GPX2BJSESXN5KBTCAI63GGDVJYQFZ62M2QTT -c @cat.currency::10000000 -m "Hello, Bob" --profile alice
Transaction announced correctly
Hash:    7BD02193E7D0F97356C3DC7FBBB29BCF889876BC58D9A0E451DC1F3482064B42
Signer:  294D4385F2AB9EA0D3A4070C9219784E269A96EDEB8A1679EA938BE639509826
```

こちらもオプションを指定しなかった場合は対話的に入力を求められます。

メッセージ通り、トランザクションが受理されたので、少し待ってから`bob`の残高を確認します。


```shell
$ nem2-cli account info --profile bob
Account:        SCC3Z7-YEUYED-FWBRMS-V7OO3I-XPIURD-65EV2U-MB24
-------------------------------------------------------

Address:        SBU4GP-X2BJSE-SXN5KB-TCAI63-GGDVJY-QFZ62M-2QTT
at height:      77

PublicKey:      00000000000000000000000000000000000000000000000000000000000000000
at height:      0

Importance:     0
at height:      0

Mosaics
7d09bf306c0b2e38:       10
```

`Mosaics`の部分に受け取ったモザイクが表示されました。

16進数のモザイクIDで表示されるので若干わかりにくいですが、`7d09bf306c0b2e38`は`cat.currency`を表します。


## アカウントのモニタリング

今度はアカウントがトランザクションを受け取ったり、受理されたり、エラーになったかどうかを確認してみます。

`monitor`のサブコマンドを実行すると待機状態になり、ステータスが変わるたびにその情報が流れてきます。


### トランザクションのエラーの捕捉

```shell
$ nem2-cli monitor status --profile alice
```

トランザクションを発信したとき、それに関するエラーが起きた場合に通知がきます。

例えばアカウントの残高が足りていなかったり、登録しようとしたネームスペースが既に取得されていた場合、署名が壊れていた場合などです。

各種エラーメッセージの内容は以下で確認できます。

- [REST API — NEM Developer Center](https://nemtech.github.io/api.html#status-errors)

試しに`alice`が持ち合わせていない量のモザイクを送ろうとしてみましょう。

もう一つターミナルを開いて、モニタリングを開始します。

```shell
$ nem2-cli monitor status --profile alice
Monitoring SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5 using http://localhost:3000
connection open
```

続いて、持ち合わせていない量のモザイクを指定してください。

```shell
$ nem2-cli transaction transfer -r SBU4GPX2BJSESXN5KBTCAI63GGDVJYQFZ62M2QTT -c @cat.currency::409090909000000 -m "Hello, bob" --profile alice
Transaction announced correctly
Hash:    1813FDF4A9AA43147AB5B035140A2D321ABA4674494C8D1A4F902A551BE07739
Signer:  294D4385F2AB9EA0D3A4070C9219784E269A96EDEB8A1679EA938BE639509826
```

`Transaction announced correctly`が返り、発行はエラーになりませんが、モニタリングしている方へ通知が届きます。

```shell
Hash: 1813FDF4A9AA43147AB5B035140A2D321ABA4674494C8D1A4F902A551BE07739
Error code: Failure_Core_Insufficient_Balance
Deadline: 2019-03-22 00:36:06.648
```

`Failure_Core_Insufficient_Balance`は残高不足の意味です。

トランザクションのエラーはこのようにしてモニタリング(`websocket`を経由)して取得します。


### 未承認トランザクションの捕捉

`bob`が受け取るトランザクションが発生したときに、それを取得してみます。

```shell
$ nem2-cli monitor unconfirmed --profile bob
```

未承認トランザクションが発生したとき、情報が流れてきます。

`alice`がトランザクションを発信した直後に流れてくるでしょう。

上記のコマンドを実行して、モニタリングが始まった状態で`alice`からモザイクを送ってみてください。

```shell
$ nem2-cli transaction transfer -r SBU4GPX2BJSESXN5KBTCAI63GGDVJYQFZ62M2QTT -c @cat.currency::1000000 -m "Bob monitors unconfirmed" --profile alice
```

するとモニタしていたウィンドウにトランザクションが現れます。

```shell
$ nem2-cli monitor unconfirmed --profile bob
Monitoring SBU4GP-X2BJSE-SXN5KB-TCAI63-GGDVJY-QFZ62M-2QTT using http://localhost:3000
connection open

TransferTransaction: Recipient:SBU4GP-X2BJSE-SXN5KB-TCAI63-GGDVJY-QFZ62M-2QTT Message:"Bob monitors unconfirmed" Mosaics: NamespaceId:85bbea6cc462b244::1000000 Signer:SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5 Deadline:2019-03-22 Hash:F1851A4068B83107AEEE06FF44C3DC82914B58310B3DC471AA25AAE8625C426C
```


### 承認トランザクションの捕捉

同様に、トランザクションが承認されたときの情報を取得してみます。

```shell
$ nem2-cli monitor confirmed --profile bob
```

トランザクションが承認されると、情報が流れてきます。

`alice`のトランザクションが承認され、`bob`の残高に反映されるときに流れてくるでしょう。

上記のコマンドを実行して、モニタリングが始まった状態で`alice`からモザイクを送ってみてください。

```shell
$ nem2-cli transaction transfer -r SBU4GPX2BJSESXN5KBTCAI63GGDVJYQFZ62M2QTT -c @cat.currency::1000000 -m "Bob monitors confirmed" --profile alice
```

しばらくしてトランザクションが承認されると、モニタしていたウィンドウにトランザクションが現れます。

```shell
$ nem2-cli monitor confirmed --profile bob
Monitoring SBU4GP-X2BJSE-SXN5KB-TCAI63-GGDVJY-QFZ62M-2QTT using http://localhost:3000
connection open

TransferTransaction: Recipient:SBU4GP-X2BJSE-SXN5KB-TCAI63-GGDVJY-QFZ62M-2QTT Message:"Bob monitors confirmed" Mosaics: NamespaceId:85bbea6cc462b244::1000000 Signer:SCGUWZ-FCZDKI-QCACJH-KSMRT7-R75VY6-FQGJOU-EZN5 Deadline:2019-03-22 Hash:4958B56B762B5BC5BD8A46592481854CE7E6048384E6D2EBC202ACD90A9BBEA5
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

ちなみに`block`だけはアカウントに関係なく、接続しているノードにブロックが生成されると通知を受け取るコマンドです。


## 各種トランザクションの発行

`nem2-cli`は他のトランザクション操作も実行することができます。

ここでは扱いませんが、各コマンドヘルプやドキュメントを参照してみてください。

- [クライアント — NEM Developer Center](https://nemtech.github.io/ja/cli.html#commands)

