class AvlNode {
  constructor(key) {
    this.key = key;
    this.left = null;
    this.right = null;
    this.h = 0;
  }
}

const H = (n) => (n ? n.h : -1);
const upd = (n) => {
  n.h = 1 + Math.max(H(n.left), H(n.right));
};
const bf = (n) => (n ? H(n.left) - H(n.right) : 0);

function rotR(y) {
  const x = y.left;
  const T2 = x?.right || null;
  x.right = y;
  y.left = T2;
  upd(y);
  upd(x);
  return x;
}

function rotL(x) {
  const y = x.right;
  const T2 = y?.left || null;
  y.left = x;
  x.right = T2;
  upd(x);
  upd(y);
  return y;
}

export class AVL {
  constructor() {
    this.root = null;
    this.debugSteps = []; // <- NEW
  }

  insert(key) {
    // reset debug steps for this operation
    this.debugSteps = [`Insert ${key}`];

    const ins = (n, k) => {
      if (!n) return new AvlNode(k);
      if (k < n.key) n.left = ins(n.left, k);
      else n.right = ins(n.right, k);
      upd(n);
      return this._reb(n);
    };

    this.root = ins(this.root, key);
  }

  delete(key) {
    this.debugSteps = [`Delete ${key}`];

    const min = (n) => {
      let c = n;
      while (c.left) c = c.left;
      return c;
    };

    const del = (n, k) => {
      if (!n) return null;
      if (k < n.key) {
        n.left = del(n.left, k);
      } else if (k > n.key) {
        n.right = del(n.right, k);
      } else {
        // found node to delete
        if (!n.left && !n.right) {
          this.debugSteps.push(`Removed leaf ${n.key}`);
          return null;
        } else if (!n.left || !n.right) {
          this.debugSteps.push(
            `Removed ${n.key} with 1 child (promoted its child)`
          );
          return n.left || n.right;
        } else {
          const s = min(n.right);
          this.debugSteps.push(
            `Removed ${n.key} with 2 children, replaced with inorder successor ${s.key}`
          );
          n.key = s.key;
          n.right = del(n.right, s.key);
        }
      }
      upd(n);
      return this._reb(n);
    };

    this.root = del(this.root, key);
  }

  _reb(n) {
    const B = bf(n);

    // Left heavy
    if (B > 1) {
      // Left-Right
      if (bf(n.left) < 0) {
        this.debugSteps.push(
          `Left-Right case at ${n.key}: rotate left on ${n.left.key}, then rotate right on ${n.key}`
        );
        n.left = rotL(n.left);
        return rotR(n);
      } else {
        // Left-Left
        this.debugSteps.push(
          `Right rotation at ${n.key} (Left-Left case, balance=${B})`
        );
        return rotR(n);
      }
    }

    // Right heavy
    if (B < -1) {
      // Right-Left
      if (bf(n.right) > 0) {
        this.debugSteps.push(
          `Right-Left case at ${n.key}: rotate right on ${n.right.key}, then rotate left on ${n.key}`
        );
        n.right = rotR(n.right);
        return rotL(n);
      } else {
        // Right-Right
        this.debugSteps.push(
          `Left rotation at ${n.key} (Right-Right case, balance=${B})`
        );
        return rotL(n);
      }
    }

    return n;
  }

  height() {
    return H(this.root);
  }

  bfsLevels() {
    const lv = [];
    if (!this.root) return lv;
    const q = [[this.root, 0]];
    while (q.length) {
      const [nd, d] = q.shift();
      (lv[d] ??= []).push(nd.key);
      if (nd.left) q.push([nd.left, d + 1]);
      if (nd.right) q.push([nd.right, d + 1]);
    }
    return lv;
  }

  inorder() {
    const out = [];
    (function dfs(n) {
      if (!n) return;
      dfs(n.left);
      out.push(n.key);
      dfs(n.right);
    })(this.root);
    return out;
  }

  graph() {
    const edges = [];
    const labels = new Map();
    const idOf = new Map();
    let counter = 0;

    const getId = (node) => {
      if (!node) return null;
      if (!idOf.has(node)) {
        const id = `${node.key}|${counter++}`;
        idOf.set(node, id);
        labels.set(id, String(node.key));
      }
      return idOf.get(node);
    };

    (function walk(n) {
      if (!n) return;
      const p = getId(n);
      if (n.left) {
        const c = getId(n.left);
        edges.push([p, c]);
        walk(n.left);
      }
      if (n.right) {
        const c = getId(n.right);
        edges.push([p, c]);
        walk(n.right);
      }
    })(this.root);

    return { edges, labels, root: getId(this.root) };
  }

  edges() {
    return this.graph().edges;
  }
}
