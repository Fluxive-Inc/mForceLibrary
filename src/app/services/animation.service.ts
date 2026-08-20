import { Injectable } from '@angular/core';
try {
    // Using dynamic import or window.gsap approach to avoid strict gsap module dependency at build if restricted
    // Need to import gsap properly
} catch (e) { }
import gsap from 'gsap';

@Injectable({
    providedIn: 'root'
})
export class AnimationService {
    constructor() { }

    pullToCenter(sourceElement: HTMLElement, targetContainer: HTMLElement) {
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetContainer.getBoundingClientRect();

        // Clone the element for the animation to preserve the original layout
        const clone = sourceElement.cloneNode(true) as HTMLElement;

        // Append clone to body to stay above everything during transit
        document.body.appendChild(clone);

        // Style the clone to exactly match the source initially
        gsap.set(clone, {
            position: 'fixed',
            top: sourceRect.top,
            left: sourceRect.left,
            width: sourceRect.width,
            height: sourceRect.height,
            margin: 0,
            zIndex: 9999,
            transformOrigin: 'center center'
        });

        // Hide original element slightly to show it was "picked"
        gsap.to(sourceElement, {
            opacity: 0.2,
            duration: 0.3
        });

        // Extract to center of screen (translateZ towards screen simulation and scaling)
        const centerX = window.innerWidth / 2 - sourceRect.width / 2;
        const centerY = window.innerHeight / 2 - sourceRect.height / 2;

        // GSAP Sequence: 1. Extract, 2. Assembly into Target HUD
        const tl = gsap.timeline({
            onComplete: () => {
                // Once animation finishes, append to target container
                clone.remove();
                const finalElement = sourceElement.cloneNode(true) as HTMLElement;
                finalElement.style.margin = '10px';
                finalElement.style.opacity = '1';
                finalElement.style.transform = 'none';
                targetContainer.appendChild(finalElement);
            }
        });

        // Phase 1: The Extraction (Z-space pull to center)
        tl.to(clone, {
            left: centerX,
            top: centerY,
            scale: 1.5,
            ease: 'power2.out',
            duration: 0.6,
            boxShadow: '0 0 40px rgba(0, 255, 255, 0.8)'
        })
            // Phase 2: The Assembly (Snap into Curator HUD)
            .to(clone, {
                left: targetRect.left + 20, // offset into the target box
                top: targetRect.top + 60,
                scale: 1, // normalize scale
                width: targetRect.width - 40, // snap to HUD interior
                height: 'auto',
                ease: 'power3.inOut',
                duration: 0.5,
                boxShadow: 'inset 0 0 10px rgba(0,255,255,0.2), 0 0 15px rgba(0, 255, 255, 0.4)'
            });
    }
}
