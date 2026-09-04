document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('pilgrimagePuzzle');
  const input = document.getElementById('pilgrimageAnswer');
  const feedback = document.getElementById('pilgrimageFeedback');
  if (!form || !input || !feedback) return;
  let wrongAttempts = 0;

  const normalizeAnswer = (value) => {
    const compact = value.normalize('NFKC').replace(/[\s\u3000]/g, '').toLowerCase();
    return [...compact].map((character) => {
      const code = character.charCodeAt(0);
      return code >= 0x3041 && code <= 0x3096
        ? String.fromCharCode(code + 0x60)
        : character;
    }).join('');
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const answer = normalizeAnswer(input.value);
    const correct = answer === 'アマテラス' || answer === 'amaterasu';
    if (!correct) wrongAttempts += 1;
    feedback.className = `puzzle-answer__feedback ${correct ? 'is-correct' : 'is-wrong'}`;
    if (correct) {
      feedback.textContent = '正解！伊勢神宮の参拝ルール「外宮は左側通行、内宮は右側通行」に従って文字を拾うと「アマテラス」が導き出される。';
      return;
    }
    const hints = [
      '違うようだ。「神の道を侵さず、古例のままに」という記録断片を読み直そう。',
      '違うようだ。中央を避けるだけでは足りない。外宮と内宮では古例が異なるようだ。',
      '違うようだ。現実の「外宮」と「内宮」では、参道を歩く時にどちら側を通るルールになっているだろうか？'
    ];
    feedback.textContent = hints[Math.min(wrongAttempts - 1, hints.length - 1)];
  });
});
