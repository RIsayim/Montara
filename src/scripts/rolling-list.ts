import { gsap } from 'gsap';

export interface RollingListOptions {
  reducedMotion?: boolean;
  /** Use -1 when no item should be selected initially. */
  initialIndex?: number;
  onChange?: (nextIndex: number, previousIndex: number) => void;
}

export interface RollingListController {
  activate: (index: number) => void;
  destroy: () => void;
}

const initializedLists = new WeakMap<HTMLElement, RollingListController>();

/** The service-list label roll, shared by services and the main menu. */
export function initRollingList(
  container: HTMLElement,
  options: RollingListOptions = {},
): RollingListController {
  const existing = initializedLists.get(container);
  if (existing) return existing;

  const reducedMotion = options.reducedMotion
    ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const links = Array.from(container.querySelectorAll<HTMLElement>('[data-roll-item]'));
  const items = links.map((link) => ({
    link,
    regular: link.querySelector<HTMLElement>('[data-roll-regular]'),
    italic: link.querySelector<HTMLElement>('[data-roll-italic]'),
    timeline: null as gsap.core.Timeline | null,
    wasActive: link.classList.contains('is-active'),
    onMouseEnter: () => {},
    onFocus: () => {},
  }));
  const requestedIndex = options.initialIndex ?? 0;
  let activeIndex = Number.isInteger(requestedIndex)
    && requestedIndex >= 0
    && requestedIndex < items.length
    ? requestedIndex
    : -1;
  let destroyed = false;

  const setItem = (index: number, active: boolean, animate: boolean) => {
    const item = items[index];
    if (!item) return;

    item.timeline?.kill();
    item.timeline = null;
    item.link.classList.toggle('is-active', active);

    const { regular, italic } = item;
    if (!regular || !italic) return;

    gsap.killTweensOf([regular, italic]);

    if (!animate || reducedMotion) {
      gsap.set(regular, { y: 0, yPercent: active ? -105 : 0 });
      gsap.set(italic, { y: 0, yPercent: active ? 0 : 105 });
      return;
    }

    const outgoing = active ? regular : italic;
    const incoming = active ? italic : regular;

    item.timeline = gsap.timeline({
      defaults: { duration: 0.5, ease: 'power2.inOut' },
    })
      .to(outgoing, { y: 0, yPercent: -105 }, 0)
      .fromTo(incoming, { y: 0, yPercent: 105 }, {
        y: 0,
        yPercent: 0,
        duration: 0.85,
        ease: 'expo.out',
      }, 0.25);
  };

  const activate = (nextIndex: number) => {
    if (destroyed || !Number.isInteger(nextIndex) || nextIndex < -1 || nextIndex >= items.length) return;
    if (nextIndex === activeIndex) return;

    const previousIndex = activeIndex;
    setItem(previousIndex, false, true);
    setItem(nextIndex, true, true);
    activeIndex = nextIndex;
    options.onChange?.(nextIndex, previousIndex);
  };

  items.forEach((item, index) => {
    setItem(index, index === activeIndex, false);
    item.onMouseEnter = () => activate(index);
    item.onFocus = () => activate(index);
    item.link.addEventListener('mouseenter', item.onMouseEnter);
    item.link.addEventListener('focus', item.onFocus);
  });

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;

    items.forEach((item) => {
      item.link.removeEventListener('mouseenter', item.onMouseEnter);
      item.link.removeEventListener('focus', item.onFocus);
      item.timeline?.kill();
      item.link.classList.toggle('is-active', item.wasActive);
      const labels = [item.regular, item.italic].filter((label): label is HTMLElement => label !== null);
      gsap.killTweensOf(labels);
      gsap.set(labels, { clearProps: 'transform' });
    });

    initializedLists.delete(container);
  };

  const controller = { activate, destroy };
  initializedLists.set(container, controller);
  return controller;
}
