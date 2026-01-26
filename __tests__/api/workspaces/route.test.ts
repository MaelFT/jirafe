/**
 * Tests pour l'API Route /api/workspaces
 * 
 * Teste :
 * - GET: Récupération des workspaces de l'utilisateur
 * - POST: Création d'un workspace avec owner automatique
 */

import { GET, POST } from '@/app/api/workspaces/route'
import { query } from '@/lib/database'
import { verifyToken } from '@/lib/auth'

// Mock de la base de données
jest.mock('@/lib/database', () => ({
  query: jest.fn(),
}))

// Mock de verifyToken
jest.mock('@/lib/auth', () => ({
  ...jest.requireActual('@/lib/auth'),
  verifyToken: jest.fn(),
  COOKIE_NAME: 'jirafe-auth-token',
}))

// Mock de next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn((name: string) => {
      if (name === 'jirafe-auth-token') {
        return { name, value: 'mock-token' }
      }
      return undefined
    }),
  })),
}))

const mockQuery = query as jest.MockedFunction<typeof query>
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>

describe('API /api/workspaces', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET - Récupération des workspaces', () => {
    it('devrait retourner les workspaces de l\'utilisateur authentifié', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-1', email: 'test@test.com' })

      const mockWorkspaces = [
        { id: 'ws-1', name: 'Mon Workspace', role: 'owner', board_count: 5, member_count: 3 },
        { id: 'ws-2', name: 'Autre Workspace', role: 'member', board_count: 2, member_count: 10 },
      ]

      mockQuery.mockResolvedValueOnce({ rows: mockWorkspaces, rowCount: 2 } as any)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual(mockWorkspaces)
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['user-1']
      )
    })

    it('devrait rejeter si l\'utilisateur n\'est pas authentifié', async () => {
      const cookiesMock = require('next/headers').cookies as jest.Mock
      cookiesMock.mockReturnValueOnce({
        get: jest.fn(() => undefined),
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('authentifié')
    })

    it('devrait rejeter si le token est invalide', async () => {
      mockVerifyToken.mockResolvedValueOnce(null)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Token invalide')
    })

    it('devrait gérer les erreurs de base de données', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-1', email: 'test@test.com' })
      mockQuery.mockRejectedValueOnce(new Error('DB error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })

  describe('POST - Création d\'un workspace', () => {
    it('devrait créer un workspace avec des données valides', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-1', email: 'test@test.com' })

      const mockWorkspace = {
        id: 'ws-123',
        name: 'Nouveau Workspace',
        slug: 'nouveau-workspace',
        description: 'Description',
        avatar: '🏢',
        created_by: 'user-1',
      }

      // Mock : insertion workspace
      mockQuery.mockResolvedValueOnce({ rows: [mockWorkspace], rowCount: 1 } as any)
      // Mock : insertion owner
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      const request = new Request('http://localhost:3000/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Nouveau Workspace',
          description: 'Description',
          avatar: '🏢',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual(mockWorkspace)
    })

    it('devrait générer un slug à partir du nom', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-1', email: 'test@test.com' })

      mockQuery.mockResolvedValueOnce({ 
        rows: [{ id: 'ws-1', slug: 'mon-super-workspace' }], 
        rowCount: 1 
      } as any)
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      const request = new Request('http://localhost:3000/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Mon Super Workspace!',
        }),
      })

      await POST(request)

      // Vérifier que le slug est normalisé
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['Mon Super Workspace!', 'mon-super-workspace'])
      )
    })

    it('devrait utiliser l\'avatar par défaut si non fourni', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-1', email: 'test@test.com' })

      mockQuery.mockResolvedValueOnce({ 
        rows: [{ id: 'ws-1', avatar: '🏢' }], 
        rowCount: 1 
      } as any)
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      const request = new Request('http://localhost:3000/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Workspace',
        }),
      })

      await POST(request)

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([expect.any(String), expect.any(String), null, '🏢', 'user-1'])
      )
    })

    it('devrait rejeter si le nom est vide', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-1', email: 'test@test.com' })

      const request = new Request('http://localhost:3000/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({
          name: '   ',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('requis')
    })

    it('devrait rejeter si l\'utilisateur n\'est pas authentifié', async () => {
      const cookiesMock = require('next/headers').cookies as jest.Mock
      cookiesMock.mockReturnValueOnce({
        get: jest.fn(() => undefined),
      })

      const request = new Request('http://localhost:3000/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name: 'Workspace' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('authentifié')
    })

    it('devrait gérer les erreurs de base de données', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-1', email: 'test@test.com' })
      mockQuery.mockRejectedValueOnce(new Error('Insert failed'))

      const request = new Request('http://localhost:3000/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name: 'Workspace' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })
})


