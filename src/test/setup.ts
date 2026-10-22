import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// jsdom lacks these; the overlay and smooth scrolling call them.
Element.prototype.scrollIntoView = function () {};
Element.prototype.scrollTo = function () {} as typeof Element.prototype.scrollTo;
window.scrollTo = (() => {}) as typeof window.scrollTo;
