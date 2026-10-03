import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock A-Frame HTML custom elements to prevent JSDOM errors during testing
if (typeof window !== 'undefined') {
  window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  window.HTMLMediaElement.prototype.pause = vi.fn();
}
