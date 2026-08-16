'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '../utils/animations';

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 120,
  height = 36,
  color = '#EC4899',
  fillColor = 'rgba(236, 72, 153, 0.1)',
  strokeWidth = 2,
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return { x, y };
  });

  const linePath = points.map((p) => `${p.x},${p.y}`).join(' L ');
  const pathData = `M ${linePath}`;
  const areaPathData = `${pathData} L ${width},${height} L 0,${height} Z`;

  useEffect(() => {
    if (!pathRef.current || prefersReducedMotion()) return;

    const length = pathRef.current.getTotalLength();
    gsap.set(pathRef.current, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    gsap.to(pathRef.current, {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: 'power2.out',
    });

    if (circleRef.current) {
      gsap.fromTo(
        circleRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, delay: 1, ease: 'back.out(2)' }
      );
    }
  }, [data]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {/* Area Fill */}
      {fillColor && (
        <path
          d={areaPathData}
          fill={fillColor}
          stroke="none"
          className="transition-all duration-300"
        />
      )}
      {/* Sparkline Path */}
      <path
        ref={pathRef}
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pulsing end point */}
      {points.length > 0 && (
        <circle
          ref={circleRef}
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={2.5}
          fill={color}
        />
      )}
    </svg>
  );
};

export default Sparkline;
