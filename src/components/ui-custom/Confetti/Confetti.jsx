import { useEffect, useState, useMemo } from 'react';

const CONFETTI_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#facc15', // yellow
  '#22c55e', // green
  '#ec4899', // pink
  '#a855f7', // purple
  '#f97316', // orange
  '#22d3ee', // cyan
];

const CONFETTI_SHAPES = ['circle', 'square', 'rectangle'];

function ConfettiPiece({ params }) {
  const [style, setStyle] = useState({
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: params.size,
    height: params.shape === 'rectangle' ? params.size * 0.4 : params.size,
    backgroundColor: params.color,
    borderRadius: params.shape === 'circle' ? '50%' : params.shape === 'square' ? '2px' : '1px',
    opacity: 0,
    transform: 'translate(-50%, -50%) scale(0)',
    pointerEvents: 'none',
  });

  useEffect(() => {
    const startTime = performance.now();
    const totalDuration = params.duration * 1000;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime - (params.delay * 1000);

      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / totalDuration, 1);

      let x, y, scale, opacity, rotation;

      if (progress < 0.15) {
        // Explosion phase - burst outward and up
        const phaseProgress = progress / 0.15;
        const eased = 1 - Math.pow(1 - phaseProgress, 3);
        x = params.x * eased * 0.6;
        y = params.yUp * eased;
        scale = eased;
        opacity = 1;
        rotation = params.rotation * eased * 0.3;
      } else {
        // Fall phase - drift outward and fall down
        const phaseProgress = (progress - 0.15) / 0.85;
        const eased = phaseProgress;
        x = params.x * 0.6 + params.x * 0.4 * eased;
        y = params.yUp + (params.yDown - params.yUp) * eased;
        scale = 1;
        opacity = 1 - (phaseProgress * phaseProgress);
        rotation = params.rotation * (0.3 + 0.7 * eased);
      }

      setStyle(prev => ({
        ...prev,
        opacity,
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rotation}deg) scale(${scale})`,
      }));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [params]);

  return <div style={style} />;
}

// Confetti explosion celebration effect
export default function Confetti({
  active = false,
  count = 60,
  duration = 3000,
  onComplete
}) {
  const [pieces, setPieces] = useState([]);

  const pieceParams = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.5;
      const velocity = 120 + Math.random() * 180;
      return {
        x: Math.cos(angle) * velocity,
        yUp: -(80 + Math.random() * 120),
        yDown: 250 + Math.random() * 350,
        rotation: Math.random() * 720 - 360,
        size: Math.random() * 8,
        delay: Math.random() * 0.1,
        duration: 1.8 + Math.random() * 0.8,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
      };
    });
  }, [active, count]);

  useEffect(() => {
    if (active) {
      setPieces(Array.from({ length: count }, (_, i) => i));

      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setPieces([]);
    }
  }, [active, count, duration, onComplete]);

  if (pieces.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: 50,
    }}>
      {pieces.map((index) => (
        <ConfettiPiece key={index} params={pieceParams[index]} />
      ))}
    </div>
  );
}
