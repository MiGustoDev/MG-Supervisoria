import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export function AnimatedNumber({
  value,
  formatter,
  duration = 0.85,
  startFromZero = true,
  decimals = 0,
}) {
  const numericValue = typeof value === 'number' ? value : Number(value) || 0;
  const initialVal = startFromZero ? 0 : numericValue;
  const [displayValue, setDisplayValue] = useState(initialVal);
  const tweenObj = useRef({ val: initialVal });

  useEffect(() => {
    const targetVal = numericValue;
    const startVal = tweenObj.current.val;

    if (startVal === targetVal && targetVal === 0) {
      setDisplayValue(0);
      return;
    }

    gsap.killTweensOf(tweenObj.current);

    const tween = gsap.to(tweenObj.current, {
      val: targetVal,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (decimals > 0) {
          setDisplayValue(Number(tweenObj.current.val.toFixed(decimals)));
        } else {
          setDisplayValue(Math.round(tweenObj.current.val));
        }
      },
      onComplete: () => {
        setDisplayValue(targetVal);
      },
    });

    return () => {
      tween.kill();
    };
  }, [numericValue, duration, decimals]);

  const formatted = formatter ? formatter(displayValue) : displayValue;

  return <span>{formatted}</span>;
}
