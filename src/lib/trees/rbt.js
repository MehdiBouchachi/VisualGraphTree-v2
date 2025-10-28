// Red-Black Tree with detailed debugSteps narration + validity checking

export class RBT {
  constructor() {
    // Single shared NIL sentinel (black leaf)
    this.NIL = {
      key: null,
      color: "B",
      left: null,
      right: null,
      parent: null,
    };

    this.root = this.NIL;

    // debugSteps: human-readable narration for last insert/delete
    this.debugSteps = [];
  }

  /* =========================
     Public API
  ========================= */

  insert(key) {
    if (key == null) return;
    // Skip duplicates: classic RBT doesn't insert existing key again
    if (this.search(key) !== this.NIL) return;

    this.debugSteps = [
      `Insert ${key}: new node ${key} starts RED (standard RBT rule)`,
    ];

    // Standard BST insert
    const z = {
      key,
      color: "R",
      left: this.NIL,
      right: this.NIL,
      parent: null,
    };

    let y = this.NIL;
    let x = this.root;
    while (x !== this.NIL) {
      y = x;
      x = key < x.key ? x.left : x.right;
    }
    z.parent = y;
    if (y === this.NIL) {
      this.root = z;
    } else if (key < y.key) {
      y.left = z;
    } else {
      y.right = z;
    }

    this.insertFixup(z);
  }

  delete(key) {
    this.debugSteps = [`Delete ${key}`];

    const z = this.search(key);
    if (z === this.NIL) {
      this.debugSteps.push(`Value ${key} not found → nothing to do`);
      return;
    }

    let y = z;
    let yOriginalColor = y.color;
    let x;

    if (z.left === this.NIL) {
      // Node has <=1 child on left
      x = z.right;
      this.debugSteps.push(
        `Node ${z.key} has at most one child → transplant ${z.key} with its right child`
      );
      this.rbTransplant(z, z.right);
    } else if (z.right === this.NIL) {
      x = z.left;
      this.debugSteps.push(
        `Node ${z.key} has at most one child → transplant ${z.key} with its left child`
      );
      this.rbTransplant(z, z.left);
    } else {
      // Two children: find inorder successor
      y = this.minimum(z.right);
      yOriginalColor = y.color;
      x = y.right;

      if (y.parent === z) {
        x.parent = y;
      } else {
        this.debugSteps.push(
          `Node ${z.key} has two children → use successor ${y.key}`
        );
        this.rbTransplant(y, y.right);
        y.right = z.right;
        y.right.parent = y;
      }

      this.rbTransplant(z, y);
      y.left = z.left;
      y.left.parent = y;
      // keep the original color of z at y
      const oldColor = y.color;
      y.color = z.color;
      this.debugSteps.push(
        `Replaced ${z.key} with successor ${y.key}, copied color ${oldColor}→${y.color}`
      );
    }

    // If we removed a black node from the tree, we may have broken black-height.
    if (yOriginalColor === "B") {
      this.deleteFixup(x);
    }
  }

  height() {
    const h = (n) => (n === this.NIL ? 0 : 1 + Math.max(h(n.left), h(n.right)));
    return h(this.root);
  }

  inorder() {
    const out = [];
    const dfs = (n) => {
      if (n === this.NIL) return;
      dfs(n.left);
      out.push(n.key);
      dfs(n.right);
    };
    dfs(this.root);
    return out;
  }

  bfsLevels() {
    const levels = [];
    if (this.root === this.NIL) return levels;
    const q = [{ node: this.root, depth: 0 }];
    while (q.length) {
      const { node, depth } = q.shift();
      if (!levels[depth]) levels[depth] = [];
      levels[depth].push(`${node.key}${node.color}`);
      if (node.left !== this.NIL) q.push({ node: node.left, depth: depth + 1 });
      if (node.right !== this.NIL)
        q.push({ node: node.right, depth: depth + 1 });
    }
    return levels;
  }

  graph() {
    if (this.root === this.NIL)
      return { edges: [], labels: new Map(), root: null };

    const edges = [];
    const labels = new Map();
    let idCounter = 0;
    const idMap = new Map(); // node -> string id

    const getId = (n) => {
      if (n === this.NIL) return null;
      if (!idMap.has(n)) {
        idMap.set(n, `${idCounter++}`);
      }
      return idMap.get(n);
    };

    const q = [this.root];
    while (q.length) {
      const n = q.shift();
      if (n === this.NIL) continue;

      const myId = getId(n);
      // label "10●" for red, "10○" for black
      labels.set(myId, `${n.key}${n.color === "R" ? "●" : "○"}`);

      if (n.left !== this.NIL) {
        const leftId = getId(n.left);
        edges.push([myId, leftId]);
        q.push(n.left);
      }
      if (n.right !== this.NIL) {
        const rightId = getId(n.right);
        edges.push([myId, rightId]);
        q.push(n.right);
      }
    }

    return { edges, labels, root: getId(this.root) };
  }

  /* =========================
     VALIDATOR (for teacher badge if you want it)
  ========================= */

  // Returns { ok: boolean, problems: string[] }
  // Checks:
  // 1. Root is black
  // 2. No red node has a red child
  // 3. All root→leaf paths have same black-height
  checkValidity() {
    const problems = [];

    if (this.root === this.NIL) {
      return { ok: true, problems: [] };
    }

    // Rule #1: root must be black
    if (this.root.color !== "B") {
      problems.push("Root is not black");
    }

    // We'll DFS to:
    // - detect red-red
    // - collect black-heights
    const blackHeights = [];

    const dfs = (node, blackCountSoFar, parentWasRed) => {
      if (node === this.NIL) {
        // NIL is a black leaf
        blackHeights.push(blackCountSoFar + 1);
        return;
      }

      // Rule #2: no red parent with red child
      if (parentWasRed && node.color === "R") {
        problems.push(
          `Red node ${node.key} has red parent ${node.parent?.key ?? "?"}`
        );
      }

      const add = node.color === "B" ? 1 : 0;
      dfs(node.left, blackCountSoFar + add, node.color === "R");
      dfs(node.right, blackCountSoFar + add, node.color === "R");
    };

    dfs(this.root, 0, false);

    // Rule #3: all black heights should match
    const minBH = Math.min(...blackHeights);
    const maxBH = Math.max(...blackHeights);
    if (minBH !== maxBH) {
      problems.push(
        `Black-height mismatch: min ${minBH}, max ${maxBH} (should be equal)`
      );
    }

    return { ok: problems.length === 0, problems };
  }

  /* =========================
     Internal helpers
  ========================= */

  search(key) {
    let x = this.root;
    while (x !== this.NIL && x.key !== key) {
      x = key < x.key ? x.left : x.right;
    }
    return x;
  }

  minimum(x) {
    while (x.left !== this.NIL) x = x.left;
    return x;
  }

  leftRotate(x) {
    const y = x.right;
    this.debugSteps.push(
      `Rotate LEFT at ${x.key} (so ${y.key} moves up, ${x.key} goes left)`
    );

    x.right = y.left;
    if (y.left !== this.NIL) y.left.parent = x;

    y.parent = x.parent;
    if (x.parent === this.NIL) {
      this.root = y;
    } else if (x === x.parent.left) {
      x.parent.left = y;
    } else {
      x.parent.right = y;
    }

    y.left = x;
    x.parent = y;
  }

  rightRotate(y) {
    const x = y.left;
    this.debugSteps.push(
      `Rotate RIGHT at ${y.key} (so ${x.key} moves up, ${y.key} goes right)`
    );

    y.left = x.right;
    if (x.right !== this.NIL) x.right.parent = y;

    x.parent = y.parent;
    if (y.parent === this.NIL) {
      this.root = x;
    } else if (y === y.parent.right) {
      y.parent.right = x;
    } else {
      y.parent.left = x;
    }

    x.right = y;
    y.parent = x;
  }

  insertFixup(z) {
    // Fix classic insert violations: parent is RED
    while (z.parent.color === "R") {
      if (z.parent === z.parent.parent.left) {
        const y = z.parent.parent.right; // uncle
        if (y.color === "R") {
          // Case: parent + uncle are RED -> recolor up
          this.debugSteps.push(
            `INSERT FIX: parent ${z.parent.key} RED and uncle ${y.key} RED → recolor {${z.parent.key}, ${y.key}} to BLACK and grandparent ${z.parent.parent.key} to RED`
          );
          z.parent.color = "B"; // parent: R -> B
          y.color = "B"; // uncle:  R -> B
          z.parent.parent.color = "R"; // grandparent: B -> R
          z = z.parent.parent; // continue fixing up the chain
        } else {
          // uncle is BLACK
          if (z === z.parent.right) {
            // triangle case (left-right)
            this.debugSteps.push(
              `INSERT FIX: triangle (node ${z.key} is right-child of RED parent ${z.parent.key}) → rotate LEFT at ${z.parent.key}`
            );
            z = z.parent;
            this.leftRotate(z);
          }
          // line case (left-left)
          this.debugSteps.push(
            `INSERT FIX: line case at grandparent ${z.parent.parent.key} → recolor parent ${z.parent.key} BLACK, grandparent ${z.parent.parent.key} RED, then rotate RIGHT at ${z.parent.parent.key}`
          );
          z.parent.color = "B";
          z.parent.parent.color = "R";
          this.rightRotate(z.parent.parent);
        }
      } else {
        // symmetric: parent is right child
        const y = z.parent.parent.left; // uncle
        if (y.color === "R") {
          this.debugSteps.push(
            `INSERT FIX: parent ${z.parent.key} RED and uncle ${y.key} RED → recolor {${z.parent.key}, ${y.key}} to BLACK and grandparent ${z.parent.parent.key} to RED`
          );
          z.parent.color = "B";
          y.color = "B";
          z.parent.parent.color = "R";
          z = z.parent.parent;
        } else {
          if (z === z.parent.left) {
            this.debugSteps.push(
              `INSERT FIX: triangle (node ${z.key} is left-child of RED parent ${z.parent.key}) → rotate RIGHT at ${z.parent.key}`
            );
            z = z.parent;
            this.rightRotate(z);
          }
          this.debugSteps.push(
            `INSERT FIX: line case at grandparent ${z.parent.parent.key} → recolor parent ${z.parent.key} BLACK, grandparent ${z.parent.parent.key} RED, then rotate LEFT at ${z.parent.parent.key}`
          );
          z.parent.color = "B";
          z.parent.parent.color = "R";
          this.leftRotate(z.parent.parent);
        }
      }
    }

    // Enforce black root
    if (this.root.color !== "B") {
      this.debugSteps.push(
        `Force root ${this.root.key} to BLACK to finish insert`
      );
      this.root.color = "B";
    }
    this.root.parent = this.NIL;
  }

  rbTransplant(u, v) {
    // standard RB transplant, just like CLRS
    if (u.parent === this.NIL) {
      this.root = v;
    } else if (u === u.parent.left) {
      u.parent.left = v;
    } else {
      u.parent.right = v;
    }
    v.parent = u.parent;
  }

  deleteFixup(x) {
    // We fix the "double black" problem if we removed a black node.
    while (x !== this.root && x.color === "B") {
      if (x === x.parent.left) {
        let w = x.parent.right; // sibling

        if (w.color === "R") {
          // Case 1: sibling red
          this.debugSteps.push(
            `DELETE FIX: sibling ${w.key} is RED → recolor ${w.key}: RED→BLACK, recolor parent ${x.parent.key}: BLACK→RED, then rotate LEFT at ${x.parent.key}`
          );
          w.color = "B";
          x.parent.color = "R";
          this.leftRotate(x.parent);
          w = x.parent.right;
        }

        // Now sibling w is BLACK
        if (w.left.color === "B" && w.right.color === "B") {
          // Case 2: sibling black with 2 black children
          this.debugSteps.push(
            `DELETE FIX: sibling ${w.key} is BLACK and both children BLACK → recolor ${w.key} BLACK→RED and move problem up to parent ${x.parent.key}`
          );
          w.color = "R"; // black->red
          x = x.parent; // push double black up
        } else {
          // Case 3 / Case 4
          if (w.right.color === "B") {
            // Case 3: inner-nephew red, outer black
            this.debugSteps.push(
              `DELETE FIX: sibling ${w.key} 'inner' child ${w.left.key} is RED but 'outer' child is BLACK → recolor ${w.left.key} RED→BLACK, recolor ${w.key} BLACK→RED, rotate RIGHT at ${w.key}`
            );
            w.left.color = "B";
            w.color = "R";
            this.rightRotate(w);
            w = x.parent.right;
          }

          // Case 4: outer child red
          this.debugSteps.push(
            `DELETE FIX: sibling ${w.key} 'outer' child ${w.right.key} is RED → copy parent ${x.parent.key} color to ${w.key}, set parent ${x.parent.key} to BLACK, set ${w.right.key} to BLACK, rotate LEFT at ${x.parent.key}`
          );
          w.color = x.parent.color;
          x.parent.color = "B";
          w.right.color = "B";
          this.leftRotate(x.parent);

          x = this.root; // finished
        }
      } else {
        // symmetric: x is right child, w is left sibling
        let w = x.parent.left;

        if (w.color === "R") {
          this.debugSteps.push(
            `DELETE FIX: sibling ${w.key} is RED → recolor ${w.key} RED→BLACK, recolor parent ${x.parent.key} BLACK→RED, then rotate RIGHT at ${x.parent.key}`
          );
          w.color = "B";
          x.parent.color = "R";
          this.rightRotate(x.parent);
          w = x.parent.left;
        }

        if (w.right.color === "B" && w.left.color === "B") {
          this.debugSteps.push(
            `DELETE FIX: sibling ${w.key} is BLACK and both children BLACK → recolor ${w.key} BLACK→RED and move problem up to parent ${x.parent.key}`
          );
          w.color = "R";
          x = x.parent;
        } else {
          if (w.left.color === "B") {
            this.debugSteps.push(
              `DELETE FIX: sibling ${w.key} 'inner' child ${w.right.key} is RED but 'outer' child is BLACK → recolor ${w.right.key} RED→BLACK, recolor ${w.key} BLACK→RED, rotate LEFT at ${w.key}`
            );
            w.right.color = "B";
            w.color = "R";
            this.leftRotate(w);
            w = x.parent.left;
          }

          this.debugSteps.push(
            `DELETE FIX: sibling ${w.key} 'outer' child ${w.left.key} is RED → copy parent ${x.parent.key} color to ${w.key}, set parent ${x.parent.key} to BLACK, set ${w.left.key} to BLACK, rotate RIGHT at ${x.parent.key}`
          );
          w.color = x.parent.color;
          x.parent.color = "B";
          w.left.color = "B";
          this.rightRotate(x.parent);

          x = this.root;
        }
      }
    }

    if (x.color !== "B") {
      this.debugSteps.push(
        `Final step: set ${x.key} color ${x.color}→BLACK to clear double-black`
      );
    }
    x.color = "B";

    this.debugSteps.push(
      `Delete fixup finished → root is ${this.root.key} (${this.root.color}), black-heights restored`
    );
  }
}
