document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('fridgePuzzle');
  const input = document.getElementById('fridgeAnswer');
  const feedback = document.getElementById('fridgeFeedback');
  const keywordScreen = document.getElementById('keywordScreen');
  const keywordClose = document.getElementById('keywordClose');

  if (!form || !input || !feedback || !keywordScreen || !keywordClose) {
    return;
  }

  const closeKeywordScreen = () => {
    keywordScreen.hidden = true;
    input.focus();
  };

  keywordClose.addEventListener('click', closeKeywordScreen);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !keywordScreen.hidden) {
      closeKeywordScreen();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const answer = input.value
      .normalize('NFKC')
      .replace(/\s+/g, '')
      .toLowerCase();

    const correctAnswers = [
      'ルーレット',
      'るーれっと',
      'roulette'
    ];

    const isCorrect = correctAnswers.includes(answer);

    feedback.className =
      `puzzle-answer__feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`;

    feedback.textContent = isCorrect
      ? '正解。カードの役を手がかりに、最後の言葉を導き出した。'
      : '違うようだ。上のカード列が表している役を考えてみよう。';

    if (isCorrect) {
      keywordScreen.hidden = false;
      keywordScreen.querySelector('.keyword-screen__word').textContent =
        '伊勢参り';
      keywordClose.focus();
    }
  });
});