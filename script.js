const YEAR = "2025";
const STORAGE_KEY = "nikyu-tekihan-history-v2";
const exam = window.EXAM_DATA.years[YEAR];
const questions = exam.questions;

const elements = Object.fromEntries([
  "score", "accuracy", "answered-count", "progress-text", "progress-bar", "category",
  "question-number", "question-text", "answer-buttons", "answer-state", "feedback",
  "result-icon", "result-text", "correct-answer", "explanation-text", "reference-text",
  "previous-button", "next-button", "quiz-card", "completion", "final-score",
  "restart-button", "reset-button", "mode-note", "empty-state", "empty-all-button"
].map((id) => [id.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), document.querySelector(`#${id}`)]));
elements.modeButtons = [...document.querySelectorAll(".mode-button")];

let history = loadHistory();
let mode = "all";
let session = [];
let currentIndex = 0;
let sessionAnswers = {};

function blankHistory() {
  return { answers: {}, wrong: [], updatedAt: null };
}

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && saved.answers && Array.isArray(saved.wrong) ? saved : blankHistory();
  } catch {
    return blankHistory();
  }
}

function saveHistory() {
  history.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function keyFor(question) {
  return `${YEAR}-${question.number}`;
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function startMode(nextMode, preserveOrder = false) {
  mode = nextMode;
  const wrongSet = new Set(history.wrong);
  session = mode === "wrong"
    ? questions.filter((q) => wrongSet.has(keyFor(q)))
    : mode === "random" ? shuffle(questions) : [...questions];
  if (preserveOrder && mode === "random") session = shuffle(questions);
  currentIndex = 0;
  sessionAnswers = {};

  elements.modeButtons.forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  elements.modeNote.textContent = mode === "all"
    ? "第1問から順番に出題します。"
    : mode === "random"
      ? "全50問をランダムな順番で出題します。"
      : `保存された誤答 ${session.length}問を出題します。`;

  elements.completion.hidden = true;
  const empty = session.length === 0;
  elements.quizCard.hidden = empty;
  elements.emptyState.hidden = !empty;
  updateStats();
  if (!empty) showQuestion();
}

function showQuestion() {
  const item = session[currentIndex];
  const record = sessionAnswers[keyFor(item)];
  elements.category.textContent = item.field;
  elements.questionNumber.textContent = `${exam.label} No.${item.number}`;
  elements.questionText.textContent = item.text;
  elements.progressText.textContent = `${currentIndex + 1} / ${session.length}`;
  elements.progressBar.style.width = `${((currentIndex + 1) / session.length) * 100}%`;
  elements.previousButton.disabled = currentIndex === 0;
  elements.nextButton.textContent = currentIndex === session.length - 1 ? "結果を見る →" : "次の問題 →";

  const buttons = [...elements.answerButtons.querySelectorAll("button")];
  buttons.forEach((button) => {
    button.disabled = Boolean(record);
    button.classList.remove("selected");
    if (record && String(record.selected) === button.dataset.answer) button.classList.add("selected");
  });

  if (record) showFeedback(item, record);
  else {
    elements.answerState.textContent = "未回答";
    elements.answerState.className = "answer-state";
    elements.feedback.hidden = true;
    elements.feedback.className = "feedback";
  }
}

function submitAnswer(event) {
  const item = session[currentIndex];
  const key = keyFor(item);
  if (sessionAnswers[key]) return;
  const selected = event.currentTarget.dataset.answer === "true";
  const correct = selected === item.answer;
  const record = { selected, correct, answeredAt: new Date().toISOString() };
  sessionAnswers[key] = record;
  history.answers[key] = record;
  if (!correct && !history.wrong.includes(key)) history.wrong.push(key);
  saveHistory();
  showQuestion();
  updateStats();
}

function showFeedback(item, record) {
  elements.answerState.textContent = record.correct ? "正解" : "不正解";
  elements.answerState.className = `answer-state ${record.correct ? "correct" : "incorrect"}`;
  elements.feedback.className = `feedback ${record.correct ? "correct" : "incorrect"}`;
  elements.resultIcon.textContent = record.correct ? "✓" : "!";
  elements.resultText.textContent = record.correct ? "正解です" : "不正解です";
  elements.correctAnswer.textContent = `あなたの回答：${record.selected ? "正" : "誤"} ／ 正解：${item.answer ? "正" : "誤"}`;
  elements.explanationText.textContent = item.explanation;
  elements.referenceText.textContent = `根拠法令：${item.law}`;
  elements.feedback.hidden = false;
}

function updateStats() {
  const records = Object.values(history.answers);
  const correct = records.filter((record) => record.correct).length;
  elements.score.textContent = String(correct);
  elements.accuracy.textContent = records.length ? `${Math.round(correct / records.length * 100)}%` : "--";
  elements.answeredCount.textContent = `${records.length} / ${questions.length}`;
}

function move(step) {
  const nextIndex = currentIndex + step;
  if (nextIndex < 0) return;
  if (nextIndex >= session.length) {
    showCompletion();
    return;
  }
  currentIndex = nextIndex;
  showQuestion();
  elements.quizCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showCompletion() {
  const sessionRecords = session.map((q) => sessionAnswers[keyFor(q)]).filter(Boolean);
  const correct = sessionRecords.filter((record) => record.correct).length;
  const rate = sessionRecords.length ? Math.round(correct / sessionRecords.length * 100) : 0;
  elements.quizCard.hidden = true;
  elements.completion.hidden = false;
  elements.finalScore.textContent = `${sessionRecords.length}問回答・${correct}問正解（正答率 ${rate}%）`;
  elements.completion.scrollIntoView({ behavior: "smooth", block: "center" });
}

function resetHistory() {
  if (!window.confirm("端末に保存した回答履歴と間違いリストをすべて削除しますか？")) return;
  history = blankHistory();
  localStorage.removeItem(STORAGE_KEY);
  startMode(mode);
}

elements.answerButtons.querySelectorAll("button").forEach((button) => button.addEventListener("click", submitAnswer));
elements.previousButton.addEventListener("click", () => move(-1));
elements.nextButton.addEventListener("click", () => move(1));
elements.restartButton.addEventListener("click", () => startMode(mode, true));
elements.resetButton.addEventListener("click", resetHistory);
elements.emptyAllButton.addEventListener("click", () => startMode("all"));
elements.modeButtons.forEach((button) => button.addEventListener("click", () => startMode(button.dataset.mode)));

startMode("all");
