import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Sparkles,
  Gauge,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/utils/cn";

export interface VideoPreviewPlayerRef {
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
}

interface VideoPreviewPlayerProps {
  src?: string;
  poster?: string;
  durationSeconds?: number;
  activeSceneTitle?: string;
  aspectRatio?: string;
  onTimeUpdate?: (currentTime: number) => void;
  className?: string;
}

export const VideoPreviewPlayer = forwardRef<VideoPreviewPlayerRef, VideoPreviewPlayerProps>(
  (
    {
      src,
      poster,
      durationSeconds = 28.5,
      activeSceneTitle,
      aspectRatio = "9:16",
      onTimeUpdate,
      className,
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(durationSeconds);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [isFrameLoaded, setIsFrameLoaded] = useState(false);
    const [mediaError, setMediaError] = useState<string | null>(null);

    // Provide imperative handles to parent so clicking any timestamp will seek
    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        if (videoRef.current) {
          const clamped = Math.max(0, Math.min(seconds, duration || durationSeconds));
          videoRef.current.currentTime = clamped;
          setCurrentTime(clamped);
          onTimeUpdate?.(clamped);
        } else {
          setCurrentTime(seconds);
          onTimeUpdate?.(seconds);
        }
      },
      play: () => {
        videoRef.current?.play().catch(() => {});
        setIsPlaying(true);
      },
      pause: () => {
        videoRef.current?.pause();
        setIsPlaying(false);
      },
      getCurrentTime: () => currentTime,
    }));

    // Reset video states whenever src changes
    useEffect(() => {
      setIsPlaying(false);
      setCurrentTime(0);
      setIsFrameLoaded(false);
      setMediaError(null);
      setIsBuffering(false);
      if (videoRef.current) {
        videoRef.current.load();
      }
    }, [src]);

    useEffect(() => {
      if (durationSeconds && durationSeconds > 0) {
        setDuration(durationSeconds);
      }
    }, [durationSeconds]);

    // Handle browser fullscreen events
    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(Boolean(document.fullscreenElement));
      };
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
      };
    }, []);

    const handleTogglePlay = () => {
      if (!videoRef.current || mediaError) return;
      if (videoRef.current.paused) {
        videoRef.current.play().catch((err) => {
          console.warn("Video play interrupted:", err);
        });
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    const handleTimeUpdate = () => {
      if (videoRef.current) {
        const time = videoRef.current.currentTime;
        setCurrentTime(time);
        onTimeUpdate?.(time);
      }
    };

    const handleLoadedMetadata = () => {
      if (videoRef.current && videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    };

    const handleLoadedData = () => {
      setIsFrameLoaded(true);
      setIsBuffering(false);
      // Natively render the first frame while paused by a tiny seek tick if at 0
      if (videoRef.current && videoRef.current.currentTime === 0) {
        try {
          videoRef.current.currentTime = 0.001;
        } catch {
          // Safe fallback
        }
      }
    };

    const handleMediaError = () => {
      setIsBuffering(false);
      setIsFrameLoaded(false);
      const err = videoRef.current?.error;
      let msg = "Unable to load video stream";
      if (err) {
        if (err.code === 4) {
          msg = "Video format or codec not supported by browser";
        } else if (err.code === 2) {
          msg = "Network connection issue loading video";
        } else if (err.code === 3) {
          msg = "Decoding error while rendering video";
        }
      }
      setMediaError(msg);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = parseFloat(e.target.value);
      if (videoRef.current) {
        videoRef.current.currentTime = newTime;
      }
      setCurrentTime(newTime);
      onTimeUpdate?.(newTime);
    };

    const handleToggleMute = () => {
      if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
      }
    };

    const handleChangePlaybackRate = () => {
      const rates = [1, 1.25, 1.5, 2, 0.75];
      const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
      if (videoRef.current) {
        videoRef.current.playbackRate = nextRate;
      }
      setPlaybackRate(nextRate);
    };

    const handleToggleFullscreen = () => {
      if (!containerRef.current) return;
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      } else {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    };

    const formatSeconds = (sec: number) => {
      if (isNaN(sec) || sec < 0) return "00:00.0";
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      const ms = Math.floor((sec % 1) * 10);
      return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
    };

    const isVertical = aspectRatio === "9:16";

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-card-border bg-black shadow-card group",
          className
        )}
      >
        {/* Video Area */}
        <div
          className={cn(
            "relative w-full flex items-center justify-center bg-black/95 overflow-hidden",
            isVertical ? "max-h-[520px] aspect-[9/16]" : "aspect-video"
          )}
        >
          {src ? (
            <>
              <video
                ref={videoRef}
                src={src}
                poster={poster || undefined}
                preload="auto"
                playsInline
                className={cn(
                  "h-full w-full object-contain cursor-pointer transition-opacity duration-200",
                  isFrameLoaded ? "opacity-100" : "opacity-0"
                )}
                onClick={handleTogglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onLoadedData={handleLoadedData}
                onCanPlay={() => setIsBuffering(false)}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => {
                  setIsBuffering(false);
                  setIsPlaying(true);
                }}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    setCurrentTime(0);
                  }
                }}
                onError={handleMediaError}
              />

              {/* Initial Loading Indicator while fetching first frame */}
              {!isFrameLoaded && !mediaError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 pointer-events-none z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="mt-2 text-xs font-medium text-text-muted">
                    Loading Reel preview...
                  </span>
                </div>
              )}

              {/* Buffering Spinner during playback */}
              {isBuffering && isPlaying && !mediaError && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent bg-black/40 backdrop-blur-xs p-1" />
                </div>
              )}

              {/* Error Overlay - Never shows placeholder artwork or demo images */}
              {mediaError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/90 text-center z-20 space-y-2">
                  <div className="h-10 w-10 rounded-full bg-danger/15 border border-danger/30 flex items-center justify-center text-danger">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-text-primary">Preview Unavailable</p>
                  <p className="text-[11px] text-text-muted max-w-[220px]">{mediaError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaError(null);
                      setIsFrameLoaded(false);
                      if (videoRef.current) {
                        videoRef.current.load();
                      }
                    }}
                    className="mt-2 px-3 py-1 rounded bg-card border border-card-border text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Play Button Overlay when paused and no error - first frame visible underneath */}
              {!isPlaying && !mediaError && (
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all cursor-pointer group/overlay z-10"
                  aria-label="Play video"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-white shadow-glow-primary group-hover/overlay:scale-110 transition-transform">
                    <Play className="h-7 w-7 text-white ml-0.5" />
                  </div>
                </button>
              )}
            </>
          ) : (
            /* Simulated Reel Player for Demo Presets (where no direct video URL exists) */
            <div
              className="relative h-full w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 via-navy-900 to-black text-center cursor-pointer"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {poster && (
                <img
                  src={poster}
                  alt="Video thumbnail"
                  className="absolute inset-0 h-full w-full object-cover opacity-35"
                />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/25 border border-primary/40 backdrop-blur-md text-white shadow-glow-primary transition-transform group-hover:scale-105">
                  {isPlaying ? (
                    <Pause className="h-7 w-7 text-white" />
                  ) : (
                    <Play className="h-7 w-7 text-white ml-0.5" />
                  )}
                </div>
                <p className="mt-4 text-xs font-medium text-text-primary bg-background/80 px-3 py-1 rounded-full border border-card-border">
                  Simulated Reel Player · Click to Play
                </p>
              </div>
            </div>
          )}

          {/* Active Scene Overlay Badge */}
          {activeSceneTitle && (
            <div className="absolute top-3 left-3 right-3 pointer-events-none z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-background/90 px-2.5 py-1 text-[11px] font-medium text-text-primary border border-card-border/80 backdrop-blur-md shadow-md">
                <Sparkles className="h-3 w-3 text-primary" />
                {activeSceneTitle}
              </span>
            </div>
          )}
        </div>

        {/* Video Control Bar */}
        <div className="w-full bg-background-elevated/95 border-t border-card-border/80 px-3.5 py-2.5 backdrop-blur-md flex flex-col gap-2 z-10">
          {/* Progress Scrub Bar */}
          <div className="relative flex items-center w-full">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.05"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-card-border rounded-lg appearance-none cursor-pointer accent-primary hover:h-2 transition-all"
              aria-label="Video seek slider"
            />
          </div>

          {/* Buttons & Time */}
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="p-1 rounded text-text-primary hover:text-primary transition-colors focus:outline-none"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = 0;
                  setCurrentTime(0);
                }}
                className="p-1 rounded text-text-secondary hover:text-text-primary transition-colors"
                title="Replay from start"
                aria-label="Replay from start"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <div className="font-mono text-[11px] font-medium text-text-primary ml-1">
                <span className="text-primary">{formatSeconds(currentTime)}</span>
                <span className="text-text-muted"> / {formatSeconds(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleChangePlaybackRate}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium bg-card border border-card-border text-text-secondary hover:text-text-primary transition-colors"
                title="Playback Speed"
              >
                <Gauge className="h-3 w-3" />
                <span>{playbackRate}x</span>
              </button>

              <button
                type="button"
                onClick={handleToggleMute}
                className="p-1 rounded text-text-secondary hover:text-text-primary transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-warning" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="p-1 rounded text-text-secondary hover:text-text-primary transition-colors"
                aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                <Maximize className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

VideoPreviewPlayer.displayName = "VideoPreviewPlayer";
