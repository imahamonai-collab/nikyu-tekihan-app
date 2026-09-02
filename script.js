// 問題の追加・修正は、この配列内の項目を編集してください。
// answer は ○なら true、×なら false です。
const questions = [
  {
    category: "用語の定義",
    question: "建築基準法上の「建築」には、建築物の新築、増築、改築、移転が含まれる。",
    answer: true,
    explanation: "「建築」とは、建築物を新築し、増築し、改築し、または移転することをいいます。",
    reference: "建築基準法 第2条第13号"
  },
  {
    category: "用語の定義",
    question: "建築物の用途を変更することは、建築基準法上の「建築」に含まれる。",
    answer: false,
    explanation: "用途変更は「建築」の定義には含まれません。ただし、用途や規模によって確認申請などの手続が必要になる場合があります。",
    reference: "建築基準法 第2条第13号・第87条"
  },
  {
    category: "単体規定",
    question: "居室には、原則として採光のための窓その他の開口部を設けなければならない。",
    answer: true,
    explanation: "住宅、学校、病院、診療所、寄宿舎などの居室には、原則として採光に有効な開口部が必要です。用途に応じた例外や必要割合があります。",
    reference: "建築基準法 第28条第1項"
  },
  {
    category: "道路・敷地",
    question: "建築物の敷地は、原則として建築基準法上の道路に2m以上接しなければならない。",
    answer: true,
    explanation: "いわゆる接道義務です。地方公共団体の条例による付加や、一定の認定・許可による例外があります。",
    reference: "建築基準法 第43条第1項・第2項"
  },
  {
    category: "道路・敷地",
    question: "建築基準法上の「道路」とは、幅員が必ず4m以上あるものだけをいう。",
    answer: false,
    explanation: "原則は幅員4m以上ですが、法第42条第2項の規定により、基準時に建築物が立ち並ぶ幅員4m未満の道が指定を受けて道路とみなされる場合があります。",
    reference: "建築基準法 第42条第1項・第2項"
  },
  {
    category: "用途地域",
    question: "用途地域内では、建築物の用途制限は全国一律で、地方公共団体の条例により制限を緩和または強化することはできない。",
    answer: false,
    explanation: "用途地域ごとの基本的な制限に加え、特別用途地区では条例により制限を強化でき、国土交通大臣の承認を得て緩和できる場合もあります。",
    reference: "建築基準法 第49条"
  },
  {
    category: "防火・避難",
    question: "防火地域内にある階数3以上の建築物は、原則として耐火建築物等としなければならない。",
    answer: true,
    explanation: "防火地域では、階数が3以上、または延べ面積が100㎡を超える建築物は、原則として耐火建築物等とする必要があります。",
    reference: "建築基準法 第61条、建築基準法施行令 第136条の2"
  },
  {
    category: "構造強度",
    question: "建築物は、自重、積載荷重、積雪荷重、風圧、土圧・水圧、地震などに対して安全な構造でなければならない。",
    answer: true,
    explanation: "建築物には、通常時の荷重・外力だけでなく、積雪、風、地震などに対する構造上の安全性が求められます。",
    reference: "建築基準法 第20条"
  },
  {
    category: "建築確認",
    question: "確認済証の交付を受けた建築物であれば、工事完了後の検査申請は一切不要である。",
    answer: false,
    explanation: "確認済証は着工前の計画確認です。確認を受けた建築物の工事が完了したときは、原則として完了検査の申請が必要です。",
    reference: "建築基準法 第7条"
  },
  {
    category: "維持保全",
    question: "建築物の所有者、管理者または占有者は、その建築物の敷地、構造および建築設備を常時適法な状態に維持するよう努めなければならない。",
    answer: true,
    explanation: "建築物だけでなく、その敷地・構造・建築設備についても、常時適法な状態を維持する努力義務が定められています。",
    reference: "建築基準法 第8条第1項"
  }
];

const elements = {
  score: document.querySelector("#score"),
  progressText: document.querySelector("#progress-text"),
  progressBar: document.querySelector("#progress-bar"),
  category: document.querySelector("#category"),
  questionNumber: document.querySelector("#question-number"),
  questionText: document.querySelector("#question-text"),
  answerButtons: document.querySelector("#answer-buttons"),
  feedback: document.querySelector("#feedback"),
  resultIcon: document.querySelector("#result-icon"),
  resultText: document.querySelector("#result-text"),
  correctAnswer: document.querySelector("#correct-answer"),
  explanationText: document.querySelector("#explanation-text"),
  referenceText: document.querySelector("#reference-text"),
  nextButton: document.querySelector("#next-button"),
  quizCard: document.querySelector("#quiz-card"),
  completion: document.querySelector("#completion"),
  finalScore: document.querySelector("#final-score"),
  finalMessage: document.querySelector("#final-message"),
  restartButton: document.querySelector("#restart-button")
};

let currentIndex = 0;
let score = 0;
let answered = false;

function showQuestion() {
  const item = questions[currentIndex];
  answered = false;
  elements.category.textContent = item.category;
  elements.questionNumber.textContent = `QUESTION ${String(currentIndex + 1).padStart(2, "0")}`;
  elements.questionText.textContent = item.question;
  elements.progressText.textContent = `${currentIndex + 1} / ${questions.length}`;
  elements.progressBar.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  elements.feedback.hidden = true;
  elements.feedback.className = "feedback";

  elements.answerButtons.querySelectorAll("button").forEach((button) => {
    button.disabled = false;
    button.classList.remove("selected");
  });
}

function submitAnswer(event) {
  if (answered) return;
  answered = true;

  const selectedButton = event.currentTarget;
  const selectedAnswer = selectedButton.dataset.answer === "true";
  const item = questions[currentIndex];
  const isCorrect = selectedAnswer === item.answer;

  if (isCorrect) {
    score += 1;
    elements.score.textContent = score;
  }

  elements.answerButtons.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });
  selectedButton.classList.add("selected");

  elements.feedback.classList.add(isCorrect ? "correct" : "incorrect");
  elements.resultIcon.textContent = isCorrect ? "✓" : "!";
  elements.resultText.textContent = isCorrect ? "正解です" : "不正解です";
  elements.correctAnswer.textContent = `正解は「${item.answer ? "○" : "×"}」`;
  elements.explanationText.textContent = item.explanation;
  elements.referenceText.textContent = `根拠：${item.reference}`;
  elements.nextButton.innerHTML = currentIndex === questions.length - 1
    ? "結果を見る <span aria-hidden=\"true\">→</span>"
    : "次の問題 <span aria-hidden=\"true\">→</span>";
  elements.feedback.hidden = false;
  elements.nextButton.focus({ preventScroll: true });
}

function nextQuestion() {
  currentIndex += 1;
  if (currentIndex < questions.length) {
    showQuestion();
    elements.quizCard.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  showCompletion();
}

function showCompletion() {
  elements.quizCard.hidden = true;
  elements.completion.hidden = false;
  elements.finalScore.textContent = score;
  const rate = score / questions.length;
  elements.finalMessage.textContent = rate === 1
    ? "全問正解です。確かな理解が身についています。"
    : rate >= 0.7
      ? "よくできました。解説を振り返って、さらに理解を固めましょう。"
      : "もう一度挑戦して、条文のポイントを押さえましょう。";
  elements.completion.scrollIntoView({ behavior: "smooth", block: "center" });
}

function restartQuiz() {
  currentIndex = 0;
  score = 0;
  elements.score.textContent = "0";
  elements.completion.hidden = true;
  elements.quizCard.hidden = false;
  showQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

elements.answerButtons.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", submitAnswer);
});
elements.nextButton.addEventListener("click", nextQuestion);
elements.restartButton.addEventListener("click", restartQuiz);

showQuestion();
