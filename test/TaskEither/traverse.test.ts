import { expect } from "chai";
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import * as S from 'fp-ts/Separated';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { flow, pipe } from 'fp-ts/function';
import { TaskEither } from "../../src";

describe('traverseSeparate', () => {
    it('do it manually', async () => {
        const arr: readonly number[] = [1, 2, 3];
        const process: (b: number) => TE.TaskEither<Error, number> = (
            TE.fromPredicate((num: number) => num > 1, () => new Error('less than or equal to 1'))
        );
        const evaluate = flow(
            E.fromPredicate(
                (eithers: readonly E.Either<Error, number>[]) => RA.lefts(eithers).length > 0, 
                () => new Error('lefts')
            ),
            E.map(RA.rights),
        );
        const tasks: TE.TaskEither<Error, readonly number[]> = pipe(
            arr,
            T.traverseArray(process),
            T.map(evaluate)
        );
        const results = await tasks();
        if (E.isRight(results)) {
            expect(results.right).to.deep.equal([2, 3]);
        } else {
            throw new Error('expected right');
        }
    });

    it('yields an array of Eithers in two arrays, one for the lefts and one for the rights', async () => {
        const arr: readonly number[] = [1, 2, 3];
        const process: (b: number) => TE.TaskEither<Error, number> = (
            TE.fromPredicate((num: number) => num > 1, () => new Error('less than or equal to 1'))
        );
        const evaluate: (r: S.Separated<readonly Error[], readonly number[]>) => E.Either<never, readonly number[]> = (
            flow((r: S.Separated<readonly Error[], readonly number[]>) => E.of(r.right))
        );
        const tasks: TE.TaskEither<Error, readonly number[]> = TaskEither.traverseSeparate(process, evaluate)(arr);
        const result = await tasks();
        if (E.isRight(result)) {
            expect(result.right).to.deep.equal([2, 3]);
        } else {
            throw new Error('expected right');
        }
    });

    it('evaluates the results of the processing', async () => {
        const arr: readonly number[] = [1, 2, 3];
        const process: (b: number) => TE.TaskEither<Error, number> = (
            TE.fromPredicate((num: number) => num > 1, () => new Error('less than or equal to 1'))
        );
        const evaluate: (r: S.Separated<readonly Error[], readonly number[]>) => E.Either<Error, readonly number[]> = flow(
            E.fromPredicate(
                (r: S.Separated<readonly Error[], readonly number[]>) => r.left.length < 0, 
                () => new Error('lefts')
            ),
            E.map((r: S.Separated<readonly Error[], readonly number[]>) => r.right)
        );
        const tasks: TE.TaskEither<Error, readonly number[]> = TaskEither.traverseSeparate(process, evaluate)(arr);
        const result = await tasks();
        if (E.isRight(result)) {
            throw new Error('expected left');
        } else {
            expect(result.left).to.deep.equal(new Error('lefts'));
        }
    });
});
