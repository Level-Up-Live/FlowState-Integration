import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Camera,
  Crosshair,
  Download,
  FileVideo,
  Gauge,
  Play,
  RotateCcw,
  SlidersHorizontal,
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

export default function CameraAutoScoring({ player, drill, selectedLane }) {
  const [videoSource, setVideoSource] = useState("");
  const [fileName, setFileName] = useState("");
  const [config, setConfig] = useState(DEFAULT_AUTOSCORE_CONFIG);
  const [rawShots, setRawShots] = useState([]);
  const [videoMeta, setVideoMeta] = useState({ duration: 0, width: 16, height: 9 });
  const [status, setStatus] = useState("Video scorer ready.");
  const [analysisError, setAnalysisError] = useState("");
  const [progress, setProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef(null);
  const analysisCanvasRef = useRef(null);
  const objectUrlRef = useRef("");
  const analysisRunRef = useRef(0);

  const scoredShots = useMemo(() => deriveScoredShots(rawShots, config), [config, rawShots]);
  const summary = useMemo(() => getScoreSummary(scoredShots), [scoredShots]);
  const firstImpact = scoredShots[0] ?? null;
  const lastImpact = scoredShots[scoredShots.length - 1] ?? null;

  useEffect(
    () => () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    },
    []
  );

  function updateConfig(key, value) {
    setConfig((current) => ({
      ...current,
      [key]: Number(value)
    }));
  }

  function handleVideoFile(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    analysisRunRef.current += 1;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const nextUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextUrl;
    setVideoSource(nextUrl);
    setFileName(file.name);
    setRawShots([]);
    setProgress(0);
    setAnalysisError("");
    setStatus(`${file.name} loaded.`);
    event.target.value = "";
  }

  function handleLoadedMetadata() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    setVideoMeta({
      duration: video.duration || 0,
      width: video.videoWidth || 16,
      height: video.videoHeight || 9
    });
  }

  function resetAnalysis() {
    analysisRunRef.current += 1;
    setRawShots([]);
    setProgress(0);
    setAnalysisError("");
    setStatus(videoSource ? "Video scorer reset." : "Video scorer ready.");
  }

  async function analyzeVideo() {
    const video = videoRef.current;
    const canvas = analysisCanvasRef.current;

    if (!videoSource || !video || !canvas || !Number.isFinite(video.duration) || video.duration <= 0) {
      setAnalysisError("Load a playable target video.");
      return;
    }

    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      setAnalysisError("Canvas analysis is unavailable in this browser.");
      return;
    }

    const runId = analysisRunRef.current + 1;
    analysisRunRef.current = runId;
    const scale = Math.min(1, maxAnalysisWidth / Math.max(video.videoWidth, 1));
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const duration = video.duration;
    const sampleInterval = 1 / Math.max(config.sampleRateFps, 1);
    let workingShots = [];

    setIsAnalyzing(true);
    setRawShots([]);
    setProgress(0);
    setAnalysisError("");
    setStatus("Analyzing target video.");

    try {
      video.pause();
      await seekVideo(video, Math.min(0.05, duration));
      let previousFrame = drawFrame(video, canvas, context);
      let lastUiUpdate = 0;

      for (let time = Math.max(sampleInterval, 0.08); time <= duration; time += sampleInterval) {
        if (analysisRunRef.current !== runId) {
          return;
        }

        await seekVideo(video, Math.min(time, duration));
        const currentFrame = drawFrame(video, canvas, context);
        const candidates = detectImpactCandidates(currentFrame, previousFrame, config);
        const newShots = selectNewImpactCandidates(candidates, workingShots, config).map((candidate) => ({
          ...candidate,
          videoSeconds: time
        }));

        if (newShots.length > 0) {
          workingShots = [...workingShots, ...newShots].sort((a, b) => a.videoSeconds - b.videoSeconds);
          setRawShots([...workingShots]);
        }

        previousFrame = currentFrame;

        if (time - lastUiUpdate >= 0.5 || time + sampleInterval >= duration) {
          setProgress(time / duration);
          setStatus(`Analyzing ${formatClock(time)} / ${formatClock(duration)}`);
          lastUiUpdate = time;
          await waitForUi();
        }
      }

      if (analysisRunRef.current !== runId) {
        return;
      }

      setRawShots([...workingShots]);
      setProgress(1);
      setStatus(workingShots.length > 0 ? `${workingShots.length} impacts scored.` : "No impacts detected.");

      if (workingShots[0]) {
        await seekVideo(video, workingShots[0].videoSeconds);
      }
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Video analysis failed.");
    } finally {
      if (analysisRunRef.current === runId) {
        setIsAnalyzing(false);
      }
    }
  }

  function exportCsv() {
    if (scoredShots.length === 0) {
      return;
    }

    const rows = [
      ["shot", "game_time_seconds", "video_time_seconds", "score", "zone", "confidence", "x_percent", "y_percent"],
      ...scoredShots.map((shot) => [
        shot.id,
        shot.gameSeconds.toFixed(3),
        shot.videoSeconds.toFixed(3),
        shot.score,
        shot.zone,
        shot.confidence,
        shot.xPercent.toFixed(3),
        shot.yPercent.toFixed(3)
      ])
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `level-up-live-lane-${selectedLane}-autoscore.csv`;
    link.click();
    URL.revokeObjectURL(url);
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

        <div className="autoscore-video-shell">
          {videoSource ? (
            <video
              ref={videoRef}
              className="autoscore-video"
              src={videoSource}
              controls
              muted
              playsInline
              onLoadedMetadata={handleLoadedMetadata}
            />
          ) : (
            <div className="autoscore-empty-feed">
              <Camera size={36} />
              <strong>No video loaded</strong>
            </div>
          )}
          <TargetCalibrationOverlay config={config} shots={scoredShots} videoMeta={videoMeta} />
        </div>

        <canvas ref={analysisCanvasRef} className="autoscore-analysis-canvas" aria-hidden="true" />

        <div className="autoscore-actions">
          <label className="secondary-action autoscore-file-button">
            <FileVideo size={20} />
            <span>{fileName ? "Replace Video" : "Load Video"}</span>
            <input type="file" accept="video/*,.mov,.mp4" onChange={handleVideoFile} />
          </label>
          <button className="primary-action" type="button" onClick={analyzeVideo} disabled={!videoSource || isAnalyzing}>
            <Play size={20} />
            {isAnalyzing ? "Analyzing" : "Analyze"}
          </button>
          <button className="secondary-action" type="button" onClick={resetAnalysis} disabled={isAnalyzing && rawShots.length === 0}>
            <RotateCcw size={19} />
            Reset
          </button>
          <button className="secondary-action" type="button" onClick={exportCsv} disabled={scoredShots.length === 0}>
            <Download size={19} />
            CSV
          </button>
        </div>

        <div className="autoscore-progress" aria-label="Analysis progress">
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
            <strong>{firstImpact && lastImpact ? `${formatClock(firstImpact.gameSeconds)} - ${formatClock(lastImpact.gameSeconds)}` : "--"}</strong>
          </div>
        </div>

        <div className="panel autoscore-calibration-panel">
          <div className="panel-heading compact-heading">
            <div>
              <div className="eyebrow">Calibration</div>
              <h2>Target Map</h2>
            </div>
            <SlidersHorizontal size={20} />
          </div>

          <div className="autoscore-ring-key" aria-label="Scoring rings">
            {SCORING_RINGS.map((ring) => (
              <span key={ring.score}>
                {ring.label}
              </span>
            ))}
          </div>

          <div className="autoscore-control-grid">
            <RangeControl label="Center X" value={config.targetCenterX} min={20} max={80} step={0.5} suffix="%" onChange={(value) => updateConfig("targetCenterX", value)} />
            <RangeControl label="Center Y" value={config.targetCenterY} min={20} max={80} step={0.5} suffix="%" onChange={(value) => updateConfig("targetCenterY", value)} />
            <RangeControl label="Radius" value={config.targetRadius} min={18} max={58} step={0.5} suffix="%" onChange={(value) => updateConfig("targetRadius", value)} />
            <RangeControl label="Sensitivity" value={config.sensitivity} min={16} max={70} step={1} onChange={(value) => updateConfig("sensitivity", value)} />
            <RangeControl label="Frame Rate" value={config.sampleRateFps} min={4} max={24} step={1} suffix=" fps" onChange={(value) => updateConfig("sampleRateFps", value)} />
            <RangeControl label="First Hit" value={config.startOffsetSeconds} min={0} max={3} step={0.05} suffix=" s" onChange={(value) => updateConfig("startOffsetSeconds", value)} />
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

function TargetCalibrationOverlay({ config, shots, videoMeta }) {
  const minDimension = Math.min(videoMeta.width || 1, videoMeta.height || 1);
  const radiusX = (config.targetRadius * minDimension) / Math.max(videoMeta.width, 1);
  const radiusY = (config.targetRadius * minDimension) / Math.max(videoMeta.height, 1);

  return (
    <div className="autoscore-target-overlay" aria-hidden="true">
      {SCORING_RINGS.map((ring) => (
        <span
          key={ring.score}
          className={`autoscore-overlay-ring ring-score-${ring.score}`}
          style={{
            left: `${config.targetCenterX}%`,
            top: `${config.targetCenterY}%`,
            width: `${radiusX * ring.radius * 2}%`,
            height: `${radiusY * ring.radius * 2}%`
          }}
        />
      ))}
      <span
        className="autoscore-overlay-center"
        style={{ left: `${config.targetCenterX}%`, top: `${config.targetCenterY}%` }}
      />
      {shots.map((shot) => (
        <span
          key={`${shot.id}-${shot.xPercent}-${shot.yPercent}`}
          className="autoscore-overlay-hit"
          style={{ left: `${shot.xPercent}%`, top: `${shot.yPercent}%`, "--hit-color": getShotColor(shot.score) }}
        >
          {shot.score}
        </span>
      ))}
    </div>
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

function RangeControl({ label, value, min, max, step, suffix = "", onChange }) {
  return (
    <label className="autoscore-range-control">
      <span>
        <b>{label}</b>
        <strong>{value}{suffix}</strong>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function getShotColor(score) {
  if (score >= 10) return "#25f46d";
  if (score >= 9) return "#8affac";
  if (score >= 8) return "#fbf35d";
  if (score >= 7) return "#ffb84d";
  if (score >= 6) return "#32a7ff";
  return "#ff6b6b";
}

function drawFrame(video, canvas, context) {
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function seekVideo(video, targetSeconds) {
  const target = Math.max(0, Math.min(targetSeconds, Math.max(video.duration - 0.02, 0)));

  if (Math.abs(video.currentTime - target) < 0.004 && video.readyState >= 2) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Video seek timed out."));
    }, 7000);

    function cleanup() {
      window.clearTimeout(timeout);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("error", handleError);
    }

    function handleSeeked() {
      cleanup();
      resolve();
    }

    function handleError() {
      cleanup();
      reject(new Error("Video could not be decoded."));
    }

    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("error", handleError);
    video.currentTime = target;
  });
}

function waitForUi() {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}
