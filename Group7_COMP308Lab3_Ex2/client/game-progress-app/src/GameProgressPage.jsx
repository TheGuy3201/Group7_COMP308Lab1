import React, { useEffect, useMemo, useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
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

const readSessionUserId = () => {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const raw = sessionStorage.getItem("jwt");
    if (!raw) {
      return "";
    }

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
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const parseAchievements = (input) =>
  String(input || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const formatDate = (isoDate) => {
  if (!isoDate) {
    return "N/A";
  }

  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
};

export default function GameProgressPage() {
  const [activeUserId, setActiveUserId] = useState(readSessionUserId());
  const [leaderboardLimit, setLeaderboardLimit] = useState(10);
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState(initialForm);

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
    if (!activeUserId) {
      setForm(initialForm);
      return;
    }

    if (!userProgress && !userProgressQuery.loading) {
      setForm(initialForm);
      return;
    }

    if (!userProgress) {
      return;
    }

    setForm({
      level: String(userProgress.level ?? 1),
      experiencePoints: String(userProgress.experiencePoints ?? 0),
      score: String(userProgress.score ?? 0),
      rank: userProgress.rank === null || userProgress.rank === undefined ? "" : String(userProgress.rank),
      progress: userProgress.progress || "Not started",
      achievementsInput: (userProgress.achievements || []).join(", "),
    });
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
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
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

  return (
    <main className="gp-shell">
      <section className="gp-hero">
        <p className="gp-kicker">Game Progress Micro Frontend</p>
        <h1>Live Progress Ops Center</h1>
        <p>
          Track player progress in near real-time, watch leaderboard shifts every 4 seconds, and monitor
          achievements unlocked across the platform.
        </p>
        <span className="gp-live-indicator">Auto-refresh active: 4s</span>
      </section>

      <section className="gp-grid">
        <article className="gp-card">
          <div className="gp-card-header">
            <h2>Progress Tracking</h2>
            <p>Save level, XP, score, rank, and achievements for any user.</p>
          </div>

          <div className="gp-form-grid">
            <label>
              User ID
              <input
                value={activeUserId}
                onChange={(event) => setActiveUserId(event.target.value.trim())}
                placeholder="Mongo userId"
              />
            </label>
            <label>
              Level
              <input value={form.level} onChange={handleFormValue("level")} type="number" min="1" />
            </label>
            <label>
              Experience Points
              <input
                value={form.experiencePoints}
                onChange={handleFormValue("experiencePoints")}
                type="number"
                min="0"
              />
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
              <input
                value={form.progress}
                onChange={handleFormValue("progress")}
                placeholder="Level 3 - Boss Battle"
              />
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
              {isMutating ? "Syncing..." : userProgress?.progressId ? "Update Progress" : "Create Progress"}
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

        <article className="gp-card">
          <div className="gp-card-header gp-flex-header">
            <div>
              <h2>Leaderboard</h2>
              <p>Dynamic ranking by score, level, and experience.</p>
            </div>
            <label className="gp-limit">
              Show
              <select
                value={leaderboardLimit}
                onChange={(event) => setLeaderboardLimit(toInteger(event.target.value, 10))}
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={25}>Top 25</option>
              </select>
            </label>
          </div>

          {leaderboardQuery.loading && leaderboardRows.length === 0 ? (
            <p className="gp-loading">Loading leaderboard...</p>
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
                    <tr key={entry.progressId}>
                      <td>{index + 1}</td>
                      <td>{entry.userId}</td>
                      <td>{entry.score}</td>
                      <td>{entry.level}</td>
                      <td>{entry.experiencePoints}</td>
                      <td>{entry.rank ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>

      <section className="gp-grid gp-grid-bottom">
        <article className="gp-card">
          <div className="gp-card-header">
            <h2>Achievement Spotlight</h2>
            <p>Unlocked badges and milestones across all players.</p>
          </div>

          {achievementLeaderboard.length === 0 ? (
            <p className="gp-loading">No achievements unlocked yet.</p>
          ) : (
            <div className="gp-badge-wall">
              {achievementLeaderboard.map((item) => (
                <span key={item.achievement} className="gp-badge">
                  {item.achievement}
                  <small>{item.unlockedBy} players</small>
                </span>
              ))}
            </div>
          )}
        </article>

        <article className="gp-card">
          <div className="gp-card-header">
            <h2>Recent Progress Events</h2>
            <p>Latest changes flowing in from the game progress microservice.</p>
          </div>

          {progressListQuery.loading && latestProgressEntries.length === 0 ? (
            <p className="gp-loading">Refreshing events...</p>
          ) : (
            <ul className="gp-event-list">
              {latestProgressEntries.map((entry) => (
                <li key={entry.progressId}>
                  <p>
                    <strong>{entry.userId}</strong> reached level <strong>{entry.level}</strong> with score{" "}
                    <strong>{entry.score}</strong>
                  </p>
                  <span>
                    {entry.progress} | Updated {formatDate(entry.updatedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  );
}
