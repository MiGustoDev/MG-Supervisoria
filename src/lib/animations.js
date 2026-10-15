import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Register useGSAP plugin
gsap.registerPlugin(useGSAP);

export { gsap, useGSAP };

// Smooth subtle GSAP standard configurations
export const GSAP_EASE = {
  smooth: 'power2.out',
  snappy: 'power3.out',
  softBack: 'back.out(1.3)',
  inOut: 'power2.inOut',
};

/**
 * Animate container elements with subtle staggered entrance
 * @param {HTMLElement|string} targets - selector or elements
 * @param {Object} options - custom options
 */
export function animateStagger(targets, options = {}) {
  if (!targets) return;
  return gsap.fromTo(
    targets,
    {
      opacity: 0,
      y: options.y ?? 14,
      scale: options.scale ?? 1,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: options.duration ?? 0.4,
      stagger: options.stagger ?? 0.04,
      ease: options.ease ?? GSAP_EASE.smooth,
      clearProps: 'transform',
      ...options,
    }
  );
}

/**
 * Animate modal dialog appearance
 * @param {HTMLElement} contentRef 
 * @param {HTMLElement} backdropRef 
 */
export function animateModalEnter(contentRef, backdropRef) {
  if (backdropRef) {
    gsap.fromTo(
      backdropRef,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: 'power2.out' }
    );
  }
  if (contentRef) {
    gsap.fromTo(
      contentRef,
      { opacity: 0, scale: 0.95, y: 12 },
      { opacity: 1, scale: 1, y: 0, duration: 0.32, ease: GSAP_EASE.snappy, clearProps: 'transform' }
    );
  }
}

/**
 * Animate popover / dropdown opening
 * @param {HTMLElement} target 
 */
export function animatePopoverEnter(target) {
  if (!target) return;
  return gsap.fromTo(
    target,
    { opacity: 0, scale: 0.96, y: -6 },
    { opacity: 1, scale: 1, y: 0, duration: 0.24, ease: GSAP_EASE.softBack, clearProps: 'transform' }
  );
}

/**
 * Animate popover / dropdown exit smoothly before unmounting
 * @param {HTMLElement} target 
 * @param {Function} onComplete 
 */
export function animatePopoverExit(target, onComplete) {
  if (!target) {
    if (onComplete) onComplete();
    return;
  }
  return gsap.to(target, {
    opacity: 0,
    scale: 0.96,
    y: -6,
    duration: 0.18,
    ease: 'power2.in',
    onComplete: () => {
      if (onComplete) onComplete();
    },
  });
}

/**
 * Animate modal exit smoothly before closing
 * @param {HTMLElement} contentRef 
 * @param {HTMLElement} backdropRef 
 * @param {Function} onComplete 
 */
export function animateModalExit(contentRef, backdropRef, onComplete) {
  const tl = gsap.timeline({
    onComplete: () => {
      if (onComplete) onComplete();
    },
  });
  if (contentRef) {
    tl.to(contentRef, { opacity: 0, scale: 0.95, y: 10, duration: 0.2, ease: 'power2.in' });
  }
  if (backdropRef) {
    tl.to(backdropRef, { opacity: 0, duration: 0.2, ease: 'power2.in' }, '-=0.15');
  }
}

/**
 * Animate tab switch content
 * @param {HTMLElement} target 
 */
export function animateTabEnter(target) {
  if (!target) return;
  gsap.fromTo(
    target,
    { opacity: 0, y: 8 },
    { opacity: 1, y: 0, duration: 0.3, ease: GSAP_EASE.smooth, clearProps: 'transform' }
  );
}

/**
 * Animate toast notification
 * @param {HTMLElement} target 
 */
export function animateToastEnter(target) {
  if (!target) return;
  gsap.fromTo(
    target,
    { opacity: 0, y: -20, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: GSAP_EASE.softBack, clearProps: 'transform' }
  );
}

