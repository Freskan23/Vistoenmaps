import { useEffect, useRef, useState, useCallback } from 'react';

interface EyeLogoProps {
  size?: number;
  className?: string;
}

export default function EyeLogo({ size = 40, className = '' }: EyeLogoProps) {
  const irisRef = useRef<HTMLDivElement>(null);
  const eyeRef = useRef<HTMLDivElement>(null);
  const [blinking, setBlinking] = useState(false);

  // Scale factor: everything is designed at height=340px, we scale from there
  const scale = size / 340;
  const w = 260 * scale;
  const h = size;

  // Eye socket dimensions (proportional)
  const eyeSize = 156 * scale;
  const eyeTop = 38 * scale;
  const irisSize = 96 * scale;
  const pupilSize = 42 * scale;
  const maxOffset = 20 * scale;

  // Mouse tracking
  const moveEye = useCallback((mx: number, my: number) => {
    if (!irisRef.current || !eyeRef.current) return;
    const rect = eyeRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(my - cy, mx - cx);
    const rawDist = Math.hypot(mx - cx, my - cy);
    const dist = Math.min(rawDist * 0.05, maxOffset);
    irisRef.current.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
  }, [maxOffset]);

  useEffect(() => {
    // Check reduced motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    const handleMouse = (e: MouseEvent) => moveEye(e.clientX, e.clientY);
    const handleTouch = (e: TouchEvent) => moveEye(e.touches[0].clientX, e.touches[0].clientY);

    document.addEventListener('mousemove', handleMouse, { passive: true });
    document.addEventListener('touchmove', handleTouch, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouse);
      document.removeEventListener('touchmove', handleTouch);
    };
  }, [moveEye]);

  // Blink loop
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    let mounted = true;
    const doBlink = () => {
      if (!mounted) return;
      setBlinking(true);
      setTimeout(() => {
        if (!mounted) return;
        setBlinking(false);
        // Occasional double blink
        if (Math.random() < 0.2) {
          setTimeout(() => {
            if (!mounted) return;
            setBlinking(true);
            setTimeout(() => mounted && setBlinking(false), 150);
          }, 280);
        }
      }, 150);
    };

    const loop = () => {
      if (!mounted) return;
      const delay = 2800 + Math.random() * 3200;
      setTimeout(() => {
        doBlink();
        loop();
      }, delay);
    };
    loop();

    return () => { mounted = false; };
  }, []);

  // Highlight sizes
  const hlMain = Math.max(3, 13 * scale);
  const hlSec = Math.max(2, 5 * scale);
  const irisRingWidth = Math.max(1, 2 * scale);
  const eyeRingWidth = Math.max(1, 5 * scale);

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{
        width: w,
        height: h,
        filter: `drop-shadow(0 ${Math.max(2, 12 * scale)}px ${Math.max(4, 30 * scale)}px rgba(0,0,0,0.55))`,
      }}
    >
      {/* Pin SVG */}
      <svg
        viewBox="0 0 260 340"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="elGMain" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#fcc44e" />
            <stop offset="20%" stopColor="#f5a623" />
            <stop offset="50%" stopColor="#e88d0c" />
            <stop offset="80%" stopColor="#d47508" />
            <stop offset="100%" stopColor="#b85c00" />
          </linearGradient>
          <linearGradient id="elGShine" x1="0" y1="0" x2="0.6" y2="0.8">
            <stop offset="0%" stopColor="rgba(255,230,160,0.45)" />
            <stop offset="100%" stopColor="rgba(255,200,100,0)" />
          </linearGradient>
          <linearGradient id="elGDark" x1="0.6" y1="0" x2="1" y2="0.8">
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
          </linearGradient>
          <linearGradient id="elGTail" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#c06800" />
            <stop offset="100%" stopColor="#8a4400" />
          </linearGradient>
        </defs>

        {/* Main pin body */}
        <path
          d="M 138 14 C 78 14, 28 60, 28 122 C 28 162, 52 192, 80 224 C 108 256, 126 278, 134 298 C 138 308, 140 316, 140 320 C 136 324, 128 330, 116 334 C 98 340, 76 332, 66 318 C 58 306, 60 290, 66 278 L 68 274 C 64 270, 54 274, 48 288 C 38 310, 48 336, 78 342 C 102 346, 130 336, 142 322 C 146 316, 148 308, 152 296 C 158 274, 172 252, 194 226 C 222 192, 248 158, 248 122 C 248 60, 198 14, 138 14 Z"
          fill="url(#elGMain)"
        />
        {/* Left shine */}
        <path
          d="M 138 14 C 78 14, 28 60, 28 122 C 28 162, 52 192, 80 224 C 100 248, 116 270, 128 290 L 128 290 C 110 258, 82 228, 62 198 C 44 170, 50 140, 50 122 C 50 72, 90 32, 138 24 Z"
          fill="url(#elGShine)"
        />
        {/* Right shadow */}
        <path
          d="M 138 14 C 198 14, 248 60, 248 122 C 248 158, 222 192, 194 226 C 172 252, 158 274, 152 296 L 148 306 C 152 280, 166 256, 188 230 C 216 196, 234 164, 234 122 C 234 68, 192 26, 138 20 Z"
          fill="url(#elGDark)"
        />
        {/* Tail depth */}
        <path
          d="M 134 298 C 138 308, 140 316, 140 320 C 136 324, 128 330, 116 334 C 98 340, 76 332, 66 318 C 58 306, 60 290, 66 278 L 68 274 C 64 270, 54 274, 48 288 C 38 310, 48 336, 78 342"
          fill="url(#elGTail)"
          opacity="0.35"
        />
        {/* Glow */}
        <ellipse cx="98" cy="82" rx="32" ry="48" fill="rgba(255,255,255,0.07)" transform="rotate(-18,98,82)" />
      </svg>

      {/* Eye socket */}
      <div
        ref={eyeRef}
        className="absolute overflow-hidden"
        style={{
          top: eyeTop,
          left: '50%',
          transform: 'translateX(-48%)',
          width: eyeSize,
          height: eyeSize,
          borderRadius: '50%',
          zIndex: 5,
        }}
      >
        {/* Eyelids for blink */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '52%',
            left: 0,
            top: 0,
            background: 'linear-gradient(180deg, #d07a0e 0%, #c06a00 100%)',
            transformOrigin: 'top center',
            transform: blinking ? 'scaleY(1)' : 'scaleY(0)',
            transition: 'transform 0.12s ease-in',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '52%',
            left: 0,
            bottom: 0,
            background: 'linear-gradient(0deg, #b85c00 0%, #c06a00 100%)',
            transformOrigin: 'bottom center',
            transform: blinking ? 'scaleY(1)' : 'scaleY(0)',
            transition: 'transform 0.12s ease-in',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        />

        {/* Eye ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `${eyeRingWidth}px solid rgba(185,195,205,0.75)`,
            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.25), 0 1px 2px rgba(255,255,255,0.1)',
            zIndex: 6,
            pointerEvents: 'none',
          }}
        />

        {/* Eyeball */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 42% 38%, #ffffff 0%, #f2f2f5 40%, #dcdce2 75%, #c4c4cc 100%)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.18)',
          }}
        >
          {/* Gloss */}
          <div
            style={{
              position: 'absolute',
              width: '60%',
              height: '32%',
              top: '5%',
              left: '14%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
              borderRadius: '50%',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />

          {/* Iris */}
          <div
            ref={irisRef}
            style={{
              position: 'absolute',
              width: irisSize,
              height: irisSize,
              top: '50%',
              left: '50%',
              marginTop: -irisSize / 2,
              marginLeft: -irisSize / 2,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 48% 42%, #00efff 0%, #00d6ea 15%, #00bcd4 30%, #009eb5 48%, #007d90 65%, #005c6a 82%, #004050 100%)',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.35), 0 0 14px rgba(0,210,235,0.12)',
              transition: 'transform 0.07s ease-out',
              zIndex: 2,
            }}
          >
            {/* Iris texture */}
            <div
              style={{
                position: 'absolute',
                inset: Math.max(2, 5 * scale),
                borderRadius: '50%',
                background: 'repeating-conic-gradient(rgba(0,0,0,0.14) 0deg 2.5deg, transparent 2.5deg 7deg)',
              }}
            />
            {/* Iris border */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: `${irisRingWidth}px solid rgba(0,70,90,0.35)`,
              }}
            />

            {/* Pupil */}
            <div
              style={{
                position: 'absolute',
                width: pupilSize,
                height: pupilSize,
                top: '50%',
                left: '50%',
                marginTop: -pupilSize / 2,
                marginLeft: -pupilSize / 2,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 48% 42%, #151520 0%, #000 55%)',
                zIndex: 3,
                boxShadow: '0 0 8px rgba(0,0,0,0.45)',
              }}
            >
              {/* Main highlight */}
              <div
                style={{
                  position: 'absolute',
                  width: hlMain,
                  height: hlMain * 0.92,
                  background: 'rgba(255,255,255,0.92)',
                  borderRadius: Math.max(1, 3 * scale),
                  top: Math.max(1, 5 * scale),
                  right: Math.max(1, 5 * scale),
                  zIndex: 4,
                  boxShadow: '0 0 5px rgba(255,255,255,0.35)',
                }}
              />
              {/* Secondary highlight */}
              <div
                style={{
                  position: 'absolute',
                  width: hlSec,
                  height: hlSec,
                  background: 'rgba(255,255,255,0.4)',
                  borderRadius: '50%',
                  bottom: Math.max(2, 9 * scale),
                  left: Math.max(2, 7 * scale),
                  zIndex: 4,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
