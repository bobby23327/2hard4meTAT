import { requiredElement as required } from '../lib/dom';

enum FilterKind {
  Projects = 'projects',
  Blog = 'blog',
}
enum SortOrder {
  Featured = 'featured',
  Name = 'name',
}
enum TrackFilter {
  All = 'all',
  Game = 'game',
  Engine = 'engine',
  Agent = 'agent',
}
interface FilterState {
  query: string;
  track: TrackFilter;
  tag: string;
  sort: SortOrder;
}
interface SearchItem {
  element: HTMLElement;
  text: string;
  tags: string[];
  track: string;
  featured: number;
  order: number;
}
interface FilterContext {
  root: HTMLElement;
  kind: FilterKind;
  input: HTMLInputElement;
  results: HTMLElement;
  resultCount: HTMLElement;
  empty: HTMLElement;
  items: SearchItem[];
  tags: ReadonlySet<string>;
  state: FilterState;
}
const TRACK_IDS: ReadonlySet<string> = new Set(Object.values(TrackFilter));
const FILTER_ACTION_SELECTOR =
  '[data-track-filter],[data-tag-filter],[data-project-tag],[data-blog-tag],[data-reset-filters]';

function readItemNumber(value: string | undefined, field: string): number {
  const number = value === undefined ? 0 : Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`Search item ${field} must be a finite number.`);
  return number;
}

function createItem(element: HTMLElement): SearchItem {
  const { tags: encodedTags, search } = element.dataset;
  if (!encodedTags || !search) throw new TypeError('Search items require tags and searchable text.');
  const tags: unknown = JSON.parse(encodedTags);
  if (!Array.isArray(tags) || !tags.every((tag) => typeof tag === 'string'))
    throw new TypeError('Search tags must be an array of strings.');
  return {
    element,
    tags,
    text: search.toLocaleLowerCase(),
    track: element.dataset.track ?? '',
    featured: readItemNumber(element.dataset.featured, 'featured'),
    order: readItemNumber(element.dataset.order, 'order'),
  };
}

function normalizeTrack(value: string): TrackFilter {
  return TRACK_IDS.has(value) ? (value as TrackFilter) : TrackFilter.All;
}

function normalizeState(context: FilterContext): void {
  const { state, kind, tags } = context;
  state.tag = tags.has(state.tag) ? state.tag : '';
  state.track = kind === FilterKind.Projects ? normalizeTrack(state.track) : TrackFilter.All;
  state.sort =
    kind === FilterKind.Projects && state.sort === SortOrder.Name ? SortOrder.Name : SortOrder.Featured;
}

function readState(): FilterState {
  const params = new URLSearchParams(location.search);
  return {
    query: params.get('q') ?? '',
    track: normalizeTrack(params.get('track') ?? TrackFilter.All),
    tag: params.get('tag') ?? '',
    sort: params.get('sort') === SortOrder.Name ? SortOrder.Name : SortOrder.Featured,
  };
}

function matches(item: SearchItem, state: FilterState): boolean {
  const terms = state.query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return (
    terms.every((term) => item.text.includes(term)) &&
    (state.track === TrackFilter.All || state.track === item.track) &&
    (!state.tag || item.tags.includes(state.tag))
  );
}

function writeUrl(state: FilterState, kind: FilterKind): void {
  const url = new URL(location.href);
  const values = {
    q: state.query.trim(),
    tag: state.tag,
    track: kind === FilterKind.Projects && state.track !== TrackFilter.All ? state.track : '',
    sort: kind === FilterKind.Projects && state.sort !== SortOrder.Featured ? state.sort : '',
  };
  Object.entries(values).forEach(([key, value]) =>
    value ? url.searchParams.set(key, value) : url.searchParams.delete(key),
  );
  if (url.href !== location.href) history.replaceState(history.state, '', url);
}

function syncControls({ root, state, input }: FilterContext): void {
  if (input.value !== state.query) input.value = state.query;
  root.querySelectorAll<HTMLButtonElement>('[data-track-filter],[data-tag-filter]').forEach((button) => {
    const active =
      button.dataset.trackFilter !== undefined
        ? button.dataset.trackFilter === state.track
        : button.dataset.tagFilter === state.tag;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const tagSelect = root.querySelector<HTMLSelectElement>('[data-tag-select]');
  const sortSelect = root.querySelector<HTMLSelectElement>('[data-sort]');
  if (tagSelect) tagSelect.value = state.tag;
  if (sortSelect) sortSelect.value = state.sort;
}

function updateResultItems({ items, results, state }: FilterContext): number {
  const ordered = [...items].sort((a, b) =>
    state.sort === SortOrder.Name
      ? a.text.localeCompare(b.text, 'zh-CN')
      : b.featured - a.featured || a.order - b.order,
  );
  let count = 0;
  ordered.forEach((item, index) => {
    item.element.hidden = !matches(item, state);
    if (!item.element.hidden) count += 1;
    const current = results.children.item(index);
    if (current !== item.element) results.insertBefore(item.element, current);
  });
  return count;
}

function renderResults(context: FilterContext): void {
  normalizeState(context);
  const count = updateResultItems(context);
  const unit = context.kind === FilterKind.Projects ? '个项目' : '篇文章';
  context.resultCount.textContent = `显示 ${count} ${unit}`;
  context.empty.hidden = count > 0;
  syncControls(context);
  writeUrl(context.state, context.kind);
}

function resetFilters(context: FilterContext): void {
  context.state = { query: '', track: TrackFilter.All, tag: '', sort: SortOrder.Featured };
  renderResults(context);
  context.input.focus();
}

function handleFilterClick(context: FilterContext, event: MouseEvent): void {
  if (!(event.target instanceof Element)) return;
  const target = event.target.closest<HTMLElement>(FILTER_ACTION_SELECTOR);
  if (!target || !context.root.contains(target)) return;
  event.preventDefault();
  if (target.hasAttribute('data-reset-filters')) {
    resetFilters(context);
    return;
  }
  if (target.dataset.trackFilter !== undefined)
    context.state.track = normalizeTrack(target.dataset.trackFilter);
  const tag = target.dataset.tagFilter ?? target.dataset.projectTag ?? target.dataset.blogTag;
  if (tag !== undefined) context.state.tag = tag;
  renderResults(context);
}

function bindSearch(context: FilterContext): void {
  const { root, input } = context;
  input.addEventListener('input', () => {
    context.state.query = input.value;
    renderResults(context);
  });
  root.querySelector('form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    renderResults(context);
  });
}

function bindSelects(context: FilterContext): void {
  const tagSelect = context.root.querySelector<HTMLSelectElement>('[data-tag-select]');
  tagSelect?.addEventListener('change', () => {
    context.state.tag = tagSelect.value;
    renderResults(context);
  });
  const sortSelect = context.root.querySelector<HTMLSelectElement>('[data-sort]');
  sortSelect?.addEventListener('change', () => {
    context.state.sort = sortSelect.value === SortOrder.Name ? SortOrder.Name : SortOrder.Featured;
    renderResults(context);
  });
}

function focusSearchShortcut(event: KeyboardEvent, input: HTMLInputElement): void {
  const editing =
    event.target instanceof Element &&
    !!event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])');
  if (
    event.key !== '/' ||
    editing ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    event.isComposing ||
    event.defaultPrevented
  )
    return;
  event.preventDefault();
  input.focus();
}

function bindFilters(context: FilterContext): void {
  bindSearch(context);
  bindSelects(context);
  context.root.addEventListener('click', (event) => handleFilterClick(context, event));
  window.addEventListener('popstate', () => {
    context.state = readState();
    renderResults(context);
  });
  document.addEventListener('keydown', (event) => focusSearchShortcut(event, context.input));
}

function initializeFilters(root: HTMLElement): void {
  const kind = root.dataset.filterRoot;
  if (kind !== FilterKind.Projects && kind !== FilterKind.Blog)
    throw new TypeError('Unknown content filter.');
  const items = [...root.querySelectorAll<HTMLElement>('[data-filter-item]')].map(createItem);
  const context: FilterContext = {
    root,
    kind,
    items,
    tags: new Set(items.flatMap((item) => item.tags)),
    input: required<HTMLInputElement>(root, '[data-search-input]'),
    results: required<HTMLElement>(root, '[data-results]'),
    resultCount: required<HTMLElement>(root, '[data-result-count]'),
    empty: required<HTMLElement>(root, '[data-empty]'),
    state: readState(),
  };
  bindFilters(context);
  renderResults(context);
}

document.querySelectorAll<HTMLElement>('[data-filter-root]').forEach(initializeFilters);
