import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder in JSDOM
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Polyfill for HTMLElement.prototype.scrollIntoView
// JSDOM doesn't implement this method
Element.prototype.scrollIntoView = jest.fn();

// Polyfill for HTMLFormElement.prototype.requestSubmit
// JSDOM doesn't fully implement this method, which causes console errors in tests
Object.defineProperty(HTMLFormElement.prototype, 'requestSubmit', {
  writable: true,
  configurable: true,
  value: function (this: HTMLFormElement, submitter?: HTMLElement) {
    if (submitter) {
      // If a submitter is provided, click it
      submitter.click();
    } else {
      // Otherwise, dispatch a submit event on the form
      const event = new Event('submit', { bubbles: true, cancelable: true });
      this.dispatchEvent(event);
    }
  },
});
