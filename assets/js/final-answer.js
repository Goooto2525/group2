document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.getElementById('suspectTrigger');
  const modal = document.getElementById('suspectModal');
  const form = document.getElementById('suspectForm');
  const input = document.getElementById('finalAnswer');

  if (!trigger || !modal || !form || !input) return;

  const openModal = () => {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    input.focus();
  };

  const closeModal = () => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  };

  trigger.addEventListener('click', openModal);

  modal.addEventListener('click', (event) => {
    const target = event.target;

    if (
      target instanceof HTMLElement &&
      target.dataset.closeModal === 'true'
    ) {
      closeModal();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const answer = input.value
      .normalize('NFKC')
      .replace(/[\s\u3000]/g, '')
      .toLowerCase();

    const correct =
      answer === '朝熊山' ||
      answer === 'あさまやま' ||
      answer === '朝熊ヶ岳' ||
      answer === 'あさまがたけ';

    if (correct) {
      window.location.href = 'contents/treasure-discovery-report.html';
      return;
    }

    alert(
      'まだ違うようです。伊勢音頭、伊勢参り、山桜の話をもう一度確認してください。'
    );

    input.focus();
    input.select();
  });

  document.addEventListener('keydown', (event) => {
    if (
      event.key === 'Escape' &&
      !modal.classList.contains('hidden')
    ) {
      closeModal();
    }
  });
});