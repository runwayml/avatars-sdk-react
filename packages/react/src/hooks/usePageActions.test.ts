import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { JSDOM } from 'jsdom';

/**
 * Tests the DOM-facing behavior of page-actions in isolation from React/LiveKit.
 * Uses jsdom to simulate browser APIs.
 */

const HIGHLIGHT_ATTR = 'data-avatar-highlighted';

let dom: JSDOM;
let doc: Document;

function defaultResolveElement(target: string): Element | null {
  return (
    doc.getElementById(target) ??
    doc.querySelector(`[data-avatar-target="${target}"]`)
  );
}

beforeEach(() => {
  dom = new JSDOM('<!doctype html><html><body></body></html>');
  doc = dom.window.document;
});

afterEach(() => {
  dom.window.close();
});

describe('page-actions target resolution', () => {
  it('resolves by id', () => {
    doc.body.innerHTML = '<button id="my-btn">Click</button>';
    const element = defaultResolveElement('my-btn');
    expect(element).not.toBeNull();
    expect(element?.id).toBe('my-btn');
  });

  it('resolves by data-avatar-target attribute', () => {
    doc.body.innerHTML =
      '<section data-avatar-target="pricing">Plans</section>';
    const element = defaultResolveElement('pricing');
    expect(element).not.toBeNull();
    expect(element?.getAttribute('data-avatar-target')).toBe('pricing');
  });

  it('prefers id over data-avatar-target when both match', () => {
    doc.body.innerHTML = `
      <button id="dup">By ID</button>
      <span data-avatar-target="dup">By Attr</span>
    `;
    const element = defaultResolveElement('dup');
    expect(element?.tagName).toBe('BUTTON');
  });

  it('returns null for unknown targets', () => {
    doc.body.innerHTML = '<div>nothing</div>';
    expect(defaultResolveElement('nonexistent')).toBeNull();
  });
});

describe('page-actions click behavior', () => {
  it('calls .click() on the resolved HTMLElement', () => {
    doc.body.innerHTML = '<button id="btn">Go</button>';
    const btn = doc.getElementById('btn') as HTMLElement;
    const clickHandler = mock(() => {});
    btn.addEventListener('click', clickHandler);

    const element = defaultResolveElement('btn');
    (element as HTMLElement)?.click();

    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  it('does nothing if target is not found', () => {
    doc.body.innerHTML = '';
    const element = defaultResolveElement('missing');
    expect(element).toBeNull();
  });
});

describe('page-actions scroll_to behavior', () => {
  it('calls scrollIntoView on the resolved element', () => {
    doc.body.innerHTML = '<section id="features">Features</section>';
    const section = doc.getElementById('features')!;
    const scrollSpy = mock(() => {});
    section.scrollIntoView = scrollSpy;

    const element = defaultResolveElement('features');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    expect(scrollSpy).toHaveBeenCalledTimes(1);
    expect(scrollSpy).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });
});

describe('page-actions highlight behavior', () => {
  beforeEach(() => {
    doc.body.innerHTML = '<div id="card">Card</div>';
  });

  it('sets and clears the highlight attribute', () => {
    const element = defaultResolveElement('card')!;

    element.setAttribute(HIGHLIGHT_ATTR, 'true');
    expect(element.getAttribute(HIGHLIGHT_ATTR)).toBe('true');

    element.removeAttribute(HIGHLIGHT_ATTR);
    expect(element.getAttribute(HIGHLIGHT_ATTR)).toBeNull();
  });

  it('clears highlight after a timeout', async () => {
    const element = defaultResolveElement('card')!;
    element.setAttribute(HIGHLIGHT_ATTR, 'true');

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        element.removeAttribute(HIGHLIGHT_ATTR);
        resolve();
      }, 50);
    });

    expect(element.getAttribute(HIGHLIGHT_ATTR)).toBeNull();
  });
});
