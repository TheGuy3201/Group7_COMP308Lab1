import path from "path";
import { fileURLToPath } from "url";
import { TextLoader } from "langchain/document_loaders/fs/text";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HINT_FILE_PATH = path.join(__dirname, "data", "game-hints.txt");

let cachedHintLines = null;

const tokenize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const keywordOverlapScore = (text, keywords) => {
  if (!keywords.length) return 0;
  const tokens = new Set(tokenize(text));
  let matches = 0;

  for (const keyword of keywords) {
    if (tokens.has(keyword)) {
      matches += 1;
    }
  }

  return matches / keywords.length;
};

const parseHintLines = (rawText) => {
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^Level\s+(\d+)\s*:\s*(.+)$/i);
      if (!match) {
        return null;
      }
      return {
        level: Number(match[1]),
        hint: match[2],
      };
    })
    .filter(Boolean);
};

const loadHintLines = async () => {
  if (cachedHintLines) {
    return cachedHintLines;
  }

  const loader = new TextLoader(HINT_FILE_PATH);
  const docs = await loader.load();
  const allText = docs.map((doc) => doc.pageContent || "").join("\n");
  cachedHintLines = parseHintLines(allText);
  return cachedHintLines;
};

export const searchHintsByProgress = async ({ level, question, playerProgress, limit = 3 }) => {
  const safeLevel = Math.max(1, Number(level || playerProgress?.level || 1));
  const lines = await loadHintLines();

  const progressKeywords = [
    ...tokenize(question),
    ...tokenize(playerProgress?.progress),
    ...(Number(playerProgress?.score || 0) > 0 ? ["score"] : []),
    ...(Number(playerProgress?.experiencePoints || 0) > 0 ? ["experience", "timing"] : []),
    ...(Array.isArray(playerProgress?.achievements) && playerProgress.achievements.length ? ["achievement"] : []),
  ];

  const scored = lines
    .map((entry) => {
      const levelDistance = Math.abs(entry.level - safeLevel);
      const levelScore = Math.max(0, 1 - levelDistance * 0.25);
      const keywordScore = keywordOverlapScore(entry.hint, progressKeywords);
      const score = levelScore * 0.7 + keywordScore * 0.3;
      return {
        ...entry,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((item) => item.hint);
};
