const argRefSymbol = 'X';

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
    return [null, new Function(
        argRefSymbol, `try { return ${fn}; } catch(e) { return; }`)];
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
        (p, c, i) => p.split(`$${i + 1}`).join(`${argRefSymbol}[${i}]`),
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
 *      [ 'A', new Set(['B', 'C']) ],
 *      [ 'B', new Set(['C', 'D']) ],
 *      [ 'C', new Set(['D']) ],
 *      [ 'E', new Set(['F']) ],
 *      [ 'F', new Set(['C']) ],
 *      [ 'D', new Set([]) ]
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
  [...G.values()].forEach(
      arr => arr.forEach(e => C.set(e, C.has(e) ? C.get(e) + 1 : 0))
  );
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
 *      [ 'A', new Set(['B', 'C']) ],
 *      [ 'B', new Set(['C', 'D']) ],
 *      [ 'C', new Set(['D']) ],
 *      [ 'E', new Set(['F']) ],
 *      [ 'F', new Set(['C']) ],
 *      [ 'D', new Set([]) ]
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

/**
 * Given a map recursively delete all orphan nodes.
 * @param {!Map} G example:
 *    const G = new Map([
 *      [ 'A', new Set(['B', 'C']) ],
 *      [ 'B', new Set(['C', 'D']) ],
 *      [ 'C', new Set(['D']) ],
 *      [ 'E', new Set(['F']) ],
 *      [ 'F', new Set(['C']) ],
 *      [ 'D', new Set([]) ]
 *    ]);
 * @returns {!Map}
 */
const removeOrphans = G => {
  for (const [k, s] of G.entries()) {
    if (s.size === 0 && k !== 0) {
      G.delete(k);
      for (const v of G.values()) { v.delete(k) }
    }
  }
  if([...G.entries()].reduce(
      (p, c) => p || (c[1].size === 0 && c[0] !== 0), false)) {
    removeOrphans(G);
  }
  return G;
};

/**
 * A generator function to produce consecutive ids, starting from
 * n + 1 of n. If n is not given, use 0.
 * @param {number|undefined} n
 */
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

/**
 * Given an array of two-element arrays, and a key and value,
 * return the array with a new two element array item, containing the
 * key and value, added. This method does not allow the same elements to
 * be added more than once.
 * @param {!Array<!Array<*>>} arr
 * @param {*} k
 * @param {*} v
 * @returns {!Array<!Array<*>>}
 */
const enumSet = (arr, k, v) => [...new Map(arr).set(k, v).entries()];

/**
 * Given an array of two-element arrays, and a key,
 * remove all items where the first element of the inner array matches the key.
 * @param {!Array<!Array<*>>} arr
 * @param {*} k
 */
const enumUnSet = (arr, k) => arr.filter(e => e[0] !== k);

/**
 * @param {!Node} n
 * @returns {!number}
 */
const grabId = n => n._id;

/**
 * Return the last element of an array, or undefined if the array is empty.
 * @param {!Array<*>} arr
 * @returns {*}
 */
const tail = arr => arr[arr.length ? arr.length - 1 : undefined];

/**
 * @type {Node}
 */
const Node = class {

  /**
   * @param {!number} id
   * @param {!string} name
   * @param {Object|undefined} obj
   */
  constructor(id, name, obj = undefined) {
    /**
     * @type {!number}
     * @private
     */
    this._id = id;

    /**
     * @type {!string}
     * @private
     */
    this._name = name;

    /**
     * @type {!Array<!number>}
     * @private
     */
    this._args = [];

    /**
     * @type {!string|!number|undefined}
     * @private
     */
    this._math = undefined;

    /**
     * @type {Array<Array<*>>}
     * @private
     */
    this._enum = [];

    this._func = () => undefined;

    /**
     * @type {string|undefined}
     * @private
     */
    this._errState = 'Not init';

    /**
     * @type {*}
     * @private
     */
    this._fallback = undefined;

    // We overwrite *some* elements, but we keep the _args and _errState both
    // as default, because the Graph will populate those.
    if (obj) {
      this._id = obj.I;
      this.name = obj.N;
      this.setFallback(obj.D);
      this.setMath(obj.M);
      obj.E.forEach(e => this.addEnum(...e));
    }
  }

  //------------------------------------------------------------------[ Save ]--
  /**
   * Dump the node to a Json string.
   * @returns {{
   *    id: !number,
   *    name: !string,
   *    math: (!number|!string|undefined),
   *    args: !Array<!number>,
   *    enum: Array<[*,*]>,
   *    fallback: *}}
   */
  dump() {
    return {
      I: this.id,
      N: this.name,
      M: this._math,
      R: this._args,
      E: this._enum,
      D: this._fallback
    };
  }


  // -------------------------------------------------------------[ Identity ]--
  /**
   * @returns {!number}
   */
  get id() {
    return this._id;
  }

  /**
   * @returns {!string}
   */
  get name() {
    return this._name;
  }

  /**
   * @param {!string} n
   */
  set name(n) {
    this._name = n;
  }

  // -----------------------------------------------------------------[ Args ]--
  /**
   * Add a argument to the node.
   * @param {!Node} n
   */
  addArg(n) {
    this._args.push(n._id);
    this._errState = 'Changed';
  }

  /**
   * Remove an argument from the node.
   * @param {!Node} n
   */
  delArg(n) {
    this._args = this._args.filter(e => e !== n._id);
    this._errState = 'Changed';
  }

  /**
   * @returns {!Array<!number>}
   */
  get args() {
    return this._args;
  }

  // -------------------------------------------------------------[ Fallback ]--
  /**
   * @param {*} n
   */
  setFallback(n) {
    this._fallback = n;
  }

  /**
   * @returns {*}
   */
  get fallback() {
    return this._fallback;
  }

  // -----------------------------------------------------------------[ Math ]--
  /**
   * @param {!string|!number|undefined} s
   * @returns {Node}
   */
  setMath(s) {
    this._math = s;
    this._errState = 'Changed';
    this._enum = [];
    return this;
  }

  /**
   * @returns {string|number|undefined}
   */
  get math() {
    return this._math;
  }

  // -----------------------------------------------------------------[ Enum ]--
  /**
   * @param {*} k
   * @param {*} v
   * @returns {!Node}
   */
  addEnum(k, v) {
    if (k === undefined) { return this }
    this._enum = enumSet(this._enum, k, v);
    this._math = undefined;
    this._errState = 'Changed';
    return this;
  }

  /**
   * @param {*} k
   * @returns {!Node}
   */
  delEnum(k) {
    this._enum = enumUnSet(this._enum, k);
    this._errState = 'Changed';
    return this;
  }

  /**
   * @returns {Array<Array<*>>}
   */
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

  /**
   * Given two lists, this returns the solution for this node.
   * Both arrays are topologically ordered, and maps to one another.
   * This node's own args array contains the ids of the nodes that connect
   * to this node, and so the solutions of those nodes can be found in the
   * first array (p).
   * Thus, to get to an arg value the logic is:
   *     argId -> indexOf arg id in topoIds -> p[]
   * @param {!Array<*>} p The solution so far. In topo-order.
   * @param {!Array<!number>} topoIds The topo-ordered list of node IDs
   * @returns {*}
   */
  solve(p, topoIds) {
    const argArr = this.args.map(id => p[topoIds.indexOf(id)]);

    if(!this._errState) {
      const result = this._func(argArr);
      // Make sure things like false, null, 0 don't trigger the fallback.
      return  result === undefined ? [null, this.fallback] : [null, result];
    } else {
      this.clean()
    }
    if(!this._errState) {
      return this.solve(p, topoIds);
    }
    return [this._errState, undefined];
  }

};


/**
 * @type {DAG}
 */
const DAG = class {

  constructor() {
    this.G = new Map();
    this._nodeMaker = nodeMaker(idGen());
    this._rootNode = this.create('ROOT');
    this._rootNode.setMath('$1')
  }

  /**
   * The single root node.
   * @returns {!Node}
   */
  get root() {
    return this._rootNode;
  }

  /**
   * The nodes in the order that they were added.
   * @returns {!Array<!Node>}
   */
  get nodes() {
    return [...this.G.keys()];
  }

  /**
   * The graph description in the form of Node -> Set<Node>
   * @returns {!Map}
   */
  get graph() {
    return this.G;
  }

  /**
   * A topological sorted array of node.
   * NOTE: This includes orphans, and orphans *may* be sorted after the root
   * node.
   * @returns {!Array<!Node>}
   */
  get topo() {
    return topoSort(this.G);
  }

  /**
   * Leafs are nodes without any in-degrees. The partake in the solution.
   * NOTE: The root node *is* considered a leaf if nothing connects to it.
   * @returns {!Array<!Node>}
   */
  get leafs() {
    const [, Q] = leafNodes(this.G);
    return Q;
  }

  /**
   * Orphans are nodes that wont partake in the solution. That is nodes that
   * don't have an out degree.
   * NOTE: The root node is *not* treated as an orphan.
   * @returns {!Array<!Node>}
   */
  get orphans() {
    const orphans = [];
    for (const [n, s] of this.G.entries()) {
      if (s.size === 0 && n !== this._rootNode) {
        orphans.push(n)
      }
    }
    return orphans;
  }

  /**
   * A list of the node names
   * @return {!Array<!string>}
   */
  get names() {
    return this.nodes.map(e => e.name);
  }

  /**
   * A list of the node IDs
   * @return {!Array<!number>}
   */
  get ids() {
    return this.nodes.map(e => e.id);
  }

  /**
   * @param {!String} name
   * @returns {!Node}
   */
  create(name) {
    const n = this._nodeMaker(name);
    this.G.set(n, new Set());
    return n;
  }

  /**
   * Add a node the the graph without connecting it.
   * Adding an already constructed node potentially mutates the DAG's built
   * in node maker to algorithm to produce nodes with non contiguous ids.
   * If the given node has a higer ID than any of the existing nodes in the
   * DAG, new nodes created by the DAG will count from this new highest ID.
   * @param {!Node} n
   * @returns {(!Node|!boolean)}
   */
  add(n) {
    if (this.G.has(n)) { return n; }
    if (this.ids.includes(n.id)) { return false; }
    this.G.set(n, new Set());
    this._nodeMaker = nodeMaker(idGen(biggest(this.ids)));
    return n;
  }

  /**
   * Delete a node. That is completely remove it from the DAG.
   * The node is disconnected from all its connections, and deleted.
   * The root node can not be deleted.
   * @param {!Node} n
   * @returns {boolean}
   */
  del(n) {
    let deleted = false;
    if (n && n !== this._rootNode) {
      deleted = this.G.delete(n);
      if (deleted) {
        for (const [k, s] of this.G.entries()) {
          s.delete(n);
          k.delArg(n);
        }
      }
    }
    return deleted;
  }

  /**
   * Connect node a to node b. That is, make node a an input to node b.
   * There are restrictions on connecting nodes:
   *  1) Root is not allowed to be connected to anything else
   *  2) Root only accepts a single in-degree. Further attempts are ignored.
   *  3) Only members of the DAG can be connected to each other.
   *  4) If the nodes are already connected, further attempts are ignored.
   *  5) It the connection will form a cycle, the nodes won't be connected.
   *
   * @param {!Node} a
   * @param {!Node} b
   * @returns {DAG}
   */
  connect(a, b) {
    if (a === this.root) { return this; }
    if (b === this.root && this.indegrees(b).length > 0) { return this; }
    if (!this.G.has(a) || !this.G.has(b)) { return this; }
    if (this.G.get(a).has(b)) { return this; }

    // Fist connect it.
    this.G.get(a).add(b);
    b.addArg(a);

    // Then check for cycles.
    if (this.topo.length < this.nodes.length) {
      this.disconnect(a, b);
    }

    return this;
  }

  /**
   * Disconnect node a from node b.
   * That is remove node a as an input to node b.
   * @param {!Node} a
   * @param {!Node} b
   * @returns {DAG}
   */
  disconnect(a, b) {
    if (this.G.has(a)) {
      this.G.get(a).delete(b);
      b.delArg(a);
    }
    return this
  }

  /**
   * Recursively delete all the orphaned nodes.
   * This mutates the DAG Map.
   * @returns {DAG}
   */
  clean() {
    this.orphans.forEach(e => this.del(e));
    if (this.orphans.length) {
      this.clean();
    }
    this.nodes.forEach(n => n.clean());
    return this;
  }

  /**
   * Return an array of all the nodes that connects to the given node.
   * @param {!Node} n
   * @returns {!Array<!Node>}
   */
  indegrees(n) {
    const hasN = isIn(n);
    return [...this.G.entries()].reduce(hasN, []);
  }

  /**
   * Return an array of all the nodes that the given node connects to.
   * @param {!Node} n
   * @returns {!Array<!Node>}
   */
  outdegrees(n) {
    return [...this.G.get(n)];
  }

  /**
   * Return a Map object that describes this DAG, but with only the IDs as
   * values.
   * @returns {!Map}
   */
  getIdG() {
    return [...this.G].reduce(
        (p, [k, s]) => p.set(grabId(k), new Set([...s].map(grabId))),
        new Map()
    )
  }

  /**
   * Compute the value of the DAG. That is, call the solve function in each
   * of the nodes. The result is stored in an array, and this array is passed
   * into the next node's solve function. Nodes are called to be solved in
   * topological order, meaning it is guaranteed that any input a node needs
   * will already have been calculated by a previous node.
   * @returns {*}
   */
  compute() {
    const m = removeOrphans(this.getIdG());
    const validTopoNodes = this.topo.filter(e => m.has(grabId(e)));
    const validTopoIds = validTopoNodes.map(grabId);
    const errs = [];
    const solutionArr = validTopoNodes.reduce((p, n) => {
          const [err, s] = n.clean().solve(p, validTopoIds);
          errs.push(err);
          p.push(s);
          return p;
        }, []);

    // console.log(solutionArr);
    // console.log(errs);

    return tail(solutionArr);
  }

  /**
   * Dump the DAG to a JSON string.
   * @returns {string}
   */
  dump() {
    return JSON.stringify({
      G: [...this.getIdG()].map(([k, s]) => [k, [...s]]),
      N: this.topo.map(e => e.dump())
    });
  }

  /**
   * @param {!string} json A valid DAG Json String.
   * @returns {boolean}
   */
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
          n._args = j.N.find(e => e.I === n.id).R;
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
 g.connect(C, B).connect(B, A).connect(A, g.root);
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


