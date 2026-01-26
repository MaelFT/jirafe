/**
 * Tests pour l'API Route /api/boards
 * 
 * Teste :
 * - GET: Récupération des boards par workspace
 * - POST: Création d'un board avec vérification membre
 */

import { GET, POST } from '@/app/api/boards/route'
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

describe('API /api/boards', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET - Récupération des boards', () => {
    it('devrait retourner un tableau vide si aucun workspace_id n\'est fourni', async () => {
      const request = new Request('http://localhost:3000/api/boards')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual([])
      expect(data.error).toBeNull()
    })

    it('devrait retourner les boards d\'un workspace donné', async () => {
      const mockBoards = [
        { id: 'board-1', name: 'Sprint 1', workspace_id: 'ws-1', owner_id: 'user-1' },
        { id: 'board-2', name: 'Sprint 2', workspace_id: 'ws-1', owner_id: 'user-1' },
      ]

      mockQuery.mockResolvedValueOnce({ rows: mockBoards, rowCount: 2 } as any)

      const request = new Request('http://localhost:3000/api/boards?workspace_id=ws-1')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual(mockBoards)
      expect(data.error).toBeNull()
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM boards WHERE workspace_id = $1 ORDER BY created_at DESC',
        ['ws-1']
      )
    })

    it('devrait gérer les erreurs de base de données', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB connection failed'))

      const request = new Request('http://localhost:3000/api/boards?workspace_id=ws-1')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })

  describe('POST - Création d\'un board', () => {
    it('devrait créer un board avec des données valides', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-1', email: 'test@test.com' })
      
      // Mock : vérification membre du workspace
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 'member-1' }], rowCount: 1 } as any)
      
      // Mock : insertion board
      const mockBoard = {
        id: 'board-123',
        name: 'Nouveau Board',
        workspace_id: 'ws-1',
        owner_id: 'user-1',
      }
      mockQuery.mockResolvedValueOnce({ rows: [mockBoard], rowCount: 1 } as any)

      const request = new Request('http://localhost:3000/api/boards', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Nouveau Board',
          workspace_id: 'ws-1',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual(mockBoard)
      expect(data.error).toBeNull()
    })

    it('devrait rejeter si l\'utilisateur n\'est pas authentifié', async () => {
      // Mock : pas de token
      const cookiesMock = require('next/headers').cookies as jest.Mock
      cookiesMock.mockReturnValueOnce({
        get: jest.fn(() => undefined),
      })

      const request = new Request('http://localhost:3000/api/boards', {
        method: 'POST',
        body: JSON.stringify({ name: 'Board', workspace_id: 'ws-1' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('authentifié')
    })

    it('devrait rejeter si le token est invalide', async () => {
      mockVerifyToken.mockResolvedValueOnce(null)

      const request = new Request('http://localhost:3000/api/boards', {
        method: 'POST',
        body: JSON.stringify({ name: 'Board', workspace_id: 'ws-1' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Token invalide')
    })

    it('devrait rejeter si l\'utilisateur n\'est pas membre du workspace', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-1', email: 'test@test.com' })
      
      // Mock : pas membre du workspace
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      const request = new Request('http://localhost:3000/api/boards', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Board',
          workspace_id: 'ws-1',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toContain('Accès refusé')
    })

    it('devrait gérer les erreurs de base de données lors de la création', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-1', email: 'test@test.com' })
      mockQuery.mockRejectedValueOnce(new Error('Insert failed'))

      const request = new Request('http://localhost:3000/api/boards', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Board',
          workspace_id: 'ws-1',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })
})


