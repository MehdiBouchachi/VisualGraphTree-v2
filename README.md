
# Graph & Algorithms Visualizer by Mehdi Bouchachi and Idriss Kebladj.

### TP1 · TP2 · TP3 · TP4 — Full React Application

This project is a complete **interactive educational platform** for visualizing classical algorithms in Computer Science.
It includes graph tools, binary trees, search trees, sorting algorithms, and advanced graph algorithms such as **Dijkstra** and **DSatur coloring**.

The application is written in **React + Styled-Components** and designed for teaching, debugging, and demonstrations.

---

## 1. Features Overview

### **TP1 – Graph Visualizer**

* CSV import and sample datasets
* Circular & grid layouts
* Zoom, pan, node size adjustments
* Degree-based node sizing
* SVG export
* Graph metrics: nodes, edges, density, average degree

---

### **TP1 – Trees**

* Full support for BST, AVL, Red-Black Tree, and Binary Heap
* Live insertion & deletion with animations
* Before/after visual comparison
* Tree metrics (height, BFS levels, inorder traversal)
* Smooth layout + zoom + pan

---

### **TP2 – Search Trees**

* Unified editor for BST, AVL, RBT, and Heap
* Insert/delete operations with explanations
* Rotation steps for AVL & RBT
* Red-Black Tree validity checker
* Before/after tree snapshots

---

### **TP3 – Sorting Algorithms**

* QuickSort with **instrumented** steps
* Pivot strategies: last, first, median-of-three, random
* Full visual playback (Prev, Next, Auto-play)
* Partition tree visualization
* Statistics: swaps, comparisons, recursive calls, complexity
* Custom list editor

---

### **TP4 – Graph Algorithms Playground**

A 3-part environment combining graph creation + algorithm animations:

#### **1. Graph Builder**

* Add/remove nodes
* Rename nodes
* Add/remove edges
* Set weights
* Directed or undirected mode
* Random graph generator
* Real-time SVG preview

#### **2. Dijkstra Shortest Path (PCC)**

* Step-by-step execution
* Auto-play with configurable speed
* Relaxation events shown with before/after
* Distance + predecessor table
* Reconstructed shortest path (PCC)
* Highlighted path edges & nodes

#### **3. DSATUR Graph Coloring**

* Step-by-step coloring logic
* Saturation updates
* Color assignment (c0, c1, c2, …)
* Auto-play mode
* Table of colors, saturation, degrees
* Final chromatic number estimate

---

## 2. Tech Stack

* **React 18**
* **Styled-Components**
* **Custom SVG rendering engine** for graph & tree layouts
* **Instrumented algorithm implementations** (no external libraries):

  * `lib/graphs/` → Dijkstra, DSATUR
  * `lib/trees/` → BST, AVL, RBT, Heap
  * `lib/sorts/` → QuickSort instrumentation

---

## 3. Installation

### **Requirements**

* Node.js **18+**
* npm / yarn / pnpm

All instructions below use **npm**.

---

### **Clone & Setup**

```bash
git clone <your-repository-url>
cd <your-folder>
npm install
```

---

### **Run Development Server**

```bash
npm run dev
```

The app will be served at:

```
http://localhost:5173
```

---

### **Build for Production**

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 4. Project Structure

```
src/
│
├─ pages/
│   ├─ TP1GraphsPage.jsx
│   ├─ TP1TreesPage.jsx
│   ├─ TP2SearchPage.jsx
│   ├─ TP3SortsPage.jsx
│   └─ TP4Page.jsx
│
├─ features/
│   ├─ tp/
│   │   ├─ TP1Graphs.jsx
│   │   ├─ TP1TreesBasics.jsx
│   │   ├─ TP2SearchTrees.jsx
│   │   ├─ TP3Sorts.jsx
│   │   ├─ TP4DijkstraSection.jsx
│   │   ├─ TP4DsaturSection.jsx
│   │   └─ TP4PCCColor.jsx
│
├─ lib/
│   ├─ graphs/         # Dijkstra, DSATUR
│   ├─ trees/          # BST, AVL, RBT, Heap + layout
│   └─ sorts/          # QuickSort instrumentation
│
└─ ui/                 # Reusable UI components
```

---

## 5. How to Use

### **TP1 — Graphs**

1. Enter or import graph data
2. Adjust layout (circular/grid)
3. Zoom, pan, resize nodes
4. View metrics and export SVG

---

### **TP1 — Trees**

1. Insert values (comma or space separated)
2. Delete nodes
3. Inspect metrics: height, inorder, BFS
4. Visualize structure with pan/zoom

---

### **TP2 — Search Trees**

1. Select structure (BST, AVL, RBT, Heap)
2. Insert/delete nodes
3. View rotation/recoloring steps
4. Compare before/after
5. Check Red-Black Tree validity

---

### **TP3 — QuickSort**

1. Choose pivot strategy
2. Generate random list or add custom list
3. Step through algorithm or enable autoplay
4. Explore partition tree + complexity

---

### **TP4 — Graph Algorithms**

#### **Step 1: Build graph**

* Add nodes
* Add weighted edges
* Directed/undirected
* Random generator

#### **Step 2: Dijkstra**

* Pick source & target
* Run step-by-step
* Inspect relaxation table
* View final shortest path

#### **Step 3: DSATUR**

* Run coloring
* Follow saturation updates
* See assigned colors per node

---

## 6. Troubleshooting

### **Blank screen / nothing appears**

Your graph might be empty. Reset via TP4 → Quick Generate or add nodes manually.

### **Styled-Components not working**

Ensure the dependency is installed:

```bash
npm install styled-components
```

### **Hot reload issues**

Restart dev server:

```bash
npm run dev
```

---

## 8. Author

Developed as a complete educational toolkit for algorithm visualization:
Graphs, Trees, Sorting, Dijkstra, and DSATUR Coloring.

