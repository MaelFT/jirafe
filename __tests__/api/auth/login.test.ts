/**
 * Tests pour l'API Route /api/auth/login
 * 
 * Teste :
 * - Connexion réussie
 * - Validation credentials
 * - Création du JWT cookie
 * - Gestion des erreurs
 */

import { POST } from '@/app/api/auth/login/route'
import { query } from '@/lib/database'
import { verifyPassword } from '@/lib/auth'

// Mock de la base de données
jest.mock('@/lib/database', () => ({
  query: jest.fn(),
}))

// Mock de verifyPassword
jest.mock('@/lib/auth', () => ({
  ...jest.requireActual('@/lib/auth'),
  verifyPassword: jest.fn(),
}))

const mockQuery = query as jest.MockedFunction<typeof query>
const mockVerifyPassword = verifyPassword as jest.MockedFunction<typeof verifyPassword>

describe('API /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Login réussi', () => {
    it('devrait connecter un utilisateur avec des credentials valides', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Alice',
        email: 'alice@jirafe.local',
        password_hash: '$2b$10$hashedPassword',
        avatar: 'A',
      }

      mockQuery.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 } as any)
      mockVerifyPassword.mockResolvedValueOnce(true)

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'alice@jirafe.local',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe('alice@jirafe.local')
      expect(mockVerifyPassword).toHaveBeenCalledWith('password123', mockUser.password_hash)
    })

    it('devrait créer un cookie JWT après connexion réussie', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Bob',
        email: 'bob@test.com',
        password_hash: '$2b$10$hash',
        avatar: 'B',
      }

      mockQuery.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 } as any)
      mockVerifyPassword.mockResolvedValueOnce(true)

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'bob@test.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      
      // Vérifie que la réponse contient un cookie
      const cookies = response.headers.get('set-cookie')
      expect(cookies).toBeTruthy()
      if (cookies) {
        expect(cookies).toContain('jirafe-auth-token')
      }
    })
  })

  describe('Validation des credentials', () => {
    it('devrait rejeter si l\'email est manquant', async () => {
      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('requis')
    })

    it('devrait rejeter si le mot de passe est manquant', async () => {
      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@test.com',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('requis')
    })

    it('devrait rejeter si l\'email n\'existe pas', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'notfound@test.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('incorrect')
    })

    it('devrait rejeter si le mot de passe est incorrect', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Alice',
        email: 'alice@test.com',
        password_hash: '$2b$10$correctHash',
        avatar: 'A',
      }

      mockQuery.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 } as any)
      mockVerifyPassword.mockResolvedValueOnce(false) // Mauvais mot de passe

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'alice@test.com',
          password: 'wrongPassword',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('incorrect')
    })
  })

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs de base de données', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })
})


