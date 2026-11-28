import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

type Pos = { x: number; y: number };
const SIZE = 60;
const MARGIN = 8;
const STORAGE_KEY = 'cart_fab_pos';
const CLICK_THRESHOLD = 6;

function clamp(pos: Pos): Pos {
  const maxX = Math.max(MARGIN, window.innerWidth - SIZE - MARGIN);
  const maxY = Math.max(MARGIN, window.innerHeight - SIZE - MARGIN);
  return {
    x: Math.min(maxX, Math.max(MARGIN, pos.x)),
    y: Math.min(maxY, Math.max(MARGIN, pos.y)),
  };
}

function defaultPos(): Pos {
  if (typeof window === 'undefined') return { x: 16, y: 16 };
  return clamp({ x: window.innerWidth - SIZE - 16, y: window.innerHeight - SIZE - 16 });
}

function loadPos(): Pos {
  if (typeof window === 'undefined') return { x: 16, y: 16 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPos();
    const parsed = JSON.parse(raw) as Partial<Pos>;
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
      return clamp({ x: parsed.x, y: parsed.y });
    }
  } catch {}
  return defaultPos();
}

export default function FloatingCartButton({
  count,
  isOpen,
  onOpen,
  hidden: hiddenProp = false,
}: {
  count: number;
  isOpen: boolean;
  onOpen: () => void;
  hidden?: boolean;
}) {
  const [pos, setPos] = useState<Pos>(() => loadPos());
  const [isInteracting, setIsInteracting] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    const onResize = () => setPos((p) => clamp(p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    setIsInteracting(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: posRef.current.x,
      originY: posRef.current.y,
      moved: false,
    };
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) > CLICK_THRESHOLD) drag.moved = true;
    if (drag.moved) {
      const next = clamp({ x: drag.originX + dx, y: drag.originY + dy });
      setPos(next);
    }
  }, []);

  const finishDrag = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setIsInteracting(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posRef.current));
    } catch {}
    if (!drag.moved) onOpen();
  }, [onOpen]);

  const hidden = isOpen || hiddenProp;
  const imgSrc = count > 0 ? '/cart-full.png' : '/cart-empty.png';

  return (
    <button
      type="button"
      aria-label={count > 0 ? `Abrir carrito, ${count} artículos` : 'Abrir carrito'}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      className="floating-cart-btn"
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: SIZE,
        height: SIZE,
        zIndex: 900,
        borderRadius: '9999px',
        border: 'none',
        padding: 0,
        background: 'transparent',
        cursor: 'grab',
        touchAction: 'none',
        userSelect: 'none',
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? 'none' : 'auto',
        transition: 'opacity 180ms ease',
      }}
      data-testid="button-floating-cart"
    >
      <img
        src={imgSrc}
        alt=""
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', opacity: isInteracting ? 1 : 0.6, transition: 'opacity .3s ease' }}
      />
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            minWidth: 22,
            height: 22,
            padding: '0 5px',
            borderRadius: 999,
            background: '#d64545',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            lineHeight: '22px',
            textAlign: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,.25)',
            pointerEvents: 'none',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
