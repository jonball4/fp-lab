import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import * as S from 'fp-ts/Separated';
import { pipe } from 'fp-ts/function';

/**
 * Separate an array of Eithers into two arrays, one for the lefts and one for the rights
 * @param arr The array of Eithers to separate
 * @returns An object with two arrays, one for the lefts and one for the rights 
 */
export const separate = <E, A>(arr: readonly E.Either<E, A>[]): S.Separated<readonly E[], readonly A[]> =>
  S.separated(RA.lefts(arr), RA.rights(arr))

/**
 * Process an array of A's with a function that returns a TaskEither, and evaluate the results
 * @param process  The function to process each element of the array
 * @param evaluate  The function to evaluate the results of the processing
 * @returns A TaskEither that contains the results of the evaluation
 */
export const traverseSeparate =
  <E1, E2, A, B, C>(
    process: (a: A) => E.Either<E1, B>,
    evaluate: (r: S.Separated<readonly E1[], readonly B[]>) => E.Either<E2, C>
  ) => (arr: readonly A[]): E.Either<E2, C> => pipe(
      arr,
      RA.map(process),
      separate,
      evaluate,
    );
