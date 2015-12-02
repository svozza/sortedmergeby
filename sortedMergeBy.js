"use strict";
const _ = require('highland');

function sortedMergeBy(pred, streams) {
    let buffer = new Map();

    return _(streams).map(_).collect().flatMap((srcs) => {

        function nextValue(src, push, next) {
            src.pull((err, x) => {
                if (err) {
                    push(err);
                    nextValue(src, push, next);
                }
                else if (x === _.nil) {
                    // push last element in buffer
                    push(null, buffer.get(src));
                    // must be final stream
                    if (buffer.size === 1) {
                        push(null, _.nil);
                    }
                    else {
                        // remove stream from map of streams and
                        // from array of source streams
                        buffer.delete(src);
                        srcs.splice(srcs.indexOf(src), 1);
                        next();
                    }
                }
                else {
                    if (buffer.size === srcs.length) {
                        push(null, buffer.get(src));
                    }
                    // replace old buffer key/value with new one
                    buffer.set(src, x);
                    next();
                }
            });
        }

        if (!srcs.length) {
            return _([]);
        }

        let first = true;
        return _(function (push, next) {
            // need to buffer first element of all streams first before beginning
            // comparisons
            if (first) {
                for (let src of srcs) {
                    nextValue(src, push, next);
                }
                first = false;
            }

            var srcToPull;
            if (buffer.size === srcs.length) {
                for(let pair of buffer.entries()) {
                    srcToPull = srcToPull == null || pred(pair[1], srcToPull[1]) ? pair : srcToPull;
                }
                nextValue(srcToPull[0], push, next);
            }
        });
    });
}

module.exports = sortedMergeBy;