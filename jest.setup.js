// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Polyfill for TextEncoder/TextDecoder (needed for jose)
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Polyfill for Request/Response (needed for Next.js API routes)
if (typeof global.Request === 'undefined') {
  global.Request = require('node-fetch').Request
}
if (typeof global.Response === 'undefined') {
  const OriginalResponse = require('node-fetch').Response
  
  // Extend Response to add .json() static method
  class ExtendedResponse extends OriginalResponse {
    static json(data, init) {
      return new ExtendedResponse(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...(init?.headers || {}),
        },
      })
    }
  }
  
  global.Response = ExtendedResponse
}
if (typeof global.Headers === 'undefined') {
  global.Headers = require('node-fetch').Headers
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
      route: '/',
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}))

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}

