import { useEffect } from 'react';
import { lockBodyScroll, unlockBodyScroll } from '../utils/scrollLock';

/**
 * Custom React hook to lock body scrolling when an overlay, modal, drawer,
 * or popup is mounted or active. Restores scrolling on unmount or when `isLocked` becomes false.
 *
 * @param isLocked boolean indicating if body scrolling should be locked
 */
export function useScrollLock(isLocked: boolean = true): void {
  useEffect(() => {
    if (!isLocked) return;

    lockBodyScroll();

    return () => {
      unlockBodyScroll();
    };
  }, [isLocked]);
}
