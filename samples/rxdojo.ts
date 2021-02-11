import { of, timer, interval } from "rxjs";
import { mergeMap, map, take, takeWhile, tap, switchMap, concatMap, filter } from "rxjs/operators";

const RequestDummy = () => {
  let count = 0
  return () => new Promise<number>((resolve, _) => {
    count++
    setTimeout(() => resolve(count), 1500)
  })
}

const req = RequestDummy()

const o$ = interval(15000)
  .pipe(
    concatMap(() => req()),
    take(8),
  )
  .subscribe(
    _ => {
      console.log(_)
      if(_ > 7) o$.unsubscribe()
    },
    error => {
      console.log(error)
    }
  )
