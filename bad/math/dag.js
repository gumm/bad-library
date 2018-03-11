

const isIn = n => (p, c) => c[1].includes(n) ? (p.push(c[0]) && p) : p;

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

const Node = class {

  constructor(id, name, json = undefined) {
    this._id = id;
    this._name = name;
    this._args = [];
    this._solve = '';
    this._isClean = false; // We have to keep state so edits are propagated.

    // We overwrite *some* elements, but we keep the _args and _isClean both
    // as default, because the Graph will populate those.
    if (json) {
      // const j = JSON.parse(json);
      this.id = json.id;
      this.name = json.name;
      this.setSolve(json.solve);
    }
  }

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

  get args() {
    return this._args;
  }

  addArg(n) {
    this._args.push(n);
    this._isClean = false;
  }

  delArg(n) {
    this._args = this._args.filter(e => e !== n);
    this._isClean = false;
  }

  setSolve(s) {
    this._solve = s;
    this._isClean = false;
    return this;
  }

  clean() {
    this._solve = this.args.reduce(
        (p, c, i) => p.split(`$${i + 1}`).join(`this.args[${i}].solve()`), this._solve);
    this._isClean = !Array.from(this._solve).includes('$');
  }

  solve() {
    if(this._isClean) {
      return eval(this._solve);
    } else {
      this.clean()
    }
    if(this._isClean) {
      return this.solve();
    }
    throw new Error(this._solve + ' contains unknown input...')
  }

  dump() {
    return {
      id: this.id,
      name: this.name,
      solve: this._solve,
      args: this._args.map(e => e.id)
    };
  }

};

function* idGen(n) {
  let i = n ? n + 1 : 0;
  while (true)
    yield i++;
}

const nodeMaker = idMaker => name => new Node(idMaker.next().value, name);

const biggest = arr => Math.max.apply(undefined, arr);


const DAG = class {

  constructor() {
    this.G = new Map();
    this._nodeMaker = nodeMaker(idGen());
    this._rootNode = this.create('ROOT');
    this._rootNode.setSolve('this.args[0].solve()')
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
    return this.root.solve();
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
    this.G = new Map();
    this._rootNode = undefined;

    const j = JSON.parse(json);

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
const E = g.create('E');
const F = g.create('F');
g.connect(C, B).connect(B, A).connect(D, A).connect(A, g.root)
g.clean()
D.setSolve(10)
C.setSolve(15)
B.setSolve('$1 * 2')
A.setSolve('($1 + 1) / $2')
g.compute()
g.disconnect(B, A).connect(B, A).compute()
s = g.dump()
g2 = new d.DAG()
g2.read(s)
const assert = require('assert');
assert.deepStrictEqual(g2.compute(), g.compute())
assert.deepStrictEqual(g2.dump(), g.dump())
assert.deepStrictEqual(g2.ids, g.ids)
assert.deepStrictEqual(g2.names, g.names)

   */

};

module.exports = {
  DAG
};


