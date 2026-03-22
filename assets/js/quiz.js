import { getQuizResults, saveQuizResult } from "./storage.js";

export function renderQuiz(lesson) {
  if (!lesson.quiz?.length) {
    return `
      <div class="empty-state">
        <h3>No quiz in this lesson</h3>
        <p class="muted">This lesson focuses on reading, reflection, and practice instead.</p>
      </div>
    `;
  }

  const saved = getQuizResults()[lesson.id];
  return `
    <form class="quiz-form" data-quiz-form="${lesson.id}">
      ${lesson.quiz
        .map(
          (question, index) => `
            <article class="quiz-question">
              <fieldset>
                <legend>${index + 1}. ${question.prompt}</legend>
                ${question.choices
                  .map(
                    (choice, choiceIndex) => `
                      <label>
                        <input
                          type="radio"
                          name="question-${index}"
                          value="${choiceIndex}"
                          ${saved?.answers?.[index] === choiceIndex ? "checked" : ""}
                        />
                        <span>${choice}</span>
                      </label>
                    `
                  )
                  .join("")}
                <div class="quiz-feedback" data-feedback="${index}">
                  ${saved ? renderFeedback(saved, question, index) : ""}
                </div>
              </fieldset>
            </article>
          `
        )
        .join("")}
      <div class="button-row">
        <button class="button" type="submit">Submit quiz</button>
        <p class="muted">When a lesson includes a quiz, submitting it counts toward completion even if some answers are wrong.</p>
      </div>
    </form>
  `;
}

function renderFeedback(saved, question, index) {
  const answer = saved.answers[index];
  if (typeof answer !== "number") {
    return "";
  }
  const correct = answer === question.correctIndex;
  return `
    <strong style="color:${correct ? "var(--success)" : "var(--warning)"}">
      ${correct ? "Correct" : "Review this one"}
    </strong>
    <div class="muted">${question.explanation}</div>
  `;
}

export function bindQuiz(container, lesson, onSubmit) {
  const form = container.querySelector(`[data-quiz-form="${lesson.id}"]`);
  if (!form) {
    return;
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const answers = lesson.quiz.map((_, index) => {
      const value = form.elements[`question-${index}`].value;
      return value === "" ? null : Number(value);
    });
    const correctCount = lesson.quiz.reduce((sum, question, index) => sum + (answers[index] === question.correctIndex ? 1 : 0), 0);
    saveQuizResult(lesson.id, {
      answers,
      correctCount,
      totalQuestions: lesson.quiz.length,
    });
    lesson.quiz.forEach((question, index) => {
      const target = form.querySelector(`[data-feedback="${index}"]`);
      target.innerHTML = renderFeedback({ answers }, question, index);
    });
    if (typeof onSubmit === "function") {
      onSubmit();
    }
  });
}
