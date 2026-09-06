document.addEventListener('DOMContentLoaded', () => {
  const finale = document.querySelector('.finale');
  if (!finale || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  finale.classList.add('is-celebrating');

  const burst = document.createElement('i');
  burst.className = 'finale__burst';
  finale.appendChild(burst);

  for (let i = 0; i < 16; i += 1) {
    const spark = document.createElement('i');
    spark.className = 'finale-spark';
    spark.style.setProperty('--spark-angle', `${i * 22.5}deg`);
    spark.style.animationDelay = `${.18 + Math.random() * .22}s`;
    finale.appendChild(spark);
  }

  const colors = ['#f8e6a1', '#d4a84f', '#8ce0ad', '#f09a9a', '#b7d8ee'];
  for (let i = 0; i < 72; i += 1) {
    const piece = document.createElement('i');
    piece.className = 'finale-confetti';
    piece.style.setProperty('--confetti-color', colors[i % colors.length]);
    piece.style.setProperty('--confetti-x', `${(Math.random() - .5) * 92}vw`);
    piece.style.setProperty('--confetti-y', `${6 + Math.random() * 23}rem`);
    piece.style.setProperty('--confetti-r', `${Math.random() * 900 - 450}deg`);
    piece.style.animationDelay = `${Math.random() * .45}s`;
    finale.appendChild(piece);
  }
});
