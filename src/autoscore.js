export const DEFAULT_AUTOSCORE_CONFIG = {
  sampleRateFps: 10,
  sensitivity: 34,
  darkLimit: 174,
  minClusterPixels: 8,
  maxClusterPixels: 1600,
  duplicateDistancePercent: 3.8,
  targetCenterX: 50,
  targetCenterY: 50,
  targetRadius: 42,
  startOffsetSeconds: 1
};

export const SCORING_RINGS = [
  { score: 10, label: "10", radius: 0.16 },
  { score: 9, label: "9", radius: 0.32 },
  { score: 8, label: "8", radius: 0.5 },
  { score: 7, label: "7", radius: 0.68 },
  { score: 6, label: "6", radius: 0.86 }
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
  const dx = impact.xPercent - config.targetCenterX;
  const dy = impact.yPercent - config.targetCenterY;
  const distancePercent = Math.hypot(dx, dy);
  const normalizedRadius = distancePercent / Math.max(config.targetRadius, 1);
  const ring = SCORING_RINGS.find((item) => normalizedRadius <= item.radius);

  return {
    score: ring?.score ?? 0,
    zone: ring?.label ?? "Miss",
    normalizedRadius
  };
}

export function deriveScoredShots(rawShots, config = DEFAULT_AUTOSCORE_CONFIG) {
  const firstImpactSeconds = rawShots[0]?.videoSeconds ?? null;

  return rawShots.map((shot, index) => {
    const score = scoreImpactPosition(shot, config);
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

function toGray(red, green, blue) {
  return red * 0.299 + green * 0.587 + blue * 0.114;
}
