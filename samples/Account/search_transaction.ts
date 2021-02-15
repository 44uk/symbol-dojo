/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import consola from "consola"
import {
  Address,
  MosaicId,
  Order,
  TransactionGroup,
  TransactionType,
  UInt64,
} from "symbol-sdk"

import { env } from '../util/env'
import { networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'
import { prettyPrint } from '../util'

async function main(props: INetworkStaticProps) {
  const transactionRepo = props.factory.createTransactionRepository()

  transactionRepo.search({
    group: TransactionGroup.Confirmed,
    // pageSize: 1,
    // address: Address.createFromRawAddress('TAUVQO4KIIYVXJBP6EEHVPDEKPUP6ZF4CILXQ5Y'),
    // embedded: true,
    // fromHeight: UInt64.fromUint(0),
    // fromTransferAmount: UInt64.fromUint(0),
    // height: UInt64.fromUint(0),
    // offset: '',
    // order: Order.Asc,
    // pageNumber: 1,
    // recipientAddress: Address.createFromRawAddress('TAUVQO4KIIYVXJBP6EEHVPDEKPUP6ZF4CILXQ5Y'),
    // signerPublicKey: '',
    // toHeight: UInt64.fromUint(0),
    // toTransferAmount: UInt64.fromUint(0),
    // transferMosaicId: new MosaicId(''),
    // type: [ TransactionType.TRANSFER ]
  })
    .subscribe(
      results => {
        prettyPrint(results)
      }
    )
}

networkStaticPropsUtil(env.GATEWAY_URL).toPromise()
  .then(props => main(props))
