# Tips

細かなテクニックやスニペットなどを紹介します。

※ なおこの内容が実際に機能するかは、今後変更される可能性があるため実行前や後はよく確認してください。

## UInt64の変換

```shell
$ node -e "let uint64 = require('nem2-sdk').UInt64; console.log(new uint64(process.argv[1].split(',').map(s => parseInt(s))).compact())" 3863990592,95248
409090909000000
```


## ブロックファイルからGenerationHashを取り出す

```shell
xxd -p -c 32 -s 4918 -l 32 data/peer-node-0/00000/00001.dat | tr "[:lower:]" "[:upper:]"
53F73344A12341618CEE455AC412A0B57D41CEC058965511C0BA016156F4BF47
```

開始位置(`-s`オプションの引数)は今後のアップデートによって変化する可能性があります。
