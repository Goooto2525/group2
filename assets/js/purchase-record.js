document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('purchasePuzzle');
  const input = document.getElementById('purchaseAnswer');
  const feedback = document.getElementById('purchaseFeedback');
  const keywordScreen = document.getElementById('keywordScreen');
  const keywordClose = document.getElementById('keywordClose');
  if (!form || !input || !feedback || !keywordScreen || !keywordClose) return;
  const closeKeywordScreen = () => { keywordScreen.hidden = true; input.focus(); };
  keywordClose.addEventListener('click', closeKeywordScreen);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !keywordScreen.hidden) closeKeywordScreen(); });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const answer = input.value.normalize('NFKC').trim().toLowerCase();
    const correct = answer === 'poker' || answer === 'ポーカー';
    feedback.className = `puzzle-answer__feedback ${correct ? 'is-correct' : 'is-wrong'}`;
    feedback.textContent = correct ? '正解。空白のマスをQWERTY配列に見立て、球の番号を文字の順番として読むと「POKER」が導き出される。' : '違うようだ。空白のマスを身近なものに見立てて考えてみよう。数が重要だ。';
    if (correct) { keywordScreen.querySelector('.keyword-screen__word').textContent = '伊勢音頭'; keywordScreen.hidden = false; keywordClose.focus(); }
  });
});