"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Loader2,
  Volume2,
  VolumeX,
  Maximize,
  PictureInPicture,
  Settings2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const VideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState("0:00");
  const [volumeLevel, setVolumeLevel] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showCenterIcon, setShowCenterIcon] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const resetControlsTimeout = () => {
    setShowControls((prev) => (prev ? prev : true));
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      setShowCenterIcon(true);
      setTimeout(() => setShowCenterIcon(false), 500);
      resetControlsTimeout();
    }
  };

  const handleVideoTouch = () => {
    togglePlay();
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      if (videoRef.current.muted) setVolumeLevel(0);
      else setVolumeLevel(100);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) containerRef.current.requestFullscreen();
    else document.exitFullscreen();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(formatTime(video.duration));
      setIsLoading(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    if (video.readyState >= 1) handleLoadedMetadata();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key.toLowerCase()) {
        case " ":
        case "p":
          e.preventDefault();
          togglePlay();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, isMuted]);

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Watch It In Action
          </h2>
          <p className="text-lg text-foreground/70">
            See how our members are earning passive income
          </p>
        </div>

        <div
          className="relative w-full max-w-4xl mx-auto"
          onMouseMove={resetControlsTimeout}
          onTouchStart={resetControlsTimeout}
        >
          <div
            ref={containerRef}
            className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl bg-black group"
          >
            <video
              ref={videoRef}
              className="w-full h-full object-contain cursor-pointer"
              src="/video/trial.mp4"
              preload="none"
              poster="/placeholder.jpg"
              playsInline
              onClick={handleVideoTouch}
              onLoadStart={() => setIsLoading(true)}
              onWaiting={() => setIsLoading(true)}
              onPlaying={() => {
                setIsLoading(false);
                setIsPlaying(true);
              }}
              onPause={() => setIsPlaying(false)}
            >
              <track
                kind="captions"
                src="/video/trial.en.vtt"
                srcLang="en"
                label="English captions"
                default
              />
            </video>

            {isLoading && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 z-50">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
            )}

            {(showCenterIcon || !isPlaying) && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="lg:w-20 lg:h-20 w-10 h-10 rounded-full bg-accent/90 flex items-center justify-center animate-in zoom-in fade-in duration-300">
                  {isPlaying ? (
                    <Pause className="text-white lg:text-[10px] text-[20px] fill-white" />
                  ) : (
                    <Play className="text-white lg:text-[10px] text-[20px] fill-white ml-1" />
                  )}
                </div>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className={`absolute top-6 left-6 z-40 hidden lg:flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-2 rounded-full border border-white/20 transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0"
              }`}
              type="button"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
              aria-pressed={isMuted}
            >
              {isMuted || volumeLevel === 0 ? (
                <VolumeX size={18} className="text-red-500" />
              ) : (
                <Volume2 size={18} className="text-white" />
              )}
              <span className="text-white text-[10px] font-bold w-10">
                {volumeLevel}%
              </span>
            </button>

            <div
              className={`absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 ${
                showControls || !isPlaying ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="lg:flex hidden justify-between items-end pointer-events-auto">
                <div className="flex-1 min-w-0 pr-4 text-left">
                  <h3 className="lg:text-xl text-sm font-bold text-white leading-tight">
                    How Members Earn Up To 65% Per Referral
                  </h3>
                  <p className="text-white/80 text-[10px] lg:text-sm mt-1">
                    Learn the step-by-step process to maximize your earnings
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="text-white hover:text-accent outline-none"
                        type="button"
                        aria-label="Playback speed settings"
                      >
                        <Settings2 size={22} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-black/95 border-white/20 text-white"
                    >
                      {[0.5, 1, 1.5, 2].map((s) => (
                        <DropdownMenuItem
                          key={s}
                          onClick={() =>
                            videoRef.current &&
                            (videoRef.current.playbackRate = s)
                          }
                          className="cursor-pointer text-xs font-bold focus:bg-accent focus:text-white uppercase"
                        >
                          {s}x {s === 1 ? "Normal" : ""}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      videoRef.current?.requestPictureInPicture();
                    }}
                    className="text-white hover:text-accent"
                    type="button"
                    aria-label="Open picture in picture"
                  >
                    <PictureInPicture size={22} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    className="text-white hover:text-accent"
                    type="button"
                    aria-label="Toggle fullscreen"
                  >
                    <Maximize size={22} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <Card className="bg-white/5 backdrop-blur-sm border-primary/20 p-6 text-center">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="font-bold mb-2 uppercase tracking-tighter">
                Duration
              </h3>
              <p className="text-sm text-foreground/70 font-mono">{duration}</p>
            </Card>
            <Card className="bg-white/5 backdrop-blur-sm border-primary/20 p-6 text-center">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-bold mb-2 uppercase tracking-tighter">
                Best For
              </h3>
              <p className="text-sm text-foreground/70">
                New & Existing Members
              </p>
            </Card>
            <Card className="bg-white/5 backdrop-blur-sm border-primary/20 p-6 text-center">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="font-bold mb-2 uppercase tracking-tighter">
                Topics
              </h3>
              <p className="text-sm text-foreground/70">
                Setup, Recruiting, Earning
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
