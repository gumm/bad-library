const R = require('ramda');
const be = require('be-sert');
const assert = require('assert');
const DAG = require('../math/dag.js');


describe('When creating a DAG', () => {

  describe('a root node is automatically created', () => {
    const g = new DAG.DAG();
    const root = g.root;
    it('its can be accessed with the property getter "root"', () => assert.ok(g.root));
    it('its name is "ROOT"', () => assert.strictEqual(root.name, 'ROOT'));
    it('its ID is 0', () => assert.strictEqual(root.id, 0));
    it('its has no indegrees', () => assert.strictEqual(g.indegrees(g.root).length, 0));
    it('its has no outdegrees', () => assert.strictEqual(g.outdegrees(g.root).length, 0));
    it('the root node does not count as an orphan', () => be.equalsArrays(g.orphans, []));
    it('root node counts as a leaf', () => be.equalsArrays(g.leafs, [root]));
    it('the DAG is represented as a Map', () => assert.strictEqual(g.graph instanceof Map, true));
  });

  describe('Use the DAG to create nodes', () => {
    const g = new DAG.DAG();
    const root = g.root;
    const A = g.create('A');
    const B = g.create('B');
    const C = g.create('C');
    const D = g.create('D');
    const E = g.create('E');
    const F = g.create('F');
    it('Nodes are created with the "create" method', () => be.equalsArrays(g.nodes, [ root, A, B, C, D, E, F ]));
    it('Nodes have names', () => be.equalsArrays(g.names, [ 'ROOT', 'A', 'B', 'C', 'D', 'E', 'F' ]));
    it('Nodes have unique IDs', () => be.equalsArrays(g.ids, [ 0, 1, 2, 3, 4, 5, 6 ]));
    it('nodes are created as orphans', () => be.equalsArrays(g.orphans, [ A, B, C, D, E, F ]));
    it('the are also leaf nodes on creation', () => be.equalsArrays(g.leafs, [ root, A, B, C, D, E, F ]));
    it('a node can be acceded by name', () => assert.deepStrictEqual(g.getNodeByName('A'), A));
    it('non-existent names are undefined', () => be.aUndefined(g.getNodeByName('dummy')));

    it('When B is connected to A, A has B in its indegrees', () => {
      g.connect(B, A);
      be.equalsArrays(g.indegrees(A), [B])
    });
    it('and B has A in its outdegrees', () => {
      be.equalsArrays(g.outdegrees(B), [A])
    });
    it(`connecting nodes are idempotent. 
    Creating the same connection multiple times makes no difference`, () => {
      g.connect(B, A);
      g.connect(B, A);
      g.connect(B, A);
      g.connect(B, A);
      be.equalsArrays(g.outdegrees(B), [A]);
      be.equalsArrays(g.indegrees(A), [B]);
    });

    it('a connection that will result in a loop is illegal, and will not be honoured', () => {
      g.connect(A, B);
      be.equalsArrays(g.outdegrees(B), [A]);
      be.equalsArrays(g.indegrees(A), [B]);
    });

    it('a node can have multiple in degrees', () => {
      g.connect(C, A);
      g.connect(D, A);
      be.equalsArrays(g.outdegrees(B), [A]);
      be.equalsArrays(g.outdegrees(C), [A]);
      be.equalsArrays(g.outdegrees(D), [A]);
      be.equalsArrays(g.indegrees(A), [B, C, D]);
    });

    it('but the root node can not. It can only have one in degree.', () => {
      g.connect(A, root);
      be.equalsArrays(g.outdegrees(A), [root]);
      be.equalsArrays(g.indegrees(root), [A]);
      // This has no effect.
      g.connect(B, root);
      be.equalsArrays(g.outdegrees(A), [root]);
      be.equalsArrays(g.indegrees(root), [A]);
    });

    it('connections can be chained', () => {
      g.connect(D, E).connect(E, F).connect(F, C).connect(F, B).connect(E, C);
      be.equalsArrays(g.outdegrees(D), [A, E]);
      be.equalsArrays(g.outdegrees(E), [F, C]);
      be.equalsArrays(g.outdegrees(F), [C, B]);
      console.log(g.graph);
    });



  })

});