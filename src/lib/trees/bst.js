class BstNode {
  constructor(key) {
    this.key = key;
    this.left = null;
    this.right = null;
  }
}

export class BST {
  constructor() {
    this.root = null;
  }

  insert(key) {
    if (!this.root) {
      this.root = new BstNode(key);
      return;
    }
    let cur = this.root,
      p = null;
    while (cur) {
      p = cur;
      cur = key < cur.key ? cur.left : cur.right;
    }
    if (key < p.key) p.left = new BstNode(key);
    else p.right = new BstNode(key);
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
      return n;
    };
    this.root = del(this.root, key);
  }

  height() {
    const h = (n) => (n ? 1 + Math.max(h(n.left), h(n.right)) : -1);
    return h(this.root);
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
  // >>> IMPORTANT for drawing
 edges() {
  return this.graph().edges;
}
}
