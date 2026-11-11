export interface AudioSegment {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  timestamp: string; // e.g. "00:00–00:02"
  speaker: string;
  spokenText: string;
  audioType: "dialogue" | "voiceover" | "ambient" | "sfx";
  clarity: "clear" | "partially_muffled" | "inaudible";
  confidence: number; // 0-100
  notes?: string;
}

export interface VoiceCharacteristics {
  tone: string;
  speakingStyle: string;
  paceWpm: number;
  paceDescription: "fast" | "moderate" | "deliberate" | "dynamic";
  primaryEmotion: string;
  accent?: string;
  vocalProjection: string;
}

export interface BackgroundAudioInfo {
  trackIdentified?: string;
  genre: string;
  tempoBpm?: number;
  mood: string;
  musicDucking: boolean;
  sfxElements: Array<{
    name: string;
    timestamp: string;
    seconds: number;
    description: string;
  }>;
  audioSeparationQuality: "excellent" | "good" | "moderate" | "poor";
  syncRating: string;
  hasMusicDetected?: boolean | "detected" | "not_detected" | "unable_to_determine";
  musicDescription?: string;
}

export interface AudioAnalysisData {
  language: {
    detected: string;
    code: string;
    confidence: number;
    secondaryLanguages?: string[];
  };
  voice: VoiceCharacteristics;
  backgroundAudio: BackgroundAudioInfo;
  segments: AudioSegment[];
  overallClarityScore: number;
}

export interface VisualScene {
  id: string;
  sceneNumber: number;
  startTime: number;
  endTime: number;
  timestamp: string;
  thumbnailPlaceholderUrl?: string;
  thumbnailColor?: string;
  settingAndBackground: string;
  subjectDescription: string;
  clothingAndAppearance?: string;
  subjectActionsAndGestures: string;
  cameraAngle: "eye-level" | "low-angle" | "high-angle" | "dutch-angle" | "overhead";
  cameraFraming: "extreme-close-up" | "close-up" | "medium-close-up" | "medium-shot" | "wide-shot";
  cameraMovement: "static" | "slow-push-in" | "quick-whip-pan" | "handheld-organic" | "tracking" | "crash-zoom";
  lighting: string;
  composition: string;
  objectsAndProps: string[];
  transitionIn: string;
  storytellingPurpose: string;
  visualDescription?: string;
}

export interface VisualAnalysisData {
  totalScenes: number;
  dominantColorPalette: string[];
  lightingStyle: string;
  framingConsistency: string;
  scenes: VisualScene[];
}

export interface OnScreenTextElement {
  id: string;
  startTime: number;
  endTime: number;
  timestamp: string;
  exactText: string;
  position: "top-center" | "middle-center" | "lower-third" | "bottom-center" | "floating-dynamic";
  fontStyleDescription: string;
  textColor: string;
  backgroundTreatment: string;
  ocrConfidence: number; // 0-100
  verificationStatus: "Verified" | "Partially Verified" | "Unclear";
  isAnimated: boolean;
  animationType?: string;
}

export interface TextExtractionData {
  totalTextElements: number;
  captioningStyle: string;
  textElements: OnScreenTextElement[];
  rawTextConcatenated: string;
}

export interface ScriptTableRow {
  id: string;
  startTime: number;
  endTime: number;
  timestamp: string; // e.g. "00:00–00:01"
  originalVoiceover: string;
  exactOnScreenText: string;
  detailedVisualDirection: string;
  sceneNumber: number;
  confidenceScore: number;
  uncertaintyNotes?: string;
}

export interface EditingTimelineEvent {
  timestamp: string;
  seconds: number;
  editingAction: string;
  observableResult: string;
}

export interface CutTransitionItem {
  timestamp: string;
  seconds: number;
  transitionType: string;
  description: string;
}

export interface TextGraphicEditingItem {
  timestamp: string;
  seconds: number;
  exactExtractedText?: string;
  presentationType: "Kinetic Word Pop" | "Title Banner" | "Lower Third" | "Call to Action" | "Split Screen Label" | "Static Overlay";
  description: string;
}

export interface VisualEffectItem {
  timestamp?: string;
  seconds?: number;
  technique: string;
  observableDetails: string;
}

export interface AudioEditingItem {
  timestamp?: string;
  seconds?: number;
  audioElement: "Voiceover Edit" | "Music Bed Ducking" | "Sound Effect Sync" | "Pacing / Breath Removal" | "Volume Accent";
  observableDetails: string;
}

export interface EditingTechnicalDetails {
  durationSeconds: number;
  formattedDuration: string;
  aspectRatio: "9:16" | "16:9" | "1:1" | "4:5";
  resolution: string;
  estimatedFps: number;
  orientation: "vertical" | "horizontal" | "square";
  fileSizeBytes?: number;
  format: string;
}

export interface EditingSceneBreakdown {
  totalScenes: number;
  averageShotDurationSeconds: number;
  cutTimestamps: Array<{ timestamp: string; seconds: number }>;
  transitionTypes: Array<{ type: string; count: number }>;
  jumpCutCount: number;
  speedRampingCount: number;
  hasSlowMotion: boolean;
  beatSynchronization: "tight" | "moderate" | "loose" | "none";
}

export interface StorytellingArcStage {
  stage: "Hook" | "Opening" | "Main Content" | "Development" | "Payoff" | "Call-to-Action";
  timestamp: string;
  secondsStart: number;
  secondsEnd: number;
  description: string;
  engagementIntent: string;
}

export interface EditingBreakdownData {
  // Observable technical and pacing parameters
  technical: EditingTechnicalDetails;
  pacing: EditingSceneBreakdown;
  audioEditing: {
    voTimingScore: string;
    musicSyncScore: string;
    soundEffectFrequency: string;
    audioTransitionsDescription: string;
    audioItems?: AudioEditingItem[];
  };
  visualEditing: {
    textAnimationsCount: number;
    zoomsAndPansCount: number;
    colorGradingNotes: string;
    vfxList: string[];
    vfxItems?: VisualEffectItem[];
    textGraphicItems?: TextGraphicEditingItem[];
  };
  storytellingArc?: StorytellingArcStage[];

  // Step 5 specific structured observable components
  cutsAndTransitions?: CutTransitionItem[];
  pacingAndRhythmDetails?: {
    rhythmDescription: string;
    averageShotDurationSeconds: number;
    rapidCutSequences: string;
    uninterruptedShots: string;
    speechRelation: string;
  };
  textAndGraphics?: TextGraphicEditingItem[];
  visualEffectsAndLayering?: VisualEffectItem[];
  audioSyncBreakdown?: AudioEditingItem[];
  editingTimeline?: EditingTimelineEvent[];
}

export interface AccuracyDimension {
  dimension: string;
  status: "Verified" | "Partially Verified" | "Unclear" | "Not Detectable";
  confidenceScore: number;
  directEvidenceSummary: string;
  aiInterpretationSummary: string;
}

export interface UnclearSectionItem {
  id: string;
  category: "Speech / Dialogue" | "Visual Detail" | "On-Screen Text" | "Timestamp Alignment";
  timestamp: string;
  description: string;
  reason: string;
  recommendation: string;
}

export interface AccuracyReportData {
  overallAccuracyRating: "High (Direct Evidence)" | "Moderate" | "Needs Manual Review";
  overallScore: number;
  dimensions: AccuracyDimension[];
  unclearSections: UnclearSectionItem[];
  methodologyNotes: string;
}

export interface ContentAnalysisResult {
  id: string;
  videoTitle: string;
  videoFileName: string;
  videoUrl?: string; // blob or sample URL
  thumbnailUrl: string;
  analyzedAt: string;
  durationSeconds: number;
  formattedDuration: string;
  aspectRatio: string;
  detectedLanguage: string;
  status: "completed" | "processing" | "failed";
  overviewSummary: string;
  keyStrengths: string[];
  growthTakeaways: string[];

  // 6 Main Analysis Sections
  audioAnalysis: AudioAnalysisData;
  visualAnalysis: VisualAnalysisData;
  textExtraction: TextExtractionData;
  scriptTable: ScriptTableRow[];
  editingBreakdown: EditingBreakdownData;
  accuracyReport: AccuracyReportData;

  // Metadata
  isDemoData?: boolean;
}

export interface AnalysisHistoryItem {
  id: string;
  videoTitle: string;
  videoFileName: string;
  thumbnailUrl: string;
  uploadedAt: string;
  durationFormatted: string;
  status: "completed" | "processing" | "failed";
  sceneCount: number;
  accuracyScore: number;
  isDemo?: boolean;
}

export type AnalysisTabType =
  | "overview"
  | "audio"
  | "visual"
  | "text"
  | "script"
  | "editing"
  | "accuracy";
