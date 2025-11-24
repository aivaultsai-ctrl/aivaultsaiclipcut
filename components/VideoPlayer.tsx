import React, { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  src: string;
  startTime?: number; // In seconds
  endTime?: number; // In seconds
  aspectRatio?: 'landscape' | 'portrait';
  autoPlay?: boolean;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  startTime = 0, 
  endTime, 
  aspectRatio = 'landscape',
  autoPlay = false,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (endTime && video.currentTime >= endTime) {
        video.currentTime = startTime;
        video.play().catch(() => {});
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    // Initial seek
    if (Math.abs(video.currentTime - startTime) > 0.5) {
       video.currentTime = startTime;
    }

    if (autoPlay) {
      video.play().catch(e => console.log("Autoplay blocked", e));
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [startTime, endTime, autoPlay, src]);

  const defaultClasses = aspectRatio === 'portrait' 
    ? 'aspect-[9/16] w-full max-w-xs mx-auto' 
    : 'aspect-video w-full';

  return (
    <div className={`relative overflow-hidden rounded-xl bg-black shadow-2xl ${className || defaultClasses}`}>
      {/* 
        Simulate 9:16 Crop for Portrait Mode:
        We use object-cover and a fixed aspect ratio container to "crop" the center of the video.
      */}
      <video
        ref={videoRef}
        src={src}
        controls={aspectRatio === 'landscape' && !className} // Hide controls if it's a preview/custom class
        className={`w-full h-full ${aspectRatio === 'portrait' ? 'object-cover' : 'object-contain'}`}
        loop={!endTime} // Native loop if no specific segment
        muted={autoPlay} // Mute if autoplay to allow browser to play
        playsInline
      />
      
      {aspectRatio === 'portrait' && !className && (
        <div className="absolute inset-0 pointer-events-none border-[1px] border-white/10 rounded-xl">
           <div className="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded text-xs font-mono text-white/80">
              9:16 PREVIEW
           </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;