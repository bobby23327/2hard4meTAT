import { requiredElement as required } from '../lib/dom';

interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
}

enum GalleryDirection {
  Previous = -1,
  Next = 1,
}

function readGalleryImage(thumb: HTMLButtonElement): GalleryImage {
  const { src, alt, caption } = thumb.dataset;
  if (!src || !alt || !caption) throw new TypeError('Gallery images require source, alt text, and caption.');
  return { src, alt, caption };
}

function isOutsideDialog(event: MouseEvent, dialog: HTMLDialogElement): boolean {
  const rect = dialog.getBoundingClientRect();
  return (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  );
}

class Gallery {
  private readonly dialog: HTMLDialogElement;
  private readonly thumbs: HTMLButtonElement[];
  private readonly images: GalleryImage[];
  private readonly openButton: HTMLButtonElement;
  private readonly closeButton: HTMLButtonElement;
  private focusReturnTarget: HTMLElement;
  private index = 0;

  constructor(private readonly root: HTMLElement) {
    this.dialog = required<HTMLDialogElement>(root, 'dialog');
    this.thumbs = [...root.querySelectorAll<HTMLButtonElement>('[data-gallery-thumb]')];
    this.images = this.thumbs.map(readGalleryImage);
    if (!this.images.length) throw new RangeError('A gallery requires images.');
    this.openButton = required<HTMLButtonElement>(root, '[data-open-gallery]');
    this.closeButton = required<HTMLButtonElement>(root, '[data-close-gallery]');
    this.focusReturnTarget = this.openButton;
    this.bind();
  }

  private select(index: number): void {
    this.index = (index + this.images.length) % this.images.length;
    const image = this.images[this.index];
    if (!image) throw new RangeError('Gallery image index is invalid.');
    this.root
      .querySelectorAll<HTMLImageElement>('[data-gallery-image],[data-lightbox-image]')
      .forEach((element) => {
        element.src = image.src;
        element.alt = image.alt;
      });
    this.root.querySelectorAll('[data-gallery-caption],[data-lightbox-caption]').forEach((element) => {
      element.textContent = image.caption;
    });
    this.thumbs.forEach((thumb, position) =>
      thumb.setAttribute('aria-pressed', String(position === this.index)),
    );
  }

  private open(): void {
    this.focusReturnTarget =
      document.activeElement instanceof HTMLElement ? document.activeElement : this.openButton;
    this.dialog.showModal();
    this.closeButton.focus();
  }

  private restoreFocus(): void {
    if (this.dialog.open) return;
    const target = this.focusReturnTarget.isConnected ? this.focusReturnTarget : this.openButton;
    target.focus({ preventScroll: true });
  }

  private handleArrowKey(event: KeyboardEvent): void {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? GalleryDirection.Next : GalleryDirection.Previous;
    this.select(this.index + direction);
  }

  private bindDialog(): void {
    this.dialog.addEventListener('close', () => this.restoreFocus());
    this.dialog.addEventListener('keydown', (event) => {
      this.handleArrowKey(event);
    });
    this.dialog.addEventListener('click', (event) => {
      if (event.target === this.dialog && isOutsideDialog(event, this.dialog)) this.dialog.close();
    });
  }

  private bind(): void {
    this.thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => this.select(index)));
    this.openButton.addEventListener('click', () => this.open());
    this.closeButton.addEventListener('click', () => this.dialog.close());
    required(this.root, '[data-gallery-previous]').addEventListener('click', () =>
      this.select(this.index + GalleryDirection.Previous),
    );
    required(this.root, '[data-gallery-next]').addEventListener('click', () =>
      this.select(this.index + GalleryDirection.Next),
    );
    this.bindDialog();
  }
}

document.querySelectorAll<HTMLElement>('[data-gallery]').forEach((root) => new Gallery(root));
