import { useEffect, useRef } from 'react';

interface AnimatedTruckProps {
  isPasswordShown: boolean;
  status: 'idle' | 'success' | 'error';
}

export function AnimatedTruck({ isPasswordShown, status }: AnimatedTruckProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftHeadlightRef = useRef<SVGGElement>(null);
  const rightHeadlightRef = useRef<SVGGElement>(null);
  const leftBeamRef = useRef<SVGPolygonElement>(null);
  const rightBeamRef = useRef<SVGPolygonElement>(null);

  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const currentAngles = useRef({ left: 0, right: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;

    const animate = () => {
      if (!leftHeadlightRef.current || !rightHeadlightRef.current || !containerRef.current) return;

      const leftRect = leftHeadlightRef.current.getBoundingClientRect();
      const rightRect = rightHeadlightRef.current.getBoundingClientRect();

      const leftCenter = { x: leftRect.left + leftRect.width / 2, y: leftRect.top + leftRect.height / 2 };
      const rightCenter = { x: rightRect.left + rightRect.width / 2, y: rightRect.top + rightRect.height / 2 };

      // Calculate target angles
      const leftTargetAngle = Math.atan2(mousePos.current.y - leftCenter.y, mousePos.current.x - leftCenter.x) * (180 / Math.PI);
      const rightTargetAngle = Math.atan2(mousePos.current.y - rightCenter.y, mousePos.current.x - rightCenter.x) * (180 / Math.PI);

      // Lerp for smooth tracking (heavy feel)
      currentAngles.current.left += (leftTargetAngle - currentAngles.current.left) * 0.1;
      currentAngles.current.right += (rightTargetAngle - currentAngles.current.right) * 0.1;

      // Restrict rotation to make it realistic (e.g., headlights only point forward/down)
      const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
      const leftRot = clamp(currentAngles.current.left, 0, 180);
      const rightRot = clamp(currentAngles.current.right, 0, 180);

      // Apply transforms
      if (leftBeamRef.current) leftBeamRef.current.setAttribute('transform', `rotate(${leftRot - 90} 40 55)`);
      if (rightBeamRef.current) rightBeamRef.current.setAttribute('transform', `rotate(${rightRot - 90} 120 55)`);
      if (leftHeadlightRef.current) leftHeadlightRef.current.setAttribute('transform', `rotate(${leftRot - 90} 40 55)`);
      if (rightHeadlightRef.current) rightHeadlightRef.current.setAttribute('transform', `rotate(${rightRot - 90} 120 55)`);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Animation classes based on status
  let animationClass = '';
  if (status === 'success') {
    animationClass = 'translate-x-[150vw] transition-transform duration-[1500ms] ease-in';
  } else if (status === 'error') {
    animationClass = 'animate-[shake_0.5s_ease-in-out]';
  }

  const areHeadlightsOn = isPasswordShown || status === 'success';

  return (
    <div ref={containerRef} className={`flex justify-center my-4 relative ${animationClass}`}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
        .wheel {
          transform-origin: center;
          ${status === 'success' ? 'animation: spin 1.5s linear forwards;' : ''}
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(720deg); }
        }
      `}</style>
      <svg width="160" height="80" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Beams (rendered behind truck) */}
        <g style={{ opacity: areHeadlightsOn ? 0.6 : 0, transition: 'opacity 0.3s' }}>
          <polygon ref={leftBeamRef} points="40,55 10,200 70,200" fill="url(#beamGradient)" style={{ transformOrigin: '40px 55px' }} />
          <polygon ref={rightBeamRef} points="120,55 90,200 150,200" fill="url(#beamGradient)" style={{ transformOrigin: '120px 55px' }} />
        </g>
        
        {/* Truck Body */}
        <path d="M20,60 L20,30 L40,10 L120,10 L140,30 L140,60 Z" fill="#171717" stroke="#262626" strokeWidth="2" />
        
        {/* Grill */}
        <rect x="60" y="30" width="40" height="25" rx="2" fill="#0A0A0A" stroke="#262626" strokeWidth="1.5" />
        <line x1="65" y1="35" x2="95" y2="35" stroke="#262626" strokeWidth="1" />
        <line x1="65" y1="42.5" x2="95" y2="42.5" stroke="#262626" strokeWidth="1" />
        <line x1="65" y1="50" x2="95" y2="50" stroke="#262626" strokeWidth="1" />

        {/* Windshield */}
        <path d="M45,25 L50,15 L110,15 L115,25 Z" fill="#050505" stroke="#262626" strokeWidth="1" />

        {/* Wheels */}
        <g className="wheel" style={{ transformOrigin: '35px 65px' }}>
          <circle cx="35" cy="65" r="8" fill="#050505" stroke="#404040" strokeWidth="2" />
          <line x1="35" y1="57" x2="35" y2="73" stroke="#404040" strokeWidth="1" />
          <line x1="27" y1="65" x2="43" y2="65" stroke="#404040" strokeWidth="1" />
        </g>
        <g className="wheel" style={{ transformOrigin: '125px 65px' }}>
          <circle cx="125" cy="65" r="8" fill="#050505" stroke="#404040" strokeWidth="2" />
          <line x1="125" y1="57" x2="125" y2="73" stroke="#404040" strokeWidth="1" />
          <line x1="117" y1="65" x2="133" y2="65" stroke="#404040" strokeWidth="1" />
        </g>

        {/* Headlights */}
        {/* We use a directional housing shape that rotates with the beam */}
        <g ref={leftHeadlightRef} style={{ transformOrigin: '40px 55px' }}>
          <path d="M35,55 Q40,50 45,55 L43,60 L37,60 Z" fill={areHeadlightsOn ? "#fff9e6" : "#404040"} stroke="#262626" strokeWidth="1" />
          {areHeadlightsOn && <path d="M35,55 Q40,50 45,55 L43,60 L37,60 Z" fill="#fff9e6" opacity="0.6" filter="url(#glow)" />}
        </g>
        
        <g ref={rightHeadlightRef} style={{ transformOrigin: '120px 55px' }}>
          <path d="M115,55 Q120,50 125,55 L123,60 L117,60 Z" fill={areHeadlightsOn ? "#fff9e6" : "#404040"} stroke="#262626" strokeWidth="1" />
          {areHeadlightsOn && <path d="M115,55 Q120,50 125,55 L123,60 L117,60 Z" fill="#fff9e6" opacity="0.6" filter="url(#glow)" />}
        </g>

        <defs>
          <linearGradient id="beamGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff9e6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fff9e6" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}