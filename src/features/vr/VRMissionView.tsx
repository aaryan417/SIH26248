import React, { useEffect, useRef, useState } from 'react';
import { useVRStore } from '../../store/useVRStore';
import { useScenarioEngine } from '../../hooks/useScenarioEngine';
import { DecisionModal } from '../decisions/DecisionModal';
import {
  Smartphone,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Clock,
  X,
  AlertTriangle,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const VRMissionView: React.FC = () => {
  const {
    videoUrl,
    isImmersive,
    isPhoneVRMode,
    isPlaying,
    isMuted,
    gazeProgress,
    exitImmersive,
    togglePhoneVRMode,
    togglePlayback,
    toggleMute,
  } = useVRStore();

  const {
    session,
    scenario,
    commStatus,
    activeMessages,
    pendingDecisions,
    submitDecision,
    start,
  } = useScenarioEngine();

  // Resolved 360 Video URL (Priority: scenario -> store -> env -> fallback)
  const resolvedVideoUrl =
    scenario?.media?.video360Url ||
    videoUrl ||
    import.meta.env.VITE_DEFAULT_360_VIDEO_URL ||
    '/videos/training360.mp4';

  const [isMediaReady, setIsMediaReady] = useState(false);
  const [isMediaPlaying, setIsMediaPlaying] = useState(false);
  const [hasMediaError, setHasMediaError] = useState(false);
  const [isMissionStarted, setIsMissionStarted] = useState(false);
  const [webXRSupported, setWebXRSupported] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Check WebXR Hardware VR Support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'xr' in navigator && (navigator as any).xr?.isSessionSupported) {
      (navigator as any).xr
        .isSessionSupported('immersive-vr')
        .then((supported: boolean) => setWebXRSupported(supported))
        .catch(() => setWebXRSupported(false));
    } else {
      setWebXRSupported(false);
    }

    console.log('[VR] Resolved 360 video URL:', resolvedVideoUrl);
  }, [resolvedVideoUrl]);

  // Attach diagnostic event listeners to single source HTMLVideoElement
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      console.log('[VR] Metadata loaded for:', resolvedVideoUrl);
    };

    const handleCanPlay = () => {
      console.log('[VR] Video canplay ready');
      setIsMediaReady(true);
      setHasMediaError(false);
    };

    const handlePlaying = () => {
      console.log('[VR] Video playing');
      setIsMediaPlaying(true);
    };

    const handlePause = () => {
      console.log('[VR] Video paused');
      setIsMediaPlaying(false);
    };

    const handleError = () => {
      console.error('[VR] Media error loading 360 video:', video.error);
      setHasMediaError(true);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    // Sync initial src
    if (video.src !== resolvedVideoUrl && !resolvedVideoUrl.startsWith('data:')) {
      video.src = resolvedVideoUrl;
      video.load();
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, [resolvedVideoUrl]);

  // Handle Playback & Mute sync from Store controls
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isMissionStarted) return;

    if (isPlaying && video.paused) {
      video.play().catch((err) => console.warn('[VR] Play call blocked:', err));
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
    video.muted = isMuted;
  }, [isPlaying, isMuted, isMissionStarted]);

  // Clean up media resources on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  // Explicit User Activation to start video playback & scenario clock
  const handleStartMission = async () => {
    const video = videoRef.current;
    if (video) {
      try {
        video.muted = isMuted;
        await video.play();
        setIsMissionStarted(true);
        start(); // Start scenario clock T+

        // Force A-Frame videosphere texture refresh
        const sphere = document.querySelector('#vrVideosphere');
        if (sphere) {
          sphere.setAttribute('src', '#training360VideoSrc');
        }
      } catch (err) {
        console.error('[VR] User activated video play error:', err);
      }
    }
  };

  const activePrompt = pendingDecisions[0];

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `T+ 00:${pad(mins)}:${pad(secs)}`;
  };

  return (
    <div className="relative w-full h-[80vh] bg-black rounded-2xl overflow-hidden border border-command-800 shadow-2xl flex flex-col justify-center items-center">
      {/* Single Source HTML5 Video Element for React & A-Frame */}
      <video
        ref={videoRef}
        id="training360VideoSrc"
        preload="auto"
        loop
        playsInline
        crossOrigin="anonymous"
        className="hidden"
      />

      {/* Main A-Frame 360° Scene */}
      <div className={`w-full h-full ${isPhoneVRMode ? 'grid grid-cols-2 gap-1 bg-black' : ''}`}>
        <a-scene embedded vr-mode-ui="enabled: true" class="w-full h-full">
          <a-assets>
            {/* A-Frame references single source video element */}
          </a-assets>
          <a-videosphere
            id="vrVideosphere"
            src="#training360VideoSrc"
            rotation="0 -90 0"
          ></a-videosphere>
          <a-camera look-controls="enabled: true" wasd-controls="enabled: false">
            <a-cursor color="#06b6d4" radius="0.005"></a-cursor>
          </a-camera>
        </a-scene>

        {/* Secondary Eye View if Phone VR Split Mode Active */}
        {isPhoneVRMode && (
          <div className="w-full h-full relative border-l border-slate-900 pointer-events-none">
            <a-scene embedded vr-mode-ui="enabled: false" class="w-full h-full">
              <a-videosphere src="#training360VideoSrc" rotation="0 -90 0"></a-videosphere>
              <a-camera look-controls="enabled: true" wasd-controls="enabled: false"></a-camera>
            </a-scene>
          </div>
        )}
      </div>

      {/* Loading Overlay before Media is Ready */}
      {!isMissionStarted && !hasMediaError && (
        <div className="absolute inset-0 z-30 bg-command-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
          {!isMediaReady ? (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mx-auto" />
              <div className="text-sm font-mono font-bold text-cyan-400">
                LOADING 360° MISSION ENVIRONMENT...
              </div>
              <div className="text-xs font-mono text-slate-400">
                Buffering video asset ({resolvedVideoUrl})
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-md animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mx-auto shadow-xl shadow-cyan-950">
                <Eye className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-mono font-bold text-white uppercase tracking-wider">
                  {scenario?.name || 'Tactical Mission'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  360° Equirectangular Video Environment Ready. Click below to initiate mission playback and start exercise timer.
                </p>
              </div>
              <button
                onClick={handleStartMission}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-105"
              >
                <Play className="w-5 h-5 fill-black" />
                <span>START IMMERSIVE MISSION</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Video Error Overlay */}
      {hasMediaError && (
        <div className="absolute inset-0 z-30 bg-command-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-400" />
          <div>
            <h3 className="text-lg font-mono font-bold text-slate-100 uppercase">
              360° MEDIA UNAVAILABLE
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Unable to load 360° mission video from source: <code className="text-cyan-400">{resolvedVideoUrl}</code>. Decision prompts and tactical telemetry remain fully operational.
            </p>
          </div>
          <button
            onClick={() => {
              setHasMediaError(false);
              if (videoRef.current) {
                videoRef.current.load();
              }
            }}
            className="bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold text-xs px-4 py-2.5 rounded-xl"
          >
            RETRY STREAM CONNECTION
          </button>
        </div>
      )}

      {/* Reticle Gaze Progress Ring Overlay */}
      {gazeProgress > 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin flex items-center justify-center">
            <span className="text-[10px] font-mono font-bold text-cyan-400">{gazeProgress}%</span>
          </div>
        </div>
      )}

      {/* Contextual VR HUD Overlay */}
      <div className="absolute inset-x-0 top-0 p-4 pointer-events-none z-20 flex items-start justify-between">
        {/* Top Left: Clock & Comms */}
        <div className="bg-command-950/85 backdrop-blur-md p-3 rounded-xl border border-command-800 pointer-events-auto font-mono text-xs space-y-1.5 min-w-[210px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">MISSION TIME</span>
            <span className="text-cyan-400 font-bold">
              {formatTime(session?.currentScenarioTimeMs || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300">SIGNAL</span>
            <span
              className={`font-bold ${
                (commStatus?.signalStrength || 0) < 40 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {commStatus?.signalStrength || 95}%
            </span>
          </div>

          <div className="w-full bg-command-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${commStatus?.signalStrength || 95}%` }}
            />
          </div>

          <div className="pt-1 text-[9px] text-slate-400 flex items-center justify-between border-t border-command-800/60">
            <span>HARDWARE VR:</span>
            {webXRSupported === true ? (
              <span className="text-emerald-400 font-bold">WebXR VR Ready</span>
            ) : (
              <span className="text-amber-400 font-bold">360 Gyro / Mouse Look Active</span>
            )}
          </div>
        </div>

        {/* Top Right: VR Viewport Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={togglePhoneVRMode}
            className={`p-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
              isPhoneVRMode
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-command-900/90 text-slate-300 border border-command-800 hover:bg-command-800'
            }`}
            title="Toggle Cardboard Split VR View"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Phone VR</span>
          </button>

          <button
            onClick={() => {
              togglePlayback();
              if (videoRef.current) {
                if (videoRef.current.paused) videoRef.current.play().catch(() => {});
                else videoRef.current.pause();
              }
            }}
            className="p-2.5 bg-command-900/90 hover:bg-command-800 text-slate-300 border border-command-800 rounded-xl transition-all"
            title="Toggle Video Playback"
          >
            {isMediaPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleMute}
            className="p-2.5 bg-command-900/90 hover:bg-command-800 text-slate-300 border border-command-800 rounded-xl transition-all"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {isImmersive && (
            <button
              onClick={exitImmersive}
              className="p-2.5 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Toast Notification for Incoming Transmissions */}
      {activeMessages.length > 0 && (
        <div className="absolute left-4 bottom-4 z-20 pointer-events-auto max-w-sm">
          <div className="bg-command-950/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-xl space-y-1 text-xs font-mono animate-fade-in">
            <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold">
              <span>NEW TRANSMISSION</span>
              <span>{activeMessages[activeMessages.length - 1].sender}</span>
            </div>
            <div className="text-slate-200 font-bold">
              {activeMessages[activeMessages.length - 1].subject}
            </div>
            <div className="text-slate-400 line-clamp-2 text-[11px]">
              {activeMessages[activeMessages.length - 1].content}
            </div>
          </div>
        </div>
      )}

      {/* Floating Decision Required Modal */}
      {activePrompt && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <DecisionModal
            prompt={activePrompt}
            onSubmit={(optId, rationale, conf) => {
              submitDecision(activePrompt.id, 'part-1', optId, rationale, conf);
            }}
            isVRMode={true}
          />
        </div>
      )}
    </div>
  );
};
