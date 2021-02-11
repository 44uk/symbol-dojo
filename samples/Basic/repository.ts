/**
 */
import consola from "consola"
import {
    RepositoryFactoryHttp,
    UInt64
} from "symbol-sdk"

import { env } from "../util/env"

const url = env.GATEWAY_URL
const repoFactory = new RepositoryFactoryHttp(url)

const blockRepo = repoFactory.createBlockRepository()

blockRepo.getBlockByHeight(UInt64.fromUint(1))
    .subscribe(
        blockInfo => {
            consola.info('[Block Info] ------------')
            consola.info('height: %d', blockInfo.height)
            consola.info('hash:   %s', blockInfo.hash)
            consola.info('signer: %s', blockInfo.signer.address.plain())
            consola.info('fee:    %d', blockInfo.totalFee)
            consola.info('txes:   %d', blockInfo.transactionsCount)
        },
        error => {
            consola.error(error)
        }
    )