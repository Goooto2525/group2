// 閲覧と正解は別々に保存します。古い閲覧記録を正解には変換しません。
const VISIT_KEY = 'gag_case_progress_v1';
const CLEAR_KEY = 'ise_puzzle_clears_v1';
const PUZZLES = ['puzzle-sequence-ball', 'puzzle-card-meaning', 'puzzle-shrine-road'];
const STORIES = ['record-pilgrimage', 'record-ise-ondo', 'record-mountain-cherry'];
const FEEDBACK_IDS = ['purchaseFeedback', 'fridgeFeedback', 'pilgrimageFeedback'];
let sessionClears = {};
let sessionVisits = {};

function readRecord(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function saveRecord(key, record) {
  try {
    localStorage.setItem(key, JSON.stringify(record));
  } catch {
    // 保存できない環境でも、このページ内の表示は更新します。
  }
}

function resolveSlug(pathname) {
  return String(pathname || '').split('/').pop().replace(/\.html?$/i, '').trim() || 'index';
}

function refreshProgress() {
  const clears = { ...readRecord(CLEAR_KEY), ...sessionClears };
  const visits = { ...readRecord(VISIT_KEY), ...sessionVisits };

  document.querySelectorAll('[data-puzzle-status]').forEach((badge) => {
    const cleared = clears[badge.dataset.puzzleStatus] === true;
    badge.textContent = cleared ? '✓ クリア済み' : '未クリア';
    badge.classList.toggle('is-cleared', cleared);
  });

  const action = document.getElementById('suspectAction');
  if (action) {
    action.hidden = !(
      PUZZLES.every((slug) => clears[slug] === true) &&
      STORIES.every((slug) => visits[slug] === true)
    );
  }
}

function initializeProgress() {
  const slug = resolveSlug(location.pathname);

  if (STORIES.includes(slug)) {
    sessionVisits[slug] = true;
    saveRecord(VISIT_KEY, { ...readRecord(VISIT_KEY), ...sessionVisits });
  }

  const input = document.getElementById('searchInput');
  const button = document.getElementById('searchBtn');
  const label = document.querySelector('label[for="searchInput"]');
  if (input) input.placeholder = '伊勢子に伝える言葉';
  if (button) button.textContent = '伊勢子に聞く';
  if (label) label.textContent = '伊勢子に伝える言葉';

  // 既存の謎JSが出す「is-correct」を受け取り、正解を記録します。
  // 解答そのものやヒント、キーワード画面は既存の謎JSが担当します。
  if (PUZZLES.includes(slug)) {
    const feedback = document.getElementById(FEEDBACK_IDS[PUZZLES.indexOf(slug)]);
    if (feedback) {
      const recordCorrectAnswer = () => {
        if (!feedback.classList.contains('is-correct')) return;
        sessionClears[slug] = true;
        saveRecord(CLEAR_KEY, { ...readRecord(CLEAR_KEY), ...sessionClears });
        refreshProgress();
      };
      const observer = new MutationObserver(recordCorrectAnswer);
      observer.observe(feedback, { attributes: true, attributeFilter: ['class'] });
      recordCorrectAnswer();
    }
  }

  refreshProgress();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProgress, { once: true });
} else {
  initializeProgress();
}
window.addEventListener('pageshow', refreshProgress);
window.addEventListener('storage', (event) => {
  if (event.key === CLEAR_KEY || event.key === VISIT_KEY || event.key === null) {
    refreshProgress();
  }
});
