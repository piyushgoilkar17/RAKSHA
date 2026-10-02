import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BrowserRouter, Link } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AppRoutes } from '../src/routes';

// Exercise real landing links and routing independently of telemetry and WebGL.
vi.mock('../src/App', () => ({ default: () => <main>Command dashboard <Link to="/">Home</Link></main> }));
vi.mock('../src/landing/components/DroneViewer', () => ({ default: () => <div>Aircraft viewer</div> }));

let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});
async function open(path: string) {
  window.history.replaceState({}, '', path);
  await act(async () => root.render(<BrowserRouter><AppRoutes /></BrowserRouter>));
  await vi.waitFor(async () => {
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
    expect(container.textContent).not.toBe('Loading page…');
  });
}
async function click(link: HTMLAnchorElement) {
  await act(async () => { link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })); });
  await vi.waitFor(async () => {
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
    expect(container.textContent).not.toBe('Loading page…');
  });
}
it('opens the landing page at / and navigates both ways without replacing the document', async () => {
  await open('/');
  expect(container.textContent).toContain('Drone as First Responder');
  expect(document.documentElement.dataset.surface).toBe('landing');
  const originalDocument = document;
  await click(container.querySelector<HTMLAnchorElement>('a[href="/dashboard"]')!);
  expect(window.location.pathname).toBe('/dashboard');
  expect(container.textContent).toContain('Command dashboard');
  expect(document.documentElement.dataset.surface).toBe('dashboard');
  expect(document.title).toContain('Command Center');
  await click(container.querySelector<HTMLAnchorElement>('a[href="/"]')!);
  expect(window.location.pathname).toBe('/');
  expect(container.textContent).toContain('Drone as First Responder');
  expect(document.documentElement.dataset.surface).toBe('landing');
  expect(document).toBe(originalDocument);
});
it('loads the dashboard directly', async () => {
  await open('/dashboard');
  expect(container.textContent).toContain('Command dashboard');
  expect(document.documentElement.dataset.surface).toBe('dashboard');
});
it('redirects the old landing address and preserves query parameters', async () => {
  await open('/landing?source=bookmark');
  expect(window.location.pathname).toBe('/');
  expect(window.location.search).toBe('?source=bookmark');
  expect(container.textContent).toContain('Drone as First Responder');
});
it('shows a recovery link for unknown routes', async () => {
  await open('/does-not-exist');
  expect(container.textContent).toContain('Page not found');
  await click(container.querySelector<HTMLAnchorElement>('a[href="/"]')!);
  expect(window.location.pathname).toBe('/');
});
it('responds to browser history navigation', async () => {
  await open('/');
  await click(container.querySelector<HTMLAnchorElement>('a[href="/dashboard"]')!);
  await act(async () => {
    window.history.back();
    await new Promise(resolve => setTimeout(resolve, 50));
  });
  expect(window.location.pathname).toBe('/');
  expect(document.documentElement.dataset.surface).toBe('landing');
});
