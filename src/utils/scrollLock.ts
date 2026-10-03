/**
 * Bulletproof, reference-counted body scroll lock utility.
 * Prevents background page scrolling (mouse wheel, touch gestures, trackpad)
 * when modals, drawers, popups, or overlays are open, while preserving exact
 * user scroll position and preventing layout shift from disappearing scrollbars.
 */

interface SavedStyles {
  bodyOverflow: string;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyWidth: string;
  bodyHeight: string;
  bodyPaddingRight: string;
  htmlOverflow: string;
  htmlOverscroll: string;
  scrollRestoration?: ScrollRestoration;
}

let lockCount = 0;
let originalScrollY = 0;
let savedStyles: SavedStyles | null = null;

export function lockBodyScroll(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  lockCount++;

  if (lockCount === 1) {
    // Record current scroll position across modern and legacy browsers
    originalScrollY =
      window.scrollY ??
      window.pageYOffset ??
      document.documentElement.scrollTop ??
      document.body.scrollTop ??
      0;

    // Save existing inline styles so we can restore them cleanly
    savedStyles = {
      bodyOverflow: document.body.style.overflow,
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyLeft: document.body.style.left,
      bodyWidth: document.body.style.width,
      bodyHeight: document.body.style.height,
      bodyPaddingRight: document.body.style.paddingRight,
      htmlOverflow: document.documentElement.style.overflow,
      htmlOverscroll: document.documentElement.style.overscrollBehavior,
      scrollRestoration: 'scrollRestoration' in window.history ? window.history.scrollRestoration : undefined,
    };

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Calculate scrollbar width to prevent horizontal layout shift on desktop
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Apply strict lock
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'contain';

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${originalScrollY}px`;
    document.body.style.left = '0px';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
  }
}

export function unlockBodyScroll(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (lockCount > 0) {
    lockCount--;
  }

  if (lockCount === 0 && savedStyles) {
    const scrollYToRestore = originalScrollY;

    // Restore original styles
    document.body.style.overflow = savedStyles.bodyOverflow;
    document.body.style.position = savedStyles.bodyPosition;
    document.body.style.top = savedStyles.bodyTop;
    document.body.style.left = savedStyles.bodyLeft;
    document.body.style.width = savedStyles.bodyWidth;
    document.body.style.height = savedStyles.bodyHeight;
    document.body.style.paddingRight = savedStyles.bodyPaddingRight;

    document.documentElement.style.overflow = savedStyles.htmlOverflow;
    document.documentElement.style.overscrollBehavior = savedStyles.htmlOverscroll;

    if (savedStyles.scrollRestoration && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = savedStyles.scrollRestoration;
    }

    savedStyles = null;

    // Restore exact scroll position seamlessly
    try {
      window.scrollTo({
        top: scrollYToRestore,
        left: 0,
        behavior: 'instant' as ScrollBehavior,
      });
    } catch {
      window.scrollTo(0, scrollYToRestore);
    }
  }
}
