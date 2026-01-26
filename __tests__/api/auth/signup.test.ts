/**
 * Tests pour l'API Route /api/auth/signup
 * 
 * Teste :
 * - Inscription réussie
 * - Validation des données
 * - Création du workspace automatique
 * - Gestion des erreurs
 */

import { POST } from '@/app/api/auth/signup/route'
import { query } from '@/lib/database'
import { hashPassword } from '@/lib/auth'

// Mock de la base de données
jest.mock('@/lib/database', () => ({
  query: jest.fn(),
}))

// Mock de la fonction hashPassword
jest.mock('@/lib/auth', () => ({
  ...jest.requireActual('@/lib/auth'),
  hashPassword: jest.fn(),
}))

const mockQuery = query as jest.MockedFunction<typeof query>
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>

describe('API /api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock du hash par défaut
    mockHashPassword.mockResolvedValue('$2b$10$mockHashedPassword')
  })

  describe('Signup réussi', () => {
    it('devrait créer un utilisateur avec des données valides', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@jirafe.local',
        avatar: '👤',
      }

      // Mock des queries DB (4 appels dans l'ordre)
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any) // 1. Vérif email existe pas
        .mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 } as any) // 2. INSERT user
        .mockResolvedValueOnce({ rows: [{ id: 'workspace-123' }], rowCount: 1 } as any) // 3. INSERT workspace
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any) // 4. INSERT workspace_member

      const request = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@jirafe.local',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toMatchObject({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        avatar: mockUser.avatar,
      })
      expect(mockHashPassword).toHaveBeenCalledWith('password123')
    })

    it('devrait créer automatiquement un workspace pour le nouvel utilisateur', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)
        .mockResolvedValueOnce({ rows: [{ id: 'user-123', name: 'Alice', email: 'alice@test.com', avatar: '👤' }], rowCount: 1 } as any)
        .mockResolvedValueOnce({ rows: [{ id: 'ws-123' }], rowCount: 1 } as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      const request = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Alice',
          email: 'alice@test.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      // Le workspace est créé mais pas retourné dans la réponse
      // On vérifie que query a bien été appelée 4 fois (dont 2 pour le workspace)
      expect(mockQuery).toHaveBeenCalledTimes(4)
      expect(response.status).toBe(200)
      expect(data.user).toBeDefined()
    })

    it('devrait hasher le mot de passe avant de le stocker', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)
        .mockResolvedValueOnce({ rows: [{ id: 'u1', name: 'Bob', email: 'b@test.com', avatar: '👤' }], rowCount: 1 } as any)
        .mockResolvedValueOnce({ rows: [{ id: 'w1' }], rowCount: 1 } as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      const request = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Bob',
          email: 'b@test.com',
          password: 'mySecretPassword',
        }),
      })

      await POST(request)

      expect(mockHashPassword).toHaveBeenCalledWith('mySecretPassword')
    })
  })

  describe('Validation des données', () => {
    it('devrait rejeter si le nom est manquant', async () => {
      const request = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('requis')
    })

    it('devrait rejeter si l\'email est manquant', async () => {
      const request = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('requis')
    })

    it('devrait rejeter si le mot de passe est manquant', async () => {
      const request = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@test.com',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('requis')
    })

    it('devrait rejeter si l\'email existe déjà', async () => {
      // Mock : email existe déjà
      mockQuery.mockResolvedValueOnce({ 
        rows: [{ id: 'existing-user' }], 
        rowCount: 1 
      } as any)

      const request = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'existing@test.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('déjà utilisé')
    })
  })

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs de base de données', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'))

      const request = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test',
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

