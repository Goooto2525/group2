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
      ? '正解。空白のマスをQWERTY配列の26文字のループと見立て、球の数字の分だけ右（次）のマスに進むと「POKER」が導き出される。'
      : '違うようだ。球の置かれたマスから、球の数字の分だけ進んでみよう。マスが途切れたら先頭に戻るループ構造になっているようだ。';
  });
});
