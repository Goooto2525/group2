document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('pilgrimagePuzzle');
  const input = document.getElementById('pilgrimageAnswer');
  const feedback = document.getElementById('pilgrimageFeedback');
  const keywordScreen = document.getElementById('keywordScreen');
  const keywordClose = document.getElementById('keywordClose');
  if (!form || !input || !feedback) return;
  let wrongAttempts = 0;
  const normalizeAnswer = (value) => [...value.normalize('NFKC').replace(/[\s\u3000]/g, '').toLowerCase()].map((character) => { const code = character.charCodeAt(0); return code >= 0x3041 && code <= 0x3096 ? String.fromCharCode(code + 0x60) : character; }).join('');
  const closeKeywordScreen = () => { if (keywordScreen) { keywordScreen.hidden = true; input.focus(); } };
  if (keywordClose) keywordClose.addEventListener('click', closeKeywordScreen);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && keywordScreen && !keywordScreen.hidden) closeKeywordScreen(); });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const correct = ['アマテラス', 'amaterasu'].includes(normalizeAnswer(input.value));
    if (!correct) wrongAttempts += 1;
    feedback.className = `puzzle-answer__feedback ${correct ? 'is-correct' : 'is-wrong'}`;
    if (correct) {
      feedback.textContent = '正解！外宮と内宮の参道の通行方法に従って文字を拾うと「アマテラス」が導き出される。';
      if (keywordScreen) { keywordScreen.querySelector('.keyword-screen__word').textContent = '山桜'; keywordScreen.hidden = false; if (keywordClose) keywordClose.focus(); }
      return;
    }
    const hints = [ '違うようだ。伊勢神宮における参拝ルールを確認してみよう。'];
    feedback.textContent = hints[Math.min(wrongAttempts - 1, hints.length - 1)];
  });
});