'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollAnimationProps {
  className?: string;
  children?: React.ReactNode;
  scrollSectionRef?: React.RefObject<HTMLDivElement | null>;
}

export function ScrollAnimation({ className = '', children, scrollSectionRef }: ScrollAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [frames, setFrames] = useState<HTMLImageElement[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const targetFrameRef = useRef(0);

  const TOTAL_FRAMES = 300;
  const BATCH_SIZE = 20;

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Preload frames in batches to avoid blocking
    const preloadFrames = async () => {
      const loadedFrames: HTMLImageElement[] = [];
      
      for (let i = 0; i < TOTAL_FRAMES; i += BATCH_SIZE) {
        const batch = [];
        const endIndex = Math.min(i + BATCH_SIZE, TOTAL_FRAMES);
        
        for (let j = i; j < endIndex; j++) {
          const frameNumber = j + 1;
          const paddedNumber = frameNumber.toString().padStart(3, '0');
          const img = new Image();
          img.src = `/FRAMES/ezgif-frame-${paddedNumber}.jpg`;
          batch.push(img);
        }

        // Wait for batch to load
        await Promise.all(batch.map(img => {
          return new Promise<void>((resolve) => {
            if (img.complete) {
              loadedFrames.push(img);
              resolve(undefined);
            } else {
              img.onload = () => {
                loadedFrames.push(img);
                resolve(undefined);
              };
              img.onerror = () => {
                // Skip failed frames but continue
                resolve(undefined);
              };
            }
          });
        }));

        // Update state periodically to show progress
        setFrames([...loadedFrames]);
        
        // Allow UI to update between batches
        await new Promise<void>(resolve => setTimeout(resolve, 0));
      }

      setIsLoading(false);
    };

    preloadFrames();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || isLoading || frames.length === 0) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const scrollSection = scrollSectionRef?.current;
    if (!canvas || !container || !scrollSection) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      ctx.scale(dpr, dpr);
      
      // Redraw current frame after resize
      if (frames[currentFrame]) {
        drawFrame(ctx, frames[currentFrame], rect.width, rect.height);
      }
    };

    const drawFrame = (context: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number) => {
      // Use intelligent scaling to preserve composition without extreme cropping
      const imgRatio = img.width / img.height;
      const canvasRatio = width / height;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      // For landscape images (typical for these frames), use a balanced approach
      // that fills the canvas but preserves more of the composition
      if (imgRatio > canvasRatio) {
        // Image is wider than canvas - fit to width with minimal crop
        drawWidth = width;
        drawHeight = width / imgRatio;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      } else {
        // Image is taller than canvas - fit to height
        drawHeight = height;
        drawWidth = height * imgRatio;
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
      }
      
      context.clearRect(0, 0, width, height);
      context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Scroll handler - use the scroll section's dimensions
    const handleScroll = () => {
      const scrollRect = scrollSection.getBoundingClientRect();
      const scrollHeight = scrollSection.scrollHeight - window.innerHeight;
      const scrollProgress = Math.max(0, Math.min(1, -scrollRect.top / scrollHeight));
      
      targetFrameRef.current = Math.floor(scrollProgress * (frames.length - 1));
    };

    // Animation loop for smooth rendering
    const animate = () => {
      if (targetFrameRef.current !== currentFrame) {
        setCurrentFrame(targetFrameRef.current);
        
        const rect = container.getBoundingClientRect();
        if (frames[targetFrameRef.current]) {
          drawFrame(ctx, frames[targetFrameRef.current], rect.width, rect.height);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [frames, currentFrame, isLoading, prefersReducedMotion, scrollSectionRef]);

  // Render first frame when loaded
  useEffect(() => {
    if (!isLoading && frames.length > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        ctx.scale(dpr, dpr);
        
        // Draw first frame using same scaling logic as animation
        const img = frames[0];
        const imgRatio = img.width / img.height;
        const canvasRatio = rect.width / rect.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imgRatio > canvasRatio) {
          drawWidth = rect.width;
          drawHeight = rect.width / imgRatio;
          offsetX = 0;
          offsetY = (rect.height - drawHeight) / 2;
        } else {
          drawHeight = rect.height;
          drawWidth = rect.height * imgRatio;
          offsetX = (rect.width - drawWidth) / 2;
          offsetY = 0;
        }
        
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    }
  }, [isLoading, frames]);

  if (prefersReducedMotion) {
    // Fallback for reduced motion - show static first frame
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        {frames.length > 0 && (
          <img
            src="/FRAMES/ezgif-frame-001.jpg"
            alt="Bridal Lehenga"
            className="w-full h-full object-cover"
          />
        )}
        {children}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a0a0a] via-[#2d1515] to-[#1a0a0a] text-white">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-amber-300">Loading experience...</p>
            <p className="text-[10px] text-gray-400">{frames.length} / {TOTAL_FRAMES} frames</p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: isLoading ? 'none' : 'block' }}
      />
      {children}
    </div>
  );
}
