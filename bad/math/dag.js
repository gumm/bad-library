

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

function* idGen(n) {
  let i = n ? n : 0;
  while (true)
    yield i++;
}

const nodeMaker = idMaker => {
  return (name) => ({
    id: idMaker.next().value,
    name: name
  })
};

const DAG = class {

  constructor() {
    this.G = new Map();
    this._nodeMaker = nodeMaker(idGen(0));
    this._rootNode = this.create('ROOT');
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

  getNodeByName(name) {
    return this.nodes.find(e => e.name === name);
  }

  create(name) {
    const xNode = this.getNodeByName(name);
    if (xNode) {
      return xNode;
    }
    const n = this._nodeMaker(name);
    this.G.set(n, []);
    return n;
  }

  add(n) {
    if (this.G.has(n)) { return n; }
    this.G.set(n, []);
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
    if (a === this.root) { return this; }
    if (b === this.root && this.indegrees(b).length > 0) { return this; }
    if (this.G.get(a).includes(b)) { return this; }

    this.G.get(a).push(b);
    if (this.topo.length < this.nodes.length) {
      console.log('This connection creates a cycle');
      // This creates a cycle! This is not allowed.
      this.disconnect(a, b);
      return this;
    }
    return this;
  }

  disconnect(a, b) {
    const arr = this.G.get(a) || [];
    const arr2 = arr.filter(e => e !== b);
    this.G.set(a, arr2);
    return this
  }

  clean(arr = []) {
    this.orphans.forEach(e => this.del(e) && arr.push(e));
    if (this.orphans.length) {
      this.clean(arr);
    }
    return arr;
  }

  indegrees(n) {
    const hasN = isIn(n);
    return [...this.G.entries()].reduce(hasN, []);
  }

  outdegrees(n) {
    return this.G.get(n);
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
g.connect(A, g.root).connect(B,A).connect(C,A).connect(F,B).connect(D,C).connect(E,C).connect(D,A).connect(D,B).connect(D,C).connect(D,F).connect(A,E);

   */

};

module.exports = {
  DAG
};


