import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);
const COOKIE_NAME = 'jirafe-auth-token';

// Routes publiques (pas besoin d'être connecté)
const publicRoutes = ['/login', '/signup'];

// Routes API publiques
const publicApiRoutes = ['/api/auth/login', '/api/auth/signup'];

async function verifyTokenInMiddleware(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Laisser passer les fichiers statiques et les API routes publiques
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') || // fichiers statiques (images, css, etc.)
    publicApiRoutes.some(route => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  // Récupérer le token depuis les cookies
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Vérifier le token
  const isAuthenticated = token ? await verifyTokenInMiddleware(token) : false;

  // Si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    // Laisser passer les routes publiques
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    // Rediriger vers login pour les routes protégées
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si l'utilisateur est connecté et essaie d'accéder à login/signup
  if (publicRoutes.includes(pathname)) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  // Laisser passer
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
