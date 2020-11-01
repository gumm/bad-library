// const fs = require("fs");

/**
 * A variadic compose that accepts any number of pure functions and composes
 * them together.
 * @type {function(...function(?):?): !function(?):?}
 */
const compose = (...fns) => (...x) => fns.reduce((a, b) => c => a(b(c)))(...x);


const mergeDeep = (target, source) => {
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, {[key]: source[key]});
        else
          output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, {[key]: source[key]});
      }
    });
  }
  return output;
};


/**
 * Usage:
 * var g = partial(f, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially applied to fn.
 * @return {!Function} A partially-applied form of the function goog.partial()
 *     was invoked as a method of.
 */
const partial = function(fn, var_args) {
  let args = Array.prototype.slice.call(arguments, 1);
  return function() {
    let newArgs = args.slice();
    newArgs.push.apply(newArgs, arguments);
    return fn.apply(this, newArgs);
  };
};


const identity = e => e;


/**
 * @type {function(!string): !string}
 */
const toLowerCase = x => x.toLowerCase();


/**
 * @param {*} x
 * @return {!string}
 */
const whatType = x => typeof x;

/**
 * @param {*} n
 * @return {boolean}
 */
const isNumber = n => whatType(n) === 'number' && !Number.isNaN(n);

/**
 * @param {*} t
 * @returns {*|boolean}
 */
const isObject = t => (t && typeof t === 'object' && !Array.isArray(t));


/**
 * A strict even test that does not coerce values, and results in false if the
 * given element is not a number.
 * @param {*} t
 */
const isEven = t => isNumber(t) && !(t % 2);
[Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -0, 0, 1, '1', 2, '2', -1,
  'oddball', NaN, {}, [], true, false]
    .forEach(e => console.log(isEven(e)));


/**
 * @param {*} n
 * @return {function(*): !boolean}
 */
const isDivisibleBy = n => x => x % n === 0 && isNumber(x);


/**
 * @type {function(*): !string}
 */
const toString = x => x + '';


/**
 * @type {function(*): !number}
 */
const toNumber = x => x * 1;


/**
 * @type {function(!string): !string}
 */
const toUpperCase = x => x.toUpperCase();


/**
 * @type {function(!string): !function(!string): !Array<!string>}
 */
const split = s => x => x.split(s);


/**
 * @type {function(!RegExp, !string): !function(!string): !string}
 */
const replace = (p, r) => x => x.replace(p, r);


/**
 * @type {function(!string): !function(!Array<*>): !string}
 */
const join = s => x => x.join(s);


/**
 * @type {function(!string, !string): !string}
 */
const append = (x, y) => y + x;


/**
 * @type {function((!Array.<*>|!string)): *}
 */
const head = x => x[0];


/**
 * Reverse either an array or a string
 * @type {function((!Array.<*>|!string)): !Array.<*>}
 */
const reverse = x => {
  let y = x.split ? x.split('') : x;
  return y.reduce((p, c) => [c].concat(p), [])
};

const logInline = (tag, x) => {
  console.log(tag, x);
  return x;
};


const trace = t => partial(logInline, t);


const flatten = arr =>
    arr.reduce((p, c) => p.concat(Array.isArray(c) ? flatten(c) : c), []);
console.log(flatten([[1], 2, [[3, 4], 5], [[[]]], [[[6]]], 7, 8, []]));

/**
 * Flatten multi-dimensional array to single dimension.
 * Example:
 * [[1], 2, [[3, 4], 5], [[[]]], [[[6]]], 7, 8, []] -> [1, 2, 3, 4, 5, 6, 7, 8]
 * @param {*} t
 * @return {!Array<*>}
 */
const flattenB = t => t.reduce ? t.reduce((p, c) => p.concat(flattenB(c)), []) : t;
console.log(flattenB([[1], 2, [[3, 4], 5], [[[]]], [[[6]]], 7, 8, []]));

const flattenC = a => a.reduce((p, c) => c.reduce ? flattenC([...p, ...c]) : [...p, c], []);
console.log(flattenC([[1], 2, [[3, 4], 5], [[[]]], [[[6]]], 7, 8, []]));

/**
 * Given an index number, return a function that takes an array and returns the
 * element at the given index
 * @param {!number} i
 * @return {function(!Array): *}
 */
const elAt = i => arr => arr[i];

/**
 * Transpose an array of arrays:
 * Example:
 * [['a', 'b', 'c'], ['A', 'B', 'C'], [1, 2, 3]] ->
 * [['a', 'A', 1], ['b', 'B', 2], ['c', 'C', 3]]
 * @param {!Array<*>} a
 * @return {!Array<*>}
 */
const transpose = a => a[0].map((e, i) => {
  const fun = elAt(i);
  return a.map(fun)
});
console.log(transpose([['a', 'b', 'c'], ['A', 'B', 'C'], [1, 2, 3]]));

/**
 * @type {function(function(*, !number, !Array) : *) : function(!Array<*>): ?}
 */
const map = func => x => x.map(func);

/**
 * Factorize a function of the form Ax^2 + Bx + C = 0 finding the value of x
 * @param {!number} a
 * @param {!number} b
 * @param {!number} c
 * @return {number} The value of x
 */
const fac = (a, b, c) => (-b + Math.sqrt(b ** 2 - 4 * a * (-c))) / (2 * a);


const filter = func => n => n.filter(func);

const negate = n => !n;


/**
 * a → n → [a]
 * Returns a fixed list of size n containing a specified identical value.
 * @param {*} v
 * @param {!number} n
 */
const repeat = (v, n) => new Array(n).fill(v);


const both = (a, b) => n => a(n) && b(n);

/**
 * Interleave a string (s) with the given joiner (j)
 * @param {!string} j The joiner to interleave the string with.
 * @return {!string}
 */
const interleave = j => s => s.split('').map(v => `${j}${v}`).join('');


/**
 * @type {function(!Array<*>): *}
 */
const tail = compose(head, reverse);


/**
 * @type {function(!string): !string}
 */
const snakeCase = compose(replace(/\s+/ig, '_'), toLowerCase);


/**
 * @type {function(*): !string}
 */
const anyToLowerCase = compose(toLowerCase, toString);

/**
 * A generator function that returns an iterator over the specified range of
 * numbers. By default the step size is 1, but this can optionally be passed
 * in as well. A negative step size is silently converted to a positive number.
 * The generator will always yield the first value, and from there step
 * towards the second value.
 * It does not matter which of the 2 values are larger, the generator will
 * always step from the first towards the second.
 * @param {!number} b Begin here - First element in array
 * @param {!number} e End here - Last element in array
 * @param {!number} s Step this size
 */
function* rangeGen(b, e, s = 1) {
  if (!isNumber(s) || s === 0) {
    throw new TypeError(`Invalid step size: ${s}`);
  }
  if (!(isNumber(b) && isNumber(e))) {
    throw new TypeError('Arguments to range must be numbers');
  }
  let up = e >= b;
  for (let i = b; up ? i <= e : i >= e;
       up ? i += Math.abs(s) : i -= Math.abs(s)) {
    yield i;
  }
}

const range = (b, e, s) => [...(rangeGen(b, e, s))];
console.log(range(1, -1));


const stringReverse = compose(join(''), reverse);
const numReverse = compose(toNumber, join(''), reverse, toString);


/**
 * Counts the occurrence of an element in an array.
 * @param {*} t
 */
const countOck = t => arr =>
    arr.filter(e => Number.isNaN(t) ? Number.isNaN(e) : e === t).length;
let countZeros = countOck(0);
let countNaNs = countOck(NaN);
console.log(`Number of zeros: ${countZeros([0, 1, 0, 1, 0, 0, 0, 1])}`);
console.log(`Number of NaNs: ${countNaNs([NaN, 1, NaN, 1, NaN, 0, NaN, 1])}`);

const countByFunc = f => arr => arr.filter(f).length;
let countArr = countByFunc(e => Array.isArray(e));
console.log(`Number of Arrays: ${countArr([[], [], NaN, {}, 1, {length: 1}])}`);

/**
 * A strict same elements in same order comparison.
 * @param {!Array.<*>} a
 * @param {!Array.<*>} b
 */
const sameArr = (a, b) => a.length === b.length && a.every((c, i) => b[i] === c);
console.log('Same Arrays:', sameArr([1, 2], [1, 2]));
console.log('Same Arrays:', sameArr([2, 1], [1, 2]));


/**
 * A loose same elements comparison.
 * @param {!Array.<*>} a
 * @param {!Array.<*>} b
 */
const sameEls = (a, b) => a.length === b.length &&
    a.every((c, i) => b.includes(c)) && b.every((c, i) => a.includes(c));
console.log('Same Elements:', sameEls([1, 2], [1, 2]));
console.log('Same Elements:', sameEls([2, 1], [1, 2]));
console.log('Same Elements:', sameEls([2, 2], [1, 2]));


// -----------------------------------------------------------------------------
// FizzBuzz
(() => {
  const dividesBy3 = isDivisibleBy(3);
  const dividesBy5 = isDivisibleBy(5);
  const dividesBy15 = isDivisibleBy(15);
  const f = n => dividesBy3(n) ? 'Fizz' : n;
  const b = n => dividesBy5(n) ? 'Buzz' : n;
  const fb = n => dividesBy15(n) ? 'FizzBuzz' : n;
  const c = compose(f, b, fb);
  range(1, 101).forEach(e => console.log(c(e)));
})();


// -----------------------------------------------------------------------------
// Rosetta code: Luhn_test_of_credit_card_numbers
// http://rosettacode.org/wiki/Luhn_test_of_credit_card_numbers
(() => {
// Try: 1
  const luhn = n => {
    let evens = a => a.filter((e, i) => !((i + 1) % 2));
    let odds = a => a.filter((e, i) => !!((i + 1) % 2));
    let sum = (p, c) => Number(p) + Number(c);
    let rN = n => n.toString().split('').reduce(sum, 0);
    let sumArr = a => a.reduce(sum, 0);
    let timesN = n => x => x * n;
    let s1 = compose(sumArr, odds, map(Number), reverse, toString);
    let s2 = compose(
        sumArr, map(rN), map(timesN(2)), evens, map(Number), reverse, toString);
    return !((s1(n) + s2(n)) % 10)
  };


  /**
   * @param {!number|!string} n The number to calc and check
   * @return {!Array.<!boolean|!number>} Valid and Luhn number
   */
  const luhn2 = n => {
    let result = n.toString().split('').reverse().reduce((p, e, i) => {
      let n = Number(e);
      return p += (!(i % 2)) ?
          n :
          (n * 2).toString().split('').reduce((a, b) => Number(a) + Number(b), 0);
    }, 0);
    return [!(result % 10), result / 10];
  };

  /**
   * /**
   * The IMEI (International Mobile Station Equipment Identity) is a 15-digit
   * number to uniquely identify a mobile phone device.
   * IMEISV (IMEI Software Version) is a 16-digit number with the IMEI and an
   * additional software version number.
   *
   * As of 2004, the formats of the IMEI and IMEISV are
   *    AA-BBBBBB-CCCCCC-D and
   *    AA-BBBBBB-CCCCCC-EE respectively.
   * The definition of the formats can be found below.
   *
   * AA     BB-BB-BB   CC-CC-CC     D     EE
   * TAC   TAC       SN           CD     SVN
   * TAC : Type Allocation Code
   * SN : Serial Number
   * CD : Check Digit based on Luhn algorithm
   * SVN : Software Version Number
   * @param {!number|!string} n The IMEIsv number as received from RADIUS.
   * @return {!string}
   */
  const imeisvToImei = n => {
    let t = n.toString().substr(0, 14);
    let r = luhn2(t);
    return r[0] ? t + r[1] : n;
  };

  console.log('\n\n--------------------------------------');
  console.log([35956805108414].map(luhn2));
  console.log([86488102222183].map(luhn2));
  console.log(imeisvToImei('3595680510841401'));
  console.log(imeisvToImei('86488102222183'));
  console.log('--------------------------------------\n\n');

// The IMEI reported in 3595680510841401 is the same as the IMEI of the device
// 359568051084146
})();


// -----------------------------------------------------------------------------
// Rosetta code: 2-points
// http://rosettacode.org/wiki/Circles_of_given_radius_through_two_points
// point is given as [x, y]
(() => {
  const hDist = (p1, p2) => Math.hypot(...p1.map((e, i) => e - p2[i])) / 2;
  const pAng = (p1, p2) =>
      Math.atan(p1.map((e, i) => e - p2[i]).reduce((p, c) => c / p, 1));
  const solveF = (p, r) => t => [r * Math.cos(t) + p[0], r * Math.sin(t) + p[1]];
  const diamPoints = (p1, p2) => p1.map((e, i) => e + (p2[i] - e) / 2);

  const findC = (...args) => {
    const [p1, p2, s] = args;
    const solve = solveF(p1, s);
    const halfDist = hDist(p1, p2);
    let msg = `p1: ${p1}, p2: ${p2}, r:${s} Result: `;
    switch (Math.sign(s - halfDist)) {
      case 0:
        msg += s ? `Points on diameter. Circle at: ${diamPoints(p1, p2)}` :
            'Radius Zero';
        break;
      case 1:
        if (!halfDist) {
          msg += 'Coincident point. Infinite solutions';
        } else {
          let theta = pAng(p1, p2);
          let theta2 = Math.acos(halfDist / s);
          [1, -1]
              .map(e => solve(theta + e * theta2))
              .forEach(e => msg += `Circle at ${e} `);
        }
        break;
      case -1:
        msg += 'No intersection. Points further apart than circle diameter';
        break;
    }
    return msg;
  };

  [[[0.1234, 0.9876], [0.8765, 0.2345], 2.0],
    [[0.0000, 2.0000], [0.0000, 0.0000], 1.0],
    [[0.1234, 0.9876], [0.1234, 0.9876], 2.0],
    [[0.1234, 0.9876], [0.8765, 0.2345], 0.5],
    [[0.1234, 0.9876], [0.1234, 0.9876], 0.0]]
      .forEach((t, i) => console.log(`Test: ${i}: ${findC(...t)}`));
})();


// -----------------------------------------------------------------------------
// Rosetta code: Topological sort
// http://rosettacode.org/wiki/Topological_sort
(() => {
  const topoSort = input => {
    // A map of the input data, with the keys as the packages, and the values as
    // an array of packages on which it depends.
    const D =
        input.split('\n')
            .map(e => e.split(' ').filter(e => e !== ''))
            .reduce(
                (p, c) => p.set(
                    c[0], c.filter((e, i) => i > 0 && e !== c[0] ? e : null)),
                new Map());
    [].concat(...D.values()).forEach(e => {
      D.set(e, D.get(e) || [])
    });

    console.log('\nMAP: D', D);

    // The above map rotated so that it represents a DAG of the form
    // Map {
    //    A => [ A, B, C],
    //    B => [C],
    //    C => []
    // }
    // where each key represents a node, and the array contains the edges.
    const G = [...D.keys()].reduce(
        (p, c) => p.set(c, [...D.keys()].filter(e => D.get(e).includes(c))),
        new Map());

    console.log('\nGRAPH: G', G);

    // An array of leaf nodes; nodes with 0 in degrees.
    const Q = [...D.keys()].filter(e => D.get(e).length === 0);

    console.log('\nLeaf Nodes: Q', Q);

    // The result array.
    const S = [];
    while (Q.length) {
      const u = Q.pop();
      S.push(u);
      G.get(u).forEach(v => {
        D.set(v, D.get(v).filter(e => e !== u));
        if (D.get(v).length === 0) {
          Q.push(v);
        }
      });
    }
    return S;
  };

  console.log(
      '\nSolution:',
      topoSort(
          `des_system_lib   std synopsys std_cell_lib des_system_lib dw02 dw01 ramlib ieee
  dw01             ieee dw01 dware gtech
  dw02             ieee dw02 dware
  dw03             std synopsys dware dw03 dw02 dw01 ieee gtech
  dw04             dw04 ieee dw01 dware gtech
  dw05             dw05 ieee dware
  dw06             dw06 ieee dware
  dw07             ieee dware
  dware            ieee dware
  gtech            ieee gtech
  ramlib           std ieee
  std_cell_lib     ieee std_cell_lib
  synopsys`));
})();


// -----------------------------------------------------------------------------
// Rosetta code: Generator/Exponential
// http://rosettacode.org/wiki/Generator/Exponential
(() => {
  function* nPowerGen(n) {
    let e = 0;
    while (1) {
      e++ && (yield Math.pow(e, n));
    }
  }

  function* filterGen(gS, gC, skip = 0) {
    let s = 0;  // The square value
    let c = 0;  // The cube value
    let n = 0;  // A skip counter4

    while (1) {
      s = gS.next().value;
      s > c && (c = gC.next().value);
      s === c ? c = gC.next().value : n++ && n > skip && (yield s);
    }
  }

  const filtered = filterGen(nPowerGen(2), nPowerGen(3), skip = 20);

  for (let n = 0; n < 10; n++) {
    console.log(filtered.next().value)
  }
})();


// -----------------------------------------------------------------------------
// Rosetta code: Split a character string based on change of character
// http://rosettacode.org/wiki/Split_a_character_string_based_on_change_of_character#ES6
(() => {
  const splitOnCharChange = s => {
    const tail = x => x[x.length - 1];
    return s
        .split('')
        .reduce(
            (p, c) => c === p[1] ?
                tail(p[0]).push(c) && [p[0], c] :
                p[0].push([c]) && [p[0], c],
            [[], ''])[0]
        .map(e => e.join(''));
  };
  let r = splitOnCharChange(`gHHH5YY++///\\`);
  r.forEach(e => console.log(e));
})();


//------------------------------------------------------------------------------
// Rosetta Code: Calculate the Shannon entropy H of a given input string.
// http://rosettacode.org/wiki/Entropy
// Measure the entropy of a string in bits per symbol.
(() => {
  const shannon = s =>
      [...s.split('').reduce((p, c) => p.set(c, p.has(c) ? p.get(c) + 1 : 1),
          new Map()
      ).values()]
          .map(v => v / s.length)
          .reduce((p, c) => p -= c * Math.log(c) / Math.log(2), 0);

// Log the Shannon entropy of a string.
  const log = s => {
    console.log(`Entropy of ${s} in bits per symbol: ${shannon(s)}`);
  };

  ['1223334444', '0', '01', '0123', '01234567', '0123456789abcdef'].forEach(log);
})();


//------------------------------------------------------------------------------
// Rosetta Code: Count occurrences of a substring
// http://rosettacode.org/wiki/Count_occurrences_of_a_substring#JavaScript
(() => {
  const countSubString = (str, subStr) => str.split(subStr).length - 1;
  console.log(countSubString("the three truths", "th"));
  console.log(countSubString("ababababab", "abab"));
})();

//------------------------------------------------------------------------------
// Rosetta Code: Ludic Numbers
// http://rosettacode.org/wiki/Ludic_numbers
(() => {
  /**
   * Boilerplate to simply get an array filled between 2 numbers
   * @param {!number} s Start here (inclusive)
   * @param {!number} e End here (inclusive)
   */
  const makeArr = (s, e) => new Array(e + 1 - s).fill(s).map((e, i) => e + i);

  /**
   * Remove every n-th element from the given array
   * @param {!Array} arr
   * @param {!number} n
   * @return {!Array}
   */
  const filterAtInc = (arr, n) => arr.filter((e, i) => (i + 1) % n);

  /**
   * Generate ludic numbers
   * @param {!Array} arr
   * @param {!Array} result
   * @return {!Array}
   */
  const makeLudic = (arr, result) => {
    const iter = arr.shift();
    result.push(iter);
    return arr.length ? makeLudic(filterAtInc(arr, iter), result) : result;
  };

  /**
   * Our Ludic numbers. This is a bit of a cheat, as we already know beforehand
   * up to where our seed array needs to go in order to exactly get to the
   * 2005th Ludic number.
   * @type {!Array<!number>}
   */
  const ludicResult = makeLudic(makeArr(2, 21512), [1]);


// Below is just logging out the results.
  /**
   * Given a number, return a function that takes an array, and return the
   * count of all elements smaller than the given
   * @param {!number} n
   * @return {!Function}
   */
  const smallerThanN = n => arr => {
    return arr.reduce((p, c) => {
      return c <= n ? p + 1 : p
    }, 0)
  };
  const smallerThan1K = smallerThanN(1000);

  console.log('\nFirst 25 Ludic Numbers:');
  console.log(ludicResult.filter((e, i) => i < 25).join(', '));

  console.log('\nTotal Ludic numbers smaller than 1000:');
  console.log(smallerThan1K(ludicResult));

  console.log('\nThe 2000th to 2005th ludic numbers:');
  console.log(ludicResult.filter((e, i) => i > 1998).join(', '));

  console.log('\nTriplets smaller than 250:');
  ludicResult.forEach(e => {
    if (e + 6 < 250 && ludicResult.indexOf(e + 2) > 0 && ludicResult.indexOf(e + 6) > 0) {
      console.log([e, e + 2, e + 6].join(', '));
    }
  });
})();


//------------------------------------------------------------------------------
// Rosetta Code: Leonardo Numbers
// http://rosettacode.org/wiki/Leonardo_numbers
// const leoNum = (count, l0=1, l1=1, add=1) => {
//   let i = 2;
//   const r = [l0, l1];
//   while(i < count) {
//     r.push(r[i-1] + r[i-2] + add);
//     i++;
//   }
//   return r;
// };

(() => {
  const leoNum = (n, l0 = 1, l1 = 1, s = 1) => new Array(n).fill(s).reduce(
      (p, c, i) => i > 1 ? p.push(p[i - 1] + p[i - 2] + c) && p : p, [l0, l1]
  );

  console.log(leoNum(25));
  console.log(leoNum(25, 0, 1, 0));
})();


//------------------------------------------------------------------------------
// Rosetta Code: Number names
// http://rosettacode.org/wiki/Number_names
// Show how to spell out a number in English.
// You can use a preexisting implementation or roll your own, but you should
// support inputs up to at least one million (or the maximum value of your
// language's default bounded integer type, if that's less).
// Support for inputs other than positive integers (like zero, negative
// integers, and floating-point numbers) is optional.
(() => {
  const divMod = y => x => [Math.floor(y / x), y % x];

  const say = value => {
    let name = '';
    let quotient, remainder;
    const dm = divMod(value);
    const units = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
      'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
      'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty',
      'seventy', 'eighty', 'ninety'];
    const big = [...['', 'thousand'], ...['m', 'b', 'tr', 'quadr', 'quint',
      'sext', 'sept', 'oct', 'non', 'dec'].map(e => `${e}illion`)];

    if (value < 0) {
      name = `negative ${say(-value)}`
    } else if (value < 20) {
      name = units[value]
    } else if (value < 100) {
      [quotient, remainder] = dm(10);
      name = `${tens[quotient]} ${units[remainder]}`.replace(' zero', '');
    } else if (value < 1000) {
      [quotient, remainder] = dm(100);
      name = `${say(quotient)} hundred and ${say(remainder)}`.replace(' and zero', '')
    } else {
      const chunks = [];
      const text = [];
      while (value !== 0) {
        [value, remainder] = divMod(value)(1000);
        chunks.push(remainder);
      }
      chunks.forEach((e, i) => {
        if (e > 0) {
          text.push(`${say(e)}${i === 0 ? '' : ' ' + big[i]}`);
          if (i === 0 && e < 100) {
            text.push('and');
          }
        }
      });
      name = text.reverse().join(', ').replace(', and,', ' and');
    }
    return name;
  };
})();


//------------------------------------------------------------------------------
// Rosetta Code: Sort three variables
(() => {
  const printThree = (note, [a, b, c], [a1, b1, c1]) => {
    console.log(`${note}
    ${a} is: ${a1}
    ${b} is: ${b1}
    ${c} is: ${c1}
  `);
  };
  const sortThree = () => {

    let a = 'lions, tigers, and';
    let b = 'bears, oh my!';
    let c = '(from the "Wizard of OZ")';
    printThree('Before Sorting', ['a', 'b', 'c'], [a, b, c]);

    [a, b, c] = [a, b, c].sort();
    printThree('After Sorting', ['a', 'b', 'c'], [a, b, c]);

    let x = 77444;
    let y = -12;
    let z = 0;
    printThree('Before Sorting', ['x', 'y', 'z'], [x, y, z]);

    [x, y, z] = [x, y, z].sort();
    printThree('After Sorting', ['x', 'y', 'z'], [x, y, z]);
  };
  sortThree();
})();


//------------------------------------------------------------------------------
// Rosetta Code: Find common directory path
// http://rosettacode.org/wiki/Find_common_directory_path
(() => {
  /**
   * Given an array of strings, return an array of arrays, containing the
   * strings split at the given separator
   * @param {!Array<!string>} a
   * @param {string} sep
   * @returns {!Array<!Array<string>>}
   */
  const splitStrings = (a, sep = '/') => a.map(i => i.split(sep));

  /**
   * Transpose an array of arrays:
   * Example:
   * [['a', 'b', 'c'], ['A', 'B', 'C'], [1, 2, 3]] ->
   * [['a', 'A', 1], ['b', 'B', 2], ['c', 'C', 3]]
   * @param {!Array<!Array<*>>} a
   * @return {!Array<!Array<*>>}
   */
  const rotate = a => a[0].map((e, i) => a.map(elAt(i)));

  /**
   * Checks of all the elements in the array are the same.
   * @param {!Array<*>} arr
   * @return {boolean}
   */
  const allElementsEqual = arr => arr.every(e => e === arr[0]);


  const commonPath = (input, sep = '/') => rotate(splitStrings(input, sep))
      .filter(allElementsEqual).map(elAt(0)).join(sep);

  const cdpInput = [
    '/home/user1/tmp/coverage/test',
    '/home/user1/tmp/covert/operator',
    '/home/user1/tmp/coven/members',
  ];

  console.log(`Common path is: ${commonPath(cdpInput)}`);
})();


//------------------------------------------------------------------------------
// Rosetta Code: Longest common prefix
// http://rosettacode.org/wiki/Longest_common_prefix
(() => {
  const lcp = (...args) => {
    /**
     * Return a function that returns an array of elements at the given index.
     * @param {!Array<*>} arr2D
     * @returns {function(!number): !Array<*>}
     */
    const getElsAt = arr2D => i => arr2D.map(e => e[i]);

    /**
     * Returns true if the values are the same
     * @param {*} v
     * @returns {function(*): boolean}
     */
    const sameAs = v => e => v === e;

    /**
     * Prepare a function to return an array of elements at the given index.
     * @type {function(!number): !Array<*>}
     */
    const elementsAt = getElsAt(args);

    /**
     * Takes an integer and a string, and iteratively build the longest common
     * prefix
     * @param {!number} n The index number under consideration.
     * @param {!string} s The resulting string.
     * @returns {*}
     */
    const f = (n, s) => {
      const arr = elementsAt(n);
      const el = arr[0];
      return el && arr.every(sameAs(el)) ? f(n + 1, s + el) : s;
    };
    return f(0, '');
  };


  console.log(lcp("interspecies", "interstellar", "interstate")); // "inters"
  console.log(lcp("throne", "throne")); // "throne"
  console.log(lcp("throne", "dungeon")); // ""
  console.log(lcp("throne", "", "throne")); // ""
  console.log(lcp("cheese")); // "cheese"
  console.log(lcp("")); // ""
  console.log(lcp()); // ""
  console.log(lcp("prefix", "suffix")); // ""
  console.log(lcp("foo", "foobar")); // "foo"
})();


//------------------------------------------------------------------------------
// Rosetta Code: Create an HTML table
// http://rosettacode.org/wiki/Create_an_HTML_table#JavaScript
(() => {
  /**
   * Given a 2D array of data, wrap it in a legal HTML table structure, labeling
   * the columns according to the head parameter, and the rows numerically.
   * @param {Array<string>} head
   * @param {Array<Array<number>>} data
   * @returns {string}
   */
  const wrapDataInTable = ([head, data]) => {

    // Tag makers
    const makeTd = e => `<td>${e}</td>`;
    const makeTh = e => `<th>${e}</th>`;
    const makeTr = e => `<tr>${e}</tr>`;
    const makeTable = e => `<table>${e}</table>`;
    const makeThead = e => `<thead align="right">${e}</thead>`;
    const makeTbody = e => `<tbody align="right">${e}</tbody>`;

    // Wrappers
    const wrapIn = f => e => f(e);
    const wrapInThead = wrapIn(makeThead);
    const wrapInTbody = wrapIn(makeTbody);
    const wrapInTable = wrapIn(makeTable);

    // A generic cell making function.
    const cellMaker = (cellType, dataAccessor) =>
        (e, rowNum) => dataAccessor(e, rowNum).map(cellType).join('');

    // Generic row making function.
    const rowMaker = (numRows, cellFunc) => Array(numRows).fill(0)
        .map(cellFunc)
        .map(makeTr).join('');

    // Access body data
    const bodyData = (e, rowNum) => [rowNum + 1, ...data[rowNum]];

    // Make header data
    const headData = () => ['', ...head];

    return wrapInTable(
        wrapInThead(rowMaker(1, cellMaker(makeTh, headData))) +
        wrapInTbody(rowMaker(data.length, cellMaker(makeTd, bodyData)))
    );
  };

  /**
   * Make header row and body data.
   * @param {number} rows
   * @param {number} columns
   * @returns {[Array<string>, Array<Array<number>>]}
   */
  const makeRandomData = (rows, columns) => {
    // Column heading characters (Starting at "A")
    const makeChar = (_, i) => String.fromCharCode(65 + i);

    // 2D array of random numbers
    const data = Array(rows).fill(0).map(
        () => Array(columns).fill(0).map(
            () => Math.round(Math.random() * 10000)
        ));
    const head = Array(columns).fill(0).map(makeChar);
    return [head, data]
  };

  wrapDataInTable(makeRandomData(100, 24));
})();


//------------------------------------------------------------------------------
// Rosetta Code: Hilbert Curve
// http://rosettacode.org/wiki/Hilbert_curve#JavaScript
// Implementation of Go
(() => {
  const hilbert = (width, spacing, points) => (x, y, lg, i1, i2, f) => {
    if (lg === 1) {
      const px = (width - x) * spacing;
      const py = (width - y) * spacing;
      points.push(px, py);
      return;
    }
    lg >>= 1;
    f(x + i1 * lg, y + i1 * lg, lg, i1, 1 - i2, f);
    f(x + i2 * lg, y + (1 - i2) * lg, lg, i1, i2, f);
    f(x + (1 - i1) * lg, y + (1 - i1) * lg, lg, i1, i2, f);
    f(x + (1 - i2) * lg, y + i2 * lg, lg, 1 - i1, i2, f);
    return points;
  };

  /**
   * Draw a hilbert curve of the given order.
   * Outputs a svg string. Save the string as a .svg file and open in a browser.
   * @param {!Number} order
   */
  const drawHilbert = order => {
    if (!order || order < 1) {
      throw 'You need to give a valid positive integer';
    } else {
      order = Math.floor(order);
    }


    // Curve Constants
    const width = 2 ** order;
    const space = 10;

    // SVG Setup
    const size = 500;
    const stroke = 2;
    const col = "red";
    const fill = "transparent";

    // Prep and run function
    const f = hilbert(width, space, []);
    const points = f(0, 0, width, 0, 0, f);
    const path = points.join(' ');

    console.log(
        `<svg xmlns="http://www.w3.org/2000/svg" 
    width="${size}" 
    height="${size}"
    viewBox="${space / 2} ${space / 2} ${width * space} ${width * space}">
  <path d="M${path}" stroke-width="${stroke}" stroke="${col}" fill="${fill}"/>
</svg>`);

  };

  drawHilbert(6);
})();


//------------------------------------------------------------------------------
// Rosetta Code: Ramer-Douglas-Peucker line simplification
// http://rosettacode.org/wiki/Ramer-Douglas-Peucker_line_simplification
// Implementation of Go
(() => {
  /**
   * @typedef {{
   *    x: (!number),
   *    y: (!number)
   * }}
   */
  let pointType;

  /**
   * @param {!Array<pointType>} l
   * @param {number} eps
   */
  const RDP = (l, eps) => {
    const last = l.length - 1;
    const p1 = l[0];
    const p2 = l[last];
    const x21 = p2.x - p1.x;
    const y21 = p2.y - p1.y;

    const [dMax, x] = l.slice(1, last)
        .map(p => Math.abs(y21 * p.x - x21 * p.y + p2.x * p1.y - p2.y * p1.x))
        .reduce((p, c, i) => {
          const v = Math.max(p[0], c);
          return [v, v === p[0] ? p[1] : i + 1];
        }, [-1, 0]);

    if (dMax > eps) {
      return [...RDP(l.slice(0, x + 1), eps), ...RDP(l.slice(x), eps).slice(1)];
    }
    return [l[0], l[last]]
  };

  const points = [
    {x: 0, y: 0},
    {x: 1, y: 0.1},
    {x: 2, y: -0.1},
    {x: 3, y: 5},
    {x: 4, y: 6},
    {x: 5, y: 7},
    {x: 6, y: 8.1},
    {x: 7, y: 9},
    {x: 8, y: 9},
    {x: 9, y: 9}];

  console.log(RDP(points, 1));
})();


//------------------------------------------------------------------------------
// Rosetta Code: Last letter-first letter
// http://rosettacode.org/wiki/Last_letter-first_letter
(() => {
  /**
   * Find the letter the word ends on
   * @param {string} word
   * @returns {string}
   */
  const endsWith = word => word[word.length - 1];

  /**
   * Remove the used elements from the candidate elements
   * @param {Array<string>} words Candidate words
   * @param {Array<string>} used Used words
   * @returns {*}
   */
  const getCandidates = (words, used) => words.filter(e => !used.includes(e));

  /**
   * Build a map of letters to words that start with that letter
   * @param {Array<string>} words
   * @returns {Map<string, Array<string>>}
   */
  const buildLookup = words => {
    const lookup = new Map();
    words.forEach(e => {
      const start = e[0];
      lookup.set(start, [...(lookup.get(start) || []), e]);
    });
    return lookup;
  };


  /**
   * Main function
   * @param {Array<string>} names
   */
  const findPaths = names => {
    const t0 = process.hrtime();
    console.log('Checking:', names.length, 'names');
    const lookup = buildLookup(names);

    let maxNum = 0;
    let maxPaths = [];

    const parseResult = arr => {
      if (typeof arr[0] === 'object') {
        arr.forEach(el => parseResult(el))
      } else {
        if (arr.length > maxNum) {
          maxNum = arr.length;
          maxPaths = [arr];
        }
        if (arr.length === maxNum) {
          maxPaths.push(arr)
        }
      }
    };

    const searchWords = (word, res) => {
      const cs = getCandidates(lookup.get(endsWith(word)) || [], res);
      return cs.length ? cs.map(e => searchWords(e, [...res, e])) : res;
    };

    names.forEach(word => {
      const res = searchWords(word, [word]);
      parseResult(res);
    });

    const t1 = process.hrtime(t0);
    console.info('Execution time (hr): %ds %dms', t1[0], t1[1] / 1000000);
    console.log('Max Path:', maxNum);
    console.log('Matching Paths:', maxPaths.length);
    console.log('Example Path:', maxPaths[0]);

  };

  const pokimon = ["audino", "bagon", "baltoy", "banette",
    "bidoof", "braviary", "bronzor", "carracosta", "charmeleon",
    "cresselia", "croagunk", "darmanitan", "deino", "emboar",
    "emolga", "exeggcute", "gabite", "girafarig", "gulpin",
    "haxorus", "heatmor", "heatran", "ivysaur", "jellicent",
    "jumpluff", "kangaskhan", "kricketune", "landorus", "ledyba",
    "loudred", "lumineon", "lunatone", "machamp", "magnezone",
    "mamoswine", "nosepass", "petilil", "pidgeotto", "pikachu",
    "pinsir", "poliwrath", "poochyena", "porygon2", "porygonz",
    "registeel", "relicanth", "remoraid", "rufflet", "sableye",
    "scolipede", "scrafty", "seaking", "sealeo", "silcoon",
    "simisear", "snivy", "snorlax", "spoink", "starly", "tirtouga",
    "trapinch", "treecko", "tyrogue", "vigoroth", "vulpix",
    "wailord", "wartortle", "whismur", "wingull", "yamask"];

  findPaths(pokimon);
})();

//------------------------------------------------------------------------------
// Rosetta Code: Anagrams
// http://rosettacode.org/wiki/Anagrams
(() => {
  const unixdict = 'http://wiki.puzzlers.org/pub/wordlists/unixdict.txt';
  const stdWord = w => w.split('').sort().join('');
  const maxArr = m => [...m.values()]
      .map(e => e.length)
      .reduce((p, c) => Math.max(p, c), 0);
  const anagrams = async uri => await fetch(uri)
      .then(r => r.text())
      .then(s => s.split(/\r\n|\n/))
      .then(a => a
          .map(e => [e, stdWord(e)])
          .reduce((p, [s, w]) => p.has(w)
              ? p.set(w, [...p.get(w), s])
              : p.set(w, [s]),
              new Map()))
      .then(m => {
        const max = maxArr(m);
        return [...m.values()].filter(e => e.length === max)
      });

  // anagrams(unixdict).then(console.log);
})();


//------------------------------------------------------------------------------
// Rosetta Code: Galton Box Animation
// http://rosettacode.org/wiki/Galton_box_animation
(() => {

  /**
   * No animation...
   * Galton box
   */
  const galtonBoxSimple = (layers, balls) => {
    const pegs = [...Array(layers)];
    const result = Array(layers + 1).fill(0);
    const bounce = () => Math.round(Math.random());
    const walk = () => pegs.reduce((p, c, i) => p + bounce(), 0);
    [...Array(balls)].forEach(e => result[walk()] += 1);
    console.log(result);
  };

  galtonBoxSimple(10, 1000);


  const readline = require('readline');

  /**
   * Galton Box animation
   * @param {number} layers The number of layers in the board
   * @param {number} balls The number of balls to pass through
   */
  const galtonBox = (layers, balls) => {
    const speed = 100;
    const ball = 'o';
    const peg = '.';
    const result = [];

    const sleep = ms => new Promise(resolve => {
      setTimeout(resolve, ms)
    });

    /**
     * The board is represented as a 2D array.
     * @type {Array<Array<string>>}
     */
    const board = [...Array(layers)]
        .map((e, i) => {
          const sides = Array(layers - i).fill(' ');
          const a = Array(i + 1).fill(peg).join(' ').split('');
          return [...sides, ...a, ...sides];
        });

    /**
     * @return {Array<string>}
     */
    const emptyRow = () => Array(board[0].length).fill(' ');

    /**
     * @param {number} i
     * @returns {number}
     */
    const bounce = i => Math.round(Math.random()) ? i - 1 : i + 1;

    /**
     * Prints the current state of the board and the collector
     */
    const show = () => {
      readline.cursorTo(process.stdout, 0, 0);
      readline.clearScreenDown(process.stdout);
      board.forEach(e => console.log(e.join('')));
      result.reverse();
      result.forEach(e => console.log(e.join('')));
      result.reverse();
    };


    /**
     * Collect the result.
     * @param {number} idx
     */
    const appendToResult = idx => {
      const row = result.find(e => e[idx] === ' ');
      if (row) {
        row[idx] = ball;
      } else {
        const newRow = emptyRow();
        newRow[idx] = ball;
        result.push(newRow);
      }
    };

    /**
     * Move the balls through the board
     * @returns {boolean} True if the there are balls in the board.
     */
    const iter = () => {
      let hasNext = false;
      [...Array(bordSize)].forEach((e, i) => {
        const rowIdx = (bordSize - 1) - i;
        const idx = board[rowIdx].indexOf(ball);
        if (idx > -1) {
          board[rowIdx][idx] = ' ';
          const nextRowIdx = rowIdx + 1;
          if (nextRowIdx < bordSize) {
            hasNext = true;
            const nextRow = board[nextRowIdx];
            nextRow[bounce(idx)] = ball;
          } else {
            appendToResult(idx);
          }
        }
      });
      return hasNext;
    };

    /**
     * Add a ball to the board.
     * @returns {number} The number of balls left to add.
     */
    const addBall = () => {
      board[0][apex] = ball;
      balls = balls - 1;
      return balls;
    };

    board.unshift(emptyRow());
    result.unshift(emptyRow());

    const bordSize = board.length;
    const apex = board[1].indexOf(peg);

    /**
     * Run the animation
     */
    (async () => {
      while (addBall()) {
        await sleep(speed).then(show);
        iter();
      }
      await sleep(speed).then(show);
      while (iter()) {
        await sleep(speed).then(show);
      }
      await sleep(speed).then(show);
    })();


  };

  // galtonBox(10, 6);
})();

//------------------------------------------------------------------------------
// Rosetta Code: MD4
// http://rosettacode.org/wiki/MD4
(() => {
  const md4func = () => {

    const hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase    */
    const b64pad = ""; /* base-64 pad character. "=" for strict RFC compliance  */
    const chrsz = 8; /* bits per input character. 8 - ASCII; 16 - Unicode   */

    const tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";

    /**
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    const safe_add = (x, y) => {
      const lsw = (x & 0xFFFF) + (y & 0xFFFF);
      const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xFFFF);
    };

    /**
     * Bitwise rotate a 32-bit number to the left.
     */
    const rol = (num, cnt) => (num << cnt) | (num >>> (32 - cnt));

    /**
     * Convert a string to an array of little-endian words
     * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
     */
    const str2binl = str => {
      const bin = Array();
      const mask = (1 << chrsz) - 1;
      for (let i = 0; i < str.length * chrsz; i += chrsz)
        bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
      return bin;
    };

    /**
     * Convert an array of little-endian words to a string
     */
    const binl2str = bin => {
      let str = "";
      const mask = (1 << chrsz) - 1;
      for (let i = 0; i < bin.length * 32; i += chrsz)
        str += String.fromCharCode((bin[i >> 5] >>> (i % 32)) & mask);
      return str;
    };

    /**
     * Convert an array of little-endian words to a hex string.
     */
    const binl2hex = binarray => {
      let str = "";
      for (let i = 0; i < binarray.length * 4; i++) {
        str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
            hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
      }
      return str;
    };

    /**
     * Convert an array of little-endian words to a base-64 string
     */
    const binl2b64 = binarray => {
      let str = "";
      for (let i = 0; i < binarray.length * 4; i += 3) {
        const triplet = (((binarray[i >> 2] >> 8 * (i % 4)) & 0xFF) << 16)
            | (((binarray[i + 1 >> 2] >> 8 * ((i + 1) % 4)) & 0xFF) << 8)
            | ((binarray[i + 2 >> 2] >> 8 * ((i + 2) % 4)) & 0xFF);
        for (let j = 0; j < 4; j++) {
          if (i * 8 + j * 6 > binarray.length * 32) str += b64pad;
          else str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
        }
      }
      return str;
    };

    /**
     * These functions implement the basic operation for each round of the
     * algorithm.
     */
    const md4_cmn = (q, a, b, x, s, t) => safe_add(
        rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);

    const ff = (a, b, c, d, x, s) => md4_cmn(
        (b & c) | ((~b) & d), a, 0, x, s, 0);

    const gg = (a, b, c, d, x, s) => md4_cmn(
        (b & c) | (b & d) | (c & d), a, 0, x, s, 1518500249);

    const hh = (a, b, c, d, x, s) => md4_cmn(
        b ^ c ^ d, a, 0, x, s, 1859775393);


    /**
     * Calculate the MD4 of an array of little-endian words, and a bit length
     */
    const core_md4 = (x, len) => {

      x[len >> 5] |= 0x80 << (len % 32);
      x[(((len + 64) >>> 9) << 4) + 14] = len;
      let a = 1732584193;
      let b = -271733879;
      let c = -1732584194;
      let d = 271733878;

      for (let i = 0; i < x.length; i += 16) {

        const olda = a;
        const oldb = b;
        const oldc = c;
        const oldd = d;

        a = ff(a, b, c, d, x[i], 3);
        d = ff(d, a, b, c, x[i + 1], 7);
        c = ff(c, d, a, b, x[i + 2], 11);
        b = ff(b, c, d, a, x[i + 3], 19);
        a = ff(a, b, c, d, x[i + 4], 3);
        d = ff(d, a, b, c, x[i + 5], 7);
        c = ff(c, d, a, b, x[i + 6], 11);
        b = ff(b, c, d, a, x[i + 7], 19);
        a = ff(a, b, c, d, x[i + 8], 3);
        d = ff(d, a, b, c, x[i + 9], 7);
        c = ff(c, d, a, b, x[i + 10], 11);
        b = ff(b, c, d, a, x[i + 11], 19);
        a = ff(a, b, c, d, x[i + 12], 3);
        d = ff(d, a, b, c, x[i + 13], 7);
        c = ff(c, d, a, b, x[i + 14], 11);
        b = ff(b, c, d, a, x[i + 15], 19);

        a = gg(a, b, c, d, x[i], 3);
        d = gg(d, a, b, c, x[i + 4], 5);
        c = gg(c, d, a, b, x[i + 8], 9);
        b = gg(b, c, d, a, x[i + 12], 13);
        a = gg(a, b, c, d, x[i + 1], 3);
        d = gg(d, a, b, c, x[i + 5], 5);
        c = gg(c, d, a, b, x[i + 9], 9);
        b = gg(b, c, d, a, x[i + 13], 13);
        a = gg(a, b, c, d, x[i + 2], 3);
        d = gg(d, a, b, c, x[i + 6], 5);
        c = gg(c, d, a, b, x[i + 10], 9);
        b = gg(b, c, d, a, x[i + 14], 13);
        a = gg(a, b, c, d, x[i + 3], 3);
        d = gg(d, a, b, c, x[i + 7], 5);
        c = gg(c, d, a, b, x[i + 11], 9);
        b = gg(b, c, d, a, x[i + 15], 13);

        a = hh(a, b, c, d, x[i], 3);
        d = hh(d, a, b, c, x[i + 8], 9);
        c = hh(c, d, a, b, x[i + 4], 11);
        b = hh(b, c, d, a, x[i + 12], 15);
        a = hh(a, b, c, d, x[i + 2], 3);
        d = hh(d, a, b, c, x[i + 10], 9);
        c = hh(c, d, a, b, x[i + 6], 11);
        b = hh(b, c, d, a, x[i + 14], 15);
        a = hh(a, b, c, d, x[i + 1], 3);
        d = hh(d, a, b, c, x[i + 9], 9);
        c = hh(c, d, a, b, x[i + 5], 11);
        b = hh(b, c, d, a, x[i + 13], 15);
        a = hh(a, b, c, d, x[i + 3], 3);
        d = hh(d, a, b, c, x[i + 11], 9);
        c = hh(c, d, a, b, x[i + 7], 11);
        b = hh(b, c, d, a, x[i + 15], 15);

        a = safe_add(a, olda);
        b = safe_add(b, oldb);
        c = safe_add(c, oldc);
        d = safe_add(d, oldd);
      }

      return Array(a, b, c, d);

    };

    /**
     * Calculate the HMAC-MD4, of a key and some data
     */
    const core_hmac_md4 = (key, data) => {

      let bkey = str2binl(key);
      if (bkey.length > 16) {
        bkey = core_md4(bkey, key.length * chrsz)
      }

      const ipad = Array(16);
      const opad = Array(16);

      for (let i = 0; i < 16; i++) {
        ipad[i] = bkey[i] ^ 0x36363636;
        opad[i] = bkey[i] ^ 0x5C5C5C5C;
      }
      const hash = core_md4(
          ipad.concat(str2binl(data)), 512 + data.length * chrsz);

      return core_md4(opad.concat(hash), 512 + 128);
    };

    /**
     * These are the functions you'll usually want to call
     */
    return {
      hex_md4: s => binl2hex(core_md4(str2binl(s), s.length * chrsz)),
      b64_md4: s => binl2b64(core_md4(str2binl(s), s.length * chrsz)),
      str_md4: s => binl2str(core_md4(str2binl(s), s.length * chrsz)),
      hex_hmac_md4: (key, data) => binl2hex(core_hmac_md4(key, data)),
      b64_hmac_md4: (key, data) => binl2b64(core_hmac_md4(key, data)),
      str_hmac_md4: (key, data) => binl2str(core_hmac_md4(key, data)),
    };

  };

  const md4 = md4func();
  console.log(md4.hex_md4('Rosetta Code'));
})();


//------------------------------------------------------------------------------
// Rosetta Code: Execute a Markov algorithm
// http://rosettacode.org/wiki/Execute_a_Markov_algorithm
(() => {
  /**
   * Take a ruleset and return a function which takes a string to which the rules
   * should be applied.
   * @param {string} ruleSet
   * @returns {function(string): string}
   */
  const markov = ruleSet => {

    /**
     * Split a string at an index
     * @param {string} s The string to split
     * @param {number} i The index number where to split.
     * @returns {Array<string>}
     */
    const splitAt = (s, i) => [s.slice(0, i), s.slice(i)];

    /**
     * Strip a leading number of chars from a string.
     * @param {string} s The string to strip the chars from
     * @param {string} strip A string who's length will determine the number of
     *    chars to strip.
     * @returns {string}
     */
    const stripLeading = (s, strip) => s.split('')
        .filter((e, i) => i >= strip.length).join('');

    /**
     * Replace the substring in the string.
     * @param {string} s The string to replace the substring in
     * @param {string} find The sub-string to find
     * @param {string} rep The replacement string
     * @returns {string}
     */
    const replace = (s, find, rep) => {
      let result = s;
      if (s.indexOf(find) >= 0) {
        const a = splitAt(s, s.indexOf(find));
        result = [a[0], rep, stripLeading(a[1], find)].join('');
      }
      return result;
    };

    /**
     * Convert a ruleset string into a map
     * @param {string} ruleset
     * @returns {Map}
     */
    const makeRuleMap = ruleset => ruleset.split('\n')
        .filter(e => !e.startsWith('#'))
        .map(e => e.split(' -> '))
        .reduce((p, c) => p.set(c[0], c[1]), new Map());

    /**
     * Recursively apply the ruleset to the string.
     * @param {Map} rules The rules to apply
     * @param {string} s The string to apply the rules to
     * @returns {string}
     */
    const parse = (rules, s) => {
      const o = s;
      for (const [k, v] of rules.entries()) {
        if (v.startsWith('.')) {
          s = replace(s, k, stripLeading(v, '.'));
          break;
        } else {
          s = replace(s, k, v);
          if (s !== o) {
            break;
          }
        }
      }
      return o === s ? s : parse(rules, s);
    };

    const ruleMap = makeRuleMap(ruleSet);

    return str => parse(ruleMap, str)
  };


  const ruleset1 = `# This rules file is extracted from Wikipedia:
# http://en.wikipedia.org/wiki/Markov_Algorithm
A -> apple
B -> bag
S -> shop
T -> the
the shop -> my brother
a never used -> .terminating rule`;

  const ruleset2 = `# Slightly modified from the rules on Wikipedia
A -> apple
B -> bag
S -> .shop
T -> the
the shop -> my brother
a never used -> .terminating rule`;

  const ruleset3 = `# BNF Syntax testing rules
A -> apple
WWWW -> with
Bgage -> ->.*
B -> bag
->.* -> money
W -> WW
S -> .shop
T -> the
the shop -> my brother
a never used -> .terminating rule`;

  const ruleset4 = `### Unary Multiplication Engine, for testing Markov Algorithm implementations
### By Donal Fellows.
# Unary addition engine
_+1 -> _1+
1+1 -> 11+
# Pass for converting from the splitting of multiplication into ordinary
# addition
1! -> !1
,! -> !+
_! -> _
# Unary multiplication by duplicating left side, right side times
1*1 -> x,@y
1x -> xX
X, -> 1,1
X1 -> 1X
_x -> _X
,x -> ,X
y1 -> 1y
y_ -> _
# Next phase of applying
1@1 -> x,@y
1@_ -> @_
,@_ -> !_
++ -> +
# Termination cleanup for addition
_1 -> 1
1+_ -> 1
_+_ -> `;

  const ruleset5 = `# Turing machine: three-state busy beaver
#
# state A, symbol 0 => write 1, move right, new state B
A0 -> 1B
# state A, symbol 1 => write 1, move left, new state C
0A1 -> C01
1A1 -> C11
# state B, symbol 0 => write 1, move left, new state A
0B0 -> A01
1B0 -> A11
# state B, symbol 1 => write 1, move right, new state B
B1 -> 1B
# state C, symbol 0 => write 1, move left, new state B
0C0 -> B01
1C0 -> B11
# state C, symbol 1 => write 1, move left, halt
0C1 -> H01
1C1 -> H11`;

  console.log(markov(ruleset1)('I bought a B of As from T S.'));
  console.log(markov(ruleset2)('I bought a B of As from T S.'));
  console.log(markov(ruleset3)('I bought a B of As W my Bgage from T S.'));
  console.log(markov(ruleset4)('_1111*11111_'));
  console.log(markov(ruleset5)('000000A000000'));
})();


//------------------------------------------------------------------------------
// Rosetta Code: ABC Problem
// http://rosettacode.org/wiki/ABC_Problem

(() => {
  const removeAtIndex = (arr, idx) => arr.filter((e, i) => i !== idx);

  const snipFirst = str => [str[0], str.substring(1)];

  const isTrue = v => !!v;

  const remFromMap = (map, el) => [...map.entries()].reduce(
      (p, [k, v]) => p.set(k, removeAtIndex(v, v.indexOf(el))), new Map());

  const makeMap = (word, cards) => {
    const a = [...word];
    return cards.reduce((p, c) => {
      c.split('').forEach(e => {
        a.includes(e) && (p.has(e)
            ? p.set(e, [...p.get(e), c])
            : p.set(e, [c]));
      });
      return p;
    }, new Map());
  };

  const _abc = (word, map) => {
    const [w, ord] = snipFirst(word);
    const ok = w && map.has(w) && map.get(w).length > 0;
    return !ok
        ? false
        : (ord === ''
            ? true
            : isTrue(map.get(w).find(c => _abc(ord, remFromMap(map, c)))));
  };

  const abc = (word, cards) => _abc(word, makeMap(word, cards));

  // ----------------------------------------------------------[ Run Tests ]----

  const CARDS = `BO XK DQ CP NA GT RE TG QD FS 
    JW HU VI AN OB ER FS LY PC ZM`.split(' ');
  const TEST = ['', 'A', 'BARK', 'BoOK', 'TrEAT', 'COmMoN', 'SQUAD', 'conFUsE'];
  TEST.forEach(e => console.log(e, '->', abc(e.toUpperCase(), CARDS)));

  // ---------------------------------------------------------------------------
})();


//------------------------------------------------------------------------------
// Rosetta Code: Damm Algorithm
// http://rosettacode.org/wiki/Damm_algorithm

(() => {

      const table = [
        [0, 3, 1, 7, 5, 9, 8, 6, 4, 2],
        [7, 0, 9, 2, 1, 5, 4, 8, 6, 3],
        [4, 2, 0, 6, 8, 7, 1, 3, 5, 9],
        [1, 7, 5, 0, 9, 8, 3, 4, 2, 6],
        [6, 1, 2, 3, 0, 4, 5, 9, 7, 8],
        [3, 6, 7, 4, 2, 0, 9, 5, 8, 1],
        [5, 8, 6, 9, 7, 2, 0, 1, 3, 4],
        [8, 9, 4, 5, 3, 6, 2, 0, 1, 7],
        [9, 4, 3, 8, 6, 1, 7, 2, 0, 5],
        [2, 5, 8, 1, 4, 3, 6, 7, 9, 0],
      ];

      const lookup = (p, c) => table[p][parseInt(c, 10)]
      const damm = input => [...input].reduce(lookup, 0) === 0;

      // ----------------------------------------------------------[ Run Tests ]----
      const test = () => ["5724", "5727", "112946", "112949"].forEach(e =>
          console.log(`${e} => ${damm(e) ? 'Pass' : 'Fail'}`)
      );
      test();
      // ---------------------------------------------------------------------------
    }
)();
console.log('\n');


//------------------------------------------------------------------------------
// Rosetta Code: Nonoblock Algorithm
// http://rosettacode.org/wiki/Nonoblock
(() => {

  const compose = (...fn) => (...x) => fn.reduce((a, b) => c => a(b(c)))(...x);
  const inv = b => !b;
  const arrJoin = str => arr => arr.join(str);
  const mkArr = (l, f) => Array(l).fill(f);
  const sumArr = arr => arr.reduce((a, b) => a + b, 0);
  const sumsTo = val => arr => sumArr(arr) === val;
  const zipper = arr => (p, c, i) => arr[i] ? [...p, c, arr[i]] : [...p, c];
  const zip = (a, b) => a.reduce(zipper(b), []);
  const zipArr = arr => a => zip(a, arr);
  const hasInner = v => arr => arr.slice(1, -1).indexOf(v) >= 0;
  const toBin = f => arr => arr.reduce(
      (p, c, i) => [...p, ...mkArr(c, f(c, i))], []);


  const looper = (arr, max, acc = [[...arr]], idx = 0) => {
    if (idx !== arr.length) {
      const b = looper([...arr], max, acc, idx + 1)[0];
      if (b[idx] !== max) {
        b[idx] = b[idx] + 1;
        acc.push(looper([...b], max, acc, idx)[0]);
      }
    }
    return [arr, acc];
  };

  const gapPerms = (grpSize, numGaps, minVal = 0) => {
    const maxVal = numGaps - grpSize * minVal + minVal;
    return maxVal <= 0
        ? (grpSize === 2 ? [[0]] : [])
        : looper(mkArr(grpSize, minVal), maxVal)[1];
  }

  const test = (cells, ...blocks) => {
    const grpSize = blocks.length + 1;
    const numGaps = cells - sumArr(blocks);

    // Filter functions
    const sumsToTrg = sumsTo(numGaps);
    const noInnerZero = compose(inv, hasInner(0));

    // Output formatting
    const getChar = i => String.fromCharCode(65 + i);
    const combine = zipArr([...blocks]);
    const mkLine = (c, i) => i % 2 === 0 ? '_|' : `${getChar(i / 2)}|`
    const choices = toBin(mkLine);
    const prependPipe = s => `|${s}`;
    const expand = compose(combine);
    const output = compose(console.log, prependPipe, arrJoin(''), choices);

    console.log(`\n${cells} cells. Blocks: ${blocks}`);
    gapPerms(grpSize, numGaps)
        .filter(noInnerZero)
        .filter(sumsToTrg)
        .map(compose(output, expand));
  };

  test(5);
  test(5, 5);
  test(5, 6);
  test(5, 1, 1, 1);
  test(5, 2, 1);
  test(5, 2, 3);
  test(10, 8);
  test(10, 4, 3);
  test(15, 2, 3, 2, 3);


})();
console.log('\n');

(() => {
  const intToArr = (i, acc = []) => {
    const k = i / 10;
    const v = Math.round(k % 1 * 10);
    const r = Math.floor(k);
    return r > 0 ? intToArr(r, [v, ...acc]) : [v, ...acc];
  }

  console.log(intToArr(95322020));

})();
console.log('\n');


//------------------------------------------------------------------------------
// Rosetta Code: Next highest int from digits
// http://rosettacode.org/wiki/Next_highest_int_from_digits
(() => {

  const compose = (...fn) => (...x) => fn.reduce((a, b) => c => a(b(c)))(...x);
  const toString = x => x + '';
  const reverse = x => Array.from(x).reduce((p, c) => [c, ...p], []);
  const minBiggerThanN = (arr, n) => arr.filter(e => e > n).sort()[0];
  const remEl = (arr, e) => {
    const r = arr.indexOf(e);
    return arr.filter((e, i) => i !== r);
  }

  const nextHighest = itr => {
    const seen = [];
    let result = 0;
    for (const [i, v] of itr.entries()) {
      const n = +v;
      if (Math.max(n, ...seen) !== n) {
        const right = itr.slice(i + 1);
        const swap = minBiggerThanN(seen, n);
        const rem = remEl(seen, swap);
        const rest = [n, ...rem].sort();
        result = [...reverse(right), swap, ...rest].join('');
        break;
      } else {
        seen.push(n);
      }
    }
    return result;
  };

  const check = compose(nextHighest, reverse, toString);

  const test = v => {
    console.log(v, '=>', check(v));
  }

  test(0);
  test(9);
  test(12);
  test(21);
  test(12453);
  test(738440);
  test(45072010);
  test(95322020);
  test('9589776899767587796600');


})();

console.log('\n\n');

//------------------------------------------------------------------------------
// Rosetta Code: Determine if a string has all the same characters
// http://rosettacode.org/wiki/Determine_if_a_string_has_all_the_same_characters
(() => {

  const check = s => {
    const arr = [...s];
    const at = arr.findIndex(
        (v, i) => i === 0 ? false : v !== arr[i - 1]
    )
    const l = arr.length;
    const ok = at === -1;
    const p = ok ? "" : at + 1;
    const v = ok ? "" : arr[at];
    const vs = v === "" ? v : `"${v}"`
    const h = ok ? "" : `0x${v.charCodeAt(0).toString(16)}`;
    console.log(`"${s}" => Length:${l}\tSame:${ok}\tPos:${p}\tChar:${vs}\tHex:${h}`)
  }

  ['', '   ', '2', '333', '.55', 'tttTTT', '4444 444k',
    '🐶🐶🐺🐶', '🎄🎄🎄🎄'].forEach(check)

})();

console.log('\n\n');

//------------------------------------------------------------------------------
// Rosetta Code: Bioinformatics/Sequence mutation
// http://rosettacode.org/wiki/Bioinformatics/Sequence_mutation
(() => {
  // Basic set-up
  const numBases = 250
  const numMutations = 30
  const bases = ['A', 'C', 'G', 'T'];

  // Utility functions
  /**
   * Return a shallow copy of an array
   * @param {Array<*>} arr
   * @returns {*[]}
   */
  const copy = arr => [...arr];

  /**
   * Get a random int up to but excluding the the given number
   * @param {number} max
   * @returns {number}
   */
  const randTo = max => (Math.random() * max) | 0;

  /**
   * Given an array return a random element and the indeg of that element from
   * the array.
   * @param {Array<*>} arr
   * @returns {[*[], number]}
   */
  const randSelect = arr => {
    const at = randTo(arr.length);
    return [arr[at], at];
  };

  /**
   * Given a number or string, return a left padded string
   * @param {string|number} v
   * @returns {string}
   */
  const pad = v => ('' + v).padStart(4, ' ');

  /**
   * Count the number of elements that match the given value in an array
   * @param {Array<string>} arr
   * @returns {function(string): number}
   */
  const filterCount = arr => s => arr.filter(e => e === s).length;

  /**
   * Utility logging function
   * @param {string|number} v
   * @param {string|number} n
   */
  const print = (v, n) => console.log(`${pad(v)}:\t${n}`)

  /**
   * Utility function to randomly select a new base, and an index in the given
   * sequence.
   * @param {Array<string>} seq
   * @param {Array<string>} bases
   * @returns {[string, string, number]}
   */
  const getVars = (seq, bases) => {
    const [newBase, _] = randSelect(bases);
    const [extBase, randPos] = randSelect(seq);
    return [newBase, extBase, randPos];
  };

  // Bias the operations
  /**
   * Given a map of function to ratio, return an array of those functions
   * appearing ratio number of times in the array.
   * @param weightMap
   * @returns {Array<function>}
   */
  const weightedOps = weightMap => {
    return [...weightMap.entries()].reduce((p, [op, weight]) =>
        [...p, ...(Array(weight).fill(op))], []);
  };

  // Pretty Print functions
  const prettyPrint = seq => {
    let idx = 0;
    const rem = seq.reduce((p, c) => {
      const s = p + c;
      if (s.length === 50) {
        print(idx, s);
        idx = idx + 50;
        return '';
      }
      return s;
    }, '');
    if (rem !== '') {
      print(idx, rem);
    }
  }

  const printBases = seq => {
    const filterSeq = filterCount(seq);
    let tot = 0;
    [...bases].forEach(e => {
      const cnt = filterSeq(e);
      print(e, cnt);
      tot = tot + cnt;
    })
    print('Σ', tot);
  }

  // Mutation definitions
  const swap = ([hist, seq]) => {
    const arr = copy(seq);
    const [newBase, extBase, randPos] = getVars(arr, bases);
    arr.splice(randPos, 1, newBase);
    return [[...hist, `Swapped ${extBase} for ${newBase} at ${randPos}`], arr];
  };

  const del = ([hist, seq]) => {
    const arr = copy(seq);
    const [newBase, extBase, randPos] = getVars(arr, bases);
    arr.splice(randPos, 1);
    return [[...hist, `Deleted ${extBase} at ${randPos}`], arr];
  }

  const insert = ([hist, seq]) => {
    const arr = copy(seq);
    const [newBase, extBase, randPos] = getVars(arr, bases);
    arr.splice(randPos, 0, newBase);
    return [[...hist, `Inserted ${newBase} at ${randPos}`], arr];
  }

  // Create the starting sequence
  const seq = Array(numBases).fill(undefined).map(
      () => randSelect(bases)[0]);

  // Create a weighted set of mutations
  const weightMap = new Map()
      .set(swap, 1)
      .set(del, 1)
      .set(insert, 1);
  const operations = weightedOps(weightMap);
  const mutations = Array(numMutations).fill(undefined).map(
      () => randSelect(operations)[0]);

  // Mutate the sequence
  const [hist, mut] = mutations.reduce((p, c) => c(p), [[], seq]);

  console.log('ORIGINAL SEQUENCE:')
  prettyPrint(seq);

  console.log('\nBASE COUNTS:')
  printBases(seq);

  console.log('\nMUTATION LOG:')
  hist.forEach((e, i) => console.log(`${i}:\t${e}`));

  console.log('\nMUTATED SEQUENCE:')
  prettyPrint(mut);

  console.log('\nMUTATED BASE COUNTS:')
  printBases(mut);

})()

console.log('\n\n');


//------------------------------------------------------------------------------
// Rosetta Code: Bioinformatics/base count
// http://rosettacode.org/wiki/Bioinformatics/base_count
(() => {
  const rowLength = 50;

  /**
   * Convert the given array into an array of smaller arrays each with the length
   * given by n.
   * @param {number} n
   * @returns {function(!Array<*>): !Array<!Array<*>>}
   */
  const chunk = n => a => a.reduce(
      (p, c, i) => (!(i % n)) ? p.push([c]) && p : p[p.length - 1].push(c) && p,
      []);
  const toRows = chunk(rowLength);

  /**
   * Given a number, return function that takes a string and left pads it to n
   * @param {number} n
   * @returns {function(string): string}
   */
  const padTo = n => v => ('' + v).padStart(n, ' ');
  const pad = padTo(5);

  /**
   * Count the number of elements that match the given value in an array
   * @param {Array<string>} arr
   * @returns {function(string): number}
   */
  const countIn = arr => s => arr.filter(e => e === s).length;

  /**
   * Utility logging function
   * @param {string|number} v
   * @param {string|number} n
   */
  const print = (v, n) => console.log(`${pad(v)}:\t${n}`)


// Pretty Print functions
  const prettyPrint = seq => {
    const chunks = toRows(seq);
    chunks.forEach((e, i) => print(i * rowLength, e.join('')))
  }

  const printBases = (seq, bases) => {
    const filterSeq = countIn(seq);
    const counts = bases.map(filterSeq);
    const total = counts.reduce((p,c) => p + c, 0);
    counts.forEach((e, i) => print(bases[i], e));
    print('Total', total);
  }

  const bases = ['A', 'C', 'G', 'T'];

// Create the starting sequence
  const seq = `CGTAAAAAATTACAACGTCCTTTGGCTATCTCTTAAACTCCTGCTAAATG
CTCGTGCTTTCCAATTATGTAAGCGTTCCGAGACGGGGTGGTCGATTCTG
AGGACAAAGGTCAAGATGGAGCGCATCGAACGCAATAAGGATCATTTGAT
GGGACGTTTCGTCGACAAAGTCTTGTTTCGAGAGTAACGGCTACCGTCTT
CGATTCTGCTTATAACACTATGTTCTTATGAAATGGATGTTCTGAGTTGG
TCAGTCCCAATGTGCGGGGTTTCTTTTAGTACGTCGGGAGTGGTATTATA
TTTAATTTTTCTATATAGCGATCTGTATTTAAGCAATTCATTTAGGTTAT
CGCCGCGATGCTCGGTTCGGACCGCCAAGCATCTGGCTCCACTGCTAGTG
TCCTAAATTTGAATGGCAAACACAAATAAGATTTAGCAATTCGTGTAGAC
GACCGGGGACTTGCATGATGGGAGCAGCTTTGTTAAACTACGAACGTAAT`
      .split('')
      .filter(e => bases.includes(e))

  console.log('SEQUENCE:')
  prettyPrint(seq);

  console.log('\nBASE COUNTS:')
  printBases(seq, bases);

})()


console.log('\n\n');


//------------------------------------------------------------------------------
// Rosetta Code: Canonicalize CIDR
// http://rosettacode.org/wiki/Canonicalize_CIDR
(() => {

  const chunk = (p, c, i) => (!(i % 8)) ? p.push([c]) && p : p[p.length - 1].push(c) && p;
  const intToBinStr = i => (i).toString(2).padStart(8, 0);
  const binStrToInt = s => parseInt(s, 2);
  const decStrToInt = s => parseInt(s, 10);
  const concat = (a, b) => a.concat(b);
  const replace = v => (e, i) => i < v ? e : 0;
  const join = s => a => a.join(s);
  const maybePad = arr => (v, i) => arr[i] ? arr[i] : 0;

  const canonicalize = str => {
    const [a, c] = str.split('/');
    const cidr = decStrToInt(c || '32');
    const arr = a.split('.');
    return Array(4).fill(0)
        .map(maybePad(arr))
        .map(decStrToInt)
        .map(intToBinStr)
        .reduce(concat).split('')
        .map(decStrToInt)
        .map(replace(cidr))
        .reduce(chunk, [])
        .map(join(''))
        .map(binStrToInt).join('.') + `/${cidr}`;
  }

// Test output
  const test = s => console.log(s, '->', canonicalize(s));
  [
    '87.70.141.1/22',
    '36.18.154.103/12',
    '62.62.197.11/29',
    '67.137.119.181/4',
    '161.214.74.21/24',
    '184.232.176.184/18',
    '10.207.219.251/32',
    '10.207.219.251',
    '110.200.21/4',
    '10..55/8',
    '10.../8'
  ].forEach(test);

})();

(() => {
  const canonicalize = s => {

    // Prepare a DataView over a 16 Byte Array buffer.
    // Initialised to all zeros.
    const dv = new DataView(new ArrayBuffer(16));

    // Get the ip-address and cidr components
    const [ip, cidr] = s.split('/');

    // Make sure the cidr component is a usable int, and
    // default to 32 if it does not exist.
    const cidrInt = parseInt(cidr || 32, 10);

    // Populate the buffer with uint8 ip address components.
    // Use zero as the default for shorthand pool definitions.
    ip.split('.').forEach(
        (e, i) => dv.setUint8(i, parseInt(e || 0, 10))
    );

    // Grab the whole buffer as a uint32
    const ipAsInt = dv.getUint32(0);

    // Zero out the lower bits as per the CIDR number.
    const normIpInt = (ipAsInt >> 32 - cidrInt) << 32 - cidrInt;

    // Plonk it back into the buffer
    dv.setUint32(0, normIpInt);

    // Read each of the uint8 slots in the buffer and join them with a dot.
    const canonIp = [...'0123'].map((e, i) => dv.getUint8(i)).join('.');

    // Attach the cidr number to the back of the normalised IP address.
    return [canonIp, cidrInt].join('/');
  }

  const test = s => console.log(s, '->', canonicalize(s));
  [
    '255.255.255.255/10',
    '87.70.141.1/22',
    '36.18.154.103/12',
    '62.62.197.11/29',
    '67.137.119.181/4',
    '161.214.74.21/24',
    '184.232.176.184/18',
    '10.207.219.251/32',
    '10.207.219.251',
    '110.200.21/4',
    '10..55/8',
    '10.../8'
  ].forEach(test)
})();

console.log('\n\n');


//------------------------------------------------------------------------------
// Rosetta Code: Calendar
// http://rosettacode.org/wiki/Calendar
(() => {
  /**
   * Given a width, return a function that takes a string, and
   * pads it at both ends to the given width
   * @param {number} width
   * @returns {function(string): string}
   */
  const printCenter = width =>
      s => s.padStart(width / 2 + s.length / 2, ' ').padEnd(width);

  /**
   * Given an locale string and options, return a function that takes a date
   * object, and retrurns the date formatted to the locale and options.
   * @param {string} locale
   * @param {DateTimeFormatOptions} options
   * @returns {function(Date): string}
   */
  const localeName = (locale, options) => {
    const formatter = new Intl.DateTimeFormat(locale, options);
    return date => formatter.format(date);
  };

  /**
   * Increment the date by number.
   * @param {Date} date
   * @param {number} inc
   * @returns {Date}
   */
  const addDay = (date, inc = 1) => {
    const res = new Date(date.valueOf());
    res.setDate(date.getDate() + inc);
    return res;
  }

  /**
   * Given a date, build a string of the week, and return it along with
   * the mutated date object.
   * @param {Date} date
   * @returns {[boolean, Date, string]}
   */
  const makeWeek = date => {
    const month = date.getMonth();
    let [wdi, md, m] = [date.getUTCDay(), date.getDate(), date.getMonth()];
    const line = Array(7).fill('  ').map((e, i) => {
      if (i === wdi && m === month) {
        const result = (md + '').padStart(2, ' ');
        date = addDay(date);
        [wdi, md, m] = [date.getUTCDay(), date.getDate(), date.getMonth()];
        return result;
      } else {
        return e;
      }
    }).join(' ');
    return [month !== m, date, line];
  }

  /**
   * Print a nicely formatted calender for the given year in the given locale.
   * @param {number} year The required year of the calender
   * @param {string} locale The locale string. Defaults to US English.
   * @param {number} cols The number of columns for the months. Defaults to 3.
   * @param {number} coll_space The space between the columns. Defaults to 5.
   */
  const cal = (year, locale = 'en-US', cols = 3, coll_space = 5) => {
    const MONTH_LINES = 9;  // Number of lines that make up a month.
    const MONTH_COL_WIDTH = 20;  // Character width of a month
    const COL_SPACE = ' '.padStart(coll_space);
    const FULL_WIDTH = MONTH_COL_WIDTH * cols + coll_space * (cols - 1);

    const collArr = Array(cols).fill('');
    const monthName = localeName(locale, {month: 'long'});
    const weekDayShort = localeName(locale, {weekday: 'short'});
    const monthCenter = printCenter(MONTH_COL_WIDTH);
    const pageCenter = printCenter(FULL_WIDTH);

    // Get the weekday in the given locale.
    const sun = new Date(Date.UTC(2017, 0, 1)); // A sunday
    const weekdays = Array(7).fill('').map((e, i) =>
        weekDayShort(addDay(sun, i)).padStart(2, ' ').substring(0, 2)).join(' ');

    // The start date.
    let date = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
    let nextMonth = true;
    let line = '';
    const fullYear = date.getUTCFullYear();

    // The array into which each of the lines are populated.
    const accumulate = [];

    // Populate the month table heading and columns.
    const preAmble = date => {
      accumulate.push(monthCenter(' '))
      accumulate.push(monthCenter(monthName(date)));
      accumulate.push(weekdays);
    };

    // Accumulate the week lines for the year.
    while (date.getUTCFullYear() === fullYear) {
      if (nextMonth) {
        if (accumulate.length % MONTH_LINES !== 0) {
          accumulate.push(monthCenter(' '))
        }
        preAmble(date);
      }
      [nextMonth, date, line] = makeWeek(date);
      accumulate.push(line);
    }

    // Print the calendar.
    console.log(pageCenter(String.fromCodePoint(0x1F436)));
    console.log(pageCenter(`--- ${fullYear} ---`));
    accumulate.reduce((p, e, i) => {
      if (!p.includes(i)) {
        const indexes = collArr.map((e, ci) => i + ci * MONTH_LINES);
        console.log(indexes.map(e => accumulate[e]).join(COL_SPACE));
        p.push(...indexes);
      }
      return p;
    }, []);
  };

  cal(1969, 'en-US', 3);
})()


console.log('\n\n');


//------------------------------------------------------------------------------
// Rosetta Code: ASCII art diagram converter
// http://rosettacode.org/wiki/ASCII_art_diagram_converter
(() => {
  // ------------------------------------------------------------[ Boilerplate ]--
  const trimWhitespace = s => s.trim();
  const isNotEmpty = s => s !== '';
  const stringLength = s => s.length;
  const hexToBin4 = s => parseInt(s, 16).toString(2).padStart(4, '0');
  const concatHexToBin = (binStr, hexStr) => binStr.concat('', hexToBin4(hexStr));
  const alignRight = n => s => `${s}`.padStart(n, ' ');
  const alignLeft = n => s => `${s}`.padEnd(n, ' ');
  const repeatChar = c => n => c.padStart(n, c);
  const joinWith = c => arr => arr.join(c);
  const joinNl = joinWith('\n');
  const joinSp = joinWith(' ');

  const printDiagramInfo = map => {
    const pName = alignLeft(8);
    const p5 = alignRight(5);
    const line = repeatChar('-');
    const res = [];
    res.push(joinSp([pName('Name'), p5('Size'), p5('Start'), p5('End')]));
    res.push(joinSp([line(8), line(5), line(5), line(5)]));
    [...map.values()].forEach(({label, bitLength, start, end}) => {
      res.push(joinSp([pName(label), p5(bitLength), p5(start), p5(end)]));
    })
    return res;
  }

// -------------------------------------------------------------------[ Main ]--
  const parseDiagram = dia => {

    const arr = dia.split('\n').map(trimWhitespace).filter(isNotEmpty);

    const hLine = arr[0];
    const bitTokens = hLine.split('+').map(trimWhitespace).filter(isNotEmpty);
    const bitWidth = bitTokens.length;
    const bitTokenWidth = bitTokens[0].length;

    const fields = arr.filter(e => e !== hLine);
    const allFields = fields.reduce((p, c) => [...p, ...c.split('|')], [])
        .filter(isNotEmpty);

    const lookupMap = Array(bitWidth).fill('').reduce((p, c, i) => {
      const v = i + 1;
      const stringWidth = (v * bitTokenWidth) + (v - 1);
      p.set(stringWidth, v);
      return p;
    }, new Map())

    const fieldMetaMap = allFields.reduce((p, e, i) => {
      const bitLength = lookupMap.get(e.length);
      const label = trimWhitespace(e);
      const start = i ? p.get(i - 1).end + 1 : 0;
      const end = start - 1 + bitLength;
      p.set(i, {label, bitLength, start, end})
      return p;
    }, new Map());

    const pName = alignLeft(8);
    const pBit = alignRight(5);
    const pPat = alignRight(18);
    const line = repeatChar('-');
    const nl = '\n';
    return hexStr => {
      const binString = [...hexStr].reduce(concatHexToBin, '');

      const res = printDiagramInfo(fieldMetaMap);
      res.unshift(joinNl(['Diagram:', ...arr, nl]));
      res.push(joinNl([nl, 'Test string in hex:', hexStr]));
      res.push(joinNl(['Test string in binary:', binString, nl]));
      res.push(joinSp([pName('Name'), pBit('Size'), pPat('Pattern')]));
      res.push(joinSp([line(8), line(5), line(18)]));

      [...fieldMetaMap.values()].forEach(({label, bitLength, start, end}) => {
        res.push(joinSp(
            [pName(label), pBit(bitLength),
              pPat(binString.substr(start, bitLength))]))
      })
      return joinNl(res);
    }
  }

// --------------------------------------------------------------[ Run tests ]--

  const dia = `
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                      ID                       |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |QR|   Opcode  |AA|TC|RD|RA|   Z    |   RCODE   |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                    QDCOUNT                    |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                    ANCOUNT                    |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                    NSCOUNT                    |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    |                    ARCOUNT                    |
    +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    `;

  const parser = parseDiagram(dia);

  console.log(parser('78477bbf5496e12e1bf169a4'));

})();

console.log('\n\n');


//------------------------------------------------------------------------------
// Rosetta Code: First-class functions/Use numbers analogously
// http://rosettacode.org/wiki/First-class_functions/Use_numbers_analogously
(() => {
  const x = 2.0;
  const xi = 0.5;
  const y = 4.0;
  const yi = 0.25;
  const z = x + y;
  const zi = 1.0 / (x + y);
  const pairs = [[x, xi], [y, yi], [z, zi]];
  const testVal = 0.5;

  const multiplier = (a, b) => m => a * b * m;

  const test = () => {
    return pairs.map(([a, b], i) => {
      const f = multiplier(a, b);
      const result = f(testVal);
      return `${a} * ${b} * ${testVal} = ${result}`;
    });
  }

  console.log(test().join('\n'));
})();


console.log('\n\n');


//------------------------------------------------------------------------------
// Rosetta Code: Elementary cellular automaton
// http://rosettacode.org/wiki/Elementary_cellular_automaton
(() => {
  const alive = '#';
  const dead = '.';

  // ----------------------------------------------------------[ Bit banging ]--
  const setBitAt = (val, idx) => BigInt(val) | (1n << BigInt(idx));
  const clearBitAt = (val, idx) => BigInt(val) & ~(1n << BigInt(idx));
  const getBitAt = val => idx => (BigInt(val) >> BigInt(idx)) & 1n;
  const hasBitAt = val => idx => ((BigInt(val) >> BigInt(idx)) & 1n) === 1n;

  // --------------------------------------------------------------[ Utility ]--
  const makeArr = n => Array(n).fill(0);
  const reverse = x => Array.from(x).reduce((p, c) => [c, ...p], []);
  const numToLine = width => int => {
    const test = hasBitAt(int);
    const looper = makeArr(width);
    return reverse(looper.map((_, i) => test(i) ? alive : dead)).join('');
  }

  // -----------------------------------------------------------------[ Main ]--
  const displayCA = (rule, width, lines, startIndex) => {
    const result = [`Rule:${rule} Width:${width} Gen:${lines}\n`];
    const ruleTest = hasBitAt(rule);
    const lineLoop = makeArr(lines);
    const looper = makeArr(width);
    const pLine = numToLine(width);

    let nTarget = setBitAt(0n, startIndex);
    result.push(pLine(nTarget));
    lineLoop.forEach(() => {
      const bitTest = getBitAt(nTarget);
      looper.forEach((e, i) => {
        const l = bitTest(i === 0 ? width - 1 : i - 1);
        const m = bitTest(i);
        const r = bitTest(i === width - 1 ? 0 : i + 1);
        nTarget = ruleTest(
            parseInt([l, m, r].join(''), 2))
            ? setBitAt(nTarget, i)
            : clearBitAt(nTarget, i);
      });
      result.push(pLine(nTarget));
    });
    return result.join('\n');
  }

  console.log(displayCA(225, 57, 31, 28));
})();










