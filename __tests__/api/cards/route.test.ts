/**
 * Tests pour l'API Route /api/cards
 * 
 * Teste :
 * - POST: Création d'une carte avec priority
 */

import { POST } from '@/app/api/cards/route'
import { query } from '@/lib/database'

// Mock de la base de données
jest.mock('@/lib/database', () => ({
  query: jest.fn(),
}))

const mockQuery = query as jest.MockedFunction<typeof query>

describe('API /api/cards', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST - Création d\'une carte', () => {
    it('devrait créer une carte avec toutes les données', async () => {
      const mockCard = {
        id: 'card-1',
        column_id: 'col-1',
        title: 'Nouvelle tâche',
        description: 'Description',
        assignee_id: 'user-1',
        priority: 'P1',
        position: 0,
      }

      mockQuery.mockResolvedValueOnce({ rows: [mockCard], rowCount: 1 } as any)

      const request = new Request('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify({
          column_id: 'col-1',
          title: 'Nouvelle tâche',
          description: 'Description',
          assignee_id: 'user-1',
          priority: 'P1',
          position: 0,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual(mockCard)
      expect(data.error).toBeNull()
    })

    it('devrait utiliser la priorité par défaut P3 si non fournie', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'card-1', priority: 'P3' }],
        rowCount: 1
      } as any)

      const request = new Request('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify({
          column_id: 'col-1',
          title: 'Tâche',
        }),
      })

      await POST(request)

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['P3'])
      )
    })

    it('devrait accepter toutes les priorités (P0, P1, P2, P3)', async () => {
      for (const priority of ['P0', 'P1', 'P2', 'P3']) {
        mockQuery.mockResolvedValueOnce({
          rows: [{ id: 'card-1', priority }],
          rowCount: 1
        } as any)

        const request = new Request('http://localhost:3000/api/cards', {
          method: 'POST',
          body: JSON.stringify({
            column_id: 'col-1',
            title: 'Tâche',
            priority,
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.priority).toBe(priority)
      }
    })

    it('devrait utiliser des valeurs par défaut pour les champs optionnels', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ 
          id: 'card-1', 
          title: '', 
          description: '', 
          assignee_id: null,
          priority: 'P3',
          position: 0 
        }],
        rowCount: 1
      } as any)

      const request = new Request('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify({
          column_id: 'col-1',
        }),
      })

      await POST(request)

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['col-1', '', '', null, 'P3', 0]
      )
    })

    it('devrait gérer les erreurs de base de données', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Insert failed'))

      const request = new Request('http://localhost:3000/api/cards', {
        method: 'POST',
        body: JSON.stringify({
          column_id: 'col-1',
          title: 'Tâche',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })
})


