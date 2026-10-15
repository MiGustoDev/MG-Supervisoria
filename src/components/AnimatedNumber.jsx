import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export function AnimatedNumber({ value, formatter, duration = 0.6 }) {
  const numericValue = typeof value === 'number' ? value : Number(value) || 0;
  const [displayValue, setDisplayValue] = useState(numericValue);
  const tweenObj = useRef({ val: numericValue });
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      setDisplayValue(numericValue);
      tweenObj.current.val = numericValue;
      return;
    }

    const targetVal = numericValue;
    const startVal = tweenObj.current.val;

    if (startVal === targetVal) {
      return;
    }

    const tween = gsap.to(tweenObj.current, {
      val: targetVal,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        setDisplayValue(Math.round(tweenObj.current.val));
      },
      onComplete: () => {
        setDisplayValue(targetVal);
      },
    });

    return () => {
      tween.kill();
    };
  }, [numericValue, duration]);

  const formatted = formatter ? formatter(displayValue) : displayValue;

  return <span>{formatted}</span>;
}
