/**
 * $ ts-node transfer/create_mosaic_transfer.ts RECIPIENT_ADDRESS 1
 */
import consola from "consola"
import {
  Account,
  EmptyMessage,
  Transaction,
  AccountAddressRestrictionTransaction,
  AccountKeyLinkTransaction,
  AccountMetadataTransaction,
  AccountMosaicRestrictionTransaction,
  AccountOperationRestrictionTransaction,
  AddressAliasTransaction,
  AggregateTransaction,
  HashLockTransaction,
  MosaicAddressRestrictionTransaction,
  MosaicAliasTransaction,
  MosaicDefinitionTransaction,
  MosaicGlobalRestrictionTransaction,
  MosaicMetadataTransaction,
  MosaicSupplyChangeTransaction,
  MultisigAccountModificationTransaction,
  NamespaceMetadataTransaction,
  NamespaceRegistrationTransaction,
  NodeKeyLinkTransaction,
  SecretLockTransaction,
  SecretProofTransaction,
  TransferTransaction,
  VotingKeyLinkTransaction,
  VrfKeyLinkTransaction,
  AddressRestrictionFlag,
  LinkAction,
  Address,
  UInt64,
  MosaicNonce,
  MosaicId,
  MosaicFlags,
  MosaicSupplyChangeAction,
} from "symbol-sdk"

import { env } from '../util/env'
import { createAnnounceUtil, networkStaticPropsUtil, INetworkStaticProps } from '../util/announce'
import { createDeadline, prettyPrint, txPrinter } from '../util'
import { EmptyError } from "rxjs"

async function main(props: INetworkStaticProps) {
  const txPrint = txPrinter(props.url)
  const deadline = createDeadline(props.epochAdjustment)

  const initiatorAccount = Account.createFromPrivateKey(env.INITIATOR_KEY, props.networkType)

  const aliceAccount = Account.createFromPrivateKey(env.ALICE_KEY, props.networkType)

  const txes: Transaction[] = []


  AccountAddressRestrictionTransaction.create(
    deadline(),
    AddressRestrictionFlag.BlockIncomingAddress,
    [],
    [],
    props.networkType
  )
  AccountKeyLinkTransaction.create(
    deadline(),
    '',
    LinkAction.Link,
    props.networkType
  )
  AccountMetadataTransaction.create(
    deadline(),
    Address.createFromRawAddress(''),
    UInt64.fromUint(0),
    0,
    '0',
    props.networkType
  )
  AccountMosaicRestrictionTransaction.create(
    deadline(),
    props.networkType
  )
  AccountOperationRestrictionTransaction.create(
    deadline(),

    props.networkType
  )
  AddressAliasTransaction.create(
    deadline(),

    props.networkType
  )
  HashLockTransaction.create(
    deadline(),

    props.networkType
  )
  MosaicAddressRestrictionTransaction.create(
    deadline(),

    props.networkType
  )
  MosaicAliasTransaction.create(
    deadline(),

    props.networkType
  )
  const nonce = MosaicNonce.createRandom()
  MosaicDefinitionTransaction.create(
    deadline(),
    nonce,
    MosaicId.createFromNonce(nonce, initiatorAccount.address),
    MosaicFlags.create(true, true, true),
    0,
    UInt64.fromUint(1000),
    props.networkType
  )
  MosaicGlobalRestrictionTransaction.create(
    deadline(),

    props.networkType
  )
  MosaicMetadataTransaction.create(
    deadline(),

    props.networkType
  )
  MosaicSupplyChangeTransaction.create(
    deadline(),
    new MosaicId(''),
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(10000 * Math.pow(10, 0)),
    props.networkType,
  )
  MultisigAccountModificationTransaction.create(
    deadline(),

    props.networkType
  )
  NamespaceMetadataTransaction.create(
    deadline(),

    props.networkType
  )
  NamespaceRegistrationTransaction.create(
    deadline(),

    props.networkType
  )
  NodeKeyLinkTransaction.create(
    deadline(),

    props.networkType
  )
  SecretLockTransaction.create(
    deadline(),

    props.networkType
  )
  SecretProofTransaction.create(
    deadline(),

    props.networkType
  )
  TransferTransaction.create(
    deadline(),
    aliceAccount.address,
    [],
    EmptyMessage,
    props.networkType
  )
  VotingKeyLinkTransaction.create(
    deadline(),

    props.networkType
  )
  VrfKeyLinkTransaction.create(
    deadline(),

    props.networkType
  )

  //txes.push(
  //))

  // 3つのトランザクションをアグリゲートコンプリートで集約
  // `toAggregate` にはそのトランザクションに署名すべきアカウントの公開アカウントを渡す
  const aggregateTx = AggregateTransaction.createComplete(
    deadline(),
    txes.map(tx => tx.toAggregate(initiatorAccount.publicAccount)),
    props.networkType,
    [],
  ).setMaxFeeForAggregate(props.minFeeMultiplier, 0)

  const signedTx = initiatorAccount.sign(aggregateTx, props.generationHash)

  txPrint.info(signedTx)
  txPrint.status(signedTx)
  const announceUtil = createAnnounceUtil(props.factory)
  announceUtil.announce(signedTx)
    .subscribe(
      resp => {
        txPrint.url(signedTx)
        prettyPrint(resp)
      },
      error => {
        consola.error(error)
      }
    )
}

networkStaticPropsUtil(env.GATEWAY_URL).toPromise()
  .then(props => main(props))
