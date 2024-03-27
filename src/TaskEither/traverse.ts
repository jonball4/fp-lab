import * as E from 'fp-ts/Either';
import * as S from 'fp-ts/Separated';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { Either } from '../';

/**
 * Process an array of A's with a function that returns a TaskEither, and evaluate the results
 * @param process  The function to process each element of the array
 * @param evaluate  The function to evaluate the results of the processing
 * @returns A TaskEither that contains the results of the evaluation
 */
export const traverseSeparate = 
    <E1, E2, A, B, C>(
        process: (a: A) => TE.TaskEither<E1, B>, 
        evaluate: (r: S.Separated<readonly E1[], readonly B[]>) => E.Either<E2, C>
    ) => 
        (arr: readonly A[]): TE.TaskEither<E2, C> =>
            pipe(
                arr,
                T.traverseArray(process),
                T.map(Either.separate),
                T.map(evaluate),
            );
