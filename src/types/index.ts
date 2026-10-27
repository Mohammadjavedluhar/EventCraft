export type BackgroundType =
  | 'transparent'
  | 'studio_white'
  | 'slate_dark'
  | 'aesthetic_sand'
  | 'solid'
  | 'gradient'
  | 'podium';

export type ShadowType = 'none' | 'contact' | 'drop' | 'reflection' | 'pedestal';

export interface GradientConfig {
  type: 'radial' | 'linear';
  from: string;
  to: string;
  angle?: number;
}

export interface StudioSettings {
  backgroundType: BackgroundType;
  backgroundColor: string;
  gradient: GradientConfig;
  shadowType: ShadowType;
  shadowOpacity: number; // 0 to 1
  shadowBlur: number; // 0 to 50
  shadowOffsetY: number; // -20 to 60
  brightness: number; // 0.7 to 1.3, default 1
  contrast: number; // 0.7 to 1.4, default 1
  saturation: number; // 0.5 to 1.5, default 1
  sharpness: number; // 0 to 1
  cleanGlare: boolean;
  cleanDust: boolean;
  tolerance: number; // 5 to 70, default 25
  feather: number; // 0 to 6, default 1.5
  centerSubject: boolean;
  paddingPercent: number; // 5 to 30
}

export interface RetouchPlan {
  productName?: string;
  category?: string;
  primaryColor?: string;
  backgroundAction?: string;
  targetBackground?: string;
  suggestedBgColor?: string;
  gradient?: {
    type: 'radial' | 'linear';
    from: string;
    to: string;
  };
  shadow?: {
    type: ShadowType;
    opacity: number;
    blur: number;
    offsetY: number;
  };
  cleanup?: {
    cleanGlare?: boolean;
    cleanDust?: boolean;
    sharpenProduct?: boolean;
    autoLevels?: boolean;
    brightnessDelta?: number;
    contrastDelta?: number;
    saturationDelta?: number;
  };
  cropSuggestions?: {
    centerSubject?: boolean;
    paddingPercent?: number;
  };
  retouchingSummary?: string;
}

export interface EditHistoryItem {
  id: string;
  imageUrl: string;
  instruction: string;
  settings: StudioSettings;
  timestamp: number;
  source: 'original' | 'ai_instruction' | 'manual_adjust' | 'brush_cleanup';
}
