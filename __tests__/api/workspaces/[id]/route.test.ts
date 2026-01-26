/**
 * Tests pour l'API Route /api/workspaces/[id]
 * 
 * Teste :
 * - GET: Récupération d'un workspace avec membres
 * - PATCH: Mise à jour (owner/admin seulement)
 * - DELETE: Suppression (owner seulement)
 */

import { GET, PATCH, DELETE } from '@/app/api/workspaces/[id]/route'
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

describe('API /api/workspaces/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET - Récupération d\'un workspace', () => {
    it('devrait retourner un workspace avec ses membres', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-1', email: 'test@test.com' })

      // Mock : vérif membre
      mockQuery.mockResolvedValueOnce({ rows: [{ role: 'owner' }], rowCount: 1 } as any)
      // Mock : récup workspace
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'ws-1', name: 'Mon Workspace' }],
        rowCount: 1
      } as any)
      // Mock : récup membres
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: 'member-1', user_id: 'user-1', user_name: 'Alice', user_email: 'alice@test.com', user_avatar: 'A', role: 'owner', joined_at: '2024-01-01' },
        ],
        rowCount: 1
      } as any)

      const request = new Request('http://localhost:3000/api/workspaces/ws-1')
      const response = await GET(request, { params: { id: 'ws-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.id).toBe('ws-1')
      expect(data.data.members).toHaveLength(1)
      expect(data.data.members[0].user.name).toBe('Alice')
    })

    it('devrait rejeter si l\'utilisateur n\'est pas membre du workspace', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-1', email: 'test@test.com' })

      // Mock : pas membre
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      const request = new Request('http://localhost:3000/api/workspaces/ws-1')
      const response = await GET(request, { params: { id: 'ws-1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toContain('Accès refusé')
    })

    it('devrait retourner 404 si le workspace n\'existe pas', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-1', email: 'test@test.com' })

      mockQuery.mockResolvedValueOnce({ rows: [{ role: 'owner' }], rowCount: 1 } as any)
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      const request = new Request('http://localhost:3000/api/workspaces/not-found')
      const response = await GET(request, { params: { id: 'not-found' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('non trouvé')
    })
  })

  describe('PATCH - Mise à jour d\'un workspace', () => {
    it('devrait permettre à un owner de mettre à jour le workspace', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-1', email: 'test@test.com' })

      mockQuery.mockResolvedValueOnce({ rows: [{ role: 'owner' }], rowCount: 1 } as any)
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'ws-1', name: 'Workspace Updated' }],
        rowCount: 1
      } as any)

      const request = new Request('http://localhost:3000/api/workspaces/ws-1', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Workspace Updated',
          description: 'New description',
          avatar: '🚀',
        }),
      })

      const response = await PATCH(request, { params: { id: 'ws-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.name).toBe('Workspace Updated')
    })

    it('devrait permettre à un admin de mettre à jour le workspace', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-2', email: 'admin@test.com' })

      mockQuery.mockResolvedValueOnce({ rows: [{ role: 'admin' }], rowCount: 1 } as any)
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'ws-1', name: 'Updated' }],
        rowCount: 1
      } as any)

      const request = new Request('http://localhost:3000/api/workspaces/ws-1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
      })

      const response = await PATCH(request, { params: { id: 'ws-1' } })

      expect(response.status).toBe(200)
    })

    it('devrait rejeter si l\'utilisateur est seulement member', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-3', email: 'member@test.com' })

      mockQuery.mockResolvedValueOnce({ rows: [{ role: 'member' }], rowCount: 1 } as any)

      const request = new Request('http://localhost:3000/api/workspaces/ws-1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
      })

      const response = await PATCH(request, { params: { id: 'ws-1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toContain('Permissions insuffisantes')
    })
  })

  describe('DELETE - Suppression d\'un workspace', () => {
    it('devrait permettre à un owner de supprimer le workspace', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-1', email: 'test@test.com' })

      mockQuery.mockResolvedValueOnce({ rows: [{ role: 'owner' }], rowCount: 1 } as any)
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      const request = new Request('http://localhost:3000/api/workspaces/ws-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'ws-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.success).toBe(true)
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM workspaces WHERE id = $1', ['ws-1'])
    })

    it('devrait rejeter si l\'utilisateur n\'est pas owner', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-2', email: 'admin@test.com' })

      mockQuery.mockResolvedValueOnce({ rows: [{ role: 'admin' }], rowCount: 1 } as any)

      const request = new Request('http://localhost:3000/api/workspaces/ws-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'ws-1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toContain('propriétaire')
    })

    it('devrait gérer les erreurs de suppression', async () => {
      mockVerifyToken.mockResolvedValueOnce({ userId: 'user-1', email: 'test@test.com' })

      mockQuery.mockResolvedValueOnce({ rows: [{ role: 'owner' }], rowCount: 1 } as any)
      mockQuery.mockRejectedValueOnce(new Error('Delete failed'))

      const request = new Request('http://localhost:3000/api/workspaces/ws-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'ws-1' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })
})


