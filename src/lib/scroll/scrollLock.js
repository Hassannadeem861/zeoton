// Shared page scroll lock for drawers, menus and sheets.
// - Reference-counted, so overlapping overlays can't unlock each other early.
// - Pauses Lenis while locked (Lenis drives the scroll itself, so CSS alone isn't enough).
// - Compensates for the scrollbar width to avoid a layout jump on desktop.
let lenis = null;
let locks = 0;
let saved = null;

export function registerLenis(instance) {
  lenis = instance;
  if (lenis && locks > 0) lenis.stop();
}

export function lockScroll() {
  if (typeof document === 'undefined') return () => {};
  if (locks === 0) {
    const html = document.documentElement;
    const scrollbar = window.innerWidth - html.clientWidth;
    saved = { overflow: html.style.overflow, paddingRight: document.body.style.paddingRight };
    html.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    lenis?.stop();
  }
  locks += 1;

  let released = false;
  return function unlockScroll() {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    if (locks === 0 && saved) {
      document.documentElement.style.overflow = saved.overflow;
      document.body.style.paddingRight = saved.paddingRight;
      saved = null;
      lenis?.start();
    }
  };
}
