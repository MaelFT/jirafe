/**
 * Tests pour l'API Route /api/boards/[id]
 * 
 * Teste :
 * - GET: Récupération d'un board avec colonnes et cartes
 * - PATCH: Mise à jour d'un board
 * - DELETE: Suppression d'un board
 */

import { GET, PATCH, DELETE } from '@/app/api/boards/[id]/route'
import { query } from '@/lib/database'

// Mock de la base de données
jest.mock('@/lib/database', () => ({
  query: jest.fn(),
}))

const mockQuery = query as jest.MockedFunction<typeof query>

describe('API /api/boards/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET - Récupération d\'un board par ID', () => {
    it('devrait retourner un board avec ses colonnes et cartes', async () => {
      const mockBoard = { id: 'board-1', name: 'Sprint 1', workspace_id: 'ws-1' }
      const mockColumns = [
        { id: 'col-1', board_id: 'board-1', name: 'À faire', position: 0 },
      ]
      const mockCards = [
        { id: 'card-1', column_id: 'col-1', title: 'Tâche 1', assignee_id: null },
      ]

      // Mock : récupération board
      mockQuery.mockResolvedValueOnce({ rows: [mockBoard], rowCount: 1 } as any)
      // Mock : récupération colonnes
      mockQuery.mockResolvedValueOnce({ rows: mockColumns, rowCount: 1 } as any)
      // Mock : récupération cartes
      mockQuery.mockResolvedValueOnce({ rows: mockCards, rowCount: 1 } as any)
      // Mock : tags, subtasks, comments, activities (vides)
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any) // tags
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any) // subtasks
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any) // comments
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any) // activities

      const request = new Request('http://localhost:3000/api/boards/board-1')
      const response = await GET(request, { params: { id: 'board-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toBeDefined()
      expect(data.data.id).toBe('board-1')
      expect(data.data.columns).toHaveLength(1)
      expect(data.error).toBeNull()
    })

    it('devrait retourner 404 si le board n\'existe pas', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      const request = new Request('http://localhost:3000/api/boards/not-found')
      const response = await GET(request, { params: { id: 'not-found' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('not found')
    })

    it('devrait gérer les erreurs de base de données', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'))

      const request = new Request('http://localhost:3000/api/boards/board-1')
      const response = await GET(request, { params: { id: 'board-1' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })

  describe('PATCH - Mise à jour d\'un board', () => {
    it('devrait mettre à jour le nom d\'un board', async () => {
      const updatedBoard = {
        id: 'board-1',
        name: 'Sprint 1 - Updated',
        workspace_id: 'ws-1',
      }

      mockQuery.mockResolvedValueOnce({ rows: [updatedBoard], rowCount: 1 } as any)

      const request = new Request('http://localhost:3000/api/boards/board-1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Sprint 1 - Updated' }),
      })

      const response = await PATCH(request, { params: { id: 'board-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual(updatedBoard)
      expect(data.error).toBeNull()
      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE boards SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        ['Sprint 1 - Updated', 'board-1']
      )
    })

    it('devrait gérer les erreurs de mise à jour', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Update failed'))

      const request = new Request('http://localhost:3000/api/boards/board-1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'New Name' }),
      })

      const response = await PATCH(request, { params: { id: 'board-1' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })

  describe('DELETE - Suppression d\'un board', () => {
    it('devrait supprimer un board avec succès', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      const request = new Request('http://localhost:3000/api/boards/board-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'board-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.success).toBe(true)
      expect(data.error).toBeNull()
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM boards WHERE id = $1', ['board-1'])
    })

    it('devrait gérer les erreurs de suppression', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Delete failed'))

      const request = new Request('http://localhost:3000/api/boards/board-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'board-1' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })
})


