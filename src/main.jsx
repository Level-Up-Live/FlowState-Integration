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
  CircleHelp,
  ClipboardCheck,
  Crown,
  Crosshair,
  Gauge,
  Gamepad2,
  Headphones,
  LifeBuoy,
  Medal,
  MonitorPlay,
  Package,
  Play,
  Radio,
  Save,
  Share2,
  ShieldCheck,
  Sparkles,
  Store,
  ShoppingCart,
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
const programStartCues = [
  { label: "SHOOTER READY", durationMs: 1500 },
  { label: "STANDBY", durationMs: 1500 }
];
const programFireCueIndex = programStartCues.length;

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
    scoring: "Each shot is worth up to 10 points. Score V1 scans the completed target after the drill."
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

const recentDrills = [
  { name: "Triples", score: 487, date: "Jul 8, 2026", accuracy: "95%" },
  { name: "Dot Grid Warmup", score: 456, date: "Jul 6, 2026", accuracy: "91%" },
  { name: "Slow Fire Precision", score: 472, date: "Jul 2, 2026", accuracy: "94%" }
];

const leaguePlayerPool = [
  "Alex Carter",
  "Jordan Lee",
  "Sam Rivera",
  "Morgan Blake",
  "Taylor Reed",
  "Riley Chen",
  "Casey Brooks",
  "Nina Patel",
  "Drew Mason",
  "Avery Collins",
  "Chris Vega",
  "Parker Stone",
  "Jamie Ellis",
  "Logan Price",
  "Mia Foster",
  "Noah Bennett",
  "Harper Quinn",
  "Evan Brooks",
  "Dana Wright",
  "Owen Pierce",
  "Maya Long",
  "Tyler Knox",
  "Quinn Adams",
  "Reese Walker"
];

const leagueDrillPool = [
  "League Qualifier",
  "Triples",
  "Dot Grid Warmup",
  "Precision Builder",
  "Steel Challenge Sprint",
  "Plate Rack",
  "Bill Drill",
  "Accelerator",
  "Slow Fire Precision",
  "One Hole Drill",
  "Draw to First Hit",
  "Reload Ready",
  "Target Transitions",
  "Failure to Stop"
];

const leagueTrendCycle = ["up", "same", "down", "up", "same"];

function buildLeagueStandings(seed, baseScore, step, drillOffset = 0) {
  return Array.from({ length: 20 }, (_, index) => {
    const trend = leagueTrendCycle[(seed + index) % leagueTrendCycle.length];
    const changeAmount = ((seed + index) % 3) + 1;

    return {
      rank: index + 1,
      change: trend === "same" ? "0" : trend === "down" ? `-${changeAmount}` : `+${changeAmount}`,
      player: leaguePlayerPool[(seed + index) % leaguePlayerPool.length],
      score: baseScore - index * step - ((seed + index * 7) % 13),
      lastDrill: leagueDrillPool[(drillOffset + index) % leagueDrillPool.length],
      date: `Jul ${Math.max(1, 10 - (index % 9))}, 2026`,
      trend
    };
  });
}

const leaguePrizePool = [
  { place: "1st", amount: "$150", award: "Range credit" },
  { place: "2nd", amount: "$75", award: "Pro shop" },
  { place: "3rd", amount: "$25", award: "Lane pass" }
];

const leagues = [
  {
    id: "summer",
    name: "Lake Erie Arms Summer League",
    shortName: "Summer League",
    format: "4-week pistol league",
    schedule: "Tuesdays at 6:30 PM",
    registration: "Registration open",
    registrationFee: "$45",
    spots: "8 players left",
    description: "Weekly scored course with Level Up Live standings after every completed run.",
    standings: buildLeagueStandings(2, 1928, 31, 0)
  },
  {
    id: "steel-sprint",
    name: "Steel Sprint League",
    shortName: "Steel Sprint",
    format: "Timed steel strings",
    schedule: "Wednesdays at 7:00 PM",
    registration: "Registration open",
    registrationFee: "$45",
    spots: "5 players left",
    description: "Speed-focused standings built from clean hits, transitions, and stage time.",
    standings: buildLeagueStandings(0, 884, 12, 4)
  },
  {
    id: "precision",
    name: "Precision Pistol League",
    shortName: "Precision Pistol",
    format: "Accuracy and consistency",
    schedule: "Thursdays at 6:00 PM",
    registration: "Registration open",
    registrationFee: "$50",
    spots: "12 players left",
    description: "A measured league for slow-fire accuracy, grouping, and repeatable performance.",
    standings: buildLeagueStandings(1, 1476, 18, 8)
  },
  {
    id: "carry",
    name: "Carry Skills League",
    shortName: "Carry Skills",
    format: "Practical defensive stages",
    schedule: "Saturdays at 10:00 AM",
    registration: "New session forming",
    registrationFee: "$45",
    spots: "16 players left",
    description: "Practical skill stages with scoring for accuracy, decisions, and controlled speed.",
    standings: buildLeagueStandings(3, 1218, 14, 10)
  },
  {
    id: "rimfire",
    name: "Rimfire Challenge League",
    shortName: "Rimfire Challenge",
    format: "Low recoil speed stages",
    schedule: "Mondays at 5:30 PM",
    registration: "Registration open",
    registrationFee: "$35",
    spots: "10 players left",
    description: "A low-recoil format focused on transitions, cadence, and clean target hits.",
    standings: buildLeagueStandings(5, 1088, 11, 5)
  },
  {
    id: "ladies-night",
    name: "Ladies Night League",
    shortName: "Ladies Night",
    format: "Skill-building league",
    schedule: "Fridays at 6:30 PM",
    registration: "Registration open",
    registrationFee: "$40",
    spots: "7 players left",
    description: "Friendly weekly standings built around confidence, accuracy, and repeatable reps.",
    standings: buildLeagueStandings(7, 1320, 16, 2)
  },
  {
    id: "action-pistol",
    name: "Action Pistol League",
    shortName: "Action Pistol",
    format: "Movement and transitions",
    schedule: "Sundays at 11:00 AM",
    registration: "New session forming",
    registrationFee: "$50",
    spots: "9 players left",
    description: "Dynamic stages with movement, target order, reloads, and scored transitions.",
    standings: buildLeagueStandings(9, 1764, 22, 12)
  },
  {
    id: "youth",
    name: "Youth Marksmanship League",
    shortName: "Youth League",
    format: "Coached fundamentals",
    schedule: "Sundays at 2:00 PM",
    registration: "Registration open",
    registrationFee: "$25",
    spots: "14 players left",
    description: "Coached fundamentals with short stages, safe handling, and steady scoring.",
    standings: buildLeagueStandings(11, 940, 10, 1)
  }
];

const storeTaxRate = 0.0725;
const storeCatalog = {
  rentals: {
    label: "Rentals",
    categories: ["Full Auto", "Semi-Auto", "Bolt", "Shotgun", "Handgun"],
    items: [
      { id: "rent-full-auto-mp5", category: "Full Auto", brand: "Heckler Range", name: "MP5 Experience", details: "9mm rental package", price: 59, inStock: true },
      { id: "rent-full-auto-m4", category: "Full Auto", brand: "Atlas Defense", name: "M4 Select-Fire", details: "5.56 lane rental", price: 75, inStock: true },
      { id: "rent-full-auto-uzi", category: "Full Auto", brand: "Vector Arms", name: "UZI Classic", details: "Compact SMG rental", price: 54, inStock: false },
      { id: "rent-semi-ar15", category: "Semi-Auto", brand: "Springfield", name: "Saint Victor", details: "5.56 carbine", price: 24, inStock: true },
      { id: "rent-semi-ruger1022", category: "Semi-Auto", brand: "Ruger", name: "10/22 Trainer", details: "22LR rifle", price: 15, inStock: true },
      { id: "rent-semi-scorpion", category: "Semi-Auto", brand: "CZ", name: "Scorpion EVO", details: "9mm PCC", price: 28, inStock: false },
      { id: "rent-bolt-700", category: "Bolt", brand: "Remington", name: "700 SPS", details: "308 precision rifle", price: 34, inStock: true },
      { id: "rent-bolt-tikka", category: "Bolt", brand: "Tikka", name: "T3x Lite", details: "6.5 Creedmoor", price: 38, inStock: true },
      { id: "rent-bolt-rpr", category: "Bolt", brand: "Ruger", name: "Precision Rifle", details: "6mm Creedmoor", price: 42, inStock: false },
      { id: "rent-shotgun-1301", category: "Shotgun", brand: "Beretta", name: "1301 Tactical", details: "12ga semi-auto", price: 32, inStock: true },
      { id: "rent-shotgun-500", category: "Shotgun", brand: "Mossberg", name: "500 Field", details: "12ga pump", price: 21, inStock: true },
      { id: "rent-shotgun-youth", category: "Shotgun", brand: "TriStar", name: "Viper Youth", details: "20ga trainer", price: 19, inStock: false },
      { id: "rent-handgun-g19", category: "Handgun", brand: "Glock", name: "G19 Gen5", details: "9mm compact", price: 18, inStock: true },
      { id: "rent-handgun-1911", category: "Handgun", brand: "Springfield", name: "1911 Loaded", details: "45 ACP classic", price: 22, inStock: true },
      { id: "rent-handgun-686", category: "Handgun", brand: "Smith & Wesson", name: "686 Plus", details: "38 Special revolver", price: 20, inStock: false }
    ]
  },
  ammo: {
    label: "Ammo",
    categories: ["22LR", "9mm", "38 SPC", "40 cal", "45", "223/556", "6mm", "6.5 Creedmoor", "308", "12ga", "20ga", "Specialty"],
    items: [
      { id: "ammo-22lr-cci", category: "22LR", brand: "CCI", name: "Mini-Mag 40gr", details: "100-round box", price: 12.99, inStock: true },
      { id: "ammo-22lr-federal", category: "22LR", brand: "Federal", name: "AutoMatch", details: "325-round box", price: 28.99, inStock: false },
      { id: "ammo-9mm-blazer", category: "9mm", brand: "Blazer", name: "115gr FMJ", details: "50-round box", price: 16.99, inStock: true },
      { id: "ammo-9mm-sig", category: "9mm", brand: "Sig Sauer", name: "124gr Elite", details: "50-round box", price: 21.49, inStock: true },
      { id: "ammo-38spc", category: "38 SPC", brand: "MagTech", name: "158gr LRN", details: "50-round box", price: 29.99, inStock: true },
      { id: "ammo-40", category: "40 cal", brand: "Winchester", name: "White Box 165gr", details: "50-round box", price: 27.99, inStock: false },
      { id: "ammo-45", category: "45", brand: "Federal", name: "American Eagle 230gr", details: "50-round box", price: 32.99, inStock: true },
      { id: "ammo-556", category: "223/556", brand: "PMC", name: "X-TAC 55gr", details: "20-round box", price: 13.99, inStock: true },
      { id: "ammo-6mm", category: "6mm", brand: "Hornady", name: "Match 108gr ELD", details: "20-round box", price: 43.99, inStock: false },
      { id: "ammo-65", category: "6.5 Creedmoor", brand: "Hornady", name: "Precision Hunter 143gr", details: "20-round box", price: 49.99, inStock: true },
      { id: "ammo-308", category: "308", brand: "Federal", name: "Gold Medal 168gr", details: "20-round box", price: 41.99, inStock: true },
      { id: "ammo-12ga", category: "12ga", brand: "Fiocchi", name: "Target Load 1oz", details: "25-round box", price: 12.49, inStock: true },
      { id: "ammo-20ga", category: "20ga", brand: "Winchester", name: "Super Target", details: "25-round box", price: 13.49, inStock: false },
      { id: "ammo-specialty", category: "Specialty", brand: "Action Range", name: "Tracer Demo Pack", details: "Range officer approval", price: 64.99, inStock: true }
    ]
  },
  equipment: {
    label: "Equipment",
    categories: ["Optic Accessories", "Zeroing Tools", "Furniture", "More"],
    items: [
      { id: "equip-optic-mount", category: "Optic Accessories", brand: "Scalar Peak", name: "30mm Cantilever Mount", details: "Lightweight optic mount", price: 89.99, inStock: true },
      { id: "equip-optic-battery", category: "Optic Accessories", brand: "Aimpoint", name: "CR2032 Optic Pack", details: "Range-ready battery kit", price: 9.99, inStock: true },
      { id: "equip-optic-riser", category: "Optic Accessories", brand: "Unity Range", name: "Micro Riser", details: "Lower-third riser", price: 74.99, inStock: false },
      { id: "equip-zero-bore", category: "Zeroing Tools", brand: "SightMark", name: "Laser Bore Sight", details: "Multi-caliber kit", price: 39.99, inStock: true },
      { id: "equip-zero-rest", category: "Zeroing Tools", brand: "Caldwell", name: "Lead Sled Solo", details: "Bench zeroing rest", price: 79.99, inStock: true },
      { id: "equip-zero-torque", category: "Zeroing Tools", brand: "Fix It Sticks", name: "Torque Driver", details: "Optic mounting kit", price: 119.99, inStock: false },
      { id: "equip-furniture-stock", category: "Furniture", brand: "Magpul", name: "CTR Stock", details: "Mil-spec carbine stock", price: 64.95, inStock: true },
      { id: "equip-furniture-grip", category: "Furniture", brand: "BCM", name: "Gunfighter Grip", details: "Mod 3 grip", price: 21.95, inStock: true },
      { id: "equip-furniture-rail", category: "Furniture", brand: "Bravo Range", name: "M-LOK Rail Covers", details: "6-piece kit", price: 18.99, inStock: false },
      { id: "equip-more-earpro", category: "More", brand: "Walker", name: "Razor Slim Ear Pro", details: "Electronic muffs", price: 49.99, inStock: true },
      { id: "equip-more-targets", category: "More", brand: "Action Target", name: "Precision Paper Pack", details: "25 paper targets", price: 14.99, inStock: true },
      { id: "equip-more-bag", category: "More", brand: "Savior", name: "Range Bag", details: "Pistol and ammo tote", price: 59.99, inStock: false }
    ]
  }
};

const storeTabs = Object.keys(storeCatalog);

const navItems = [
  { id: "lane", label: "Lane Screen", shortLabel: "Lane", icon: Target },
  { id: "scoring", label: "Score V1", shortLabel: "Score V1", icon: Crosshair },
  { id: "autoscore", label: "Score V2", shortLabel: "Score V2", icon: Crosshair },
  { id: "profile", label: "Profile", shortLabel: "Player", icon: UserRound },
  { id: "league", label: "League", shortLabel: "League", icon: Trophy },
  { id: "store", label: "Store", shortLabel: "Store", icon: Store },
  { id: "assistance", label: "Assistance", shortLabel: "Assist", icon: LifeBuoy }
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
  const [programStartCueIndex, setProgramStartCueIndex] = useState(0);
  const [axisAlert, setAxisAlert] = useState("Clear");
  const [playerSwitchOpen, setPlayerSwitchOpen] = useState(false);
  const [assistanceOpen, setAssistanceOpen] = useState(false);
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
    if (screen !== "programCountdown" || programStartCueIndex >= programFireCueIndex) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setProgramStartCueIndex((current) => Math.min(current + 1, programFireCueIndex));
    }, programStartCues[programStartCueIndex]?.durationMs ?? 1500);

    return () => window.clearTimeout(timeout);
  }, [programStartCueIndex, screen]);

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

  function handleNavigate(nextScreen) {
    if (nextScreen === "assistance") {
      setAssistanceOpen(true);
      return;
    }

    setScreen(nextScreen);
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
    setProgramStartCueIndex(0);
    setScreen("programCountdown");
  }

  function cancelProgramCountdown() {
    setProgramStartCueIndex(0);
    setScreen("instructions");
  }

  function openScoreV1FromFire() {
    setProgramStartCueIndex(0);
    setShotStep(0);
    setScoreDemoRunning(false);
    setScoreView("live");
    setScoreParticipantIndex(0);
    setScreen("scoring");
  }

  function playScoreDemo() {
    setScoreDemoRunning(false);
    setShotStep(activeScoreRun.length);
    notify("Target scan complete. Score V1 loaded all impacts.");
  }

  function showPreviousScoreParticipant() {
    if (scoreParticipants.length <= 1) {
      return;
    }

    setShotStep(0);
    setScoreDemoRunning(false);
    setScoreParticipantIndex((current) => (current - 1 + scoreParticipants.length) % scoreParticipants.length);
  }

  function showNextScoreParticipant() {
    if (scoreParticipants.length <= 1) {
      return;
    }

    setShotStep(0);
    setScoreDemoRunning(false);
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

  if (screen === "programCountdown") {
    return <ProgramCountdownScreen cueIndex={programStartCueIndex} onCancel={cancelProgramCountdown} onFire={openScoreV1FromFire} />;
  }

  return (
    <div className={`app-shell screen-${screen}`}>
      <Header
        axisLaneTimer={axisLaneTimer}
        onBrandClick={openWelcomeScreen}
        onTimerClick={openTimeoutScreen}
        selectedLane={selectedLane}
      />
      <Sidebar currentScreen={screen} onNavigate={handleNavigate} />
      <main className="main-stage">
        <div className={`content-frame ${screen === "scoring" && scoreView === "results" ? "is-score-results" : ""} ${screen === "scoring" && scoreView !== "results" ? "is-live-scoring is-score-v1" : ""} ${screen === "autoscore" ? "is-autoscore" : ""}`}>
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
                currentRank={currentRank}
                onShare={shareResult}
                onProfile={saveResultToProfile}
                onDone={closeResults}
              />
            ) : (
              <ScoreV1Scoring
                drill={activeDrill}
                scoreParticipant={activeScoreParticipant}
                scoreParticipants={scoreParticipants}
                visibleShots={shownVisibleShots}
                totalScore={totalScore}
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

          {screen === "store" && <StoreScreen selectedLane={selectedLane} />}
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

      {assistanceOpen && (
        <AssistanceModal
          selectedLane={selectedLane}
          onClose={() => setAssistanceOpen(false)}
        />
      )}

      {toast && <Toast key={toast.id} message={toast.message} />}

      <div className="orientation-notice" role="status" aria-live="polite">
        <MonitorPlay size={42} />
        <strong>Rotate tablet to landscape</strong>
        <span>This lane experience is designed for a horizontal tablet screen.</span>
      </div>
    </div>
  );
}

function Sidebar({ currentScreen, onNavigate }) {
  const activeNavId = ["drills", "instructions", "pos"].includes(currentScreen) ? "lane" : currentScreen;

  return (
    <aside className="sidebar">
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

function Header({ axisLaneTimer, onBrandClick, onTimerClick, selectedLane }) {
  return (
    <header className="topbar">
      <div>
        <div className="eyebrow brand-title-row">
          <button className="topbar-action-button" type="button" onClick={onBrandClick} aria-label="Open welcome screen">
            <img className="topbar-action-logo" src={actionTargetLogoSrc} alt="Action Target logo" />
          </button>
        </div>
      </div>
      <PoweredByLevelUpBadge className="topbar-powered-by" />
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

function ProgramCountdownScreen({ cueIndex, onCancel, onFire }) {
  const isFire = cueIndex >= programFireCueIndex;
  const cueLabel = isFire ? "FIRE" : (programStartCues[cueIndex]?.label ?? programStartCues[0].label);
  const handleScreenClick = () => {
    if (isFire) {
      onFire();
    }
  };
  const handleScreenKeyDown = (event) => {
    if (!isFire || !["Enter", " "].includes(event.key)) {
      return;
    }

    event.preventDefault();
    onFire();
  };
  const handleCancel = (event) => {
    event.stopPropagation();
    onCancel();
  };

  return (
    <section
      className={`program-countdown-screen ${isFire ? "is-fire" : ""}`}
      role={isFire ? "button" : "status"}
      tabIndex={isFire ? 0 : undefined}
      aria-label={isFire ? "Fire. Tap to open Score V1." : cueLabel}
      aria-live="assertive"
      onClick={handleScreenClick}
      onKeyDown={handleScreenKeyDown}
    >
      <strong>{cueLabel}</strong>
      {isFire && <span className="program-fire-instruction">Tap the screen when completed</span>}
      <button className="program-countdown-cancel" type="button" onClick={handleCancel}>
        Cancel
      </button>
    </section>
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

function ResultMetrics({ totalScore, currentRank, className = "result-grid" }) {
  return (
    <div className={className}>
      <Metric label="Final Score" value={totalScore} icon={Trophy} />
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

function formatStoreMoney(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function StoreScreen({ selectedLane }) {
  const [activeTab, setActiveTab] = useState(storeTabs[0]);
  const [selectedCategories, setSelectedCategories] = useState(() =>
    storeTabs.reduce((categoryState, tabId) => ({
      ...categoryState,
      [tabId]: storeCatalog[tabId].categories[0]
    }), {})
  );
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [waitEstimate, setWaitEstimate] = useState("");

  const activeSection = storeCatalog[activeTab];
  const selectedCategory = selectedCategories[activeTab] ?? activeSection.categories[0];
  const visibleItems = activeSection.items.filter((item) => item.category === selectedCategory);
  const allStoreItems = useMemo(() => storeTabs.flatMap((tabId) => storeCatalog[tabId].items), []);
  const cartItems = cart
    .map((entry) => {
      const item = allStoreItems.find((storeItem) => storeItem.id === entry.id);
      return item ? { ...item, quantity: entry.quantity } : null;
    })
    .filter(Boolean);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartTax = cartSubtotal * storeTaxRate;
  const cartTotal = cartSubtotal + cartTax;
  const cartCount = cart.reduce((sum, entry) => sum + entry.quantity, 0);

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setWaitEstimate("");
  }

  function handleCategoryChange(event) {
    setSelectedCategories((current) => ({
      ...current,
      [activeTab]: event.target.value
    }));
  }

  function addToCart(item) {
    if (!item.inStock) {
      return;
    }

    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) {
        return current.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry);
      }

      return [...current, { id: item.id, quantity: 1 }];
    });
    setWaitEstimate("");
  }

  function updateCartQuantity(itemId, delta) {
    setWaitEstimate("");
    setCart((current) =>
      current
        .map((entry) => entry.id === itemId ? { ...entry, quantity: entry.quantity + delta } : entry)
        .filter((entry) => entry.quantity > 0)
    );
  }

  function submitCart() {
    if (cartItems.length === 0) {
      return;
    }

    setWaitEstimate(`Estimated wait time for Lane ${selectedLane}: 12-18 minutes.`);
  }

  return (
    <section className="store-layout fade-in">
      <div className="panel store-panel">
        <div className="panel-heading store-heading">
          <div>
            <div className="eyebrow">Range Store</div>
            <h2>Order rentals, ammo, and gear</h2>
          </div>
          <button className="store-cart-button" type="button" onClick={() => setCartOpen(true)} aria-label={`Open shopping cart with ${cartCount} items`}>
            <ShoppingCart size={22} />
            <span>Cart</span>
            <strong>{cartCount}</strong>
          </button>
        </div>

        <div className="store-tabs" aria-label="Store departments">
          {storeTabs.map((tabId) => (
            <button
              key={tabId}
              type="button"
              className={activeTab === tabId ? "is-active" : ""}
              onClick={() => handleTabChange(tabId)}
            >
              {storeCatalog[tabId].label}
            </button>
          ))}
        </div>

        <div className="store-filter-row">
          <label htmlFor="store-category-select">{activeSection.label} category</label>
          <select id="store-category-select" value={selectedCategory} onChange={handleCategoryChange}>
            {activeSection.categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="store-grid" aria-label={`${selectedCategory} items`}>
          {visibleItems.map((item) => (
            <article key={item.id} className={`store-card ${item.inStock ? "" : "is-out"}`}>
              <div className="store-card-icon">
                <Package size={24} />
              </div>
              <div className="store-card-copy">
                <span>{item.brand}</span>
                <h3>{item.name}</h3>
                <p>{item.details}</p>
              </div>
              <div className="store-card-bottom">
                <strong>{formatStoreMoney(item.price)}</strong>
                <small>{item.inStock ? "Available now" : "Out of stock"}</small>
              </div>
              <button className="store-add-button" type="button" onClick={() => addToCart(item)} disabled={!item.inStock}>
                {item.inStock ? "Add" : "Unavailable"}
              </button>
            </article>
          ))}
        </div>
      </div>

      <StoreCartPanel
        cartItems={cartItems}
        subtotal={cartSubtotal}
        tax={cartTax}
        total={cartTotal}
        waitEstimate={waitEstimate}
        onCheckout={() => setCartOpen(true)}
        onUpdateQuantity={updateCartQuantity}
      />

      {cartOpen && (
        <StoreCartModal
          cartItems={cartItems}
          subtotal={cartSubtotal}
          tax={cartTax}
          total={cartTotal}
          waitEstimate={waitEstimate}
          onClose={() => setCartOpen(false)}
          onSubmit={submitCart}
          onUpdateQuantity={updateCartQuantity}
        />
      )}
    </section>
  );
}

function StoreCartPanel({ cartItems, subtotal, tax, total, waitEstimate, onCheckout, onUpdateQuantity }) {
  return (
    <aside className="panel store-cart-side-panel" aria-label="Current cart">
      <div className="panel-heading store-cart-side-heading">
        <div>
          <div className="eyebrow">My Cart</div>
          <h2>{cartItems.length === 0 ? "Empty" : `${cartItems.reduce((sum, item) => sum + item.quantity, 0)} items`}</h2>
        </div>
        <ShoppingCart size={24} />
      </div>

      <div className="store-cart-side-list">
        {cartItems.length === 0 ? (
          <div className="store-cart-empty is-compact">
            <ShoppingCart size={28} />
            <strong>No items yet</strong>
            <span>Add items from the left.</span>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="store-cart-side-row">
              <div>
                <strong>{item.name}</strong>
                <span>{item.brand}</span>
              </div>
              <div className="store-quantity-controls" aria-label={`${item.name} quantity`}>
                <button type="button" onClick={() => onUpdateQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}>-</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => onUpdateQuantity(item.id, 1)} aria-label={`Add one ${item.name}`}>+</button>
              </div>
              <b>{formatStoreMoney(item.price * item.quantity)}</b>
            </div>
          ))
        )}
      </div>

      <div className="store-cart-totals store-cart-side-totals" aria-label="Cart totals">
        <div>
          <span>Subtotal</span>
          <strong>{formatStoreMoney(subtotal)}</strong>
        </div>
        <div>
          <span>Tax</span>
          <strong>{formatStoreMoney(tax)}</strong>
        </div>
        <div className="is-total">
          <span>Total</span>
          <strong>{formatStoreMoney(total)}</strong>
        </div>
      </div>

      {waitEstimate && (
        <div className="store-wait-estimate store-side-wait" role="status">
          <ClipboardCheck size={20} />
          <strong>{waitEstimate}</strong>
        </div>
      )}

      <button className="primary-action full-width" type="button" onClick={onCheckout} disabled={cartItems.length === 0}>
        Review Cart
      </button>
    </aside>
  );
}

function StoreCartModal({ cartItems, subtotal, tax, total, waitEstimate, onClose, onSubmit, onUpdateQuantity }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-panel store-cart-modal" role="dialog" aria-modal="true" aria-labelledby="store-cart-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="panel-heading">
          <div>
            <div className="eyebrow">Shopping Cart</div>
            <h2 id="store-cart-title">Lane order</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close shopping cart">
            <X size={22} />
          </button>
        </div>

        <div className="store-cart-list">
          {cartItems.length === 0 ? (
            <div className="store-cart-empty">
              <ShoppingCart size={30} />
              <strong>No items selected</strong>
              <span>Add rentals, ammo, or gear from the Store page.</span>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="store-cart-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.brand} • {item.details}</span>
                </div>
                <div className="store-quantity-controls" aria-label={`${item.name} quantity`}>
                  <button type="button" onClick={() => onUpdateQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}>-</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => onUpdateQuantity(item.id, 1)} aria-label={`Add one ${item.name}`}>+</button>
                </div>
                <b>{formatStoreMoney(item.price * item.quantity)}</b>
              </div>
            ))
          )}
        </div>

        <div className="store-cart-totals" aria-label="Cart totals">
          <div>
            <span>Subtotal</span>
            <strong>{formatStoreMoney(subtotal)}</strong>
          </div>
          <div>
            <span>Tax</span>
            <strong>{formatStoreMoney(tax)}</strong>
          </div>
          <div className="is-total">
            <span>Total</span>
            <strong>{formatStoreMoney(total)}</strong>
          </div>
        </div>

        {waitEstimate && (
          <div className="store-wait-estimate" role="status">
            <ClipboardCheck size={22} />
            <strong>{waitEstimate}</strong>
          </div>
        )}

        <button className="primary-action full-width" type="button" onClick={onSubmit} disabled={cartItems.length === 0}>
          Submit Order
        </button>
      </div>
    </div>
  );
}

function AssistanceModal({ selectedLane, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-panel assistance-modal" role="dialog" aria-modal="true" aria-labelledby="assistance-title" onMouseDown={(event) => event.stopPropagation()}>
        <CircleHelp size={44} />
        <div>
          <div className="eyebrow">Lane {selectedLane} Assistance</div>
          <h2 id="assistance-title">A range officer will be with you shortly.</h2>
          <p>Click to cancel</p>
        </div>
        <button className="secondary-action full-width" type="button" onClick={onClose}>
          Cancel Request
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

function ScoreV1Scoring({
  drill,
  scoreParticipant,
  scoreParticipants,
  visibleShots,
  totalScore,
  shotCount,
  currentRank,
  shotStep,
  demoRunning,
  onPlay,
  onPreviousParticipant,
  onNextParticipant
}) {
  const scanComplete = shotStep >= 6;
  const playLabel = scanComplete ? "Rescan Target" : "Scan Target";
  const canCycleScores = scoreParticipants.length > 1;

  return (
    <section className="scoring-layout score-v1-layout fade-in">
      <div className="panel target-panel score-v1-target-panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">Score V1</div>
            <h2>
              {drill.name} • {scoreParticipant.player.name}
            </h2>
          </div>
          <span className="sim-label">{scanComplete ? "Scan Complete" : "Ready to Scan"}</span>
        </div>

        <div className="score-v1-instructions">
          <Camera size={28} />
          <div>
            <strong>Game complete.</strong>
            <span className="score-v1-scan-instruction">Please scan and take a photo of your target.</span>
          </div>
        </div>

        <div className={`target-and-feed score-v1-target-feed ${scanComplete ? "is-revealed" : ""}`}>
          <TargetDiagram visibleShots={visibleShots} />
          {!scanComplete && (
            <div className="score-v1-target-mask" aria-hidden="true">
              <FakeQrCode />
              <strong>Awaiting target photo</strong>
              <span>Scan to open target capture.</span>
            </div>
          )}
        </div>

        <div className="scoring-control-row">
          <button className="primary-action scoring-play-button" type="button" onClick={onPlay} disabled={demoRunning}>
            <Camera size={20} />
            {playLabel}
          </button>
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

      <div className="panel live-stats-panel score-v1-summary-panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">Scan Summary</div>
            <h2>{scanComplete ? `${shotCount}/6 holes found` : "Awaiting target photo"}</h2>
          </div>
          <div className="shot-log-score">
            <span>Total</span>
            <strong>{scanComplete ? totalScore : "--"}</strong>
          </div>
        </div>

        <div className="score-v1-scan-card">
          <Target size={30} />
          <strong>{scanComplete ? "All holes loaded at once." : "Ready for target scan."}</strong>
          <span>
            {scanComplete
              ? "The target photo has been processed and the graphic now shows every detected hole together."
              : "When the target is scanned, Score V1 reveals the full target result in one step."}
          </span>
        </div>

        <ResultMetrics totalScore={scanComplete ? totalScore : "--"} currentRank={currentRank} className="shot-log-summary score-v1-metrics" />
      </div>
    </section>
  );
}

function FakeQrCode() {
  return (
    <svg className="score-v1-fake-qr" viewBox="0 0 29 29" aria-hidden="true" focusable="false">
      <rect width="29" height="29" rx="2" fill="#ffffff" />
      <path fill="#0060A6" d="M3 3h7v7H3zM19 3h7v7h-7zM3 19h7v7H3z" />
      <path fill="#ffffff" d="M5 5h3v3H5zM21 5h3v3h-3zM5 21h3v3H5z" />
      <path
        fill="#0060A6"
        d="M12 3h2v2h-2zM15 4h2v2h-2zM12 7h1v2h-1zM15 8h3v2h-3zM12 12h3v3h-3zM16 12h2v1h-2zM20 12h2v2h-2zM24 12h2v3h-2zM3 12h2v2H3zM7 12h2v1H7zM10 13h1v3h-1zM18 15h3v2h-3zM23 17h3v2h-3zM12 18h2v2h-2zM15 18h1v3h-1zM18 20h2v2h-2zM21 21h2v1h-2zM24 22h2v4h-2zM12 23h3v3h-3zM16 24h2v2h-2zM20 24h2v2h-2z"
      />
    </svg>
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

function ResultsScreen({ player, drill, totalScore, currentRank, onShare, onProfile, onDone }) {
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
        <ResultMetrics totalScore={finalScore} currentRank={currentRank} />

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
                </button>
              );
            })}
          </div>
        </div>

        <div className="panel league-table-panel">
          <div className="panel-heading league-standings-head">
            <div>
              <div className="eyebrow">{selectedLeague.shortName}</div>
              <h2>Standings</h2>
            </div>
            <div className="league-standings-actions">
              <span className="league-fee-pill">
                <span>Registration Fee</span>
                <strong>{selectedLeague.registrationFee}</strong>
              </span>
              <button className="primary-action league-signup-compact" type="button" onClick={() => onSignup(selectedLeague)}>
                <UsersRound size={18} />
                <span>Sign Up</span>
              </button>
            </div>
          </div>

          <div className="league-detail-bar">
            <div>
              <span>Format</span>
              <strong>{selectedLeague.format}</strong>
            </div>
            <div>
              <span>Schedule</span>
              <strong>{selectedLeague.schedule}</strong>
            </div>
            <div>
              <span>Players Left</span>
              <strong>{selectedLeague.spots}</strong>
            </div>
          </div>

          <div className="league-story-strip">
            <div className="league-description-card">
              <span>About</span>
              <p>{selectedLeague.description}</p>
            </div>
            <div className="league-prize-card">
              <span>Prize Pool</span>
              <div className="league-prize-list">
                {leaguePrizePool.map((prize) => (
                  <div key={prize.place}>
                    <strong>{prize.place}</strong>
                    <b>{prize.amount}</b>
                    <small>{prize.award}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="league-table">
            <div className="league-row table-head">
              <span>Rank</span>
              <span>Player</span>
              <span>Score</span>
              <span>Drill</span>
              <span>Change</span>
            </div>
            <div className="league-roster-scroll">
              {selectedLeague.standings.map((row) => (
                <div key={row.player} className="league-row">
                  <span>#{row.rank}</span>
                  <strong>{row.player}</strong>
                  <span>{row.score.toLocaleString()}</span>
                  <span>{row.lastDrill}</span>
                  <span className={`trend trend-${row.trend}`}>{row.change}</span>
                </div>
              ))}
            </div>
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
