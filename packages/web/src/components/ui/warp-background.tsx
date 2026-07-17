import { motion, useReducedMotion } from 'motion/react';
import React, { useCallback, useMemo } from 'react';

import { cn } from '@/lib/utils';

const GRID_SIDE_CLASSES =
  'absolute [transform-style:preserve-3d] [background-size:var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,_var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] [container-type:inline-size]';

export function WarpBackground({
  children,
  perspective = 100,
  className,
  beamsPerSide = 3,
  beamSize = 5,
  beamDelayMax = 3,
  beamDelayMin = 0,
  beamDuration = 3,
  beamColor,
  gridColor = 'hsl(var(--border))',
  ...props
}: WarpBackgroundProps) {
  const reduceMotion = useReducedMotion();

  const generateBeams = useCallback(() => {
    const beams: BeamPlacement[] = [];
    const cellsPerSide = Math.floor(100 / beamSize);
    const step = cellsPerSide / beamsPerSide;

    for (let i = 0; i < beamsPerSide; i++) {
      const x = Math.floor(i * step);
      const delay =
        Math.random() * (beamDelayMax - beamDelayMin) + beamDelayMin;
      beams.push({ x, delay });
    }
    return beams;
  }, [beamsPerSide, beamSize, beamDelayMax, beamDelayMin]);

  const topBeams = useMemo(() => generateBeams(), [generateBeams]);
  const rightBeams = useMemo(() => generateBeams(), [generateBeams]);
  const bottomBeams = useMemo(() => generateBeams(), [generateBeams]);
  const leftBeams = useMemo(() => generateBeams(), [generateBeams]);

  const renderBeams = (beams: BeamPlacement[], side: string) =>
    reduceMotion
      ? null
      : beams.map((beam, index) => (
          <Beam
            key={`${side}-${index}`}
            width={`${beamSize}%`}
            x={`${beam.x * beamSize}%`}
            delay={beam.delay}
            duration={beamDuration}
            color={beamColor}
          />
        ));

  const containerStyle: CSSPropertiesWithVars = {
    '--perspective': `${perspective}px`,
    '--grid-color': gridColor,
    '--beam-size': `${beamSize}%`,
  };

  return (
    <div className={cn('relative rounded border p-20', className)} {...props}>
      <div
        style={containerStyle}
        className={
          'pointer-events-none absolute left-0 top-0 size-full overflow-hidden [clip-path:inset(0)] [container-type:size] [perspective:var(--perspective)] [transform-style:preserve-3d]'
        }
      >
        <div
          className={cn(
            GRID_SIDE_CLASSES,
            'z-20 [height:100cqmax] [transform-origin:50%_0%] [transform:rotateX(-90deg)] [width:100cqi]',
          )}
        >
          {renderBeams(topBeams, 'top')}
        </div>
        <div
          className={cn(
            GRID_SIDE_CLASSES,
            'top-full [height:100cqmax] [transform-origin:50%_0%] [transform:rotateX(-90deg)] [width:100cqi]',
          )}
        >
          {renderBeams(bottomBeams, 'bottom')}
        </div>
        <div
          className={cn(
            GRID_SIDE_CLASSES,
            'left-0 top-0 [height:100cqmax] [transform-origin:0%_0%] [transform:rotate(90deg)_rotateX(-90deg)] [width:100cqh]',
          )}
        >
          {renderBeams(leftBeams, 'left')}
        </div>
        <div
          className={cn(
            GRID_SIDE_CLASSES,
            'right-0 top-0 [height:100cqmax] [transform-origin:100%_0%] [transform:rotate(-90deg)_rotateX(-90deg)] [width:100cqh]',
          )}
        >
          {renderBeams(rightBeams, 'right')}
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

function Beam({ width, x, delay, duration, color }: BeamProps) {
  const aspectRatio = Math.floor(Math.random() * 10) + 1;
  const beamColor = color ?? `hsl(${Math.floor(Math.random() * 360)} 80% 60%)`;

  const style: CSSPropertiesWithVars = {
    '--x': `${x}`,
    '--width': `${width}`,
    '--aspect-ratio': `${aspectRatio}`,
    '--background': `linear-gradient(${beamColor}, transparent)`,
  };

  return (
    <motion.div
      style={style}
      className={
        'absolute left-[var(--x)] top-0 [aspect-ratio:1/var(--aspect-ratio)] [background:var(--background)] [width:var(--width)]'
      }
      initial={{ y: '100cqmax', x: '-50%' }}
      animate={{ y: '-100%', x: '-50%' }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

type CSSPropertiesWithVars = React.CSSProperties &
  Record<`--${string}`, string | number>;

type BeamPlacement = {
  x: number;
  delay: number;
};

type BeamProps = {
  width: string | number;
  x: string | number;
  delay: number;
  duration: number;
  color?: string;
};

export type WarpBackgroundProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  perspective?: number;
  beamsPerSide?: number;
  beamSize?: number;
  beamDelayMax?: number;
  beamDelayMin?: number;
  beamDuration?: number;
  beamColor?: string;
  gridColor?: string;
};
