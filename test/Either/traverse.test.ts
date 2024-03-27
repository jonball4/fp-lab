import { expect } from "chai";
import * as E from 'fp-ts/Either';
import * as S from 'fp-ts/Separated';
import { Either } from '../../src';
import { flow } from "fp-ts/lib/function";

describe('traverseSeparate', () => {
    it('yields an array of Eithers in two arrays, one for the lefts and one for the rights', () => {
        const arr: readonly number[] = [1, 2, 3];
        const process: (b: number) => E.Either<Error, number> = (
            E.fromPredicate((num: number) => num > 1, () => new Error('less than or equal to 1'))
        );
        const evaluate: (r: S.Separated<readonly Error[], readonly number[]>) => E.Either<never, readonly number[]> = (
            flow((r: S.Separated<readonly Error[], readonly number[]>) => E.of(r.right))
        );
        const result: E.Either<Error, readonly number[]> = Either.traverseSeparate(process, evaluate)(arr);
        if (E.isRight(result)) {
            expect(result.right).to.deep.equal([2, 3]);
        } else {
            throw new Error('expected right');
        }
    });

    it('evaluates the results of the processing', () => {
        const arr: readonly number[] = [1, 2, 3];
        const process: (b: number) => E.Either<Error, number> = (
            E.fromPredicate((num: number) => num > 1, () => new Error('less than or equal to 1'))
        );
        const evaluate: (r: S.Separated<readonly Error[], readonly number[]>) => E.Either<Error, readonly number[]> = flow(
            E.fromPredicate(
                (r: S.Separated<readonly Error[], readonly number[]>) => r.left.length < 0, 
                () => new Error('lefts')
            ),
            E.map((r: S.Separated<readonly Error[], readonly number[]>) => r.right)
        );
        const result: E.Either<Error, readonly number[]> = Either.traverseSeparate(process, evaluate)(arr);
        if (E.isRight(result)) {
            throw new Error('expected left');
        } else {
            expect(result.left).to.deep.equal(new Error('lefts'));
        }
    });
});
