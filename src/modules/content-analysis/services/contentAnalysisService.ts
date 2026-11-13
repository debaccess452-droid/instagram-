import {
  ContentAnalysisResult,
  AnalysisHistoryItem,
  ContentAnalysisRecord,
  AudioBackendResult,
  AudioAnalysisStatus,
  VisualBackendResult,
  VisualAnalysisStatus,
  TextExtractionBackendResult,
  TextExtractionStatus,
  OriginalScriptBackendResult,
  OriginalScriptStatus,
  OriginalScriptSourceStatuses,
  FramePathItem,
  ScriptTableRow,
  EditingTimelineEvent,
} from "../types/analysis";
import {
  DEMO_ANALYSIS_RESULT,
  DEMO_PRESET_REELS,
} from "../data/demoAnalysis";
import { supabase } from "@/lib/supabase";

export const STORAGE_BUCKET = "reel-uploads";
export const VISUAL_FRAMES_BUCKET = "visual-analysis-frames";
export const TABLE_CONTENT_ANALYSES = "content_analyses";

const STORAGE_KEY_CURRENT = "virulmuse_current_analysis";

export const PROCESSING_STAGES = [
  { id: 1, label: "Uploading video container", detail: "Validating bitstream and audio codecs" },
  { id: 2, label: "Extracting audio tracks", detail: "Separating voiceover, musical bed, and SFX" },
  { id: 3, label: "Transcribing speech & phonemes", detail: "Running high-accuracy neural speech recognition" },
  { id: 4, label: "Analyzing visual scenes & framing", detail: "Detecting shot boundaries, camera angles, and lighting" },
  { id: 5, label: "Extracting on-screen text (OCR)", detail: "Scanning bounding boxes, kinetic typography, and safe zones" },
  { id: 6, label: "Synchronizing multimodal timestamps", detail: "Aligning speech phonemes with visual scene cuts" },
  { id: 7, label: "Generating production breakdown", detail: "Evaluating pacing, jump cuts, and narrative arc stages" },
  { id: 8, label: "Preparing evidence-backed accuracy report", detail: "Isolating direct evidence from analytical inferences" },
];

export const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

export const ALLOWED_VIDEO_EXTENSIONS = ["mp4", "mov", "webm"];
export const MAX_VIDEO_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB limit

class ContentAnalysisService {
  /**
   * Uploads an Instagram Reel video to private Supabase Storage ("reel-uploads")
   * and creates a record in `public.content_analyses` associated with the authenticated user.
   */
  public async uploadReel(
    file: File,
    durationSeconds?: number
  ): Promise<{ record: ContentAnalysisRecord }> {
    // 1. Authenticate user from Supabase session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      throw new Error(
        "Authentication required: You must be signed in to upload Reels. Please log in to your account."
      );
    }

    const userId = session.user.id;

    // 2. Validate file type and extension
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isExtensionValid = ALLOWED_VIDEO_EXTENSIONS.includes(ext);
    const isMimeValid = !file.type || ALLOWED_VIDEO_MIME_TYPES.includes(file.type);

    if (!isExtensionValid || (!isMimeValid && file.type)) {
      throw new Error(
        `Unsupported video format. Only MP4, MOV, and WEBM video files are supported. Received "${file.type || ext}".`
      );
    }

    // 3. Validate maximum file size (100 MB)
    if (file.size > MAX_VIDEO_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(
        `File size (${sizeMb} MB) exceeds maximum allowed size of 100 MB.`
      );
    }

    // Determine normalized MIME type
    let mimeType = file.type;
    if (!mimeType || !ALLOWED_VIDEO_MIME_TYPES.includes(mimeType)) {
      if (ext === "mov") {
        mimeType = "video/quicktime";
      } else if (ext === "webm") {
        mimeType = "video/webm";
      } else {
        mimeType = "video/mp4";
      }
    }

    // 4. Generate unique file name to prevent accidental overwrites
    const timestamp = Date.now();
    const uniqueSuffix =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).substring(2, 10);
    const sanitizedBaseName =
      file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 40) || "reel";
    const uniqueFileName = `${timestamp}_${uniqueSuffix}_${sanitizedBaseName}.${ext}`;

    // 5. Build storage folder path: {authenticated-user-id}/{unique-file-name}
    const filePath = `${userId}/${uniqueFileName}`;

    // 6. Upload file to private storage bucket
    let uploadData;
    try {
      const uploadRes = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          contentType: mimeType,
          upsert: false,
          cacheControl: "3600",
        });

      if (uploadRes.error) {
        throw new Error(
          `Storage upload failed: ${uploadRes.error.message || "Failed to upload file to storage."}`
        );
      }
      uploadData = uploadRes.data;
    } catch (uploadErr: any) {
      if (uploadErr.message?.includes("Failed to fetch") || uploadErr.name === "TypeError") {
        throw new Error(
          "Network connection failed during file upload. Please check your internet connection and try again."
        );
      }
      throw uploadErr;
    }

    // 7. Insert record into public.content_analyses table
    const safeDuration =
      typeof durationSeconds === "number" &&
      !isNaN(durationSeconds) &&
      durationSeconds > 0
        ? Math.round(durationSeconds * 10) / 10
        : null;

    const { data: record, error: insertError } = await supabase
      .from(TABLE_CONTENT_ANALYSES)
      .insert({
        user_id: userId,
        file_path: filePath,
        file_name: file.name,
        mime_type: mimeType,
        file_size_bytes: file.size,
        duration_seconds: safeDuration,
        status: "uploaded",
      })
      .select()
      .single();

    // 8. Error handling & rollback cleanup if database insert fails
    if (insertError || !record) {
      let cleanupFailed = false;
      let cleanupDetail = "";
      try {
        const { error: removeError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([filePath]);
        if (removeError) {
          cleanupFailed = true;
          cleanupDetail = ` (Cleanup notice: unable to delete orphaned storage file: ${removeError.message})`;
        } else {
          cleanupDetail = " (Orphaned storage file was removed successfully)";
        }
      } catch (cleanupEx: any) {
        cleanupFailed = true;
        cleanupDetail = ` (Cleanup notice: storage cleanup failed: ${cleanupEx?.message || cleanupEx})`;
      }

      const originalError = insertError?.message || "Failed to create database record.";
      throw new Error(
        `Database record creation failed: ${originalError}${cleanupDetail}`
      );
    }

    return { record: record as ContentAnalysisRecord };
  }

  private normalizeVisualAnalysis(raw: unknown): VisualBackendResult | null {
    if (!raw) return null;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? (parsed as VisualBackendResult) : null;
      } catch {
        return null;
      }
    }
    if (typeof raw === "object") {
      return raw as VisualBackendResult;
    }
    return null;
  }

  private normalizeTextExtraction(raw: unknown): TextExtractionBackendResult | null {
    if (!raw) return null;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object"
          ? (parsed as TextExtractionBackendResult)
          : null;
      } catch {
        return null;
      }
    }
    if (typeof raw === "object") {
      return raw as TextExtractionBackendResult;
    }
    return null;
  }

  private normalizeOriginalScript(raw: unknown): OriginalScriptBackendResult | null {
    if (!raw) return null;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object"
          ? (parsed as OriginalScriptBackendResult)
          : null;
      } catch {
        return null;
      }
    }
    if (typeof raw === "object") {
      return raw as OriginalScriptBackendResult;
    }
    return null;
  }

  private normalizeRecord(row: any): ContentAnalysisRecord {
    return {
      ...(row as ContentAnalysisRecord),
      visual_analysis: this.normalizeVisualAnalysis(row?.visual_analysis),
      text_extraction: this.normalizeTextExtraction(row?.text_extraction),
      original_script: this.normalizeOriginalScript(row?.original_script),
    };
  }

  /**
   * Fetches real records from public.content_analyses for the authenticated user,
   * ordered newest first.
   */
  public async fetchUserAnalyses(): Promise<ContentAnalysisRecord[]> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return [];
      }

      const { data, error } = await supabase
        .from(TABLE_CONTENT_ANALYSES)
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "[ContentAnalysisService] Error fetching user content analyses:",
          error
        );
        return [];
      }

      return Array.isArray(data) ? data.map((row) => this.normalizeRecord(row)) : [];
    } catch (err) {
      console.error(
        "[ContentAnalysisService] Exception fetching user content analyses:",
        err
      );
      return [];
    }
  }

  /**
   * Deletes a record from public.content_analyses and removes the file from private Storage.
   */
  public async deleteUserAnalysis(
    id: string,
    filePath?: string
  ): Promise<{ error: Error | null }> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        throw new Error("You must be logged in to delete an analysis.");
      }

      // 1. Delete database record
      const { error: dbError } = await supabase
        .from(TABLE_CONTENT_ANALYSES)
        .delete()
        .eq("id", id)
        .eq("user_id", session.user.id);

      if (dbError) {
        throw new Error(`Failed to delete database record: ${dbError.message}`);
      }

      // 2. If storage filePath is available, delete from private bucket
      if (filePath) {
        try {
          await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
        } catch (storageErr) {
          console.warn(
            "[ContentAnalysisService] Storage deletion note:",
            storageErr
          );
        }
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  }

  /**
   * Generates a short-lived signed URL for private video playback/preview.
   * Does NOT make the bucket public.
   */
  public async getSignedPlaybackUrl(
    filePath: string,
    expiresInSeconds: number = 3600
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(filePath, expiresInSeconds);

      if (error || !data?.signedUrl) {
        return null;
      }
      return data.signedUrl;
    } catch {
      return null;
    }
  }

  /**
   * Invokes the deployed Supabase Edge Function 'analyze-audio'
   * for the given analysisId using the authenticated session.
   */
  public async analyzeAudio(analysisId: string): Promise<{
    success: boolean;
    analysisId?: string;
    audio_analysis?: AudioBackendResult;
    error?: string;
  }> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return {
          success: false,
          error: "Authentication required: Please sign in to analyze Reel audio.",
        };
      }

      const { data, error } = await supabase.functions.invoke("analyze-audio", {
        body: {
          analysisId,
        },
      });

      if (error) {
        let msg = error.message;
        if ((error as any).context && typeof (error as any).context?.json === "function") {
          try {
            const body = await (error as any).context.json();
            if (body?.error) {
              msg = body.error;
            }
          } catch {}
        }
        return {
          success: false,
          error: msg || "Audio analysis invocation failed.",
        };
      }

      if (data && data.success === false) {
        return {
          success: false,
          error: data.error || "Audio analysis returned an error.",
        };
      }

      return {
        success: true,
        analysisId: data?.analysisId || analysisId,
        audio_analysis: data?.audio_analysis,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to invoke analyze-audio function.",
      };
    }
  }

  /**
   * Downloads original uploaded Reel video Blob from private storage (reel-uploads).
   */
  public async downloadReelVideo(filePath: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(filePath);

    if (error || !data) {
      throw new Error(
        `Failed to download uploaded Reel video: ${error?.message || "File not found"}`
      );
    }

    return data;
  }

  /**
   * Extracts up to 3 representative JPEG frames from video blob
   * at approximately 10%, 50%, and 90% of duration.
   * Resizes proportionally so longest dimension <= 960px.
   * Encodes as JPEG ~0.72 quality (<= 2 MB).
   * Releases all temporary object URLs and video/canvas resources.
   */
  public async extractRepresentativeFrames(
    videoBlob: Blob,
    fallbackDurationSeconds?: number | null
  ): Promise<Array<{ blob: Blob; timestamp_seconds: number }>> {
    if (!videoBlob || videoBlob.size === 0) {
      throw new Error("Downloaded Reel video file is empty or unreadable.");
    }

    const objectUrl = URL.createObjectURL(videoBlob);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    try {
      // 1. Wait for video metadata and first decodable frame (loadeddata) with 25s timeout
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          cleanupListeners();
          reject(new Error("Timed out loading Reel video metadata for frame extraction."));
        }, 25000);

        const onReady = () => {
          if (video.readyState >= 2 || video.videoWidth > 0) {
            cleanupListeners();
            clearTimeout(timer);
            resolve();
          }
        };

        const onMetadataOnly = () => {
          // If browser already has data, resolve; otherwise wait briefly for loadeddata
          if (video.readyState >= 2) {
            onReady();
          }
        };

        const onError = () => {
          cleanupListeners();
          clearTimeout(timer);
          reject(new Error("Unable to decode Reel video bitstream in browser for frame extraction."));
        };

        const cleanupListeners = () => {
          video.removeEventListener("loadedmetadata", onMetadataOnly);
          video.removeEventListener("loadeddata", onReady);
          video.removeEventListener("canplay", onReady);
          video.removeEventListener("error", onError);
        };

        video.addEventListener("loadedmetadata", onMetadataOnly);
        video.addEventListener("loadeddata", onReady);
        video.addEventListener("canplay", onReady);
        video.addEventListener("error", onError);
        video.src = objectUrl;
        video.load();
      });

      // Resolve WebM Infinity duration quirk if needed
      let rawDuration = video.duration;
      if (!Number.isFinite(rawDuration) || rawDuration <= 0) {
        await new Promise<void>((resolve) => {
          const fallbackTimer = setTimeout(() => {
            video.removeEventListener("timeupdate", onTimeUpdate);
            resolve();
          }, 2500);
          const onTimeUpdate = () => {
            video.removeEventListener("timeupdate", onTimeUpdate);
            clearTimeout(fallbackTimer);
            resolve();
          };
          video.addEventListener("timeupdate", onTimeUpdate);
          try {
            video.currentTime = 1e101;
          } catch {
            clearTimeout(fallbackTimer);
            resolve();
          }
        });
        rawDuration = video.duration;
      }

      const safeDuration =
        Number.isFinite(rawDuration) && rawDuration > 0
          ? rawDuration
          : fallbackDurationSeconds && Number.isFinite(fallbackDurationSeconds) && fallbackDurationSeconds > 0
          ? fallbackDurationSeconds
          : 0;

      if (safeDuration <= 0) {
        throw new Error("Could not determine video duration for representative frame extraction.");
      }

      // 2. Select 3 representative timestamps at approximately 10%, 50%, 90%
      const candidatePercents = [0.1, 0.5, 0.9];
      const targetTimestamps: number[] = [];

      for (const pct of candidatePercents) {
        let t = Number((safeDuration * pct).toFixed(2));
        const minBound = safeDuration > 0.2 ? 0.05 : 0;
        const maxBound = safeDuration > 0.2 ? safeDuration - 0.05 : Math.max(0, safeDuration - 0.01);
        t = Math.max(minBound, Math.min(t, maxBound));

        // Avoid exact duplicate seeks on ultra-short videos (< 0.1s)
        const isDuplicate = targetTimestamps.some(
          (existing) => Math.abs(existing - t) < 0.02
        );
        if (!isDuplicate) {
          targetTimestamps.push(t);
        }
      }

      if (targetTimestamps.length === 0) {
        targetTimestamps.push(0);
      }

      const seekToTimestamp = async (targetTime: number): Promise<void> => {
        if (Math.abs(video.currentTime - targetTime) < 0.005 && video.readyState >= 2) {
          return;
        }

        await new Promise<void>((resolve, reject) => {
          const seekTimer = setTimeout(() => {
            cleanupSeek();
            reject(
              new Error(
                `Timed out seeking Reel video to ${targetTime}s for frame capture.`
              )
            );
          }, 12000);

          const onSeeked = () => {
            cleanupSeek();
            clearTimeout(seekTimer);
            resolve();
          };

          const onSeekError = () => {
            cleanupSeek();
            clearTimeout(seekTimer);
            reject(
              new Error(
                `Browser video seek failed at ${targetTime}s during frame capture.`
              )
            );
          };

          const cleanupSeek = () => {
            video.removeEventListener("seeked", onSeeked);
            video.removeEventListener("error", onSeekError);
          };

          video.addEventListener("seeked", onSeeked);
          video.addEventListener("error", onSeekError);
          video.currentTime = targetTime;
        });
      };

      const extracted: Array<{ blob: Blob; timestamp_seconds: number }> = [];

      // 3. Seek & capture each frame onto canvas
      for (const desiredTimestamp of targetTimestamps) {
        let actualSeekTarget = desiredTimestamp;

        try {
          await seekToTimestamp(actualSeekTarget);
        } catch (seekErr) {
          // Graceful recovery for videos with inaccurate tail duration or keyframe issues
          const fallbackOffset = Math.max(0, Number((actualSeekTarget - 0.25).toFixed(2)));
          if (fallbackOffset !== actualSeekTarget) {
            actualSeekTarget = fallbackOffset;
            await seekToTimestamp(actualSeekTarget);
          } else {
            throw seekErr;
          }
        }

        // Allow one animation frame for decoded frame presentation
        await new Promise<void>((resolve) => {
          if (typeof requestAnimationFrame === "function") {
            requestAnimationFrame(() => resolve());
          } else {
            setTimeout(resolve, 25);
          }
        });

        const origW = video.videoWidth;
        const origH = video.videoHeight;

        if (!origW || !origH) {
          throw new Error(
            `Video frame dimensions unavailable at ${actualSeekTarget}s.`
          );
        }

        // Resize proportionally so longest dimension <= 960px
        const maxDim = 960;
        let targetW = origW;
        let targetH = origH;

        if (origW > maxDim || origH > maxDim) {
          if (origW >= origH) {
            targetW = maxDim;
            targetH = Math.max(1, Math.round((origH * maxDim) / origW));
          } else {
            targetH = maxDim;
            targetW = Math.max(1, Math.round((origW * maxDim) / origH));
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;

        try {
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("Canvas 2D context initialization failed.");
          }
          ctx.drawImage(video, 0, 0, targetW, targetH);

          // Encode as JPEG quality ~0.72, reducing if > 2MB
          let quality = 0.72;
          let frameBlob = await new Promise<Blob | null>((res) =>
            canvas.toBlob(res, "image/jpeg", quality)
          );

          while (
            frameBlob &&
            frameBlob.size > 2 * 1024 * 1024 &&
            quality > 0.3
          ) {
            quality = Number((quality - 0.15).toFixed(2));
            frameBlob = await new Promise<Blob | null>((res) =>
              canvas.toBlob(res, "image/jpeg", quality)
            );
          }

          if (!frameBlob || frameBlob.size === 0) {
            throw new Error(
              `Failed to encode video frame at ${actualSeekTarget}s as JPEG.`
            );
          }

          const capturedTimestamp = Number(
            (video.currentTime > 0 ? video.currentTime : actualSeekTarget).toFixed(2)
          );

          extracted.push({
            blob: frameBlob,
            timestamp_seconds: capturedTimestamp,
          });
        } finally {
          // Release canvas memory immediately
          canvas.width = 0;
          canvas.height = 0;
        }
      }

      if (extracted.length === 0) {
        throw new Error("No representative video frames could be extracted from this Reel.");
      }

      return extracted;
    } finally {
      // 4. Release all temporary object URLs and video resources
      URL.revokeObjectURL(objectUrl);
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  }

  /**
   * Computes global mean RGB difference and localized 4x4 spatial-grid peak difference
   * between two downscaled RGBA frame signatures (0..1 scale).
   * Using both global and regional differences catches full scene cuts, outfit/background
   * shifts, camera-framing changes, and localized on-screen text changes.
   */
  private computeAdaptiveFrameDiff(
    a: Uint8ClampedArray,
    b: Uint8ClampedArray,
    gridDimension = 64
  ): { meanDiff: number; maxRegionDiff: number; combinedScore: number } {
    const len = Math.min(a.length, b.length);
    if (len === 0 || gridDimension <= 0) {
      return { meanDiff: 1, maxRegionDiff: 1, combinedScore: 1 };
    }

    const cellsPerAxis = 4;
    const cellSize = Math.max(1, Math.floor(gridDimension / cellsPerAxis));
    const cellSums = new Float64Array(cellsPerAxis * cellsPerAxis);
    const cellCounts = new Uint32Array(cellsPerAxis * cellsPerAxis);

    let totalDiff = 0;
    let pixelCount = 0;
    const totalPixels = Math.min(gridDimension * gridDimension, Math.floor(len / 4));

    for (let p = 0; p < totalPixels; p++) {
      const idx = p * 4;
      const diff =
        (Math.abs(a[idx] - b[idx]) +
          Math.abs(a[idx + 1] - b[idx + 1]) +
          Math.abs(a[idx + 2] - b[idx + 2])) /
        (3 * 255);

      totalDiff += diff;
      pixelCount++;

      const x = p % gridDimension;
      const y = Math.floor(p / gridDimension);
      const cx = Math.min(cellsPerAxis - 1, Math.floor(x / cellSize));
      const cy = Math.min(cellsPerAxis - 1, Math.floor(y / cellSize));
      const cellIdx = cy * cellsPerAxis + cx;
      cellSums[cellIdx] += diff;
      cellCounts[cellIdx]++;
    }

    const meanDiff = pixelCount > 0 ? totalDiff / pixelCount : 1;
    let maxRegionDiff = 0;
    for (let c = 0; c < cellSums.length; c++) {
      if (cellCounts[c] > 0) {
        const regionMean = cellSums[c] / cellCounts[c];
        if (regionMean > maxRegionDiff) {
          maxRegionDiff = regionMean;
        }
      }
    }

    const combinedScore = Math.max(meanDiff, maxRegionDiff * 0.65);
    return { meanDiff, maxRegionDiff, combinedScore };
  }

  /**
   * Computes average pixel brightness (0..255) for a small RGBA signature buffer.
   */
  private computeFrameBrightness(a: Uint8ClampedArray): number {
    if (a.length === 0) return 128;
    let total = 0;
    let pixelCount = 0;
    for (let i = 0; i < a.length; i += 4) {
      total += 0.299 * a[i] + 0.587 * a[i + 1] + 0.114 * a[i + 2];
      pixelCount++;
    }
    return pixelCount > 0 ? total / pixelCount : 128;
  }

  /**
   * Performs adaptive, scene-aware frame sampling across the uploaded Reel using
   * progressive HTML video seeking and canvas capture.
   *
   * - Uses a time-based baseline to cover the entire duration.
   * - Compares consecutive 64x64 RGBA signatures (global + 4x4 grid diffs) to detect
   *   scene changes, jump cuts, outfit/background/framing changes, and text overlay changes.
   * - Refines sampling around detected visual changes and suppresses near-duplicate frames.
   * - Produces a variable number of frames up to a 30-frame safety ceiling; if reached,
   *   prioritizes the most visually distinct moments and returns an explicit warning.
   * - Encodes each selected frame as JPEG (<= 960px longest side, ~0.72 quality, < 2 MB).
   */
  public async extractVisualAnalysisFrames(
    videoBlob: Blob,
    fallbackDurationSeconds?: number | null,
    options?: {
      onProgress?: (stage: "detecting" | "selecting", detail?: string) => void;
    }
  ): Promise<{
    frames: Array<{ blob: Blob; timestamp_seconds: number }>;
    samplingLimitReached: boolean;
    totalCandidateChanges: number;
    scannedSamples: number;
    warning: string | null;
  }> {
    if (!videoBlob || videoBlob.size === 0) {
      throw new Error("Downloaded Reel video file is empty or unreadable.");
    }

    const MAX_VISUAL_FRAMES = 30;
    const SIG_DIM = 64;

    const objectUrl = URL.createObjectURL(videoBlob);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    const sigCanvas = document.createElement("canvas");
    sigCanvas.width = SIG_DIM;
    sigCanvas.height = SIG_DIM;

    const encodeCanvas = document.createElement("canvas");

    try {
      // 1. Wait for video metadata and first decodable frame with 25s timeout
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          cleanupListeners();
          reject(new Error("Timed out loading Reel video metadata for visual frame extraction."));
        }, 25000);

        const onReady = () => {
          if (video.readyState >= 2 || video.videoWidth > 0) {
            cleanupListeners();
            clearTimeout(timer);
            resolve();
          }
        };

        const onMetadataOnly = () => {
          if (video.readyState >= 2) {
            onReady();
          }
        };

        const onError = () => {
          cleanupListeners();
          clearTimeout(timer);
          reject(new Error("Unable to decode Reel video bitstream in browser for frame extraction."));
        };

        const cleanupListeners = () => {
          video.removeEventListener("loadedmetadata", onMetadataOnly);
          video.removeEventListener("loadeddata", onReady);
          video.removeEventListener("canplay", onReady);
          video.removeEventListener("error", onError);
        };

        video.addEventListener("loadedmetadata", onMetadataOnly);
        video.addEventListener("loadeddata", onReady);
        video.addEventListener("canplay", onReady);
        video.addEventListener("error", onError);
        video.src = objectUrl;
        video.load();
      });

      // Resolve WebM Infinity duration quirk if needed
      let rawDuration = video.duration;
      if (!Number.isFinite(rawDuration) || rawDuration <= 0) {
        await new Promise<void>((resolve) => {
          const fallbackTimer = setTimeout(() => {
            video.removeEventListener("timeupdate", onTimeUpdate);
            resolve();
          }, 2500);
          const onTimeUpdate = () => {
            video.removeEventListener("timeupdate", onTimeUpdate);
            clearTimeout(fallbackTimer);
            resolve();
          };
          video.addEventListener("timeupdate", onTimeUpdate);
          try {
            video.currentTime = 1e101;
          } catch {
            clearTimeout(fallbackTimer);
            resolve();
          }
        });
        rawDuration = video.duration;
      }

      const safeDuration =
        Number.isFinite(rawDuration) && rawDuration > 0
          ? rawDuration
          : fallbackDurationSeconds &&
            Number.isFinite(fallbackDurationSeconds) &&
            fallbackDurationSeconds > 0
          ? fallbackDurationSeconds
          : 0;

      if (safeDuration <= 0) {
        throw new Error("Could not determine video duration for visual frame extraction.");
      }

      const seekToTimestamp = async (targetTime: number): Promise<void> => {
        if (Math.abs(video.currentTime - targetTime) < 0.005 && video.readyState >= 2) {
          return;
        }

        await new Promise<void>((resolve, reject) => {
          const seekTimer = setTimeout(() => {
            cleanupSeek();
            reject(
              new Error(`Timed out seeking Reel video to ${targetTime}s during frame scan.`)
            );
          }, 12000);

          const onSeeked = () => {
            cleanupSeek();
            clearTimeout(seekTimer);
            resolve();
          };

          const onSeekError = () => {
            cleanupSeek();
            clearTimeout(seekTimer);
            reject(
              new Error(`Browser video seek failed at ${targetTime}s during frame scan.`)
            );
          };

          const cleanupSeek = () => {
            video.removeEventListener("seeked", onSeeked);
            video.removeEventListener("error", onSeekError);
          };

          video.addEventListener("seeked", onSeeked);
          video.addEventListener("error", onSeekError);
          video.currentTime = targetTime;
        });
      };

      const waitFramePaint = () =>
        new Promise<void>((resolve) => {
          if (typeof requestAnimationFrame === "function") {
            requestAnimationFrame(() => resolve());
          } else {
            setTimeout(resolve, 20);
          }
        });

      const captureSignatureAt = async (
        desiredTimestamp: number
      ): Promise<{
        timestamp_seconds: number;
        signature: Uint8ClampedArray;
        brightness: number;
      } | null> => {
        let target = desiredTimestamp;
        try {
          await seekToTimestamp(target);
        } catch {
          const fallbackOffset = Math.max(0, Number((target - 0.18).toFixed(2)));
          if (fallbackOffset !== target) {
            target = fallbackOffset;
            await seekToTimestamp(target);
          } else {
            return null;
          }
        }

        await waitFramePaint();
        if (!video.videoWidth || !video.videoHeight) return null;

        const sigCtx = sigCanvas.getContext("2d", { willReadFrequently: true });
        if (!sigCtx) return null;
        sigCtx.drawImage(video, 0, 0, SIG_DIM, SIG_DIM);
        const signature = new Uint8ClampedArray(sigCtx.getImageData(0, 0, SIG_DIM, SIG_DIM).data);
        const brightness = this.computeFrameBrightness(signature);

        const rawCaptured = video.currentTime > 0 ? video.currentTime : target;
        const timestamp_seconds = Number(
          Math.max(0, Math.min(rawCaptured, safeDuration)).toFixed(2)
        );

        return {
          timestamp_seconds,
          signature,
          brightness,
        };
      };

      const encodeJpegAt = async (
        desiredTimestamp: number
      ): Promise<{ blob: Blob; timestamp_seconds: number } | null> => {
        await seekToTimestamp(desiredTimestamp);
        await waitFramePaint();

        const origW = video.videoWidth;
        const origH = video.videoHeight;
        if (!origW || !origH) return null;

        // Resize proportionally so longest dimension <= 960px
        const maxDim = 960;
        let targetW = origW;
        let targetH = origH;
        if (origW > maxDim || origH > maxDim) {
          if (origW >= origH) {
            targetW = maxDim;
            targetH = Math.max(1, Math.round((origH * maxDim) / origW));
          } else {
            targetH = maxDim;
            targetW = Math.max(1, Math.round((origW * maxDim) / origH));
          }
        }

        encodeCanvas.width = targetW;
        encodeCanvas.height = targetH;

        const ctx = encodeCanvas.getContext("2d");
        if (!ctx) return null;
        ctx.drawImage(video, 0, 0, targetW, targetH);

        let quality = 0.72;
        let frameBlob = await new Promise<Blob | null>((res) =>
          encodeCanvas.toBlob(res, "image/jpeg", quality)
        );

        // Ensure each JPEG stays strictly below 2 MB
        while (frameBlob && frameBlob.size >= 2 * 1024 * 1024 && quality > 0.25) {
          quality = Number((quality - 0.12).toFixed(2));
          frameBlob = await new Promise<Blob | null>((res) =>
            encodeCanvas.toBlob(res, "image/jpeg", quality)
          );
        }

        if (!frameBlob || frameBlob.size === 0 || frameBlob.size >= 2 * 1024 * 1024) {
          return null;
        }

        const rawCaptured = video.currentTime > 0 ? video.currentTime : desiredTimestamp;
        const timestamp_seconds = Number(
          Math.max(0, Math.min(rawCaptured, safeDuration)).toFixed(2)
        );

        return {
          blob: frameBlob,
          timestamp_seconds,
        };
      };

      // 2. Progressive time-based baseline scan across the full video duration
      options?.onProgress?.("detecting", "Detecting visual changes across your Reel...");

      type SamplePoint = {
        timestamp_seconds: number;
        signature: Uint8ClampedArray;
        brightness: number;
      };

      const scanTimestamps: number[] = [];
      if (safeDuration <= 0.25) {
        scanTimestamps.push(Number((safeDuration * 0.5).toFixed(2)));
      } else {
        const minBound =
          safeDuration < 1.5
            ? 0.03
            : Math.max(0.05, Number((safeDuration * 0.02).toFixed(2)));
        const maxBound = Math.max(
          minBound,
          safeDuration < 1.5
            ? safeDuration - 0.03
            : Math.min(safeDuration - 0.05, Number((safeDuration * 0.98).toFixed(2)))
        );
        const span = Math.max(0.1, maxBound - minBound);
        const targetBaselineScans = Math.min(54, Math.max(4, Math.round(safeDuration / 0.55)));
        const step = span / Math.max(1, targetBaselineScans - 1);

        for (let i = 0; i < targetBaselineScans; i++) {
          const t = Number(Math.min(maxBound, minBound + i * step).toFixed(2));
          if (scanTimestamps.length === 0 || t > scanTimestamps[scanTimestamps.length - 1] + 0.04) {
            scanTimestamps.push(t);
          }
        }
      }

      const rawSamples: SamplePoint[] = [];
      let refinementProbesUsed = 0;
      const MAX_REFINEMENT_PROBES = 18;

      for (let i = 0; i < scanTimestamps.length; i++) {
        const t = scanTimestamps[i];
        try {
          const current = await captureSignatureAt(t);
          if (!current) continue;

          // When a strong visual change occurs across a wide interval, extract a midpoint probe
          // around the change to avoid missing intermediate cuts or blurred transitions
          const prev = rawSamples.length > 0 ? rawSamples[rawSamples.length - 1] : null;
          if (
            prev &&
            refinementProbesUsed < MAX_REFINEMENT_PROBES &&
            current.timestamp_seconds - prev.timestamp_seconds >= 0.45
          ) {
            const pairDiff = this.computeAdaptiveFrameDiff(
              prev.signature,
              current.signature,
              SIG_DIM
            );
            if (pairDiff.meanDiff >= 0.05 || pairDiff.maxRegionDiff >= 0.1) {
              const midTarget = Number(
                ((prev.timestamp_seconds + current.timestamp_seconds) / 2).toFixed(2)
              );
              if (
                midTarget > prev.timestamp_seconds + 0.08 &&
                midTarget < current.timestamp_seconds - 0.08
              ) {
                refinementProbesUsed++;
                try {
                  const midSample = await captureSignatureAt(midTarget);
                  if (
                    midSample &&
                    midSample.timestamp_seconds > prev.timestamp_seconds + 0.03 &&
                    midSample.timestamp_seconds < current.timestamp_seconds - 0.03
                  ) {
                    rawSamples.push(midSample);
                  }
                } catch {
                  // Continue scan if refinement seek fails
                }
              }
            }
          }

          if (
            rawSamples.length === 0 ||
            current.timestamp_seconds > rawSamples[rawSamples.length - 1].timestamp_seconds + 0.03
          ) {
            rawSamples.push(current);
          }
        } catch (probeErr) {
          console.warn(
            `[ContentAnalysisService] Skipping visual scan probe at ${t}s:`,
            probeErr
          );
        }
      }

      rawSamples.sort((a, b) => a.timestamp_seconds - b.timestamp_seconds);

      // 3. Adaptive selection: scene/text/framing changes + temporal baseline + deduplication
      options?.onProgress?.("selecting", "Selecting representative frames...");

      type CandidateFrame = SamplePoint & {
        distinctionScore: number;
        isOpeningAnchor?: boolean;
      };

      const candidates: CandidateFrame[] = [];
      const DUPLICATE_MEAN_THRESHOLD = 0.013;
      const DUPLICATE_REGION_THRESHOLD = 0.042;
      const CHANGE_MEAN_THRESHOLD = 0.042;
      const CHANGE_REGION_THRESHOLD = 0.092;
      const baselineAnchorInterval = Math.max(2.2, Math.min(5.0, safeDuration / 5));

      if (rawSamples.length > 0) {
        // Pick an initial non-black opening anchor if the very first sample is a dark fade-in
        let startIdx = 0;
        if (rawSamples[0].brightness < 14) {
          const firstClearIdx = rawSamples.findIndex(
            (s, idx) => idx > 0 && idx <= 3 && s.brightness >= 18
          );
          if (firstClearIdx > 0) {
            startIdx = firstClearIdx;
          }
        }

        candidates.push({
          ...rawSamples[startIdx],
          distinctionScore: 1,
          isOpeningAnchor: true,
        });

        for (let i = startIdx + 1; i < rawSamples.length; i++) {
          const curr = rawSamples[i];
          const lastSelected = candidates[candidates.length - 1];

          const diffFromLast = this.computeAdaptiveFrameDiff(
            lastSelected.signature,
            curr.signature,
            SIG_DIM
          );

          // Skip near-duplicate frames compared to the immediately preceding selected frame
          if (
            diffFromLast.meanDiff < DUPLICATE_MEAN_THRESHOLD &&
            diffFromLast.maxRegionDiff < DUPLICATE_REGION_THRESHOLD
          ) {
            continue;
          }

          const isSignificantChange =
            diffFromLast.meanDiff >= CHANGE_MEAN_THRESHOLD ||
            diffFromLast.maxRegionDiff >= CHANGE_REGION_THRESHOLD;

          const elapsedSinceLast = curr.timestamp_seconds - lastSelected.timestamp_seconds;
          const isBaselineAnchorDue =
            elapsedSinceLast >= baselineAnchorInterval ||
            (i === rawSamples.length - 1 &&
              elapsedSinceLast >= Math.max(1.5, baselineAnchorInterval * 0.7));

          if (!isSignificantChange && !isBaselineAnchorDue) {
            continue;
          }

          // Also avoid repeating an already-captured static shot unless it marks a return
          // after a meaningfully long gap or is visually distinct from recent frames
          let minRecentMean = 1;
          let minRecentRegion = 1;
          const recentWindow = candidates.slice(-3);
          for (const existing of recentWindow) {
            const d = this.computeAdaptiveFrameDiff(existing.signature, curr.signature, SIG_DIM);
            if (d.meanDiff < minRecentMean) minRecentMean = d.meanDiff;
            if (d.maxRegionDiff < minRecentRegion) minRecentRegion = d.maxRegionDiff;
          }

          if (
            !isSignificantChange &&
            minRecentMean < DUPLICATE_MEAN_THRESHOLD * 1.25 &&
            minRecentRegion < DUPLICATE_REGION_THRESHOLD * 1.25
          ) {
            continue;
          }

          candidates.push({
            ...curr,
            distinctionScore: isSignificantChange
              ? diffFromLast.combinedScore
              : diffFromLast.combinedScore * 0.75,
          });
        }
      }

      // 4. Enforce 30-frame safety ceiling by prioritizing the most visually distinct moments
      const totalCandidateChanges = candidates.length;
      const samplingLimitReached = totalCandidateChanges > MAX_VISUAL_FRAMES;
      let selectedCandidates = candidates;
      let warning: string | null = null;

      if (samplingLimitReached) {
        const opening = candidates[0];
        const remainingRanked = candidates
          .slice(1)
          .sort((a, b) => b.distinctionScore - a.distinctionScore)
          .slice(0, MAX_VISUAL_FRAMES - 1);

        selectedCandidates = [opening, ...remainingRanked].sort(
          (a, b) => a.timestamp_seconds - b.timestamp_seconds
        );

        warning =
          "Reached the 30-frame processing limit; prioritized the 30 most visually distinct moments across the Reel. Some rapid cuts or intermediate frames may not be sampled.";
      }

      // 5. Encode selected chronological frames as <= 960px JPEGs (< 2 MB)
      const encodedFrames: Array<{ blob: Blob; timestamp_seconds: number }> = [];
      for (let i = 0; i < selectedCandidates.length; i++) {
        const cand = selectedCandidates[i];
        try {
          const encoded = await encodeJpegAt(cand.timestamp_seconds);
          if (encoded) {
            encodedFrames.push(encoded);
          }
        } catch (encodeErr) {
          console.warn(
            `[ContentAnalysisService] Skipping JPEG encode at ${cand.timestamp_seconds}s:`,
            encodeErr
          );
        }
      }

      // Guarantee at least 1 valid frame on edge-case videos if adaptive pass yielded none
      if (encodedFrames.length === 0) {
        try {
          const midTarget = Number((safeDuration * 0.5).toFixed(2));
          const fallback = await encodeJpegAt(midTarget);
          if (fallback) {
            encodedFrames.push(fallback);
          }
        } catch {
          // Handled below
        }
      }

      if (encodedFrames.length === 0) {
        throw new Error(
          "No valid representative video frames could be extracted from your Reel."
        );
      }

      const finalFrames = encodedFrames
        .sort((a, b) => a.timestamp_seconds - b.timestamp_seconds)
        .slice(0, MAX_VISUAL_FRAMES);

      return {
        frames: finalFrames,
        samplingLimitReached,
        totalCandidateChanges,
        scannedSamples: rawSamples.length,
        warning,
      };
    } finally {
      sigCanvas.width = 0;
      sigCanvas.height = 0;
      encodeCanvas.width = 0;
      encodeCanvas.height = 0;
      URL.revokeObjectURL(objectUrl);
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  }

  /**
   * Cleans up uploaded visual analysis frame files from private storage if workflow fails
   * before the backend accepts the request.
   */
  public async cleanupUploadedFrames(paths: string[]): Promise<void> {
    if (!Array.isArray(paths) || paths.length === 0) return;
    try {
      await supabase.storage.from(VISUAL_FRAMES_BUCKET).remove(paths);
    } catch (err) {
      console.warn("[ContentAnalysisService] Visual frame cleanup warning:", err);
    }
  }

  /**
   * Uploads adaptively selected JPEG frames (up to 30 safety ceiling) to private
   * visual-analysis-frames bucket using exact 1-indexed paths:
   * {userId}/{analysisId}/frame-{index}.jpg.
   * Continues with remaining valid frames if an individual frame fails, and throws if none succeed.
   */
  public async uploadAnalysisFrames(
    userId: string,
    analysisId: string,
    frames: Array<{ blob: Blob; timestamp_seconds: number }>
  ): Promise<FramePathItem[]> {
    if (!userId || !analysisId) {
      throw new Error("Authenticated user ID and analysis ID are required to upload visual frames.");
    }

    if (!Array.isArray(frames) || frames.length === 0) {
      throw new Error("No extracted frames available to upload.");
    }

    const framesToUpload = frames.slice(0, 30);
    const framePaths: FramePathItem[] = [];

    for (let i = 0; i < framesToUpload.length; i++) {
      const frame = framesToUpload[i];
      if (!frame?.blob || frame.blob.size === 0) {
        console.warn(`[ContentAnalysisService] Skipping empty extracted frame at index ${i + 1}.`);
        continue;
      }

      const frameIndex = framePaths.length + 1; // Sequential 1..30
      const storagePath = `${userId}/${analysisId}/frame-${frameIndex}.jpg`;

      const { data, error } = await supabase.storage
        .from(VISUAL_FRAMES_BUCKET)
        .upload(storagePath, frame.blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error || !data?.path) {
        console.warn(
          `[ContentAnalysisService] Failed to upload visual frame ${frameIndex}: ${
            error?.message || "Upload did not return a path"
          }`
        );
        continue;
      }

      framePaths.push({
        path: storagePath,
        timestamp_seconds: frame.timestamp_seconds,
      });
    }

    if (framePaths.length === 0) {
      throw new Error(
        "Failed to upload any representative visual frames to private storage. Visual analysis was not started."
      );
    }

    return framePaths;
  }

  /**
   * Invokes the deployed Supabase Edge Function 'analyze-visual'
   * for the given analysisId and validated framePaths manifest using the authenticated session.
   * Never invokes analyze-visual with an empty framePaths array.
   */
  public async analyzeVisual(
    analysisId: string,
    framePaths: FramePathItem[]
  ): Promise<{
    success: boolean;
    queued?: boolean;
    status?: VisualAnalysisStatus;
    analysisId?: string;
    visual_analysis?: VisualBackendResult;
    error?: string;
  }> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return {
          success: false,
          error: "Authentication required: Please sign in to analyze Reel visuals.",
        };
      }

      const validFrames = Array.isArray(framePaths)
        ? framePaths
            .slice(0, 30)
            .filter(
              (fp) =>
                Boolean(fp?.path) &&
                !fp.path.startsWith("data:") &&
                !fp.path.startsWith("blob:") &&
                !fp.path.startsWith("http") &&
                typeof fp.timestamp_seconds === "number" &&
                Number.isFinite(fp.timestamp_seconds) &&
                fp.timestamp_seconds >= 0
            )
            .map((fp) => ({
              path: fp.path,
              timestamp_seconds: fp.timestamp_seconds,
            }))
        : [];

      if (validFrames.length === 0) {
        return {
          success: false,
          error:
            "Representative video frames could not be prepared or uploaded. Visual analysis was not started so fallback remains intact. Please retry.",
        };
      }

      const { data, error } = await supabase.functions.invoke("analyze-visual", {
        body: {
          analysisId,
          framePaths: validFrames,
        },
      });

      if (error) {
        let msg = error.message;
        if ((error as any).context && typeof (error as any).context?.json === "function") {
          try {
            const body = await (error as any).context.json();
            if (body?.error) {
              msg = body.error;
            }
          } catch {}
        }
        return {
          success: false,
          error: msg || "Visual analysis invocation failed.",
        };
      }

      if (data && data.success === false) {
        return {
          success: false,
          error: data.error || "Visual analysis returned an error.",
        };
      }

      return {
        success: true,
        queued: Boolean(data?.queued),
        status: (data?.status as VisualAnalysisStatus) || (data?.queued ? "queued" : "processing"),
        analysisId: data?.analysisId || analysisId,
        visual_analysis: data?.visual_analysis,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to invoke analyze-visual function.",
      };
    }
  }

  /**
   * Polls the user's existing content_analyses record using Supabase.
   * Selects visual_analysis, visual_analysis_status, and visual_analysis_error,
   * filtered by current analysisId.
   */
  public async pollVisualStatus(analysisId: string): Promise<{
    visual_analysis: VisualBackendResult | null;
    visual_analysis_status: VisualAnalysisStatus | null;
    visual_analysis_error: string | null;
  } | null> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return null;
      }

      const { data, error } = await supabase
        .from(TABLE_CONTENT_ANALYSES)
        .select("visual_analysis, visual_analysis_status, visual_analysis_error")
        .eq("id", analysisId)
        .eq("user_id", session.user.id)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        visual_analysis: this.normalizeVisualAnalysis(data.visual_analysis),
        visual_analysis_status: (data.visual_analysis_status as VisualAnalysisStatus) || null,
        visual_analysis_error: (data.visual_analysis_error as string) || null,
      };
    } catch {
      return null;
    }
  }

  /**
   * Uploads extracted JPEG frames for On-Screen Text Extraction to private visual-analysis-frames bucket
   * using exact 1-indexed paths: {userId}/{analysisId}/frame-1.jpg, frame-2.jpg, frame-3.jpg.
   * Verifies every upload succeeds before returning framePaths manifest.
   */
  public async uploadTextExtractionFrames(
    userId: string,
    analysisId: string,
    frames: Array<{ blob: Blob; timestamp_seconds: number }>
  ): Promise<FramePathItem[]> {
    if (!userId || !analysisId) {
      throw new Error(
        "Authenticated user ID and analysis ID are required to upload text extraction frames."
      );
    }

    if (!Array.isArray(frames) || frames.length === 0) {
      throw new Error("No extracted frames available to upload for text extraction.");
    }

    const framePaths: FramePathItem[] = [];

    for (let i = 0; i < Math.min(frames.length, 3); i++) {
      const frame = frames[i];
      if (!frame?.blob || frame.blob.size === 0) {
        throw new Error(`Extracted frame ${i + 1} is empty and cannot be uploaded.`);
      }

      const storagePath = `${userId}/${analysisId}/frame-${i + 1}.jpg`;

      const { data, error } = await supabase.storage
        .from(VISUAL_FRAMES_BUCKET)
        .upload(storagePath, frame.blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error || !data?.path) {
        throw new Error(
          `Failed to upload text extraction frame ${i + 1} to private storage: ${
            error?.message || "Upload did not return a path"
          }`
        );
      }

      framePaths.push({
        path: storagePath,
        timestamp_seconds: frame.timestamp_seconds,
      });
    }

    if (framePaths.length === 0) {
      throw new Error("No text extraction frames were uploaded successfully.");
    }

    return framePaths;
  }

  /**
   * Invokes the deployed Supabase Edge Function 'analyze-text'
   * for the given analysisId and validated framePaths manifest using the authenticated session.
   * Never invokes analyze-text with an empty or fabricated framePaths array.
   */
  public async analyzeText(
    analysisId: string,
    framePaths: FramePathItem[]
  ): Promise<{
    success: boolean;
    queued?: boolean;
    status?: TextExtractionStatus;
    analysisId?: string;
    text_extraction?: TextExtractionBackendResult;
    error?: string;
  }> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return {
          success: false,
          error: "Authentication required: Please sign in to extract on-screen text.",
        };
      }

      if (
        !analysisId ||
        !Array.isArray(framePaths) ||
        framePaths.length === 0 ||
        framePaths.some(
          (fp) =>
            !fp?.path ||
            typeof fp.timestamp_seconds !== "number" ||
            !Number.isFinite(fp.timestamp_seconds)
        )
      ) {
        return {
          success: false,
          error:
            "Representative video frames could not be prepared or uploaded. Text extraction was not started. Please retry.",
        };
      }

      const { data, error } = await supabase.functions.invoke("analyze-text", {
        body: {
          analysisId,
          framePaths,
        },
      });

      if (error) {
        let msg = error.message;
        if ((error as any).context && typeof (error as any).context?.json === "function") {
          try {
            const body = await (error as any).context.json();
            if (body?.error) {
              msg = body.error;
            }
          } catch {}
        }
        return {
          success: false,
          error: msg || "Text extraction invocation failed.",
        };
      }

      if (data && data.success === false) {
        return {
          success: false,
          error: data.error || "Text extraction returned an error.",
        };
      }

      return {
        success: true,
        queued: Boolean(data?.queued),
        status: (data?.status as TextExtractionStatus) || (data?.queued ? "queued" : "processing"),
        analysisId: data?.analysisId || analysisId,
        text_extraction: this.normalizeTextExtraction(data?.text_extraction) ?? undefined,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to invoke analyze-text function.",
      };
    }
  }

  /**
   * Polls the user's existing content_analyses record for text extraction fields.
   */
  public async pollTextExtractionStatus(analysisId: string): Promise<{
    text_extraction: TextExtractionBackendResult | null;
    text_extraction_status: TextExtractionStatus | null;
    text_extraction_error: string | null;
    text_extraction_started_at: string | null;
    text_extraction_completed_at: string | null;
  } | null> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return null;
      }

      const { data, error } = await supabase
        .from(TABLE_CONTENT_ANALYSES)
        .select(
          "text_extraction, text_extraction_status, text_extraction_error, text_extraction_started_at, text_extraction_completed_at"
        )
        .eq("id", analysisId)
        .eq("user_id", session.user.id)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        text_extraction: this.normalizeTextExtraction(data.text_extraction),
        text_extraction_status: (data.text_extraction_status as TextExtractionStatus) || null,
        text_extraction_error: (data.text_extraction_error as string) || null,
        text_extraction_started_at: (data.text_extraction_started_at as string) || null,
        text_extraction_completed_at: (data.text_extraction_completed_at as string) || null,
      };
    } catch {
      return null;
    }
  }

  private extractSourceStatusesFromPayload(
    payload: any
  ): OriginalScriptSourceStatuses | undefined {
    if (!payload || typeof payload !== "object") return undefined;

    const nested =
      payload.source_statuses ||
      payload.sourceStatuses ||
      payload.statuses ||
      payload.sources ||
      null;

    const audio =
      nested?.audio ??
      nested?.audio_analysis ??
      nested?.audio_analysis_status ??
      payload.audio_analysis_status ??
      undefined;
    const visual =
      nested?.visual ??
      nested?.visual_analysis ??
      nested?.visual_analysis_status ??
      payload.visual_analysis_status ??
      undefined;
    const text =
      nested?.text ??
      nested?.text_extraction ??
      nested?.text_extraction_status ??
      payload.text_extraction_status ??
      undefined;

    if (audio === undefined && visual === undefined && text === undefined) {
      return undefined;
    }

    return {
      audio: audio ?? null,
      visual: visual ?? null,
      text: text ?? null,
    };
  }

  /**
   * Invokes the deployed Supabase Edge Function 'generate-original-script'
   * for the given existing analysisId using the authenticated session.
   */
  public async generateOriginalScript(analysisId: string): Promise<{
    success: boolean;
    status?: OriginalScriptStatus;
    code?: string;
    sourceStatuses?: OriginalScriptSourceStatuses;
    analysisId?: string;
    original_script?: OriginalScriptBackendResult;
    error?: string;
  }> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return {
          success: false,
          error:
            "Authentication required: Please sign in to generate the Original Reel Script.",
        };
      }

      if (!analysisId) {
        return {
          success: false,
          error: "A valid analysis record ID is required to generate the Original Reel Script.",
        };
      }

      const { data, error } = await supabase.functions.invoke(
        "generate-original-script",
        {
          body: { analysisId },
        }
      );

      if (error) {
        let msg = error.message;
        let code: string | undefined;
        let sourceStatuses: OriginalScriptSourceStatuses | undefined;

        if ((error as any).context && typeof (error as any).context?.json === "function") {
          try {
            const body = await (error as any).context.json();
            if (body) {
              code =
                body.code ||
                body.error_code ||
                (body.error === "SOURCE_ANALYSES_INCOMPLETE"
                  ? "SOURCE_ANALYSES_INCOMPLETE"
                  : undefined);
              if (body.error && typeof body.error === "string") {
                msg = body.error;
              } else if (body.message && typeof body.message === "string") {
                msg = body.message;
              }
              sourceStatuses = this.extractSourceStatusesFromPayload(body);
            }
          } catch {}
        }

        if (!code && typeof msg === "string" && msg.includes("SOURCE_ANALYSES_INCOMPLETE")) {
          code = "SOURCE_ANALYSES_INCOMPLETE";
        }

        return {
          success: false,
          code,
          sourceStatuses,
          error: msg || "Original Reel Script generation failed.",
        };
      }

      if (
        data &&
        (data.success === false ||
          data.code === "SOURCE_ANALYSES_INCOMPLETE" ||
          data.error_code === "SOURCE_ANALYSES_INCOMPLETE" ||
          data.error === "SOURCE_ANALYSES_INCOMPLETE")
      ) {
        const code =
          data.code ||
          data.error_code ||
          (data.error === "SOURCE_ANALYSES_INCOMPLETE"
            ? "SOURCE_ANALYSES_INCOMPLETE"
            : undefined);
        return {
          success: false,
          code,
          sourceStatuses: this.extractSourceStatusesFromPayload(data),
          error:
            data.message ||
            data.error ||
            "Source analyses must be completed before generating the Original Reel Script.",
        };
      }

      return {
        success: true,
        status:
          (data?.status as OriginalScriptStatus) ||
          (data?.original_script ? "completed" : "processing"),
        analysisId: data?.analysisId || analysisId,
        original_script:
          this.normalizeOriginalScript(data?.original_script) ?? undefined,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to invoke generate-original-script function.",
      };
    }
  }

  /**
   * Polls the user's existing content_analyses record for original script status and source statuses.
   */
  public async pollOriginalScriptStatus(analysisId: string): Promise<{
    original_script: OriginalScriptBackendResult | null;
    original_script_status: OriginalScriptStatus | null;
    original_script_error: string | null;
    original_script_started_at: string | null;
    original_script_completed_at: string | null;
    audio_analysis_status?: string | null;
    visual_analysis_status?: string | null;
    text_extraction_status?: string | null;
  } | null> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return null;
      }

      const { data, error } = await supabase
        .from(TABLE_CONTENT_ANALYSES)
        .select(
          "original_script, original_script_status, original_script_error, original_script_started_at, original_script_completed_at, audio_analysis_status, visual_analysis_status, text_extraction_status"
        )
        .eq("id", analysisId)
        .eq("user_id", session.user.id)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        original_script: this.normalizeOriginalScript(data.original_script),
        original_script_status:
          (data.original_script_status as OriginalScriptStatus) || null,
        original_script_error: (data.original_script_error as string) || null,
        original_script_started_at:
          (data.original_script_started_at as string) || null,
        original_script_completed_at:
          (data.original_script_completed_at as string) || null,
        audio_analysis_status: (data.audio_analysis_status as string) || null,
        visual_analysis_status: (data.visual_analysis_status as string) || null,
        text_extraction_status: (data.text_extraction_status as string) || null,
      };
    } catch {
      return null;
    }
  }

  /**
   * Fetches a single ContentAnalysisRecord by ID for the authenticated user.
   */
  public async fetchAnalysisById(
    id: string
  ): Promise<ContentAnalysisRecord | null> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return null;
      }

      const { data, error } = await supabase
        .from(TABLE_CONTENT_ANALYSES)
        .select("*")
        .eq("id", id)
        .eq("user_id", session.user.id)
        .single();

      if (error || !data) {
        return null;
      }

      return this.normalizeRecord(data);
    } catch (err) {
      console.error("[ContentAnalysisService] Error fetching record by id:", err);
      return null;
    }
  }

  /**
   * Maps a ContentAnalysisRecord database row into the UI's AnalysisHistoryItem format.
   */
  public mapRecordToHistoryItem(record: ContentAnalysisRecord): AnalysisHistoryItem {
    const result = record.analysis_result as ContentAnalysisResult | null;
    const rawTitle = record.file_name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const formattedTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
    const durationFormatted = record.duration_seconds
      ? this.formatDuration(record.duration_seconds)
      : "--:--";

    const dateObj = new Date(record.created_at);
    const dateFormatted = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Recently";

    return {
      id: record.id,
      videoTitle: result?.videoTitle || formattedTitle,
      videoFileName: record.file_name,
      thumbnailUrl:
        result?.thumbnailUrl ||
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      uploadedAt: dateFormatted,
      durationFormatted,
      status: record.status,
      sceneCount:
        record.visual_analysis?.scenes?.length ||
        result?.visualAnalysis?.totalScenes ||
        0,
      accuracyScore: result?.accuracyReport?.overallScore || 0,
      isDemo: false,
      filePath: record.file_path,
      fileSizeBytes: record.file_size_bytes,
      mimeType: record.mime_type,
      createdAt: record.created_at,
      audioAnalysis: record.audio_analysis || null,
      audioAnalysisStatus: record.audio_analysis_status || null,
      audioAnalysisError: record.audio_analysis_error || null,
      visualAnalysis: record.visual_analysis || null,
      visualAnalysisStatus: record.visual_analysis_status || null,
      visualAnalysisError: record.visual_analysis_error || null,
      textExtraction: record.text_extraction || null,
      textExtractionStatus: record.text_extraction_status || null,
      textExtractionError: record.text_extraction_error || null,
      originalScript: record.original_script || null,
      originalScriptStatus: record.original_script_status || null,
      originalScriptError: record.original_script_error || null,
    };
  }

  public getPresetReels() {
    return DEMO_PRESET_REELS;
  }

  public getLatestOrDemoAnalysis(): ContentAnalysisResult {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return DEMO_ANALYSIS_RESULT;
  }

  public saveCurrentAnalysis(analysis: ContentAnalysisResult): void {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(analysis));
    } catch {
      // Fallback
    }
  }


  /**
   * Generates a result for a custom uploaded video or preset.
   * If custom video file is provided, adopts its metadata (file name, size, duration).
   * Note: In frontend demo mode, clearly tags isDemoData: true while simulating realistic backend analysis.
   */
  public createAnalysisResultForFile(
    file: File | null,
    videoDurationSeconds: number,
    presetId?: string
  ): ContentAnalysisResult {
    if (presetId) {
      const found = DEMO_PRESET_REELS.find((p) => p.id === presetId);
      if (found) {
        return {
          ...found.result,
          id: `analysis-${Date.now()}`,
          analyzedAt: new Date().toISOString(),
        };
      }
    }

    if (!file) {
      return DEMO_ANALYSIS_RESULT;
    }

    // Adapt demo structure to match the user's specific uploaded file metadata
    const formattedDuration = this.formatDuration(videoDurationSeconds || 28.5);
    const titleWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const capitalizedTitle =
      titleWithoutExt.charAt(0).toUpperCase() + titleWithoutExt.slice(1);

    const adaptedResult: ContentAnalysisResult = {
      ...DEMO_ANALYSIS_RESULT,
      id: `analysis-${Date.now()}`,
      videoTitle: capitalizedTitle,
      videoFileName: file.name,
      analyzedAt: new Date().toISOString(),
      durationSeconds: videoDurationSeconds || 28.5,
      formattedDuration,
      status: "completed",
      isDemoData: true, // Transparent indicator that analysis is simulated in frontend preview
      overviewSummary: `Multimodal analysis generated for ${file.name}. Pacing is optimized for Instagram Reels with dynamic vocal cadence and rapid on-screen text synchronization.`,
      editingBreakdown: {
        ...DEMO_ANALYSIS_RESULT.editingBreakdown,
        technical: {
          ...DEMO_ANALYSIS_RESULT.editingBreakdown.technical,
          durationSeconds: videoDurationSeconds || 28.5,
          formattedDuration,
          fileSizeBytes: file.size,
          format: file.type || "video/mp4",
        },
      },
    };

    return adaptedResult;
  }

  public formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`;
  }

  public exportScriptTableToCSV(scriptTable: ScriptTableRow[], videoTitle: string): void {
    const headers = [
      "Time",
      "Original Voiceover / Audio",
      "Exact On-Screen Text",
      "Visual Direction",
    ];

    const rows = scriptTable.map((row) => [
      `"${row.timestamp}"`,
      `"${row.originalVoiceover.replace(/"/g, '""')}"`,
      `"${(row.exactOnScreenText || "No on-screen text detected.").replace(/"/g, '""')}"`,
      `"${(row.detailedVisualDirection || "No significant visual change detected").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const sanitizedTitle = videoTitle.toLowerCase().replace(/[^a-z0-9]/g, "_");
    link.setAttribute("download", `${sanitizedTitle}_reel_script_master.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public exportFullAnalysisJSON(analysis: ContentAnalysisResult): void {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    const sanitizedTitle = analysis.videoTitle.toLowerCase().replace(/[^a-z0-9]/g, "_");
    downloadAnchor.setAttribute("download", `${sanitizedTitle}_virulmuse_analysis.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  public formatTableAsMarkdown(scriptTable: ScriptTableRow[]): string {
    let md = "| Time | Original Voiceover / Audio | Exact On-Screen Text | Visual Direction |\n";
    md += "|---|---|---|---|\n";
    scriptTable.forEach((row) => {
      const vo = row.originalVoiceover.replace(/\|/g, "\\|");
      const text = (row.exactOnScreenText || "No on-screen text detected.").replace(/\|/g, "\\|");
      const visual = (row.detailedVisualDirection || "No significant visual change detected").replace(/\|/g, "\\|");
      md += `| ${row.timestamp} | ${vo} | ${text} | ${visual} |\n`;
    });
    return md;
  }

  public formatEditingTimelineAsMarkdown(timeline: EditingTimelineEvent[]): string {
    let md = "| Time | Editing Action | Observable Result |\n";
    md += "|---|---|---|\n";
    timeline.forEach((row) => {
      const action = row.editingAction.replace(/\|/g, "\\|");
      const result = row.observableResult.replace(/\|/g, "\\|");
      md += `| ${row.timestamp} | ${action} | ${result} |\n`;
    });
    return md;
  }

  public exportEditingTimelineToCSV(timeline: EditingTimelineEvent[], videoTitle: string): void {
    const headers = ["Time", "Editing Action", "Observable Result"];
    const rows = timeline.map((row) => [
      `"${row.timestamp}"`,
      `"${row.editingAction.replace(/"/g, '""')}"`,
      `"${row.observableResult.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const sanitizedTitle = videoTitle.toLowerCase().replace(/[^a-z0-9]/g, "_");
    link.setAttribute("download", `${sanitizedTitle}_editing_timeline.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const contentAnalysisService = new ContentAnalysisService();
