import React, { useEffect, useMemo, useRef, useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import * as THREE from "three";
import "./gameProgress.css";

const PROGRESS_FIELDS = `
  progressId
  userId
  level
  experiencePoints
  score
  rank
  achievements
  progress
  lastPlayed
  updatedAt
`;

const LEADERBOARD_QUERY = gql`
  query GetLeaderboard($limit: Int) {
    leaderboard(limit: $limit) {
      ${PROGRESS_FIELDS}
    }
  }
`;

const PROGRESS_LIST_QUERY = gql`
  query GetGameProgressList {
    gameProgressList {
      ${PROGRESS_FIELDS}
    }
  }
`;

const USER_PROGRESS_QUERY = gql`
  query GetGameProgressByUser($userId: ID!) {
    gameProgressByUser(userId: $userId) {
      ${PROGRESS_FIELDS}
    }
  }
`;

const ADD_PROGRESS_MUTATION = gql`
  mutation AddGameProgress(
    $userId: ID!
    $level: Int!
    $experiencePoints: Int!
    $score: Int!
    $rank: Int
    $achievements: [String!]
    $progress: String!
    $lastPlayed: String
  ) {
    addGameProgress(
      userId: $userId
      level: $level
      experiencePoints: $experiencePoints
      score: $score
      rank: $rank
      achievements: $achievements
      progress: $progress
      lastPlayed: $lastPlayed
    ) {
      ${PROGRESS_FIELDS}
    }
  }
`;

const UPDATE_PROGRESS_MUTATION = gql`
  mutation UpdateGameProgress(
    $progressId: ID!
    $level: Int
    $experiencePoints: Int
    $score: Int
    $rank: Int
    $achievements: [String!]
    $progress: String
    $lastPlayed: String
  ) {
    updateGameProgress(
      progressId: $progressId
      level: $level
      experiencePoints: $experiencePoints
      score: $score
      rank: $rank
      achievements: $achievements
      progress: $progress
      lastPlayed: $lastPlayed
    ) {
      ${PROGRESS_FIELDS}
    }
  }
`;

// ─── Helpers (unchanged) ──────────────────────────────────────────────────────

const readSessionUserId = () => {
  if (typeof window === "undefined") return "";
  try {
    const raw = sessionStorage.getItem("jwt");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.user?.userId || "";
  } catch {
    return "";
  }
};

const initialForm = {
  level: "1",
  experiencePoints: "0",
  score: "0",
  rank: "",
  progress: "Not started",
  achievementsInput: "",
};

const toInteger = (value, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toOptionalInteger = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return undefined;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const parseAchievements = (input) =>
  String(input || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

const formatDate = (isoDate) => {
  if (!isoDate) return "N/A";
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
};

// ─── Three.js: floating particle background ───────────────────────────────────

function ParticleBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth;
    const H = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.z = 30;

    // Teal/green particles to match --gp-accent palette
    const count = 500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 120;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x49dcb1,
      size: 0.18,
      transparent: true,
      opacity: 0.55,
    });
    const stars = new THREE.Points(geo, mat);
    scene.add(stars);

    // Slow-spinning hex rings
    const rings = [];
    for (let i = 0; i < 8; i++) {
      const rGeo = new THREE.TorusGeometry(4 + i * 1.5, 0.04, 6, 6);
      const rMat = new THREE.MeshBasicMaterial({
        color: 0x12b981,
        transparent: true,
        opacity: 0.06 + Math.random() * 0.07,
      });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20 - 10
      );
      ring.rotation.x = Math.random() * Math.PI;
      ring.userData.speed = 0.002 + Math.random() * 0.004;
      scene.add(ring);
      rings.push(ring);
    }

    let animId;
    const tick = () => {
      animId = requestAnimationFrame(tick);
      stars.rotation.y += 0.0008;
      stars.rotation.x += 0.0003;
      rings.forEach((r) => {
        r.rotation.z += r.userData.speed;
        r.rotation.x += r.userData.speed * 0.4;
      });
      renderer.render(scene, camera);
    };
    tick();

    const onResize = () => {
      const nW = el.clientWidth;
      const nH = el.clientHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="gp-three-bg" aria-hidden="true" />;
}

// ─── Three.js: XP progress ring ───────────────────────────────────────────────

function XPRing({ experiencePoints, level }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const SIZE = 120;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(SIZE, SIZE);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.z = 5;

    // Background torus
    const bgGeo = new THREE.TorusGeometry(1.5, 0.18, 16, 80);
    const bgMat = new THREE.MeshBasicMaterial({
      color: 0x0f2f25,
      transparent: true,
      opacity: 0.9,
    });
    scene.add(new THREE.Mesh(bgGeo, bgMat));

    // Progress arc — rebuilt when XP changes
    let arcMesh = null;
    const buildArc = (xp) => {
      if (arcMesh) scene.remove(arcMesh);
      const xpCap = 10000;
      const fraction = Math.min(1, xp / xpCap);
      const arcGeo = new THREE.TorusGeometry(1.5, 0.22, 16, 80, fraction * Math.PI * 2);
      const arcMat = new THREE.MeshBasicMaterial({ color: 0x49dcb1 });
      arcMesh = new THREE.Mesh(arcGeo, arcMat);
      arcMesh.rotation.z = Math.PI / 2;
      scene.add(arcMesh);
    };
    buildArc(experiencePoints);

    // Glow dot at arc tip
    const dotGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xd7fbff });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    scene.add(dot);

    sceneRef.current = { buildArc, dot, scene, camera, renderer };

    let animId;
    let t = 0;
    const tick = () => {
      animId = requestAnimationFrame(tick);
      t += 0.02;
      const xpCap = 10000;
      const fraction = Math.min(1, experiencePoints / xpCap);
      const angle = Math.PI / 2 + fraction * Math.PI * 2;
      dot.position.set(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0);
      dotMat.opacity = 0.6 + Math.sin(t * 3) * 0.4;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update arc on XP change without remounting
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.buildArc(experiencePoints);
    }
  }, [experiencePoints]);

  return (
    <div className="gp-xp-ring-wrap">
      <div ref={mountRef} className="gp-xp-ring-canvas" />
      <div className="gp-xp-ring-label">
        <span className="gp-xp-ring-level">Lv {level}</span>
        <span className="gp-xp-ring-xp">{Number(experiencePoints).toLocaleString()} XP</span>
      </div>
    </div>
  );
}

// ─── Three.js: spinning trophy (achievement card) ─────────────────────────────

function TrophyScene({ triggerSpin }) {
  const mountRef = useRef(null);
  const groupRef = useRef(null);
  const spinRef = useRef(false);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth || 140;
    const H = 140;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 50);
    camera.position.set(0, 1.5, 7);
    camera.lookAt(0, 1, 0);

    const gold = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const bright = new THREE.MeshBasicMaterial({ color: 0xfde68a });

    const group = new THREE.Group();
    groupRef.current = group;

    // Base plate
    group.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 0.22, 8), gold)));

    // Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 1.1, 8), gold);
    stem.position.y = 0.65;
    group.add(stem);

    // Cup
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.25, 1.5, 16), bright);
    cup.position.y = 1.85;
    group.add(cup);

    // Cup wireframe
    const cwire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.87, 0.27, 1.52, 16),
      new THREE.MeshBasicMaterial({ color: 0xfef9c3, wireframe: true, transparent: true, opacity: 0.25 })
    );
    cwire.position.y = 1.85;
    group.add(cwire);

    // Handles
    [-1, 1].forEach((s) => {
      const h = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.07, 8, 14, Math.PI), gold);
      h.position.set(s * 0.78, 1.85, 0);
      h.rotation.y = (s * Math.PI) / 2;
      group.add(h);
    });

    // Star crown
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), bright);
      s.position.set(Math.cos(a) * 0.45, 2.72, Math.sin(a) * 0.45);
      group.add(s);
    }
    const topGem = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    topGem.position.y = 2.72;
    group.add(topGem);

    group.position.y = -0.8;
    scene.add(group);

    // Ambient glow particles
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(40 * 3);
    for (let i = 0; i < 40; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 3.5;
      pPos[i * 3 + 1] = Math.random() * 4;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xfbbf24, size: 0.07, transparent: true, opacity: 0.6 });
    scene.add(new THREE.Points(pGeo, pMat));

    let t = 0;
    let animId;
    const tick = () => {
      animId = requestAnimationFrame(tick);
      t += 0.016;
      group.rotation.y = spinRef.current ? t * 4 : t * 0.5;
      group.position.y = -0.8 + Math.sin(t * 0.8) * 0.12;
      pMat.opacity = 0.35 + Math.sin(t * 2) * 0.25;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (!triggerSpin) return;
    spinRef.current = true;
    const timeout = setTimeout(() => { spinRef.current = false; }, 1800);
    return () => clearTimeout(timeout);
  }, [triggerSpin]);

  return <div ref={mountRef} className="gp-trophy-canvas" />;
}

// ─── Three.js: leaderboard score bars (3D) ────────────────────────────────────

function LeaderboardBars({ rows }) {
  const mountRef = useRef(null);
  const barsRef = useRef([]);
  const rendererRef = useRef(null);
  const prevRowsRef = useRef([]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth || 300;
    const H = 80;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 0.1, 100);
    camera.position.z = 10;

    const buildBars = (data) => {
      barsRef.current.forEach((b) => scene.remove(b));
      barsRef.current = [];
      if (!data.length) return;

      const maxScore = Math.max(...data.map((r) => r.score || 0), 1);
      const barW = Math.min(28, (W - 20) / data.length - 4);
      const totalW = data.length * (barW + 4) - 4;
      const startX = -totalW / 2 + barW / 2;

      data.forEach((row, i) => {
        const frac = (row.score || 0) / maxScore;
        const barH = Math.max(2, frac * (H - 20));
        const hue = 0.44 - frac * 0.1; // teal → green
        const color = new THREE.Color().setHSL(hue, 0.75, 0.52);
        const geo = new THREE.BoxGeometry(barW, barH, 4);
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 });
        const bar = new THREE.Mesh(geo, mat);
        bar.position.set(startX + i * (barW + 4), -H / 2 + barH / 2 + 4, 0);
        bar.userData.targetH = barH;
        bar.userData.currentH = 0;
        scene.add(bar);
        barsRef.current.push(bar);
      });
    };

    buildBars(rows);
    prevRowsRef.current = rows;

    let animId;
    const tick = () => {
      animId = requestAnimationFrame(tick);
      barsRef.current.forEach((bar) => {
        if (bar.userData.currentH < bar.userData.targetH) {
          bar.userData.currentH = Math.min(
            bar.userData.targetH,
            bar.userData.currentH + bar.userData.targetH * 0.06 + 0.5
          );
          const h = bar.userData.currentH;
          bar.geometry.dispose();
          bar.geometry = new THREE.BoxGeometry(bar.geometry.parameters?.width || 20, h, 4);
          const baseX = bar.position.x;
          bar.position.set(baseX, -H / 2 + h / 2 + 4, 0);
        }
      });
      renderer.render(scene, camera);
    };
    tick();

    // expose rebuild for row updates
    el._rebuildBars = buildBars;

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild bars when rows change
  useEffect(() => {
    const el = mountRef.current;
    if (el && el._rebuildBars) {
      el._rebuildBars(rows);
    }
  }, [rows]);

  return <div ref={mountRef} className="gp-lb-bars" />;
}

// ─── Three.js: badge (spinning hex gem) ──────────────────────────────────────

function BadgeGem({ color = 0x49dcb1, unlocked = false, onUnlock }) {
  const mountRef = useRef(null);
  const unlockedRef = useRef(unlocked);

  useEffect(() => {
    unlockedRef.current = unlocked;
  }, [unlocked]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const SIZE = 52;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(SIZE, SIZE);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 20);
    camera.position.z = 3.2;

    const gemColor = unlocked ? color : 0x1a3830;
    const geo = new THREE.CylinderGeometry(0.7, 0.5, 0.22, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: gemColor,
      transparent: true,
      opacity: unlocked ? 0.92 : 0.45,
    });
    const gem = new THREE.Mesh(geo, mat);
    gem.rotation.x = Math.PI / 2;
    scene.add(gem);

    const wireGeo = new THREE.CylinderGeometry(0.72, 0.52, 0.24, 6);
    const wireMat = new THREE.MeshBasicMaterial({
      color: unlocked ? color : 0x2a4840,
      wireframe: true,
      transparent: true,
      opacity: unlocked ? 0.4 : 0.15,
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.rotation.x = Math.PI / 2;
    scene.add(wire);

    let t = Math.random() * Math.PI * 2;
    let hovered = false;
    let animId;

    el.addEventListener("mouseenter", () => { hovered = true; });
    el.addEventListener("mouseleave", () => { hovered = false; });

    const tick = () => {
      animId = requestAnimationFrame(tick);
      t += hovered ? 0.06 : 0.018;
      gem.rotation.z = t;
      wire.rotation.z = -t * 0.6;
      gem.scale.setScalar(1 + Math.sin(t * 1.5) * 0.04);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  return (
    <div
      ref={mountRef}
      className={`gp-badge-gem ${unlocked ? "gp-badge-gem--unlocked" : "gp-badge-gem--locked"}`}
      onClick={onUnlock}
      title={unlocked ? "Unlocked" : "Click to unlock"}
    />
  );
}

// ─── Unlock flash overlay ─────────────────────────────────────────────────────

function UnlockFlash({ show }) {
  return (
    <div className={`gp-unlock-flash ${show ? "gp-unlock-flash--active" : ""}`} aria-hidden="true" />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GameProgressPage() {
  const [activeUserId, setActiveUserId] = useState(readSessionUserId());
  const [leaderboardLimit, setLeaderboardLimit] = useState(10);
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState(initialForm);
  const [trophySpin, setTrophySpin] = useState(0);
  const [unlockFlash, setUnlockFlash] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState(new Set());

  const leaderboardQuery = useQuery(LEADERBOARD_QUERY, {
    variables: { limit: leaderboardLimit },
    pollInterval: 4000,
    fetchPolicy: "network-only",
  });

  const progressListQuery = useQuery(PROGRESS_LIST_QUERY, {
    pollInterval: 4000,
    fetchPolicy: "network-only",
  });

  const userProgressQuery = useQuery(USER_PROGRESS_QUERY, {
    variables: { userId: activeUserId },
    skip: !activeUserId,
    pollInterval: 4000,
    fetchPolicy: "network-only",
  });

  const [addProgress, addProgressState] = useMutation(ADD_PROGRESS_MUTATION);
  const [updateProgress, updateProgressState] = useMutation(UPDATE_PROGRESS_MUTATION);

  const userProgress = userProgressQuery.data?.gameProgressByUser || null;

  useEffect(() => {
    if (!activeUserId) { setForm(initialForm); return; }
    if (!userProgress && !userProgressQuery.loading) { setForm(initialForm); return; }
    if (!userProgress) return;

    setForm({
      level: String(userProgress.level ?? 1),
      experiencePoints: String(userProgress.experiencePoints ?? 0),
      score: String(userProgress.score ?? 0),
      rank: userProgress.rank === null || userProgress.rank === undefined ? "" : String(userProgress.rank),
      progress: userProgress.progress || "Not started",
      achievementsInput: (userProgress.achievements || []).join(", "),
    });

    // Sync unlocked badges from achievements
    if (userProgress.achievements?.length) {
      setUnlockedBadges((prev) => {
        const next = new Set(prev);
        userProgress.achievements.forEach((a) => next.add(a));
        return next;
      });
    }
  }, [activeUserId, userProgress?.progressId, userProgress?.updatedAt, userProgressQuery.loading]);

  const allProgressEntries = progressListQuery.data?.gameProgressList || [];

  const achievementLeaderboard = useMemo(() => {
    const totals = new Map();
    allProgressEntries.forEach((entry) => {
      (entry.achievements || []).forEach((achievement) => {
        totals.set(achievement, (totals.get(achievement) || 0) + 1);
      });
    });
    return [...totals.entries()]
      .map(([achievement, unlockedBy]) => ({ achievement, unlockedBy }))
      .sort((a, b) => b.unlockedBy - a.unlockedBy || a.achievement.localeCompare(b.achievement));
  }, [allProgressEntries]);

  const latestProgressEntries = useMemo(() => {
    return [...allProgressEntries]
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
      .slice(0, 6);
  }, [allProgressEntries]);

  const handleFormValue = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const isMutating = addProgressState.loading || updateProgressState.loading;

  const syncProgress = async () => {
    if (!activeUserId) {
      setErrorMessage("A userId is required to track progress. Sign in or paste a userId.");
      return;
    }
    setStatus("");
    setErrorMessage("");

    const payload = {
      userId: activeUserId,
      level: Math.max(1, toInteger(form.level, 1)),
      experiencePoints: Math.max(0, toInteger(form.experiencePoints, 0)),
      score: Math.max(0, toInteger(form.score, 0)),
      rank: toOptionalInteger(form.rank),
      achievements: parseAchievements(form.achievementsInput),
      progress: form.progress.trim() || "Not started",
      lastPlayed: new Date().toISOString(),
    };

    try {
      if (userProgress?.progressId) {
        await updateProgress({
          variables: {
            progressId: userProgress.progressId,
            level: payload.level,
            experiencePoints: payload.experiencePoints,
            score: payload.score,
            rank: payload.rank,
            achievements: payload.achievements,
            progress: payload.progress,
            lastPlayed: payload.lastPlayed,
          },
        });
        setStatus("Progress updated and synced with live leaderboard.");
      } else {
        await addProgress({ variables: payload });
        setStatus("New progress record created and synced.");
      }

      // Trophy spin + flash on success
      setTrophySpin((n) => n + 1);
      setUnlockFlash(true);
      setTimeout(() => setUnlockFlash(false), 800);

      await Promise.all([
        leaderboardQuery.refetch({ limit: leaderboardLimit }),
        progressListQuery.refetch(),
        activeUserId ? userProgressQuery.refetch({ userId: activeUserId }) : Promise.resolve(),
      ]);
    } catch (mutationError) {
      setErrorMessage(mutationError.message || "Unable to save progress right now.");
    }
  };

  const leaderboardRows = leaderboardQuery.data?.leaderboard || [];

  // Badge gem colors keyed by achievement name (deterministic from string hash)
  const gemColor = (name) => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffff;
    return (h & 0x00ffff) | 0x004444; // keep it teal-ish
  };

  const handleBadgeUnlock = (achievement) => {
    setUnlockedBadges((prev) => {
      const next = new Set(prev);
      next.add(achievement);
      return next;
    });
    setUnlockFlash(true);
    setTimeout(() => setUnlockFlash(false), 800);
    setTrophySpin((n) => n + 1);
  };

  return (
    <main className="gp-shell">
      <UnlockFlash show={unlockFlash} />
      <ParticleBackground />

      {/* ── HERO ── */}
      <section className="gp-hero">
        <p className="gp-kicker">Game Progress Micro Frontend</p>
        <h1>Live Progress Ops Center</h1>
        <p>
          Track player progress in near real-time, watch leaderboard shifts every 4 seconds, and monitor
          achievements unlocked across the platform.
        </p>
        <span className="gp-live-indicator">Auto-refresh active: 4s</span>
      </section>

      {/* ── TOP GRID ── */}
      <section className="gp-grid">

        {/* Progress Tracking card */}
        <article className="gp-card">
          <div className="gp-card-header gp-card-header--with-ring">
            <div>
              <h2>Progress Tracking</h2>
              <p>Save level, XP, score, rank, and achievements for any user.</p>
            </div>
            {/* 3D XP ring */}
            <XPRing
              experiencePoints={toInteger(form.experiencePoints, 0)}
              level={toInteger(form.level, 1)}
            />
          </div>

          <div className="gp-form-grid">
            <label>
              User ID
              <input
                value={activeUserId}
                onChange={(e) => setActiveUserId(e.target.value.trim())}
                placeholder="Mongo userId"
              />
            </label>
            <label>
              Level
              <input value={form.level} onChange={handleFormValue("level")} type="number" min="1" />
            </label>
            <label>
              Experience Points
              <input value={form.experiencePoints} onChange={handleFormValue("experiencePoints")} type="number" min="0" />
            </label>
            <label>
              Score
              <input value={form.score} onChange={handleFormValue("score")} type="number" min="0" />
            </label>
            <label>
              Rank
              <input value={form.rank} onChange={handleFormValue("rank")} type="number" min="1" />
            </label>
            <label className="gp-full-width">
              Progress Status
              <input value={form.progress} onChange={handleFormValue("progress")} placeholder="Level 3 - Boss Battle" />
            </label>
            <label className="gp-full-width">
              Achievements
              <textarea
                value={form.achievementsInput}
                onChange={handleFormValue("achievementsInput")}
                rows={3}
                placeholder="Boss Slayer, Perfect Run, Speedrunner"
              />
            </label>
          </div>

          <div className="gp-actions">
            <button type="button" className="gp-primary" onClick={syncProgress} disabled={isMutating}>
              {isMutating ? "Syncing…" : userProgress?.progressId ? "Update Progress" : "Create Progress"}
            </button>
            {status ? <p className="gp-status">{status}</p> : null}
            {errorMessage ? <p className="gp-error">{errorMessage}</p> : null}
          </div>

          <div className="gp-meta">
            <div>
              <span>Last Played</span>
              <strong>{formatDate(userProgress?.lastPlayed)}</strong>
            </div>
            <div>
              <span>Updated At</span>
              <strong>{formatDate(userProgress?.updatedAt)}</strong>
            </div>
          </div>
        </article>

        {/* Leaderboard card */}
        <article className="gp-card">
          <div className="gp-card-header gp-flex-header">
            <div>
              <h2>Leaderboard</h2>
              <p>Dynamic ranking by score, level, and experience.</p>
            </div>
            <label className="gp-limit">
              Show
              <select value={leaderboardLimit} onChange={(e) => setLeaderboardLimit(toInteger(e.target.value, 10))}>
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={25}>Top 25</option>
              </select>
            </label>
          </div>

          {/* 3D animated score bars */}
          <LeaderboardBars rows={leaderboardRows} />

          {leaderboardQuery.loading && leaderboardRows.length === 0 ? (
            <p className="gp-loading">Loading leaderboard…</p>
          ) : (
            <div className="gp-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>User</th>
                    <th>Score</th>
                    <th>Level</th>
                    <th>XP</th>
                    <th>Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardRows.map((entry, index) => (
                    <tr key={entry.progressId} className={index < 3 ? `gp-row-top gp-row-top--${index}` : ""}>
                      <td>
                        <span className="gp-pos-badge">{index + 1}</span>
                      </td>
                      <td>{entry.userId}</td>
                      <td>{entry.score}</td>
                      <td>{entry.level}</td>
                      <td>{entry.experiencePoints}</td>
                      <td>{entry.rank ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>

      {/* ── BOTTOM GRID ── */}
      <section className="gp-grid gp-grid-bottom">

        {/* Achievement Spotlight card */}
        <article className="gp-card gp-card--achievements">
          <div className="gp-card-header gp-card-header--trophy">
            <div>
              <h2>Achievement Spotlight</h2>
              <p>Unlocked badges and milestones across all players.</p>
            </div>
            {/* 3D trophy */}
            <TrophyScene triggerSpin={trophySpin} />
          </div>

          {achievementLeaderboard.length === 0 ? (
            <p className="gp-loading">No achievements unlocked yet.</p>
          ) : (
            <div className="gp-badge-wall">
              {achievementLeaderboard.map((item) => (
                <div key={item.achievement} className="gp-badge-item">
                  <BadgeGem
                    color={gemColor(item.achievement)}
                    unlocked={unlockedBadges.has(item.achievement)}
                    onUnlock={() => handleBadgeUnlock(item.achievement)}
                  />
                  <span className={`gp-badge ${unlockedBadges.has(item.achievement) ? "gp-badge--unlocked" : ""}`}>
                    {item.achievement}
                    <small>{item.unlockedBy} players</small>
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>

        {/* Recent Progress Events card */}
        <article className="gp-card">
          <div className="gp-card-header">
            <h2>Recent Progress Events</h2>
            <p>Latest changes flowing in from the game progress microservice.</p>
          </div>

          {progressListQuery.loading && latestProgressEntries.length === 0 ? (
            <p className="gp-loading">Refreshing events…</p>
          ) : (
            <ul className="gp-event-list">
              {latestProgressEntries.map((entry) => (
                <li key={entry.progressId} className="gp-event-item">
                  <div className="gp-event-dot" />
                  <div>
                    <p>
                      <strong>{entry.userId}</strong> reached level <strong>{entry.level}</strong> with score{" "}
                      <strong>{entry.score}</strong>
                    </p>
                    <span>
                      {entry.progress} · Updated {formatDate(entry.updatedAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  );
}
