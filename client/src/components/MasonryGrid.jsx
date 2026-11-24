import { Children, useLayoutEffect, useRef } from 'react';
import { computeMasonryLayout } from '../utils/masonryLayout.js';
import './MasonryGrid.css';

export default function MasonryGrid({ children }) {
  const gridRef = useRef(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    // CSS Grid remains a usable, ordered fallback without ResizeObserver.
    if (!grid || typeof ResizeObserver === 'undefined') return;
    const items = [...grid.children];
    let frame;

    const layout = () => {
      const width = grid.getBoundingClientRect().width;
      if (!width) return;
      const css = getComputedStyle(grid);
      const gap = Number.parseFloat(css.getPropertyValue('--masonry-gap'));
      const minimum = Number.parseFloat(css.getPropertyValue('--masonry-min-column'));
      const columns = Math.max(1, Math.floor((width + gap) / (minimum + gap)));
      // columns * itemWidth + (columns - 1) * gap === containerWidth.
      const itemWidth = (width - (columns - 1) * gap) / columns;
      grid.style.setProperty('--masonry-columns', columns);
      grid.dataset.masonryReady = 'true';
      // Read natural heights only after the column widths are applied. Wrappers
      // don't transform on hover, so the existing card feedback can't move rows.
      const heights = items.map(item => Math.ceil(item.getBoundingClientRect().height));
      const result = computeMasonryLayout(heights, columns, gap);
      result.positions.forEach(({ column, top }, index) => {
        items[index].style.left = `${column * (itemWidth + gap)}px`;
        items[index].style.top = `${top}px`;
      });
      grid.style.height = `${result.height}px`;
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(layout);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(grid);
    items.forEach(item => observer.observe(item));
    layout();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      delete grid.dataset.masonryReady;
      grid.style.removeProperty('height');
      grid.style.removeProperty('--masonry-columns');
    };
  }, [children]);

  return (
    <div className="masonry-grid" ref={gridRef}>
      {Children.toArray(children).map((child) => (
        <div className="masonry-grid__item" key={child.key}>{child}</div>
      ))}
    </div>
  );
}
