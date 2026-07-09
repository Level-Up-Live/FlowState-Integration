import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BadgeCheck,
  BarChart3,
  Bluetooth,
  Check,
  ChevronRight,
  CircleDot,
  Crosshair,
  Download,
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
  Zap
} from "lucide-react";
import "./styles.css";

const customers = [
  {
    id: "alex",
    name: "Alex Carter",
    username: "@alex.carter",
    avatar: "AC",
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
    rank: "Defender III",
    xp: 13640,
    nextRankXp: 16500,
    recentScore: 441,
    monthlyPosition: 11,
    badges: ["Reload Ready", "Fast Hands", "First Drill Complete"],
    friends: ["Alex Carter"],
    accent: "#ff7bc6"
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

const programCategories = ["Drills", "Skills", "Games", "Leagues", "Custom"];

const drills = [
  {
    id: "five-by-five-check",
    name: "Five by Five Check",
    category: "Drills",
    difficulty: "Beginner",
    time: "6 min",
    rounds: 25,
    description: "Five strings of five shots focused on clean sight alignment and steady pace.",
    instructions: "Fire five 5-shot strings at the scoring rings. Keep the target at 5 yards and wait for scoring after each string.",
    behavior: "Target stays at 5 yards, faces for each string, then edges while the camera confirms score.",
    scoring: "Each shot is worth up to 10 points. Clean strings earn a consistency bonus."
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
  name: "Five by Five Clean Target",
  meta: "5 yards • 25 rounds • Ring score + group bonus",
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

const visibleShots = [
  { id: 1, x: 48, y: 48, score: 10, split: "0.72" },
  { id: 2, x: 52, y: 49, score: 10, split: "0.31" },
  { id: 3, x: 50, y: 53, score: 10, split: "0.34" },
  { id: 4, x: 46, y: 51, score: 10, split: "0.33" },
  { id: 5, x: 55, y: 47, score: 9, split: "0.36" },
  { id: 6, x: 49, y: 45, score: 10, split: "0.30" },
  { id: 7, x: 53, y: 55, score: 9, split: "0.38" },
  { id: 8, x: 44, y: 48, score: 9, split: "0.41" },
  { id: 9, x: 51, y: 43, score: 10, split: "0.35" },
  { id: 10, x: 57, y: 52, score: 8, split: "0.40" },
  { id: 11, x: 47, y: 56, score: 9, split: "0.37" },
  { id: 12, x: 50, y: 50, score: 10, split: "0.32" },
  { id: 13, x: 54, y: 50, score: 10, split: "0.34" },
  { id: 14, x: 48, y: 54, score: 9, split: "0.39" },
  { id: 15, x: 52, y: 46, score: 10, split: "0.33" }
];

const inferredShots = [
  { id: 16, score: 10, split: "0.35" },
  { id: 17, score: 10, split: "0.36" },
  { id: 18, score: 10, split: "0.34" },
  { id: 19, score: 10, split: "0.37" },
  { id: 20, score: 10, split: "0.35" }
];

const recentDrills = [
  { name: "Five by Five Check", score: 487, date: "Jul 8, 2026", accuracy: "95%" },
  { name: "Dot Grid Warmup", score: 456, date: "Jul 6, 2026", accuracy: "91%" },
  { name: "Slow Fire Precision", score: 472, date: "Jul 2, 2026", accuracy: "94%" }
];

const leagueRows = [
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
    lastDrill: "Five by Five Check",
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
];

const navItems = [
  { id: "lane", label: "Lane Screen", shortLabel: "Lane", icon: Target },
  { id: "friends", label: "Friend Play", shortLabel: "Lanes", icon: UsersRound },
  { id: "scoring", label: "Live Scoring", shortLabel: "Score", icon: Crosshair },
  { id: "results", label: "Results", shortLabel: "Result", icon: Medal },
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
  const [selectedCompetitorLanes, setSelectedCompetitorLanes] = useState([3, 4, 5]);
  const [shotStep, setShotStep] = useState(20);
  const [axisDistance, setAxisDistance] = useState(7);
  const [axisTargetState, setAxisTargetState] = useState("Face");
  const [axisProgramMode, setAxisProgramMode] = useState("Randomized");
  const [axisLightingScene, setAxisLightingScene] = useState("Training Bright");
  const [axisLaneTimer, setAxisLaneTimer] = useState("07:00");
  const [axisAlert, setAxisAlert] = useState("Clear");
  const [toast, setToast] = useState(null);

  const activeCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0];
  const activeDrill = drills.find((drill) => drill.id === selectedDrillId) ?? drills[0];

  const shownVisibleShots = visibleShots.slice(0, Math.min(shotStep, visibleShots.length));
  const shownInferredShots = shotStep > visibleShots.length ? inferredShots.slice(0, shotStep - visibleShots.length) : [];
  const allShownShots = [...shownVisibleShots, ...shownInferredShots];
  const totalScore = allShownShots.reduce((sum, shot) => sum + shot.score, 0);
  const maxScore = Math.max(allShownShots.length * 10, 1);
  const accuracy = Math.round((totalScore / maxScore) * 100);
  const shotCount = allShownShots.length;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPromptIndex((current) => (current + 1) % spokenPrompts.length);
    }, 2400);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const invitedCompetitors = useMemo(
    () => laneCompetitors.filter((competitor) => selectedCompetitorLanes.includes(competitor.lane)),
    [selectedCompetitorLanes]
  );

  const rankedCompetitors = useMemo(
    () =>
      [...invitedCompetitors]
        .map((competitor) => ({
          ...competitor,
          score: competitor.lane === selectedLane ? Math.max(totalScore + 292, competitor.score) : competitor.score
        }))
        .sort((a, b) => b.score - a.score),
    [invitedCompetitors, selectedLane, totalScore]
  );

  const currentRank = rankedCompetitors.findIndex((competitor) => competitor.lane === selectedLane) + 1;

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

  function toggleCompetitorLane(lane) {
    const competitor = laneCompetitors.find((item) => item.lane === lane);
    if (!competitor || competitor.status === "Open") {
      return;
    }
    setSelectedCompetitorLanes((current) =>
      current.includes(lane) ? current.filter((item) => item !== lane) : [...current, lane].sort((a, b) => a - b)
    );
  }

  function startDrill() {
    setShotStep(20);
    setScreen("scoring");
    notify(`${activeDrill.name} started on Lane ${selectedLane}.`);
  }

  function startSharedDrill() {
    setShotStep(20);
    setScreen("scoring");
    notify(`Lanes ${selectedCompetitorLanes.join(", ")} synced for ${activeDrill.name}.`);
  }

  function handleAudioConnect(device) {
    setConnectedDevice(device);
    notify(`${device} connected. Audio prompts are enabled.`);
  }

  function finishDrill() {
    setScreen("results");
    notify(`${activeDrill.name} results are ready.`);
  }

  function shareResult() {
    notify(`Share card prepared for ${activeCustomer.name}'s ${activeDrill.name} score.`);
  }

  function saveResultToProfile() {
    setScreen("profile");
    notify(`Result saved to ${activeCustomer.name}'s player profile.`);
  }

  function exportLeague() {
    notify("Lake Erie Arms Summer League export is ready for staff.");
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
      setAxisLaneTimer(updates.laneTimer);
    }

    if (updates.alert) {
      setAxisAlert(updates.alert);
    }

    notify(`SmartRange AXIS command sent: ${command}.`);
  }

  return (
    <div className="app-shell">
      <Sidebar currentScreen={screen} onNavigate={setScreen} />
      <main className="main-stage">
        <Header
          activeCustomer={activeCustomer}
          activeDrill={activeDrill}
          selectedLane={selectedLane}
        />
        <div className="content-frame">
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
              drill={activeDrill}
              connectedDevice={connectedDevice}
              axisDistance={axisDistance}
              axisTargetState={axisTargetState}
              axisProgramMode={axisProgramMode}
              axisLightingScene={axisLightingScene}
              axisLaneTimer={axisLaneTimer}
              axisAlert={axisAlert}
              onAxisCommand={runAxisCommand}
              onChooseDrill={() => setScreen("drills")}
              onFriendPlay={() => setScreen("friends")}
            />
          )}

          {screen === "drills" && <ProgramSelection programs={drills} activeProgramId={selectedDrillId} onSelectProgram={selectDrill} />}

          {screen === "instructions" && (
            <InstructionScreen
              drill={activeDrill}
              connectedDevice={connectedDevice}
              axisDistance={axisDistance}
              axisTargetState={axisTargetState}
              axisProgramMode={axisProgramMode}
              axisLightingScene={axisLightingScene}
              axisLaneTimer={axisLaneTimer}
              axisAlert={axisAlert}
              onAxisCommand={runAxisCommand}
              onOpenAudio={() => setAudioModalOpen(true)}
              onStart={startDrill}
            />
          )}

          {screen === "friends" && (
            <FriendPlay
              selectedLane={selectedLane}
              selectedCompetitorLanes={selectedCompetitorLanes}
              onToggleLane={toggleCompetitorLane}
              rankedCompetitors={rankedCompetitors}
              onStart={startSharedDrill}
            />
          )}

          {screen === "scoring" && (
            <LiveScoring
              drill={activeDrill}
              selectedLane={selectedLane}
              connectedDevice={connectedDevice}
              axisDistance={axisDistance}
              axisTargetState={axisTargetState}
              axisProgramMode={axisProgramMode}
              axisLightingScene={axisLightingScene}
              axisLaneTimer={axisLaneTimer}
              axisAlert={axisAlert}
              prompt={spokenPrompts[promptIndex]}
              visibleShots={shownVisibleShots}
              inferredShots={shownInferredShots}
              totalScore={totalScore}
              accuracy={accuracy}
              shotCount={shotCount}
              currentRank={currentRank}
              shotStep={shotStep}
              onShotStep={setShotStep}
              onOpenAudio={() => setAudioModalOpen(true)}
              onFinish={finishDrill}
            />
          )}

          {screen === "results" && (
            <ResultsScreen
              player={activeCustomer}
              drill={activeDrill}
              totalScore={totalScore}
              accuracy={accuracy}
              currentRank={currentRank}
              onShare={shareResult}
              onProfile={saveResultToProfile}
            />
          )}

          {screen === "profile" && <PlayerProfile player={activeCustomer} onDrills={() => setScreen("drills")} />}

          {screen === "league" && <LeagueScreen onExport={exportLeague} />}
        </div>
      </main>

      {audioModalOpen && (
        <BluetoothModal
          connectedDevice={connectedDevice}
          onConnect={handleAudioConnect}
          onClose={() => setAudioModalOpen(false)}
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
      <div className="brand-block">
        <div className="brand-mark">
          <Zap size={24} />
        </div>
        <div>
          <strong>Level Up Live</strong>
          <span>FlowState Lane Integration</span>
        </div>
      </div>

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

function Header({ activeCustomer, activeDrill, selectedLane }) {
  return (
    <header className="topbar">
      <div>
        <div className="eyebrow">Level Up Live</div>
        <h1>FlowState POS to Level Up Live Lane Takeover</h1>
      </div>
      <div className="session-strip">
        <Avatar player={activeCustomer} size="small" />
        <div>
          <strong>{activeCustomer.name}</strong>
          <span>
            Lane {selectedLane} • {activeDrill.name}
          </span>
        </div>
      </div>
    </header>
  );
}

function Avatar({ player, size = "large" }) {
  return (
    <div className={`avatar avatar-${size}`} style={{ "--avatar-accent": player.accent }}>
      {player.avatar}
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
  drill,
  connectedDevice,
  axisDistance,
  axisTargetState,
  axisProgramMode,
  axisLightingScene,
  axisLaneTimer,
  axisAlert,
  onAxisCommand,
  onChooseDrill,
  onFriendPlay
}) {
  return (
    <section className="fade-in lane-layout">
      <div className="lane-hero panel">
        <div className="scan-line" />
        <div className="lane-player">
          <Avatar player={player} />
          <div>
            <div className="eyebrow">Level Up Live takeover active</div>
            <h2>{player.name}</h2>
            <p>XP {player.xp.toLocaleString()} • Score {player.recentScore}</p>
          </div>
          <div className="lane-number">
            <span>Lane</span>
            <strong>{selectedLane}</strong>
          </div>
        </div>

        <div className="lane-action-row">
          <button className="program-card" type="button" onClick={onChooseDrill}>
            <Gamepad2 size={24} />
            <span>Programs</span>
            <strong>Choose Drill</strong>
          </button>
          <Metric label="Audio" value={connectedDevice ? "Enabled" : "Not Connected"} icon={Headphones} />
        </div>

        <div className="badge-row">
          {player.badges.map((badge) => (
            <span key={badge} className="achievement-badge">
              <Sparkles size={15} />
              {badge}
            </span>
          ))}
        </div>

        <AxisCommandConsole
          drill={drill}
          axisDistance={axisDistance}
          axisTargetState={axisTargetState}
          axisProgramMode={axisProgramMode}
          axisLightingScene={axisLightingScene}
          axisLaneTimer={axisLaneTimer}
          axisAlert={axisAlert}
          onAxisCommand={onAxisCommand}
        />

        <div className="hero-actions">
          <button className="secondary-action large" type="button" onClick={onFriendPlay}>
            <UsersRound size={22} />
            Invite Nearby Lanes
          </button>
        </div>
      </div>
    </section>
  );
}

function AxisCommandConsole({
  drill,
  axisDistance,
  axisTargetState,
  axisProgramMode,
  axisLightingScene,
  axisLaneTimer,
  axisAlert,
  onAxisCommand
}) {
  const nextLightingScene = axisLightingScene === "Training Bright" ? "Low Light" : "Training Bright";
  const nextAlert = axisAlert === "Clear" ? "Visual Alert" : "Clear";

  return (
    <div className="axis-console">
      <div className="axis-readouts">
        <AxisReadout icon={Target} label="Retriever" value={`${axisDistance} yd / ${axisTargetState}`} />
        <AxisReadout icon={Timer} label="Program" value={`${drill.name} • ${axisProgramMode}`} />
        <AxisReadout icon={Gauge} label="Lane Timer" value={`${axisLaneTimer} • ${axisAlert}`} />
        <AxisReadout icon={ShieldCheck} label="Lighting" value={axisLightingScene} />
      </div>

      <div className="distance-actions" aria-label="Target distance options">
        {targetDistanceOptions.map((distance) => (
          <button
            key={distance}
            type="button"
            aria-label={`Send target to ${distance} yards`}
            className={axisDistance === distance ? "is-active" : ""}
            onClick={() => onAxisCommand(`send target to ${distance} yards`, { distance })}
          >
            {distance}
          </button>
        ))}
      </div>

      <div className="axis-actions" aria-label="SmartRange AXIS lane commands">
        <button type="button" onClick={() => onAxisCommand("face target", { targetState: "Face" })}>
          <Radio size={17} />
          Face
        </button>
        <button type="button" onClick={() => onAxisCommand("edge target", { targetState: "Edge" })}>
          <Radio size={17} />
          Edge
        </button>
        <button type="button" onClick={() => onAxisCommand("recall target", { distance: 0, targetState: "Face", alert: "Clear" })}>
          <ChevronRight size={17} />
          Recall
        </button>
        <button
          type="button"
          onClick={() =>
            onAxisCommand("randomized exposure program", {
              programMode: "Randomized",
              laneTimer: "07:00",
              alert: "Clear"
            })
          }
        >
          <Play size={17} />
          Program
        </button>
        <button type="button" onClick={() => onAxisCommand(`${nextLightingScene} lighting scene`, { lightingScene: nextLightingScene })}>
          <Zap size={17} />
          Light
        </button>
        <button type="button" onClick={() => onAxisCommand(`${nextAlert.toLowerCase()} state`, { alert: nextAlert })}>
          <ShieldCheck size={17} />
          Alert
        </button>
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

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="metric-card">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
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
            <div className="program-meta">
              <span>
                <Timer size={15} />
                {program.time}
              </span>
              <span>
                <Gauge size={15} />
                {program.rounds} rounds
              </span>
            </div>
            <button className="card-action" type="button" onClick={() => onSelectProgram(program.id)}>
              Start
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
  axisDistance,
  axisTargetState,
  axisProgramMode,
  axisLightingScene,
  axisLaneTimer,
  axisAlert,
  onAxisCommand,
  onOpenAudio,
  onStart
}) {
  return (
    <section className="instruction-layout fade-in">
      <div className="panel instruction-card">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">Pre-Drill Briefing</div>
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
          <InfoBox label="Estimated Time" value={drill.time} icon={Timer} />
          <InfoBox label="Target Behavior" value={drill.behavior} icon={Target} />
          <InfoBox label="Scoring Rules" value={drill.scoring} icon={BarChart3} />
        </div>

        <div className="axis-program-card">
          <div>
            <span>AXIS Program</span>
            <strong>{axisProgramMode} • {axisDistance} yd • {axisTargetState} • {axisLaneTimer}</strong>
          </div>
          <div>
            <span>Lane Systems</span>
            <strong>{axisLightingScene} lighting, alert {axisAlert.toLowerCase()}</strong>
          </div>
          <button
            type="button"
            className="secondary-action"
            onClick={() =>
              onAxisCommand(`${drill.name} program staged`, {
                distance: 7,
                targetState: "Face",
                programMode: "Randomized",
                laneTimer: "07:00",
                alert: "Clear"
              })
            }
          >
            <Target size={18} />
            Stage AXIS Program
          </button>
        </div>

        <div className="instruction-actions">
          <button className="secondary-action" type="button" onClick={onOpenAudio}>
            <Headphones size={21} />
            {connectedDevice ? `Connected: ${connectedDevice}` : "Connect Bluetooth Headphones"}
          </button>
          <button className="primary-action" type="button" onClick={onStart}>
            <Play size={21} />
            Start Drill
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

function FriendPlay({ selectedLane, selectedCompetitorLanes, onToggleLane, rankedCompetitors, onStart }) {
  return (
    <section className="friend-layout fade-in">
      <div className="panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">Multi-Lane Friend Play</div>
            <h2>Select nearby lanes to compete</h2>
          </div>
        </div>
        <div className="lane-select-list">
          {laneCompetitors.map((competitor) => {
            const isSelected = selectedCompetitorLanes.includes(competitor.lane);
            const isOpen = competitor.status === "Open";
            return (
              <button
                key={competitor.lane}
                type="button"
                className={`competitor-row ${isSelected ? "is-selected" : ""} ${isOpen ? "is-disabled" : ""}`}
                disabled={isOpen}
                onClick={() => onToggleLane(competitor.lane)}
              >
                <span className="lane-chip">Lane {competitor.lane}</span>
                <strong>{competitor.name}</strong>
                <small>{competitor.lane === selectedLane ? "Current player" : competitor.status}</small>
                {isSelected && <Check size={20} />}
              </button>
            );
          })}
        </div>
        <button className="primary-action full-width" type="button" onClick={onStart}>
          <Play size={20} />
          Start Shared Drill
        </button>
      </div>

      <div className="panel scoreboard-panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">Shared Scoreboard</div>
            <h2>Connected lane screens</h2>
          </div>
        </div>
        <Scoreboard rows={rankedCompetitors} selectedLane={selectedLane} />
      </div>
    </section>
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

function LiveScoring({
  drill,
  selectedLane,
  connectedDevice,
  axisDistance,
  axisTargetState,
  axisProgramMode,
  axisLightingScene,
  axisLaneTimer,
  axisAlert,
  prompt,
  visibleShots,
  inferredShots,
  totalScore,
  accuracy,
  shotCount,
  currentRank,
  shotStep,
  onShotStep,
  onOpenAudio,
  onFinish
}) {
  const latestShots = [...visibleShots, ...inferredShots].slice(-4);
  const liveAxisEvents = [
    "AXIS Connect: POS session active",
    `Program ${axisProgramMode} • Timer ${axisLaneTimer}`,
    axisAlert === "Clear" ? "Safety interlock clear" : "Visual alert active"
  ];

  return (
    <section className="scoring-layout fade-in">
      <div className="panel target-panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">Live Scoring</div>
            <h2>
              {drill.name} • Lane {selectedLane}
            </h2>
          </div>
        </div>

        <div className="target-and-feed">
          <TargetDiagram visibleShots={visibleShots} inferredCount={inferredShots.length} />
          <div className="shot-feed">
            <div className="audio-callout">
              <Radio size={21} />
              <span>{connectedDevice ? "Audio instructions enabled" : "Audio available"}</span>
              <strong>{prompt}</strong>
              <button className="mini-button" type="button" onClick={onOpenAudio}>
                <Headphones size={15} />
                Audio
              </button>
            </div>

            <div className="shot-list">
              {latestShots.map((shot) => (
                <div key={shot.id} className="shot-row">
                  <span>Shot {shot.id}</span>
                  <strong>{shot.score} pts</strong>
                  <small>{shot.x ? `${shot.x}, ${shot.y}` : "Inferred center pass-through"}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="camera-assisted">
          <BadgeCheck size={22} />
          <div>
            <strong>Camera Assisted Scoring</strong>
            <span>
              15 visible impacts detected. 5 center pass-through rounds inferred from grouping density and shot count.
            </span>
          </div>
        </div>

        <div className="shot-controls" aria-label="Scoring playback controls">
          {[5, 10, 15, 20].map((value) => (
            <button
              key={value}
              type="button"
              className={shotStep === value ? "is-active" : ""}
              onClick={() => onShotStep(value)}
            >
              {value} shots
            </button>
          ))}
        </div>
      </div>

      <div className="panel live-stats-panel">
        <div className="axis-live-strip">
          <AxisReadout icon={Target} label="Target" value={`${axisDistance} yd / ${axisTargetState}`} />
          <AxisReadout icon={ShieldCheck} label="Lighting" value={axisLightingScene} />
        </div>
        <div className="axis-event-feed">
          {liveAxisEvents.map((event) => (
            <div key={event}>
              <CircleDot size={12} />
              <span>{event}</span>
            </div>
          ))}
        </div>
        <div className="live-metrics">
          <Metric label="Shot Count" value={`${shotCount}/20`} icon={Crosshair} />
          <Metric label="Total Score" value={totalScore} icon={Trophy} />
          <Metric label="Accuracy" value={`${accuracy}%`} icon={Target} />
          <Metric label="Friend Rank" value={`#${currentRank || 1}`} icon={Medal} />
          <Metric label="Group Size" value="1.8 in" icon={Gauge} />
          <Metric label="Avg Split" value="0.35 s" icon={Timer} />
        </div>

        <button className="primary-action full-width" type="button" onClick={onFinish}>
          Finish Drill + Show Results
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}

function TargetDiagram({ visibleShots, inferredCount }) {
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
        <circle cx="50" cy="50" r="38" fill="none" stroke="#dbeafe" strokeOpacity="0.35" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="28" fill="none" stroke="#32a7ff" strokeOpacity="0.65" strokeWidth="1.2" />
        <circle cx="50" cy="50" r="18" fill="none" stroke="#25f46d" strokeOpacity="0.85" strokeWidth="1.4" />
        <circle cx="50" cy="50" r="8" fill="#25f46d" fillOpacity="0.16" stroke="#25f46d" strokeWidth="1.2" />
        <line x1="50" x2="50" y1="8" y2="92" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="0.5" />
        <line x1="8" x2="92" y1="50" y2="50" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="0.5" />
        {visibleShots.map((shot) => (
          <g key={shot.id}>
            <circle cx={shot.x} cy={shot.y} r="1.9" fill="#ffffff" stroke="#25f46d" strokeWidth="0.8" />
            <circle cx={shot.x} cy={shot.y} r="3.5" fill="none" stroke="#25f46d" strokeOpacity="0.28" strokeWidth="0.6" />
          </g>
        ))}
        {inferredCount > 0 && (
          <g>
            <circle cx="50" cy="50" r="6.5" fill="none" stroke="#fbf35d" strokeDasharray="2 1.5" strokeWidth="1.2" />
            <text x="50" y="70" textAnchor="middle" fill="#fbf35d" fontSize="4.5">
              +{inferredCount} inferred
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

function ResultsScreen({ player, drill, totalScore, accuracy, currentRank, onShare, onProfile }) {
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
        <div className="result-score">{Math.max(totalScore, 187)} pts</div>
        <div className="result-actions">
          <button className="secondary-action" type="button" onClick={onShare}>
            <Share2 size={20} />
            Share
          </button>
          <button className="primary-action" type="button" onClick={onProfile}>
            <Save size={20} />
            Save to Player Profile
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="result-grid">
          <Metric label="Final Score" value={Math.max(totalScore, 187)} icon={Trophy} />
          <Metric label="Accuracy" value={`${Math.max(accuracy, 94)}%`} icon={Target} />
          <Metric label="Group Size" value="1.8 in" icon={Gauge} />
          <Metric label="Friend Rank" value={`#${currentRank || 1}`} icon={Medal} />
          <Metric label="XP Gained" value="+840" icon={Zap} />
          <Metric label="Personal Best" value="Yes" icon={Sparkles} />
        </div>

        <div className="badge-unlocked">
          <BadgeCheck size={28} />
          <div>
            <strong>Badge unlocked: Tight Group</strong>
            <span>Also eligible: First Drill Complete, Lane Champion, 90% Accuracy Club, Fast Hands, Perfect String.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlayerProfile({ player, onDrills }) {
  const progress = Math.round((player.xp / player.nextRankXp) * 100);

  return (
    <section className="profile-layout fade-in">
      <div className="panel profile-card">
        <Avatar player={player} />
        <div className="eyebrow">Level Up Live Player Profile</div>
        <h2>{player.name}</h2>
        <p>{player.username}</p>
        <strong>{player.rank}</strong>
        <div className="xp-bar" aria-label={`${progress}% XP progress`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <small>
          {player.xp.toLocaleString()} / {player.nextRankXp.toLocaleString()} XP
        </small>
        <button className="primary-action full-width" type="button" onClick={onDrills}>
          <Gamepad2 size={20} />
          Start Another Drill
        </button>
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

function LeagueScreen({ onExport }) {
  return (
    <section className="fade-in">
      <div className="section-head">
        <div>
          <div className="eyebrow">Range Operations</div>
          <h2>Lake Erie Arms Summer League</h2>
        </div>
        <div className="section-actions">
          <span className="sim-label">Auto-scored by Level Up Live + Action Target SmartRange AXIS data</span>
          <button className="secondary-action" type="button" onClick={onExport}>
            <Download size={19} />
            Export
          </button>
        </div>
      </div>

      <div className="league-layout">
        <div className="panel league-table-panel">
          <div className="league-table">
            <div className="league-row table-head">
              <span>Rank</span>
              <span>Player</span>
              <span>Score</span>
              <span>Date</span>
              <span>Drill</span>
              <span>Change</span>
            </div>
            {leagueRows.map((row) => (
              <div key={row.player} className="league-row">
                <span>#{row.rank}</span>
                <strong>{row.player}</strong>
                <span>{row.score}</span>
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
