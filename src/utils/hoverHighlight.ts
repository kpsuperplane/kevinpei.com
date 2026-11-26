export function initHoverHighlights(): void {
  for (const group of document.querySelectorAll<HTMLElement>('[data-hover-group]')) {
    let activeItem: HTMLElement | null = null;

    const positionHighlight = (item: HTMLElement): void => {
      const groupBounds = group.getBoundingClientRect();
      const itemBounds = item.getBoundingClientRect();
      group.style.setProperty('--hover-x', `${itemBounds.left - groupBounds.left}px`);
      group.style.setProperty('--hover-y', `${itemBounds.top - groupBounds.top}px`);
      group.style.setProperty('--hover-width', `${itemBounds.width}px`);
      group.style.setProperty('--hover-height', `${itemBounds.height}px`);
    };

    group.addEventListener('pointerover', (event) => {
      if (event.pointerType !== 'mouse' || !(event.target instanceof Element)) return;

      const item = event.target.closest<HTMLElement>('[data-hover-item]');
      if (!item || !group.contains(item) || item === activeItem) return;

      group.toggleAttribute('data-hover-slide', activeItem !== null);
      activeItem = item;
      positionHighlight(item);
      group.setAttribute('data-hover-active', '');
    });

    const clearHighlight = (): void => {
      activeItem = null;
      group.removeAttribute('data-hover-active');
    };

    group.addEventListener('pointerleave', clearHighlight);
    group.addEventListener('pointercancel', clearHighlight);

    new ResizeObserver(() => {
      if (activeItem) positionHighlight(activeItem);
    }).observe(group);
  }
}
