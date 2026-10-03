import { create } from 'zustand';

interface VRState {
  videoUrl: string;
  isImmersive: boolean;
  isPhoneVRMode: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  gazeProgress: number; // 0 - 100%
  activeGazeTargetId: string | null;

  setVideoUrl: (url: string) => void;
  enterImmersive: () => void;
  exitImmersive: () => void;
  togglePhoneVRMode: () => void;
  togglePlayback: () => void;
  toggleMute: () => void;
  setGazeTarget: (targetId: string | null) => void;
  setGazeProgress: (progress: number) => void;
  resetGaze: () => void;
}

const defaultVideo = import.meta.env.VITE_DEFAULT_360_VIDEO_URL || '/videos/training360.mp4';

export const useVRStore = create<VRState>((set) => ({
  videoUrl: defaultVideo,
  isImmersive: false,
  isPhoneVRMode: false,
  isPlaying: true,
  isMuted: true,
  gazeProgress: 0,
  activeGazeTargetId: null,

  setVideoUrl: (url: string) => set({ videoUrl: url }),
  enterImmersive: () => set({ isImmersive: true }),
  exitImmersive: () => set({ isImmersive: false, isPhoneVRMode: false }),
  togglePhoneVRMode: () => set((state) => ({ isPhoneVRMode: !state.isPhoneVRMode })),
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setGazeTarget: (targetId: string | null) => set({ activeGazeTargetId: targetId }),
  setGazeProgress: (progress: number) => set({ gazeProgress: progress }),
  resetGaze: () => set({ gazeProgress: 0, activeGazeTargetId: null }),
}));
