document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('purchasePuzzle');
  const input = document.getElementById('purchaseAnswer');
  const feedback = document.getElementById('purchaseFeedback');

  if (!form || !input || !feedback) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const answer = input.value.normalize('NFKC').trim().toLowerCase();
    const correct = answer === 'poker' || answer === 'ポーカー';

    feedback.className = `puzzle-answer__feedback ${correct ? 'is-correct' : 'is-wrong'}`;
    feedback.textContent = correct
      ? '正解。空白のマスをQWERTY配列に見立て、球の番号を文字の順番として読むと「POKER」が導き出される。'
      : '違うようだ。空白のマスをQWERTY配列に見立て、1番から順に球が置かれたマスの文字を読んでみよう。';
  });
});
