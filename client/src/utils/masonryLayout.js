// Source order stays unchanged. Each next item occupies the shortest column;
// ties go left to right, matching visual reading and keyboard order.
export function computeMasonryLayout(heights, columns, gap) {
  const count = Number.isFinite(columns) ? Math.max(1, Math.floor(columns)) : 1;
  const spacing = Number.isFinite(gap) ? Math.max(0, gap) : 0;
  const bottoms = Array(count).fill(0);
  const positions = heights.map((height) => {
    const column = bottoms.indexOf(Math.min(...bottoms));
    const top = bottoms[column];
    bottoms[column] += (Number.isFinite(height) ? Math.max(0, height) : 0) + spacing;
    return { column, top };
  });
  return { positions, height: heights.length ? Math.max(...bottoms) - spacing : 0 };
}
