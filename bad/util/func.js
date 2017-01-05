/**
 * A variadic compose that accepts any number of pure functions and composes
 * them together.
 * @type {function(...function(?):?): !function(?):?}
 */
const compose = (...fns) => (...x) => fns.reduce((a, b) => c => a(b(c)))(...x);


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
 * @param {*} n
 * @return {function(*): !boolean}
 */
const isDivisibleBy = n => x => x % n === 0 && isNumber(x);


const logInline = (tag, x) => {
  console.log(tag, x);
  return x;
};


const trace = t => partial(logInline, t);


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
 * @type {function(!Array<*>|!string): *}
 */
const head = x => x[0];


/**
 * Reverse either an array or a string
 * @type {function(!Array<*>|!string): !Array<*>}
 */
const reverse = x => {
  let y = x.split ? x.split('') : x;
  return y.reduce((p, c) => [c].concat(p), [])
};


/**
 * @type {function(function(*, !number, !Array) : *) : function(!Array<*>): ?}
 */
const map = func => x => x.map(func);


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
 * /**
 * @type {function(!string): !string}
 */
const shout = compose(partial(append, '!'), toUpperCase);


/**
 * @type {function(!Array<*>): *}
 */
const tail = compose(head, reverse);


/**
 * @type {function(!Array<!string>): !string}
 */
const lastUpper = compose(toUpperCase, tail);


/**
 * @type {function(!Array<!string>): !string}
 */
const loudLastUpper = compose(shout, lastUpper);


/**
 * @type {function(!string): !string}
 */
const snakeCase = compose(replace(/\s+/ig, '_'), toLowerCase);


/**
 * @type {function(*): !string}
 */
const anyToLowerCase = compose(toLowerCase, toString);

/**
 * create a generator function returning an
 * iterator to a specified range of numbers
 * @param {!number} b Begin here - First element in array
 * @param {!number} e End here - Last element in array
 * @param {!number} s Step this size
 */
function* rangeGen(b, e, s=1) {
  for (let i = b; i <= e; i += s) {
    yield i;
  }
}
const rangeArr = (b, e, s) => [...(rangeGen(b, e, s))];
console.log(rangeArr(0,9));


/**
 * @type {function(!string): !string}
 */
const initials = compose(join('. '), map(compose(toUpperCase, head)),
  split(' '));


console.log(loudLastUpper(['jumpkick', 'roundhouse', 'uppercut']));
console.log(loudLastUpper('uppercut'));
console.log(snakeCase('snake Case'));
console.log(initials("hunter stockton thompson"));
console.log(toLowerCase('BLAH'));
console.log(anyToLowerCase(null));
console.log(head('HEllo'));
console.log(tail('HEllo'));
console.log(repeat(NaN, 10));

const stringReverse = compose(join(''), reverse);
const numReverse = compose(toNumber, join(''), trace('---->>>>'), reverse,
  toString);

console.log(numReverse(123.34));


// -----------------------------------------------------------------------------
// Rosetta code: Luhn_test_of_credit_card_numbers
// http://rosettacode.org/wiki/Luhn_test_of_credit_card_numbers
// FizzBuzz - 1
const dividesBy3 = isDivisibleBy(3);
const dividesBy5 = isDivisibleBy(5);
const dividesBy15 = isDivisibleBy(15);
const f = n => dividesBy3(n) ? 'Fizz' : n;
const b = n => dividesBy5(n) ? 'Buzz' : n;
const fb = n => dividesBy15(n) ? 'FizzBuzz' : n;
const c = compose(f, b, fb);
rangeArr(1, 100).forEach(e => console.log(c(e)));


// -----------------------------------------------------------------------------
// Rosetta code: Luhn_test_of_credit_card_numbers
// http://rosettacode.org/wiki/Luhn_test_of_credit_card_numbers

// Try: 1
const luhn = n => {
  let evens = a => a.filter((e, i) => !((i + 1) % 2));
  let odds = a => a.filter((e, i) => !!((i + 1) % 2));
  let sum = (p, c) => Number(p) + Number(c);
  let rN = n => n.toString().split('').reduce(sum, 0);
  let sumArr = a => a.reduce(sum, 0);
  let timesN = n => x => x * n;
  let s1 = compose(sumArr, odds, map(Number), reverse, toString);
  let s2 = compose(sumArr, map(rN), map(timesN(2)), evens, map(Number),
    reverse, toString);
  return !((s1(n) + s2(n)) % 10)
};


// Try: 2
const luhn2 = n => {
  let result = n.toString().split('').reverse().reduce((p, e, i) => {
    let n = Number(e);
    return p += (!(i % 2)) ?
      n :
      (n * 2).toString().split('').reduce((a, b) => Number(a) + Number(b), 0);
  }, 0);
  return !(result % 10);
};

console.log([
  49927398716,
  49927398717,
  1234567812345678,
  1234567812345670].map(luhn));


// -----------------------------------------------------------------------------
// Rosetta code: 2-points
// http://rosettacode.org/wiki/Circles_of_given_radius_through_two_points
// point is given as [x, y]

const hDist = (p1, p2) => Math.hypot(...p1.map((e, i) => e - p2[i])) / 2;
const pAng = (p1, p2) => Math.atan(p1.map((e, i) => e - p2[i]).reduce((p, c) => c / p, 1));
const solveF = (p, r) => t => [r*Math.cos(t) + p[0], r*Math.sin(t) + p[1]];
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
      }
      else {
        let theta = pAng(p1, p2);
        let theta2 = Math.acos(halfDist / s);
        [1, -1].map(e => solve(theta + e * theta2)).forEach(
          e => msg += `Circle at ${e} `);
      }
      break;
    case -1:
      msg += 'No intersection. Points further apart than circle diameter';
      break;
  }
  return msg;
};

[
  [[0.1234, 0.9876], [0.8765, 0.2345], 2.0],
  [[0.0000, 2.0000], [0.0000, 0.0000], 1.0],
  [[0.1234, 0.9876], [0.1234, 0.9876], 2.0],
  [[0.1234, 0.9876], [0.8765, 0.2345], 0.5],
  [[0.1234, 0.9876], [0.1234, 0.9876], 0.0]
].forEach((t,i) => console.log(`Test: ${i}: ${findC(...t)}`));


// -----------------------------------------------------------------------------
// Rosetta code: Topological sort
// http://rosettacode.org/wiki/Topological_sort

const topoSort = input => {
  // A map of the input data, with the keys as the packages, and the values as
  // and array of packages on which it depends.
  const D = input
    .split('\n')
    .map(e => e.split(' ').filter(e => e != ''))
    .reduce(
      (p, c) => p.set(c[0], c.filter((e, i) => i > 0 && e !== c[0] ? e : null)),
      new Map());
  [].concat(...D.values()).forEach(e => {
     D.set(e, D.get(e) || [])
  });

  // The above map rotated so that it represents a DAG of the form
  // Map {
  //    A => [ A, B, C],
  //    B => [C],
  //    C => []
  // }
  // where each key represents a node, and the array contains the edges.
  const G = [...D.keys()].reduce(
    (p, c) => p.set(c, [...D.keys()].filter(e => D.get(e).includes(c))),
    new Map()
  );

  // An array of leaf nodes; nodes with 0 in degrees.
  const Q = [...D.keys()].filter(e => D.get(e).length == 0);

  // The result array.
  const S = [];
  while (Q.length) {
    const u = Q.pop();
    S.push(u);
    G.get(u).forEach(v => {
      D.set(v, D.get(v).filter(e => e !== u));
      if (D.get(v).length == 0) {
        Q.push(v);
      }
    });
  }
  return S;
};

console.log('Solution:', topoSort(
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


// -----------------------------------------------------------------------------
// Rosetta code: Sudoku
// http://rosettacode.org/wiki/Sudoku


// sudoku puzzle representation is an 81 character string
let puzzle = `
394  267 
   3  4  
5  69  2 
 45   9  
6       7
  7   58 
 1  67  8
  9  8   
 264  735`;

let input = `
3 9 4 |     2 | 6 7  
      | 3     | 4    
5     | 6 9   |   2  
------+-------+------
  4 5 |       | 9    
6     |       |     7
    7 |       | 5 8  
------+-------+------
  1   |   6 7 |     8
    9 |     8 |      
  2 6 | 4     | 7 3 5
`;



// print grid (with title) from 81 character string
const printGrid = function(title, puzzle) {
  console.log(title);
  let arr = rangeArr(0, 8);
  let s = puzzle.split('\n').join('');
  arr.forEach(r => {
    const i = r * 9;
    console.log(arr.reduce(
      (p, c) => `${p}${[3,6].includes(c) ? '| ' : ''}${s[i + c]} `, ''));
    [2,5].includes(r) ? console.log('------+-------+------') : '';
  });

};

printGrid('Testme:', puzzle);


class DLLNode {
  constructor(value, prev=null, next=null) {
    this.value_ = value;
    this.next_ = null;
    this.prev_ = null;
    this.disconnected_ = false;

    if (prev) {
      this.prev = prev;
    }

    if (next) {
      this.next = next;
    }
  }

  set value(v) {
    this.value_ = v;
  }

  get value() {
    return this.value_;
  }

  set next(next) {
    this.next_ = next;
    const oldPrev = next.prev;
    if (next.prev !== this) {
      next.prev_ = this;
    }
    if (oldPrev) {
      oldPrev.next_ = this;
    }
  }

  get next() {
    return this.disconnected_ ? null : this.next_;
  }

  set prev(prev) {
    this.prev_ = prev;
    const oldNext = prev.next;
    if (prev.next !== this) {
      prev.next_ = this;
    }
    if (oldNext) {
      oldNext.prev_ = this;
    }
  }

  get prev() {
    return this.disconnected_ ? null : this.prev_;
  }

  get disconnected() {
    return this.disconnected_;
  }

  set disconnected(bool) {
    bool ? this.disconnect() : this.reconnect();
  }

  disconnect() {
    if (!this.disconnected_) {
      this.disconnected_ = true;
      this.prev_.next_ = this.next_;
      this.next_.prev_ = this.prev_;
    }
  }

  reconnect() {
    if (this.disconnected_) {
      this.disconnected_ = false;
      this.prev.next_ = this;
      this.next.prev_ = this;
    }
  }

  get first() {
    let r = this;
    let circular = false;
    while (!circular && r.prev) {
      [circular, r] = [r.prev === this, r.prev];
    }
    return r;
  }

  get last() {
    let r = this;
    let circular = false;
    while (!circular && r.next) {
      [circular, r] = [r.next === this, r.next];
    }
    return r;
  }

  _nodes() {
    let l = [this.first];
    let circular = false;

    let n = this.first.next;
    while (!circular && n) {
      l.push(n);
      [circular, n] = [n.next === this, n.next];
    }
    return [circular, l];
  }

  get circular() {
    return this._nodes()[0];
  }

  get nodes() {
    return this._nodes()[1];
  }

  get values() {
    return this.nodes.map(e => e.value_);
  }

  get length() {
    return this.nodes.length;
  }
}

const makeDLL = (...a) => a.reduce((p, c) => new DLLNode(c, p), null).nodes;

const nl = makeDLL(11,22,33,44,55,66,77);

var n1 = new DLLNode(value=1);
console.log(n1.values(), n1.length());


var n2 =  new DLLNode(value=2, prev=n1);
console.log(n1.values(), n1.length());

var n3 =  new DLLNode(value=3, prev=n2);
console.log(n1.values(), n1.length());

var n4 =  new DLLNode(value=4, prev=n3);
console.log(n1.values(), n1.length());

var n5 = new DLLNode(value=5, prev=n4, next=n1);
console.log(n1.values(), n1.length());

n3.disconnect();
console.log(n1.values(), n1.length());

console.log('------------>>>', n3.values(), n3.length());

n3.reconnect();
console.log(n1.values(), n1.length());

console.log('------------>>>', n3.values(), n3.length());

n3.disconnected = true;
console.log('------------>>>', n3.values(), n3.length());

n3.disconnected = false;
console.log('------------>>>', n3.values(), n3.length());

n3.disconnected = false;
console.log('------------>>>', n3.values(), n3.length());
















//const irPersToUnitPerYear = i => i / 100 / 12;
//
//function CalculateLoanAmt(
//  cashPrice=243047,
//  extras=5253,
//  deposit=50000,
//  initFee=0,
//  interestPerc=11.25,
//  term=71,
//  balloonPerc=30) {
//
//  // Principal Debt:
//  const princeDebt = (cashPrice + extras) - (deposit + initFee);
//  console.log('\n\nPRINCIPLE DEBT: ', princeDebt);
//  console.log('TOTAL FINANCE CHARGES: ', 98117.84, '   <<-- How is this calculated?');
//
//
//
//  // INTEREST RATE
//  let intPerUnitPerMonth = irPersToUnitPerYear(interestPerc); // Intrest per unit per month.
//  let pow = rangeArr(0, term - 1).reduce(p => p * (1 + intPerUnitPerMonth), 1);
//
//  // TOTAL LOAN
//  let amountLoaned = deposit < cashPrice ? cashPrice - deposit + initFee : cashPrice + initFee;
//
//  // BALLOON
//  let balloonAmt = balloonPerc / 100 * cashPrice;
//
//  //REPAYMENT AMOUNT
//  let baloonSubtract = balloonAmt / pow;
//  let finalLoan = amountLoaned - baloonSubtract;
//  let payments = (finalLoan * pow * intPerUnitPerMonth) / (pow - 1);
//  let totalRepayments = payments * term;
//  let totalCostToCustomer = totalRepayments + balloonAmt;
//
//  console.log('cashPrice --------------->', cashPrice);
//  console.log('deposit ------------->', deposit);
//  console.log('amountLoaned -------->', amountLoaned);
//  console.log('balloonAmt ---------->', balloonAmt, `${balloonPerc}% of price (${cashPrice})`);
//
//  console.log('intPerUnitPerMonth---------------->', intPerUnitPerMonth);
//  console.log('pow------------------>', pow);
//  console.log('baloonSubtract------->', baloonSubtract);
//
//  console.log('finalLoan ----------->', finalLoan);
//  console.log('payments ------------>', payments);
//  console.log('totalRepayments ----->', totalRepayments);
//  console.log('totalCostToCustomer ->', totalCostToCustomer);
//
//}
//
//CalculateLoanAmt();