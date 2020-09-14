import { Observable, ObservableInput } from 'rxjs';
import { catchError } from 'rxjs/operators';

export * from 'typeless/rx';

export { ajax } from 'rxjs/ajax';

export const catchLog = <T, O extends ObservableInput<any>>(
  fn: (err: Error, source: Observable<T>) => O
) =>
  catchError<T, O>((err, source) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error(err);
    }
    return fn(err, source);
  });
