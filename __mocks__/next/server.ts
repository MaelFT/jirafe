/**
 * Mock du module next/server pour les tests
 */

export class NextResponse extends Response {
  static json(data: any, init?: ResponseInit) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(init?.headers || {}),
      },
    })
  }

  static redirect(url: string | URL, init?: number | ResponseInit) {
    return new Response(null, {
      ...(typeof init === 'number' ? { status: init } : init),
      status: typeof init === 'number' ? init : 307,
      headers: {
        Location: url.toString(),
      },
    })
  }
}

export class NextRequest extends Request {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, init)
  }

  get nextUrl() {
    return new URL(this.url)
  }

  get cookies() {
    return {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      getAll: jest.fn(() => []),
      has: jest.fn(() => false),
    }
  }
}


