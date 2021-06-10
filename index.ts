import { timer, of, combineLatest, merge, interval } from 'rxjs';
import { Observable } from 'rxjs/dist/types';
import {
  scan,
  tap,
  concatMap,
  ignoreElements,
  startWith,
  take,
  timeout
} from 'rxjs/operators';

//Emit the stream with the controled time out
function getMockedStream(timeOut: number) {
  const intervalTime = 1000;
  const dataInterval$ = timer(0, intervalTime).pipe(take(60));
  const dataSource$ = of('data test');

  let sensorData$ = combineLatest(
    dataSource$,
    dataInterval$,
    (source, interval) => source + ' ' + (+interval + 1)
  );
  return sensorData$.pipe(
    concatMap((value: string) => {
      let numberOfData = +value.slice(10);
      if (numberOfData % 10 == 0) {
        return timer(timeOut).pipe(
          ignoreElements(),
          startWith(value)
        );
      }
      return timer(intervalTime).pipe(
        ignoreElements(),
        startWith(value)
      );
    }),
    tap(console.log)
  );
}

let sensorData$ = getMockedStream(10000);

function handleOffLineState(sensorData: Observable<any>, timeOut: number) {
  let interval = 1000;
  const bufferSize = timeOut/interval;
  let initialArray = Array(bufferSize).fill(null);
  return merge(timer(0, interval), sensorData)
    .pipe(
      //tap(console.log),
      scan((accumulator: any, current: any) => {
        accumulator.push(current);
        accumulator.shift();
        return accumulator;
      }, initialArray)
    )
    .subscribe((data: Array<string | number>) => {
      //displays the message if the timeout has expired
      if (
        data.every(
          currentValue => currentValue && typeof currentValue == 'number'
        )
      ) {
        console.log('%cSensor is Offline', 'color: red');
      }
    });
}

handleOffLineState(sensorData$,5000);

