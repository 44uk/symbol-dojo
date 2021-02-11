const {
  TransactionHttp
} = require('symbol-sdk')
const {
  map
} = require('rxjs/operators')

const txHttp = new TransactionHttp('http://localhost:3000')
const txHash = '8AA81AA15A2E2CAC842004E0BF8B398DC31CB0568A10A9B2AFA2C2B2A164FF35'

txHttp.getTransaction(txHash)
.pipe(
  map(_ => _.innerTransactions)
)
.subscribe(
  _ => console.log(_)
)
