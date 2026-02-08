import { useEffect, useRef, useState, useCallback, useId } from 'react';

interface EyeLogoProps {
  size?: number;
  className?: string;
  /** Show animated glow pulse behind the logo */
  glow?: boolean;
}

// ─── Emotional states ───────────────────────────────────────────────
type EyeMode = 'idle' | 'tracking' | 'focus';

export default function EyeLogo({ size = 40, className = '', glow = false }: EyeLogoProps) {
  const irisRef = useRef<HTMLDivElement>(null);
  const pupilRef = useRef<HTMLDivElement>(null);
  const eyeRef = useRef<HTMLDivElement>(null);

  const [isBlinking, setIsBlinking] = useState(false);
  const [isEyeTouched, setIsEyeTouched] = useState(false);
  const [squintAmount, setSquintAmount] = useState(0);       // 0..1
  const [pupilScale, setPupilScale] = useState(1);            // 0.7..1.3
  const [mode, setMode] = useState<EyeMode>('idle');
  const [isNodding, setIsNodding] = useState(false);

  // Refs for animation loops (avoid stale closures)
  const modeRef = useRef<EyeMode>('idle');
  const touchedRef = useRef(false);
  const lastPointerTime = useRef(0);
  const saccadeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const idleTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pupilDriftRAF = useRef<number>(0);
  const nodTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasOrientationRef = useRef(false);

  const uid = useId().replace(/:/g, '');

  // ─── Scale math ─────────────────────────────────────────────────
  const scale = size / 340;
  const w = 260 * scale;
  const h = size;
  const eyeSize = 156 * scale;
  const eyeTop = 38 * scale;
  const irisSize = 96 * scale;
  const basePupilSize = 42 * scale;
  const maxOffset = 20 * scale;

  // ─── Derived sizes ──────────────────────────────────────────────
  const pupilSize = basePupilSize * pupilScale;
  const hlMain = Math.max(3, 13 * scale);
  const hlSec = Math.max(2, 5 * scale);
  const irisRingWidth = Math.max(1, 2 * scale);
  const eyeRingWidth = Math.max(1, 5 * scale);

  // ─── Mode transitions ──────────────────────────────────────────
  const goIdle = useCallback(() => {
    setMode('idle');
    modeRef.current = 'idle';
    setPupilScale(1);
    setSquintAmount(0);
  }, []);

  const scheduleIdle = useCallback(() => {
    clearTimeout(idleTimeout.current);
    idleTimeout.current = setTimeout(goIdle, 2000);
  }, [goIdle]);

  // ─── Idle motion: saccades (desktop) + wandering gaze (móvil) ──
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    let mounted = true;

    if (isTouch) {
      // ── MOBILE: Wandering gaze con intervalos ──────────────
      // Cada 1.5-3s, el ojo elige un nuevo punto aleatorio.
      // Movimiento amplio y visible. Se detiene si acelerómetro activo.
      const wanderRange = maxOffset * 0.9; // Casi todo el rango

      const moveToRandom = () => {
        if (!mounted || !irisRef.current) return;
        if (hasOrientationRef.current || modeRef.current !== 'idle') {
          // Si el acelerómetro tomó el control, no interferir
          saccadeTimer.current = setTimeout(moveToRandom, 2000);
          return;
        }
        const tx = (Math.random() - 0.5) * 2 * wanderRange;
        const ty = (Math.random() - 0.5) * 2 * wanderRange * 0.7;
        irisRef.current.style.transition = 'transform 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)';
        irisRef.current.style.transform = `translate(${tx}px, ${ty}px)`;
        const delay = 1500 + Math.random() * 1500;
        saccadeTimer.current = setTimeout(moveToRandom, delay);
      };

      // Arrancar tras breve pausa
      saccadeTimer.current = setTimeout(moveToRandom, 800);
    } else {
      // ── DESKTOP: Micro-saccades clásicas ──────────────────
      const doSaccade = () => {
        if (!mounted || modeRef.current !== 'idle' || !irisRef.current) return;
        const sx = (Math.random() - 0.5) * 6 * scale;
        const sy = (Math.random() - 0.5) * 4 * scale;
        irisRef.current.style.transition = 'transform 0.06s ease-out';
        irisRef.current.style.transform = `translate(${sx}px, ${sy}px)`;
        setTimeout(() => {
          if (!mounted || modeRef.current !== 'idle' || !irisRef.current) return;
          irisRef.current.style.transition = 'transform 0.3s ease-out';
          irisRef.current.style.transform = 'translate(0px, 0px)';
        }, 80 + Math.random() * 120);
      };

      const loop = () => {
        if (!mounted) return;
        const delay = 800 + Math.random() * 2200;
        saccadeTimer.current = setTimeout(() => {
          doSaccade();
          loop();
        }, delay);
      };
      loop();
    }

    return () => {
      mounted = false;
      clearTimeout(saccadeTimer.current);
    };
  }, [scale, maxOffset]);

  // ─── Pupil micro-drift (organic tremor) ─────────────────────────
  // Continuous subtle movement — like the natural tremor of a living eye.
  // Uses two sine waves at different frequencies for organic feel.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    let mounted = true;
    const maxDrift = Math.max(0.5, 2 * scale); // Very subtle: ±0.5–2px

    const animate = (time: number) => {
      if (!mounted || !pupilRef.current) return;
      // Two slow sine waves at different speeds = organic, non-repetitive
      const dx = Math.sin(time * 0.0013) * maxDrift + Math.sin(time * 0.0031) * maxDrift * 0.4;
      const dy = Math.cos(time * 0.0017) * maxDrift * 0.7 + Math.sin(time * 0.0023) * maxDrift * 0.3;
      pupilRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      pupilDriftRAF.current = requestAnimationFrame(animate);
    };

    pupilDriftRAF.current = requestAnimationFrame(animate);

    return () => {
      mounted = false;
      cancelAnimationFrame(pupilDriftRAF.current);
    };
  }, [scale]);

  // ─── Iris tracking (pointer + tilt) ────────────────────────────
  const updateIris = useCallback((mx: number | null, my: number | null, tiltX: number, tiltY: number) => {
    if (!irisRef.current || !eyeRef.current) return;

    const rect = eyeRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    let targetX = 0;
    let targetY = 0;
    let dist = 1000;

    if (mx !== null && my !== null) {
      const dx = mx - cx;
      const dy = my - cy;
      dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const move = Math.min(dist * 0.05, maxOffset);
      targetX = Math.cos(angle) * move;
      targetY = Math.sin(angle) * move;
    } else {
      // Tilt fallback (mobile accelerometer)
      targetX = Math.max(-1, Math.min(1, tiltX / 30)) * maxOffset;
      targetY = Math.max(-1, Math.min(1, tiltY / 30)) * maxOffset;
    }

    // Smooth easing — tracking mode gets snappier transition
    if (irisRef.current) {
      irisRef.current.style.transition = 'transform 0.08s ease-out';
      irisRef.current.style.transform = `translate(${targetX}px, ${targetY}px)`;
    }

    // ── Proximity reactions ──────────────────────────────────────
    if (mx !== null && my !== null) {
      const squintThreshold = 250 * scale;
      const focusThreshold = 120 * scale;

      if (dist < focusThreshold) {
        // FOCUS mode: very close — entrecerrar, pupila pequeña (análisis frío)
        if (modeRef.current !== 'focus') {
          setMode('focus');
          modeRef.current = 'focus';
        }
        const fear = 1 - (dist / squintThreshold);
        setSquintAmount(Math.min(Math.pow(fear, 1.1) * 0.75, 0.75));
        setPupilScale(0.72);  // Pupila pequeña = precisión/análisis
      } else if (dist < squintThreshold) {
        // TRACKING close — pupila crece un poco (interés/curiosidad)
        if (modeRef.current !== 'tracking') {
          setMode('tracking');
          modeRef.current = 'tracking';
        }
        const interest = 1 - (dist / squintThreshold);
        setSquintAmount(Math.pow(interest, 2) * 0.3);
        setPupilScale(1 + interest * 0.25);  // Pupila grande = interés
      } else {
        // TRACKING far — normal
        if (modeRef.current !== 'tracking') {
          setMode('tracking');
          modeRef.current = 'tracking';
        }
        setSquintAmount(0);
        setPupilScale(1);
      }
      lastPointerTime.current = Date.now();
      scheduleIdle();
    }
  }, [maxOffset, scale, scheduleIdle]);

  // ─── Event listeners ───────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    let pointerX: number | null = null;
    let pointerY: number | null = null;
    let tiltX = 0;
    let tiltY = 0;

    const handlePointer = (e: PointerEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      updateIris(pointerX, pointerY, tiltX, tiltY);
    };

    const handlePointerLeave = () => {
      pointerX = null;
      pointerY = null;
      updateIris(null, null, tiltX, tiltY);
      scheduleIdle();
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        hasOrientationRef.current = true;
        tiltX = e.gamma;
        tiltY = e.beta - 45;
        updateIris(pointerX, pointerY, tiltX, tiltY);
      }
    };

    // Touch: seguir el dedo por la pantalla
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        pointerX = t.clientX;
        pointerY = t.clientY;
        updateIris(pointerX, pointerY, tiltX, tiltY);
      }
    };

    const handleTouchEnd = () => {
      pointerX = null;
      pointerY = null;
      scheduleIdle();
    };

    document.addEventListener('pointermove', handlePointer, { passive: true });
    document.addEventListener('pointerdown', handlePointer, { passive: true });
    document.addEventListener('pointerup', handlePointerLeave, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('deviceorientation', handleOrientation, { passive: true });

    // iOS permission request on first touch
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      const requestOnce = () => {
        (DeviceOrientationEvent as any).requestPermission().catch(() => {});
        document.removeEventListener('pointerdown', requestOnce);
      };
      document.addEventListener('pointerdown', requestOnce, { once: true });
    }

    return () => {
      document.removeEventListener('pointermove', handlePointer);
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('pointerup', handlePointerLeave);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [updateIris, scheduleIdle]);

  // ─── Blink loop (variable rhythm by mode) ─────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    let mounted = true;

    const doBlink = () => {
      if (!mounted || touchedRef.current) return;
      setIsBlinking(true);
      setTimeout(() => {
        if (!mounted) return;
        setIsBlinking(false);
        // Occasional double blink (natural human behavior)
        if (Math.random() < 0.18) {
          setTimeout(() => {
            if (!mounted || touchedRef.current) return;
            setIsBlinking(true);
            setTimeout(() => mounted && setIsBlinking(false), 140);
          }, 260);
        }
      }, 150);
    };

    const loop = () => {
      if (!mounted) return;
      // Variable blink timing by emotional state
      let baseDelay: number;
      switch (modeRef.current) {
        case 'idle':     baseDelay = 4000 + Math.random() * 2000; break;  // Relajado: 4-6s
        case 'tracking': baseDelay = 3000 + Math.random() * 2000; break;  // Activo: 3-5s
        case 'focus':    baseDelay = 6000 + Math.random() * 4000; break;  // Concentrado: 6-10s (raro)
      }
      setTimeout(() => {
        doBlink();
        loop();
      }, baseDelay);
    };
    loop();

    return () => { mounted = false; };
  }, []);

  // ─── CTA nod detection (asiente al hover/touch sobre botones/CTAs) ───
  useEffect(() => {
    const isCTA = (el: Element | null): boolean => {
      if (!el) return false;
      const tag = el.tagName;
      if (tag === 'BUTTON') return true;
      if (tag === 'A' && (el as HTMLAnchorElement).href) return true;
      if (el.getAttribute('role') === 'button') return true;
      if (el.closest('button, a[href], [role="button"]')) return true;
      return false;
    };

    const triggerNod = () => {
      clearTimeout(nodTimer.current);
      setIsNodding(false);
      requestAnimationFrame(() => {
        setIsNodding(true);
        nodTimer.current = setTimeout(() => setIsNodding(false), 750);
      });
    };

    // Desktop: pointerover (hover)
    const handleOver = (e: PointerEvent) => {
      const target = e.target as Element;
      if (isCTA(target)) triggerNod();
    };

    // Móvil: touchstart sobre CTAs
    const handleTouch = (e: TouchEvent) => {
      const target = e.target as Element;
      if (isCTA(target)) triggerNod();
    };

    document.addEventListener('pointerover', handleOver, { passive: true });
    document.addEventListener('touchstart', handleTouch, { passive: true });
    return () => {
      document.removeEventListener('pointerover', handleOver);
      document.removeEventListener('touchstart', handleTouch);
      clearTimeout(nodTimer.current);
    };
  }, []);

  // ─── Eye touch handlers ────────────────────────────────────────
  const handleEyeDown = useCallback(() => {
    setIsEyeTouched(true);
    touchedRef.current = true;
    setPupilScale(0.65); // Pupila se contrae al tocar (sorpresa → tensión)
  }, []);

  const handleEyeUp = useCallback(() => {
    setIsEyeTouched(false);
    touchedRef.current = false;
    // Brief pupil "pulse" on release: dilate then normalize
    setPupilScale(1.25);
    setTimeout(() => setPupilScale(1), 300);
  }, []);

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: w, height: h }}
    >
      {/* Glow pulse */}
      {glow && (
        <>
          <div
            className="absolute animate-pulse"
            style={{
              top: eyeTop + eyeSize * 0.15,
              left: '50%',
              transform: 'translateX(-50%)',
              width: eyeSize * 2,
              height: eyeSize * 2,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,220,255,0.25) 0%, rgba(0,220,255,0.08) 40%, transparent 70%)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: eyeTop + eyeSize * 0.3,
              left: '50%',
              transform: 'translateX(-50%)',
              width: eyeSize * 1.4,
              height: eyeSize * 1.4,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(252,196,78,0.2) 0%, transparent 65%)',
              zIndex: 0,
              pointerEvents: 'none',
              animation: 'eyeGlowPulse 3s ease-in-out infinite',
            }}
          />
          <style>{`
            @keyframes eyeGlowPulse {
              0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
              50% { opacity: 1; transform: translateX(-50%) scale(1.15); }
            }
          `}</style>
        </>
      )}

      {/* Nod animation styles — always available */}
      <style>{`
        @keyframes eyeNod {
          0%   { transform: translateY(0) rotate(0deg); }
          10%  { transform: translateY(10px) rotate(4deg); }
          22%  { transform: translateY(-3px) rotate(-1.5deg); }
          34%  { transform: translateY(8px) rotate(3.5deg); }
          46%  { transform: translateY(-2px) rotate(-1deg); }
          58%  { transform: translateY(6px) rotate(2.5deg); }
          72%  { transform: translateY(-1px) rotate(-0.5deg); }
          85%  { transform: translateY(3px) rotate(1deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        .eye-nodding {
          animation: eyeNod 0.75s cubic-bezier(0.36, 0, 0.66, 1);
        }
      `}</style>

      {/* Pin container */}
      <div
        className={`relative${isNodding ? ' eye-nodding' : ''}`}
        style={{
          width: w,
          height: h,
          filter: `drop-shadow(0 ${Math.max(2, 12 * scale)}px ${Math.max(4, 30 * scale)}px rgba(0,0,0,0.55))`,
          transformOrigin: 'center bottom',
        }}
      >
        {/* Pin SVG */}
        <svg
          viewBox="0 0 260 340"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <linearGradient id={`${uid}Main`} x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="#fcc44e" />
              <stop offset="20%" stopColor="#f5a623" />
              <stop offset="50%" stopColor="#e88d0c" />
              <stop offset="80%" stopColor="#d47508" />
              <stop offset="100%" stopColor="#b85c00" />
            </linearGradient>
            <linearGradient id={`${uid}Shine`} x1="0" y1="0" x2="0.6" y2="0.8">
              <stop offset="0%" stopColor="rgba(255,230,160,0.45)" />
              <stop offset="100%" stopColor="rgba(255,200,100,0)" />
            </linearGradient>
            <linearGradient id={`${uid}Dark`} x1="0.6" y1="0" x2="1" y2="0.8">
              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
            </linearGradient>
            <linearGradient id={`${uid}Tail`} x1="0.3" y1="0" x2="0.7" y2="1">
              <stop offset="0%" stopColor="#c06800" />
              <stop offset="100%" stopColor="#8a4400" />
            </linearGradient>
          </defs>

          {/* Main pin body */}
          <path d="M 138 14 C 78 14, 28 60, 28 122 C 28 162, 52 192, 80 224 C 108 256, 126 278, 134 298 C 138 308, 140 316, 140 320 C 136 324, 128 330, 116 334 C 98 340, 76 332, 66 318 C 58 306, 60 290, 66 278 L 68 274 C 64 270, 54 274, 48 288 C 38 310, 48 336, 78 342 C 102 346, 130 336, 142 322 C 146 316, 148 308, 152 296 C 158 274, 172 252, 194 226 C 222 192, 248 158, 248 122 C 248 60, 198 14, 138 14 Z" fill={`url(#${uid}Main)`} />
          <path d="M 138 14 C 78 14, 28 60, 28 122 C 28 162, 52 192, 80 224 C 100 248, 116 270, 128 290 L 128 290 C 110 258, 82 228, 62 198 C 44 170, 50 140, 50 122 C 50 72, 90 32, 138 24 Z" fill={`url(#${uid}Shine)`} />
          <path d="M 138 14 C 198 14, 248 60, 248 122 C 248 158, 222 192, 194 226 C 172 252, 158 274, 152 296 L 148 306 C 152 280, 166 256, 188 230 C 216 196, 234 164, 234 122 C 234 68, 192 26, 138 20 Z" fill={`url(#${uid}Dark)`} />
          <path d="M 134 298 C 138 308, 140 316, 140 320 C 136 324, 128 330, 116 334 C 98 340, 76 332, 66 318 C 58 306, 60 290, 66 278 L 68 274 C 64 270, 54 274, 48 288 C 38 310, 48 336, 78 342" fill={`url(#${uid}Tail)`} opacity="0.35" />
          <ellipse cx="98" cy="82" rx="32" ry="48" fill="rgba(255,255,255,0.07)" transform="rotate(-18,98,82)" />
        </svg>

        {/* Eye socket */}
        <div
          ref={eyeRef}
          className="absolute overflow-hidden cursor-pointer"
          onPointerDown={handleEyeDown}
          onPointerUp={handleEyeUp}
          onPointerLeave={handleEyeUp}
          style={{
            top: eyeTop,
            left: '50%',
            transform: 'translateX(-48%)',
            width: eyeSize,
            height: eyeSize,
            borderRadius: '50%',
            zIndex: 5,
            touchAction: 'none',
          }}
        >
          {/* ── Curved SVG eyelids ── */}
          <svg
            viewBox="0 0 100 100"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              zIndex: 20,
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            <defs>
              <linearGradient id={`${uid}UL`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d07a0e" />
                <stop offset="100%" stopColor="#c06a00" />
              </linearGradient>
              <linearGradient id={`${uid}LL`} x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#b85c00" />
                <stop offset="100%" stopColor="#c06a00" />
              </linearGradient>
            </defs>
            {/* Upper lid */}
            <path
              d={(() => {
                const closed = isEyeTouched || isBlinking;
                const drop = closed ? 54 : squintAmount * 38;
                return `M -2,-2 L 102,-2 L 102,${drop * 0.3} Q 50,${drop + 10} -2,${drop * 0.3} Z`;
              })()}
              fill={`url(#${uid}UL)`}
            />
            {/* Lower lid */}
            <path
              d={(() => {
                const closed = isEyeTouched || isBlinking;
                const rise = closed ? 54 : squintAmount * 30;
                return `M -2,102 L 102,102 L 102,${100 - rise * 0.3} Q 50,${100 - rise - 8} -2,${100 - rise * 0.3} Z`;
              })()}
              fill={`url(#${uid}LL)`}
            />
            {/* Shadow edges */}
            {(isEyeTouched || isBlinking || squintAmount > 0.04) && (
              <>
                <path
                  d={(() => {
                    const closed = isEyeTouched || isBlinking;
                    const drop = closed ? 54 : squintAmount * 38;
                    return `M -2,${drop * 0.3} Q 50,${drop + 10} 102,${drop * 0.3}`;
                  })()}
                  fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5"
                />
                <path
                  d={(() => {
                    const closed = isEyeTouched || isBlinking;
                    const rise = closed ? 54 : squintAmount * 30;
                    return `M -2,${100 - rise * 0.3} Q 50,${100 - rise - 8} 102,${100 - rise * 0.3}`;
                  })()}
                  fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1"
                />
              </>
            )}
          </svg>

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
                transition: 'transform 0.08s ease-out',
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

              {/* Pupil — dynamic size + micro-drift */}
              <div
                ref={pupilRef}
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
                  // No transition on transform (rAF handles drift), but smooth size changes
                  transition: 'width 0.3s ease-out, height 0.3s ease-out, margin-top 0.3s ease-out, margin-left 0.3s ease-out',
                  willChange: 'transform',
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
    </div>
  );
}
