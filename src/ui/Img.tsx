import { useState, type ImgHTMLAttributes } from 'react';

/**
 * An <img> that shimmers (Facebook-style skeleton) until its photo arrives,
 * then sharpens into place. The shimmer is the image's own background, so it
 * fits whatever box, radius or mat the image already sits in.
 */
export function Img({ className, onLoad, onError, src, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>(undefined);
  const loaded = loadedSrc === src;
  return (
    <img
      {...rest}
      src={src}
      className={['kd-img', className].filter(Boolean).join(' ')}
      data-loaded={loaded || undefined}
      // A cached photo can finish before React attaches onLoad, so check on mount too.
      ref={(el) => { if (el?.complete && el.naturalWidth > 0 && !loaded) setLoadedSrc(src); }}
      onLoad={(e) => { setLoadedSrc(src); onLoad?.(e); }}
      onError={(e) => { setLoadedSrc(src); onError?.(e); }}
    />
  );
}
