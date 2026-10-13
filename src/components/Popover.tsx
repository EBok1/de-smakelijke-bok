'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

interface PopoverProps {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}

const WIDTH = 272; // px, matches w-68
const GAP = 8;

/**
 * Small panel under a button. Rendered in a portal so it is not clipped by
 * card overflow, and so clicks inside it never reach a surrounding <Link>.
 */
export default function Popover({ anchorRef, open, onClose, label, children }: PopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // top or bottom (whichever side has room), left, and the height it may use
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number; maxHeight: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    // Right-align with the button, but keep 8px from both viewport edges
    const left = Math.min(
      Math.max(GAP, rect.right - WIDTH),
      window.innerWidth - WIDTH - GAP,
    );
    // Open upwards when the button sits in the lower half of the screen
    const below = window.innerHeight - rect.bottom;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- placement needs the measured button
    setPos(
      below >= rect.top
        ? { top: rect.bottom + GAP, left, maxHeight: below - 2 * GAP }
        : { bottom: window.innerHeight - rect.top + GAP, left, maxHeight: rect.top - 2 * GAP },
    );
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        anchorRef.current?.focus();
      }
    };
    // The panel is position: fixed, so it would drift away from its button on scroll
    const onScroll = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onClose);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label={label}
      className="popover"
      style={{ ...pos, width: WIDTH, overflowY: 'auto' }}
      // React events bubble through portals to the component tree; stop them
      // here so a card's <Link> doesn't navigate when the panel is used
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  );
}
