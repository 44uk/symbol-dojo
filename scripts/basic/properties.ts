/**
 */
import consola from "consola"
import {
    RepositoryFactoryHttp,
} from "symbol-sdk"
import { forkJoin } from "rxjs"

import { env, humanReadable as hr } from "../util"

const url = env.GATEWAY_URL
const repoFactory = new RepositoryFactoryHttp(url)

forkJoin({
    currencies: repoFactory.getCurrencies(),
    epochAdjustment: repoFactory.getEpochAdjustment(),
    generationHash: repoFactory.getGenerationHash(),
    networkType: repoFactory.getNetworkType(),
    nodePublicKey: repoFactory.getNodePublicKey(),
})
    .subscribe(
        resp => {
            consola.info('[Network Properties Info] ------------')
            consola.info('currencies.currency: %s(%s)',
                resp.currencies.currency.namespaceId?.fullName,
                resp.currencies.currency.mosaicId?.toHex()
            )
            consola.info('currencies.harvest:  %s(%s)',
            resp.currencies.harvest.namespaceId?.fullName,
            resp.currencies.harvest.mosaicId?.toHex()
            )
            consola.info('epochAdjustment: %d', resp.epochAdjustment)
            consola.info('generationHash:  %s', resp.generationHash)
            consola.info('networkType:     %s(%d)', hr.networkType(resp.networkType), resp.networkType)
            consola.info('nodePublicKey:   %s', resp.nodePublicKey)
        },
        error => {
            consola.error(error)
        }
    )
