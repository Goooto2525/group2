import { u } from './basePath.js';
import { fetchJson } from './fetcher.js';
import { log } from './logger.js';

let modePromise = null;
let pagesPromise = null;
let metaPromise = null;
let searchIndexPromise = null;

function sanitize(text) {
  return String(text || '')
    .trim()
    .replace(/[\x00-\x1F\x7F\u2028\u2029]/g, '')
    .replace(/\u3000/g, ' ');
}

function normalizePath(path) {
  const p = String(path || '').trim();
  if (!p) return u('index.html');
  if (/^(https?:)?\/\//i.test(p)) return p;
  if (p.startsWith('/')) return u(p.replace(/^\/+/, ''));
  return u(p.replace(/^\.\/+/, ''));
}

async function exists(path) {
  try {
    const res = await fetch(u(path), { cache: 'no-store' });
    return res.ok;
  } catch (error) {
    log('error', 'provider_exists_failed', { path, error: String(error) });
    return false;
  }
}

async function detectMode() {
  const hinted = String((window.YACHO_PROVIDER_MODE || '')).toLowerCase();
  if (hinted === 'api' || hinted === 'json') return hinted;

  if (await exists('api/meta.php')) return 'api';
  if (await exists('data/meta.json')) return 'json';
  return 'json';
}

function extractKeywordValues(entry, field) {
  const values = [];
  const pushValue = (v) => {
    const s = String(v ?? '').trim();
    if (!s) return;
    values.push(s);
  };

  const nested = entry?.search?.[field];
  if (Array.isArray(nested)) {
    for (const v of nested) pushValue(v);
  } else if (typeof nested === 'string') {
    pushValue(nested);
  }

  const top = entry?.[field];
  if (Array.isArray(top)) {
    for (const v of top) pushValue(v);
  } else if (typeof top === 'string') {
    pushValue(top);
  }

  return [...new Set(values)];
}

function extractK1Values(entry) {
  return extractKeywordValues(entry, 'k1');
}

function extractK2Values(entry) {
  return extractKeywordValues(entry, 'k2');
}

async function loadPages() {
  if (!pagesPromise) {
    pagesPromise = fetchJson('data/structure.json')
      .then((data) => (Array.isArray(data?.pages) ? data.pages : []))
      .then((pages) => pages.filter((p) => (p?.kind ?? 'page') !== 'include'))
      .catch(() => []);
  }
  return pagesPromise;
}

async function loadMeta() {
  if (!metaPromise) {
    metaPromise = fetchJson('data/meta.json').catch(() => null);
  }
  return metaPromise;
}

async function loadSearchIndex() {
  if (!searchIndexPromise) {
    searchIndexPromise = fetchJson('data/search-index.json').catch(() => null);
  }
  return searchIndexPromise;
}

/**
 * structure.jsonからk1/k2を使って検索する（PHP api/search.phpと同等のロジック）
 * 1語: k1一致かつk2が空のページ。k2があるページはneedMoreヒント。
 * 2語: (k1=a,k2=b) or (k1=b,k2=a)。部分一致はpartialヒント。
 */
function buildSearchResultsFromPages(entries, tokens) {
  const results = [];
  const seen = new Set();

  if (tokens.length === 1) {
    const query = tokens[0];
    let hasNeedMore = false;

    for (const entry of entries) {
      const k1 = extractK1Values(entry);
      const k2 = extractK2Values(entry);

      if (k1.includes(query)) {
        if (k2.length > 0) {
          hasNeedMore = true;
          continue;
        }
        const path = normalizePath(entry?.path);
        if (seen.has(path)) continue;
        seen.add(path);
        results.push({ title: entry?.title || query, path });
      } else if (k2.includes(query)) {
        hasNeedMore = true;
      }
    }

    return {
      results,
      hint: results.length === 0 && hasNeedMore ? 'needMore' : null,
    };
  }

  if (tokens.length >= 2) {
    const a = tokens[0];
    const b = tokens[1];
    let hasPartial = false;

    for (const entry of entries) {
      const k1 = extractK1Values(entry);
      const k2 = extractK2Values(entry);
      const matchAB = k1.includes(a) && k2.includes(b);
      const matchBA = k1.includes(b) && k2.includes(a);

      if (matchAB || matchBA) {
        const path = normalizePath(entry?.path);
        if (seen.has(path)) continue;
        seen.add(path);
        results.push({ title: entry?.title || `${a} ${b}`, path });
      } else if (k1.includes(a) || k1.includes(b) || k2.includes(a) || k2.includes(b)) {
        hasPartial = true;
      }
    }

    return {
      results,
      hint: results.length === 0 && hasPartial ? 'partial' : null,
    };
  }

  return { results: [], hint: null };
}

function createApiProvider() {
  return {
    async meta() {
      try {
        const data = await fetchJson('api/meta.php');
        return { total: Number(data?.total ?? 0) || 0 };
      } catch {
        log('error', 'provider_api_meta_failed');
        return { total: 0 };
      }
    },

    async page(slug) {
      try {
        const s = encodeURIComponent(String(slug || 'index'));
        const data = await fetchJson(`api/page.php?slug=${s}`);
        return {
          page_no: Number(data?.page_no ?? 0) || null,
          total: Number(data?.total ?? 0) || 0,
        };
      } catch {
        log('error', 'provider_api_page_failed', { slug });
        return { page_no: null, total: 0 };
      }
    },

    async search(rawInput) {
      const input = sanitize(rawInput);
      if (!input) return { results: [], hint: null };

      try {
        const data = await fetchJson(`api/search.php?q=${encodeURIComponent(input)}`);
        return {
          results: Array.isArray(data?.results)
            ? data.results.map((item) => ({
                title: item?.title || input,
                path: normalizePath(item?.path),
              }))
            : [],
          hint: data?.hint || null,
        };
      } catch {
        log('error', 'provider_api_search_failed');
        return { results: [], hint: null };
      }
    },
  };
}

function createJsonProvider() {
  return {
    async meta() {
      const meta = await loadMeta();
      if (meta && Number.isFinite(Number(meta.total))) {
        return { total: Number(meta.total) };
      }
      const pages = await loadPages();
      return { total: pages.length };
    },

    async page(slug) {
      const pages = await loadPages();
      const targetSlug = String(slug || 'index').trim();
      const found = pages.find((p, i) => {
        const pSlug = String(p?.slug || p?.id || '').trim();
        if (pSlug === targetSlug) return true;
        if (targetSlug === 'index' && i === 0) return true;
        return false;
      });
      const meta = await this.meta();

      if (!found) {
        return { page_no: null, total: meta.total || pages.length };
      }

      const pageNo = Number.isFinite(Number(found.page_no))
        ? Number(found.page_no)
        : (pages.indexOf(found) + 1);

      return { page_no: pageNo, total: meta.total || pages.length };
    },

    async search(rawInput) {
      const input = sanitize(rawInput);
      if (!input) return { results: [], hint: null };

      const tokens = input.split(/\s+/).filter(Boolean);
      if (tokens.length === 0) return { results: [], hint: null };

      // 1語の場合: search-index.jsonを先に試す（1-wordモード最適化）
      if (tokens.length === 1) {
        const index = await loadSearchIndex();
        if (index && Array.isArray(index[tokens[0]])) {
          const seen = new Set();
          const results = [];
          for (const item of index[tokens[0]]) {
            const path = normalizePath(item?.path);
            if (seen.has(path)) continue;
            seen.add(path);
            results.push({
              title: item?.title || tokens[0],
              path,
            });
          }
          return { results, hint: null };
        }
      }

      // structure.jsonでk1/k2マッチング（2語対応・ヒント付き）
      const pages = await loadPages();
      return buildSearchResultsFromPages(pages, tokens);
    },
  };
}

export function createProvider() {
  const resolveMode = async () => {
    if (!modePromise) {
      modePromise = detectMode();
    }
    return modePromise;
  };

  return {
    async meta() {
      const mode = await resolveMode();
      return mode === 'api' ? createApiProvider().meta() : createJsonProvider().meta();
    },

    async page(slug) {
      const mode = await resolveMode();
      return mode === 'api' ? createApiProvider().page(slug) : createJsonProvider().page(slug);
    },

    async search(rawInput) {
      const mode = await resolveMode();
      return mode === 'api'
        ? createApiProvider().search(rawInput)
        : createJsonProvider().search(rawInput);
    },
  };
}
