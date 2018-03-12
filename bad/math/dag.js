/**
 * Convert a mathematical string, into  a function that returns the
 * solution.
 * @param {!string|number} m
 * @param {!Array<!Node>} a
 * @returns {[boolean, !Function]}
 */
const mathFunc = (m, a) => {
  let err;
  let f = () => undefined;
  if (typeof m === 'string') {
    const s = a.reduce(
        (p, c, i) => p.split(`$${i + 1}`).join(`this.args[${i}].solve()`),
        mathCleaner(m)
    );
    if (!s.includes('$')) {
      [err, f] = funcMaker(s);
    }
  }
  else {
    [err, f] = funcMaker(m);
  }
  return [err, f];
};


/**
 * Given a map of a dag in the form below, return an array of leaf nodes, that
 * is, nodes with 0 in degrees / nodes where no edges point to it.
 * @param {!Map} G example:
 *    const G = new Map([
 *      [ 'A', ['B', 'C'] ],
 *      [ 'B', ['C', 'D'] ],
 *      [ 'C', ['D'] ],
 *      [ 'E', ['F'] ],
 *      [ 'F', ['C'] ],
 *      [ 'D', [] ]
 *    ]);
 * @returns {Array}
 */
const leafNodes = G => {
  // Build a map of the form:
  // { A: 0, B: 1, C: 3, E: 0, F: 1, D: 2 }
  // where each key in the DAG is notated with the number of times it
  // appears as a value. In terms of a DAG, this describes how many edges
  // point to this node.
  const C = [...G.keys()].reduce((p,c) => (p.set(c,0)) || p, new Map());
  [...G.values()].forEach(arr => arr.forEach(e => C.set(e, C.has(e) ? C.get(e) + 1 : 0)));

  const Q = [...G.keys()].filter(e => C.get(e) === 0);

  return [C, Q];
};


/**
 * Given the DAG as below, return an array where the nodes of the DAG
 * are topologically sorted.
 * example:
 *    [ 'E', 'F', 'A', 'B', 'C', 'D' ]
 * @param {!Map} G example:
 *    const G = new Map([
 *      [ 'A', ['B', 'C'] ],
 *      [ 'B', ['C', 'D'] ],
 *      [ 'C', ['D'] ],
 *      [ 'E', ['F'] ],
 *      [ 'F', ['C'] ],
 *      [ 'D', [] ]
 *    ]);
 * @returns {Array}
 */
const topoSort = G => {

  const [C, Q] = leafNodes(G);

  // The result array.
  const S = [];
  while (Q.length) {
    const u = Q.pop();
    S.push(u);
    G.get(u).forEach(v => {
      C.set(v, C.get(v) - 1);
      if (C.get(v) === 0) {
        Q.push(v);
      }
    });
  }
  return S;
};

const funcMaker = fn => {
  try {
    return [null, new Function(`try { return ${fn}; } catch(e) { return; }`)];
  } catch(err) {
    return [`Could not make a function with "${fn}"`, () => undefined];
  }
};

const mathCleaner = s => {
  const arithmeticOperators = ['+', '-', '*', '/', '%', '(', ')'];
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];
  const ref = ['$', ' '];
  const combined = [...arithmeticOperators, ...numbers, ...ref];
  return Array.from(s).filter(e => combined.includes(e)).join('');
};

const isIn = n => (p, c) => c[1].includes(n) ? (p.push(c[0]) && p) : p;

function* idGen(n) {
  let i = n ? n + 1 : 0;
  while (true)
    yield i++;
}

const nodeMaker = idMaker => name => new Node(idMaker.next().value, name);

const biggest = arr => Math.max.apply(undefined, arr);

const safeJsonParse = json => {
  // This function cannot be optimised, it's best to
  // keep it small!
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch (e) {}
  return parsed;
};

const enumSet = (arr, k, v) => [...new Map(arr).set(k, v).entries()];

const enumUnSet = (arr, k) => arr.filter(e => e[0] !== k);


const Node = class {

  constructor(id, name, json = undefined) {
    this._id = id;
    this._name = name;
    this._args = [];
    this._math = undefined;
    this._enum = [];
    this._func = () => undefined;
    this._isClean = false;
    this._fallback = undefined;

    // We overwrite *some* elements, but we keep the _args and _isClean both
    // as default, because the Graph will populate those.
    if (json) {
      // const j = JSON.parse(json);
      this.id = json.id;
      this.name = json.name;
      this.setFallback(json.fallback);
      this.setMath(json.math);
      json.enum.forEach(e => this.addEnum(...e));
    }
  }


  // -------------------------------------------------------------[ Identity ]--
  get id() {
    return this._id;
  }

  set id(id) {
    this._id = id;
  }

  get name() {
    return this._name;
  }

  set name(n) {
    this._name = n;
  }

  // -----------------------------------------------------------------[ Args ]--
  addArg(n) {
    this._args.push(n);
    this._isClean = false;
  }

  delArg(n) {
    this._args = this._args.filter(e => e !== n);
    this._isClean = false;
  }

  get args() {
    return this._args;
  }

  // -------------------------------------------------------------[ Fallback ]--
  setFallback(n) {
    this._fallback = n;
  }

  get fallback() {
    return this._fallback;
  }

  // -----------------------------------------------------------------[ Math ]--
  setMath(s) {
    this._math = s;
    this._isClean = false;
    this._enum = [];
    return this;
  }

  get math() {
    return this._math;
  }

  // -----------------------------------------------------------------[ Enum ]--
  /**
   * @param {*} k
   * @param {*} v
   * @returns {Node}
   */
  addEnum(k, v) {
    if (k === undefined) { return this };
    this._enum = enumSet(this._enum, k, v);
    this._math = undefined;
    this._isClean = false;
    return this;
  }

  delEnum(k) {
    this._enum = enumUnSet(this._enum, k);
    this._isClean = false;
    return this;
  }

  get enum() {
    return this._enum;
  }

  // ----------------------------------------------------------------[ Solve ]--
  clean() {
    let err;
    if (this._math) {
      [err, this._func] = mathFunc(this._math, this.args);
    } else if (this._enum.length) {
      const m = new Map(this._enum);
      this._func = () => m.get(this._args[0].solve());
      err = false;
    }
    this._isClean = !err;
  }

  solve() {
    if(this._isClean) {
      const result = this._func();
      // Make sure things like false, null, 0 don't trigger the fallback.
      return  result === undefined ? this._fallback : result;
    } else {
      this.clean()
    }
    if(this._isClean) {
      return this.solve();
    }
    throw(`The node "${this.name}", with formula "${this._math}" can not be solved`);
  }

  // ----------------------------------------------------------------[ Store ]--
  dump() {
    return {
      id: this.id,
      name: this.name,
      math: this._math,
      args: this._args.map(e => e.id),
      enum: this._enum,
      fallback: this._fallback
    };
  }

};


const DAG = class {

  constructor() {
    this.G = new Map();
    this._nodeMaker = nodeMaker(idGen());
    this._rootNode = this.create('ROOT');
    this._rootNode.setMath('$1')
  }

  get size() {
    return this.G.size;
  }

  get root() {
    return this._rootNode;
  }

  get nodes() {
    return [...this.G.keys()];
  }

  get graph() {
    return this.G;
  }

  get topo() {
    return topoSort(this.G);
  }

  get leafs() {
    const [, Q] = leafNodes(this.G);
    return Q;
  }

  get orphans() {
    const orphans = [];
    for (const [n, arr] of this.G.entries()) {
      if (!arr.length && n !== this._rootNode) {
        orphans.push(n)
      }
    }
    return orphans;
  }

  get names() {
    return this.nodes.map(e => e.name);
  }

  get ids() {
    return this.nodes.map(e => e.id);
  }

  getAllByName(name) {
    return this.nodes.filter(e => e.name === name);
  }

  create(name) {
    const n = this._nodeMaker(name);
    this.G.set(n, []);
    return n;
  }

  add(n) {
    if (this.G.has(n)) { return n; }
    if (this.ids.includes(n.id)) { return false; }
    this.G.set(n, []);

    // Biggest ID
    this._nodeMaker = nodeMaker(idGen(biggest(this.ids)));

    return n;
  }

  del(n) {
    let deleted = false;
    if (n && n !== this._rootNode) {
      deleted = this.G.delete(n);
      if (deleted) {
        for (const [k, arr] of this.G.entries()) {
          const f = arr.filter(e => e.id !== n.id);
          this.G.set(k, f);
        }
      }
    }
    return deleted;
  }

  connect(a, b) {
    // Root is not allowed to be connected to anything else
    if (a === this.root) { return this; }

    // Root already has something connected
    if (b === this.root && this.indegrees(b).length > 0) { return this; }

    // Either a or b is not a member of this graph.
    if (!this.G.has(a) || !this.G.has(b)) { return this; }

    // A is already connected to B
    if (this.G.get(a).includes(b)) { return this; }

    this.G.get(a).push(b);

    // The connection formed a cycle. Undo it.
    if (this.topo.length < this.nodes.length) {
      this.disconnect(a, b);
    }

    b.addArg(a);
    return this;
  }

  disconnect(a, b) {
    const arr = this.G.get(a) || [];
    const arr2 = arr.filter(e => e !== b);
    this.G.set(a, arr2);
    b.delArg(a);
    return this
  }

  clean() {
    this.orphans.forEach(e => this.del(e));
    if (this.orphans.length) {
      this.clean();
    }
    this.nodes.forEach(n => n.clean());
    return this;
  }

  indegrees(n) {
    const hasN = isIn(n);
    return [...this.G.entries()].reduce(hasN, []);
  }

  outdegrees(n) {
    return this.G.get(n);
  }

  compute() {
    try {
      return this.root.solve()
    } catch(err) {
      console.log(err);
    }
  }

  dump() {
    const m = new Map();
    for (const [n, arr] of this.G) {
      m.set(n.id, arr.map(e => e.id))
    }
    return JSON.stringify({
      G: [...m],
      N: this.topo.map(e => e.dump())
    });
  }

  read(json) {
    // Read the string
    const j = safeJsonParse(json);

    // Store a valid rollback image of the current config.
    const rollback = this.dump();

    if (j) {
      try {
        // Destroy the current config
        this.G = new Map();
        this._rootNode = undefined;

        // Create a list of true nodes
        const n = j.N.map(e => new Node(undefined, undefined, e));
        const matchId = id => e => e.id === id;
        const findNode = id => n.find(matchId(id));

        // Create a map that directly mirrors the original, but with IDs only.
        const g = new Map(j.G);
        this._rootNode = undefined;
        for (const k of g.keys()) {
          this.add(findNode(k))
        }
        this._rootNode = this.nodes[0];
        for (const [k, arr] of g.entries()) {
          const node = findNode(k);
          arr.forEach(id => {
            const toNode = findNode(id);
            this.connect(node, toNode);
          })
        }

        // Make sure that the order of each of the nodes args is the same as the
        // original.
        this.nodes.forEach(n => {
          const targetArgs = j.N.find(matchId(n.id)).args;
          n._args = targetArgs.map(id => n._args.find(matchId(id)));
        });
        return true;
      }
      catch (e) {
        this.read(rollback);
      }
    }
  }
};


const testme = {
  /**
d = require('./bad/math/dag.js');
const g = new d.DAG();
const A = g.create('A');
const B = g.create('B');
const C = g.create('C');
const D = g.create('D');
g.connect(C, B).connect(B, A).connect(D, A).connect(A, g.root);
D.setMath(10);
C.setMath(3);
B.addEnum(3, 2.5).addEnum('A', 'B');
A.setMath('($1 + 2.5) / $2');
g.compute();
s = g.dump();
g2 = new d.DAG();
g2.read(s)
g2.compute()

   */

};

module.exports = {
  DAG
};


