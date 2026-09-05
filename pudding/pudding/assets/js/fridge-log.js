document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('fridgePuzzle');
  const input = document.getElementById('fridgeAnswer');
  const feedback = document.getElementById('fridgeFeedback');
  const keywordScreen = document.getElementById('keywordScreen');
  const keywordClose = document.getElementById('keywordClose');
  if (!form || !input || !feedback || !keywordScreen || !keywordClose) return;
  const closeKeywordScreen = () => { keywordScreen.hidden = true; input.focus(); };
  keywordClose.addEventListener('click', closeKeywordScreen);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !keywordScreen.hidden) closeKeywordScreen(); });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const answer = input.value.normalize('NFKC').replace(/\s+/g, '').toLowerCase();
    const correct = ['ルーレット', 'るーれっと', 'roulette'].includes(answer);
    feedback.className = `puzzle-answer__feedback ${correct ? 'is-correct' : 'is-wrong'}`;
    feedback.textContent = correct ? '正解。それぞれのカードが役の文字列に対応しており、最後の行は「ルーレット」となる。' : '違うようだ。上の3つの行がどんな「役」を作っているか考え、カードと文字を対応させてみよう。';
    if (correct) { keywordScreen.querySelector('.keyword-screen__word').textContent = '伊勢参り'; keywordScreen.hidden = false; keywordClose.focus(); }
  });
});