const compose = (...fns) => (...x) => fns.reduce((a, b) => c => a(b(c)))(...x);
const chunk = n => a => a.reduce(
    (p, c, i) => (!(i % n)) ? p.push([c]) && p : p[p.length - 1].push(c) && p,
    []);
const sameArr = a => b => a.length === b.length && a.every((c, i) => b[i] === c);

const chunk4 = chunk(4);
const print = p => {
  chunk4(p).forEach(a => console.log(a.join('\t')));
  console.log('\n');
  return p;
};
const findZero = p => p.indexOf(0);

const p = [
  15, 14, 1, 6,
  9, 11, 4, 12,
  0, 10, 7, 3,
  13, 8, 5, 2];

const target = [
  1, 2, 3, 4,
  5, 6, 7, 8,
  9, 10, 11, 12,
  13, 14, 15, 0];

const test = sameArr(target);

const move = (a, zi, t) => {
  const ti = zi + t;
  return [a.map((e, i) => i === zi ? a[ti] : (i === ti ? 0 : a[i])), ti];
};

const moveRight = (p, z) => move(p, z, 1);
const moveLeft = (p, z) => move(p, z, -1);
const moveUp = (p, z) => move(p, z, -4);
const moveDown = (p, z) => move(p, z, 4);


print(p);

const moveMap = new Map()
    .set('r', moveRight)
    .set('l', moveLeft)
    .set('u', moveUp)
    .set('d', moveDown);

const backTrack = new Map()
    .set('r', 'l')
    .set('l', 'r')
    .set('u', 'd')
    .set('d', 'u');

const noBacktrack = f => {
  const bt = backTrack.get(f);
  return e => e !== bt;
};

const lm = [
  ['r', 'd'], ['r', 'd', 'l'], ['r', 'd', 'l'], ['l', 'd'],
  ['u', 'r', 'd'], ['d', 'r', 'u', 'l'], ['l', 'd', 'r', 'u'], [ 'l', 'u', 'd'],
  ['r', 'u', 'd'], ['r', 'u', 'd', 'l'], ['r', 'd', 'u', 'l'], ['u', 'd', 'l'],
  ['u', 'r'], ['l', 'r', 'u'], ['r', 'u', 'l'], ['u', 'l']];

const nextMoves = (f, z) => lm[z].filter(noBacktrack(f));


const results = [];
const walk = ([a, z], f, c) => {
  if (test(a)) {
    console.log(c);
    print(a);
  }
  else if (c.length < 53) {
    nextMoves(f, z).forEach(m => {
      walk(moveMap.get(m)(a, z), m, [...c, m])
    })
  }
};

walk([p, 8], '', []);
console.log(results);
// combos.forEach(c => console.log(c.join('')));



// const seq = compose(d, r, d, r, d, l, u, r, r, u, l, u, l, d, d, r, u, u, l, d, l, d, d, r, r, r, u, l, u, l, l, u, r, d, d, d, r, u, r, d, l, u, u, u, l, d, d, l, u, r, r, r)(p);
