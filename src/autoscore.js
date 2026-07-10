export const DEFAULT_AUTOSCORE_CONFIG = {
  sampleRateFps: 12,
  sensitivity: 34,
  darkLimit: 174,
  minClusterPixels: 8,
  maxClusterPixels: 360,
  minConfidence: 72,
  duplicateDistancePercent: 5.8,
  targetCenterX: 50,
  targetCenterY: 58,
  targetRadius: 31,
  targetYScale: 0.58,
  startOffsetSeconds: 1
};

export const SCORING_RINGS = [
  { score: 20, label: "20 LEA" },
  { score: 15, label: "15" },
  { score: 10, label: "10" },
  { score: 5, label: "5" }
];

export function formatClock(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) {
    return "--";
  }

  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds - minutes * 60;

  if (minutes <= 0) {
    return `${seconds.toFixed(2)}s`;
  }

  return `${minutes}:${seconds.toFixed(2).padStart(5, "0")}`;
}

export function scoreImpactPosition(impact, config = DEFAULT_AUTOSCORE_CONFIG) {
  const radiusX = Math.max(config.targetRadius, 1);
  const radiusY = Math.max(radiusX * (config.targetYScale ?? DEFAULT_AUTOSCORE_CONFIG.targetYScale), 1);
  const nx = (impact.xPercent - config.targetCenterX) / radiusX;
  const ny = (impact.yPercent - config.targetCenterY) / radiusY;
  const normalizedRadius = Math.hypot(nx, ny);

  if (normalizedRadiusTo({ x: nx, y: ny }, { x: 0.72, y: 0.9 }) <= 0.24) {
    return {
      score: 20,
      zone: "LEA 20",
      normalizedRadius
    };
  }

  if (pointInPolygon(nx, ny, greenTenZone)) {
    return {
      score: 10,
      zone: "10 triangle",
      normalizedRadius
    };
  }

  if (pointInPolygon(nx, ny, upperFifteenZone) || pointInPolygon(nx, ny, lowerFifteenZone)) {
    return {
      score: 15,
      zone: "15 zone",
      normalizedRadius
    };
  }

  if (normalizedRadius <= 1.05) {
    return {
      score: 5,
      zone: "5 blue",
      normalizedRadius
    };
  }

  return {
    score: 0,
    zone: "Miss",
    normalizedRadius
  };
}

export function deriveScoredShots(rawShots, config = DEFAULT_AUTOSCORE_CONFIG) {
  const firstImpactSeconds = rawShots[0]?.videoSeconds ?? null;

  return rawShots.map((shot, index) => {
    const score = Number.isFinite(shot.scoreOverride)
      ? {
          score: shot.scoreOverride,
          zone: shot.zoneOverride ?? `${shot.scoreOverride} zone`,
          normalizedRadius: null
        }
      : scoreImpactPosition(shot, config);
    return {
      ...shot,
      ...score,
      id: index + 1,
      gameSeconds:
        firstImpactSeconds === null
          ? config.startOffsetSeconds
          : shot.videoSeconds - firstImpactSeconds + config.startOffsetSeconds
    };
  });
}

export function getScoreSummary(scoredShots) {
  const totalScore = scoredShots.reduce((sum, shot) => sum + shot.score, 0);
  const confidence =
    scoredShots.length === 0
      ? 0
      : Math.round(scoredShots.reduce((sum, shot) => sum + shot.confidence, 0) / scoredShots.length);

  return {
    totalScore,
    shotCount: scoredShots.length,
    confidence
  };
}

export function detectImpactCandidates(currentFrame, previousFrame, config = DEFAULT_AUTOSCORE_CONFIG) {
  if (!currentFrame || !previousFrame || currentFrame.width !== previousFrame.width || currentFrame.height !== previousFrame.height) {
    return [];
  }

  const { width, height } = currentFrame;
  const currentData = currentFrame.data;
  const previousData = previousFrame.data;
  const pixelCount = width * height;
  const mask = new Uint8Array(pixelCount);
  const visited = new Uint8Array(pixelCount);
  const centerX = (config.targetCenterX / 100) * width;
  const centerY = (config.targetCenterY / 100) * height;
  const targetRadiusPx = (config.targetRadius / 100) * Math.min(width, height);
  const roiRadius = targetRadiusPx * 1.1;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const targetDx = x - centerX;
      const targetDy = y - centerY;

      if (Math.hypot(targetDx, targetDy) > roiRadius) {
        continue;
      }

      const pixelIndex = y * width + x;
      const dataIndex = pixelIndex * 4;
      const currentGray = toGray(currentData[dataIndex], currentData[dataIndex + 1], currentData[dataIndex + 2]);
      const previousGray = toGray(previousData[dataIndex], previousData[dataIndex + 1], previousData[dataIndex + 2]);
      const darkDrop = previousGray - currentGray;

      if (darkDrop >= config.sensitivity && currentGray <= config.darkLimit) {
        mask[pixelIndex] = 1;
      }
    }
  }

  const candidates = [];
  const stack = [];

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    if (!mask[pixelIndex] || visited[pixelIndex]) {
      continue;
    }

    let area = 0;
    let sumX = 0;
    let sumY = 0;
    let sumDrop = 0;
    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;

    stack.length = 0;
    stack.push(pixelIndex);
    visited[pixelIndex] = 1;

    while (stack.length > 0) {
      const currentIndex = stack.pop();
      const x = currentIndex % width;
      const y = Math.floor(currentIndex / width);
      const dataIndex = currentIndex * 4;
      const currentGray = toGray(currentData[dataIndex], currentData[dataIndex + 1], currentData[dataIndex + 2]);
      const previousGray = toGray(previousData[dataIndex], previousData[dataIndex + 1], previousData[dataIndex + 2]);

      area += 1;
      sumX += x;
      sumY += y;
      sumDrop += Math.max(previousGray - currentGray, 0);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      pushNeighbor(currentIndex - 1);
      pushNeighbor(currentIndex + 1);
      pushNeighbor(currentIndex - width);
      pushNeighbor(currentIndex + width);
    }

    const boxWidth = maxX - minX + 1;
    const boxHeight = maxY - minY + 1;
    const density = area / Math.max(boxWidth * boxHeight, 1);
    const aspect = boxWidth / Math.max(boxHeight, 1);
    const averageDrop = sumDrop / Math.max(area, 1);

    if (
      area >= config.minClusterPixels &&
      area <= config.maxClusterPixels &&
      density >= 0.18 &&
      aspect >= 0.28 &&
      aspect <= 3.5
    ) {
      candidates.push({
        xPercent: (sumX / area / width) * 100,
        yPercent: (sumY / area / height) * 100,
        area,
        confidence: Math.min(99, Math.round(50 + averageDrop * 0.55 + Math.min(area, 120) * 0.08 + density * 12))
      });
    }
  }

  return candidates.sort((a, b) => b.confidence - a.confidence);

  function pushNeighbor(nextIndex) {
    if (nextIndex < 0 || nextIndex >= pixelCount || visited[nextIndex] || !mask[nextIndex]) {
      return;
    }

    visited[nextIndex] = 1;
    stack.push(nextIndex);
  }
}

export function selectNewImpactCandidates(candidates, existingShots, config = DEFAULT_AUTOSCORE_CONFIG) {
  const accepted = [];
  const sortedCandidates = [...candidates].sort((a, b) => b.confidence - a.confidence);

  for (const candidate of sortedCandidates) {
    if (candidate.confidence < (config.minConfidence ?? DEFAULT_AUTOSCORE_CONFIG.minConfidence)) {
      continue;
    }

    if (scoreImpactPosition(candidate, config).score <= 0) {
      continue;
    }

    const isDuplicate = [...existingShots, ...accepted].some((shot) => {
      const distance = Math.hypot(candidate.xPercent - shot.xPercent, candidate.yPercent - shot.yPercent);
      return distance < config.duplicateDistancePercent;
    });

    if (!isDuplicate) {
      accepted.push(candidate);
    }
  }

  return accepted;
}

const greenTenZone = [
  { x: 0, y: -0.98 },
  { x: -0.62, y: 0.55 },
  { x: 0.64, y: 0.55 }
];

const upperFifteenZone = [
  { x: 0.18, y: -0.78 },
  { x: 0.82, y: -0.98 },
  { x: 1.08, y: -0.35 },
  { x: 0.42, y: 0.18 }
];

const lowerFifteenZone = [
  { x: -1.08, y: 0.32 },
  { x: -0.48, y: -0.32 },
  { x: 0.2, y: 0.45 },
  { x: -0.4, y: 1.08 }
];

function normalizedRadiusTo(point, center) {
  return Math.hypot(point.x - center.x, point.y - center.y);
}

function pointInPolygon(x, y, polygon) {
  let isInside = false;

  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current, current += 1) {
    const currentPoint = polygon[current];
    const previousPoint = polygon[previous];
    const intersects =
      currentPoint.y > y !== previousPoint.y > y &&
      x < ((previousPoint.x - currentPoint.x) * (y - currentPoint.y)) / (previousPoint.y - currentPoint.y) + currentPoint.x;

    if (intersects) {
      isInside = !isInside;
    }
  }

  return isInside;
}

function toGray(red, green, blue) {
  return red * 0.299 + green * 0.587 + blue * 0.114;
}
