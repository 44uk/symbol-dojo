import { map, mergeMap } from "rxjs/operators"
import { Account, AggregateTransaction, CosignatureTransaction, TransactionGroup, TransactionType } from "symbol-sdk"
import { createAnnounceUtil, INetworkStaticProps } from "."

export function splitNamespaceName(value: string) {
  const [parent, child] = value.split(/\.(?=[^\.]+$)/)
  // const [root, sub] = namespace.split(/(?<=^[^.]+)\./)
}

/**
 * @param props ネットワークプロパティ
 * @param cosigner 連署名するアカウント
 */
export function cosignBondedWithAccount(props: INetworkStaticProps, cosigner: Account) {
  const announceUtil = createAnnounceUtil(props.factory)
  return props.factory.createTransactionRepository().search({
    type: [ TransactionType.AGGREGATE_BONDED ],
    group: TransactionGroup.Partial,
    address: cosigner.address,
  })
    .pipe(
      mergeMap(results => results.data),
      map(tx => CosignatureTransaction.create(tx as AggregateTransaction)),
      map(cosignTx => cosigner.signCosignatureTransaction(cosignTx)),
      mergeMap(signedCoTx => announceUtil.cosign(signedCoTx)),
    )
}

