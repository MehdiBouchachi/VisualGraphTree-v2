export class BinaryHeap {
  constructor() {
    this.a = [];
  }
  p(i) {
    return Math.floor((i - 1) / 2);
  }
  l(i) {
    return 2 * i + 1;
  }
  r(i) {
    return 2 * i + 2;
  }
  insert(x) {
    this.a.push(x);
    this.up(this.a.length - 1);
  }
  up(i) {
    while (i > 0 && this.a[this.p(i)] < this.a[i]) {
      const p = this.p(i);
      [this.a[p], this.a[i]] = [this.a[i], this.a[p]];
      i = p;
    }
  }
  extractMax() {
    if (!this.a.length) return null;
    if (this.a.length === 1) return this.a.pop();
    const root = this.a[0];
    this.a[0] = this.a.pop();
    this.down(0);
    return root;
  }
  down(i) {
    const n = this.a.length;
    while (this.l(i) < n || this.r(i) < n) {
      const l = this.l(i),
        r = this.r(i);
      let L = i;
      if (l < n && this.a[l] > this.a[L]) L = l;
      if (r < n && this.a[r] > this.a[L]) L = r;
      if (L === i) break;
      [this.a[i], this.a[L]] = [this.a[L], this.a[i]];
      i = L;
    }
  }
}
