import DataItem from "../../ui/DataItem";

function QuickSortStats({ stats, complexity, tookMs, arrayLength, order }) {
  const comp = complexity || {};

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <DataItem label="Comparisons">{stats.comparisons}</DataItem>
      <DataItem label="Swaps">{stats.swaps}</DataItem>
      <DataItem label="Partitions">{stats.partitions}</DataItem>
      <DataItem label="Max recursion depth">{stats.maxDepth}</DataItem>
      <DataItem label="Execution time">{tookMs.toFixed(2)} ms</DataItem>
      <DataItem label="Array size">{arrayLength}</DataItem>
      <DataItem label="Order">{order}</DataItem>
      <DataItem label="Pivot case">{comp.label || stats.pivotCase}</DataItem>
      <DataItem label="Best case">{comp.best || "O(n log n)"}</DataItem>
      <DataItem label="Average case">{comp.average || "O(n log n)"}</DataItem>
      <DataItem label="Worst case">{comp.worst || "O(n²)"}</DataItem>
      <DataItem label="Notes">
        {comp.notes || "Theoretical complexity for this pivot case."}
      </DataItem>
    </div>
  );
}

export default QuickSortStats;
