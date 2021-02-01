= Symbol（NEM2）入門
//embed[latex]{
\vspace{-1.7\Cvs}
\begin{flushright}
よしゆき 著
\end{flushright}
//}

@<tt>{Catapult}とは@<tt>{NEM}の次期バージョンです。関連ソフトウェアはGitHubにオープンソースとして公開されています。
@<tt>{Catapult}や@<tt>{NEM2}と表記される場合があり、現時点ではどちらが正式な呼び方かは未定のようですが、同じものを指します。

本章の執筆時点（2019年9月）で@<tt>{NEM}公式の開発用テストネットワーク@<fn>{testnet}は公開されていません。
そのため自分でチェーンを構築するか、有志が公開している独自チェーンなどを利用することで@<tt>{Catapult}ネットワークを使うことになります。
//footnote[testnet][NEM財団開発者が用意しているネットワークもありますが現状不安定です。]

本章では、ローカルマシン内にネットワークを構築し、@<tt>{Catapult}の機能を動作させる具体的なコードを実行しながら説明を進めます。


== 本章の実行環境

//emtable[本章で使用する各ソフトウェアのバージョン]{
macOS High Sierra	10.13.6
Node.js	10.15.3
Docker	version 19.03.1, build 74b1e89
Docker Compose	version 1.24.1, build 4667896b
nem2-cli	0.13.0
nem2-sdk	0.13.0
catapult-service-bootstrap	0.6.0.1
//}

メジャーバージョンが大きく異なっていなければ、これらのバージョン以外でなくとも動作すると思われますが、問題が発生する場合は上記に合わせてください。
特に@<tt>{nem2-cli},@<tt>{nem2-sdk},@<tt>{catapult-service-bootstrap}の組み合わせについて、APIゲートウェイのレスポンススキーマの差異によって正常に動作しない場合があります。

@<tt>{macOS}上で動作させた内容のため、@<tt>{Windows}や@<tt>{Linux}環境で行う場合はコマンドライン操作が異なる場合があります。
適宜読み替えて操作を行ってください。


== 実行環境の準備

@<tt>{Catapult}ネットワークはそれぞれの役割を担うノードが複数連携して構築されます。
本章では、ネットワークのノード群を簡単に構築できる@<tt>{catapult-service-bootstrap}という開発ツールキットを用いて、
ローカルマシンにブロックチェーンネットワークを構築します。


=== Node.jsのインストール

@<tt>{Node.js}は公式のインストーラや@<tt>{nodenv}@<fn>{nodenv}などのバージョンマネージャなどを用いてインストールして、コマンドパスが通っている状態にしてください。

//footnote[nodenv][https://github.com/nodenv/nodenv]

//cmd{
$ node -v
v10.15.3
//}


=== nem2-cliのインストール

@<tt>{nem2-cli}は@<tt>{NEM}ネットワークからアカウントやトランザクションの情報を取得したり、トランザクションを発信するコマンドラインツールです。
グローバルインストールをして、コマンドパスが通っている状態にしてください。

//cmd{
$ npm install nem2-cli@0.13.0 -g
$ nem2-cli
                        ____            _ _
   _ __   ___ _ __ ___ |___ \       ___| (_)
  | '_ \ / _ \ '_ ` _ \  __) |____ / __| | |
  | | | |  __/ | | | | |/ __/_____| (__| | |
  |_| |_|\___|_| |_| |_|_____|     \___|_|_|

                                     v0.13.0
//}


=== Docker / Docker Composeのインストール

@<tt>{Docker / Docker Compose}を公式サイトに従い、各プラットフォーム向けの方法でインストールしてください。
それぞれコマンドパスが通っている状態にしてください。

//cmd{
$ docker -v
Docker version 19.03.1, build 74b1e89
$ docker-compose -v
docker-compose version 1.24.1, build 4667896b
//}


=== catapult-service-bootstrapのダウンロード

@<tt>{tech-bureau/catapult-service-bootstrap}のGitHubリポジトリから取得します。
@<code>{git clone}またはアーカイブのダウンロードなどのお好みの方法で取得してください。

//cmd{
$ git clone https://github.com/tech-bureau/catapult-service-bootstrap.git -b 0.6.0.1
$ cd catapult-service-bootstrap
//}

クローンまたはアーカイブを展開したら、カレントディレクトリを移動してください。
以降、カレントディレクトリはクローンしたプロジェクトのディレクトリを前提とします。


#@# === 手数料の設定を変更
#@#
#@# 実行するためにネットワーク内通貨が必要になる機能がいくつかあります。
#@# 必要な通貨を確保する手間を省くために、通貨を消費する必要のないように設定を変更します。
#@#
#@#  * ./ruby/catapult-templates/peer_node/resources/config-network.properties.mt
#@#  * ./ruby/catapult-templates/api_node/resources/config-network.properties.mt
#@#
#@# //emlist[モザイク/ネームスペース手数料を0に変更する]{
#@# -mosaicRentalFee = 500'000'000
#@# +mosaicRentalFee = 0
#@#
#@# -rootNamespaceRentalFeePerBlock = 1'000'000
#@# -childNamespaceRentalFee = 100'000'000
#@# +rootNamespaceRentalFeePerBlock = 0
#@# +childNamespaceRentalFee = 0
#@# //}
#@#
#@# 2つのファイルを同じ内容に編集してください。
#@# ここではブロックチェーンの操作時に要求される手数料を0に設定しています。
#@# 初回起動時にはこの設定テンプレートが読み込まれて、設定ファイルが生成されます。


=== ブロックチェーンネットワークの立ち上げ

ノード群を立ち上げます。ここでは用意されているコマンドスクリプトを実行します。

//cmd{
$ ./cmds/start-all -d # -d オプション:バックグラウンド実行(daemon)
Step 1/5 : FROM alpine:3.7
 ---> 3fd9065eaf02
Step 2/5 : RUN apk add --no-cache ruby ruby-bundler
 ---> Running in f0d369dd6e1a
(省略)
//}

初回起動時にはDockerイメージのダウンロードに時間がかかります。
その後、ノードの初期設定ファイルの生成、初期ブロックの生成などが実行され、各種ノードが生成されたファイルを読み込み、
ブロックチェーンネットワークのノード群が稼働を始めます。


=== ノード群の停止

作業を止める場合など、ノード群を停止するには@<tt>{./cmds/stop-all}を実行します。

//cmd{
$ ./cmds/stop-all
//}

再開する場合は再度@<tt>{./cmds/start-all -d}を実行します。


== ブロックチェーンの確認

ブロックチェーンネットワークにはAPIゲートウェイを経由してアクセスします。
@<tt>{Catapult}ではブロックチェーンデータへのアクセスにAPIゲートウェイが提供するインターフェイスを使います。


=== APIゲートウェイから情報取得

正しくチェーンが稼働していることを確認するために、API@<fn>{endpoint}ノードのエンドポイントにアクセスしてブロックの生成を確認します。
次のようなレスポンスが得られます。ちなみにこれは初期ブロックについての情報を取得しています。
//footnote[endpoint][https://nemtech.github.io/endpoints.html]

//noindent
@<href>{http://localhost:3000/block/1}

//emlist[http://localhost:3000/block/1 レスポンス例]{
{"meta":{"hash":"107D74D6726CF6128490A7532B026F7A5273F3332764DEFC89D9F1DC7E172A8F","generationHash":"6494C526927B175D9D4EE42DD51AAECE91AA5A2F609578A7B30F268920EF5587","totalFee":[0,0],"subCacheMerkleRoots":[],"numTransactions":29},"block":{"signature":"465AD82AE39C2334478AE861D49828947E8EF9ADFC024B8FF54E70838A265D73AE5EDBF65D044E823C92FD7167785618576725AB0694E85FC7930DBCFC65890C","signer":"7B13AFFC7F7045C4F8ED729CE58852D2D83BE0B55004772B3C5C763E654CCD8B","version":36867,"type":32835,"height":[1,0],"timestamp":[0,0],"difficulty":[276447232,23283],"feeMultiplier":0,"previousBlockHash":"0000000000000000000000000000000000000000000000000000000000000000","blockTransactionsHash":"360810ED4C885A1C39892A23064AEF1FDD3EB908FC265C281B49A87EADE4D238","blockReceiptsHash":"EA18AB1A9FD2C3F66C2E3540B8CF0A8577C74D6DA0B734A3F575512670593E16","stateHash":"1BC33D65DA6BDCC8536E2BB392D54C8B01F8BF9393F4ACF62A9FD73E348E0CC9","beneficiary":"0000000000000000000000000000000000000000000000000000000000000000"}}
//}

もし上記のようなレスポンスが得られず、起動に失敗している場合は後述するトラブルシュートを参考にしてください。

実際のアプリケーション開発では、トランザクション送信に複雑な署名処理が必要になるため、SDKを用いた開発が推奨されます。

続く節ではJavaScript用のSDKを用いて情報取得やトランザクション発信を行いますが、
HTTPリクエストが実行できれば、如何なる環境からでもブロックチェーンを利用できます。


=== 初期分配モザイクの確認

@<tt>{Catapult（NEM）}はプレマイン型チェーンです。
基軸モザイク@<fn>{mosaic}として@<tt>{8,999,999,999 cat.currency}が総発行され、発行された基軸モザイクは初期生成アドレスへ分配されます。
//footnote[mosaic][NEMにおいての通貨をモザイク（mosaic）と呼びます。]

初期生成アドレスは@<tt>{./build/generated-addresses/addresses.yml}に保存されます。
@<tt>{nemesis_addresses:}という箇所から下にアドレスが30件ほど並びます。

//emlist[./build/generated-addresses/addresses.yml nemesis_addresses例]{
nemesis_addresses:
- private: 791107322244D47D71F3A7CBD71C6BAC50D34554D094DB12E7C37BD3167AE70F
  public: 2ADD369D13AF5E3C9B628E1CA4CF7D48C0A9031EAE3BD1BDF21DC22B54DDFE02
  address: SB7CEHTBPPP7NHTKBXWFU7A44T5RFF7GO5OJQWCF
(省略)
//}

アカウントは秘密鍵（@<tt>{private}）、公開鍵（@<tt>{public}）、アドレス（@<tt>{address}）の3つの情報を持ちます。
ちなみに公開鍵、アドレスは秘密鍵から導出できます。

ここでは一番目のアカウントを使用します。@<tt>{address}の文字列をコピーして、次のURLにアクセスします。
なお、生成される鍵は生成ごとにランダムなので、以降ではアドレスや鍵の値をご自身の環境で生成された値で置き換えてください。

//noindent
@<href>{http://localhost:3000/account/SB7CEHTBPPP7NHTKBXWFU7A44T5RFF7GO5OJQWCF}

//emlist[アカウントレスポンス例(整形済み)]{
{ "meta": {},
  "account": {
    "address": "907E221E617BDFF69E6A0DEC5A7C1CE4FB1297E6775C985845",
    "addressHeight": [ 1, 0 ],
    "publicKey":"0000000000000000000000000000000000000000000000000000000000000000",
    "publicKeyHeight": [ 0, 0 ],
    "accountType": 0,
    "linkedAccountKey": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    "activityBuckets": [
      { "startHeight": "1", "totalFeesPaid": "0",
        "beneficiaryCount": 0, "rawScore": "3750000" }
    ],
    "mosaics": [
      @<b>{{ "id": [ 2758936655, 46307174 ], "amount": [ 636036448, 104762 ] }},
      { "id": [ 1572847029, 1861856425 ], "amount": [ 3750000, 0 ] }
    ],
    "importance": [ 3750000, 0 ],
    "importanceHeight": [ 1, 0 ]
} }
//}

@<tt>{mosaics}の配列が保有モザイクを表しています。
ここでは2つのモザイクの保有を示していますが、@<code>{[636036448, 104762]}に注目します。

値は@<tt>{JavaScript}で64bitの大きな値を扱うために上下位32bitずつに分けた表現@<fn>{uint64}になっています。
次のワンライナースクリプトで読みやすい整数値へ変換します。
//footnote[uint64][JavaScriptの言語仕様上53bitの整数値までしか扱えない仕様を吸収するため。]

//cmd{
$ node -e "console.log(104762 * 0x100000000 + 636036448)"
449949999900000
//}

@<tt>{[636036448, 104762]}のうち@<tt>{104762}が上位@<tt>{32bit}なので@<tt>{0x100000000}を乗じてシフトし、
@<tt>{636036448}は下位@<tt>{32bit}なのでこの2つを加算します。
結果として@<tt>{449949999900000}という数値が得られました。

初期配布される基軸モザイクは@<tt>{cat.currency}と命名され、可分性@<fn>{divisibility}は6と定義されているので、
@<tt>{449,949,999.900,000 cat.currency}が分配されていることが確認できました。

以後、基軸通貨が必要な場合はこのアカウントから必要な分を転送することで利用できます。
//footnote[divisibility][小数に分割できること。この場合の6は小数第6位まで分割した0.000001 cat.currencyが最小値となる。]


== nem2-cliを使う

@<tt>{nem2-cli}は、アカウントの設定を保存して、NEMネットワークから情報を取得したり、トランザクションを発信するコマンドラインツールです。
これ単体でも@<tt>{Catapult}のすべての機能を実行できます。

ウォレットのようにアカウントにプロファイル名をつけて保存し、呼び出して使用します。
プロファイルの情報は@<tt>{~/.nem2rc.json}@<fn>{nem2rc}として保存されます。
//footnote[nem2rc][現時点での仕様として、秘密鍵は暗号化されず平文で保存されます。]

//emlist[~/.nem2rc.json プロファイル設定ファイル例(整形済み)]{
{"alice":{
  "privateKey":"7EF4AAA5507C7DBDFDD30D52922DF3AC46D2384593FA2E620D19848ED7F60636",
  "networkType":144,
  "url":"http://localhost:3000",
  "networkGenerationHash":"53F73344A12341618CEE455AC412A0B57D41CEC058965511C0BA016156F4BF47"}}
//}


=== プロファイルの登録

//indepimage[figure-1][][scale=0.7]{
//}

各種コマンドを動かすために初期配布アカウントをプロファイルとして保存します。

//emlist[./build/generated-addresses/addresses.yml nemesis_addresses例]{
nemesis_addresses:
- private: @<b>{791107322244D47D71F3A7CBD71C6BAC50D34554D094DB12E7C37BD3167AE70F}
  public: 2ADD369D13AF5E3C9B628E1CA4CF7D48C0A9031EAE3BD1BDF21DC22B54DDFE02
  address: SB7CEHTBPPP7NHTKBXWFU7A44T5RFF7GO5OJQWCF
(省略)
//}

先に確認した初期分配アドレスの秘密鍵を使います。

//cmd{
$ nem2-cli profile create -n MIJIN_TEST -p 791107322244D47D71F3A7CBD71C6BAC50D34554D094DB12E7C37BD3167AE70F -u http://localhost:3000 --profile nemesis
Profile stored correctly
nemesis->
	Network:	MIJIN_TEST
	Url:		http://localhost:3000
	GenerationHash:	0EE13AFBE49394B9985DB8AF1BBCD98859BA9277ACF3A413D639D9C8D76D538F
	Address:	SB7CEHTBPPP7NHTKBXWFU7A44T5RFF7GO5OJQWCF
	PublicKey:	2ADD369D13AF5E3C9B628E1CA4CF7D48C0A9031EAE3BD1BDF21DC22B54DDFE02
	PrivateKey:	791107322244D47D71F3A7CBD71C6BAC50D34554D094DB12E7C37BD3167AE70F
//}

@<tt>{-n}でネットワークタイプを指定します。@<tt>{MIJIN_TEST}@<fn>{networkType}を渡します。
@<tt>{-p}で秘密鍵を指定します。初期分配アドレスの秘密鍵を渡します。
@<tt>{-u}でAPIゲートウェイのURLを指定します。@<href>{http://localhost:3000}を渡します。
@<tt>{--profile}でプロファイル名を指定します。@<tt>{nemesis}を渡します。
各コマンド実行時に@<tt>{--profile nemesis}とプロファイル名を指定することで、この設定を利用できます。
//footnote[networkType][catapult-service-bootstrapはデフォルトではMIJIN_TESTとして稼働します。MIJIN_TEST, MIJIN, TEST_NET, MAIN_NETが定義されています。NEM/Mijinの関係については公式ブログの記事を参照してください。https://blog.nem.io/jp-outlining-the-relationship-between-nem-mijin-catapult/]

次は新たにアカウントを生成してプロファイルとして登録します。

//cmd{
$ nem2-cli account generate -n MIJIN_TEST -u http://localhost:3000 -s --profile alice
New Account:	SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
Public Key:	B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B
Private Key:	C2337B8926ED13EA2C481AB559FFD716E5C3AD76273759B4F7A0DB9315745972

Stored alice profile
//}

ここでは各設定をオプションで渡しましたが、指定しない場合は対話式で入力を問われます。
今回は@<tt>{--profile}オプションでプロファイルに@<tt>{alice}と名付けました。
こちらもプロファイルを使ってコマンドを叩く際には@<tt>{--profile alice}をつけて実行します。

さらに@<tt>{bob}というアカウントも作っておきます。

//cmd{
$ nem2-cli account generate -n MIJIN_TEST -u http://localhost:3000 -s --profile bob
(省略)
//}


=== プロファイルの確認

これで@<tt>{nemesis},@<tt>{alice},@<tt>{bob}の3つのプロファイルが登録されたので確認します。
登録したプロファイルは@<tt>{profile list}コマンドで確認できます。

//cmd{
$ nem2-cli profile list

alice->
	Network:	MIJIN_TEST
	Url:		http://localhost:3000
	GenerationHash:	0EE13AFBE49394B9985DB8AF1BBCD98859BA9277ACF3A413D639D9C8D76D538F
	Address:	SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ
	PublicKey:	B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B
	PrivateKey:	C2337B8926ED13EA2C481AB559FFD716E5C3AD76273759B4F7A0DB9315745972

nemesis->
	Network:	MIJIN_TEST
	Url:		http://localhost:3000
	GenerationHash:	0EE13AFBE49394B9985DB8AF1BBCD98859BA9277ACF3A413D639D9C8D76D538F
	Address:	SB7CEHTBPPP7NHTKBXWFU7A44T5RFF7GO5OJQWCF
	PublicKey:	2ADD369D13AF5E3C9B628E1CA4CF7D48C0A9031EAE3BD1BDF21DC22B54DDFE02
	PrivateKey:	791107322244D47D71F3A7CBD71C6BAC50D34554D094DB12E7C37BD3167AE70F

bob->
	Network:	MIJIN_TEST
	Url:		http://localhost:3000
	GenerationHash:	0EE13AFBE49394B9985DB8AF1BBCD98859BA9277ACF3A413D639D9C8D76D538F
	Address:	SDJ2MDGUVL7LST7LD4SVXHA76JTTH5HOAJEWCMIB
	PublicKey:	9E84E95578C130B64D2F5B35BB7A6AAA1394FB35DF09F6CD334EBF17E0BA6D48
	PrivateKey:	6C89BC27D54F5F85ECB3123BBF9D01AEF8CE0C269DAEFDEFC3BF40F26B75F26F
//}


=== アカウント情報を取得

登録したプロファイルを使ってアカウントの情報を取得します。

//cmd{
$ nem2-cli account info --profile nemesis

Address:	SB7CEH-TBPPP7-NHTKBX-WFU7A4-4T5RFF-7GO5OJ-QWCF
at height:	1

PublicKey:	0000000000000000000000000000000000000000000000000000000000000000
at height:	0

Importance:	3750000
at height:	1

Mosaics
@<b>{154ee4e837704ed3:}	@<b>{449949999.9}
76d77e2e68673039:	3750
//}

@<tt>{nemesis}のアカウント情報を取得した結果です。APIゲートウェイのレスポンスから確認したように@<tt>{449,949,999.9 cat.currency}を保有しています。
（@<tt>{154ee4e837704ed3}は@<tt>{cat.currency}を示します。値はネットワーク立ち上げ時にランダムに生成されるので都度異なります。）


=== 転送トランザクションを発信

モザイクを送信するトランザクションを発信します。
@<tt>{10,000 cat.currency}を@<tt>{nemesis}から@<tt>{alice}へ移動します。

//cmd{
$ nem2-cli transaction transfer -r SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ -c @cat.currency::10000000000 --profile nemesis
Transaction announced correctly
Hash:    @<b>{539D69C798F8EFF2DB371A3D1936FE0C8A9A208634FDC80507FBBD6150EF9D1D}
Signer:  2ADD369D13AF5E3C9B628E1CA4CF7D48C0A9031EAE3BD1BDF21DC22B54DDFE02
//}

@<tt>{@cat.currency::10000000000}は@<tt>{cat.currency}というネームスペースが紐付けられたモザイクを意味します。
（ネームスペースとモザイクの関連については後の節で説明します。）
モザイク量は可分性の@<tt>{6}を加味した絶対値@<fn>{absolute}である@<tt>{10000000000}を指定します。
//footnote[absolute][可分性を考慮した小数を含む表現を相対値、相対値を可分性の値でシフトした値(@<m>|x \times 10^{divisibility}|)を絶対値として扱います。]

トランザクションを発信すると表示されるHashを引数に@<tt>{transaction status}コマンドを実行してトランザクションの状態を確認できます。

//cmd{
$ nem2-cli transaction status -h 539D69C798F8EFF2DB371A3D1936FE0C8A9A208634FDC80507FBBD6150EF9D1D --profile nemesis
@<b>{group:	confirmed}
status:	Success
hash:	<539D69C798F8EFF2DB371A3D1936FE0C8A9A208634FDC80507FBBD6150EF9D1D>
deadline:	2019-08-18T00:35:44.537
height:	25
//}

@<tt>{group: confirmed}となっていれば発信は成功し、ブロックチェーンに書き込まれています。
宛先の@<tt>{alice}に@<tt>{10,000 cat.currency}届いているかを確認します。

//cmd{
$ nem2-cli account info --profile alice
Account:	SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
-------------------------------------------------------

Address:	SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
at height:	25

PublicKey:	0000000000000000000000000000000000000000000000000000000000000000
at height:	0

Importance:	0
at height:	0

Mosaics
@<b>{154ee4e837704ed3:}	@<b>{10000}
//}

@<tt>{nem2-cli}を用いてモザイクを送る場合はこのようにして送信できます。
なお、コマンドオプションを指定しなかった場合は対話式での入力が求められます。


=== アカウントのモニタリング

//indepimage[figure-2][][scale=0.6]{
//}

アカウントに向けたトランザクションが発生したり、受理されたり、エラーになったかどうかを確認します。
@<tt>{monitor}のサブコマンドを実行すると待機状態になり、ステータスが変わるたびにその情報が流れてきます。


==== トランザクションのエラー捕捉

トランザクションを発信したとき、その時点でアカウントの残高が足りない、署名が壊れていたなどの理由で、
トランザクションが受理できない場合、エラーメッセージが通知されます。

試しに@<tt>{alice}が持ってない量のモザイクを送ろうとします。まず、もうひとつターミナルを開いてモニタリングを開始します。

//cmd{
$ nem2-cli monitor status --profile alice
Monitoring SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4 using http://localhost:3000
connection open
//}

続いて、持ち合わせていない量のモザイクを指定して、トランザクションを送信します。

//cmd{
$ nem2-cli transaction transfer -r SB7CEHTBPPP7NHTKBXWFU7A44T5RFF7GO5OJQWCF -c @cat.currency::409090909000000 --profile alice
Transaction announced correctly
Hash:    1372967B7AE2AAE15C2EC2956F9B329DC2439C4B1F23FF77326F2C65D93231A5
Signer:  B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B
//}

@<tt>{Transaction announced correctly}が返却され、リクエストはエラーになりませんが、モニタリングしている方へ通知が届きます。

//cmd{
Hash: 1372967B7AE2AAE15C2EC2956F9B329DC2439C4B1F23FF77326F2C65D93231A5
Error code: @<b>{Failure_Core_Insufficient_Balance}
Deadline: 2019-08-18 01:22:32.650
//}

なお、@<tt>{Failure_Core_Insufficient_Balance}は残高不足の意味です。
各種エラーメッセージの詳細は次のURLのドキュメントで確認できます。

//noindent
@<href>{https://nemtech.github.io/ja/api.html#status-errors}

APIゲートウェイへのトランザクション送信は残高不足などによるトランザクションの結果が成功しないものであったとしても、必ず成功レスポンスを返却します。

そのトランザクションがネットワークに受理されたかどうかは、モニタリングでエラーを捕捉するか、@<tt>{transaction status}コマンドで確認します。

//cmd{
$ nem2-cli transaction status -h 1372967B7AE2AAE15C2EC2956F9B329DC2439C4B1F23FF77326F2C65D93231A5 --profile alice
group:	failed
status:	@<b>{Failure_Core_Insufficient_Balance}
hash:	<1372967B7AE2AAE15C2EC2956F9B329DC2439C4B1F23FF77326F2C65D93231A5>
deadline:	2019-08-18T01:22:32.650
//}

エンドポイントでは@<tt>{http://localhost:3000/transaction/<TRANSACTION_HASH>/status}からトランザクションの状態を確認できます。

//emlist[トランザクション状態レスポンス例(整形済み)]{
{ hash: "1372967B7AE2AAE15C2EC2956F9B329DC2439C4B1F23FF77326F2C65D93231A5",
  status: "Failure_Core_Insufficient_Balance",
  deadline: [ 3510937546, 24 ],
  group: "failed" }
//}


==== 承認トランザクションの捕捉

@<tt>{alice}宛のトランザクションが承認されたときにトランザクションを捕捉します。

//cmd{
$ nem2-cli monitor confirmed --profile alice
//}

@<tt>{alice}のトランザクションが承認され@<tt>{bob}の残高に反映されるときに情報が通知されます。
上記のコマンドを実行して、モニタリングが始まった状態で@<tt>{alice}からモザイクを送ります。

//cmd{
$ nem2-cli transaction transfer -r SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ -c @cat.currency::1000000 -m "Alice monitors confirmed" --profile nemesis
//}

トランザクションが承認されると、モニタしていたウィンドウにトランザクションが現れます。

//cmd{
$ nem2-cli monitor confirmed --profile alice
Monitoring SCJ3XM-WIITJT-5DIFZY-KQ27VD-IYYKAV-XIAAMJ-W6K2 using http://localhost:3000
connection open
TransferTransaction: Recipient:SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ Message:"Alice monitors confirmed" Mosaics: NamespaceId:85bbea6cc462b244::1000000 Signer:SB7CEH-TBPPP7-NHTKBX-WFU7A4-4T5RFF-7GO5OJ-QWCF Deadline:2019-08-18 Hash:DD68E72F572DD8172CFD4D9BE45A6F193876282D2A6A80EE126F5FB7FAD2200E
//}

このようにリアルタイムにトランザクションの状態変化を捕捉することができます。


=== その他のトランザクションタイプのモニタ

その他、トランザクションのタイプごとにサブコマンドがあります。

//cmd{
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
//}

モニタリングしたいトランザクションのタイプを指定して監視を始めます。
複数のタイプを監視したい場合は、複数枚のウィンドウを開いてコマンドを実行します。


==== 各種トランザクションの発信

@<tt>{nem2-cli}は他のトランザクション発信にも対応しています。

//cmd{
$ nem2-cli transaction

  USAGE

    nem2-cli transaction <subcommand>

  SUBCOMMANDS

    accountaddressrestriction   - Allow or block incoming and outgoing transactions for a given a set of addresses
    accountlink                 - Delegate the account importance to a proxy account
    accountmosaicrestriction    - Allow or block incoming transactions containing a given set of mosaics
    accountoperationrestriction - Allow or block outgoing transactions by transaction type
    addressalias                - Set an alias to a mosaic
    cosign                      - Cosign an aggregate bonded transaction
    info                        - Fetch transaction info
    mosaic                      - Create a new mosaic
    mosaicalias                 - Set an alias to a mosaic
    mosaicsupplychange          - Change a mosaic supply
    multisigmodification        - Create or modify a multisig account
    namespace                   - Register a namespace
    secretlock                  - Announce a secret lock transaction
    secretproof                 - Announce a secret proof transaction
    status                      - Fetch transaction status
    transfer                    - Send transfer transaction
//}

本章では扱いませんが、ヘルプやドキュメントに詳細がありますので参考にしてください。

//noindent
@<href>{https://nemtech.github.io/ja/cli.html#commands}


=== サンプルコードの取得

著者が作成した@<tt>{nem2-sdk}を用いた各機能の実装サンプルにて実装例を紹介します。

//noindent
@<href>{https://github.com/44uk/getting-started-catapult}

//cmd{
$ git clone https://github.com/44uk/getting-started-catapult.git
$ cd getting-started-catapult/scripts
$ npm install
//}

ソースをクローンしたら@<tt>{npm install}にて必要なライブラリをインストールします。
以降、カレントディレクトリはクローンしたプロジェクトのディレクトリを前提とします。


=== コードを実行する前に

サンプルコードでは秘密鍵と@<tt>{GENERATION_HASH}を環境変数から取得します。

//cmd{
export PRIVATE_KEY=C2337B8926ED13EA2C481AB559FFD716E5C3AD76273759B4F7A0DB9315745972
export GENERATION_HASH=0EE13AFBE49394B9985DB8AF1BBCD98859BA9277ACF3A413D639D9C8D76D538F
//}

@<tt>{PRIVATE_KEY},@<tt>{GENERATION_HASH}は@<tt>{alice}のプロファイルから確認してください。

//cmd{
$ nem2-cli profile list
alice->
	Network:	MIJIN_TEST
	Url:		http://localhost:3000
	GenerationHash:	@<b>{0EE13AFBE49394B9985DB8AF1BBCD98859BA9277ACF3A413D639D9C8D76D538F}
	Address:	SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ
	PublicKey:	B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B
	PrivateKey:	@<b>{C2337B8926ED13EA2C481AB559FFD716E5C3AD76273759B4F7A0DB9315745972}
//}

なお@<tt>{GenerationHash}は@<href>{http://localhost:3000/block/1}で取得できる@<tt>{generationHash}です。
プログラムなどで動的に取得したい場合はAPIゲートウェイから取得できます。

//emlist[http://localhost:3000/block/1 初期ブロック例(整形済み)]{
{ "meta": {
"hash":"7001FA2FF43AF77BBA5CFB56A87FCDCAA4E64161DA9E1A250B5AEB03EEA36327",
"generationHash":"@<b>{0EE13AFBE49394B9985DB8AF1BBCD98859BA9277ACF3A413D639D9C8D76D538F}"
(省略)
//}


== 転送トランザクション

//indepimage[figure-3][][scale=0.7]{
//}

@<tt>{nem2-sdk}を使った@<tt>{JavaScript}コードを用いて転送トランザクションを発信します。
トランザクションの発信後にはモニタリングを開始する処理も実装しています。

@<tt>{transfer/create_mosaic_transfer.js}を実行します。
このスクリプトは第一引数に宛先アドレスを第二引数に送信するモザイク（@<tt>{cat.currency}）の相対量を指定します。

ここでは@<tt>{bob}のアドレスへ@<tt>{100 cat.currency}送ります。

//cmd{
$ node transfer/create_mosaic_transfer.js SDJ2MDGUVL7LST7LD4SVXHA76JTTH5HOAJEWCMIB 100
Initiator: SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
Endpoint:  http://localhost:3000/account/SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ
Recipient: SDJ2MD-GUVL7L-ST7LD4-SVXHA7-6JTTH5-HOAJEW-CMIB
Endpoint:  http://localhost:3000/account/SDJ2MDGUVL7LST7LD4SVXHA76JTTH5HOAJEWCMIB

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/6FE3B213DCF817C16607FA5B262D6EC1347246FA47AEBBE7880DF6A3C58CD406
Hash:     6FE3B213DCF817C16607FA5B262D6EC1347246FA47AEBBE7880DF6A3C58CD406
Signer:   B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B

@<b>{[UNCONFIRMED] SDUCBS...}
{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[3630012528,24],"signature":"EC201DAF4080178547793C451ED67532C7D40D6FF6651A3F41DA85E5FB705D40758062DBC1B06ED56059294150F8D0DCC71381DF5E70BE4846CA0C1F7F01C902","signer":"B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B","recipient":{"address":"SDJ2MDGUVL7LST7LD4SVXHA76JTTH5HOAJEWCMIB","networkType":144},"mosaics":[{"amount":[100000000,0],"id":[3294802500,2243684972]}],"message":{"type":0,"payload":"Ticket fee"}}}

@<b>{[CONFIRMED] SDUCBS...}
{"transaction":{"type":16724,"networkType":144,"version":36865,"maxFee":[0,0],"deadline":[3630012528,24],"signature":"EC201DAF4080178547793C451ED67532C7D40D6FF6651A3F41DA85E5FB705D40758062DBC1B06ED56059294150F8D0DCC71381DF5E70BE4846CA0C1F7F01C902","signer":"B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B","recipient":{"address":"SDJ2MDGUVL7LST7LD4SVXHA76JTTH5HOAJEWCMIB","networkType":144},"mosaics":[{"amount":[100000000,0],"id":[3294802500,2243684972]}],"message":{"type":0,"payload":"Ticket fee"}}}
//}

@<tt>{[Unconfirmed]}と@<tt>{[Confirmed]}にはそれぞれ未承認トランザクションと承認済みトランザクションの内容が表示されます。
承認されたら@<tt>{bob}の残高を確認します。

//cmd{
$ nem2-cli account info --profile bob
Account:	SDJ2MD-GUVL7L-ST7LD4-SVXHA7-6JTTH5-HOAJEW-CMIB
-------------------------------------------------------

Address:	SDJ2MD-GUVL7L-ST7LD4-SVXHA7-6JTTH5-HOAJEW-CMIB
at height:	1439

PublicKey:	0000000000000000000000000000000000000000000000000000000000000000
at height:	0

Importance:	0
at height:	0

Mosaics
@<b>{154ee4e837704ed3:	100}
//}

@<tt>{100 cat.currency}が到着していることが確認できました。


==={code-transfer/create_mosaic_transfer} コード解説

後に使用するサンプルコードで共通する部分を前もって解説しておきます。

//source[transfer/create_mosaic_transfer.js]{
const {
  Account,
  Address,
  Deadline,
  NetworkCurrencyMosaic,
  NetworkType
  PlainMessage,
  TransferTransaction,
} = require('nem2-sdk');
const util = require('../util');
//}

@<tt>{nem2-sdk}の各クラスをインポートしています。この部分はコード内で使用するクラスによって異なります。
@<tt>{util.js}は共通する発信処理やモニタリング処理をまとめたもので詳細は後述します。

//source[transfer/create_mosaic_transfer.js]{
const url = process.env.API_URL || 'http://localhost:3000';
// 秘密鍵からアカウントオブジェクトを作る
const initiater = Account.createFromPrivateKey(
  process.env.PRIVATE_KEY,
  NetworkType.MIJIN_TEST
);
//}

前述で設定したとおり、@<tt>{process.env}より秘密鍵を取得しています。
APIゲートウェイのURLも設定できるので、必要があれば環境変数で設定してください。

@<tt>{Account.createFromPrivateKey}でアカウントのオブジェクトを生成しています。
アカウントオブジェクトは対になる公開鍵やアドレスの情報などを持ち、署名のメソッドも持ちます。

//source[transfer/create_mosaic_transfer.js]{
// アドレス文字列からアドレスオブジェクトを作る
const recipient = Address.createFromRawAddress(process.argv[2]);
const amount = parseInt(process.argv[3]);
//}

@<tt>{Address.createFromRawAddress}にアドレス文字列を渡すことでアドレスオブジェクトを生成しています。
アドレスを扱う場合はアドレス文字列をオブジェクトでラップした形で使用します。

//source[transfer/create_mosaic_transfer.js]{
// 確認用の情報を出力
console.log('Initiater: %s', initiater.address.pretty());
console.log('Endpoint:  %s/account/%s', url, initiater.address.plain());
console.log('Recipient: %s', recipient.pretty());
console.log('Endpoint:  %s/account/%s', url, recipient.plain());
//}

ここでは確認用に情報を出力しています。
リソースURLも出しているので、ブラウザで開けばAPIゲートウェイ経由で確認することができます。

//source[transfer/create_mosaic_transfer.js]{
// 送信するモザイク配列
// ここでは`NetworkCurrencyMosaic`すなわち`cat.currency`モザイクオブジェクトを準備
// モザイクIDで作る場合は以下のようにする。
// 可分性がわからないので送信量は絶対値で指定する必要がある。
// new Mosaic(new MosaicId('7d09bf306c0b2e38'), UInt64.fromUint(absoluteAmount)
const mosaics = [NetworkCurrencyMosaic.createRelative(amount)];
//}

転送したいモザイクの配列を作成します。
配列には@<tt>{NetworkCurrencyMosaic}を入れています。
複数のモザイクを送る場合は配列にモザイクオブジェクトを追加します。

@<tt>{NetworkCurrencyMosaic}とは基軸通貨である@<tt>{cat.currency}に特化したクラスです。
@<tt>{createRelative}メソッドは可分性@<tt>{6}を考慮してくれます。

特定のモザイクを16進数のモザイクIDで送信する場合はコメントにあるコード例を使います。
こちらの場合は可分性の情報がないため、絶対値で指定する必要があります。

//source[transfer/create_mosaic_transfer.js]{
// メッセージオブジェクトを作成
// 空メッセージを送る場合は EmptyMessage を使います。
const message = PlainMessage.create('Ticket fee');
//}

添付するメッセージはオブジェクトで文字列をラップします。

//source[transfer/create_mosaic_transfer.js]{
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
//}

ここまでのオブジェクトを引数に、トランザクションのオブジェクトを作成します。

@<tt>{Deadline.create(23)}はトランザクションが署名されてからの有効な期限を設定します。
設定可能な期限は24時間未満の未来まで。引数がない場合はデフォルトの2時間がセットされます。
コメントの補足より@<tt>{js-joda}の時間単位を渡すことでより細かい単位の時間を設定できます。

この期限までにトランザクションがネットワークに承認されなかった場合は、無効なトランザクションとして扱われます。

//source[transfer/create_mosaic_transfer.js]{
// トランザクション成功/失敗,未承認,承認のモニタリング接続
util.listener(url, initiater.address, {
  onOpen: () => {
    // 署名して発信
    const signedTx = initiater.sign(transferTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
//}

モニタリングを開始し、接続が完了して待機状態になったらトランザクションに署名して発信します。
トランザクション署名時に発信したいネットワークの初期ブロックの@<tt>{generationHash}の値を渡す必要があります。
トランザクションの未承認・承認のタイミングで通知が表示され、承認されたらリスナーを終了します。


=== util.jsの解説

@<tt>{util.js}は主にトランザクション発信やリスナー監視の実装をまとめたものです。

//source[transfer/create_mosaic_transfer.js]{
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
//}

アカウントのステータスをモニタリングするにはリスナーオブジェクトを作ります。
APIゲートウェイのURLを渡してオブジェクトを作成します。

//source[transfer/create_mosaic_transfer.js]{
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
//}

作成した@<tt>{listener}オブジェクトは各イベントのメソッドを持ち、それらメソッドが返却する購読オブジェクトの@<tt>{subscribe}を呼ぶことで購読が開始します。

//source[transfer/create_mosaic_transfer.js]{
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
//}

トランザクションをリクエストするには@<tt>{TransactionHttp}オブジェクトを作成します。
ここでの実装は、呼び出すメソッドを選べるように実装しています。
@<tt>{announce***}メソッドに署名済みトランザクションオブジェクトを渡すことで、購読オブジェクトを返却しています。

//source[transfer/create_mosaic_transfer.js]{
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
//}

ここでは渡されてきた購読オブジェクトの購読を開始しています。
@<tt>{subscribe}メソッドによってリクエストが開始され、成功したら@<tt>{tx}オブジェクトの内容を出力しています。

これが基本的なトランザクションオブジェクトの作成と発信の方法です。
他のトランザクションを実行する場合も作成するオブジェクトが異なるくらいで大枠は同じです。

@<tt>{nem2-sdk}は@<tt>{RxJS}ライブラリを使用しています。
より複雑に使いこなすには、@<tt>{RxJS}について公式サイトなどを参照して学習してください。

//noindent
@<href>{https://github.com/ReactiveX/rxjs}


== アグリゲートトランザクション

//indepimage[figure-4][][scale=0.7]{
//}

アグリゲートトランザクションとは、複数のトランザクションを集約してひとつのトランザクションとして発信する機能です。
まとめたトランザクションにひとつでもエラーが含まれる場合はいずれのトランザクションも承認されずに破棄されます。
DBMSにおける「トランザクション」と同じような概念で、原始性を実現します。

内包するトランザクションに、発信者以外の署名が必要なトランザクションも含めることができます。
アグリゲートトランザクションの発信時に必要なすべての署名が揃っているかどうかで、
コンプリート/ボンデッドの2種類に分類されます。


=== アグリゲート「コンプリート」

@<tt>{Aggregate Complete}は内包されたトランザクションに関する署名がすべて揃った状態のアグリゲートトランザクションです。
すべてのトランザクションが発信者の署名だけで完結する場合は@<tt>{Aggregate Complete}となります。
次のような用途が考えられます。

 * 複数のアカウントへ同時にトランザクションを送る
 * ひとつのトランザクションに複数のメッセージを保存する
 * 多層のネームスペースを一度のトランザクションで取得する
 * ネームスペース取得とモザイク作成を同時に行う
 * マルチシグの連署者の追加・削除を同時に行う

本章では転送トランザクションを集約していますが、他のあらゆるトランザクションも内包可能です。
色々な組み合わせを試してください。


==== 一括転送トランザクション

@<tt>{transfer/create_transfers_atomically.js}を実行します。
このコードは実行時に生成した3つのアカウントへ同時にモザイクを送信します。
個別に3件分のトランザクションをひとまとめにして、すべてのトランザクションが一度に承認されることを保証します。

引数に各アカウントへ送る@<tt>{cat.currency}を相対量で指定します。
生成したアカウントはコンソールに出力されるだけなので、必要があれば保存してください。

//cmd{
$ node transfer/create_transfers_atomically.js 30
Initiator: SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
Endpoint:  http://localhost:3000/account/SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ

- account1 ----------------------------------------------------------------
Private:  8E01BA208F424ABC7A271A365B3406B827F2F5206446D0193BBFE7AD16E7C4D8
Public:   47290C72980B7827DC8E5F29314FF66097611026F604164BAF08C107B00728F7
Address:  SBIUY7-NVVYF3-GMEKBW-UILSQZ-3R7BKH-2GODQL-UFXU
Endpoint: http://localhost:3000/account/SBIUY7NVVYF3GMEKBWUILSQZ3R7BKH2GODQLUFXU
- account2 ----------------------------------------------------------------
Private:  83D3277AB2C119530F74BBDAAD20C738B5490C88D3FE14FE2196AEA27D5F877B
Public:   63E5B54B56AD32B62AA3E4FC8028A442F0992D7C5724F9EDE27E8601E963D92E
Address:  SAHG42-56QBYM-OYCFDQ-U3ECCJ-SI4WK4-WQ52K2-LSDR
Endpoint: http://localhost:3000/account/SAHG4256QBYMOYCFDQU3ECCJSI4WK4WQ52K2LSDR
- account3 ----------------------------------------------------------------
Private:  B0E9F3B9ACE1CFDC13B1F29209398F9B33B200A7C397E5BEF8B713D73B07B8E9
Public:   5D614F0B7B5D5963E8EEAE98DE56E4EB4D9DD0311B00296537949DE0232A857B
Address:  SBB6RN-RESMJG-I53QNR-RLIBDD-I7YJP2-JVHAAL-IFRN
Endpoint: http://localhost:3000/account/SBB6RNRESMJGI53QNRRLIBDDI7YJP2JVHAALIFRN

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/B730043A2B475BA567713A2B15451811E273AFFA7EAA792365DD2CB513882B9A
Hash:     B730043A2B475BA567713A2B15451811E273AFFA7EAA792365DD2CB513882B9A
Signer:   B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B
(省略)
//}

承認されたら、生成されたアカウントの残高を確認します。
@<tt>{nem2-cli account info}の@<tt>{-a}オプションにアドレスを渡すことで確認できます。

//cmd{
$ nem2-cli account info -a SBIUY7-NVVYF3-GMEKBW-UILSQZ-3R7BKH-2GODQL-UFXU --profile alice
Account:	SBIUY7-NVVYF3-GMEKBW-UILSQZ-3R7BKH-2GODQL-UFXU
-------------------------------------------------------

Address:	SBIUY7-NVVYF3-GMEKBW-UILSQZ-3R7BKH-2GODQL-UFXU
at height:	2096

PublicKey:	0000000000000000000000000000000000000000000000000000000000000000
at height:	0

Importance:	0
at height:	0

Mosaics
154ee4e837704ed3:	30
//}

モザイクは届いているようですが、受信した結果だけを確認すると3人に1回ずつ送信したのか、同時に送信されたのかは区別が付きません。
@<tt>{nem2-cli transaction info}の@<tt>{-h}オプションにトランザクションハッシュを指定して内容を確認します。

//cmd{
$ nem2-cli transaction info -h B730043A2B475BA567713A2B15451811E273AFFA7EAA792365DD2CB513882B9A --profile alice

AggregateTransaction:
  InnerTransactions: [
    TransferTransaction: Recipient:SBIUY7-NVVYF3-GMEKBW-UILSQZ-3R7BKH-2GODQL-UFXU Message:"Tip for you" Mosaics: NamespaceId:85bbea6cc462b244::30000000 Signer:SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ Deadline:2019-08-18
    TransferTransaction: Recipient:SAHG42-56QBYM-OYCFDQ-U3ECCJ-SI4WK4-WQ52K2-LSDR Message:"Tip for you" Mosaics: NamespaceId:85bbea6cc462b244::30000000 Signer:SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ Deadline:2019-08-18
    TransferTransaction: Recipient:SBB6RN-RESMJG-I53QNR-RLIBDD-I7YJP2-JVHAAL-IFRN Message:"Tip for you" Mosaics: NamespaceId:85bbea6cc462b244::30000000 Signer:SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ Deadline:2019-08-18
  ]
  Signer:SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ Deadline:2019-08-18 Hash:B730043A2B475BA567713A2B15451811E273AFFA7EAA792365DD2CB513882B9A
//}

@<tt>{InnerTransactions}に3つの宛先への転送トランザクションが入っていることが確認できました。
なお、このコードでは便宜上、同じ量と同じメッセージを送っていますが、もちろん個別に変えることもできます。


===={code-transfer/create_transfers_atomically} コード解説

//source[transfer/create_transfers_atomically.js]{
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
  NetworkType.MIJIN_TEST
);
//}

@<tt>{TransferTransaction}オブジェクトを作るところは転送と同じです。
各トランザクションオブジェクトに署名者の公開アカウントオブジェクトを渡して@<tt>{toAggregate}メソッドを呼びます。
その配列を@<tt>{AggregateTransaction.createComplete}に渡して、アグリゲートトランザクションオブジェクトを作ります。
このオブジェクトに署名を行って発信します。


=== アグリゲート「ボンデッド」

@<tt>{Aggregate Bonded}は内包されたトランザクションに署名を要求するトランザクションが含まれているアグリゲートトランザクションです。
別のアカウントの署名が必要なトランザクションを含む場合は@<tt>{Aggregate Bonded}となります。
次のような用途が考えられます。

 * 相手のアカウントにモザイクの送信を要求したい
 * 手数料分のモザイクを渡し、それを使ってモザイクを送信したい
 * 複数の関係者間で順次行われるトランザクションの流れを定義したい
 * マルチシグ連署者に署名を求めるトランザクションを発信したい
 * マルチシグ連署者としてアカウントを追加したい


==== LockFundTransactionについて

アグリゲートボンデッドを発信する前に@<tt>{LockFundsTransaction}を発信し、担保として@<tt>{10 cat.currency}をネットワーク上に預け入れる必要があります。
この@<tt>{10 cat.currency}は署名が完了し、アグリゲートトランザクションが承認されると発信したアカウントの残高へ戻ります。

承認されずに（関係者の署名が揃わなかった、つまり否決された）トランザクションが承認される前に期限を迎えると、
期限が切れる時のブロックをハーベストしたアカウントへのハーベスト報酬となり戻ってきません。
これは他のアカウントへむやみに署名の要求を送るスパム抑制のための制限として実装されています。


==== 転送要求トランザクション（アグリゲートボンデッド）

@<tt>{transfer/create_pullfunds.js}を実行します。
このコードは@<tt>{alice}が@<tt>{10 cat.currency}の支払い要求を@<tt>{bob}へ送り、それを受取った@<tt>{bob}が支払いに同意するケースです。
メッセージの内容を確認した@<tt>{bob}が署名をすることで、アグリゲートトランザクションが承認されます。

このコードでは@<tt>{bob}も署名する必要があるので、引数に@<tt>{bob}の秘密鍵を渡します。

アグリゲートボンデッドの作成から承認されるまでの流れをひとつのスクリプト中で行っており、
現実的ではありませんが、トランザクションや署名タイミングの流れを理解してください。

//cmd{
$ node transfer/create_pullfunds.js 6C89BC27D54F5F85ECB3123BBF9D01AEF8CE0C269DAEFDEFC3BF40F26B75F26F
Initiator: SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
Endpoint:  http://localhost:3000/account/SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ
Debtor:    SDJ2MD-GUVL7L-ST7LD4-SVXHA7-6JTTH5-HOAJEW-CMIB
Endpoint:  http://localhost:3000/account/SDJ2MDGUVL7LST7LD4SVXHA76JTTH5HOAJEWCMIB

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/4D02C702D3B325C302CF3FF44FC5EF8FF5505753DBF6025DCAF70F5E2A709F46
Hash:     4D02C702D3B325C302CF3FF44FC5EF8FF5505753DBF6025DCAF70F5E2A709F46
Signer:   B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B
(省略)
//}

@<tt>{bob}が@<tt>{alice}へ@<tt>{10 cat.currency}を送信して残高が減少していることを確認します。

//cmd{
$ nem2-cli account info --profile bob
(省略)
Mosaics
154ee4e837704ed3:	90
//}

今回は@<tt>{alice}からメッセージだけを送りましたが、モザイクの交換をしたい場合にも同じ操作をすることで安全に交換することができます。


===={code-transfer/create_pullfunds} コード解説

//source[transfer/create_pullfunds.js]{
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
  [ fromInitiaterTx.toAggregate(initiater.publicAccount),
    fromDebtorTx.toAggregate(debtor.publicAccount) ],
  NetworkType.MIJIN_TEST
);
const signedTx = initiater.sign(aggregateTx, process.env.GENERATION_HASH);
//}

@<tt>{alice}はメッセージ@<tt>{"Request for a refund 10 cat.currency"}を送るトランザクションを作ります。
そして@<tt>{alice}へ@<tt>{10 cat.currency}を転送するトランザクションを作ります。

トランザクション配列はその順序どおりに処理されるので、
@<tt>{alice}がメッセージを送信し、@<tt>{bob}がモザイクを送るという順序でアグリゲートしています。

//source[transfer/create_pullfunds.js]{
util.listener(url, initiater.address, {
  onConfirmed: (info) => {
    // LockFundが承認されたらアグリゲートトランザクションを発信
    if(info.type == TransactionType.LOCK) {
      console.log('LockFund confirmed!');
      util.announceAggregateBonded(url, signedTx);
    }
  }
})
//}

アグリゲートトランザクションの発信は、ロックトランザクションが承認されてから行います。
ロックトランザクションの発信については後述します。

//source[transfer/create_pullfunds.js]{
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
//}

アグリゲートトランザクションがネットワークに現れたら、@<tt>{bob}が内容を確認して署名します。

//source[transfer/create_pullfunds.js]{
// 保証金のような役割であるLockFundTransactionを作成する
const lockFundMosaic = NetworkCurrencyMosaic.createRelative(10)
const lockFundsTx = LockFundsTransaction.create(
  Deadline.create(),
  lockFundMosaic,
  UInt64.fromUint(480),
  signedTx,
  NetworkType.MIJIN_TEST
);

const signedLockFundsTx = initiater.sign(lockFundsTx, process.env.GENERATION_HASH);
util.announce(url, signedLockFundsTx);
//}

アグリゲートボンデッドトランザクションでは、先にロックファンドトランザクションが承認されている必要があります。
@<tt>{10 cat.currency}を保証とし、署名済みのアグリゲートトランザクションを渡して@<tt>{LockFundsTransaction}を作成したら発信します。


== モザイク

//indepimage[figure-5][][scale=0.7]{
//}

モザイクとはNEMネットワーク上で定義される通貨であり、NEMにはそれを定義する機能があります。
基軸モザイクである@<tt>{cat.currency}もモザイクであり、定義上は同等な存在となります。

モザイクには作成時に設定できる定義があります。

 * 有効ブロック数（有効なモザイクとするブロック数）
 * 可分性（1モザイクを小数第何位まで分割できるようにするか）
 * 転送許可（自由な転送を許可するか、モザイク発行者との転送に制限するか）
 * 供給量変更許可（発行後に供給量を変更できるようにするか）

モザイクは@<tt>{229bd68b3145ee8f}のようなネットワーク上で一意なIDを持ちます。


=== モザイクの用途

モザイクは単なる通貨としてでなく、意味付け次第でいろいろな使い方ができます。

 * 独自のサービス用通貨の表現
 * 保有によるフラグ制御や値の表現
 * 発行者と受信者間だけでやり取りされる権利の表現

モザイクをどう使うかはサービス開発・提供者の手腕が問われます。


=== モザイクの作成

@<tt>{mosaic/create_mosaic.js}を実行します。
ネットワークのデフォルト値では、モザイクの定義にはその定義内容にかかわらず@<tt>{500 cat.currency}が必要です。
#@# 本章ではネットワーク構築時に設定を変更したため、手数料は要求されません。

//cmd{
$ node mosaic/create_mosaic.js
Initiator:    SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
Endpoint:     http://localhost:3000/account/SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ
Mosaic Nonce: 164,132,87,199
Mosaic Hex:   229bd68b3145ee8f
Blocks:       Infinity
Endpoint:     http://localhost:3000/mosaic/229bd68b3145ee8f

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/8135A55DCE1B46D893873160F7FFB093C14976D9667C7387E0EAB3B3CD9BE712
Hash:     8135A55DCE1B46D893873160F7FFB093C14976D9667C7387E0EAB3B3CD9BE712
Signer:   B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B
(省略)
//}

承認されたら@<tt>{nem2-cli}で確認します。

//cmd{
$ nem2-cli mosaic info -h 229bd68b3145ee8f --profile alice
Mosaic:	Hex:	229bd68b3145ee8f
Uint64:		[ 826666639, 580638347 ]

divisibility:	0
transferable:	true
supply mutable:	true
block height:	81
duration:	0
owner:		SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
supply:		0
//}

この時点ではまだ供給量が設定されていません。
定義だけが存在していてモザイクは発行されていない状態なので@<tt>{supply 0}と表示されています。

次に@<tt>{mosaic/mutate_mosaic_supply.js}を実行します。
このコードは第一引数にモザイクIDを、第二引数に供給量（絶対値）を、
第三引数に@<tt>{add}（追加）または@<tt>{remove}（削除）を指定します。
モザイクIDには直前に作成したモザイクの16進数文字列（ここでは@<tt>{229bd68b3145ee8f}）を指定します。

//cmd{
$ node mosaic/mutate_mosaic_supply.js 229bd68b3145ee8f 10000 add
Initiator:  SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
Endpoint:   http://localhost:3000/account/SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ
Mosaic Hex: 229bd68b3145ee8f
Supply:     10000
Delta:      add
Endpoint:   http://localhost:3000/mosaic/229bd68b3145ee8f

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/434345A8248BEC052C4D5E1E774DFE4A5D0C27193FB2856B59DE67D4E18C95FE
Hash:     434345A8248BEC052C4D5E1E774DFE4A5D0C27193FB2856B59DE67D4E18C95FE
Signer:   B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B
(省略)
//}

承認されたらもう一度@<tt>{nem2-cli}で確認します。

//cmd{
$ nem2-cli mosaic info -h 229bd68b3145ee8f --profile alice
Mosaic:	Hex:	229bd68b3145ee8f
Uint64:		[ 826666639, 580638347 ]

divisibility:	0
transferable:	true
supply mutable:	true
block height:	81
duration:	0
owner:		SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
supply:		10000
//}

今度は@<tt>{supply}に指定した供給量が発行され、@<tt>{alice}が保有するモザイクに現れました。

//cmd{
$ nem2-cli account info --profile alice
(省略)
Mosaics
229bd68b3145ee8f:	10000
//}

これでモザイクの定義が完了しました。
このモザイクは基軸モザイクの@<tt>{cat.currency}と同様に、他のアカウントへ転送することができます。


===={code-mosaic/create_mosaic} コード解説

//source[mosaic/create_mosaic.js]{
const definitionTx = MosaicDefinitionTransaction.create(
  Deadline.create(),
  nonce,
  mosId,
  MosaicProperties.create({
    duration: blocks ? UInt64.fromUint(blocks) : undefined,
    divisibility: 0,
    transferable: true,
    supplyMutable: true,
    levyMutable: false
  }),
  NetworkType.MIJIN_TEST
);
//}

モザイク定義には@<tt>{MosaicDefinitionTransaction}オブジェクトを作成します。
@<tt>{MosaicProperties.create}によってモザイクの性質プロパティを設定しています。
@<tt>{duration}では有効なブロック数の期限を設定できますが、@<tt>{undefined}とした場合は無期限となります。

続いて、供給量の指定のコードです。

//source[mosaic/mutate_mosaic_supply.js]{
const supplyType = delta === 'remove'
  ? MosaicSupplyType.Decrease
  : MosaicSupplyType.Increase

const supplyTx = MosaicSupplyChangeTransaction.create(
  Deadline.create(),
  mosId,
  supplyType,
  UInt64.fromUint(absSupply),
  NetworkType.MIJIN_TEST
);
//}

モザイクID、追加または削除の固定値、供給量を指定して@<tt>{MosaicSupplyChangeTransaction}オブジェクトを作成します。
これらのトランザクションを発信して、承認されれば独自モザイクを利用する準備が整います。


=== モザイク定義と供給量をアトミックに定義する

アグリゲートトランザクションで２つのトランザクションをまとめることで、定義と供給量の設定を一括で行うことができます。
前述の操作をアグリゲートトランザクションに集約したコードで、解説は省略します。
詳細はコードを確認してください。

@<tt>{mosaic/create_mosaic_with_supply.js}を実行します。
このコードは第一引数に供給量（絶対値）を指定してます。

//cmd{
$ node mosaic/create_mosaic_with_supply.js 10000
Initiator: SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
Endpoint:  http://localhost:3000/account/SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ
Nonce:     222,182,84,201
MosaicHex: 5f791e18223bd75e
Blocks:    Infinity
Supply:    10000
Endpoint:  http://localhost:3000/mosaic/5f791e18223bd75e

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/F2B35C415B88BDCCA532EDC5736A3F63E629966769E0BBCDD58B0D79BDF59ACA
Hash:     F2B35C415B88BDCCA532EDC5736A3F63E629966769E0BBCDD58B0D79BDF59ACA
Signer:   B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B
(省略)
//}

承認されたら@<tt>{alice}のモザイクを確認します。

//cmd{
$ nem2-cli account info --profile alice
(省略)
Mosaics
5f791e18223bd75e:	10000
//}


== ネームスペース

//indepimage[figure-6][][scale=0.8]{
//}

ネームスペースとはインターネットのドメインネームと同じような名前の定義です。
ネームスペースとして利用可能な文字には制限があります。

 * @<tt>{a}から@<tt>{z}のアルファベット小文字
 * @<tt>{0}から@<tt>{9}の数字
 * @<tt>{‘}（アポストロフィ）
 * @<tt>{_}（アンダースコア）
 * @<tt>{-}（ハイフン）

@<tt>{.}（ドット）で区切られる3階層までのネームスペースを定義でき、下層をサブネームスペースと呼びます。
具体的には@<tt>{japan.tokyo.shinjuku}のようなネームスペースを取得できます。

@<tt>{japan}がルート、@<tt>{tokyo}は@<tt>{japan}のサブ、@<tt>{shinjuku}は@<tt>{japan.tokyo}のサブとなります。
サブネームスペースを定義するには先に親のネームスペース（@<tt>{japan}もしくは@<tt>{japan.tokyo}）が定義されている必要があります。


=== ネームスペースの用途

ネームスペースはアカウントのエイリアスまたはモザイクのエイリアス（別名）として割り当てることができます。

 * ネームスペース@<tt>{hoge}をあるアカウントに紐付けると、@<tt>{hoge}でアドレスを取得できる。
 * ネームスペース@<tt>{huga}をあるモザイクに紐付けると、@<tt>{huga}でモザイクを取得できる。
 * ネームスペースの保有アカウントを特定することができる。

基軸モザイクにも@<tt>{cat.currency}という特別なネームスペースが割当てられています。
エイリアスとしてネームスペースを紐付けるには、後述するエイリアスリンクトランザクションを使います。

紐づけはネームスペースのレベルごとに可能です。
たとえば@<tt>{japan}をアカウントAへ、@<tt>{japan.tokyo}をアカウントBへ、@<tt>{japan.tokyo.shinjuku}をモザイクAに紐付けるということもできます。


=== ネームスペースの取得

@<tt>{namespace/register_namespace.js}を実行します。
このスクリプトは第一引数に取得したいネームスペース名を渡します。

ネームスペースにはレンタル期間（ブロック数）があり、ルートネームスペースに適用されます。
サブネームスペースの有効期間はルートネームスペースのレンタル期間と同じになります。

ネットワークのデフォルト値では、ネームスペースのレンタル期間には@<tt>{1 block}につき@<tt>{1 cat.currency}が必要です。
#@# 本章ではネットワーク構築時に設定を変更したため、手数料は要求されません。

//cmd{
$ node namespace/register_namespace.js foo
Initiator: SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
Endpoint:  http://localhost:3000/account/SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ
Namespace: foo (82a9d1ac587ec054)
Blocks:    5000
Endpoint:  http://localhost:3000/namespace/82a9d1ac587ec054

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/1F1786C820149B3EC9C21A5AACD0E0EEDCE5181CB39F198D45CB322687DC2444
Hash:     1F1786C820149B3EC9C21A5AACD0E0EEDCE5181CB39F198D45CB322687DC2444
Signer:   B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B
(省略)
//}

承認されたら@<tt>{nem2-cli}で確認します。

//cmd{
$ nem2-cli namespace info -n foo --profile alice
Namespace: foo
--------------

hexadecimal:	82a9d1ac587ec054
uint:		[ 1484701780, 2192167340 ]
type:		Root namespace
owner:		SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
startHeight:	120
endHeight:	5128
//}

今回作ったのはルートネームスペースなので@<tt>{type}が@<tt>{Root namespace}と表示されています。
他にもレンタル開始ブロックと終了ブロックなども表示されます。

なお@<tt>{namespace info}コマンドはネームスペース名の情報を取得するコマンドです。
アカウントが保有するネームスペースを確認したい場合は@<tt>{namespace owned}コマンドを使います。

//cmd{
$ nem2-cli namespace owned --profile alice
Namespace: foo
--------------

hexadecimal:	82a9d1ac587ec054
uint:		[ 1484701780, 2192167340 ]
type:		Root namespace
owner:		SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
startHeight:	120
endHeight:	5128
//}


===={code-namespace/register_namespace} コード解説

//source[namespace/register_namespace.js]{
const [parent, child] = namespace.split(/\.(?=[^\.]+$)/)

let registerTx
if (child) {
  registerTx = RegisterNamespaceTransaction.createSubNamespace(
    Deadline.create(),
    child,
    parent,
    NetworkType.MIJIN_TEST
  )
} else {
  registerTx = RegisterNamespaceTransaction.createRootNamespace(
    Deadline.create(),
    parent,
    UInt64.fromUint(blocks),
    NetworkType.MIJIN_TEST
  )
}
//}

ルートまたはサブの定義に使うオブジェクトはそれぞれ異なるので、メソッド呼び出しの場合分けを行っています。
あとはこのオブジェクトに署名して発信するだけです。

サブネームスペースを作りたい場合は@<tt>{foo.bar}のようにドットで区切った引数を渡します。
この際、上位のネームスペースを取得していなければなりません。
なお、サブネームスペースの取得には1つごとに@<tt>{1 cat.currency}が必要です。


=== ネームスペースをアグリゲートトランザクションで取得

サブネームスペースの取得にはあらかじめその上位のネームスペースを取得する必要があります。
この手順をアグリゲートトランザクションで1つのトランザクションにすることができます。

@<tt>{namespace/register_namespace_atomically.js}を実行します。
このスクリプトは第一引数にドットで区切ったサブネームスペースを含めたネームスペース名を渡します。

//cmd{
$ node namespace/register_namespace_atomically.js aaa.bbb.ccc
Initiator: SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
Endpoint:  http://localhost:3000/account/SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ
Blocks:    1000
Namespace: aaa (acccbcfcb5ecee23)
Endpoint:  http://localhost:3000/namespace/acccbcfcb5ecee23
Namespace: aaa.bbb (9e75f2396f24994e)
Endpoint:  http://localhost:3000/namespace/9e75f2396f24994e
Namespace: aaa.bbb.ccc (bfd5304c9be87a5c)
Endpoint:  http://localhost:3000/namespace/bfd5304c9be87a5c

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/4652487FD57327A0B810B1CB896BDE0992A72C5B70DD44E6DFA681A9BEBADF17
Hash:     4652487FD57327A0B810B1CB896BDE0992A72C5B70DD44E6DFA681A9BEBADF17
Signer:   B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B
(省略)
//}

承認されたら@<tt>{nem2-cli}で確認します。

//cmd{
$ nem2-cli namespace info -n aaa.bbb.ccc --profile alice
Namespace: aaa.bbb.ccc
----------------------

hexadecimal:	bfd5304c9be87a5c
uint:		[ 2615704156, 3218419788 ]
type:		Sub namespace
owner:		SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
startHeight:	138
endHeight:	1146

Parent Id:
hexadecimal:	9e75f2396f24994e
uint:		[ 1864669518, 2658529849 ]
//}


===={code-namespace/register_namespace_atomically} コード解説

//source[namespace/register_namespace_atomically.js]{
// 各レベルの登録トランザクションを生成
const txes = parts.reduce((accum, part, idx, array) => {
  const parent = array.slice(0, idx).join('.');
  let registerTx;
  if (accum.length === 0) {
    registerTx = RegisterNamespaceTransaction.createRootNamespace(
      Deadline.create(),
      part,
      UInt64.fromUint(blocks),
      NetworkType.MIJIN_TEST
    );
  } else {
    registerTx = RegisterNamespaceTransaction.createSubNamespace(
      Deadline.create(),
      part,
      parent,
      NetworkType.MIJIN_TEST
    );
  }
  accum.push(registerTx);
  return accum;
}, []);

// アグリゲートコンプリートトランザクション組み立て
// トランザクションは配列先頭から処理されるので辻褄が合うように順序には気をつける
const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  txes.map(tx => tx.toAggregate(initiater.publicAccount)),
  // 子から作ろうとするとエラーになる
  // txes.map(tx => tx.toAggregate(initiater.publicAccount)).reverse(),
  NetworkType.MIJIN_TEST,
  []
);
//}

ネームスペース定義ごとに@<tt>{RegisterNamespaceTransaction}オブジェクトを作成します。
各トランザクションをアグリゲートトランザクションでまとめたら、署名をして発信します。

なお、アグリゲートトランザクションは配列の先頭から処理されるので、
ルートネームスペースの取得のあとにサブネームスペースを取得するように辻褄を合わせる必要があります。


== エイリアスリンク

ネームスペースはモザイクまたはアカウントにリンクすることができます。
ネームスペースをリンクすることで、ネームスペース名によってモザイクまたはアカウントを認識できるようになります。


=== ネームスペースをモザイクにリンクする

リンクする前にネームスペース名でモザイクを取得するコードを実行します。
第一引数にはネームスペース名を渡します。

//cmd{
$ node namespace/fetch_mosaic_by_alias.js foo
Namespace: foo (82a9d1ac587ec054)
Endpoint:  http://localhost:3000/namespace/82a9d1ac587ec054

Error:  Error: No mosaicId is linked to namespace '1484701780,2192167340'
//}

紐付ける前なのでエラーが通知されました。
メッセージから@<tt>{foo}というネームスペースに紐付いたモザイクがないことがわかります。

それではネームスペースとモザイクをリンクさせてみます。
第一引数にはネームスペース名を渡し、第二引数にはモザイクIDを渡します。

//cmd{
$ node aliaslink/alias_mosaic.js foo 229bd68b3145ee8f
Initiator: SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
Endpoint:  http://localhost:3000/account/SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ
Namespace: foo
Endpoint:  http://localhost:3000/namespace/82a9d1ac587ec054
MosaicHex: 229bd68b3145ee8f
Endpoint:  http://localhost:3000/mosaic/229bd68b3145ee8f

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/A6A70BD075AADBAC724CDEC4D08E86611ED3B5A9366C702E97FD30C35B6CBB8E
Hash:     A6A70BD075AADBAC724CDEC4D08E86611ED3B5A9366C702E97FD30C35B6CBB8E
Signer:   B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B
(省略)
//}

承認されたら、再度@<tt>{namespace/fetch_mosaic_by_alias.js}を実行します。

//cmd{
$ node namespace/fetch_mosaic_by_alias.js foo
Namespace: foo (82a9d1ac587ec054)
Endpoint:  http://localhost:3000/namespace/82a9d1ac587ec054

Namespace: foo
MosaicId:  229bd68b3145ee8f [826666639, 580638347]
//}

今度はリンクされているので結果を取得できました。


===={code-namespace/fetch_mosaic_by_alias} コード解説

//source[namespace/fetch_mosaic_by_alias.js]{
const nsId = new NamespaceId(namespace);
const mosId = new MosaicId(mosaicHex);

const aliasTx = MosaicAliasTransaction.create(
  Deadline.create(),
  AliasActionType.Link,
  nsId,
  mosId,
  NetworkType.MIJIN_TEST
);
//}

ネームスペースID、モザイクIDを渡して@<tt>{MosaicAliasTransaction}オブジェクトを作り、これに署名をして発信します。
続いて、ネームスペース名からモザイクIDを取得するコードです。

//source[namespace/fetch_mosaic_by_alias.js]{
const nsId = new NamespaceId(namespace);
const nsHttp = new NamespaceHttp(url);

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
//}

ネームスペースIDオブジェクトを作り、@<tt>{NamespaceHttp#getLinkedMosaicId}に渡して取得します。
@<tt>{NamespaceHttp}はネームスペースのAPIゲートウェイにアクセスするオブジェクトです。
@<tt>{subscribe}メソッドによって購読を開始するとリクエストが開始され、情報が取得できます。


=== ネームスペースをアカウントにリンクする

ネームスペースをモザイクへリンクすることで、ネームスペース名によってモザイクを認識することができるようになります。
リンクする前にネームスペース名でモザイクを取得したり、ネームスペース名を宛先とするコードを実行します。

以下はモザイクへリンクする場合とほぼ同様のコードのため、結果やコード解説を省略します。
詳しくはコードを実行し、ファイルを開いて確認してください。

//cmd{
# ネームスペース`alice`を取得
$ node namespace/register_namespace.js alice
//}

//cmd{
# ネームスペースで取得に失敗することを確認
$ node namespace/fetch_account_by_alias.js alice
//}

//cmd{
# ネームスペースをアカウントへリンク
$ node aliaslink/alias_account.js alice SAFPLKSQJTYGTWKNJ6B66LJV3VRBMUSBQH7Y6ZH4
//}

//cmd{
# 取得できることを確認
$ node namespace/fetch_account_by_alias.js alice
Namespace: alice (9cf66fb0cfeed2e0)
Endpoint:  http://localhost:3000/namespace/9cf66fb0cfeed2e0

Namespace: alice
Address:   SAFPLK-SQJTYG-TWKNJ6-B66LJV-3VRBMU-SBQH7Y-6ZH4
//}

//cmd{
# ネームスペース名でモザイクを送信できることを確認
$ node transfer/create_mosaic_transfer_by_namespace.js alice 10
//}


=== ネームスペースをリンクさせたモザイクをアトミックに作成する

サブネームスペースをアグリゲートトランザクションで取得したように、この一連の作業もアトミックにできます。

@<tt>{mosaic/create_named_mosaic_with_supply.js}を実行します。
このスクリプトは第一引数に取得したいネームスペース名を渡します。
第二引数でモザイク供給量を指定し、第三引数でレンタル期間を指定できます。

//cmd{
$ node mosaic/create_named_mosaic_with_supply.js qwe.rty.uio
Initiator: SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
Endpoint:  http://localhost:3000/account/SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ
Blocks:    1000
Namespace: qwe (c90688e2b544bece)
Endpoint:  http://localhost:3000/namespace/c90688e2b544bece
Namespace: qwe.rty (9649d4770e5f1143)
Endpoint:  http://localhost:3000/namespace/9649d4770e5f1143
Namespace: qwe.rty.uio (c994422e6a5c5dc3)
Endpoint:  http://localhost:3000/namespace/c994422e6a5c5dc3

Mosaic Nonce: 118,46,251,116
Mosaic Hex:   628600a58275ae19
Supply:       5000
Endpoint:     http://localhost:3000/mosaic/628600a58275ae19

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/486E13DF75E98B809844780C2FF22C95522C520FD907BE9817D4D6B0A4EBC2B5
Hash:     486E13DF75E98B809844780C2FF22C95522C520FD907BE9817D4D6B0A4EBC2B5
Signer:   B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B
(省略)
//}

実行後、ネームスペースでモザイクを取得できるか、モザイクが作成されているかを確認します。

//cmd{
$ node namespace/fetch_mosaic_by_alias.js qwe.rty.uio
Namespace: qwe.rty.uio (c994422e6a5c5dc3)
Endpoint:  http://localhost:3000/namespace/c994422e6a5c5dc3

Namespace: qwe.rty.uio
MosaicId:  628600a58275ae19 [2188750361, 1652949157]
//}

//cmd{
$ nem2-cli account info --profile alice
(省略)
Mosaics
628600a58275ae19:	5000
//}

@<tt>{mosaic/create_named_mosaic_with_supply.js}の内容はこれまでのコードをつなぎ合わせて、
アグリゲートトランザクションでまとめたものなので詳細な説明は省略します。


=== ネームスペースでモザイクを送信する

@<tt>{transfer/create_mosaic_transfer_by_named_mosaic.js}を実行します。
ネームスペースとリンクさせたモザイクをネームスペースの指定によって送信します。

@<tt>{bob}へ@<tt>{0b6f0121afd85ffc}モザイクを@<tt>{qwe.rty.uio}ネームスペースから呼び出して送信します。
このスクリプトは第一引数に宛先アドレスを、第二引数にネームスペースを、第三引数に送信量を指定します。

//cmd{
$ node transfer/create_mosaic_transfer_by_named_mosaic.js SDJ2MDGUVL7LST7LD4SVXHA76JTTH5HOAJEWCMIB qwe.rty.uio 100
Initiator: SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
Endpoint:  http://localhost:3000/account/SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ
Recipient: SDJ2MD-GUVL7L-ST7LD4-SVXHA7-6JTTH5-HOAJEW-CMIB
Endpoint:  http://localhost:3000/account/SDJ2MDGUVL7LST7LD4SVXHA76JTTH5HOAJEWCMIB
MosaicId:  628600a58275ae19
Endpoint:  http://localhost:3000/mosaic/628600a58275ae19

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/94179EFB399031446158C4801514AFD3A3B3413C604068A7032CAA645F54AFF2
Hash:     94179EFB399031446158C4801514AFD3A3B3413C604068A7032CAA645F54AFF2
Signer:   B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B
(省略)
//}

@<tt>{qwe.rty.uio}に紐付いたモザイク(@<tt>{628600a58275ae19})が@<tt>{bob}へ届いているかを確認します。

//cmd{
$ nem2-cli account info --profile bob
(省略)
Mosaics
628600a58275ae19:	100
//}


===={code-namespace/create_mosaic_transfer_by_named_mosaic} コード解説

送信モザイク配列を作る際に@<tt>{MosaicId}オブジェクトの代わりに@<tt>{NamespaceId}オブジェクトを渡すことができます。
送信前にモザイクの情報が必要無ければ取得せずにトランザクションを発信することもできます。

//source[namespace/create_mosaic_transfer_by_named_mosaic.js]{
nsHttp.getLinkedMosaicId(nsId)
  .subscribe(
    mosaicId => {
      console.log('Initiator: %s', initiator.address.pretty());
      console.log('Endpoint:  %s/account/%s', url, initiator.address.plain());
      console.log('Recipient: %s', recipient.pretty());
      console.log('Endpoint:  %s/account/%s', url, recipient.plain());
      console.log('MosaicId:  %s', mosaicId.toHex());
      console.log('Endpoint:  %s/mosaic/%s', url, mosaicId.toHex());
      console.log('');

      // MosaicIdには直接NamespaceIdオブジェクトを渡せます。
      // 一度モザイクIDを引いているのはモザイクIDを表示するためです。
      const transferTx = TransferTransaction.create(
        Deadline.create(),
        recipient,
        [new Mosaic(nsId, UInt64.fromUint(amount))],
        PlainMessage.create(`Send ${mosaicId.toHex()} by ${nsId.fullName}`),
        NetworkType.MIJIN_TEST
      );
(省略)
//}

@<tt>{getLinkedMosaicId}メソッドでネームスペースに紐付くモザイクIDオブジェクトを取得していますが、
これは標準出力とメッセージへモザイクIDを渡す目的で、発信に必須ではありません。

それ以外の処理は@<tt>{transfer/create_mosaic_transfer.js}とほとんど同じです。


== マルチシグアカウント

//indepimage[figure-7][][scale=0.7]{
//}

マルチシグアカウントとは、トランザクションの発信に紐付けた連署者アカウントによる署名が必要になる機能です。


=== マルチシグアカウントの用途

マルチシグアカウントには次のような用途が考えられます。

 * 共有資産を保有するアカウントからのモザイク送信の承認・否認を制御
 * アカウントの譲渡

紐付いた複数のアカウントがトランザクションの発信内容に同意しなければ資産を移動できない構成にできます。
また、アカウントの譲渡とは連署者の付け替えによるアカウント所有権を譲渡するテクニックです。


=== マルチシグアカウントへの変換

@<tt>{multisig/convert_account_into_multisig.js}を実行します。
このスクリプトはアカウントを3つ生成し、そのうち最初の1つをマルチシグアカウントに、
残りの2つと環境変数に設定している秘密鍵のアカウント（@<tt>{alice}）の3つのアカウントを連署者として設定します。

ここで設定されたマルチシグアカウントは後で利用するので、
ターミナルの出力を保存したり、@<tt>{tee}コマンドなどを利用して生成されたアカウントをメモしておいてください。

マルチシグアカウントの連署者に指定されたアカウントはその要求に署名する必要があります。
このスクリプトでは便宜上アカウントを生成していて秘密鍵がわかっているため、アグリゲートコンプリートで処理します。

//cmd{
$ node multisig/convert_account_into_multisig.js | tee multisig.txt
Initiator: SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
Endpoint:  http://localhost:3000/account/SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ

Multisig Account
Private:  E8871BCF83C618521E2868C2C161B230DFA25482001FF96C80D168C3E83AE6D4
Public:   D43CE70D322E860089A1DE9B6F1BF8BEC8ECC82F450DD53D70F9B4D33DB7359F
Address:  SBE2NZ-DSUFEV-QKGW5M-NKJBXG-PAMVYU-WAH6NX-CVE5
Endpoint: http://localhost:3000/account/SBE2NZDSUFEVQKGW5MNKJBXGPAMVYUWAH6NXCVE5
Endpoint: http://localhost:3000/account/SBE2NZDSUFEVQKGW5MNKJBXGPAMVYUWAH6NXCVE5/multisig

Cosigner Account1:
Private:  4F622BB35DAE81B513522C802D228FE96C8787E94B4C36DA8E30057E603CAF76
Public:   409CEC2F67299C387CAFB2D79D786C2E857304C9FA4F8D244CBA1676CB5B47F5
Address:  SBDGOS-DEFJ3O-JK5OMG-EXNBCM-4FF3TK-57KIDR-AB2S
Endpoint: http://localhost:3000/account/SBDGOSDEFJ3OJK5OMGEXNBCM4FF3TK57KIDRAB2S
Endpoint: http://localhost:3000/account/SBDGOSDEFJ3OJK5OMGEXNBCM4FF3TK57KIDRAB2S/multisig

Cosigner Account2:
Private:  AA7796512B85DB662D9CE6D854365042D1FAC8AE3F40D9BDAE637D83284D05CE
Public:   B33238FB04C149B097F68DB14D45F0C3147A53F038EDCC65E5C630461B6C550B
Address:  SCM2ZQ-ONRT4Y-5GY7NA-VYRJJS-JGXRNG-BDKJMT-546K
Endpoint: http://localhost:3000/account/SCM2ZQONRT4Y5GY7NAVYRJJSJGXRNGBDKJMT546K
Endpoint: http://localhost:3000/account/SCM2ZQONRT4Y5GY7NAVYRJJSJGXRNGBDKJMT546K/multisig

Cosigner Account3:
Private:  C2337B8926ED13EA2C481AB559FFD716E5C3AD76273759B4F7A0DB9315745972
Public:   B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B
Address:  SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
Endpoint: http://localhost:3000/account/SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ
Endpoint: http://localhost:3000/account/SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ/multisig

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/3E6D499A9E34906A0F7830FD92CC9F7AB46F86F4BF34FAF382932359977375DF
Hash:     3E6D499A9E34906A0F7830FD92CC9F7AB46F86F4BF34FAF382932359977375DF
Signer:   D43CE70D322E860089A1DE9B6F1BF8BEC8ECC82F450DD53D70F9B4D33DB7359F
(省略)
//}

トランザクションが承認されたら@<tt>{Multisig Account}の@<tt>{/multisig}リソースにアクセスします。

//noindent
@<href>{http://localhost:3000/account/SBE2NZDSUFEVQKGW5MNKJBXGPAMVYUWAH6NXCVE5/multisig}

//cmd{
{ multisig: {
  account: "D43CE70D322E860089A1DE9B6F1BF8BEC8ECC82F450DD53D70F9B4D33DB7359F",
  accountAddress: "9049A6E472A1495828D6EB1AA486E678195C52C03F9B71549D",
  minApproval: 2,
  minRemoval: 2,
  cosignatories: [
    "409CEC2F67299C387CAFB2D79D786C2E857304C9FA4F8D244CBA1676CB5B47F5",
    "B33238FB04C149B097F68DB14D45F0C3147A53F038EDCC65E5C630461B6C550B",
    "B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B"
  ],
  multisigAccounts: []
} }
//}

@<tt>{cosignatories}の配列に連署者の公開鍵が羅列されているのが確認できます。
３つ目の@<tt>{"B775E5DC...EA90B20B"}が@<tt>{alice}のものであることも確認できます。

続いて、マルチシグとなったアカウントの秘密鍵を使ってトランザクションを送信します。

//source[transfer/raw_private_key_transaction.js]{
$ node transfer/raw_private_key_transaction.js E8871BCF83C618521E2868C2C161B230DFA25482001FF96C80D168C3E83AE6D4
Initiator: SBE2NZ-DSUFEV-QKGW5M-NKJBXG-PAMVYU-WAH6NX-CVE5
Endpoint:  http://localhost:3000/account/SBE2NZDSUFEVQKGW5MNKJBXGPAMVYUWAH6NXCVE5
Recipient: SBE2NZ-DSUFEV-QKGW5M-NKJBXG-PAMVYU-WAH6NX-CVE5
Endpoint:  http://localhost:3000/account/SBE2NZDSUFEVQKGW5MNKJBXGPAMVYUWAH6NXCVE5

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/1B435C492B85CD6F6641F9DFB12983CAF2AD013E78BC831A37D29C0B22FD2D37
Hash:     1B435C492B85CD6F6641F9DFB12983CAF2AD013E78BC831A37D29C0B22FD2D37
Signer:   D43CE70D322E860089A1DE9B6F1BF8BEC8ECC82F450DD53D70F9B4D33DB7359F
(省略)
//}

このコードは引数に渡した秘密鍵を使って自分宛てにトランザクションを発信します。
発信すると、@<tt>{Failure_Multisig_Operation_Not_Permitted_By_Account}「このアカウントによるマルチシグ操作は許可されていません。」というエラーがでます。

もはやこの秘密鍵ではアカウントの操作はできず、実質的に無効となります。
これでマルチシグ化とマルチシグアカウントの秘密鍵では直接トランザクションを発信できないことを確認しました。


===={code-multisig/convert_account_into_multisig} コード解説

複数のアカウントを@<tt>{nem2-cli}で準備するのは時間がかかるので、便宜上コード中でアカウントを生成しています。
アカウントを3つ作って、1つ目をマルチシグアカウントへ、後の2つと@<tt>{alice}を連署者として設定します。

生成したアカウントの秘密鍵はコンソールに表示しているだけなので、適宜リダイレクトや@<tt>{tee}コマンドでテキストに保存します。

なお、現実のコードにおいては、連署者として追加するための公開鍵が必要です。
加えて、アグリゲートボンデッドトランザクションによって連署者となるための署名が必要になります。

//cmd{
// 連署者とするアカウントの公開アカウントの集合を作る
const cosignerPublicAccounts = cosigners.map((account, idx) => {
  showAccountInfo(account, `Cosigner Account${idx+1}:`)
  return account.publicAccount
})

// 連署者の追加定義集合を作る
const cosignatoryModifications = cosignerPublicAccounts.map(publicAccount => {
  return new MultisigCosignatoryModification(
    MultisigCosignatoryModificationType.Add,
    publicAccount
  );
});

const convertIntoMultisigTx = ModifyMultisigAccountTransaction.create(
  Deadline.create(),
  minApprovalDelta,
  minRemovalDelta,
  cosignatoryModifications,
  NetworkType.MIJIN_TEST
);

// 実際はAggregateTransaction.createBondedメソッドを使い連署アカウントに署名を求める。
// 今回は連署アカウントの秘密鍵がわかっているのでそれらを利用して署名してしまう。
const aggregateTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [ convertIntoMultisigTx.toAggregate(toBeMultisig.publicAccount) ],
  NetworkType.MIJIN_TEST
);

util.listener(url, toBeMultisig.address, {
  onOpen: () => {
    // signTransactionWithCosignatoriesを使う
    const signedTx = toBeMultisig.signTransactionWithCosignatories(
      aggregateTx,
      cosigners,
      process.env.GENERATION_HASH
    );
    util.announce(url, signedTx);
  },
  onConfirmed: (_, listener) => listener.close()
});
//}

各公開鍵とその追加・削除を表す値（今回は追加）で@<tt>{MultisigCosignatoryModification}オブジェクトを作成します。
この集合を使って@<tt>{ModifyMultisigAccountTransaction}オブジェクトを作成し、署名して発信します。

 * @<tt>{minApprovalDelta}はトランザクションを承認するために必要な最小承認数です。
 * @<tt>{minRemovalDelta}は連署者を削除するために必要な最小承認数です。

それぞれ増加・減少数を指定します。今回は初回の設定なので、設定したい数を渡します。

署名済みトランザクションをマルチシグアカウントに変換したいアカウントの秘密鍵で作ります。
次に、このトランザクションをアグリゲートトランザクションでラップします。

このコードは引数にマルチシグアカウントに変換するアカウントの秘密鍵を渡します。
アカウントがアグリゲートボンデッドトランザクションを発信する必要があるため、@<tt>{10 cat.currency}以上を保有させておく必要があります。

@<tt>{node multisig/convert_account_into_multisig.bonded.js __TO_BE_MULTISIG_PRIVATE_KEY__}として実行してください。

こちらのコードも便宜上同じコードの中で各連署アカウントが署名をしていますが、実際にはそれぞれのアカウントが署名をするはずなので、処理の流れの参考にしてください。

現実には連署者の秘密鍵が分かることはないので、通常は@<tt>{AggregateTransaction.createBonded}で連署者に署名を求める必要があります。
@<tt>{createdBonded}を用いたサンプルは@<tt>{convert_account_into_multisig.bonded.js}として用意してあるので、コードの違いを確認してください。


=== マルチシグアカウントからの送信

マルチシグアカウントはそれ自身の秘密鍵でトランザクションを発信できなくなります。
マルチシグアカウントからのトランザクションは連署者のアカウントの秘密鍵による署名が必要です。

@<tt>{multisig/initiate_from_cosigner.js}を実行します。
このスクリプトは第一引数に連署者の秘密鍵、第二引数マルチシグアカウントの公開鍵、第三引数に受信者アドレスを渡します。

ここでは、前の節で作った連署者@<tt>{Cosigner Account1}の秘密鍵、マルチシグアカウントの公開鍵、受信者には@<tt>{bob}のアドレスを指定します。
なお、トランザクションの開始は@<tt>{alice}が行います。

//cmd{
$ node multisig/initiate_from_cosigner.js 4F622BB35DAE81B513522C802D228FE96C8787E94B4C36DA8E30057E603CAF76 D43CE70D322E860089A1DE9B6F1BF8BEC8ECC82F450DD53D70F9B4D33DB7359F SDJ2MDGUVL7LST7LD4SVXHA76JTTH5HOAJEWCMIB
Initiator:  SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
Endpoint:   http://localhost:3000/account/SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ
Cosignator: SBDGOS-DEFJ3O-JK5OMG-EXNBCM-4FF3TK-57KIDR-AB2S
Endpoint:   http://localhost:3000/account/SBDGOSDEFJ3OJK5OMGEXNBCM4FF3TK57KIDRAB2S
Multisig:   SBE2NZ-DSUFEV-QKGW5M-NKJBXG-PAMVYU-WAH6NX-CVE5
Endpoint:   http://localhost:3000/account/SBE2NZDSUFEVQKGW5MNKJBXGPAMVYUWAH6NXCVE5
Amount:     0
Recipient:  SDJ2MD-GUVL7L-ST7LD4-SVXHA7-6JTTH5-HOAJEW-CMIB
Endpoint:   http://localhost:3000/account/SDJ2MDGUVL7LST7LD4SVXHA76JTTH5HOAJEWCMIB

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/3B91A3A2CACBB62FDBF2C6AF4FCF99D50B52ACDCA2E5CC9336D79488514D2EB5
Hash:     3B91A3A2CACBB62FDBF2C6AF4FCF99D50B52ACDCA2E5CC9336D79488514D2EB5
Signer:   B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B
(省略)
//}

受信者アドレスへの転送トランザクションを作り、アグリゲートトランザクションの公開アカウントとしてマルチシグアカウントを渡します。
アグリゲートボンデッドトランザクションなので@<tt>{LockFunds}トランザクションを発信します。
@<tt>{LockFunds}が承認されたらアグリゲートボンデッドトランザクションを発信します。

アグリゲートボンデッドトランザクションが承認されたら、別の連署者がそれに署名をすることで2名の署名が揃い、転送トランザクションが承認されます。
最初にトランザクションへ署名したのは@<tt>{alice}なので、引数として渡した連署者の秘密鍵による署名が行われると2つの署名が揃います。


===={code-multisig/initiate_from_cosigner} コード解説

//source[multisig/initiate_from_cosigner.js]{
// マルチシグトランザクションはアグリゲートボンデッドトランザクションとして行う
const multisigTx = AggregateTransaction.createBonded(
  Deadline.create(),
  [ transferTx.toAggregate(multisig) ],
  NetworkType.MIJIN_TEST
);
const signedMultisigTx = initiater.sign(multisigTx, process.env.GENERATION_HASH);
//}

マルチシグトランザクションを発信するにはアグリゲートボンデッドトランザクションを使います。

//source[multisig/initiate_from_cosigner.js]{
util.listener(url, initiater.address, {
  onOpen: () => {
    const lockFundsTx = LockFundsTransaction.create(
      Deadline.create(),
      NetworkCurrencyMosaic.createRelative(10),
      UInt64.fromUint(480),
      signedMultisigTx,
      NetworkType.MIJIN_TEST
    );
    const signedLockFundsTx = initiater.sign(lockFundsTx, process.env.GENERATION_HASH);
    util.announce(url, signedLockFundsTx)
  },
  onConfirmed: () => {
    // LockFundが承認されたらアグリゲートトランザクションを発信
    util.announceAggregateBonded(url, signedMultisigTx);
  },
  onAggregateBondedAdded: (aggregateTx) => {
    // 連署者が署名することでマルチシグアカウントからのモザイク送信を承認する
    const cosignatureTx = CosignatureTransaction.create(aggregateTx)
    const signedCosignatureTx = cosignator.signCosignatureTransaction(cosignatureTx)
    util.announceAggregateBondedCosignature(url, signedCosignatureTx)
  }
});
//}

現実には、連署者は自分に届いた署名待ちのトランザクション一覧を取得し署名をします。
ここでは便宜上、アグリゲートトランザクションが承認されたタイミングで連署者に署名をさせています。

以降はアグリゲートボンデッドトランザクションのためのLockFundsトランザクションの処理を行っています。


==== 最小承認数が1の構成の場合

最小承認数が1（@<tt>{1-of-m}構成）である場合、トランザクションを送ろうとする連署者の署名だけで十分なので、
アグリゲートコンプリートトランザクションとして発信できます。

@<tt>{multisig/convert_account_into_multisig_shared.js}は@<tt>{1-of-2}のマルチシグアカウントを構築します。
@<tt>{multisig/convert_account_into_multisig.js}との違いは、最小承認数が1を設定する以外は同じです。

//cmd{
$ node multisig/convert_account_into_multisig_shared.js
(省略)
//}

構築したマルチシグアドレスからトランザクションを発信します。
@<tt>{multisig/initiate_from_cosigner_without_cosigner.js}はアグリゲートコンプリートで転送するスクリプトです。

今回構築されたアカウントから@<tt>{bob}へメッセージを送るトランザクションを発信します。

//cmd{
$ node multisig/initiate_from_cosigner_without_cosigner.js 2C1D11FEB87049D4EA8A8C0AE2D402C0E87D94AF6A5F3FC471B6BD80EF858E5A SDJ2MDGUVL7LST7LD4SVXHA76JTTH5HOAJEWCMIB
Initiator:  SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
Endpoint:   http://localhost:3000/account/SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ
Multisig:   SDDRDU-27W6WA-57SZHN-NH62ZB-OWYC3E-MFIEK6-VI4N
Endpoint:   http://localhost:3000/account/SDDRDU27W6WA57SZHNNH62ZBOWYC3EMFIEK6VI4N
Amount:     0
Recipient:  SDJ2MD-GUVL7L-ST7LD4-SVXHA7-6JTTH5-HOAJEW-CMIB
Endpoint:   http://localhost:3000/account/SDJ2MDGUVL7LST7LD4SVXHA76JTTH5HOAJEWCMIB

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/71522649941BEF9E5E0B1554A4F3CA965824DE8A71055964B10218ADBB2A7CAF
Hash:     71522649941BEF9E5E0B1554A4F3CA965824DE8A71055964B10218ADBB2A7CAF
Signer:   B775E5DCDF76959B9F5769DD2E9F873A0C7E5F9C9073837AF7850057EA90B20B
(省略)
//}

結果だけ見ると違いがわかりにくいので、このパターンの要点は次のコード解説で説明します。


===={code-multisig/initiate_from_cosigner_without_cosigner} コード解説

このマルチシグアカウントは署名が必要な数を@<tt>{1}に設定したので、連署者のうちひとつのアカウントの署名があればトランザクションを送信できます。

//source[multisig/initiate_from_cosigner_without_cosigner]{
// 1-of-m のマルチシグなら他に署名者が不要なのでコンプリートで送信できる
const multisigTx = AggregateTransaction.createComplete(
  Deadline.create(),
  [transferTx.toAggregate(multisig)],
  NetworkType.MIJIN_TEST
);

util.listener(url, initiator.address, {
  onOpen: () => {
    const signedTx = initiator.sign(multisigTx, process.env.GENERATION_HASH);
    util.announce(url, signedTx);
  }
});
//}

他の連署者に署名を要求する必要がないため、@<tt>{AggregateTransaction.createComplete}を使用することができます。


=== マルチレベルマルチシグ（MLMS）

@<tt>{Catapult}ではマルチシグアカウントを別のマルチシグアカウントの連署者として追加できるようになりました。
これによりマルチシグ承認を階層化できるようになりました。

@<tt>{MLMS}の構築は、単にマルチシグアカウントをマルチシグ連署者として指定するだけです。


==== MLMSの構築

@<tt>{multisig/setup_mlms.js}を実行します。
このスクリプトはアカウントを7つ生成し、そのうち1つをトップのマルチシグアカウントに、
2つを2階層目のアカウントに、最後に2階層目のアカウントに2つずつの連署アカウントを設定したマルチレベルマルチシグを構築します。

//emlist[マルチレベルマルチシグ構成例]{
- Root
  |- Lv2-A
    |- Lv3-a
    `- Lv3-b
  |- Lv2-B
    |- Lv3-c
    `- Lv3-d
//}

図にするとこのような状態になります。

//cmd{
$ node multisig/setup_mlms.js
Initiator: SDUCBS-RYQTSW-EGAOZW-YO6AAK-BSM6LV-ON7E5W-BHVQ
Endpoint:  http://localhost:3000/account/SDUCBSRYQTSWEGAOZWYO6AAKBSM6LVON7E5WBHVQ

Root Multisig Account
Private:  F7301071B3BAD827A921FB373344D63D1A8A5D3254A263FF240A11CBACA8322C
Public:   D5F1B589C81EFA65AC648D71CC4703755DA86B5110D5F5E77C351E881A8D6034
Address:  SAOLR7-QJR2EY-Y3ABYV-7IMQOX-D3EA6E-GYENFY-O7PK
Endpoint: http://localhost:3000/account/SAOLR7QJR2EYY3ABYV7IMQOXD3EA6EGYENFYO7PK
Endpoint: http://localhost:3000/account/SAOLR7QJR2EYY3ABYV7IMQOXD3EA6EGYENFYO7PK/multisig
Endpoint: http://localhost:3000/account/SAOLR7QJR2EYY3ABYV7IMQOXD3EA6EGYENFYO7PK/multisig/graph

Left Multisig Account
Private:  97BEF199A9181D155C023D8876D25D8B5847B700B962179B6FCAF7C690505BC2
Public:   C39D52166D690782BE0DE7C7FBFAE33AFC0B40E0ED24DC5789AF55576E9C34AA
Address:  SAVSVZ-L73N6D-FKEXJU-B2UZAM-CBWNMO-FWDXHN-7YNW
Endpoint: http://localhost:3000/account/SAVSVZL73N6DFKEXJUB2UZAMCBWNMOFWDXHN7YNW
Endpoint: http://localhost:3000/account/SAVSVZL73N6DFKEXJUB2UZAMCBWNMOFWDXHN7YNW/multisig
Endpoint: http://localhost:3000/account/SAVSVZL73N6DFKEXJUB2UZAMCBWNMOFWDXHN7YNW/multisig/graph

Right Multisig Account
Private:  95B82E878953C491DFF3146F113B60027E574C69DD5A4BEEB69F5F864CA1BCFD
Public:   59FAA93D1465A32AA7B7065B7BCA285328C41E044572244B42831F3CA30EBA3C
Address:  SA26MJ-TMXD74-H7H4ZJ-KIGTN7-IDU356-SZ3RID-BH3L
Endpoint: http://localhost:3000/account/SA26MJTMXD74H7H4ZJKIGTN7IDU356SZ3RIDBH3L
Endpoint: http://localhost:3000/account/SA26MJTMXD74H7H4ZJKIGTN7IDU356SZ3RIDBH3L/multisig
Endpoint: http://localhost:3000/account/SA26MJTMXD74H7H4ZJKIGTN7IDU356SZ3RIDBH3L/multisig/graph

Left Cosigner Account1:
Private:  5420FC6364F299E3188205C77CFD8210AF9D117FC4532ACDDA3341E68F88CEC2
Public:   5D704715AFF96FBCCCCFFDB4C528405A924CC5CC27BB64CF6C54E54AA5DCEEFE
Address:  SCBKFE-NBXDYJ-K3Z3OG-2PAB4P-JNX7BY-NZBWW5-RUOM
Endpoint: http://localhost:3000/account/SCBKFENBXDYJK3Z3OG2PAB4PJNX7BYNZBWW5RUOM
Endpoint: http://localhost:3000/account/SCBKFENBXDYJK3Z3OG2PAB4PJNX7BYNZBWW5RUOM/multisig
Endpoint: http://localhost:3000/account/SCBKFENBXDYJK3Z3OG2PAB4PJNX7BYNZBWW5RUOM/multisig/graph

Left Cosigner Account2:
Private:  0318DE0CC84D02072B74070A1203992CE900ED51B29A1422304CC9B0B7C7BAAF
Public:   43DD4A240EDD684CF4F01E43BC9CBCFF90CBB0938FFFA9B76593AF15E09A03EC
Address:  SDPRZG-JMUMYC-PT2QS4-WW33FU-7BDLVK-YEQV3P-D347
Endpoint: http://localhost:3000/account/SDPRZGJMUMYCPT2QS4WW33FU7BDLVKYEQV3PD347
Endpoint: http://localhost:3000/account/SDPRZGJMUMYCPT2QS4WW33FU7BDLVKYEQV3PD347/multisig
Endpoint: http://localhost:3000/account/SDPRZGJMUMYCPT2QS4WW33FU7BDLVKYEQV3PD347/multisig/graph

Right Cosigner Account1:
Private:  B2FC304D0809DB9BA94E239FDA8F8309296B15BF13389BFA9263661C62F3D197
Public:   8A1E2127FB5FCE7DA7F4D8CBCF75EC3230D5644A534C5E506A84F527644B46F6
Address:  SAYTVH-WOJYGD-5NXM7C-FGYS5J-JU3O4B-BXDBFD-LTZ2
Endpoint: http://localhost:3000/account/SAYTVHWOJYGD5NXM7CFGYS5JJU3O4BBXDBFDLTZ2
Endpoint: http://localhost:3000/account/SAYTVHWOJYGD5NXM7CFGYS5JJU3O4BBXDBFDLTZ2/multisig
Endpoint: http://localhost:3000/account/SAYTVHWOJYGD5NXM7CFGYS5JJU3O4BBXDBFDLTZ2/multisig/graph

Right Cosigner Account2:
Private:  2A036AE7C9E6FD4DFBB12D9D51583E4112A9DAD38E71480D42E3E3541760A6BC
Public:   1862C1CF851E93C9254F7F3919ECDEBD56BB194AF2E3D1360A963886927EC867
Address:  SB5SLC-C3RVLM-VOB6P5-XCTROF-EDDMHN-VPXDWA-UGTZ
Endpoint: http://localhost:3000/account/SB5SLCC3RVLMVOB6P5XCTROFEDDMHNVPXDWAUGTZ
Endpoint: http://localhost:3000/account/SB5SLCC3RVLMVOB6P5XCTROFEDDMHNVPXDWAUGTZ/multisig
Endpoint: http://localhost:3000/account/SB5SLCC3RVLMVOB6P5XCTROFEDDMHNVPXDWAUGTZ/multisig/graph

connection open
[Transaction announced]
Endpoint: http://localhost:3000/transaction/6B35384425E877A189AC84783F9C2725ED22F65C7EABC0599D74DDFA9A1D2140
Hash:     6B35384425E877A189AC84783F9C2725ED22F65C7EABC0599D74DDFA9A1D2140
Signer:   D5F1B589C81EFA65AC648D71CC4703755DA86B5110D5F5E77C351E881A8D6034
(省略)
//}

トランザクションが承認されたらリソースURLにアクセスして構築されたことを確認します。
マルチレベルマルチシグの階層構造は@<tt>{/account/__ADDRESS__/multisig/graph}のAPIゲートウェイにアクセスすることで取得できます。

//noindent
@<href>{http://localhost:3000/account/SAOLR7QJR2EYY3ABYV7IMQOXD3EA6EGYENFYO7PK/multisig/graph}

//emlist[マルチシグ構成レスポンス例]{
[ { "level": 0,
    "multisigEntries": [
      { "multisig": {
        "account": "D5F1B589C81EFA65AC648D71CC4703755DA86B5110D5F5E77C351E881A8D6034",
        "accountAddress": "901CB8FE098E898C6C01C57E8641D71EC80F10D8234B877DEA",
        "minApproval": 2,
        "minRemoval": 2,
        "cosignatories": [
          "59FAA93D1465A32AA7B7065B7BCA285328C41E044572244B42831F3CA30EBA3C",
          "C39D52166D690782BE0DE7C7FBFAE33AFC0B40E0ED24DC5789AF55576E9C34AA"
        ],
        "multisigAccounts": []
      } }
    ]
  },
  { "level": 1,
    "multisigEntries": [
      { "multisig": {
        "account": "59FAA93D1465A32AA7B7065B7BCA285328C41E044572244B42831F3CA30EBA3C",
        "accountAddress": "9035E6266CB8FFC3FCFCCA54834DBF40E9BEFA59DC50309F6B",
        "minApproval": 2,
        "minRemoval": 2,
        "cosignatories": [
          "1862C1CF851E93C9254F7F3919ECDEBD56BB194AF2E3D1360A963886927EC867",
          "8A1E2127FB5FCE7DA7F4D8CBCF75EC3230D5644A534C5E506A84F527644B46F6"
        ],
        "multisigAccounts": [ "D5F1B589C81EFA65AC648D71CC4703755DA86B5110D5F5E77C351E881A8D6034" ]
      } },
      { "multisig": {
        "account": "C39D52166D690782BE0DE7C7FBFAE33AFC0B40E0ED24DC5789AF55576E9C34AA",
        "accountAddress": "902B2AE57FDB7C32A8974D03AA640C106CD638B61DCEDFE1B6",
        "minApproval": 1,
        "minRemoval": 2,
        "cosignatories": [
          "43DD4A240EDD684CF4F01E43BC9CBCFF90CBB0938FFFA9B76593AF15E09A03EC",
          "5D704715AFF96FBCCCCFFDB4C528405A924CC5CC27BB64CF6C54E54AA5DCEEFE"
        ],
        "multisigAccounts": [ "D5F1B589C81EFA65AC648D71CC4703755DA86B5110D5F5E77C351E881A8D6034" ]
      } }
    ]
  },
  { "level": 2,
    "multisigEntries": [
      { "multisig": {
        "account": "1862C1CF851E93C9254F7F3919ECDEBD56BB194AF2E3D1360A963886927EC867",
        "accountAddress": "907B25885B8D56CAB83E7F6E29C5C520C6C3B6AFB8EC0A1A79",
        "minApproval": 0,
        "minRemoval": 0,
        "cosignatories": [],
        "multisigAccounts": [ "59FAA93D1465A32AA7B7065B7BCA285328C41E044572244B42831F3CA30EBA3C" ]
      } },
      { "multisig": {
        "account": "43DD4A240EDD684CF4F01E43BC9CBCFF90CBB0938FFFA9B76593AF15E09A03EC",
        "accountAddress": "90DF1C992CA33027CF50972D6DECB4F846BAAB048576F1EF9F",
        "minApproval": 0,
        "minRemoval": 0,
        "cosignatories": [],
        "multisigAccounts": [ "C39D52166D690782BE0DE7C7FBFAE33AFC0B40E0ED24DC5789AF55576E9C34AA" ]
      } },
      { "multisig": {
        "account": "5D704715AFF96FBCCCCFFDB4C528405A924CC5CC27BB64CF6C54E54AA5DCEEFE",
        "accountAddress": "9082A291A1B8F0956F3B71B4F0078F4B6FF0E1B90DADD8D1CC",
        "minApproval": 0,
        "minRemoval": 0,
        "cosignatories": [],
        "multisigAccounts": [ "C39D52166D690782BE0DE7C7FBFAE33AFC0B40E0ED24DC5789AF55576E9C34AA" ]
      } },
      { "multisig": {
        "account": "8A1E2127FB5FCE7DA7F4D8CBCF75EC3230D5644A534C5E506A84F527644B46F6",
        "accountAddress": "90313A9ECE4E0C3EB6ECF88A6C4BA94D36EE0437184A35CF3A",
        "minApproval": 0,
        "minRemoval": 0,
        "cosignatories": [],
        "multisigAccounts": [ "59FAA93D1465A32AA7B7065B7BCA285328C41E044572244B42831F3CA30EBA3C" ]
      } }
    ]
  } ]
//}

各レベルの構造でマルチシグの情報が表示されます。


===={code-multisig/setup_mlms} コード解説

マルチシグアカウントに別のマルチシグアカウントを連署者として追加して構築することができます。
このコードでも、便宜上コード内でアカウントを生成して署名も済ませてしまっていますが、
現実には@<tt>{AggregateTransaction.createBonded}を用いて、署名要求を送る方法を使います。


== その他の機能

紙面の都合ですべての機能を紹介できませんが、概要を簡単に紹介します。
詳細な機能説明は公式リファレンスのBuilt-in Featuresの項にて確認できますのでこちらも参照してみてください。

//noindent
@<href>{https://nemtech.github.io/ja/concepts/account.html}


=== アカウント制限

//indepimage[figure-8][][scale=0.7]{
//}

アドレスへの送受信トランザクションやトランザクションの種類に、
アドレスが受信するモザイクのホワイト/ブラックリストをブロックチェーンレベルで設定します。
拒否されたトランザクションはチェーンに記録されないので、スパム等の送りつけに有効な対策となります。

//noindent
@<href>{https://nemtech.github.io/ja/concepts/account-restriction.html}


=== シークレットロック・スワップ

//indepimage[figure-9][][scale=0.7]{
//}

@<tt>{Hashed TimeLock Contract（HTLC）}を用いて、異なるブロックチェーン間でアトミックにモザイクを交換する仕組みです。
パブリックとプライベートチェーン、またはプライベートチェーン同士間でのモザイク交換を、
中間者の存在無くブロックチェーン上でエスクローを実現できます。

//noindent
@<href>{https://nemtech.github.io/ja/concepts/cross-chain-swaps.html}


== catapult-service-bootstrapのトラブルシュート

Dockerのノード群が正しく起動しない場合の問題解決へのヒントをまとめました。


=== Dockerのノード群のログを確認する

@<tt>{./cmds/start-all}で開始したのノード群のログを確認すると、問題の原因解明に役立ちます。
また、質問やバグレポートをする場合にもログがあると回答する人の助けになります。

//cmd{
$ cd cmds/docker/ && docker-compose logs -f
//}


=== ブロックチェーンを初期化する

何か問題が発生し、ブロック生成が進まなくなってしまったり、チェーンを初期化したい場合のスクリプトが用意されています。

//cmd{
$ ./cmds/stop-all # 稼働させている場合は一度停止する
$ ./cmds/clean-data
//}

初期化後に@<tt>{./cmds/start-all}を実行して立ち上げ直します。
@<tt>{./cmds/clean-data}を実行しても問題がある場合は、すべてを初期化する@<tt>{./cmds/clean-all}を実行してください。

//cmd{
$ ./cmds/stop-all
$ ./cmds/clean-all
//}

@<tt>{./cmds/clean-all}は生成された設定も削除するため、初期配布アカウントが再作成されることを念頭においてください。


=== ノード群を停止後、動かそうとすると動かない

正しくコンテナが終了しなかった場合、ロックファイルが残る場合があります。
@<tt>{./data/__NODE_NAME__/server.lock}を削除してから立ち上げてください。


=== cleanしても動作しない

@<tt>{cow}や@<tt>{dragon}などの過去バージョンを動作させたため、Dockerイメージの組み合わせに齟齬が起きている場合があります。
一度イメージとコンテナもすべて削除して、やり直します。
なお、次の例は@<tt>{docker}で始まるイメージとコンテナ名を削除します。
実行前にはご自身の環境を確認ください。

//cmd{
$ docker rmi -f `docker images -f 'reference=docker*' --format '{{.Repository}}:{{.Tag}}'`
$ docker rm -f `docker ps -a -f 'name=docker' --format '{{.ID}}'`
//}


== おわりに

NEMにはBitcoinやEthereumのようにオンチェーンで動作する制御プログラムを実装できる機能はありません。
しかし、ブロックチェーンを使う要求のほとんどは基本・応用機能で紹介した機能で十分満たすのではないかと考えています。

Ethereumの@<fn>{erc}ERCトークンのように規格を守った仕様のトークンを実装し、更新が難しいコントラクトをデプロイしなければならないのであれば、
はじめからビルトインされているほうが、システム全体の責務が少なく、安心して使用できると思います。
//footnote[erc][Ethereum Request for Comments]
その意味でNEMはユーザーフレンドリーではないでしょうか。

引き続き目が離せない@<tt>{Catapult}の動向を共に楽しみ、あなたの構想やビジネスの発展に貢献できれば幸いです。
