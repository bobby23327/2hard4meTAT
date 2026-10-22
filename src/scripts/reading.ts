import { observeViewport } from '../lib/viewport';

const COPY_FEEDBACK_DURATION = 2200;
const TOC_ACTIVATION_OFFSET = 150;
const MOBILE_TOC_QUERY = '(max-width: 600px)';

interface TocEntry {
  link: HTMLAnchorElement;
  section: HTMLElement;
}

async function copyCode(button: HTMLButtonElement, code: HTMLElement): Promise<void> {
  if (!navigator.clipboard) {
    button.textContent = '请选中代码复制';
    return;
  }
  try {
    await navigator.clipboard.writeText(code.textContent ?? '');
    button.textContent = '已复制 ✓';
  } catch (error) {
    if (!(error instanceof DOMException)) throw error;
    button.textContent = '复制受限，请手动选择';
  }
  window.setTimeout(() => {
    button.textContent = '复制代码';
  }, COPY_FEEDBACK_DURATION);
}

function initializeCodeCopy(): void {
  document.querySelectorAll<HTMLElement>('.prose pre').forEach((pre) => {
    const code = pre.querySelector('code');
    if (!code) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code';
    button.textContent = '复制代码';
    button.setAttribute('aria-live', 'polite');
    button.addEventListener('click', () => {
      void copyCode(button, code);
    });
    pre.tabIndex = 0;
    pre.append(button);
  });
}

function initializeTables(): void {
  document.querySelectorAll<HTMLTableElement>('.prose table').forEach((table) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', '数据表格，可横向滚动');
    table.before(wrapper);
    wrapper.append(table);
  });
}

function readTocEntries(): TocEntry[] {
  return [...document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')].map((link) => {
    const id = decodeURIComponent(link.hash.slice(1));
    const section = document.getElementById(id);
    if (!section) throw new Error(`Table of contents target is missing: ${id}`);
    return { link, section };
  });
}

function highlightCurrentSection(entries: TocEntry[]): void {
  let current = 0;
  entries.forEach(({ section }, index) => {
    if (section.getBoundingClientRect().top <= TOC_ACTIVATION_OFFSET) current = index;
  });
  entries.forEach(({ link }, index) =>
    index === current ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'),
  );
}

function initializeTableOfContents(): void {
  const entries = readTocEntries();
  if (!entries.length) return;
  const details = document.querySelector<HTMLDetailsElement>('.toc details');
  if (details && matchMedia(MOBILE_TOC_QUERY).matches) details.open = false;
  observeViewport(() => highlightCurrentSection(entries));
}

initializeCodeCopy();
initializeTables();
initializeTableOfContents();
