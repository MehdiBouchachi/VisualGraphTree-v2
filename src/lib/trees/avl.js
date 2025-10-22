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
const rotR = (y) => {
  const x = y.left,
    T2 = x?.right || null;
  x.right = y;
  y.left = T2;
  upd(y);
  upd(x);
  return x;
};
const rotL = (x) => {
  const y = x.right,
    T2 = y?.left || null;
  y.left = x;
  x.right = T2;
  upd(x);
  upd(y);
  return y;
};

export class AVL {
  constructor() {
    this.root = null;
  }

  insert(key) {
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
    const min = (n) => {
      let c = n;
      while (c.left) c = c.left;
      return c;
    };
    const del = (n, k) => {
      if (!n) return null;
      if (k < n.key) n.left = del(n.left, k);
      else if (k > n.key) n.right = del(n.right, k);
      else {
        if (!n.left) return n.right;
        if (!n.right) return n.left;
        const s = min(n.right);
        n.key = s.key;
        n.right = del(n.right, s.key);
      }
      upd(n);
      return this._reb(n);
    };
    this.root = del(this.root, key);
  }
  _reb(n) {
    const B = bf(n);
    if (B > 1) {
      if (bf(n.left) < 0) n.left = rotL(n.left);
      return rotR(n);
    } // LL/LR
    if (B < -1) {
      if (bf(n.right) > 0) n.right = rotR(n.right);
      return rotL(n);
    } // RR/RL
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
  // Add this new method
  graph() {
    const edges = [];
    const labels = new Map();
    const idOf = new Map(); // node object -> unique id
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

  // (Optional) Keep a backward-compatible edges() that uses unique ids

  // >>> IMPORTANT for drawing
  edges() {
    return this.graph().edges;
  }
}
