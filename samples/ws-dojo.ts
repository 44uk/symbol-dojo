import { RepositoryFactoryHttp, NetworkType } from "symbol-sdk";
import { from } from "rxjs";
import { concatMap, finalize, tap } from "rxjs/operators";

const nodeUrl = 'http://api-01.ap-northeast-1.096x.symboldev.network:3000';
const gen     = "1DFB2FAA9E7F054168B0C5FCB84F4DEB62CC2B4D317D861F3168D161F54EA78B"

const repositoryFactory = new RepositoryFactoryHttp(
  nodeUrl, {
    generationHash: gen,
    networkType: NetworkType.TEST_NET
  }
);
const listener = repositoryFactory.createListener()

console.log("isOpen: %s", listener.isOpen())

from(listener.open())
  .pipe(
    tap(() => console.log("isOpen: %s", listener.isOpen())),
    concatMap(() => listener.newBlock())
  )
  .subscribe(
    resp => {
      console.debug({ resp })
    },
    error => {
      console.error({ error })
    },
  )
