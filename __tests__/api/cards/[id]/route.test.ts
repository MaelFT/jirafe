/**
 * Tests pour l'API Route /api/cards/[id]
 * 
 * Teste :
 * - PATCH: Mise à jour partielle d'une carte (priority, title, etc.)
 * - DELETE: Suppression d'une carte
 */

import { PATCH, DELETE } from '@/app/api/cards/[id]/route'
import { query } from '@/lib/database'

// Mock de la base de données
jest.mock('@/lib/database', () => ({
  query: jest.fn(),
}))

const mockQuery = query as jest.MockedFunction<typeof query>

describe('API /api/cards/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('PATCH - Mise à jour d\'une carte', () => {
    it('devrait mettre à jour le titre d\'une carte', async () => {
      const updatedCard = {
        id: 'card-1',
        title: 'Titre mis à jour',
        priority: 'P2',
      }

      mockQuery.mockResolvedValueOnce({ rows: [updatedCard], rowCount: 1 } as any)

      const request = new Request('http://localhost:3000/api/cards/card-1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Titre mis à jour' }),
      })

      const response = await PATCH(request, { params: { id: 'card-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.title).toBe('Titre mis à jour')
      expect(data.error).toBeNull()
    })

    it('devrait mettre à jour la priorité d\'une carte', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'card-1', priority: 'P0' }],
        rowCount: 1
      } as any)

      const request = new Request('http://localhost:3000/api/cards/card-1', {
        method: 'PATCH',
        body: JSON.stringify({ priority: 'P0' }),
      })

      const response = await PATCH(request, { params: { id: 'card-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.priority).toBe('P0')
    })

    it('devrait mettre à jour plusieurs champs en même temps', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'card-1',
          title: 'Nouveau titre',
          description: 'Nouvelle description',
          priority: 'P1',
          assignee_id: 'user-2',
        }],
        rowCount: 1
      } as any)

      const request = new Request('http://localhost:3000/api/cards/card-1', {
        method: 'PATCH',
        body: JSON.stringify({
          title: 'Nouveau titre',
          description: 'Nouvelle description',
          priority: 'P1',
          assignee_id: 'user-2',
        }),
      })

      const response = await PATCH(request, { params: { id: 'card-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.title).toBe('Nouveau titre')
      expect(data.data.priority).toBe('P1')
    })

    it('devrait mettre à jour la colonne (drag and drop)', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'card-1', column_id: 'col-2', position: 3 }],
        rowCount: 1
      } as any)

      const request = new Request('http://localhost:3000/api/cards/card-1', {
        method: 'PATCH',
        body: JSON.stringify({
          column_id: 'col-2',
          position: 3,
        }),
      })

      const response = await PATCH(request, { params: { id: 'card-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.column_id).toBe('col-2')
      expect(data.data.position).toBe(3)
    })

    it('devrait mettre à jour la date d\'échéance', async () => {
      const dueDate = '2024-12-31'
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'card-1', due_date: dueDate }],
        rowCount: 1
      } as any)

      const request = new Request('http://localhost:3000/api/cards/card-1', {
        method: 'PATCH',
        body: JSON.stringify({ due_date: dueDate }),
      })

      const response = await PATCH(request, { params: { id: 'card-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.due_date).toBe(dueDate)
    })

    it('devrait gérer les erreurs de mise à jour', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Update failed'))

      const request = new Request('http://localhost:3000/api/cards/card-1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'New title' }),
      })

      const response = await PATCH(request, { params: { id: 'card-1' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })

  describe('DELETE - Suppression d\'une carte', () => {
    it('devrait supprimer une carte avec succès', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      const request = new Request('http://localhost:3000/api/cards/card-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'card-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.success).toBe(true)
      expect(data.error).toBeNull()
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM cards WHERE id = $1', ['card-1'])
    })

    it('devrait gérer les erreurs de suppression', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Delete failed'))

      const request = new Request('http://localhost:3000/api/cards/card-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'card-1' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })
})


