import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BadgeCheck,
  BarChart3,
  Bluetooth,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Crown,
  Crosshair,
  Gauge,
  Gamepad2,
  Headphones,
  Medal,
  MonitorPlay,
  Play,
  Radio,
  Save,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Trophy,
  UserRound,
  UsersRound,
  X,
  Zap
} from "lucide-react";
import CameraAutoScoring from "./CameraAutoScoring.jsx";
import "./styles.css";

const brandLogoSrc = "/assets/logos/LUL_secondary_marks-6.png";
const brandTextLogoSrc = "/assets/logos/LUL_logo_no%20icon%20horizontal-1.png";
const actionTargetLogoSrc = "/assets/logos/action-target-white-logo.svg";
const homeBackgroundSrc = "/assets/backgrounds/action-target-range.jpg";
const sessionDurationSeconds = 60 * 60;

function formatSessionTimer(totalSeconds) {
  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function parseSessionTimer(value) {
  const [minutes = "60", seconds = "0"] = String(value).split(":");
  const parsedMinutes = Number.parseInt(minutes, 10);
  const parsedSeconds = Number.parseInt(seconds, 10);

  if (Number.isNaN(parsedMinutes) || Number.isNaN(parsedSeconds)) {
    return sessionDurationSeconds;
  }

  return Math.max(parsedMinutes * 60 + parsedSeconds, 0);
}

const customers = [
  {
    id: "alex",
    name: "Alex Carter",
    username: "@alex.carter",
    avatar: "AC",
    avatarImage: "/assets/profiles/alex-carter.svg",
    rank: "Sharpshooter II",
    xp: 18420,
    nextRankXp: 21000,
    recentScore: 472,
    monthlyPosition: 3,
    badges: ["Tight Group", "Lane Champion", "90% Accuracy Club"],
    friends: ["Jordan Lee", "Sam Rivera", "Morgan Blake"],
    accent: "#25f46d"
  },
  {
    id: "jordan",
    name: "Jordan Lee",
    username: "@jlee.range",
    avatar: "JL",
    avatarImage: "/assets/profiles/jordan-lee.svg",
    rank: "Marksman Elite",
    xp: 16280,
    nextRankXp: 19000,
    recentScore: 456,
    monthlyPosition: 7,
    badges: ["Fast Hands", "First Drill Complete", "Perfect String"],
    friends: ["Alex Carter", "Sam Rivera"],
    accent: "#32a7ff"
  },
  {
    id: "sam",
    name: "Sam Rivera",
    username: "@sam.rivera",
    avatar: "SR",
    avatarImage: "/assets/profiles/sam-rivera.svg",
    rank: "Competitor I",
    xp: 22110,
    nextRankXp: 25000,
    recentScore: 481,
    monthlyPosition: 2,
    badges: ["League Qualifier", "Tight Group", "Ring Race MVP"],
    friends: ["Alex Carter", "Jordan Lee"],
    accent: "#fbf35d"
  },
  {
    id: "morgan",
    name: "Morgan Blake",
    username: "@morgan.blake",
    avatar: "MB",
    avatarImage: "/assets/profiles/morgan-blake.svg",
    rank: "Defender III",
    xp: 13640,
    nextRankXp: 16500,
    recentScore: 441,
    monthlyPosition: 11,
    badges: ["Reload Ready", "Fast Hands", "First Drill Complete"],
    friends: ["Alex Carter"],
    accent: "#ff7bc6"
  },
  {
    id: "taylor",
    name: "Taylor Reed",
    username: "@taylor.reed",
    avatar: "TR",
    avatarImage: "/assets/profiles/taylor-reed.svg",
    rank: "Range Ready II",
    xp: 9820,
    nextRankXp: 12000,
    recentScore: 428,
    monthlyPosition: 18,
    badges: ["First Drill Complete", "Reload Ready"],
    friends: ["Alex Carter", "Sam Rivera"],
    accent: "#8bff72"
  },
  {
    id: "riley",
    name: "Riley Chen",
    username: "@riley.chen",
    avatar: "RC",
    avatarImage: "/assets/profiles/riley-chen.svg",
    rank: "Precision I",
    xp: 11490,
    nextRankXp: 14500,
    recentScore: 439,
    monthlyPosition: 14,
    badges: ["First Drill Complete", "Tight Group"],
    friends: ["Jordan Lee", "Morgan Blake"],
    accent: "#7d8cff"
  }
];

const initialLanes = [
  { lane: 1, status: "Available", customerId: null },
  { lane: 2, status: "Waiting", customerId: null },
  { lane: 3, status: "In Game", customerId: "alex" },
  { lane: 4, status: "Occupied", customerId: "jordan" },
  { lane: 5, status: "Occupied", customerId: "sam" },
  { lane: 6, status: "Available", customerId: null },
  { lane: 7, status: "Waiting", customerId: "morgan" },
  { lane: 8, status: "Available", customerId: null }
];

const programCategories = ["Drills", "Skills", "Games", "Leagues", "Training", "Custom"];

const drills = [
  {
    id: "five-by-five-check",
    name: "Triples",
    category: "Drills",
    difficulty: "Beginner",
    time: "6 min",
    rounds: 6,
    description: "Two clean 3-shot strings with a reload between strings.",
    instructions: "Fire 3 rounds, reload when prompted, then fire the final 3-round string.",
    behavior: "Target stays at 7 yards and holds face-on through both strings while the camera confirms score.",
    scoring: "Each shot is worth up to 10 points. Reload time is tracked between shot 3 and shot 4."
  },
  {
    id: "dot-grid-warmup",
    name: "Dot Grid Warmup",
    category: "Drills",
    difficulty: "Beginner",
    time: "7 min",
    rounds: 30,
    description: "Small-dot accuracy work using six scoring dots.",
    behavior: "Target holds at 3 yards, advances to 5 yards halfway through, then pauses for scoring.",
    scoring: "Dots score by ring value. Missed dots reset the streak multiplier."
  },
  {
    id: "slow-fire-precision",
    name: "Slow Fire Precision",
    category: "Drills",
    difficulty: "Beginner",
    time: "8 min",
    rounds: 20,
    description: "Measured bullseye-style strings for sight picture and trigger control.",
    behavior: "Target remains fixed at 10 yards with long scoring windows between strings.",
    scoring: "10 points for the center ring, 8 for inner ring, 5 for outer hits. Grouping bonus applies under 2.5 in."
  },
  {
    id: "trigger-press-tuneup",
    name: "Trigger Press Tune-Up",
    category: "Skills",
    difficulty: "Skill",
    time: "6 min",
    rounds: 18,
    description: "Short strings that reward smooth trigger press and low movement.",
    behavior: "Target alternates between 3 and 7 yards with a pause after every three shots.",
    scoring: "Scores combine ring value and group drift from the expected center."
  },
  {
    id: "sight-reset-ladder",
    name: "Sight Reset Ladder",
    category: "Skills",
    difficulty: "Skill",
    time: "7 min",
    rounds: 24,
    description: "Cadence ladder for returning to the same sight picture between shots.",
    behavior: "Target faces for timed strings at 5, 7, and 10 yards.",
    scoring: "Ring value and split consistency determine the final skill score."
  },
  {
    id: "cadence-control",
    name: "Cadence Control",
    category: "Skills",
    difficulty: "Intermediate",
    time: "8 min",
    rounds: 30,
    description: "Audio-paced strings that reward steady timing and consistent grouping.",
    behavior: "Lane audio calls the shot pace while the target remains at 7 yards.",
    scoring: "Points come from ring value, group size, and staying within the called cadence."
  },
  {
    id: "accuracy-streak",
    name: "Accuracy Streak",
    category: "Games",
    difficulty: "Beginner",
    time: "8 min",
    rounds: 25,
    description: "Build a streak by keeping consecutive hits inside the scoring rings.",
    behavior: "Target slowly increases distance when the shooter maintains a streak.",
    scoring: "Streak multiplier grows after every five consecutive high-value hits."
  },
  {
    id: "steel-plate-sprint",
    name: "Steel Plate Sprint",
    category: "Games",
    difficulty: "Competitive",
    time: "9 min",
    rounds: 30,
    description: "Fast plate-order game using neutral steel-style target zones.",
    behavior: "Lane screen calls the plate order while the target carrier cycles distance.",
    scoring: "Time plus hit confirmation determines the stage score."
  },
  {
    id: "ring-race",
    name: "Ring Race",
    category: "Games",
    difficulty: "Social",
    time: "10 min",
    rounds: 24,
    description: "Linked lanes race for the highest ring-value total.",
    behavior: "All invited lanes receive synced prompts and identical target distances.",
    scoring: "Highest score wins, ties break by smallest group size."
  },
  {
    id: "lake-erie-weekly",
    name: "Lake Erie Weekly",
    category: "Leagues",
    difficulty: "League",
    time: "12 min",
    rounds: 40,
    description: "Weekly league course with automatic standings updates.",
    behavior: "Target moves through certified distances with locked sequence timing.",
    scoring: "Official league score is calculated from ring value, penalties, and stage time."
  },
  {
    id: "precision-ladder-qualifier",
    name: "Precision Ladder Qualifier",
    category: "Leagues",
    difficulty: "League",
    time: "10 min",
    rounds: 30,
    description: "Distance ladder for league placement and monthly ranking.",
    behavior: "Target steps from 5 to 25 yards as strings are completed.",
    scoring: "Score combines total points, distance reached, and group size."
  },
  {
    id: "bullseye-300",
    name: "Bullseye 300",
    category: "Leagues",
    difficulty: "League",
    time: "14 min",
    rounds: 30,
    description: "Classic slow, timed, and rapid ring-scoring format.",
    behavior: "Target presents slow-fire, timed-fire, and rapid-fire windows.",
    scoring: "Thirty shots are scored up to 300 points."
  },
  {
    id: "train-with-matt",
    name: "Train with Matt",
    category: "Training",
    difficulty: "Coach",
    time: "45 min",
    rounds: 50,
    description: "Fundamentals session for steady grip, repeatable sight picture, and clean strings.",
    regimens: ["5-yard baseline", "Slow-fire groups", "Weekly prep"],
    instructions: "Matt's training plan starts with a 5-yard baseline, then builds into slow-fire groups and a final scored string.",
    behavior: "Target starts at 5 yards, holds for coached strings, then moves to 7 yards for the final review.",
    scoring: "Scores track group size, ring value, and improvement from the opening baseline."
  },
  {
    id: "train-with-clem",
    name: "Train with Clem",
    category: "Training",
    difficulty: "Coach",
    time: "40 min",
    rounds: 45,
    description: "Data-focused accuracy work using dot grids, lane scoring, and replay review.",
    regimens: ["Dot-grid accuracy", "Score review", "League tune-up"],
    instructions: "Clem's plan runs dot-grid accuracy, reviews camera scoring after each block, and ends with a league-style tune-up.",
    behavior: "Target alternates between 3, 5, and 10 yards with scoring pauses after each block.",
    scoring: "Scores combine ring value, dot hits, group size, and consistency across distances."
  },
  {
    id: "train-with-hillary",
    name: "Train with Hillary",
    category: "Training",
    difficulty: "Coach",
    time: "35 min",
    rounds: 40,
    description: "Confidence-building session with guided cadence and visible progress targets.",
    regimens: ["Cadence ladder", "Sight reset", "Confidence builder"],
    instructions: "Hillary's plan uses guided cadence, short sight-reset strings, and a final progress check.",
    behavior: "Target holds at 5 yards for warmup, then moves to 7 and 10 yards as the cadence changes.",
    scoring: "Scores reward hit quality, steady pace, and fewer outliers each round."
  },
  {
    id: "train-with-tom",
    name: "Train with Tom",
    category: "Training",
    difficulty: "Coach",
    time: "45 min",
    rounds: 60,
    description: "Timed target-control session for plate rhythm, transitions, and repeatable pacing.",
    regimens: ["Plate rhythm", "Timed strings", "Transition tracking"],
    instructions: "Tom's plan uses timed strings and neutral plate zones to build rhythm and controlled transitions.",
    behavior: "Target faces for short timed windows, edges between strings, and changes distance after each block.",
    scoring: "Scores combine confirmed hits, timing consistency, and recovery between target zones."
  },
  {
    id: "train-with-jian",
    name: "Train with Jian",
    category: "Training",
    difficulty: "Coach",
    time: "50 min",
    rounds: 55,
    description: "Analytics-heavy coaching with distance ladders and camera-assisted grouping review.",
    regimens: ["Grouping analysis", "Distance ladder", "Camera review"],
    instructions: "Jian's plan builds from a close baseline into a distance ladder, then uses camera scoring to review grouping trends.",
    behavior: "Target steps from 3 to 25 yards with scoring freezes between each distance.",
    scoring: "Scores track group size, inferred pass-throughs, distance reached, and point totals."
  },
  {
    id: "train-with-jim",
    name: "Train with Jim",
    category: "Training",
    difficulty: "Coach",
    time: "40 min",
    rounds: 45,
    description: "Classic precision session for breathing cadence, bullseye basics, and clean follow-through.",
    regimens: ["Bullseye basics", "Breathing cadence", "Precision ladder"],
    instructions: "Jim's plan focuses on breathing cadence, bullseye fundamentals, and a final precision ladder.",
    behavior: "Target holds at 10 yards for precision blocks, then advances and returns for comparison groups.",
    scoring: "Scores emphasize ring value, group size, and consistency between the first and final blocks."
  },
  {
    id: "build-your-own",
    name: "Build Your Own",
    category: "Custom",
    difficulty: "Custom",
    time: "Variable",
    rounds: 20,
    description: "Create a range program from distance, time, round count, and scoring presets.",
    behavior: "Staff or player selects distance steps, target timing, and scoring rules.",
    scoring: "Scoring follows the selected template."
  },
  {
    id: "coach-program",
    name: "Coach Program",
    category: "Custom",
    difficulty: "Custom",
    time: "Variable",
    rounds: 30,
    description: "Load a coach-created program for a class, event, or private lesson.",
    behavior: "Target behavior follows the saved coach template.",
    scoring: "Results save to the player profile and class roster."
  }
];

const weeklyChallenge = {
  id: "five-by-five-check",
  title: "Weekly Challenge",
  name: "Triples Clean Run",
  meta: "7 yards • 6 rounds • Ring score + reload time",
  prize: "Top 10 post to the Lake Erie Arms weekly board"
};

const achievements = [
  "Tight Group",
  "First Drill Complete",
  "Lane Champion",
  "90% Accuracy Club",
  "Fast Hands",
  "Perfect String"
];

const audioDevices = ["Walker Razor BT", "AirPods Pro", "Howard Leight Sync", "JBL Range Headset"];
const spokenPrompts = [
  "Shooter ready.",
  "Stand by.",
  "Fire 3 rounds.",
  "Target moving.",
  "Reload if needed.",
  "Final string."
];

const targetDistanceOptions = [3, 5, 7, 10, 15, 20, 25, 30, 35, 40, 45, 50];
const laneCompetitors = [
  { lane: 3, name: "Alex Carter", status: "Ready", score: 487, accuracy: 95 },
  { lane: 4, name: "Jordan Lee", status: "Ready", score: 468, accuracy: 91 },
  { lane: 5, name: "Sam Rivera", status: "Invited", score: 481, accuracy: 93 },
  { lane: 6, name: "Open", status: "Open", score: 0, accuracy: 0 },
  { lane: 7, name: "Morgan Blake", status: "Waiting", score: 452, accuracy: 88 }
];
const defaultCompetitorLanes = [3, 4, 5];

const visibleShots = [
  { id: 1, x: 50, y: 49, score: 10, firedAt: "00:00.72", elapsedSeconds: 0.72 },
  { id: 2, x: 44, y: 51, score: 9, firedAt: "00:01.08", elapsedSeconds: 1.08 },
  { id: 3, x: 59, y: 45, score: 8, firedAt: "00:01.46", elapsedSeconds: 1.46 },
  { id: 4, x: 52, y: 58, score: 9, firedAt: "00:04.92", elapsedSeconds: 4.92 },
  { id: 5, x: 64, y: 53, score: 7, firedAt: "00:05.30", elapsedSeconds: 5.3 },
  { id: 6, x: 39, y: 60, score: 6, firedAt: "00:05.67", elapsedSeconds: 5.67 }
];

const scoreRunsByCustomerId = {
  alex: visibleShots,
  jordan: [
    { id: 1, x: 48, y: 50, score: 9, firedAt: "00:00.69", elapsedSeconds: 0.69 },
    { id: 2, x: 55, y: 48, score: 8, firedAt: "00:01.03", elapsedSeconds: 1.03 },
    { id: 3, x: 46, y: 56, score: 7, firedAt: "00:01.39", elapsedSeconds: 1.39 },
    { id: 4, x: 54, y: 53, score: 9, firedAt: "00:04.57", elapsedSeconds: 4.57 },
    { id: 5, x: 58, y: 47, score: 8, firedAt: "00:04.93", elapsedSeconds: 4.93 },
    { id: 6, x: 63, y: 55, score: 7, firedAt: "00:05.28", elapsedSeconds: 5.28 }
  ],
  sam: [
    { id: 1, x: 49, y: 51, score: 10, firedAt: "00:00.78", elapsedSeconds: 0.78 },
    { id: 2, x: 51, y: 48, score: 10, firedAt: "00:01.15", elapsedSeconds: 1.15 },
    { id: 3, x: 46, y: 52, score: 9, firedAt: "00:01.54", elapsedSeconds: 1.54 },
    { id: 4, x: 53, y: 50, score: 10, firedAt: "00:04.48", elapsedSeconds: 4.48 },
    { id: 5, x: 57, y: 55, score: 8, firedAt: "00:04.86", elapsedSeconds: 4.86 },
    { id: 6, x: 44, y: 46, score: 8, firedAt: "00:05.25", elapsedSeconds: 5.25 }
  ],
  morgan: [
    { id: 1, x: 58, y: 49, score: 8, firedAt: "00:00.83", elapsedSeconds: 0.83 },
    { id: 2, x: 62, y: 55, score: 7, firedAt: "00:01.21", elapsedSeconds: 1.21 },
    { id: 3, x: 47, y: 61, score: 8, firedAt: "00:01.60", elapsedSeconds: 1.6 },
    { id: 4, x: 60, y: 43, score: 7, firedAt: "00:05.65", elapsedSeconds: 5.65 },
    { id: 5, x: 40, y: 56, score: 6, firedAt: "00:06.04", elapsedSeconds: 6.04 },
    { id: 6, x: 53, y: 42, score: 8, firedAt: "00:06.42", elapsedSeconds: 6.42 }
  ],
  taylor: [
    { id: 1, x: 51, y: 47, score: 9, firedAt: "00:00.76", elapsedSeconds: 0.76 },
    { id: 2, x: 56, y: 52, score: 8, firedAt: "00:01.11", elapsedSeconds: 1.11 },
    { id: 3, x: 45, y: 55, score: 8, firedAt: "00:01.51", elapsedSeconds: 1.51 },
    { id: 4, x: 52, y: 44, score: 9, firedAt: "00:04.72", elapsedSeconds: 4.72 },
    { id: 5, x: 60, y: 57, score: 7, firedAt: "00:05.14", elapsedSeconds: 5.14 },
    { id: 6, x: 48, y: 61, score: 7, firedAt: "00:05.53", elapsedSeconds: 5.53 }
  ],
  riley: [
    { id: 1, x: 49, y: 50, score: 10, firedAt: "00:00.71", elapsedSeconds: 0.71 },
    { id: 2, x: 53, y: 47, score: 9, firedAt: "00:01.09", elapsedSeconds: 1.09 },
    { id: 3, x: 42, y: 58, score: 7, firedAt: "00:01.48", elapsedSeconds: 1.48 },
    { id: 4, x: 50, y: 55, score: 9, firedAt: "00:04.83", elapsedSeconds: 4.83 },
    { id: 5, x: 57, y: 46, score: 8, firedAt: "00:05.21", elapsedSeconds: 5.21 },
    { id: 6, x: 61, y: 54, score: 7, firedAt: "00:05.62", elapsedSeconds: 5.62 }
  ]
};

function getScoreRunForPlayer(playerId) {
  return scoreRunsByCustomerId[playerId] ?? visibleShots;
}

function getScoreRunTotal(playerId) {
  return getScoreRunForPlayer(playerId).reduce((sum, shot) => sum + shot.score, 0);
}

function getReloadTimeValue(run) {
  if (!run || run.length < 4) {
    return "--";
  }

  return `${(run[3].elapsedSeconds - run[2].elapsedSeconds).toFixed(2)} s`;
}

function getReloadTimeDisplay(run, shotStep, demoRunning) {
  if (shotStep >= 4) {
    return getReloadTimeValue(run);
  }

  if (demoRunning && shotStep === 3) {
    return "Reloading";
  }

  return "--";
}

const recentDrills = [
  { name: "Triples", score: 487, date: "Jul 8, 2026", accuracy: "95%" },
  { name: "Dot Grid Warmup", score: 456, date: "Jul 6, 2026", accuracy: "91%" },
  { name: "Slow Fire Precision", score: 472, date: "Jul 2, 2026", accuracy: "94%" }
];

const leagues = [
  {
    id: "summer",
    name: "Lake Erie Arms Summer League",
    shortName: "Summer League",
    format: "4-week pistol league",
    schedule: "Tuesdays at 6:30 PM",
    registration: "Registration open",
    spots: "8 spots left",
    description: "Weekly scored course with Level Up Live standings after every completed run.",
    standings: [
      {
        rank: 1,
        change: "+1",
        player: "Sam Rivera",
        score: 1928,
        lastDrill: "League Qualifier",
        date: "Jul 8, 2026",
        trend: "up"
      },
      {
        rank: 2,
        change: "-1",
        player: "Alex Carter",
        score: 1904,
        lastDrill: "Triples",
        date: "Jul 8, 2026",
        trend: "down"
      },
      {
        rank: 3,
        change: "+2",
        player: "Jordan Lee",
        score: 1852,
        lastDrill: "Dot Grid Warmup",
        date: "Jul 7, 2026",
        trend: "up"
      },
      {
        rank: 4,
        change: "0",
        player: "Morgan Blake",
        score: 1779,
        lastDrill: "Precision Builder",
        date: "Jul 6, 2026",
        trend: "same"
      },
      {
        rank: 5,
        change: "+3",
        player: "Taylor Reed",
        score: 1714,
        lastDrill: "Steel Challenge Sprint",
        date: "Jul 5, 2026",
        trend: "up"
      }
    ]
  },
  {
    id: "steel-sprint",
    name: "Steel Sprint League",
    shortName: "Steel Sprint",
    format: "Timed steel strings",
    schedule: "Wednesdays at 7:00 PM",
    registration: "Registration open",
    spots: "5 spots left",
    description: "Speed-focused standings built from clean hits, transitions, and stage time.",
    standings: [
      {
        rank: 1,
        change: "+2",
        player: "Alex Carter",
        score: 884,
        lastDrill: "Steel Challenge Sprint",
        date: "Jul 9, 2026",
        trend: "up"
      },
      {
        rank: 2,
        change: "0",
        player: "Taylor Reed",
        score: 861,
        lastDrill: "Plate Rack",
        date: "Jul 9, 2026",
        trend: "same"
      },
      {
        rank: 3,
        change: "-1",
        player: "Sam Rivera",
        score: 844,
        lastDrill: "Bill Drill",
        date: "Jul 8, 2026",
        trend: "down"
      },
      {
        rank: 4,
        change: "+1",
        player: "Morgan Blake",
        score: 821,
        lastDrill: "Accelerator",
        date: "Jul 8, 2026",
        trend: "up"
      }
    ]
  },
  {
    id: "precision",
    name: "Precision Pistol League",
    shortName: "Precision Pistol",
    format: "Accuracy and consistency",
    schedule: "Thursdays at 6:00 PM",
    registration: "Registration open",
    spots: "12 spots left",
    description: "A measured league for slow-fire accuracy, grouping, and repeatable performance.",
    standings: [
      {
        rank: 1,
        change: "0",
        player: "Jordan Lee",
        score: 1476,
        lastDrill: "Slow Fire Precision",
        date: "Jul 9, 2026",
        trend: "same"
      },
      {
        rank: 2,
        change: "+1",
        player: "Sam Rivera",
        score: 1452,
        lastDrill: "Dot Grid Warmup",
        date: "Jul 8, 2026",
        trend: "up"
      },
      {
        rank: 3,
        change: "-1",
        player: "Alex Carter",
        score: 1439,
        lastDrill: "Precision Builder",
        date: "Jul 8, 2026",
        trend: "down"
      },
      {
        rank: 4,
        change: "+2",
        player: "Riley Chen",
        score: 1398,
        lastDrill: "One Hole Drill",
        date: "Jul 7, 2026",
        trend: "up"
      }
    ]
  },
  {
    id: "carry",
    name: "Carry Skills League",
    shortName: "Carry Skills",
    format: "Practical defensive stages",
    schedule: "Saturdays at 10:00 AM",
    registration: "New session forming",
    spots: "16 spots left",
    description: "Practical skill stages with scoring for accuracy, decisions, and controlled speed.",
    standings: [
      {
        rank: 1,
        change: "+1",
        player: "Morgan Blake",
        score: 1218,
        lastDrill: "Draw to First Hit",
        date: "Jul 6, 2026",
        trend: "up"
      },
      {
        rank: 2,
        change: "-1",
        player: "Taylor Reed",
        score: 1195,
        lastDrill: "Failure to Stop",
        date: "Jul 6, 2026",
        trend: "down"
      },
      {
        rank: 3,
        change: "+3",
        player: "Alex Carter",
        score: 1172,
        lastDrill: "Reload Ready",
        date: "Jul 5, 2026",
        trend: "up"
      },
      {
        rank: 4,
        change: "0",
        player: "Jordan Lee",
        score: 1164,
        lastDrill: "Target Transitions",
        date: "Jul 5, 2026",
        trend: "same"
      }
    ]
  }
];

const navItems = [
  { id: "lane", label: "Lane Screen", shortLabel: "Lane", icon: Target },
  { id: "scoring", label: "Live Scoring", shortLabel: "Score", icon: Crosshair },
  { id: "autoscore", label: "Camera Autoscore", shortLabel: "Camera", icon: Camera },
  { id: "profile", label: "Profile", shortLabel: "Player", icon: UserRound },
  { id: "league", label: "League", shortLabel: "League", icon: Trophy }
];

function App() {
  const [screen, setScreen] = useState("lane");
  const [selectedCustomerId, setSelectedCustomerId] = useState("alex");
  const [selectedLane, setSelectedLane] = useState(3);
  const [lanes, setLanes] = useState(initialLanes);
  const [syncEvent, setSyncEvent] = useState("Level Up Live profile connected to Lane 3.");
  const [selectedDrillId, setSelectedDrillId] = useState("five-by-five-check");
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [shotStep, setShotStep] = useState(0);
  const [scoreDemoRunning, setScoreDemoRunning] = useState(false);
  const [scoreView, setScoreView] = useState("live");
  const [scoreParticipantIndex, setScoreParticipantIndex] = useState(0);
  const [laneInviteResponses, setLaneInviteResponses] = useState({});
  const [axisDistance, setAxisDistance] = useState(7);
  const [axisTargetState, setAxisTargetState] = useState("Face");
  const [axisProgramMode, setAxisProgramMode] = useState("Randomized");
  const [axisLightingScene, setAxisLightingScene] = useState("Training Bright");
  const [sessionSeconds, setSessionSeconds] = useState(sessionDurationSeconds);
  const [sessionTimerRunning, setSessionTimerRunning] = useState(true);
  const [axisAlert, setAxisAlert] = useState("Clear");
  const [playerSwitchOpen, setPlayerSwitchOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const activeCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0];
  const activeDrill = drills.find((drill) => drill.id === selectedDrillId) ?? drills[0];

  const partyMembers = useMemo(() => {
    const acceptedMembers = lanes
      .filter((lane) => lane.lane !== selectedLane && laneInviteResponses[lane.lane] === "accepted")
      .map((lane) => {
        const customer = lane.customerId ? customers.find((item) => item.id === lane.customerId) : null;
        return customer ? { lane: lane.lane, player: customer, leader: false } : null;
      })
      .filter(Boolean);

    return [{ lane: selectedLane, player: activeCustomer, leader: true }, ...acceptedMembers];
  }, [activeCustomer, laneInviteResponses, lanes, selectedLane]);
  const isPartyActive = partyMembers.length > 1;

  const scoreParticipants = useMemo(() => {
    if (isPartyActive) {
      return partyMembers;
    }

    const occupiedMembers = lanes
      .filter((lane) => lane.customerId && lane.lane !== selectedLane)
      .map((lane) => {
        const customer = customers.find((item) => item.id === lane.customerId);
        return customer ? { lane: lane.lane, player: customer, leader: false } : null;
      })
      .filter(Boolean);

    return [{ lane: selectedLane, player: activeCustomer, leader: true }, ...occupiedMembers];
  }, [activeCustomer, isPartyActive, lanes, partyMembers, selectedLane]);

  const activeScoreParticipant = scoreParticipants[scoreParticipantIndex] ?? scoreParticipants[0] ?? { lane: selectedLane, player: activeCustomer, leader: true };
  const activeScoreRun = getScoreRunForPlayer(activeScoreParticipant.player.id);
  const shownVisibleShots = activeScoreRun.slice(0, Math.min(shotStep, activeScoreRun.length));
  const allShownShots = shownVisibleShots;
  const totalScore = allShownShots.reduce((sum, shot) => sum + shot.score, 0);
  const shotCount = allShownShots.length;
  const reloadTime = getReloadTimeDisplay(activeScoreRun, shotStep, scoreDemoRunning);
  const axisLaneTimer = formatSessionTimer(sessionSeconds);

  const rankedScoreParticipants = useMemo(
    () =>
      [...scoreParticipants]
        .map((participant) => ({
          ...participant,
          score: getScoreRunTotal(participant.player.id)
        }))
        .sort((a, b) => b.score - a.score),
    [scoreParticipants]
  );

  const currentRank = rankedScoreParticipants.findIndex((participant) => participant.player.id === activeScoreParticipant.player.id) + 1;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPromptIndex((current) => (current + 1) % spokenPrompts.length);
    }, 2400);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!sessionTimerRunning || screen === "home" || screen === "timeout") {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setSessionSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [screen, sessionTimerRunning]);

  useEffect(() => {
    if (!scoreDemoRunning) {
      return undefined;
    }

    if (shotStep >= activeScoreRun.length) {
      setScoreDemoRunning(false);
      return undefined;
    }

    const nextShotDelay = shotStep === 3 ? 1800 : 620;
    const timeout = window.setTimeout(() => {
      setShotStep((current) => Math.min(current + 1, activeScoreRun.length));
    }, nextShotDelay);

    return () => window.clearTimeout(timeout);
  }, [activeScoreRun.length, scoreDemoRunning, shotStep]);

  useEffect(() => {
    setScoreParticipantIndex((current) => Math.min(current, Math.max(scoreParticipants.length - 1, 0)));
  }, [scoreParticipants.length]);

  useEffect(() => {
    if (sessionSeconds > 0) {
      return;
    }

    setSessionTimerRunning(false);
    setScreen("timeout");
  }, [sessionSeconds]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function notify(message) {
    setToast({ id: Date.now(), message });
  }

  function assignLane() {
    setLanes((current) =>
      current.map((lane) => {
        if (lane.lane === selectedLane) {
          return { ...lane, customerId: selectedCustomerId, status: "In Game" };
        }

        if (lane.customerId === selectedCustomerId) {
          return { ...lane, customerId: null, status: lane.status === "In Game" ? "Available" : lane.status };
        }

        return lane;
      })
    );
    setSyncEvent(
      `${customers.find((customer) => customer.id === selectedCustomerId)?.name} synced to Level Up Live and pushed to Lane ${selectedLane}.`
    );
    setScreen("lane");
    notify(`Lane ${selectedLane} is live for ${customers.find((customer) => customer.id === selectedCustomerId)?.name}.`);
  }

  function selectDrill(drillId) {
    setSelectedDrillId(drillId);
    setScreen("instructions");
    notify(`${drills.find((drill) => drill.id === drillId)?.name} loaded on Lane ${selectedLane}.`);
  }

  function handleLaneInviteResponse(laneNumber, response) {
    setLaneInviteResponses((current) => ({
      ...current,
      [laneNumber]: response
    }));
  }

  function handleLeaveParty() {
    setLaneInviteResponses({});
    setScoreParticipantIndex(0);
    notify("Lane group closed.");
  }

  function switchLanePlayer(customerId) {
    const nextCustomer = customers.find((customer) => customer.id === customerId);

    if (!nextCustomer) {
      return;
    }

    const assignedLane = lanes.find((lane) => lane.customerId === customerId);

    if (assignedLane && assignedLane.lane !== selectedLane) {
      notify(`${nextCustomer.name} is already active on Lane ${assignedLane.lane}.`);
      return;
    }

    setSelectedCustomerId(customerId);
    setLanes((current) =>
      current.map((lane) => {
        if (lane.lane === selectedLane) {
          return { ...lane, customerId, status: "In Game" };
        }

        return lane;
      })
    );
    setScoreParticipantIndex(0);
    setShotStep(0);
    setScoreDemoRunning(false);
    setScoreView("live");
    setPlayerSwitchOpen(false);
    notify(`${nextCustomer.name} is now active on Lane ${selectedLane}.`);
  }

  function startDrill() {
    setShotStep(0);
    setScoreDemoRunning(false);
    setScoreView("live");
    setScoreParticipantIndex(0);
    setScreen("scoring");
    notify(`${activeDrill.name} started on Lane ${selectedLane}.`);
  }

  function playScoreDemo() {
    setShotStep(0);
    setScoreDemoRunning(true);
    notify("6-shot scoring playback started.");
  }

  function showPreviousScoreParticipant() {
    if (scoreParticipants.length <= 1) {
      return;
    }

    setScoreParticipantIndex((current) => (current - 1 + scoreParticipants.length) % scoreParticipants.length);
  }

  function showNextScoreParticipant() {
    if (scoreParticipants.length <= 1) {
      return;
    }

    setScoreParticipantIndex((current) => (current + 1) % scoreParticipants.length);
  }

  function handleAudioConnect(device) {
    setConnectedDevice(device);
    notify(`${device} connected. Audio prompts are enabled.`);
  }

  function openWelcomeScreen() {
    setSessionTimerRunning(false);
    setScreen("home");
  }

  function openTimeoutScreen() {
    setSessionTimerRunning(false);
    setSessionSeconds(0);
    setScreen("timeout");
  }

  function beginTimedSession() {
    setSessionSeconds(sessionDurationSeconds);
    setSessionTimerRunning(true);
    setScreen("lane");
  }

  function addSessionTime(minutes) {
    setSessionSeconds(minutes * 60);
    setSessionTimerRunning(true);
    setScreen("lane");
    notify(`Lane ${selectedLane} timer extended by ${minutes} minutes.`);
  }

  function closeResults() {
    setShotStep(0);
    setScoreDemoRunning(false);
    setScoreView("live");
    setScreen("scoring");
    notify("Score page reset for the next drill.");
  }

  function shareResult() {
    notify(`Share card prepared for ${activeCustomer.name}'s ${activeDrill.name} score.`);
  }

  function saveResultToProfile() {
    setScreen("profile");
    notify(`Result saved to ${activeCustomer.name}'s player profile.`);
  }

  function signUpForLeague(league) {
    notify(`${activeCustomer.name} signup started for ${league.name}.`);
  }

  function runAxisCommand(command, updates = {}) {
    if (typeof updates.distance === "number") {
      setAxisDistance(updates.distance);
    }

    if (updates.targetState) {
      setAxisTargetState(updates.targetState);
    }

    if (updates.programMode) {
      setAxisProgramMode(updates.programMode);
    }

    if (updates.lightingScene) {
      setAxisLightingScene(updates.lightingScene);
    }

    if (updates.laneTimer) {
      setSessionSeconds(parseSessionTimer(updates.laneTimer));
    }

    if (updates.alert) {
      setAxisAlert(updates.alert);
    }

    notify(`SmartRange AXIS command sent: ${command}.`);
  }

  if (screen === "home") {
    return <HomeScreen player={activeCustomer} onBegin={beginTimedSession} />;
  }

  if (screen === "timeout") {
    return <TimeoutScreen selectedLane={selectedLane} onAddTime={addSessionTime} />;
  }

  return (
    <div className={`app-shell screen-${screen}`}>
      <Sidebar currentScreen={screen} onBrandClick={openWelcomeScreen} onNavigate={setScreen} />
      <main className="main-stage">
        <Header
          axisLaneTimer={axisLaneTimer}
          onTimerClick={openTimeoutScreen}
          selectedLane={selectedLane}
        />
        <div className={`content-frame ${screen === "scoring" && scoreView === "results" ? "is-score-results" : ""} ${screen === "scoring" && scoreView !== "results" ? "is-live-scoring" : ""} ${screen === "autoscore" ? "is-autoscore" : ""}`}>
          {screen === "pos" && (
            <PosAssignment
              customers={customers}
              lanes={lanes}
              selectedCustomerId={selectedCustomerId}
              selectedLane={selectedLane}
              syncEvent={syncEvent}
              onCustomerChange={setSelectedCustomerId}
              onLaneChange={setSelectedLane}
              onAssign={assignLane}
            />
          )}

          {screen === "lane" && (
            <LaneTakeover
              player={activeCustomer}
              selectedLane={selectedLane}
              lanes={lanes}
              customers={customers}
              drill={activeDrill}
              connectedDevice={connectedDevice}
              axisDistance={axisDistance}
              axisTargetState={axisTargetState}
              axisLightingScene={axisLightingScene}
              partyMembers={partyMembers}
              partyActive={isPartyActive}
              laneInviteResponses={laneInviteResponses}
              onAxisCommand={runAxisCommand}
              onOpenAudio={() => setAudioModalOpen(true)}
              onChooseDrill={() => setScreen("drills")}
              onPlayerSwitch={() => setPlayerSwitchOpen(true)}
              onLaneInviteResponse={handleLaneInviteResponse}
              onLeaveParty={handleLeaveParty}
            />
          )}

          {screen === "drills" && <ProgramSelection programs={drills} activeProgramId={selectedDrillId} onSelectProgram={selectDrill} />}

          {screen === "instructions" && (
            <InstructionScreen
              drill={activeDrill}
              connectedDevice={connectedDevice}
              onOpenAudio={() => setAudioModalOpen(true)}
              onStart={startDrill}
            />
          )}

          {screen === "scoring" && (
            scoreView === "results" ? (
              <ResultsScreen
                player={activeCustomer}
                drill={activeDrill}
                totalScore={totalScore}
                reloadTime={getReloadTimeValue(activeScoreRun)}
                currentRank={currentRank}
                onShare={shareResult}
                onProfile={saveResultToProfile}
                onDone={closeResults}
              />
            ) : (
              <LiveScoring
                drill={activeDrill}
                scoreParticipant={activeScoreParticipant}
                scoreParticipants={scoreParticipants}
                visibleShots={shownVisibleShots}
                totalScore={totalScore}
                reloadTime={reloadTime}
                shotCount={shotCount}
                currentRank={currentRank}
                shotStep={shotStep}
                demoRunning={scoreDemoRunning}
                onPlay={playScoreDemo}
                onPreviousParticipant={showPreviousScoreParticipant}
                onNextParticipant={showNextScoreParticipant}
              />
            )
          )}

          {screen === "autoscore" && (
            <CameraAutoScoring
              player={activeCustomer}
              drill={activeDrill}
              selectedLane={selectedLane}
            />
          )}

          {screen === "profile" && <PlayerProfile player={activeCustomer} />}

          {screen === "league" && <LeagueScreen onSignup={signUpForLeague} />}
        </div>
      </main>

      {audioModalOpen && (
        <BluetoothModal
          connectedDevice={connectedDevice}
          onConnect={handleAudioConnect}
          onClose={() => setAudioModalOpen(false)}
        />
      )}

      {playerSwitchOpen && (
        <PlayerSwitchModal
          customers={customers}
          lanes={lanes}
          selectedLane={selectedLane}
          activeCustomerId={selectedCustomerId}
          onSelect={switchLanePlayer}
          onClose={() => setPlayerSwitchOpen(false)}
        />
      )}

      {toast && <Toast key={toast.id} message={toast.message} />}
      <PoweredByLevelUpBadge />

      <div className="orientation-notice" role="status" aria-live="polite">
        <MonitorPlay size={42} />
        <strong>Rotate tablet to landscape</strong>
        <span>This lane experience is designed for a horizontal tablet screen.</span>
      </div>
    </div>
  );
}

function Sidebar({ currentScreen, onBrandClick, onNavigate }) {
  const activeNavId = ["drills", "instructions", "pos"].includes(currentScreen) ? "lane" : currentScreen;

  return (
    <aside className="sidebar">
      <button className="brand-block" type="button" onClick={onBrandClick} aria-label="Open Level Up Live welcome screen">
        <div className="brand-mark">
          <img src={brandLogoSrc} alt="Level Up Live logo" />
        </div>
      </button>

      <nav className="nav-list" aria-label="Integration screens">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={`nav-item ${activeNavId === item.id ? "is-active" : ""}`}
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
            >
              <Icon size={19} />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function Header({ axisLaneTimer, onTimerClick, selectedLane }) {
  return (
    <header className="topbar">
      <div>
        <div className="eyebrow brand-title-row">
          <img className="topbar-action-logo" src={actionTargetLogoSrc} alt="Action Target logo" />
        </div>
      </div>
      <button className="session-strip timer-strip" type="button" onClick={onTimerClick}>
        <Timer size={22} />
        <div>
          <span>Lane {selectedLane} Timer</span>
          <strong>{axisLaneTimer}</strong>
        </div>
      </button>
    </header>
  );
}

function BrandTextLogo({ className = "" }) {
  return <img className={`brand-text-logo ${className}`} src={brandTextLogoSrc} alt="Level Up Live" />;
}

function PoweredByLevelUpBadge({ className = "", as = "div" }) {
  const BadgeElement = as;

  return (
    <BadgeElement className={`powered-by-badge ${className}`} aria-label="Powered by Level Up Live">
      <span>Powered by</span>
      <BrandTextLogo className="powered-by-logo" />
    </BadgeElement>
  );
}

function HomeScreen({ player, onBegin }) {
  return (
    <button className="home-screen" type="button" onClick={onBegin} aria-label={`Welcome ${player.name}. Press anywhere to begin your timer.`}>
      <img className="home-screen-bg" src={homeBackgroundSrc} alt="" aria-hidden="true" />
      <span className="home-screen-shade" aria-hidden="true" />
      <span className="home-screen-content">
        <img className="home-action-logo" src={actionTargetLogoSrc} alt="Action Target logo" />
        <strong>Welcome {player.name}</strong>
        <span>Press anywhere to begin your timer.</span>
      </span>
      <PoweredByLevelUpBadge as="span" className="home-powered-by" />
    </button>
  );
}

function TimeoutScreen({ selectedLane, onAddTime }) {
  const timeOptions = [
    { label: "Add 10 Minutes", minutes: 10 },
    { label: "Add 30 Minutes", minutes: 30 },
    { label: "Add 1 Hour", minutes: 60 }
  ];

  return (
    <div className="home-screen timeout-screen" role="dialog" aria-label={`Lane ${selectedLane} is out of time.`}>
      <img className="home-screen-bg" src={homeBackgroundSrc} alt="" aria-hidden="true" />
      <span className="home-screen-shade" aria-hidden="true" />
      <div className="home-screen-content timeout-content">
        <img className="home-action-logo" src={actionTargetLogoSrc} alt="Action Target logo" />
        <span className="timeout-kicker">Lane {selectedLane} Timer</span>
        <strong>This lane is out of time.</strong>
        <span>Select more time to unlock the lane screen.</span>
        <div className="timeout-actions" aria-label="Add lane time">
          {timeOptions.map((option) => (
            <button key={option.minutes} type="button" onClick={() => onAddTime(option.minutes)}>
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <PoweredByLevelUpBadge as="span" className="home-powered-by" />
    </div>
  );
}

function Avatar({ player, size = "large", leader = false }) {
  return (
    <div className={`avatar avatar-${size} ${leader ? "is-leader" : ""}`} style={{ "--avatar-accent": player.accent }}>
      {player.avatarImage ? <img src={player.avatarImage} alt={`${player.name} profile`} /> : player.avatar}
      {leader && (
        <span className="leader-crown" aria-label="Party leader">
          <Crown size={size === "small" ? 16 : 24} />
        </span>
      )}
    </div>
  );
}

function PosAssignment({
  customers,
  lanes,
  selectedCustomerId,
  selectedLane,
  syncEvent,
  onCustomerChange,
  onLaneChange,
  onAssign
}) {
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0];

  return (
    <section className="screen-grid pos-grid fade-in">
      <div className="panel panel-hero">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">Employee Facing</div>
            <h2>FlowState POS Lane Assignment</h2>
          </div>
          <span className="sim-label">Payment + identity complete</span>
        </div>

        <div className="assignment-layout">
          <div className="select-column">
            <h3>Select Paid Customer</h3>
            <div className="customer-list">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  className={`customer-option ${selectedCustomerId === customer.id ? "is-selected" : ""}`}
                  onClick={() => onCustomerChange(customer.id)}
                >
                  <Avatar player={customer} size="small" />
                  <span>
                    <strong>{customer.name}</strong>
                    <small>{customer.rank} • {customer.username}</small>
                  </span>
                  {selectedCustomerId === customer.id && <Check size={18} />}
                </button>
              ))}
            </div>
          </div>

          <div className="select-column">
            <h3>Assign Lane</h3>
            <div className="lane-grid">
              {lanes.map((lane) => (
                <button
                  key={lane.lane}
                  type="button"
                  className={`lane-tile ${selectedLane === lane.lane ? "is-selected" : ""} status-${lane.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                  onClick={() => onLaneChange(lane.lane)}
                >
                  <strong>Lane {lane.lane}</strong>
                  <span>{lane.status}</span>
                  <small>{lane.customerId ? customers.find((customer) => customer.id === lane.customerId)?.name : "No shooter"}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="assignment-footer">
          <div className="sync-preview">
            <BadgeCheck size={22} />
            <div>
              <strong>{selectedCustomer.name} is eligible for Level Up Live sync.</strong>
              <span>Paid session, waiver, customer profile, and lane assignment are ready.</span>
            </div>
          </div>
          <button className="primary-action" type="button" onClick={onAssign}>
            Assign + Take Over Lane Screen
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">System Event</div>
            <h2>Player Profile Sync</h2>
          </div>
        </div>
        <div className="sync-card">
          <div className="sync-node is-complete">1</div>
          <div>
            <strong>FlowState customer selected</strong>
            <span>{selectedCustomer.name} identified at POS.</span>
          </div>
        </div>
        <div className="sync-card">
          <div className="sync-node is-complete">2</div>
          <div>
            <strong>SmartRange AXIS Connect payload</strong>
            <span>Lane {selectedLane} receives timer, lighting scene, retriever access, and POS session ID.</span>
          </div>
        </div>
        <div className="sync-card">
          <div className="sync-node is-live">3</div>
          <div>
            <strong>Level Up Live profile connected</strong>
            <span>{syncEvent}</span>
          </div>
        </div>
        <div className="sync-card compact-sync">
          <div className="sync-node is-complete">4</div>
          <div>
            <strong>Permissions applied</strong>
            <span>Member drills enabled, standard retriever speed, camera scoring, audio prompts.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function LaneTakeover({
  player,
  selectedLane,
  lanes,
  customers,
  drill,
  connectedDevice,
  axisDistance,
  axisTargetState,
  axisLightingScene,
  partyMembers,
  partyActive,
  laneInviteResponses,
  onAxisCommand,
  onOpenAudio,
  onChooseDrill,
  onPlayerSwitch,
  onLaneInviteResponse,
  onLeaveParty
}) {
  const [cameraPanelOpen, setCameraPanelOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const isPartyActive = partyActive;

  function handleLaneInviteResponse(laneNumber, response) {
    onLaneInviteResponse(laneNumber, response);
  }

  function handleLeaveParty() {
    onLeaveParty();
    setInviteModalOpen(false);
  }

  return (
    <section className="fade-in lane-layout">
      <div className={`lane-hero panel ${cameraPanelOpen ? "has-camera-panel" : ""}`}>
        <div className="scan-line" />
        <div className="lane-control-stack">
          <div className="lane-player">
            <Avatar player={player} leader={isPartyActive} />
            <button className="player-switch-button" type="button" onClick={onPlayerSwitch} aria-label={`Change active player from ${player.name}`}>
              <h2>{player.name}</h2>
              <p>XP {player.xp.toLocaleString()} • Score {player.recentScore}</p>
              <span className="player-switch-hint">
                <UsersRound size={19} />
                Switch player
              </span>
            </button>
            <div className="lane-number">
              <span>Lane</span>
              <strong>{selectedLane}</strong>
            </div>
          </div>

          {cameraPanelOpen ? (
            <div className="lane-action-row compact-lane-actions" aria-label="Lane quick actions">
              <button className="lane-icon-action is-program" type="button" onClick={onChooseDrill} aria-label="Open Programs">
                <Gamepad2 size={30} />
              </button>
              <button
                className={`lane-icon-action is-audio ${connectedDevice ? "is-connected" : ""}`}
                type="button"
                onClick={onOpenAudio}
                aria-label={connectedDevice ? `Audio connected to ${connectedDevice}` : "Connect audio"}
              >
                <Headphones size={30} />
              </button>
            </div>
          ) : (
            <div className="lane-action-row" aria-label="Lane quick actions">
              <button className="program-card" type="button" onClick={onChooseDrill}>
                <Gamepad2 size={24} />
                <span>Programs</span>
                <strong>Choose Drill</strong>
              </button>
              <Metric
                label="Audio"
                value={connectedDevice ? connectedDevice : "Not Connected"}
                icon={Headphones}
                onClick={onOpenAudio}
              />
            </div>
          )}

          <AxisCommandConsole
            axisDistance={axisDistance}
            axisTargetState={axisTargetState}
            axisLightingScene={axisLightingScene}
            cameraActive={cameraPanelOpen}
            onAxisCommand={onAxisCommand}
            onToggleCamera={() => setCameraPanelOpen((open) => !open)}
          />

          <div className="hero-actions">
            {partyMembers.length > 1 ? (
              <PartyDock members={partyMembers} onInviteClick={() => setInviteModalOpen(true)} onLeaveParty={handleLeaveParty} />
            ) : (
              <button className="secondary-action large" type="button" onClick={() => setInviteModalOpen(true)}>
                <UsersRound size={22} />
                Invite Nearby Lanes
              </button>
            )}
          </div>
        </div>
        {cameraPanelOpen && (
          <LaneCameraPanel
            selectedLane={selectedLane}
            drill={drill}
            axisDistance={axisDistance}
            axisTargetState={axisTargetState}
          />
        )}
        {inviteModalOpen && (
          <LaneInviteModal
            lanes={lanes}
            customers={customers}
            selectedLane={selectedLane}
            partyActive={isPartyActive}
            responses={laneInviteResponses}
            onRespond={handleLaneInviteResponse}
            onLeaveParty={handleLeaveParty}
            onClose={() => setInviteModalOpen(false)}
          />
        )}
      </div>
    </section>
  );
}

function PlayerSwitchModal({ customers, lanes, selectedLane, activeCustomerId, onSelect, onClose }) {
  const availableCustomers = customers.filter((customer) => {
    const assignedLane = lanes.find((lane) => lane.customerId === customer.id);
    return customer.id === activeCustomerId || !assignedLane;
  });

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-panel player-switch-modal" role="dialog" aria-modal="true" aria-labelledby="player-switch-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="panel-heading">
          <div>
            <div className="eyebrow">Lane {selectedLane} Player</div>
            <h2 id="player-switch-title">Change active player</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close player switch panel">
            <X size={22} />
          </button>
        </div>

        <div className="player-switch-grid" aria-label="Checked-in players">
          {availableCustomers.map((customer) => {
            const assignedLane = lanes.find((lane) => lane.customerId === customer.id);
            const isActive = customer.id === activeCustomerId;
            const status = isActive ? "Current player" : "Available";

            return (
              <button
                key={customer.id}
                className={`player-switch-card ${isActive ? "is-active" : ""}`}
                type="button"
                onClick={() => onSelect(customer.id)}
              >
                <Avatar player={customer} size="small" />
                <div>
                  <strong>{customer.name}</strong>
                  <span>{customer.username}</span>
                </div>
                <small>{status}</small>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PartyDock({ members, onInviteClick, onLeaveParty }) {
  return (
    <div className="party-dock" aria-label="Joined lanes">
      <div className="party-member-list">
        {members.map((member) => (
          <div key={member.lane} className={`party-member ${member.leader ? "is-leader" : ""}`}>
            <Avatar player={member.player} size="small" leader={member.leader} />
            <span>Lane {member.lane}</span>
          </div>
        ))}
      </div>
      <div className="party-actions">
        <button className="party-manage-button" type="button" onClick={onInviteClick}>
          <UsersRound size={20} />
          Invite
        </button>
        <button className="party-leave-button" type="button" onClick={onLeaveParty}>
          <X size={20} />
          Leave
        </button>
      </div>
    </div>
  );
}

function LaneInviteModal({ lanes, customers, selectedLane, partyActive, responses, onRespond, onLeaveParty, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-panel lane-invite-modal" role="dialog" aria-modal="true" aria-labelledby="lane-invite-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="panel-heading">
          <div>
            <div className="eyebrow">Invite Lanes</div>
            <h2 id="lane-invite-title">Build your lane group</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close lane invite panel">
            <X size={22} />
          </button>
        </div>

        <div className="invite-lane-grid" aria-label="Lane invite responses">
          {lanes.map((lane) => {
            const customer = lane.customerId ? customers.find((item) => item.id === lane.customerId) : null;
            const isLeader = lane.lane === selectedLane;
            const response = isLeader ? "leader" : responses[lane.lane];
            const canRespond = Boolean(customer) && !isLeader;

            return (
              <div
                key={lane.lane}
                className={`invite-lane-card ${isLeader ? "is-leader" : ""} ${response === "accepted" ? "is-accepted" : ""} ${response === "declined" ? "is-declined" : ""} ${!customer ? "is-open" : ""}`}
              >
                <div className="invite-lane-top">
                  <strong>Lane {lane.lane}</strong>
                  <span>{isLeader ? "Leader" : response === "accepted" ? "Accepted" : response === "declined" ? "Declined" : lane.status}</span>
                </div>

                <div className="invite-player-row">
                  {customer ? <Avatar player={customer} size="small" leader={isLeader && partyActive} /> : <div className="empty-lane-avatar">Open</div>}
                  <div>
                    <strong>{customer ? customer.name : "No player assigned"}</strong>
                    <span>{customer ? customer.username : "Cannot invite"}</span>
                  </div>
                </div>

                <div className="invite-response-actions" aria-label={`Lane ${lane.lane} invite response`}>
                  {isLeader ? (
                    <span className="leader-pill">
                      <Crown size={15} />
                      Party Leader
                    </span>
                  ) : canRespond ? (
                    <>
                      <button className="accept-button" type="button" onClick={() => onRespond(lane.lane, "accepted")} aria-label={`Accept invite from Lane ${lane.lane}`}>
                        <Check size={19} />
                      </button>
                      <button className="decline-button" type="button" onClick={() => onRespond(lane.lane, "declined")} aria-label={`Decline invite from Lane ${lane.lane}`}>
                        <X size={19} />
                      </button>
                    </>
                  ) : (
                    <span className="open-lane-pill">Open lane</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="invite-modal-actions">
          {partyActive && (
            <button className="party-leave-button modal-leave-button" type="button" onClick={onLeaveParty}>
              <X size={20} />
              Leave Party
            </button>
          )}
          <button className="primary-action" type="button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function AxisCommandConsole({
  axisDistance,
  axisTargetState,
  axisLightingScene,
  cameraActive,
  onAxisCommand,
  onToggleCamera
}) {
  const [lightMenuOpen, setLightMenuOpen] = useState(false);
  const distanceHoldRef = useRef(null);
  const distancePointerHandledRef = useRef(false);
  const distanceStateRef = useRef({ axisDistance, axisTargetState });
  const lightSceneOptions = ["Police", "EMS", "Strobe"];
  const lightLevelOptions = ["Off", "Dim", "Bright"];

  useEffect(() => {
    distanceStateRef.current = { axisDistance, axisTargetState };
  }, [axisDistance, axisTargetState]);

  useEffect(
    () => () => {
      window.clearInterval(distanceHoldRef.current);
    },
    []
  );

  useEffect(() => {
    function handleWindowKeyDown(event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepDistance(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepDistance(1);
      }
    }

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  });

  function sendLightingCommand(label) {
    setLightMenuOpen(false);
    onAxisCommand(`${label} lighting`, { lightingScene: label });
  }

  function nextDistance(step) {
    const { axisDistance: currentDistance } = distanceStateRef.current;
    const minDistance = targetDistanceOptions[0];
    const maxDistance = targetDistanceOptions[targetDistanceOptions.length - 1];

    if (currentDistance === 0) {
      return step > 0 ? Math.max(minDistance, Math.min(maxDistance, step)) : 0;
    }

    if (step < 0 && currentDistance <= minDistance) {
      return 0;
    }

    return Math.max(minDistance, Math.min(maxDistance, currentDistance + step));
  }

  function sendDistanceCommand(distance, source = "send target") {
    const { axisTargetState: currentTargetState } = distanceStateRef.current;
    const nextTargetState = currentTargetState === "Home" ? "Face" : currentTargetState;
    onAxisCommand(`${source} to ${distance} yards`, { distance, targetState: nextTargetState });
  }

  function stepDistance(step) {
    const distance = nextDistance(step);
    const { axisDistance: currentDistance } = distanceStateRef.current;

    if (distance !== currentDistance) {
      sendDistanceCommand(distance, Math.abs(step) === 5 ? "fast retriever" : "manual retriever");
    }
  }

  function startDistanceHold(step, event) {
    event.preventDefault();
    distancePointerHandledRef.current = true;
    stepDistance(step);
    window.clearInterval(distanceHoldRef.current);
    distanceHoldRef.current = window.setInterval(() => stepDistance(step), 260);
  }

  function stopDistanceHold() {
    window.clearInterval(distanceHoldRef.current);
    distanceHoldRef.current = null;
    window.setTimeout(() => {
      distancePointerHandledRef.current = false;
    }, 0);
  }

  function handleDistanceArrowClick(step) {
    if (distancePointerHandledRef.current) {
      distancePointerHandledRef.current = false;
      return;
    }

    stepDistance(step);
  }

  return (
    <div className="axis-console">
      <div className="axis-readouts">
        <AxisReadout icon={ShieldCheck} label="Lighting" value={axisLightingScene} />
      </div>

      <div className="distance-control-row" aria-label="Retriever distance controls">
        <button
          className="distance-arrow is-single"
          type="button"
          aria-label="Decrease retriever distance by 1 yard"
          onPointerDown={(event) => startDistanceHold(-1, event)}
          onPointerUp={stopDistanceHold}
          onPointerLeave={stopDistanceHold}
          onPointerCancel={stopDistanceHold}
          onClick={() => handleDistanceArrowClick(-1)}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className="distance-arrow is-double"
          type="button"
          aria-label="Decrease retriever distance by 5 yards"
          onPointerDown={(event) => startDistanceHold(-5, event)}
          onPointerUp={stopDistanceHold}
          onPointerLeave={stopDistanceHold}
          onPointerCancel={stopDistanceHold}
          onClick={() => handleDistanceArrowClick(-5)}
        >
          <ChevronsLeft size={24} />
        </button>
        <div className="distance-status" aria-label="Current retriever distance">
          <span>Retriever</span>
          <strong>{axisDistance === 0 ? "Home" : `${axisDistance} yd`}</strong>
          <small>{axisTargetState === "Home" ? "At bench" : axisTargetState}</small>
        </div>
        <button
          className="distance-arrow is-double"
          type="button"
          aria-label="Increase retriever distance by 5 yards"
          onPointerDown={(event) => startDistanceHold(5, event)}
          onPointerUp={stopDistanceHold}
          onPointerLeave={stopDistanceHold}
          onPointerCancel={stopDistanceHold}
          onClick={() => handleDistanceArrowClick(5)}
        >
          <ChevronsRight size={24} />
        </button>
        <button
          className="distance-arrow is-single"
          type="button"
          aria-label="Increase retriever distance by 1 yard"
          onPointerDown={(event) => startDistanceHold(1, event)}
          onPointerUp={stopDistanceHold}
          onPointerLeave={stopDistanceHold}
          onPointerCancel={stopDistanceHold}
          onClick={() => handleDistanceArrowClick(1)}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="axis-actions" aria-label="SmartRange AXIS lane commands">
        <button className={`axis-command-button is-camera ${cameraActive ? "is-active" : ""}`} type="button" onClick={onToggleCamera}>
          <Camera size={18} />
          <span>Camera</span>
        </button>
        <button className="axis-command-button is-recall" type="button" onClick={() => onAxisCommand("recall target home", { distance: 0, targetState: "Home", alert: "Clear" })}>
          <ChevronRight size={17} />
          Recall
        </button>
        <div className="axis-action-menu">
          <button className="axis-command-button" type="button" onClick={() => setLightMenuOpen((open) => !open)} aria-expanded={lightMenuOpen}>
            <Zap size={17} />
            Light
          </button>
          {lightMenuOpen && (
            <div className="light-menu" role="menu" aria-label="Lighting options">
              <span>Scene</span>
              {lightSceneOptions.map((option) => (
                <button key={option} type="button" onClick={() => sendLightingCommand(option)} role="menuitem">
                  {option}
                </button>
              ))}
              <span>Level</span>
              {lightLevelOptions.map((option) => (
                <button key={option} type="button" onClick={() => sendLightingCommand(option)} role="menuitem">
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AxisReadout({ icon: Icon, label, value }) {
  return (
    <div className="axis-readout">
      <Icon size={17} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Metric({ label, value, icon: Icon, onClick }) {
  const Element = onClick ? "button" : "div";

  return (
    <Element className={`metric-card ${onClick ? "metric-button" : ""}`} type={onClick ? "button" : undefined} onClick={onClick}>
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </Element>
  );
}

function ResultMetrics({ totalScore, reloadTime, currentRank, className = "result-grid" }) {
  return (
    <div className={className}>
      <Metric label="Final Score" value={totalScore} icon={Trophy} />
      <Metric label="Reload Time" value={reloadTime} icon={Timer} />
      <Metric label="Group Size" value="1.8 in" icon={Gauge} />
      <Metric label="Friend Rank" value={`#${currentRank || 1}`} icon={Medal} />
      <Metric label="XP Gained" value="+840" icon={Zap} />
      <Metric label="Personal Best" value="Yes" icon={Sparkles} />
    </div>
  );
}

function ProgramSelection({ programs, activeProgramId, onSelectProgram }) {
  const [activeCategory, setActiveCategory] = useState("Drills");
  const visiblePrograms = programs.filter((program) => program.category === activeCategory);

  return (
    <section className="fade-in">
      <div className="section-head">
        <div>
          <div className="eyebrow">Programs</div>
          <h2>Choose a Program</h2>
        </div>
      </div>

      <div className="weekly-challenge">
        <div>
          <span>{weeklyChallenge.title}</span>
          <strong>{weeklyChallenge.name}</strong>
          <small>{weeklyChallenge.meta}</small>
        </div>
        <em>{weeklyChallenge.prize}</em>
        <button className="primary-action" type="button" onClick={() => onSelectProgram(weeklyChallenge.id)}>
          Start Weekly
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="program-tabs" aria-label="Program categories">
        {programCategories.map((category) => (
          <button
            key={category}
            type="button"
            className={activeCategory === category ? "is-active" : ""}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="program-grid">
        {visiblePrograms.map((program) => (
          <article key={program.id} className={`program-tile ${activeProgramId === program.id ? "is-selected" : ""}`}>
            <div className="program-tile-top">
              <div>
                <span className="difficulty">{program.difficulty}</span>
                <h3>{program.name}</h3>
              </div>
              <Target size={24} />
            </div>
            <p>{program.description}</p>
            {program.regimens && (
              <div className="regimen-list" aria-label={`${program.name} regimens`}>
                {program.regimens.map((regimen) => (
                  <span key={regimen}>{regimen}</span>
                ))}
              </div>
            )}
            <div className="program-meta">
              <span>
                <Gauge size={15} />
                {program.rounds} rounds
              </span>
            </div>
            <button className="card-action" type="button" onClick={() => onSelectProgram(program.id)}>
              {program.category === "Training" ? "Start Training" : "Start"}
              <ChevronRight size={18} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function InstructionScreen({
  drill,
  connectedDevice,
  onOpenAudio,
  onStart
}) {
  return (
    <section className="instruction-layout fade-in">
      <div className="panel instruction-card">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">Pre-Program Briefing</div>
            <h2>{drill.name}</h2>
          </div>
          <span className="difficulty">{drill.difficulty}</span>
        </div>
        <p className="instruction-copy">
          {drill.instructions ??
            `${drill.name}: Follow the lane-screen prompts, fire only when instructed, and wait for the scoring confirmation before resetting.`}
        </p>

        <div className="instruction-grid">
          <InfoBox label="Round Count" value={`${drill.rounds} rounds`} icon={Gauge} />
          <InfoBox label="Target Behavior" value={drill.behavior} icon={Target} />
          <InfoBox label="Scoring Rules" value={drill.scoring} icon={BarChart3} />
        </div>

        <div className="instruction-actions">
          <button className="secondary-action" type="button" onClick={onOpenAudio}>
            <Headphones size={21} />
            {connectedDevice ? `Connected: ${connectedDevice}` : "Connect Bluetooth Headphones"}
          </button>
          <button className="primary-action" type="button" onClick={onStart}>
            <Play size={21} />
            {drill.category === "Training" ? "Start Training" : "Start Program"}
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">Audio Prompt Engine</div>
            <h2>Hands-free lane guidance</h2>
          </div>
        </div>
        <div className="prompt-stack">
          {spokenPrompts.map((prompt, index) => (
            <div key={prompt} className={`prompt-line ${index < 2 ? "is-live" : ""}`}>
              <Radio size={18} />
              <span>{prompt}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InfoBox({ label, value, icon: Icon }) {
  return (
    <div className="info-box">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BluetoothModal({ connectedDevice, onConnect, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="bluetooth-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="panel-heading">
          <div>
            <div className="eyebrow">Bluetooth Connection</div>
            <h2 id="bluetooth-title">Connect Audio Device</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close Bluetooth modal">
            ×
          </button>
        </div>
        <div className="device-list">
          {audioDevices.map((device) => (
            <button
              key={device}
              type="button"
              className={`device-row ${connectedDevice === device ? "is-connected" : ""}`}
              onClick={() => onConnect(device)}
            >
              <Headphones size={22} />
              <span>
                <strong>{device}</strong>
                <small>{connectedDevice === device ? "Audio instructions enabled." : "Available nearby"}</small>
              </span>
              {connectedDevice === device ? <Check size={20} /> : <Bluetooth size={20} />}
            </button>
          ))}
        </div>
        <button className="primary-action full-width" type="button" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}

function LaneCameraPanel({ selectedLane, drill, axisDistance, axisTargetState }) {
  const visibleImpacts = [
    { x: 48, y: 42, score: 10 },
    { x: 53, y: 45, score: 10 },
    { x: 50, y: 50, score: 10 },
    { x: 45, y: 48, score: 9 },
    { x: 55, y: 52, score: 9 },
    { x: 51, y: 56, score: 9 },
    { x: 47, y: 54, score: 10 }
  ];

  return (
    <aside className="lane-camera-panel" aria-labelledby="camera-title">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">Lane Camera</div>
          <h2 id="camera-title">Lane {selectedLane} Camera View</h2>
        </div>
      </div>

      <div className="camera-feed">
        <div className="camera-feed-bar">
          <span>CAM {String(selectedLane).padStart(2, "0")}</span>
          <strong>Live</strong>
          <span>{axisDistance === 0 ? "Home" : `${axisDistance} yd`} • {axisTargetState === "Home" ? "Face" : axisTargetState}</span>
        </div>
        <div className="camera-target-view" aria-label="Simulated target camera feed">
          <span className="camera-crosshair horizontal" />
          <span className="camera-crosshair vertical" />
          <span className="target-ring ring-outer" />
          <span className="target-ring ring-mid" />
          <span className="target-ring ring-inner" />
          {visibleImpacts.map((impact, index) => (
            <span
              key={`${impact.x}-${impact.y}-${index}`}
              className="camera-impact"
              style={{ left: `${impact.x}%`, top: `${impact.y}%` }}
              aria-label={`Visible impact ${index + 1}, score ${impact.score}`}
            />
          ))}
        </div>
      </div>

      <div className="camera-stats">
        <div>
          <span>Program</span>
          <strong>{drill.name}</strong>
        </div>
        <div>
          <span>Visible Impacts</span>
          <strong>15</strong>
        </div>
        <div>
          <span>Pass-Through Inferred</span>
          <strong>5</strong>
        </div>
        <div>
          <span>Confidence</span>
          <strong>94%</strong>
        </div>
      </div>
    </aside>
  );
}

function Scoreboard({ rows, selectedLane }) {
  return (
    <div className="scoreboard">
      {rows.map((row, index) => (
        <div key={row.lane} className={`score-row ${row.lane === selectedLane ? "is-player" : ""}`}>
          <span className="rank-number">#{index + 1}</span>
          <span className="lane-chip">Lane {row.lane}</span>
          <strong>{row.name}</strong>
          <span>{row.accuracy}%</span>
          <strong>{row.score}</strong>
        </div>
      ))}
    </div>
  );
}

function getShotColor(score) {
  if (score >= 10) return "#25f46d";
  if (score >= 9) return "#8affac";
  if (score >= 8) return "#fbf35d";
  if (score >= 7) return "#ffb84d";
  return "#ff6b6b";
}

function LiveScoring({
  drill,
  scoreParticipant,
  scoreParticipants,
  visibleShots,
  totalScore,
  reloadTime,
  shotCount,
  currentRank,
  shotStep,
  demoRunning,
  onPlay,
  onPreviousParticipant,
  onNextParticipant
}) {
  const shotLogRef = useRef(null);
  const playLabel = demoRunning ? "Playing" : shotStep >= 6 ? "Replay Drill" : "Play Drill";
  const canCycleScores = scoreParticipants.length > 1;

  useEffect(() => {
    const shotLog = shotLogRef.current;
    if (shotLog) {
      shotLog.scrollTop = shotLog.scrollHeight;
    }
  }, [visibleShots.length, demoRunning]);

  return (
    <section className="scoring-layout fade-in">
      <div className="panel target-panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">Live Scoring</div>
            <h2>
              {drill.name} • {scoreParticipant.player.name}
            </h2>
          </div>
        </div>

        <div className="target-and-feed">
          <TargetDiagram visibleShots={visibleShots} />
        </div>

        <div className="scoring-control-row">
          <button className="secondary-action scoring-play-button" type="button" onClick={onPlay} disabled={demoRunning}>
            <Play size={20} />
            {playLabel}
          </button>
          <div>
            <span>Reload Time</span>
            <strong>{reloadTime}</strong>
          </div>
          <div className="score-view-switcher" aria-label="Group score viewer">
            <button type="button" className="score-cycle-button" onClick={onPreviousParticipant} disabled={!canCycleScores} aria-label="Show previous group score">
              <ChevronLeft size={24} />
            </button>
            <div className="score-view-name">
              <span>Score View</span>
              <strong>{scoreParticipant.player.name}</strong>
            </div>
            <button type="button" className="score-cycle-button" onClick={onNextParticipant} disabled={!canCycleScores} aria-label="Show next group score">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="panel live-stats-panel shot-log-panel">
        <div className="panel-heading shot-log-heading">
          <div>
            <div className="eyebrow">Shot Log</div>
            <h2>{shotCount}/6 fired</h2>
          </div>
          <div className="shot-log-score">
            <span>Total</span>
            <strong>{totalScore}</strong>
          </div>
        </div>

        <div className="shot-log-list" ref={shotLogRef} aria-label="Shot timing and points">
          {visibleShots.length === 0 && (
            <div className="shot-log-empty">
              <Play size={26} />
              <strong>Press Play Drill</strong>
              <span>Six shots will score in two 3-shot strings.</span>
            </div>
          )}

          {visibleShots.map((shot) => (
            <React.Fragment key={shot.id}>
              {shot.id === 4 && (
                <div className="reload-row">
                  <Timer size={16} />
                  <span>Reload</span>
                  <strong>{(shot.elapsedSeconds - visibleShots[2].elapsedSeconds).toFixed(2)} s</strong>
                </div>
              )}
              <div className="shot-log-row">
                <span>Shot {shot.id}</span>
                <strong>{shot.firedAt}</strong>
                <b style={{ color: getShotColor(shot.score) }}>{shot.score} pts</b>
              </div>
            </React.Fragment>
          ))}

          {demoRunning && visibleShots.length === 3 && (
            <div className="reload-row is-active">
              <Timer size={16} />
              <span>Reloading</span>
              <strong>Timing split</strong>
            </div>
          )}
        </div>

        <ResultMetrics totalScore={totalScore} reloadTime={reloadTime} currentRank={currentRank} className="shot-log-summary" />
      </div>
    </section>
  );
}

function TargetDiagram({ visibleShots }) {
  return (
    <div className="target-wrap">
      <svg className="target-svg" viewBox="0 0 100 100" role="img" aria-label="Shooting target with hit locations">
        <defs>
          <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#25f46d" stopOpacity="0.38" />
            <stop offset="45%" stopColor="#32a7ff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#101725" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" rx="10" fill="#08111d" />
        <circle cx="50" cy="50" r="44" fill="url(#targetGlow)" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="#7f91a8" strokeOpacity="0.48" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="#32a7ff" strokeOpacity="0.66" strokeWidth="1" />
        <circle cx="50" cy="50" r="22" fill="none" stroke="#fbf35d" strokeOpacity="0.8" strokeWidth="1" />
        <circle cx="50" cy="50" r="14" fill="none" stroke="#8affac" strokeOpacity="0.9" strokeWidth="1.15" />
        <circle cx="50" cy="50" r="7" fill="#25f46d" fillOpacity="0.16" stroke="#25f46d" strokeWidth="1.2" />
        <text x="51" y="52" fill="#25f46d" fontSize="4.6" fontWeight="800">10</text>
        <text x="61" y="52" fill="#8affac" fontSize="4.2" fontWeight="800">9</text>
        <text x="69" y="52" fill="#fbf35d" fontSize="4.2" fontWeight="800">8</text>
        <text x="78" y="52" fill="#32a7ff" fontSize="4.2" fontWeight="800">7</text>
        <text x="86" y="52" fill="#dbeafe" fontSize="4.2" fontWeight="800">6</text>
        <line x1="50" x2="50" y1="8" y2="92" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="0.5" />
        <line x1="8" x2="92" y1="50" y2="50" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="0.5" />
        {visibleShots.map((shot) => (
          <g key={shot.id}>
            <circle cx={shot.x} cy={shot.y} r="2.35" fill="#ffffff" stroke={getShotColor(shot.score)} strokeWidth="1" />
            <circle cx={shot.x} cy={shot.y} r="4.3" fill="none" stroke={getShotColor(shot.score)} strokeOpacity="0.32" strokeWidth="0.7" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function ResultsScreen({ player, drill, totalScore, reloadTime, currentRank, onShare, onProfile, onDone }) {
  const finalScore = totalScore;

  return (
    <section className="results-layout fade-in">
      <div className="panel results-hero">
        <div className="result-burst">
          <Trophy size={44} />
        </div>
        <div className="eyebrow">Post-Drill Results</div>
        <h2>{drill.name} Complete</h2>
        <p>
          {player.name} set a new personal best and unlocked a badge from the lane session.
        </p>
        <div className="result-score">{finalScore} pts</div>
        <div className="result-actions">
          <button className="secondary-action" type="button" onClick={onShare}>
            <Share2 size={20} />
            Share
          </button>
          <button className="secondary-action" type="button" onClick={onProfile}>
            <Save size={20} />
            Save to Player Profile
          </button>
        </div>
      </div>

      <div className="panel results-summary-panel">
        <ResultMetrics totalScore={finalScore} reloadTime={reloadTime} currentRank={currentRank} />

        <div className="badge-unlocked">
          <BadgeCheck size={28} />
          <div>
            <strong>Badge unlocked: Tight Group</strong>
            <span>Also eligible: First Drill Complete, Lane Champion, 90% Accuracy Club, Fast Hands, Perfect String.</span>
          </div>
        </div>

        <button className="primary-action result-done-action" type="button" onClick={onDone}>
          <Check size={20} />
          Done
        </button>
      </div>
    </section>
  );
}

function PlayerProfile({ player }) {
  const progress = Math.round((player.xp / player.nextRankXp) * 100);

  return (
    <section className="profile-layout fade-in">
      <div className="panel profile-card">
        <Avatar player={player} />
        <div className="eyebrow brand-title-row">
          <BrandTextLogo className="eyebrow-brand-text" />
          <span>Player Profile</span>
        </div>
        <h2>{player.name}</h2>
        <p>{player.username}</p>
        <strong>{player.rank}</strong>
        <div className="xp-bar" aria-label={`${progress}% XP progress`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <small>
          {player.xp.toLocaleString()} / {player.nextRankXp.toLocaleString()} XP
        </small>
      </div>

      <div className="profile-main">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">Badges + Achievements</div>
              <h2>Progression Snapshot</h2>
            </div>
          </div>
          <div className="badge-grid">
            {achievements.map((achievement) => (
              <div key={achievement} className={`profile-badge ${player.badges.includes(achievement) ? "is-earned" : ""}`}>
                <Medal size={21} />
                <strong>{achievement}</strong>
                <span>{player.badges.includes(achievement) ? "Earned" : "In progress"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel two-column-panel">
          <div>
            <div className="panel-heading">
              <div>
                <div className="eyebrow">Recent Drills</div>
                <h2>Saved Sessions</h2>
              </div>
            </div>
            <div className="simple-list">
              {recentDrills.map((drill) => (
                <div key={drill.name} className="simple-row">
                  <strong>{drill.name}</strong>
                  <span>{drill.date}</span>
                  <b>{drill.score}</b>
                  <small>{drill.accuracy}</small>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="panel-heading">
              <div>
                <div className="eyebrow">Friends + Standings</div>
                <h2>Social Performance</h2>
              </div>
            </div>
            <div className="simple-list">
              {player.friends.map((friend, index) => (
                <div key={friend} className="simple-row">
                  <strong>{friend}</strong>
                  <span>Friend</span>
                  <b>#{index + 2}</b>
                  <small>Monthly</small>
                </div>
              ))}
              <div className="simple-row is-highlighted">
                <strong>Lake Erie Arms Summer League</strong>
                <span>League standing</span>
                <b>#{player.monthlyPosition}</b>
                <small>Monthly leaderboard</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LeagueScreen({ onSignup }) {
  const [selectedLeagueId, setSelectedLeagueId] = useState(leagues[0].id);
  const selectedLeague = leagues.find((league) => league.id === selectedLeagueId) ?? leagues[0];
  const leader = selectedLeague.standings[0];

  return (
    <section className="fade-in">
      <div className="league-layout">
        <div className="panel league-browser-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">All Leagues</div>
              <h2>Choose a League</h2>
            </div>
            <Trophy size={22} />
          </div>

          <div className="league-picker-grid" aria-label="Available leagues">
            {leagues.map((league) => {
              const isSelected = selectedLeagueId === league.id;

              return (
                <button
                  key={league.id}
                  type="button"
                  className={`league-choice-card ${isSelected ? "is-selected" : ""}`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedLeagueId(league.id)}
                >
                  <span className="league-choice-kicker">{league.shortName}</span>
                  <strong>{league.schedule}</strong>
                  <small>{league.spots}</small>
                  <span className="league-choice-action">
                    {isSelected ? <Check size={16} /> : <ChevronRight size={16} />}
                    {isSelected ? "Selected" : "View Standings"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="league-summary">
            <div>
              <span>Format</span>
              <strong>{selectedLeague.format}</strong>
            </div>
            <div>
              <span>Schedule</span>
              <strong>{selectedLeague.schedule}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{selectedLeague.registration}</strong>
            </div>
            <div>
              <span>Availability</span>
              <strong>{selectedLeague.spots}</strong>
            </div>
          </div>

          <div className="league-callout">
            <div>
              <span>Current Leader</span>
              <strong>{leader.player}</strong>
              <small>{leader.score.toLocaleString()} points</small>
            </div>
            <p>{selectedLeague.description}</p>
          </div>

          <button className="primary-action full-width" type="button" onClick={() => onSignup(selectedLeague)}>
            <UsersRound size={20} />
            Sign Up for This League
          </button>
        </div>

        <div className="panel league-table-panel">
          <div className="panel-heading league-standings-head">
            <div>
              <div className="eyebrow">{selectedLeague.shortName}</div>
              <h2>Standings</h2>
            </div>
            <span className="league-status-pill">{selectedLeague.registration}</span>
          </div>

          <div className="league-table">
            <div className="league-row table-head">
              <span>Rank</span>
              <span>Player</span>
              <span>Score</span>
              <span>Date</span>
              <span>Drill</span>
              <span>Change</span>
            </div>
            {selectedLeague.standings.map((row) => (
              <div key={row.player} className="league-row">
                <span>#{row.rank}</span>
                <strong>{row.player}</strong>
                <span>{row.score.toLocaleString()}</span>
                <span>{row.date}</span>
                <span>{row.lastDrill}</span>
                <span className={`trend trend-${row.trend}`}>{row.change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);

function Toast({ message }) {
  return (
    <div className="toast" role="status" aria-live="polite">
      <BadgeCheck size={20} />
      <span>{message}</span>
    </div>
  );
}
