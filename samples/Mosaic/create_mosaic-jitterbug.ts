/**
 * $ ts-node mosaic/create_mosaic.ts BLOCK_COUNT
 */
import { from } from "rxjs"
import { concatMap, mergeMap } from "rxjs/operators"
import {
  Account,
  MosaicNonce,
  MosaicId,
  MosaicFlags,
  MosaicDefinitionTransaction,
  UInt64,
  Deadline, NetworkType
} from "symbol-sdk"
import { env } from "../util/env"
import { repositoryFactory } from "../util/repository"

const url = env.API_URL
const initiator = Account.createFromPrivateKey(
  env.INITIATOR_KEY,
  env.NETWORK_TYPE
)
const repo = repositoryFactory(url)

function* mosaicDefinitionTransactionGenerator(networkType: NetworkType) {
  const nonce = MosaicNonce.createRandom() // ネットワーク上で一意なIDをもたせるためのランダム値
  const id = MosaicId.createFromNonce(nonce, initiator.address)
  const flags = MosaicFlags.create(
    true, // SupplyMutable
    true, // Transferable
    true, // Restrictable
  )
  const divisibility = 0
  const duration = 0

  consola.info("Duration:  %s", duration !== 0 ? duration : "non-expiring")
  consola.info("Nonce:     %s", nonce.nonce)

  consola.info("MosaicHex: %s", id.toHex())
  consola.info("")

  const definitionTx = MosaicDefinitionTransaction.create(
    Deadline.create(),
    nonce,
    id,
    flags,
    divisibility,
    UInt64.fromUint(duration),
    networkType,
  ).setMaxFee(120) as MosaicDefinitionTransaction

  return definitionTx
}

for(const defTx of mosaicDefinitionTransactionGenerator()) {
  consola.info((defTx))
}

process.exit()








const duration = parseInt(process.argv[2]) || 0
const nonce = MosaicNonce.createRandom() // ネットワーク上で一意なIDをもたせるためのランダム値
const id = MosaicId.createFromNonce(nonce, initiator.address)
const flags = MosaicFlags.create(
  true, // SupplyMutable
  true, // Transferable
  true, // Restrictable
)
const divisibility = 0

consola.info("Initiator: %s", initiator.address.pretty())
consola.info("Endpoint:  %s/accounts/%s", url, initiator.address.plain())
consola.info("Nonce:     %s", nonce.nonce)
consola.info("MosaicHex: %s", id.toHex())
consola.info("Duration:  %s", duration !== 0 ? duration : "non-expiring")
consola.info("Endpoint:  %s/mosaics/%s", url, id.toHex())
consola.info("")

const definitionTx = MosaicDefinitionTransaction.create(
  Deadline.create(),
  nonce,
  id,
  flags,
  divisibility,
  UInt64.fromUint(duration),
  env.NETWORK_TYPE,
).setMaxFee(120) as MosaicDefinitionTransaction
const signedTx = initiator.sign(definitionTx, env.GENERATION_HASH)



from(repo.listener.open())
  .pipe(
    mergeMap(() => repo.transaction.announce(signedTx)),
    concatMap(() => repo.listener.confirmed(initiator.address, signedTx.hash)),
  )
  .subscribe(
    resp => {
      consola.info("Hash: %s",
        resp.transactionInfo?.hash,
      )
    },
    error => consola.error(error),
    () => repo.listener.close()
  )
