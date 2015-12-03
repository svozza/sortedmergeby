"use strict";

const _ = require('highland');
const sortedMergeBy = require('../sortedMergeBy');
const chai = require('chai');
const assert = chai.assert;

const xs = [1, 33, 44];
const xs1 = [2, 7, 8, 10, 99, 123];
const xs2 = [2, 4, 5, 7, 45, 78, 300, 555];

const xsRev = [1, 33, 44].reverse();
const xs1Rev = [2, 7, 8, 10, 99, 123].reverse();
const xs2Rev = [2, 4, 5, 7, 45, 78, 300, 555].reverse();

const sorted = [xs, xs1, xs2]
    .reduce((memo, arr) => memo.concat(arr))
    .sort((a, b) => a - b);

const sortedRev = sorted.concat([]).reverse();

let s1 = _((push, next) => {
    setTimeout(() => push(null, 45), 30);
    setTimeout(() => push(null, 195), 40);
    setTimeout(() => push(null, 711), 50);
    setTimeout(() => push(null, 800), 200);
    setTimeout(() => push(null, _.nil), 300);
});

let s2 = _((push, next) => {
    setTimeout(() => push(null, 6), 10);
    setTimeout(() => push(null, 9), 200);
    setTimeout(() => push(null, 200), 300);
    setTimeout(() => push(null, 715), 400);
    setTimeout(() => push(null, _.nil), 500);
});

let s1Rev = _((push, next) => {
    setTimeout(() => push(null, 800), 30);
    setTimeout(() => push(null, 711), 40);
    setTimeout(() => push(null, 195), 50);
    setTimeout(() => push(null, 45), 200);
    setTimeout(() => push(null, _.nil), 210);
});

let s2Rev = _((push, next) => {
    setTimeout(() => push(null, 715), 10);
    setTimeout(() => push(null, 200), 200);
    setTimeout(() => push(null, 9), 300);
    setTimeout(() => push(null, 6), 400);
    setTimeout(() => push(null, _.nil), 500);
});

const sortedAsync = [6, 9, 45, 195, 200, 711, 715, 800];
const sortedAsyncRev = sortedAsync.concat([]).reverse();

let errS2 = _((push, next) => {
    setTimeout(() => push(null, 10), 100);
    setTimeout(() => push(null, 20), 150);
    setTimeout(() => push(null, 30), 300);
    setTimeout(() => push(new Error('ignore')), 315);
    setTimeout(() => push(null, 40), 415);
    setTimeout(() => push(null, _.nil), 500);
});

const sortedErrS2 = [10, 20, 30, 40];
const errSorted = sortedErrS2.concat(sorted)
    .sort((a, b) => a - b);;

const asc = (a, b) => a < b;
const desc = (a, b) => a > b;

describe('sortedMergeBy', () => {

    describe('ascending', () => {

        it('sorts an ascending synchronous stream', (done) => {
            sortedMergeBy(asc, _([xs, xs1, xs2]))
                .toArray(xs => {
                    assert.deepEqual(sorted, xs);
                    done();
                });
        });

        it('sorts an ascending asynchronous stream', (done) => {
            sortedMergeBy(asc, _([s1, s2]))
                .toArray(xs => {
                    assert.deepEqual(sortedAsync, xs);
                    done();
                });
        });

    });

    describe('descending', () => {

        it('sorts an descending synchronous stream', (done) => {
            sortedMergeBy(desc, _([xsRev, xs1Rev, xs2Rev]))
                .toArray(xs => {
                    assert.deepEqual(sortedRev, xs);
                    done();
                });
        });

        it('sorts an descending asynchronous stream', (done) => {
            sortedMergeBy(desc, _([s1Rev, s2Rev]))
                .toArray(xs => {
                    assert.deepEqual(sortedAsyncRev, xs);
                    done();
                });
        });

    });

    describe('errors', () => {

        it('sorts a stream with errors', (done) => {
            sortedMergeBy(asc, _([errS2, xs, xs1, xs2]))
                .errors(err => assert.equal(err.message, 'ignore'))
                .toArray(xs => {
                    assert.deepEqual(errSorted, xs);
                    done();
                });
        });
    });

});