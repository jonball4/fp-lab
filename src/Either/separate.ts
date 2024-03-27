import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import * as S from 'fp-ts/Separated';

/**
 * Separate an array of Eithers into two arrays, one for the lefts and one for the rights
 * @param arr The array of Eithers to separate
 * @returns An object with two arrays, one for the lefts and one for the rights 
 */
export const separate = <E, A>(arr: readonly E.Either<E, A>[]): S.Separated<readonly E[], readonly A[]> => 
    S.separated(RA.lefts(arr), RA.rights(arr))
