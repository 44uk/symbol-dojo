import { RepositoryFactoryHttp } from "symbol-sdk"

const URL = "http://api-01.us-east-1.nemtech.network:3000"

const factory = new RepositoryFactoryHttp(URL, {})
const txRepo = factory.createTransactionRepository()
console.debug(
// @ts-ignore
  txRepo.config().basePath
)

/*
```
TransactionStatus {
  status: 'Success',
  group: 'confirmed',
  hash: '1C2835E11ADA3530B332140AAB75BA512161256FB6D1CD13E9E65F29811B4BF3',
  deadline: Deadline { value: LocalDateTime { _date: [LocalDate], _time: [LocalTime] } },
  height: UInt64 { lower: 87134, higher: 0 }
}
```
*/

/*
```
TransactionStatus {
  status: undefined,
  group: 'failed',
  hash: '8F4654BC708421BFBB3C7C4EDB5BD6AF16E376B0A3E58182E4FF2B6075F2373B',
  deadline: Deadline { value: LocalDateTime { _date: [LocalDate], _time: [LocalTime] } },
  height: undefined
}
```
*/

// http://api-01.us-east-1.nemtech.network:3000/transaction/8F4654BC708421BFBB3C7C4EDB5BD6AF16E376B0A3E58182E4FF2B6075F2373B/status
/*
```json
{
  hash: "8F4654BC708421BFBB3C7C4EDB5BD6AF16E376B0A3E58182E4FF2B6075F2373B",
  code: -2143092733,
  deadline: "116822518510",
  group: "failed"
}
```
*/



// http://api-01.us-east-1.nemtech.network:3000/transaction/1C2835E11ADA3530B332140AAB75BA512161256FB6D1CD13E9E65F29811B4BF3/status
/*
```json
{
  group: "confirmed",
  status: "Success",
  hash: "1C2835E11ADA3530B332140AAB75BA512161256FB6D1CD13E9E65F29811B4BF3",
  deadline: "116822788988",
  height: "87134"
}
```
*/
