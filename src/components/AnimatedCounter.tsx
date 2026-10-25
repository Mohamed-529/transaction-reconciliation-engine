import React, { useEffect, useState } from 'react';

interface Props {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<Props> = ({
  target,
  duration = 450,
  prefix = '',
  suffix = ''
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    const endValue = target;

    if (endValue === 0) {
      setCurrent(0);
      return;
    }

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing curve: ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(startValue + (endValue - startValue) * easeOut);
      setCurrent(nextValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration]);

  return (
    <span>
      {prefix}
      {current}
      {suffix}
    </span>
  );
};
