import { ContentAnalysisResult, AnalysisHistoryItem } from "../types/analysis";

export const DEMO_ANALYSIS_RESULT: ContentAnalysisResult = {
  id: "analysis-reel-01",
  videoTitle: "Why 99% of Creators Burn Out in 30 Days (And How to Fix It)",
  videoFileName: "viral_creator_burnout_breakdown_final.mp4",
  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
  analyzedAt: "2026-11-09T14:22:00Z",
  durationSeconds: 28.5,
  formattedDuration: "00:28.5",
  aspectRatio: "9:16",
  detectedLanguage: "English (US)",
  status: "completed",
  isDemoData: true,
  overviewSummary:
    "High-retention talking-head Reel utilizing rapid visual pacing (avg. shot length: 2.1s), bold sans-serif text overlays synchronized to spoken keywords, and an immediate negative-bias hook. The vocal delivery is energetic yet conversational, with sound effects placed every 1.8 seconds to maintain dopamine novelty without fatigue.",
  keyStrengths: [
    "Sub-1 second hook with pattern-interrupt hand gesture and immediate text anchor",
    "Tight voiceover-to-caption synchronization with 0.12s latency tolerance",
    "Intentional color-grading shift from muted slate to vibrant violet upon revealing the solution",
    "Dynamic camera framing alternating between medium push-in and direct eye-level jump cuts"
  ],
  growthTakeaways: [
    "The ending call-to-action drops pacing slightly (3.8s static screen); tightening to 2.2s could increase replay loop rate",
    "Background lo-fi drum kick slightly competes with speech at 00:14–00:17; ducking audio by -3dB would improve clarity"
  ],

  // SECTION 1: Audio Analysis
  audioAnalysis: {
    language: {
      detected: "English (US)",
      code: "en-US",
      confidence: 99.4,
      secondaryLanguages: ["None detected"]
    },
    voice: {
      tone: "Authoritative, empathetic, and urgent",
      speakingStyle: "Direct address, punchy cadence with crisp plosives",
      paceWpm: 182,
      paceDescription: "fast",
      primaryEmotion: "Determined / Passionate",
      accent: "General American, clear articulation",
      vocalProjection: "Close-mic proximity effect, warm low-mids with subtle compression"
    },
    backgroundAudio: {
      trackIdentified: "Neo-Phonk Lo-Fi Waveform #42 (Royalty-free)",
      genre: "Modern Ambient Trap Beat",
      tempoBpm: 128,
      mood: "Focused, driving, tension-building",
      musicDucking: true,
      audioSeparationQuality: "excellent",
      syncRating: "High (beats sync with jump cuts at 00:03, 00:07, and 00:15)",
      sfxElements: [
        { name: "Whoosh / Swoosh", timestamp: "00:00.8", seconds: 0.8, description: "Fast air displacement on initial text slam" },
        { name: "Camera Shutter Click", timestamp: "00:03.2", seconds: 3.2, description: "Hard mechanical click emphasizing 'Burnout'" },
        { name: "Bass Drop Sub", timestamp: "00:07.1", seconds: 7.1, description: "Low frequency resonance anchoring key thesis" },
        { name: "Paper Rip / Tape", timestamp: "00:11.4", seconds: 11.4, description: "Tactile transition marker into framework step 1" },
        { name: "Digital Ding / Bell", timestamp: "00:20.5", seconds: 20.5, description: "High frequency reward ping on final takeaway" }
      ]
    },
    overallClarityScore: 96,
    segments: [
      {
        id: "aud-1",
        startTime: 0,
        endTime: 1.8,
        timestamp: "00:00–00:01.8",
        speaker: "Speaker 1 (Alex)",
        spokenText: "People think content creation is about posting every single day.",
        audioType: "voiceover",
        clarity: "clear",
        confidence: 99.2
      },
      {
        id: "aud-2",
        startTime: 1.8,
        endTime: 3.9,
        timestamp: "00:01.8–00:03.9",
        speaker: "Speaker 1 (Alex)",
        spokenText: "That is the fastest way to fry your nervous system.",
        audioType: "dialogue",
        clarity: "clear",
        confidence: 98.7
      },
      {
        id: "aud-3",
        startTime: 3.9,
        endTime: 7.4,
        timestamp: "00:03.9–00:07.4",
        speaker: "Speaker 1 (Alex)",
        spokenText: "Here is the exact 3-part Creator DNA system top 1% accounts use instead.",
        audioType: "dialogue",
        clarity: "clear",
        confidence: 99.0
      },
      {
        id: "aud-4",
        startTime: 7.4,
        endTime: 11.2,
        timestamp: "00:07.4–00:11.2",
        speaker: "Speaker 1 (Alex)",
        spokenText: "Step one: Stop staring at a blank caption box. Batch your hook archetypes first.",
        audioType: "dialogue",
        clarity: "clear",
        confidence: 97.8
      },
      {
        id: "aud-5",
        startTime: 11.2,
        endTime: 15.6,
        timestamp: "00:11.2–00:15.6",
        speaker: "Speaker 1 (Alex)",
        spokenText: "Step two: Pick one visual anchor. If you change lighting, angle, and setting every clip, your viewer gets lost.",
        audioType: "dialogue",
        clarity: "clear",
        confidence: 98.4
      },
      {
        id: "aud-6",
        startTime: 15.6,
        endTime: 21.0,
        timestamp: "00:15.6–00:21.0",
        speaker: "Speaker 1 (Alex)",
        spokenText: "Step three: Use AI to replicate your voice, not replace your thoughts.",
        audioType: "dialogue",
        clarity: "clear",
        confidence: 99.1
      },
      {
        id: "aud-7",
        startTime: 21.0,
        endTime: 25.2,
        timestamp: "00:21.0–00:25.2",
        speaker: "Speaker 1 (Alex)",
        spokenText: "Train your algorithm on your best work, then generate ten variations in seconds.",
        audioType: "dialogue",
        clarity: "clear",
        confidence: 96.5,
        notes: "Slight sibilance on 'seconds' due to audio limiter"
      },
      {
        id: "aud-8",
        startTime: 25.2,
        endTime: 28.5,
        timestamp: "00:25.2–00:28.5",
        speaker: "Speaker 1 (Alex)",
        spokenText: "Save this Reel and steal the Creator DNA workflow in my bio.",
        audioType: "voiceover",
        clarity: "clear",
        confidence: 98.9
      }
    ]
  },

  // SECTION 2: Visual Analysis
  visualAnalysis: {
    totalScenes: 8,
    dominantColorPalette: ["#0F172A (Navy slate)", "#7C3AED (Violet glow)", "#F8FAFC (Clean white)", "#F97316 (Accent orange)"],
    lightingStyle: "Split cinematic lighting with key softbox at 45° and violet rim light on right shoulder",
    framingConsistency: "Strict vertical center axis; subject eyeline maintained at the upper-third guideline across all jump cuts",
    scenes: [
      {
        id: "sc-1",
        sceneNumber: 1,
        startTime: 0,
        endTime: 1.8,
        timestamp: "00:00–00:01.8",
        thumbnailColor: "from-purple-900 to-slate-900",
        settingAndBackground: "Minimalist creator studio with acoustic slat wall panels and dark matte shelving",
        subjectDescription: "Solo male creator in late 20s, modern crewneck in charcoal, leaning forward toward lens",
        clothingAndAppearance: "Charcoal washed cotton crewneck, minimal matte black wristwatch on left wrist",
        subjectActionsAndGestures: "Leans inward suddenly from 1 meter away, points index finger downward to anchor viewer focus",
        cameraAngle: "eye-level",
        cameraFraming: "medium-close-up",
        cameraMovement: "slow-push-in",
        lighting: "Diffused key light overhead, subtle cyan backfill against wall panels",
        composition: "Central vertical framing; head and shoulders occupying top 45% of 9:16 frame",
        objectsAndProps: ["Matte black desk microphone (Shure SM7B clone)", "Warm ambient bulb in background bokeh"],
        transitionIn: "Hard cut from black (instant hook)",
        storytellingPurpose: "Hook: disrupt passive scrolling with sudden forward momentum and high-contrast facial expression"
      },
      {
        id: "sc-2",
        sceneNumber: 2,
        startTime: 1.8,
        endTime: 3.9,
        timestamp: "00:01.8–00:03.9",
        thumbnailColor: "from-red-950 to-slate-900",
        settingAndBackground: "Same studio setup with red/amber hue shift in background lightbar",
        subjectDescription: "Subject raises both hands in a defensive 'stop' gesture, eyes wide with genuine expression",
        subjectActionsAndGestures: "Open palm push towards lens on the word 'fry'",
        cameraAngle: "eye-level",
        cameraFraming: "close-up",
        cameraMovement: "crash-zoom",
        lighting: "Key light remains clean; background accent flashes subtle warm amber to mirror tension",
        composition: "Tight crop on face; jawline to crown fills 70% of frame",
        objectsAndProps: ["Text banner 'FRY YOUR BRAIN' floating mid-chest"],
        transitionIn: "Fast digital punch-in (1.25x scale snap on audio beat)",
        storytellingPurpose: "Agitate pain point: dramatize the burnout risk to validate the viewer's personal frustration"
      },
      {
        id: "sc-3",
        sceneNumber: 3,
        startTime: 3.9,
        endTime: 7.4,
        timestamp: "00:03.9–00:07.4",
        thumbnailColor: "from-indigo-900 to-purple-950",
        settingAndBackground: "Studio environment with violet neon tube lighting activated on left perimeter",
        subjectDescription: "Subject drops hands to desk level, posture shifts from tense to composed authority",
        subjectActionsAndGestures: "Holds up three fingers sequentially: one, two, three",
        cameraAngle: "eye-level",
        cameraFraming: "medium-shot",
        cameraMovement: "static",
        lighting: "Balanced dual-tone: 5600K daylight key with 4000K rim",
        composition: "Re-centered, negative space left open above head for floating graphical badge",
        objectsAndProps: ["3-part framework UI overlay card rendered in Virulmuse dark glass style"],
        transitionIn: "Jump cut back to 1.0x neutral focal length with paper tear SFX",
        storytellingPurpose: "Promise of value: pivot from critique to actionable blueprint"
      },
      {
        id: "sc-4",
        sceneNumber: 4,
        startTime: 7.4,
        endTime: 11.2,
        timestamp: "00:07.4–00:11.2",
        thumbnailColor: "from-slate-900 to-zinc-900",
        settingAndBackground: "Screen recording overlay with creator's face in rounded picture-in-picture bubble (lower right)",
        subjectDescription: "Creator in bottom right corner looking up towards main UI demonstration",
        subjectActionsAndGestures: "Nods rhythmically while cursor selects hook archetypes on screen",
        cameraAngle: "eye-level",
        cameraFraming: "medium-close-up",
        cameraMovement: "static",
        lighting: "Laptop screen blue bounce light visible on subject's cheekbones",
        composition: "70% screen capture showing Virulmuse Hook Matrix; 30% creator PIP bubble",
        objectsAndProps: ["Virulmuse hook matrix interface", "Mouse click ripple animation"],
        transitionIn: "Smooth lateral slide-in from right",
        storytellingPurpose: "Tactical proof: prove the workflow is concrete, not abstract advice"
      },
      {
        id: "sc-5",
        sceneNumber: 5,
        startTime: 11.2,
        endTime: 15.6,
        timestamp: "00:11.2–00:15.6",
        thumbnailColor: "from-violet-950 to-slate-900",
        settingAndBackground: "Return to full-screen studio, camera angle shifted 15 degrees right for dynamic contrast",
        subjectDescription: "Subject seated in ergonomic matte black chair, leaning left arm on wooden desk edge",
        subjectActionsAndGestures: "Gestures side-to-side to illustrate shifting angles versus sticking to one anchor",
        cameraAngle: "low-angle",
        cameraFraming: "medium-shot",
        cameraMovement: "slow-push-in",
        lighting: "Soft warm rim light highlighting hair and contour of crewneck",
        composition: "Subject placed along left vertical third line, leaving right space for bullet checklist",
        objectsAndProps: ["Desk plant in terracotta pot (monstera deliciosa)", "Warm desk lamp"],
        transitionIn: "Match cut on subject head turn",
        storytellingPurpose: "Visual discipline rule: demonstrate how visual consistency builds brand equity"
      },
      {
        id: "sc-6",
        sceneNumber: 6,
        startTime: 15.6,
        endTime: 21.0,
        timestamp: "00:15.6–00:21.0",
        thumbnailColor: "from-purple-900 to-blue-950",
        settingAndBackground: "Studio environment with deep purple ambient fill, high cinematic contrast",
        subjectDescription: "Subject leans directly into camera, eye contact unbreaking",
        subjectActionsAndGestures: "Taps temple with index finger on 'replace your thoughts', then holds open hands",
        cameraAngle: "eye-level",
        cameraFraming: "close-up",
        cameraMovement: "handheld-organic",
        lighting: "Key light narrowed with honeycombed grid for dramatic specular highlight in eyes",
        composition: "Symmetrical central portrait framing",
        objectsAndProps: ["Floating purple holographic DNA double helix glyph"],
        transitionIn: "Hard jump cut with bass whoosh",
        storytellingPurpose: "Philosophical anchor: reframe AI as amplification of personal voice rather than generic automation"
      },
      {
        id: "sc-7",
        sceneNumber: 7,
        startTime: 21.0,
        endTime: 25.2,
        timestamp: "00:21.0–00:25.2",
        thumbnailColor: "from-emerald-950 to-slate-900",
        settingAndBackground: "High-speed screen demo showing 10 hooks generating in real-time",
        subjectDescription: "Split screen: left side shows creator smiling in approval, right side shows rapid text stream",
        subjectActionsAndGestures: "Snaps fingers on right hand, triggering instant appearance of generated script cards",
        cameraAngle: "eye-level",
        cameraFraming: "medium-shot",
        cameraMovement: "static",
        lighting: "Neutral studio lighting with green success flash on completion",
        composition: "Vertical 50/50 split with glowing purple dividing line",
        objectsAndProps: ["Speed badge counter: '10 scripts in 4.2s'", "Virulmuse interface"],
        transitionIn: "Whip pan transition with shutter sound",
        storytellingPurpose: "Outcome demonstration: visualize extreme leverage and time saved"
      },
      {
        id: "sc-8",
        sceneNumber: 8,
        startTime: 25.2,
        endTime: 28.5,
        timestamp: "00:25.2–00:28.5",
        thumbnailColor: "from-slate-900 to-violet-950",
        settingAndBackground: "Full studio view pulling out to wide shot",
        subjectDescription: "Creator points down toward the save icon and caption area",
        subjectActionsAndGestures: "Direct downward index point followed by friendly smile and nod",
        cameraAngle: "eye-level",
        cameraFraming: "medium-shot",
        cameraMovement: "slow-push-in",
        lighting: "Gradual dimming of fill light to draw full focus to final graphic card overlay",
        composition: "Central figure with pulsing 'SAVE THIS' button animation below chin level",
        objectsAndProps: ["Instagram save ribbon icon sticker", "Profile bio pointer arrow"],
        transitionIn: "Smooth zoom back to 1.0x with subtle shutter sound",
        storytellingPurpose: "Call to Action: frictionless next step (save for reference, check link in bio)"
      }
    ]
  },

  // SECTION 3: On-Screen Text Extraction (OCR)
  textExtraction: {
    totalTextElements: 12,
    captioningStyle: "Bold kinetic word-by-word with highlight tags, rendered in heavy grotesque sans with black outline",
    rawTextConcatenated:
      "STOP POSTING DAILY. 99% OF CREATORS BURN OUT. THE CREATOR DNA METHOD. 1. BATCH HOOK ARCHETYPES. 2. ONE VISUAL ANCHOR. 3. REPLICATE YOUR VOICE. NOT REPLACE YOUR MIND. 10 SCRIPTS IN SECONDS. SAVE THIS FOR LATER.",
    textElements: [
      {
        id: "txt-1",
        startTime: 0,
        endTime: 1.8,
        timestamp: "00:00–00:01.8",
        exactText: "STOP POSTING DAILY 🛑",
        position: "top-center",
        fontStyleDescription: "TheBoldFont / Montserrat ExtraBold, All-Caps, heavy letterspacing",
        textColor: "#FFFFFF with #EF4444 accent",
        backgroundTreatment: "Black semi-transparent pill container with 2px red border",
        ocrConfidence: 99.8,
        verificationStatus: "Verified",
        isAnimated: true,
        animationType: "Scale pop bounce (elastic spring)"
      },
      {
        id: "txt-2",
        startTime: 1.8,
        endTime: 2.8,
        timestamp: "00:01.8–00:02.8",
        exactText: "it's frying your brain",
        position: "middle-center",
        fontStyleDescription: "Inter Bold, Lowercase italic styling",
        textColor: "#F59E0B (Amber Gold)",
        backgroundTreatment: "No background, drop shadow 0 4px 12px rgba(0,0,0,0.8)",
        ocrConfidence: 98.4,
        verificationStatus: "Verified",
        isAnimated: true,
        animationType: "Wiggle shake on 'frying'"
      },
      {
        id: "txt-3",
        startTime: 2.8,
        endTime: 3.9,
        timestamp: "00:02.8–00:03.9",
        exactText: "and killing retention.",
        position: "middle-center",
        fontStyleDescription: "Inter Bold, Sans-Serif",
        textColor: "#F8FAFC (Clean White)",
        backgroundTreatment: "Dark slate glow highlight",
        ocrConfidence: 99.1,
        verificationStatus: "Verified",
        isAnimated: true,
        animationType: "Fade upward with motion blur"
      },
      {
        id: "txt-4",
        startTime: 3.9,
        endTime: 5.5,
        timestamp: "00:03.9–00:05.5",
        exactText: "The 3-Step Creator DNA Method",
        position: "top-center",
        fontStyleDescription: "Cabinet Grotesk / Archivo Black, Title Case",
        textColor: "#A855F7 (Neon Violet)",
        backgroundTreatment: "Gradient glass pill with purple border (#7C3AED)",
        ocrConfidence: 99.5,
        verificationStatus: "Verified",
        isAnimated: true,
        animationType: "Slide down from top edge"
      },
      {
        id: "txt-5",
        startTime: 5.5,
        endTime: 7.4,
        timestamp: "00:05.5–00:07.4",
        exactText: "(top 1% system)",
        position: "middle-center",
        fontStyleDescription: "JetBrains Mono / monospace",
        textColor: "#94A3B8 (Muted Slate)",
        backgroundTreatment: "Subtle dashed outline",
        ocrConfidence: 97.2,
        verificationStatus: "Verified",
        isAnimated: false
      },
      {
        id: "txt-6",
        startTime: 7.4,
        endTime: 11.2,
        timestamp: "00:07.4–00:11.2",
        exactText: "STEP 1: Batch Hook Archetypes 🎣",
        position: "lower-third",
        fontStyleDescription: "Heavy Sans Bold, Uppercase",
        textColor: "#FFFFFF with #3B82F6 number badge",
        backgroundTreatment: "Dark rounded card with trust blue accent line",
        ocrConfidence: 99.6,
        verificationStatus: "Verified",
        isAnimated: true,
        animationType: "Horizontal swipe from left"
      },
      {
        id: "txt-7",
        startTime: 11.2,
        endTime: 15.6,
        timestamp: "00:11.2–00:15.6",
        exactText: "STEP 2: Lock 1 Visual Anchor 🎥",
        position: "lower-third",
        fontStyleDescription: "Heavy Sans Bold, Uppercase",
        textColor: "#FFFFFF with #7C3AED number badge",
        backgroundTreatment: "Dark rounded card with purple accent line",
        ocrConfidence: 99.4,
        verificationStatus: "Verified",
        isAnimated: true,
        animationType: "Horizontal swipe from left"
      },
      {
        id: "txt-8",
        startTime: 15.6,
        endTime: 18.2,
        timestamp: "00:15.6–00:18.2",
        exactText: "STEP 3: Replicate Voice",
        position: "lower-third",
        fontStyleDescription: "Heavy Sans Bold, Uppercase",
        textColor: "#22C55E (Growth Green)",
        backgroundTreatment: "Dark rounded card with emerald accent line",
        ocrConfidence: 99.0,
        verificationStatus: "Verified",
        isAnimated: true,
        animationType: "Horizontal swipe from left"
      },
      {
        id: "txt-9",
        startTime: 18.2,
        endTime: 21.0,
        timestamp: "00:18.2–00:21.0",
        exactText: "DON'T REPLACE THOUGHTS",
        position: "middle-center",
        fontStyleDescription: "Condensed Impact Sans, High Contrast",
        textColor: "#F8FAFC with yellow under-stroke",
        backgroundTreatment: "Solid black background bar",
        ocrConfidence: 98.9,
        verificationStatus: "Verified",
        isAnimated: true,
        animationType: "Pulsing font scale"
      },
      {
        id: "txt-10",
        startTime: 21.0,
        endTime: 23.5,
        timestamp: "00:21.0–00:23.5",
        exactText: "⚡ 10 Variations in 4 Seconds",
        position: "top-center",
        fontStyleDescription: "Inter Semibold, Rounded numerals",
        textColor: "#38BDF8 (Cyan Glow)",
        backgroundTreatment: "Pill badge with lightning icon",
        ocrConfidence: 99.2,
        verificationStatus: "Verified",
        isAnimated: true,
        animationType: "Count-up number transition"
      },
      {
        id: "txt-11",
        startTime: 23.5,
        endTime: 25.2,
        timestamp: "00:23.5–00:25.2",
        exactText: "Works on IG Reels, TikTok, Shorts",
        position: "bottom-center",
        fontStyleDescription: "Inter Medium, Subtitle font",
        textColor: "#94A3B8 (Muted Gray)",
        backgroundTreatment: "Subtle dark gradient vignette",
        ocrConfidence: 96.1,
        verificationStatus: "Partially Verified",
        isAnimated: false
      },
      {
        id: "txt-12",
        startTime: 25.2,
        endTime: 28.5,
        timestamp: "00:25.2–00:28.5",
        exactText: "SAVE THIS REEL 📌 link in bio for template",
        position: "bottom-center",
        fontStyleDescription: "Montserrat Bold, Uppercase with callout badge",
        textColor: "#FFFFFF with orange pin emoji",
        backgroundTreatment: "High-contrast #F97316 (Orange) CTA badge",
        ocrConfidence: 99.7,
        verificationStatus: "Verified",
        isAnimated: true,
        animationType: "Continuous subtle pulse / beacon"
      }
    ]
  },

  // SECTION 4: Complete Original Reel Script Table (THE CORE TABLE)
  scriptTable: [
    {
      id: "row-1",
      startTime: 0,
      endTime: 1.8,
      timestamp: "00:00–00:01.8",
      originalVoiceover: "People think content creation is about posting every single day.",
      exactOnScreenText: "STOP POSTING DAILY 🛑",
      detailedVisualDirection:
        "Subject leans suddenly forward toward the lens in a minimalist studio; points index finger down to anchor focus. Rapid 1.1x push-in.",
      sceneNumber: 1,
      confidenceScore: 99.5
    },
    {
      id: "row-2",
      startTime: 1.8,
      endTime: 2.8,
      timestamp: "00:01.8–00:02.8",
      originalVoiceover: "That is the fastest way...",
      exactOnScreenText: "it's frying your brain",
      detailedVisualDirection:
        "Tight jump cut to close-up; background light shifts to warm amber; subject raises open palms in defensive 'stop' gesture.",
      sceneNumber: 2,
      confidenceScore: 98.9
    },
    {
      id: "row-3",
      startTime: 2.8,
      endTime: 3.9,
      timestamp: "00:02.8–00:03.9",
      originalVoiceover: "...to fry your nervous system.",
      exactOnScreenText: "and killing retention.",
      detailedVisualDirection:
        "Subject shakes head firmly with furrowed brow; camera snaps with crash-zoom on the word 'nervous'.",
      sceneNumber: 2,
      confidenceScore: 98.4
    },
    {
      id: "row-4",
      startTime: 3.9,
      endTime: 5.5,
      timestamp: "00:03.9–00:05.5",
      originalVoiceover: "Here is the exact 3-part Creator DNA system...",
      exactOnScreenText: "The 3-Step Creator DNA Method",
      detailedVisualDirection:
        "Cut back to medium shot; posture shifts to calm authority; neon violet rim light ignites behind subject.",
      sceneNumber: 3,
      confidenceScore: 99.2
    },
    {
      id: "row-5",
      startTime: 5.5,
      endTime: 7.4,
      timestamp: "00:05.5–00:07.4",
      originalVoiceover: "...top 1% accounts use instead.",
      exactOnScreenText: "(top 1% system)",
      detailedVisualDirection:
        "Subject holds up three fingers sequentially (one, two, three); floating dark glass UI card renders overhead.",
      sceneNumber: 3,
      confidenceScore: 99.0
    },
    {
      id: "row-6",
      startTime: 7.4,
      endTime: 11.2,
      timestamp: "00:07.4–00:11.2",
      originalVoiceover: "Step one: Stop staring at a blank caption box. Batch your hook archetypes first.",
      exactOnScreenText: "STEP 1: Batch Hook Archetypes 🎣",
      detailedVisualDirection:
        "Screen recording PIP overlay opens; cursor clicks through 5 hook archetypes in Virulmuse matrix; subject nods in lower bubble.",
      sceneNumber: 4,
      confidenceScore: 98.1
    },
    {
      id: "row-7",
      startTime: 11.2,
      endTime: 15.6,
      timestamp: "00:11.2–00:15.6",
      originalVoiceover: "Step two: Pick one visual anchor. If you change lighting, angle, and setting every clip, your viewer gets lost.",
      exactOnScreenText: "STEP 2: Lock 1 Visual Anchor 🎥",
      detailedVisualDirection:
        "Full-screen studio return; 15-degree lateral angle shift; subject gestures side-to-side highlighting consistent framing.",
      sceneNumber: 5,
      confidenceScore: 98.6
    },
    {
      id: "row-8",
      startTime: 15.6,
      endTime: 18.2,
      timestamp: "00:15.6–00:18.2",
      originalVoiceover: "Step three: Use AI to replicate your voice...",
      exactOnScreenText: "STEP 3: Replicate Voice",
      detailedVisualDirection:
        "Central close-up portrait; subject taps temple with index finger; glowing violet DNA helix icon hovers above right shoulder.",
      sceneNumber: 6,
      confidenceScore: 99.4
    },
    {
      id: "row-9",
      startTime: 18.2,
      endTime: 21.0,
      timestamp: "00:18.2–00:21.0",
      originalVoiceover: "...not replace your thoughts.",
      exactOnScreenText: "DON'T REPLACE THOUGHTS",
      detailedVisualDirection:
        "Dramatic lighting grid tightens; intense unblinking eye contact; open hands gesture forward emphasizing authenticity.",
      sceneNumber: 6,
      confidenceScore: 99.1
    },
    {
      id: "row-10",
      startTime: 21.0,
      endTime: 25.2,
      timestamp: "00:21.0–00:25.2",
      originalVoiceover: "Train your algorithm on your best work, then generate ten variations in seconds.",
      exactOnScreenText: "⚡ 10 Variations in 4 Seconds",
      detailedVisualDirection:
        "Vertical split screen: creator snaps fingers on left, right side cascades 10 generated Reel script cards in fast animation.",
      sceneNumber: 7,
      confidenceScore: 97.6,
      uncertaintyNotes: "Audio limiter engaged at 24.1s; voice frequency curve slightly clipped but words verified via phoneme matching"
    },
    {
      id: "row-11",
      startTime: 25.2,
      endTime: 28.5,
      timestamp: "00:25.2–00:28.5",
      originalVoiceover: "Save this Reel and steal the Creator DNA workflow in my bio.",
      exactOnScreenText: "SAVE THIS REEL 📌 link in bio for template",
      detailedVisualDirection:
        "Wide shot pull-out; subject points downward towards Instagram bookmark icon and caption area with engaging warm smile.",
      sceneNumber: 8,
      confidenceScore: 99.3
    }
  ],

  // SECTION 5: Editing and Production Breakdown
  editingBreakdown: {
    technical: {
      durationSeconds: 28.5,
      formattedDuration: "00:28.5",
      aspectRatio: "9:16",
      resolution: "1080 x 1920 (FHD Vertical)",
      estimatedFps: 30,
      orientation: "vertical",
      fileSizeBytes: 24650000,
      format: "MP4 (H.264 / AAC)"
    },
    pacing: {
      totalScenes: 8,
      averageShotDurationSeconds: 2.1,
      cutTimestamps: [
        { timestamp: "00:01.8", seconds: 1.8 },
        { timestamp: "00:03.9", seconds: 3.9 },
        { timestamp: "00:07.4", seconds: 7.4 },
        { timestamp: "00:11.2", seconds: 11.2 },
        { timestamp: "00:15.6", seconds: 15.6 },
        { timestamp: "00:21.0", seconds: 21.0 },
        { timestamp: "00:25.2", seconds: 25.2 }
      ],
      transitionTypes: [
        { type: "Hard Jump Cut", count: 4 },
        { type: "Digital Punch-In (Scale Snap)", count: 2 },
        { type: "Whip Pan / Motion Swipe", count: 1 }
      ],
      jumpCutCount: 5,
      speedRampingCount: 2,
      hasSlowMotion: false,
      beatSynchronization: "tight"
    },
    audioEditing: {
      voTimingScore: "98% (No speech overlap, tight 0.15s silences removed)",
      musicSyncScore: "94% (Trap beat snare hits aligned with video cuts at 00:03, 00:07, 00:15)",
      soundEffectFrequency: "One SFX every 2.4 seconds on average",
      audioTransitionsDescription:
        "Sub-bass drops anchor structural topic shifts; whoosh risers anticipate visual jump cuts."
    },
    visualEditing: {
      textAnimationsCount: 9,
      zoomsAndPansCount: 4,
      colorGradingNotes:
        "Custom high-contrast teal-and-slate LUT with boosted magenta/violet channel to enhance skin tone luminescence against dark backgrounds.",
      vfxList: [
        "Kinetic Word Bounce",
        "Screen Recording Drop Shadow & Rounded Corners",
        "Floating Glassmorphism Card Overlay",
        "Light Leak Shimmer at 00:15.6",
        "Pulsing CTA Beacon Badge"
      ]
    },
    storytellingArc: [
      {
        stage: "Hook",
        timestamp: "00:00–00:03.9",
        secondsStart: 0,
        secondsEnd: 3.9,
        description: "Negative-bias assertion ('Stop posting daily') disrupts common creator dogma.",
        engagementIntent: "Halts scroll velocity within first 400ms by challenging standard advice"
      },
      {
        stage: "Opening",
        timestamp: "00:03.9–00:07.4",
        secondsStart: 3.9,
        secondsEnd: 7.4,
        description: "Introduces the proprietary vehicle ('Creator DNA 3-Step System').",
        engagementIntent: "Positions creator as high-status domain expert (top 1% authority)"
      },
      {
        stage: "Main Content",
        timestamp: "00:07.4–00:15.6",
        secondsStart: 7.4,
        secondsEnd: 15.6,
        description: "Breaks down steps 1 and 2 (batching hook archetypes & visual consistency anchor).",
        engagementIntent: "Delivers immediate tactical utility that solves the pain point"
      },
      {
        stage: "Development",
        timestamp: "00:15.6–00:21.0",
        secondsStart: 15.6,
        secondsEnd: 21.0,
        description: "Addresses the AI controversy: replicate voice without sacrificing original thinking.",
        engagementIntent: "Creates philosophical alignment and overcomes viewer skepticism"
      },
      {
        stage: "Payoff",
        timestamp: "00:21.0–00:25.2",
        secondsStart: 21.0,
        secondsEnd: 25.2,
        description: "Visual proof of 10 variations created in 4 seconds.",
        engagementIntent: "Delivers dopamine rush through tangible proof of effortless leverage"
      },
      {
        stage: "Call-to-Action",
        timestamp: "00:25.2–00:28.5",
        secondsStart: 25.2,
        secondsEnd: 28.5,
        description: "Low-friction direct save action and profile bio template prompt.",
        engagementIntent: "Maximizes algorithmic save signals which drive Explore page distribution"
      }
    ]
  },

  // SECTION 6: Final Accuracy Report
  accuracyReport: {
    overallAccuracyRating: "High (Direct Evidence)",
    overallScore: 97.4,
    methodologyNotes:
      "Multimodal analysis cross-references raw PCM audio spectral analysis, neural speech-to-text with phoneme verification, OCR bounding box contour tracking, and optical flow shot-boundary detection. Direct sensory evidence is strictly isolated from structural narrative interpretation.",
    dimensions: [
      {
        dimension: "Complete Original Voiceover Transcript",
        status: "Verified",
        confidenceScore: 98.8,
        directEvidenceSummary:
          "All 94 spoken words transcribed from primary audio channel; 0 undetected vocal bursts; background beat ducking ensured >18dB SNR across speech bands.",
        aiInterpretationSummary:
          "Speaker identity attributed as 'Alex' based on voice fingerprint consistency and visual lip-sync tracking."
      },
      {
        dimension: "Complete On-Screen Text (OCR)",
        status: "Verified",
        confidenceScore: 98.6,
        directEvidenceSummary:
          "12 distinct typography clusters detected and tracked across 855 video frames; exact capitalization, punctuation, and emoji characters preserved.",
        aiInterpretationSummary:
          "Font classification identified as Grotesque/Montserrat family based on terminal angle analysis."
      },
      {
        dimension: "Scene-by-Scene Visual Breakdown",
        status: "Verified",
        confidenceScore: 97.2,
        directEvidenceSummary:
          "All 7 cut boundaries matched optical flow histogram shifts (>45% frame difference threshold). Camera focal changes verified mathematically.",
        aiInterpretationSummary:
          "Lighting style labeled 'split cinematic' based on directional shadow vectors on subject face."
      },
      {
        dimension: "Audio and Sound Breakdown",
        status: "Verified",
        confidenceScore: 96.5,
        directEvidenceSummary:
          "5 distinct transient sound effects isolated via high-pass frequency filtering; background music identified with 128 BPM beat grid.",
        aiInterpretationSummary:
          "Music mood classified as 'focused, driving ambient trap' from harmonic minor chord progressions."
      },
      {
        dimension: "Timestamp Synchronization",
        status: "Verified",
        confidenceScore: 99.1,
        directEvidenceSummary:
          "Voiceover start/end timestamps aligned with audio waveform zero-crossings down to 0.05-second granularity.",
        aiInterpretationSummary:
          "Table rows grouped logically around cohesive semantic sentences rather than arbitrary 1-second slices."
      },
      {
        dimension: "Full Original Reel Script Table",
        status: "Verified",
        confidenceScore: 98.2,
        directEvidenceSummary:
          "11 synchronized rows accurately match exact voiceover with simultaneous on-screen text and visual staging.",
        aiInterpretationSummary:
          "Visual direction written in industry-standard storyboard format for direct replication."
      }
    ],
    unclearSections: [
      {
        id: "unc-1",
        category: "Speech / Dialogue",
        timestamp: "00:24.1–00:24.4",
        description: "Word 'seconds' has minor high-frequency clipping due to hardware compressor",
        reason: "Microphone input gain reached -0.2dB threshold; subtle sibilance distortion",
        recommendation: "Verified by contextual phoneme probability and lip movement. Direct audio waveform is 94% confidence."
      },
      {
        id: "unc-2",
        category: "On-Screen Text",
        timestamp: "00:23.5–00:24.8",
        description: "Small subtitle text 'Works on IG Reels, TikTok, Shorts' is partially occluded by video player UI in bottom 15%",
        reason: "Positioned within the Instagram UI safe zone hazard area",
        recommendation: "OCR confidence is 96.1%. Text was visible for 1.3 seconds."
      }
    ]
  }
};

export const DEMO_PRESET_REELS: Array<{
  id: string;
  title: string;
  category: string;
  duration: string;
  sceneCount: number;
  previewThumbnail: string;
  description: string;
  result: ContentAnalysisResult;
}> = [
  {
    id: "preset-1",
    title: "Why 99% of Creators Burn Out in 30 Days",
    category: "Creator Growth & Systems",
    duration: "00:28.5",
    sceneCount: 8,
    previewThumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    description: "Viral talking-head format with rapid text animations, pattern interrupts, and actionable 3-part framework.",
    result: DEMO_ANALYSIS_RESULT
  },
  {
    id: "preset-2",
    title: "The 3 AI Prompts That Replaced My Marketing Agency",
    category: "AI & Tech Breakdown",
    duration: "00:34.2",
    sceneCount: 11,
    previewThumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
    description: "High-velocity tech aesthetic with fast screen captures, sound-designed typing, and dynamic terminal overlays.",
    result: {
      ...DEMO_ANALYSIS_RESULT,
      id: "analysis-reel-02",
      videoTitle: "The 3 AI Prompts That Replaced My Marketing Agency",
      videoFileName: "ai_prompts_agency_workflow_reel.mp4",
      durationSeconds: 34.2,
      formattedDuration: "00:34.2",
      overviewSummary:
        "High-density tutorial Reel featuring rapid split-screen terminal captures, keyboard clack Foley, and high-contrast monospace typography. Retains viewers through progressive information reveal.",
      audioAnalysis: {
        ...DEMO_ANALYSIS_RESULT.audioAnalysis,
        voice: {
          ...DEMO_ANALYSIS_RESULT.audioAnalysis.voice,
          tone: "Pragmatic, technical, razor-sharp",
          paceWpm: 194
        }
      }
    }
  },
  {
    id: "preset-3",
    title: "Stop Drinking Pre-Workout Before You Know This",
    category: "Health & High-Performance",
    duration: "00:22.0",
    sceneCount: 7,
    previewThumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    description: "High-contrast fitness hook with dramatic lighting, scientific paper callouts, and rapid visual cuts.",
    result: {
      ...DEMO_ANALYSIS_RESULT,
      id: "analysis-reel-03",
      videoTitle: "Stop Drinking Pre-Workout Before You Know This",
      videoFileName: "preworkout_science_warning_reel.mp4",
      durationSeconds: 22.0,
      formattedDuration: "00:22.0",
      overviewSummary:
        "Intense pattern-interrupt health Reel opening with a laboratory beaker slam, neon red warning text, and swift medical journal snippet callouts.",
      audioAnalysis: {
        ...DEMO_ANALYSIS_RESULT.audioAnalysis,
        voice: {
          ...DEMO_ANALYSIS_RESULT.audioAnalysis.voice,
          tone: "Urgent, cautionary, science-grounded",
          paceWpm: 175
        }
      }
    }
  }
];

export const INITIAL_ANALYSIS_HISTORY: AnalysisHistoryItem[] = [
  {
    id: "analysis-reel-01",
    videoTitle: "Why 99% of Creators Burn Out in 30 Days (And How to Fix It)",
    videoFileName: "viral_creator_burnout_breakdown_final.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    uploadedAt: "Yesterday at 2:22 PM",
    durationFormatted: "00:28.5",
    status: "completed",
    sceneCount: 8,
    accuracyScore: 97.4,
    isDemo: true
  },
  {
    id: "analysis-reel-02",
    videoTitle: "The 3 AI Prompts That Replaced My Marketing Agency",
    videoFileName: "ai_prompts_agency_workflow_reel.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
    uploadedAt: "Nov 7, 2026",
    durationFormatted: "00:34.2",
    status: "completed",
    sceneCount: 11,
    accuracyScore: 98.1,
    isDemo: true
  },
  {
    id: "analysis-reel-03",
    videoTitle: "Stop Drinking Pre-Workout Before You Know This",
    videoFileName: "preworkout_science_warning_reel.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    uploadedAt: "Nov 4, 2026",
    durationFormatted: "00:22.0",
    status: "completed",
    sceneCount: 7,
    accuracyScore: 96.8,
    isDemo: true
  }
];
