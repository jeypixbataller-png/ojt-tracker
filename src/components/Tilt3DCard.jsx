import { useRef, useCallback } from 'react';

export default function Tilt3DCard({ children, className = '', style = {}, intensity = 8, ...rest }) {
  const ref = useRef(null);

  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    el.style.transform = `perspective(600px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale(1.02)`;
  }, [intensity]);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = 'perspective(600px) rotateY(0) rotateX(0) scale(1)';
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transition: 'transform .25s cubic-bezier(.34,1.2,.64,1)', willChange: 'transform', ...style }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {children}
    </div>
  );
}
