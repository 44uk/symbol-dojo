# Tips

細かなテクニックやスニペットなどを紹介します。

※ なおこの内容が実際に機能するかは、今後変更される可能性があるため実行前や後はよく確認してください。


## UInt64の変換

```shell
$ node -e "let uint64 = require('nem2-sdk').UInt64; console.log(new uint64(process.argv[1].split(',').map(s => parseInt(s))).compact())" 3863990592,95248
409090909000000
```
