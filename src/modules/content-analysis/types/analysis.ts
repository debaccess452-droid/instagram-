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
  evidenceStatus?: "Observed" | "Estimated" | "Unable to determine";
}

export interface CutTransitionItem {
  timestamp: string;
  seconds: number;
  transitionType: string;
  description: string;
  evidenceStatus?: "Observed" | "Estimated" | "Unable to determine";
}

export interface TextGraphicEditingItem {
  timestamp: string;
  seconds: number;
  exactExtractedText?: string;
  presentationType: "Kinetic Word Pop" | "Title Banner" | "Lower Third" | "Call to Action" | "Split Screen Label" | "Static Overlay";
  description: string;
  evidenceStatus?: "Observed" | "Estimated" | "Unable to determine";
}

export interface VisualEffectItem {
  timestamp?: string;
  seconds?: number;
  technique: string;
  observableDetails: string;
  evidenceStatus?: "Observed" | "Estimated" | "Unable to determine";
}

export interface AudioEditingItem {
  timestamp?: string;
  seconds?: number;
  audioElement: "Voiceover Edit" | "Music Bed Ducking" | "Sound Effect Sync" | "Pacing / Breath Removal" | "Volume Accent";
  observableDetails: string;
  evidenceStatus?: "Observed" | "Estimated" | "Unable to determine";
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

/**
 * Status of the audio analysis pipeline in Supabase
 */
export type AudioAnalysisStatus = "pending" | "processing" | "completed" | "failed";

/**
 * Exact response structure returned by the analyze-audio Supabase Edge Function
 */
export interface AudioBackendResult {
  spoken_dialogue: {
    full_transcript: string;
    language: string;
  };
  language_detection: {
    primary_language: string;
    additional_languages: string[];
  };
  voice_characteristics: Array<{
    speaker_label: string;
    perceived_voice_presentation: string;
    tone: string;
    pace: string;
    delivery_style: string;
    emotional_expression: string;
    evidence_notes: string;
  }>;
  background_music: {
    detected: boolean;
    description: string;
  };
  sound_effects: Array<{
    start_time_seconds: number;
    end_time_seconds: number;
    description: string;
  }>;
  timestamped_transcript: Array<{
    start_time_seconds: number;
    end_time_seconds: number;
    spoken_text: string;
    language: string;
    speaker_label: string;
    delivery_notes: string;
  }>;
  analysis_metadata: {
    warnings: string[];
    provider?: string;
    model?: string;
  };
}

/**
 * Status of the visual analysis pipeline in Supabase
 */
export type VisualAnalysisStatus =
  | "queued"
  | "pending"
  | "processing"
  | "groq_processing"
  | "completed"
  | "failed"
  | (string & {});

export interface FramePathItem {
  path: string;
  timestamp_seconds: number;
}

export interface VisualBackendSceneSubject {
  subject_label: string;
  visible_appearance: string;
  clothing: string;
  visible_action: string;
}

export interface VisualBackendSceneEnvironment {
  setting: string;
  background: string;
  visible_objects: string[];
}

export interface VisualBackendSceneCamera {
  shot_framing: string;
  camera_angle: string;
  camera_movement: string;
  evidence_notes: string;
}

export interface VisualBackendSceneComposition {
  subject_placement: string;
  dominant_colours: string[];
  contrast_and_lighting_appearance: string;
}

export interface VisualBackendScene {
  scene_number: number;
  start_time_seconds: number;
  end_time_seconds: number;
  scene_description: string;
  visible_subjects: VisualBackendSceneSubject[];
  environment: VisualBackendSceneEnvironment;
  camera: VisualBackendSceneCamera;
  composition: VisualBackendSceneComposition;
  on_screen_text?: string[];
}

export interface VisualBackendTransition {
  timestamp_seconds: number;
  transition_type: string;
  observable_change: string;
}

export interface VisualBackendElements {
  readable_text: string[];
  logos_and_graphics: string[];
  recurring_visual_elements: string[];
}

export interface VisualBackendMetadata {
  warnings: string[];
  frame_sampling_fps?: number;
  model?: string;
  source?: string;
  provider?: string;
  fallback_used?: boolean;
  frame_count?: number;
  frames_submitted?: number;
  submitted_frames?: FramePathItem[];
  frame_paths?: FramePathItem[];
  frame_timestamps?: number[];
  sampling_limit_reached?: boolean;
  sampling_warning?: string;
  is_demo_data?: boolean;
  analyzed_at?: string;
}

export interface VisualBackendOverview {
  summary: string;
  duration_observation: string;
}

/**
 * Exact response structure returned by the analyze-visual Supabase Edge Function
 */
export interface VisualBackendResult {
  video_overview: VisualBackendOverview;
  scenes: VisualBackendScene[];
  transitions?: VisualBackendTransition[];
  visual_elements?: VisualBackendElements;
  analysis_metadata: VisualBackendMetadata;
}

/**
 * Status of the on-screen text extraction pipeline in Supabase
 */
export type TextExtractionStatus =
  | "queued"
  | "pending"
  | "processing"
  | "groq_processing"
  | "completed"
  | "failed"
  | (string & {});

export interface TextExtractionBackendSegment {
  start_time_seconds: number;
  end_time_seconds: number;
  extracted_text: string;
  position_on_screen?: string | null;
  text_type?: string | null;
  readability?: string | null;
  uncertain_characters?: string | null;
  notes?: string | null;
}

export interface TextExtractionBackendMetadata {
  warnings?: string[];
  provider?: string;
  model?: string;
  source?: string;
  analyzed_at?: string;
}

/**
 * Exact response structure returned by the analyze-text Supabase Edge Function
 */
export interface TextExtractionBackendResult {
  video_text_summary?: string | null;
  text_segments: TextExtractionBackendSegment[];
  languages_visible?: string[];
  analysis_metadata?: TextExtractionBackendMetadata;
}

/**
 * Status of the original reel script generation pipeline in Supabase
 */
export type OriginalScriptStatus =
  | "pending"
  | "processing"
  | "queued"
  | "completed"
  | "failed"
  | (string & {});

export interface OriginalScriptBackendRow {
  time: string;
  time_start_seconds?: number | null;
  time_end_seconds?: number | null;
  original_voiceover_audio?: string | null;
  exact_on_screen_text?: string | null;
  detailed_visual_direction?: string | null;
}

export interface OriginalScriptSourceInfo {
  provider?: string | null;
  model?: string | null;
  status?: string | null;
}

export interface OriginalScriptBackendMetadata {
  warnings?: string[];
  synchronization_method?: string | null;
  sync_method?: string | null;
  method?: string | null;
  analysis_notes?: string | string[] | null;
  notes?: string | string[] | null;
  audio_provider?: string | null;
  audio_model?: string | null;
  visual_provider?: string | null;
  visual_model?: string | null;
  text_provider?: string | null;
  text_model?: string | null;
  text_extraction_provider?: string | null;
  text_extraction_model?: string | null;
  sources?: {
    audio?: OriginalScriptSourceInfo;
    visual?: OriginalScriptSourceInfo;
    text?: OriginalScriptSourceInfo;
    text_extraction?: OriginalScriptSourceInfo;
  };
  source_models?: {
    audio?: OriginalScriptSourceInfo;
    visual?: OriginalScriptSourceInfo;
    text?: OriginalScriptSourceInfo;
    text_extraction?: OriginalScriptSourceInfo;
  };
  analyzed_at?: string;
  generated_at?: string;
}

/**
 * Exact response structure returned by the generate-original-script Supabase Edge Function
 */
export interface OriginalScriptBackendResult {
  rows: OriginalScriptBackendRow[];
  analysis_metadata?: OriginalScriptBackendMetadata;
}

export interface OriginalScriptSourceStatuses {
  audio?: string | null;
  visual?: string | null;
  text?: string | null;
}

/**
 * Database record matching public.content_analyses table in Supabase.
 */
export interface ContentAnalysisRecord {
  id: string; // UUID generated automatically
  user_id: string; // Authenticated user's UUID
  file_path: string; // Storage path: {user_id}/{unique_file_name}
  file_name: string; // Original uploaded file name
  mime_type: string; // video/mp4, video/quicktime, or video/webm
  file_size_bytes: number; // File size in bytes
  duration_seconds: number | null; // Optional video duration
  status: "uploaded" | "processing" | "completed" | "failed"; // Overall status
  analysis_result: ContentAnalysisResult | Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;

  // Dedicated Audio Analysis columns
  audio_analysis?: AudioBackendResult | null;
  audio_analysis_status?: AudioAnalysisStatus | null;
  audio_analysis_error?: string | null;
  audio_analysis_started_at?: string | null;
  audio_analysis_completed_at?: string | null;

  // Dedicated Visual Analysis columns
  visual_analysis?: VisualBackendResult | null;
  visual_analysis_status?: VisualAnalysisStatus | null;
  visual_analysis_error?: string | null;
  visual_analysis_started_at?: string | null;
  visual_analysis_completed_at?: string | null;

  // Dedicated On-Screen Text Extraction columns
  text_extraction?: TextExtractionBackendResult | null;
  text_extraction_status?: TextExtractionStatus | null;
  text_extraction_error?: string | null;
  text_extraction_started_at?: string | null;
  text_extraction_completed_at?: string | null;

  // Dedicated Original Reel Script columns
  original_script?: OriginalScriptBackendResult | null;
  original_script_status?: OriginalScriptStatus | null;
  original_script_error?: string | null;
  original_script_started_at?: string | null;
  original_script_completed_at?: string | null;
}

export interface AnalysisHistoryItem {
  id: string;
  videoTitle: string;
  videoFileName: string;
  thumbnailUrl: string;
  uploadedAt: string;
  durationFormatted: string;
  status: "completed" | "processing" | "failed" | "uploaded";
  sceneCount: number;
  accuracyScore: number;
  isDemo?: boolean;
  filePath?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  createdAt?: string;

  // Real Audio Analysis metadata
  audioAnalysis?: AudioBackendResult | null;
  audioAnalysisStatus?: AudioAnalysisStatus | null;
  audioAnalysisError?: string | null;

  // Real Visual Analysis metadata
  visualAnalysis?: VisualBackendResult | null;
  visualAnalysisStatus?: VisualAnalysisStatus | null;
  visualAnalysisError?: string | null;

  // Real On-Screen Text Extraction metadata
  textExtraction?: TextExtractionBackendResult | null;
  textExtractionStatus?: TextExtractionStatus | null;
  textExtractionError?: string | null;

  // Real Original Reel Script metadata
  originalScript?: OriginalScriptBackendResult | null;
  originalScriptStatus?: OriginalScriptStatus | null;
  originalScriptError?: string | null;
}

export type AnalysisTabType =
  | "overview"
  | "audio"
  | "visual"
  | "text"
  | "script"
  | "editing"
  | "accuracy";


