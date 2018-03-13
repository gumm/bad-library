
/**
 * Given a string, sanitize it and only allow numbers and arithmetic
 * operators
 * @param {!string} s
 * @returns {string}
 */
const mathCleaner = s => {
  const arithmeticOperators = ['+', '-', '*', '/', '%', '(', ')'];
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];
  const ref = ['$', ' '];
  const combined = [...arithmeticOperators, ...numbers, ...ref];
  return Array.from(s).filter(e => combined.includes(e)).join('');
};

/**
 * @param {(!string|!number)} fn
 * @returns {*[]}
 */
const funcMaker = fn => {
  try {
    return [null, new Function('X', `try { return ${fn}; } catch(e) { return; }`)];
  } catch(err) {
    return [`Could not make a function with "${fn}"`, () => undefined];
  }
};

/**
 * Convert a mathematical string, into  a function that returns the
 * solution.
 * @param {(!string|!number)} m
 * @param {!Array<!Node>} a
 * @returns {[boolean, !Function]}
 */
const mathFunc = (m, a) => {
  let err = 'Unable to clean math';
  let f = () => undefined;
  if (typeof m === 'string') {
    const s = a.reduce(
        (p, c, i) => p.split(`$${i + 1}`).join(`X[${i}]`),
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

const removeOrphans = m => {
  for (const [k, s] of m.entries()) {
    if (s.size === 0 && k !== 0) {
      m.delete(k);
      for (const v of m.values()) { v.delete(k) }
    }
  }
  if([...m.entries()].reduce(
      (p, c) => p || (c[1].size === 0 && c[0] !== 0), false)) {
    removeOrphans(m);
  }
  return m;
};

function* idGen(n) {
  let i = n ? n + 1 : 0;
  while (true)
    yield i++;
}

const isIn = n => (p, [k, s]) => s.has(n) ? (p.push(k) && p) : p;

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

const grabId = n => n._id;

const tail = arr => arr[arr.length ? arr.length - 1 : undefined];


const Node = class {

  constructor(id, name, obj = undefined) {
    this._id = id;
    this._name = name;
    this._args = [];
    this._math = undefined;
    this._enum = [];
    this._func = () => undefined;
    this._errState = 'Not init';
    this._fallback = undefined;

    // We overwrite *some* elements, but we keep the _args and _errState both
    // as default, because the Graph will populate those.
    if (obj) {
      this.id = obj.id;
      this.name = obj.name;
      this.setFallback(obj.fallback);
      this.setMath(obj.math);
      obj.enum.forEach(e => this.addEnum(...e));
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
    this._args.push(n._id);
    this._errState = 'Changed';
  }

  delArg(n) {
    this._args = this._args.filter(e => e !== n._id);
    this._errState = 'Changed';
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
    this._errState = 'Changed';
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
    if (k === undefined) { return this }
    this._enum = enumSet(this._enum, k, v);
    this._math = undefined;
    this._errState = 'Changed';
    return this;
  }

  delEnum(k) {
    this._enum = enumUnSet(this._enum, k);
    this._errState = 'Changed';
    return this;
  }

  get enum() {
    return this._enum;
  }

  // ----------------------------------------------------------------[ Solve ]--
  clean() {
    if (this._math) {
      [this._errState, this._func] = mathFunc(this._math, this.args);
    } else if (this._enum.length) {
      const m = new Map(this._enum);
      this._func = X => m.get(X[0]);
      this._errState = null;
    }
    return this;
  }

  solve(p, topoIds) {
    const argArr = this.args.map(id => {
      const sI = topoIds.findIndex(e => e === id);
      return p[sI];
    });

    if(!this._errState) {
      const result = this._func(argArr);
      // Make sure things like false, null, 0 don't trigger the fallback.
      return  result === undefined ? [null, this._fallback] : [null, result];
    } else {
      this.clean()
    }
    if(!this._errState) {
      return this.solve(p, topoIds);
    }
    return [this._errState, undefined];
  }

  // ----------------------------------------------------------------[ Store ]--
  dump() {
    return {
      id: this.id,
      name: this.name,
      math: this._math,
      args: this._args,
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
    for (const [n, s] of this.G.entries()) {
      if (s.size === 0 && n !== this._rootNode) {
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
    this.G.set(n, new Set());
    return n;
  }

  add(n) {
    if (this.G.has(n)) { return n; }
    if (this.ids.includes(n.id)) { return false; }
    this.G.set(n, new Set());

    // Biggest ID
    this._nodeMaker = nodeMaker(idGen(biggest(this.ids)));

    return n;
  }

  del(n) {
    let deleted = false;
    if (n && n !== this._rootNode) {
      deleted = this.G.delete(n);
      if (deleted) {
        for (const s of this.G.values()) {
          s.delete(n);
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
    if (this.G.get(a).has(b)) { return this; }

    // Add the in-node to the out-node.
    this.G.get(a).add(b);

    // The connection formed a cycle. Undo it.
    if (this.topo.length < this.nodes.length) {
      this.disconnect(a, b);
    }

    // Add the ID of the in-node to the out-node.
    b.addArg(a);
    return this;
  }

  disconnect(a, b) {
    // const arr = this.G.get(a) || [];
    // const arr2 = arr.filter(e => e !== b);
    this.G.get(a).delete(b);
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
    return [...this.G.get(n)];
  }

  getIdG() {
    return [...this.G].reduce(
        (p, [k, s]) => p.set(grabId(k), new Set([...s].map(grabId))),
        new Map()
    )
  }

  compute() {
    const m = removeOrphans(this.getIdG());
    const validTopoNodes = this.topo.filter(e => m.has(grabId(e)));
    const validTopoIds = validTopoNodes.map(grabId);

    const errArr = [];
    const solutionArr = validTopoNodes.reduce((p, n) => {
          const [err, s] = n.clean().solve(p, validTopoIds);
          errArr.push(err);
          p.push(s);
          return p;
        }, []);

    console.log(solutionArr);
    console.log(errArr);

    return tail(solutionArr);
  }

  dump() {
    return JSON.stringify({
      G: [...this.getIdG()].map(([k, s]) => [k, [...s]]),
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
          n._args = j.N.find(matchId(n.id)).args;
        });
        return true;
      }
      catch (e) {
        this.read(rollback);
      }
    }
  }
};


/**

 d = require('./bad/math/dag.js');
 const g = new d.DAG();
 const A = g.create('A');
 const B = g.create('B');
 const C = g.create('C');
 const D = g.create('D');
 g.connect(D, A).connect(C, B).connect(B, A).connect(A, g.root);
 C.setMath(11);
 B.addEnum(11, 30).addEnum(12, 20);
 A.setMath('$1 - 1');
 g.compute();
 g.connect(D, A);
 D.setMath(5);
 A.setMath('$1 - $2')
 g.compute();
 g.disconnect(B, A);
 g.compute();


*/


module.exports = {
  DAG
};


