import * as tf from "@tensorflow/tfjs";
import fetch from "node-fetch";

// Adapted from the TensorFlow sequential/dense training pattern used in
// D:\Sem6-W26\EmergTech\lab8_JoshuaDesroches\backprop-with-tensorflow.

// Enable generative responses: set a function to call an LLM or leave null for curated-only
const GENERATIVE_PROMPT_FN = process.env.OPENAI_API_KEY 
  ? generateWithOpenAI 
  : generateWithTemplates;

const KNOWLEDGE_BASE = [
  {
    id: "lv5-dodge-second-attack",
    levelMin: 5,
    levelMax: 6,
    difficulty: 0.52,
    tags: ["level5", "boss", "dodge", "timing", "second attack"],
    strategy: "Try dodging the enemy's second attack. Also, upgrade your armor for better defense.",
    alternative: "If timing is hard, bait the first swing, roll backward, and counter only after the second strike window.",
  },
  {
    id: "shield-and-regen",
    levelMin: 4,
    levelMax: 8,
    difficulty: 0.34,
    tags: ["defense", "armor", "shield", "sustain", "survive"],
    strategy: "Shift to a defensive build: prioritize shield uptime and health regeneration to survive longer exchanges.",
    alternative: "Equip the highest defense set you own and save burst skills for safe punish windows only.",
  },
  {
    id: "route-and-spacing",
    levelMin: 3,
    levelMax: 9,
    difficulty: 0.44,
    tags: ["pathing", "spacing", "position", "kite", "mobility"],
    strategy: "Use wider spacing and kite enemies into open lanes so you can avoid chain hits.",
    alternative: "Take the left route first, clear ranged units, and rotate clockwise to avoid getting surrounded.",
  },
  {
    id: "burst-window",
    levelMin: 5,
    levelMax: 10,
    difficulty: 0.67,
    tags: ["damage", "burst", "cooldown", "combo", "window"],
    strategy: "Hold your burst combo until the enemy finishes a heavy animation; that is your safest DPS window.",
    alternative: "If burst timing is inconsistent, swap one damage skill for a mobility reset to avoid punishment.",
  },
  {
    id: "resource-cadence",
    levelMin: 2,
    levelMax: 10,
    difficulty: 0.4,
    tags: ["resource", "mana", "energy", "stamina", "cadence"],
    strategy: "Avoid spending all resources in one cycle. Keep enough stamina for at least one emergency dodge.",
    alternative: "Use a 2-skill rotation instead of 3-skill burst so your stamina recovers before enemy phase shifts.",
  },
];

let rankingModelPromise;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const tokenize = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const lexicalOverlapScore = (question, tags) => {
  const qTokens = new Set(tokenize(question));
  if (!qTokens.size) return 0;
  let hits = 0;
  tags.forEach((tag) => {
    const tagTokens = tokenize(tag);
    if (tagTokens.some((tk) => qTokens.has(tk))) hits += 1;
  });
  return hits / Math.max(tags.length, 1);
};

const levelAffinity = (level, doc) => {
  if (!level) return 0.3;
  if (level >= doc.levelMin && level <= doc.levelMax) return 1;
  const distance = Math.min(Math.abs(level - doc.levelMin), Math.abs(level - doc.levelMax));
  return clamp(1 - distance * 0.15, 0, 1);
};

const retrieveCandidates = ({ question, level, limit = 4 }) => {
  const ranked = KNOWLEDGE_BASE.map((doc) => {
    const lexical = lexicalOverlapScore(question, doc.tags);
    const affinity = levelAffinity(level, doc);
    const score = lexical * 0.65 + affinity * 0.35;
    return { ...doc, retrievalScore: score };
  }).sort((a, b) => b.retrievalScore - a.retrievalScore);

  return ranked.slice(0, limit);
};

const buildTrainingRows = () => {
  const rows = [];
  const labels = [];

  for (let level = 1; level <= 10; level += 1) {
    for (let failCount = 0; failCount <= 4; failCount += 1) {
      for (let xpBand = 0; xpBand <= 4; xpBand += 1) {
        for (let scoreBand = 0; scoreBand <= 4; scoreBand += 1) {
          KNOWLEDGE_BASE.forEach((doc) => {
            const xpNorm = xpBand / 4;
            const scoreNorm = scoreBand / 4;
            const failNorm = failCount / 5;
            const levelNorm = level / 10;
            const levelFit = levelAffinity(level, doc);
            const difficulty = doc.difficulty;

            const successSignal =
              levelFit * 0.4 +
              (1 - Math.abs(difficulty - (0.35 + scoreNorm * 0.4))) * 0.25 +
              xpNorm * 0.2 +
              (1 - failNorm * difficulty) * 0.15;

            const label = clamp(successSignal, 0, 1);
            rows.push([levelNorm, xpNorm, scoreNorm, failNorm, difficulty, levelFit]);
            labels.push([label]);
          });
        }
      }
    }
  }

  return { rows, labels };
};

const getRankingModel = async () => {
  if (rankingModelPromise) return rankingModelPromise;

  rankingModelPromise = (async () => {
    console.log("[AI Agent] Initializing TensorFlow ranking model...");
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 12, activation: "sigmoid", inputShape: [6] }));
    model.add(tf.layers.dense({ units: 6, activation: "sigmoid" }));
    model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));
    model.compile({ optimizer: tf.train.adam(0.08), loss: "meanSquaredError" });

    const { rows, labels } = buildTrainingRows();
    const xs = tf.tensor2d(rows);
    const ys = tf.tensor2d(labels);
    console.log(`[AI Agent] Training on ${rows.length} samples with 25 epochs...`);
    await model.fit(xs, ys, { epochs: 25, verbose: 0, batchSize: 32 });
    xs.dispose();
    ys.dispose();
    console.log("[AI Agent] Ranking model training complete.");

    return model;
  })();

  return rankingModelPromise;
};

const predictSuitability = async ({ level, experiencePoints, score, failCount, candidate }) => {
  const model = await getRankingModel();
  const levelNorm = clamp(level / 10, 0, 1);
  const xpNorm = clamp((experiencePoints || 0) / 10000, 0, 1);
  const scoreNorm = clamp((score || 0) / 10000, 0, 1);
  const failNorm = clamp((failCount || 0) / 5, 0, 1);
  const levelFit = levelAffinity(level, candidate);

  const input = tf.tensor2d([[levelNorm, xpNorm, scoreNorm, failNorm, candidate.difficulty, levelFit]]);
  const out = model.predict(input);
  const data = await out.data();
  input.dispose();
  out.dispose();

  return clamp(data[0], 0, 1);
};

// ─── Generative Response Functions ────────────────────────────────────────

async function generateWithOpenAI(context) {
  try {
    const { question, level, failCount, retrieved } = context;
    const strategySummary = retrieved
      .slice(0, 3)
      .map((s) => `- ${s.strategy}`)
      .join("\n");

    const prompt = `You are an adaptive game AI coach. A player on Level ${level} asked: "${question}"${
      failCount >= 2 ? ` They've failed ${failCount} times, so suggest a lower-risk approach.` : ""
    }

Based on these expert strategies:
${strategySummary}

Generate 1-2 practical sentences combining the best approaches. Be conversational and specific.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || retrieved[0].strategy;
  } catch (error) {
    console.error("[AI Agent] OpenAI generation failed, falling back to curated response:", error.message);
    return context.retrieved[0].strategy;
  }
}

function generateWithTemplates(context) {
  const { question, level, failCount, retrieved } = context;
  const primary = retrieved[0];
  const secondary = retrieved[1];

  const templates = [
    `For Level ${level}, here's what works best: ${primary.strategy}${
      secondary ? ` Also, ${secondary.strategy.toLowerCase()}` : ""
    }`,
    `Try this approach: ${primary.strategy}${failCount >= 1 ? ` If that doesn't work, pivot to: ${secondary.alternative}` : ""}`,
    `Based on your question "${question.slice(0, 30)}...", ${primary.strategy}`,
    `Your next move: ${primary.strategy}${
      failCount >= 2 ? ` Since you've struggled, consider the safer option: ${secondary.alternative}` : ""
    }`,
    `Smart play incoming: ${primary.strategy} This works well at your level because of your current stats.`,
  ];

  // Pick a random template for variety
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template;
}

export const generateAdaptiveStrategy = async ({ question, level, playerProgress, failCount }) => {
  console.log(`[AI Agent] Processing hint for level ${level}, question: "${question}"`);
  const currentLevel = Math.max(1, Number(level || playerProgress?.level || 1));
  const retrieved = retrieveCandidates({ question, level: currentLevel, limit: 4 });
  console.log(`[AI Agent] Retrieved ${retrieved.length} candidate strategies.`);

  const scored = [];
  for (const candidate of retrieved) {
    const modelScore = await predictSuitability({
      level: currentLevel,
      experiencePoints: playerProgress?.experiencePoints || 0,
      score: playerProgress?.score || 0,
      failCount,
      candidate,
    });
    const finalScore = modelScore * 0.75 + candidate.retrievalScore * 0.25;
    scored.push({ ...candidate, modelScore, finalScore });
  }
  scored.sort((a, b) => b.finalScore - a.finalScore);

  const primary = scored[0] || KNOWLEDGE_BASE[0];
  const secondary = scored[1] || scored[0] || KNOWLEDGE_BASE[1];
  
  // Generate adaptive response text (using LLM or templates)
  const generatedResponse = await GENERATIVE_PROMPT_FN({
    question,
    level: currentLevel,
    failCount,
    retrieved: scored,
  });

  const proactiveSuggestion =
    failCount >= 2
      ? `You have failed Level ${currentLevel} ${failCount} times. Switch to a lower-risk plan: ${secondary.alternative}`
      : null;

  return {
    response: proactiveSuggestion
      ? `${generatedResponse} ${proactiveSuggestion}`
      : generatedResponse,
    hints: [primary.strategy, secondary.strategy],
    alternativeStrategies:
      failCount >= 2
        ? [primary.alternative, secondary.alternative]
        : [secondary.alternative],
    proactiveSuggestion,
    failCount,
    level: currentLevel,
    modelConfidence: Number(primary.finalScore.toFixed(3)),
    retrievedDocs: scored.map((item) => item.id),
  };
};
