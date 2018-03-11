const rewire = require('rewire');
const be = require('be-sert');
const assert = require('assert');
const DAG = rewire('../math/dag.js');

describe('The mathCleaner function', () => {
  const mathCleaner = DAG.__get__('mathCleaner');
  it('allows simple math strings', () => {
    assert.strictEqual(mathCleaner('1 + 1'), '1 + 1');
  });
  it('allows complex math strings', () => {
    const m = '((1.23 ** -1.06) / (12 % 5)) / (2 * 6.1)';
    assert.strictEqual(mathCleaner(m), m);
  });
  it('allows references to variables via the "$"-notation', () => {
    const m = '(($1 ** -$2) / ($3 % $4)) / ($5 * $6)';
    assert.strictEqual(mathCleaner(m), m);
  });
  it('strips anything that is not math', () => {
    const m = 'No Math + here = there';
    const r = '  +   ';
    assert.strictEqual(mathCleaner(m), r);
  });
});

describe('The funcMaker function', () => {
  const funcMaker = DAG.__get__('funcMaker');
  it('when given a value, returns a function that returns that value', () => {
    const [err, f] = funcMaker(10);
    assert.strictEqual(err, null);
    assert.strictEqual(f(), 10);
  });

  it('when given a valid math string, returns a function ' +
      'that resolves the math', () => {
    const [err, f] = funcMaker('10 * 2 + 5');
    assert.strictEqual(err, null);
    assert.strictEqual(f(), 25);
  });

  it('when given a invalid input, returns a function ' +
      'that returns undefined', () => {
    const [err, f] = funcMaker('blah');
    assert.strictEqual(err, null);
    assert.strictEqual(f(), undefined);
  });

  it('even if the input is legal it may not be valid.', () => {
    const [err, f] = funcMaker('++ - *');
    assert.strictEqual(err, 'Could not make a function with "++ - *"');
    assert.strictEqual(f(), undefined);
  });

  it('If you want it to return a string, your string ' +
      'should be double quoted', () => {
    const [err, f] = funcMaker("'hello'");
    assert.strictEqual(err, null);
    assert.strictEqual(f(), 'hello');
  });

});


describe('When creating a DAG', () => {

  describe('a root node is automatically created', () => {
    const g = new DAG.DAG();
    const root = g.root;
    it('its can be accessed with the property getter "root"',
        () => assert.ok(g.root));
    it('its name is "ROOT"',
        () => assert.strictEqual(root.name, 'ROOT'));
    it('its ID is 0',
        () => assert.strictEqual(root.id, 0));
    it('its has no indegrees',
        () => assert.strictEqual(g.indegrees(g.root).length, 0));
    it('its has no outdegrees',
        () => assert.strictEqual(g.outdegrees(g.root).length, 0));
    it('the root node does not count as an orphan',
        () => be.equalsArrays(g.orphans, []));
    it('root node counts as a leaf',
        () => be.equalsArrays(g.leafs, [root]));
    it('the DAG is represented as a Map',
        () => assert.strictEqual(g.graph instanceof Map, true));
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
    let A1, A2, A3; // Placeholders for nodes we will create later.
    it('nodes are created with the "create" method',
        () => be.equalsArrays(g.nodes, [root, A, B, C, D, E, F]));
    it('nodes have names',
        () => be.equalsArrays(g.names, ['ROOT', 'A', 'B', 'C', 'D', 'E', 'F']));
    it('nodes have unique IDs',
        () => be.equalsArrays(g.ids, [0, 1, 2, 3, 4, 5, 6]));
    it('nodes are created as orphans',
        () => be.equalsArrays(g.orphans, [A, B, C, D, E, F]));
    it('they are also leaf nodes on creation',
        () => be.equalsArrays(g.leafs, [root, A, B, C, D, E, F]));
    it('nodes can be acceded by name',
        () => assert.deepStrictEqual(g.getAllByName('A'), [ A ]));
    it('creating nodes arn *not* idempotent. Multiple nodes can have ' +
        'the same name', () => {
      A1 = g.create('A');
      A2 = g.create('A');
      A3 = g.create('A');
      assert.deepStrictEqual(g.getAllByName('A'), [ A, A1, A2, A3 ])
    });
    it('nodes with the same name are not the same nodes', () => {
      be.aFalse(A === A1);
      be.aFalse(A === A2);
      be.aFalse(A === A3);
      be.aFalse(A1 === A2);
      be.aFalse(A1 === A3);
      be.aFalse(A2 === A3);
    });

    it('non-existent names is the empty array',
        () => assert.deepStrictEqual(g.getAllByName('Dummy'), []));
  });

  describe('Use the DAG to connect nodes', () => {
    const g = new DAG.DAG();
    const root = g.root;
    const A = g.create('A');
    const B = g.create('B');
    const C = g.create('C');
    const D = g.create('D');
    const E = g.create('E');
    const F = g.create('F');
    it('When B is connected to A, A has B in its indegrees', () => {
      g.connect(B, A);
      be.equalsArrays(g.indegrees(A), [B])
    });
    it('and B has A in its outdegrees', () => {
      be.equalsArrays(g.outdegrees(B), [A])
    });
    it('connecting nodes are idempotent. Creating the same connection ' +
        'multiple times makes no difference', () => {
      g.connect(B, A);
      g.connect(B, A);
      g.connect(B, A);
      g.connect(B, A);
      be.equalsArrays(g.outdegrees(B), [A]);
      be.equalsArrays(g.indegrees(A), [B]);
    });
    it('a connection that will result in a loop is illegal, ' +
        'and will not be honoured', () => {
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
    });
    it('a node can have multiple out degrees', () => {
      be.equalsArrays(g.outdegrees(F), [C, B]);
    });


  });

  describe('Use the DAG to sort, disconnect an delete nodes nodes', () => {
    const g = new DAG.DAG();
    const A = g.create('A');
    const B = g.create('B');
    const C = g.create('C');
    const D = g.create('D');
    const E = g.create('E');
    const F = g.create('F');
    g.connect(A, g.root)
        .connect(B, A)
        .connect(C, A)
        .connect(D, B)
        .connect(D, C)
        .connect(E, B)
        .connect(F, E)
        .connect(F, C)
        .connect(D, F);

    it('the graph has no orphans', () => {
        be.equalsArrays(g.orphans, [])
    });
    it('the graph can be topologically sorted', () => {
      assert.deepStrictEqual(g.topo, [ D, F, C, E, B, A, g.root ])
    });
    it('nodes can be disconnected', () => {
      g.disconnect(B, A);
      be.equalsArrays(g.outdegrees(B), []);
      be.equalsArrays(g.indegrees(A), [ C ]);
    });
    it('the disconnect left B ad an orphan', () => {
      be.equalsArrays(g.orphans, [ B ]);
    });
    it('Cleaning the graph, deletes all orphans and returns the graph. If' +
        'deleting an orphan produces another one, it in turn is also deleted.',
        () => {
          g.clean();
          be.equalsArrays(g.nodes, [g.root, A, C, D, F]);
        });
    it('cleaning the graph removes the nodes entirely', () => {
      be.equalsArrays(g.nodes, [g.root, A, C, D, F]);
      assert.deepStrictEqual(g.topo, [D, F, C, A, g.root]);
    });
    it('A node can be added back to the graph', () => {
      g.add(B);
      g.add(E);
      be.equalsArrays(g.nodes, [g.root, A, C, D, F, B, E]);
    });
    it('Adding a node back is idempotent', () => {
      g.add(B);
      g.add(B);
      g.add(B);
      g.add(B);
      g.add(B);
      be.equalsArrays(g.nodes, [g.root, A, C, D, F, B, E]);
    });
    it('Once added back, they can be connected again. Even though the graph' +
        'looks the same, the topo sort *may* differ - because of the order' +
        'in which nodes were added to the graph.', () => {
      g.connect(B, A).connect(E, B).connect(F, E).connect(D, B);
      assert.deepStrictEqual(g.topo, [ D, F, E, B, C, A, g.root ]);
    })
  });

  describe('Restrictions on a graph.', () => {
    // Create a graph, and all its nodes, but immediatly remove them from the
    // graph.
    const g = new DAG.DAG();
    const A = g.create('A');
    const B = g.create('B');
    const C = g.create('C');
    const D = g.create('D');
    const E = g.create('E');
    const F = g.create('F');
    g.clean();

    it('listing nodes, names or ids honours the order in ' +
        'which nodes are added to the graph', () => {
      g.add(B);
      g.add(F);
      g.add(D);
      g.add(A);
      g.add(C);
      g.add(E);
      assert.deepStrictEqual(g.nodes, [ g.root, B, F, D, A, C, E ]);
      assert.deepStrictEqual(g.names, ['ROOT', 'B', 'F', 'D', 'A', 'C', 'E' ]);
      assert.deepStrictEqual(g.ids, [ 0, 2, 6, 4, 1, 3, 5 ]);
    });
    it('Adding a node that with an ID that already ' +
        'exists in the graph is illegal, and does nothing', () => {

      // We use the graph to create the node.
      const ERR = g.create('ERR');
      be.equal(ERR.id, 7);
      assert.deepStrictEqual(g.ids, [ 0, 2, 6, 4, 1, 3, 5, 7 ]);

      // We then delete the node.
      g.del(ERR);
      assert.deepStrictEqual(g.ids, [ 0, 2, 6, 4, 1, 3, 5 ]);

      // We then change the node ID to any of the existing node ids.
      ERR.id = 1; // The same as A
      const result = g.add(ERR);

      // The result is false - no success.
      be.aFalse(result);
      // ...and the graph remains unchanged.
      assert.deepStrictEqual(g.ids, [ 0, 2, 6, 4, 1, 3, 5 ]);
    });

    it('you can not make root connect to something', () => {
      g.connect(g.root, A);
      be.equalsArrays(g.indegrees(A), []);
      be.equalsArrays(g.outdegrees(A), []);
      be.equalsArrays(g.indegrees(g.root), []);
      be.equalsArrays(g.outdegrees(g.root), []);
    });

    it('root only accepts one input. If already connected, it wont accept more',
        () => {
          g.connect(A, g.root);
          be.equalsArrays(g.outdegrees(A), [ g.root ]);
          be.equalsArrays(g.indegrees(g.root), [ A ]);

          // Now try and connect another
          g.connect(B, g.root);
          // B is not connected
          be.equalsArrays(g.outdegrees(B), []);
          // Root is only connected to A
          be.equalsArrays(g.indegrees(g.root), [ A ]);
    });

    it('A node must be a member of the graph before it can be connected', () => {

      // We use the graph to create the node, but then remove it from the graph
      const R = g.create('R');
      g.del(R);
      assert.deepStrictEqual(g.nodes, [ g.root, B, F, D, A, C, E ]);

      // Try and connect A -> R
      g.connect(A, R);
      assert.deepStrictEqual(g.nodes, [ g.root, B, F, D, A, C, E ]);

      //... or R -> A
      g.connect(R, A);
      assert.deepStrictEqual(g.nodes, [ g.root, B, F, D, A, C, E ]);

      // but once added to te graph, it can be connected.
      g.add(R);
      g.connect(R, A);
      assert.deepStrictEqual(g.nodes, [ g.root, B, F, D, A, C, E, R ]);

    });

  });

  describe('Nodes can carry a solution formula', () => {
    const g = new DAG.DAG();
    const A = g.create('A');
    const B = g.create('B');
    const C = g.create('C');

    it('A solution formula can be a raw number', () => {
      A.setSolve(14);
      assert.strictEqual(g.connect(A, g.root).compute(), 14)
    });

    it('A solution formula can be a a string formula', () => {
      A.setSolve('17 - 3');
      assert.strictEqual(g.compute(), 14)
    });

    it('The string may only contain arithmetic operators, numbers, ' +
        'grouping brackets, spaces and the $-glyph.' +
        'Anything else will be stripped.', () => {
      A.setSolve('balh-blah(17 - 3)');
      assert.strictEqual(g.compute(), -14);
    });

    it('If the cleaned string results in nonsensical math, ' +
        'the DAG returns undefined', () => {
      A.setSolve('blah - blah * blah');
      assert.strictEqual(g.compute(), undefined);
    });

    it('If the cleaned string results the empty string ' +
        'the DAG returns undefined', () => {
      A.setSolve('blah');
      assert.strictEqual(g.compute(), undefined);
    });

    it('A solution formula can reference a connecting node', () => {
      B.setSolve(17);
      g.connect(B, A);
      A.setSolve('$1 - 3');
      assert.strictEqual(g.compute(), 14)
    });

    it('It references its connecting node in order of addition', () => {
      C.setSolve(3);
      g.connect(C, A);
      A.setSolve('$1 - $2');
      assert.strictEqual(g.compute(), 14)
    });

    it('If the order of connections change, the order of reference changes', () => {
      C.setSolve(3);
      g.disconnect(B, A).connect(B, A);
      assert.strictEqual(g.compute(), -14)
    });

    it('If the solutions references a node that does not exist, the DAG returns undefined', () => {
      g.disconnect(B, A);
      assert.strictEqual(g.compute(),);
    });

    it('When the solution is fixed, it computes', () => {
      A.setSolve('$1');
      assert.equal(g.compute(), 3);
    });

  });

  describe('When DAG computes,', () => {
    const g = new DAG.DAG();
    const A = g.create('A');
    const B = g.create('B');
    const C = g.create('C');

    it('If nothing connects to the root node, the DAG computes to undefined', () => {
      assert.strictEqual(g.compute(), undefined)
    });

    it('If any of the connected nodes in the DAG does not have its solution ' +
        'formula, the DAG computes to undefined', () => {
      assert.strictEqual(g.connect(A, g.root).compute(), undefined)
    });

    it('it can solve itself', () => {
      A.setSolve('$1 * 2');
      B.setSolve('$1 + 5');
      C.setSolve(10);
      // The required result is (10 + 5) * 2 = 30
      const sol1 = g.connect(C, B).connect(B, A).connect(A, g.root).compute();
      assert.strictEqual(sol1, 30);

      // Modify the graph by adding a node and connecting it.
      const E = g.create('E').setSolve('$1 * 3');
      g.connect(E, B).connect(C, E);
      // Then modify the solver for node B to take advantage of its new connection
      B.setSolve('$1 - $2');
      assert.strictEqual(g.compute(), -40);

      // Modify the order in which the nodes are connected to B
      // The B node now has its 2 inputs swapped around.
      g.disconnect(C, B).connect(C, B);
      assert.strictEqual(g.compute(), 40);

      // Reorganizing the graph to have orphaned nodes.
      g.disconnect(B, A).connect(C, A);
      assert.strictEqual(g.compute(), 20);
      // Even though the nodes are still there...
      be.equalsArrays(g.nodes, [g.root, A, B, C, E]);

      // We can clean the graph (deleting the orphaned nodes) and the graph
      // produces the same output.
      g.clean();
      assert.strictEqual(g.compute(), 20);
      be.equalsArrays(g.nodes, [g.root, A, C]);
    })

  });

});