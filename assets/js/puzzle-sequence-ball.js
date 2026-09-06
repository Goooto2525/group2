document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('purchasePuzzle');
  const input = document.getElementById('purchaseAnswer');
  const feedback = document.getElementById('purchaseFeedback');
  const keywordScreen = document.getElementById('keywordScreen');
  const keywordClose = document.getElementById('keywordClose');
  if (!form || !input || !feedback || !keywordScreen || !keywordClose) return;

  document.querySelectorAll('.keyboard-row-control').forEach((control) => {
    const row = control.querySelector('[data-keyboard-row]');
    const buttons = [...control.querySelectorAll('.row-shift-button')];
    if (!row || buttons.length !== 2) return;

    let shiftSteps = 0;
    const updateRowPosition = () => {
      const key = row.querySelector('.blank-key');
      if (!key) return;
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const halfKey = (key.getBoundingClientRect().width + gap) / 2;
      row.style.setProperty('--row-shift', `${shiftSteps * halfKey}px`);
      buttons.forEach((button) => {
        const direction = Number(button.dataset.direction);
        button.disabled = (direction < 0 && shiftSteps <= -2) || (direction > 0 && shiftSteps >= 2);
      });
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        shiftSteps = Math.max(-2, Math.min(2, shiftSteps + Number(button.dataset.direction)));
        updateRowPosition();
      });
    });

    window.addEventListener('resize', updateRowPosition);
    updateRowPosition();
  });

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
