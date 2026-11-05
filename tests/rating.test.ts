import assert from 'node:assert/strict';
import { aggregateRating } from '../client/src/lib/aggregateRating';
for (const [v,c] of [[null,0],[undefined,10],[0,5],[NaN,3],[Infinity,3],[6,2],[4,0],[4,-2],[4,1.5],['4',3],[4,'3']]) assert.equal(aggregateRating(v,c),undefined);
assert.deepEqual(aggregateRating(4.8,123),{'@type':'AggregateRating',ratingValue:4.8,reviewCount:123,bestRating:5});
assert.equal(JSON.stringify({aggregateRating:aggregateRating(null,0)}),'{}');
console.log('13 rating cases PASS');
