import { observeViewport } from '../lib/viewport';

const THEME_KEY = 'portfolio-theme';
const DESKTOP_NAVIGATION_QUERY = '(min-width: 601px)';
type Theme = 'light' | 'dark';
const THEME_COLORS: Readonly<Record<Theme, string>> = { dark: '#111315', light: '#f7f8f4' };

interface NavigationControls {
  button: HTMLButtonElement;
  navigation: HTMLElement;
}

function announce(message: string): void {
  const region = document.querySelector('#ui-announcement');
  if (region) region.textContent = message;
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  const button = document.querySelector('.theme-toggle');
  button?.setAttribute('aria-label', `切换到${theme === 'dark' ? '浅' : '深'}色主题`);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
}

function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    if (!(error instanceof DOMException)) throw error;
    announce('主题已切换；当前浏览器限制了偏好存储。');
  }
}

function initializeTheme(): void {
  applyTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  document.querySelector('.theme-toggle')?.addEventListener('click', () => {
    const theme: Theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    persistTheme(theme);
  });
  window.addEventListener('storage', (event) => {
    if (event.key === THEME_KEY && (event.newValue === 'light' || event.newValue === 'dark'))
      applyTheme(event.newValue);
  });
}

function setMenuOpen({ button, navigation }: NavigationControls, open: boolean): void {
  navigation.toggleAttribute('data-open', open);
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', open ? '收起导航' : '展开导航');
}

function bindMenuDismissal(controls: NavigationControls): void {
  const { button, navigation } = controls;
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !navigation.hasAttribute('data-open')) return;
    setMenuOpen(controls, false);
    button.focus();
  });
  document.addEventListener('click', (event) => {
    if (event.target instanceof Node && !navigation.contains(event.target) && !button.contains(event.target))
      setMenuOpen(controls, false);
  });
  matchMedia(DESKTOP_NAVIGATION_QUERY).addEventListener('change', () => setMenuOpen(controls, false));
}

function initializeMenu(): void {
  const button = document.querySelector<HTMLButtonElement>('.menu-toggle');
  const navigation = document.querySelector<HTMLElement>('#main-navigation');
  if (!button || !navigation) throw new Error('The navigation requires a menu button and a target.');
  const controls = { button, navigation };
  button.addEventListener('click', () =>
    setMenuOpen(controls, button.getAttribute('aria-expanded') !== 'true'),
  );
  bindMenuDismissal(controls);
}

function initializeProgress(): void {
  const bar = document.querySelector<HTMLElement>('.scroll-progress');
  if (!bar) return;
  observeViewport(() => {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
    bar.style.transform = `scaleX(${progress})`;
  });
}

initializeTheme();
initializeMenu();
initializeProgress();
