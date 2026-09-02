document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('fridgePuzzle');
  const input = document.getElementById('fridgeAnswer');
  const feedback = document.getElementById('fridgeFeedback');
  const hintButton = document.getElementById('hintButton');
  const hint = document.getElementById('puzzleHint');

  if (hintButton && hint) {
    hintButton.addEventListener('click', () => {
      const willOpen = hint.hidden;
      hint.hidden = !willOpen;
      hintButton.setAttribute('aria-expanded', String(willOpen));
      hintButton.textContent = willOpen ? 'ヒントを隠す' : 'ヒントを表示';
    });
  }

  if (!form || !input || !feedback) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const answer = input.value.normalize('NFKC').trim().toLowerCase();
    const correct = answer === 'サウナ' || answer === 'さうな' || answer === 'sauna';

    if (!answer) {
      feedback.className = 'puzzle-answer__feedback is-wrong';
      feedback.textContent = '答えを入力してから照合してください。';
      input.focus();
      return;
    }

    feedback.className = `puzzle-answer__feedback ${correct ? 'is-correct' : 'is-wrong'}`;
    feedback.textContent = correct
      ? '照合成功。3♥＝「サ」、A♠＝「ウ」、5♦＝「ナ」。次の捜索場所は「サウナ」だ。'
      : '照合できない。まず3つの役を完成させ、それぞれの不足カードを確認しよう。';
  });
});
