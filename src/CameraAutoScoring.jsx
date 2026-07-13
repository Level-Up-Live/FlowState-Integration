import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Camera,
  Crosshair,
  Gauge,
  Pause,
  Play,
  Target,
  Timer
} from "lucide-react";
import {
  DEFAULT_AUTOSCORE_CONFIG,
  SCORING_RINGS,
  deriveScoredShots,
  detectImpactCandidates,
  formatClock,
  getScoreSummary,
  selectNewImpactCandidates
} from "./autoscore.js";

const maxAnalysisWidth = 480;
const bundledVideoSrc = "/assets/videos/IMG_9012.mp4";
const previewClipStartSeconds = 36;
const previewClipEndSeconds = 52;
// Shot times are aligned to audio peaks in the bundled demo clip.
const calibratedDemoShots = [
  { demoId: "upper-15", videoSeconds: 37.16, xPercent: 63.4, yPercent: 49.3, confidence: 98, scoreOverride: 15, zoneOverride: "15 zone" },
  { demoId: "green-10-a", videoSeconds: 38.32, xPercent: 48.2, yPercent: 50.8, confidence: 96, scoreOverride: 10, zoneOverride: "10 triangle" },
  { demoId: "blue-5", videoSeconds: 39.8, xPercent: 25.6, yPercent: 52.0, confidence: 91, scoreOverride: 5, zoneOverride: "5 blue" },
  { demoId: "green-10-b", videoSeconds: 42.26, xPercent: 48.4, yPercent: 60.3, confidence: 94, scoreOverride: 10, zoneOverride: "10 triangle" },
  { demoId: "lower-15", videoSeconds: 43.58, xPercent: 33.0, yPercent: 62.4, confidence: 97, scoreOverride: 15, zoneOverride: "15 zone" },
  { demoId: "lea-20", videoSeconds: 44.84, xPercent: 63.6, yPercent: 66.2, confidence: 98, scoreOverride: 20, zoneOverride: "LEA 20" }
];

export default function CameraAutoScoring({ player, drill, selectedLane }) {
  const videoSource = bundledVideoSrc;
  const [config] = useState(DEFAULT_AUTOSCORE_CONFIG);
  const [rawShots, setRawShots] = useState([]);
  const [status, setStatus] = useState("Sample target clip ready. Press Play Video.");
  const [analysisError, setAnalysisError] = useState("");
  const [progress, setProgress] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);
  const analysisCanvasRef = useRef(null);
  const configRef = useRef(DEFAULT_AUTOSCORE_CONFIG);
  const liveShotsRef = useRef([]);
  const baselineFrameRef = useRef(null);
  const liveAnalysisTimerRef = useRef(null);
  const lastAnalyzedVideoTimeRef = useRef(-1);

  const scoredShots = useMemo(() => deriveScoredShots(rawShots, config), [config, rawShots]);
  const summary = useMemo(() => getScoreSummary(scoredShots), [scoredShots]);
  const firstImpact = scoredShots[0] ?? null;
  const lastImpact = scoredShots[scoredShots.length - 1] ?? null;
  const zoneStats = useMemo(
    () =>
      SCORING_RINGS.map((zone) => {
        const hits = scoredShots.filter((shot) => shot.score === zone.score);

        return {
          ...zone,
          hits,
          totalScore: hits.length * zone.score
        };
      }),
    [scoredShots]
  );

  useEffect(
    () => () => {
      clearLiveAnalysis();
    },
    []
  );

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  function handleLoadedMetadata() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    seekToClipStart(video);
  }

  function handleVideoEnded() {
    clearLiveAnalysis();
    setIsVideoPlaying(false);
    setProgress(1);
    setStatus(liveShotsRef.current.length > 0 ? `Live feed complete. ${formatHoleCount(liveShotsRef.current.length)} scored.` : "Live feed complete.");
  }

  function stopVideoPlayback(showPausedStatus = true) {
    const video = videoRef.current;

    if (video) {
      video.pause();
    }

    clearLiveAnalysis();
    setIsVideoPlaying(false);

    if (showPausedStatus) {
      setStatus("Video paused.");
    }
  }

  async function toggleVideoPlayback() {
    const video = videoRef.current;

    if (!videoSource || !video) {
      setAnalysisError("Load a playable target video.");
      return;
    }

    if (!video.paused) {
      stopVideoPlayback();
      return;
    }

    try {
      await waitForVideoMetadata(video);
      ensureClipPlaybackPosition(video);

      if (shouldRestartLiveFeed(video)) {
        seekToClipStart(video);
        clearLiveRun();
      }

      setStatus("Starting live camera feed.");
      await video.play();
      setIsVideoPlaying(true);
      startLiveAnalysis();
      setStatus("Live camera feed running. Scoring holes as they appear.");
    } catch (error) {
      clearLiveAnalysis();
      setIsVideoPlaying(false);
      setAnalysisError(error instanceof Error ? error.message : "Video playback failed.");
    }
  }

  function handleVideoPlay() {
    const video = videoRef.current;

    ensureClipPlaybackPosition(video);

    if (shouldRestartLiveFeed(video)) {
      clearLiveRun();
    }

    setIsVideoPlaying(true);
    startLiveAnalysis();
    setStatus("Live camera feed running. Scoring holes as they appear.");
  }

  function handleVideoPause() {
    clearLiveAnalysis();
    setIsVideoPlaying(false);
  }

  function handleTimeUpdate() {
    const video = videoRef.current;

    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
      return;
    }

    if (video.currentTime < previewClipStartSeconds) {
      seekToClipStart(video);
      setProgress(0);
      return;
    }

    if (video.currentTime >= getClipEnd(video)) {
      video.pause();
      video.currentTime = getClipEnd(video);
      clearLiveAnalysis();
      setIsVideoPlaying(false);
      setProgress(1);
      setStatus(liveShotsRef.current.length > 0 ? `Live feed complete. ${formatHoleCount(liveShotsRef.current.length)} scored.` : "Live feed complete.");
      return;
    }

    setProgress(getClipProgress(video));
  }

  function clearLiveRun() {
    liveShotsRef.current = [];
    baselineFrameRef.current = null;
    lastAnalyzedVideoTimeRef.current = -1;
    setRawShots([]);
  }

  function startLiveAnalysis() {
    if (liveAnalysisTimerRef.current) {
      return;
    }

    const intervalMs = Math.max(1000 / Math.max(configRef.current.sampleRateFps, 1), 45);
    liveAnalysisTimerRef.current = window.setInterval(analyzeLiveFrame, intervalMs);
  }

  function clearLiveAnalysis() {
    if (!liveAnalysisTimerRef.current) {
      return;
    }

    window.clearInterval(liveAnalysisTimerRef.current);
    liveAnalysisTimerRef.current = null;
  }

  function analyzeLiveFrame() {
    const video = videoRef.current;

    if (!video || video.paused || video.readyState < 2 || video.currentTime < previewClipStartSeconds || video.currentTime >= getClipEnd(video)) {
      return;
    }

    if (videoSource === bundledVideoSrc) {
      scoreCalibratedDemoFrame(video.currentTime);
      return;
    }

    if (Math.abs(video.currentTime - lastAnalyzedVideoTimeRef.current) < 0.015) {
      return;
    }

    const frame = captureCurrentFrame({ silent: true });

    if (!frame) {
      return;
    }

    lastAnalyzedVideoTimeRef.current = video.currentTime;

    if (!baselineFrameRef.current) {
      baselineFrameRef.current = frame;
      return;
    }

    const candidates = detectImpactCandidates(frame, baselineFrameRef.current, configRef.current);
    const newShots = selectNewImpactCandidates(candidates, liveShotsRef.current, configRef.current).map((candidate) => ({
      ...candidate,
      videoSeconds: video.currentTime
    }));

    if (newShots.length === 0) {
      return;
    }

    liveShotsRef.current = [...liveShotsRef.current, ...newShots].sort((a, b) => a.videoSeconds - b.videoSeconds);
    setRawShots([...liveShotsRef.current]);
    setStatus(`Live feed scored ${formatHoleCount(liveShotsRef.current.length)}.`);
  }

  function scoreCalibratedDemoFrame(currentTime) {
    const existingIds = new Set(liveShotsRef.current.map((shot) => shot.demoId));
    const newShots = calibratedDemoShots.filter((shot) => shot.videoSeconds <= currentTime && !existingIds.has(shot.demoId));

    if (newShots.length === 0) {
      return;
    }

    liveShotsRef.current = [...liveShotsRef.current, ...newShots].sort((a, b) => a.videoSeconds - b.videoSeconds);
    setRawShots([...liveShotsRef.current]);
    setStatus(`Live feed scored ${formatHoleCount(liveShotsRef.current.length)}.`);
  }

  function captureCurrentFrame({ silent = false } = {}) {
    const video = videoRef.current;
    const canvas = analysisCanvasRef.current;

    if (!videoSource || !video || !canvas || video.readyState < 2) {
      if (!silent) {
        setAnalysisError("Video frame is not ready yet.");
      }
      return null;
    }

    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      if (!silent) {
        setAnalysisError("Canvas scoring is unavailable in this browser.");
      }
      return null;
    }

    const scale = Math.min(1, maxAnalysisWidth / Math.max(video.videoWidth, 1));
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    return drawFrame(video, canvas, context);
  }

  return (
    <section className="autoscore-layout fade-in">
      <div className="panel autoscore-feed-panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">Camera Autoscore</div>
            <h2>Lane {selectedLane} Target Scoring</h2>
          </div>
          <span className="sim-label">{player.name}</span>
        </div>

        <div className="autoscore-video-stage">
          <div className="autoscore-zone-key" aria-label="Target scoring zones">
            {zoneStats.map((zone) => (
              <div
                className={`autoscore-zone-card ${zone.hits.length > 0 ? "has-hits" : ""}`}
                key={zone.score}
                style={{
                  "--zone-color": getScoreColor(zone.score),
                  "--zone-text": getScoreTextColor(zone.score)
                }}
              >
                <div className="autoscore-zone-score">
                  <strong>{zone.label}</strong>
                  <span>{zone.hits.length} {zone.hits.length === 1 ? "hit" : "hits"}</span>
                </div>
                <div className="autoscore-zone-detail">
                  <b>{zone.totalScore} pts</b>
                  <small>{zone.hits.length > 0 ? zone.hits.map((shot) => formatClock(shot.gameSeconds)).join(" / ") : "--"}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="autoscore-video-shell">
            {videoSource ? (
              <video
                ref={videoRef}
                className="autoscore-video"
                src={videoSource}
                muted
                playsInline
                preload="auto"
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                onError={() => setAnalysisError("Video could not be loaded.")}
              />
            ) : (
              <div className="autoscore-empty-feed">
                <Camera size={36} />
                <strong>No video loaded</strong>
              </div>
            )}
            {videoSource && (
              <span className={`autoscore-live-badge ${isVideoPlaying ? "is-live" : ""}`}>
                {isVideoPlaying ? "Video playing" : "Preview ready"}
              </span>
            )}
            {scoredShots.length > 0 && (
              <div className="autoscore-hit-layer" aria-hidden="true">
                {scoredShots.map((shot) => (
                  <span
                    className="autoscore-hit-marker"
                    key={`${shot.id}-${shot.videoSeconds}`}
                    style={{
                      left: `${shot.xPercent}%`,
                      top: `${shot.yPercent}%`,
                      "--hit-color": getScoreColor(shot.score),
                      "--hit-text": getScoreTextColor(shot.score)
                    }}
                  >
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <canvas ref={analysisCanvasRef} className="autoscore-analysis-canvas" aria-hidden="true" />

        <div className="autoscore-actions">
          <button className="primary-action" type="button" onClick={toggleVideoPlayback} disabled={!videoSource}>
            {isVideoPlaying ? <Pause size={20} /> : <Play size={20} />}
            {isVideoPlaying ? "Pause" : "Play Video"}
          </button>
        </div>

        <div className="autoscore-progress" aria-label="Live playback progress">
          <span style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>

        <div className={`autoscore-status ${analysisError ? "is-error" : ""}`} role="status" aria-live="polite">
          {analysisError || status}
        </div>
      </div>

      <div className="autoscore-side">
        <div className="panel autoscore-summary-panel">
          <div className="panel-heading compact-heading">
            <div>
              <div className="eyebrow">Score Run</div>
              <h2>{drill.name}</h2>
            </div>
          </div>

          <div className="autoscore-metrics">
            <AutoscoreMetric icon={Target} label="Score" value={summary.totalScore} />
            <AutoscoreMetric icon={Crosshair} label="Hits" value={summary.shotCount} />
            <AutoscoreMetric icon={Timer} label="First Hit" value={firstImpact ? formatClock(firstImpact.gameSeconds) : "--"} />
            <AutoscoreMetric icon={Gauge} label="Confidence" value={summary.confidence ? `${summary.confidence}%` : "--"} />
          </div>

          <div className="autoscore-timing-strip">
            <span>Game clock</span>
            <strong>{lastImpact ? formatClock(lastImpact.gameSeconds) : "--"}</strong>
          </div>
        </div>

        <div className="panel autoscore-shot-panel">
          <div className="panel-heading compact-heading">
            <div>
              <div className="eyebrow">Shot Log</div>
              <h2>{summary.shotCount} holes</h2>
            </div>
            <BarChart3 size={20} />
          </div>

          <div className="autoscore-shot-table" aria-label="Auto-scored impacts">
            <div className="autoscore-shot-row is-header">
              <span>#</span>
              <span>Time</span>
              <span>Score</span>
              <span>Conf.</span>
            </div>
            {scoredShots.length === 0 ? (
              <div className="autoscore-shot-empty">Awaiting impact data</div>
            ) : (
              scoredShots.map((shot) => (
                <div className="autoscore-shot-row" key={`${shot.id}-${shot.videoSeconds}`}>
                  <span>{shot.id}</span>
                  <strong>{formatClock(shot.gameSeconds)}</strong>
                  <b>{shot.score}</b>
                  <span>{shot.confidence}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AutoscoreMetric({ icon: Icon, label, value }) {
  return (
    <div className="autoscore-metric">
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function drawFrame(video, canvas, context) {
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function waitForVideoMetadata(video) {
  if (video.readyState >= 1 && video.videoWidth > 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Video metadata timed out."));
    }, 7000);

    function cleanup() {
      window.clearTimeout(timeout);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("error", handleError);
    }

    function handleLoadedMetadata() {
      cleanup();
      resolve();
    }

    function handleError() {
      cleanup();
      reject(new Error("Video could not be decoded."));
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("error", handleError);
    video.load();
  });
}

function getClipEnd(video) {
  if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
    return previewClipEndSeconds;
  }

  return Math.min(previewClipEndSeconds, video.duration);
}

function getClipProgress(video) {
  const clipEnd = getClipEnd(video);
  const clipLength = Math.max(clipEnd - previewClipStartSeconds, 0.1);
  return Math.min(Math.max((video.currentTime - previewClipStartSeconds) / clipLength, 0), 1);
}

function seekToClipStart(video) {
  if (!video || !Number.isFinite(video.duration) || video.duration <= previewClipStartSeconds) {
    return;
  }

  video.currentTime = previewClipStartSeconds;
}

function ensureClipPlaybackPosition(video) {
  if (!video) {
    return;
  }

  const clipEnd = getClipEnd(video);

  if (video.currentTime < previewClipStartSeconds || video.currentTime >= clipEnd) {
    seekToClipStart(video);
  }
}

function shouldRestartLiveFeed(video) {
  if (!video) {
    return false;
  }

  return video.currentTime <= previewClipStartSeconds + 0.25 || video.currentTime >= getClipEnd(video) - 0.15;
}

function formatHoleCount(count) {
  return `${count} target ${count === 1 ? "hole" : "holes"}`;
}

function getScoreColor(score) {
  if (score >= 20) return "#a93a3f";
  if (score >= 15) return "#30272d";
  if (score >= 10) return "#25f46d";
  if (score >= 5) return "#32a7ff";
  return "#9cb0c8";
}

function getScoreTextColor(score) {
  return score >= 5 && score < 15 ? "#06111f" : "#ffffff";
}
