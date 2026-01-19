import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET /api/boards/[id] - Récupérer un board avec ses colonnes et cartes
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = params.id;
    
    // Récupérer le board
    const boardResult = await query(
      'SELECT * FROM boards WHERE id = $1',
      [boardId]
    );
    
    if (boardResult.rows.length === 0) {
      return NextResponse.json(
        { data: null, error: 'Board not found' },
        { status: 404 }
      );
    }
    
    const board = boardResult.rows[0];
    
    // Récupérer les colonnes
    const columnsResult = await query(
      'SELECT * FROM columns WHERE board_id = $1 ORDER BY position',
      [boardId]
    );
    
    // Pour chaque colonne, récupérer les cartes avec détails
    const columns = await Promise.all(
      columnsResult.rows.map(async (column: any) => {
        const cardsResult = await query(
          `SELECT c.*, 
            u.id as assignee_id, u.name as assignee_name, u.avatar as assignee_avatar
          FROM cards c
          LEFT JOIN users u ON c.assignee_id = u.id
          WHERE c.column_id = $1
          ORDER BY c.position`,
          [column.id]
        );
        
        // Pour chaque carte, récupérer tags, subtasks, comments, activities
        const cards = await Promise.all(
          cardsResult.rows.map(async (card: any) => {
            // Tags
            const tagsResult = await query(
              `SELECT t.* FROM tags t
              INNER JOIN card_tags ct ON t.id = ct.tag_id
              WHERE ct.card_id = $1`,
              [card.id]
            );
            
            // Subtasks
            const subtasksResult = await query(
              'SELECT * FROM subtasks WHERE card_id = $1 ORDER BY position',
              [card.id]
            );
            
            // Comments
            const commentsResult = await query(
              `SELECT c.*, u.id as author_id, u.name as author_name, u.avatar as author_avatar
              FROM comments c
              INNER JOIN users u ON c.author_id = u.id
              WHERE c.card_id = $1
              ORDER BY c.created_at DESC`,
              [card.id]
            );
            
            // Activities
            const activitiesResult = await query(
              `SELECT a.*, u.id as user_id, u.name as user_name, u.avatar as user_avatar
              FROM card_activities a
              LEFT JOIN users u ON a.user_id = u.id
              WHERE a.card_id = $1
              ORDER BY a.created_at DESC`,
              [card.id]
            );
            
            return {
              ...card,
              assignee: card.assignee_id ? {
                id: card.assignee_id,
                name: card.assignee_name,
                avatar: card.assignee_avatar,
              } : null,
              tags: tagsResult.rows,
              subtasks: subtasksResult.rows,
              comments: commentsResult.rows.map((c: any) => ({
                ...c,
                author: {
                  id: c.author_id,
                  name: c.author_name,
                  avatar: c.author_avatar,
                },
              })),
              activities: activitiesResult.rows.map((a: any) => ({
                ...a,
                user: a.user_id ? {
                  id: a.user_id,
                  name: a.user_name,
                  avatar: a.user_avatar,
                } : null,
              })),
            };
          })
        );
        
        return {
          ...column,
          cards,
        };
      })
    );
    
    return NextResponse.json({
      data: {
        ...board,
        columns,
      },
      error: null,
    });
  } catch (error: any) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/boards/[id] - Mettre à jour un board
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = params.id;
    const body = await request.json();
    const { name } = body;
    
    const result = await query(
      'UPDATE boards SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [name, boardId]
    );
    
    return NextResponse.json({
      data: result.rows[0],
      error: null,
    });
  } catch (error: any) {
    console.error('Error updating board:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/[id] - Supprimer un board
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = params.id;
    
    await query('DELETE FROM boards WHERE id = $1', [boardId]);
    
    return NextResponse.json({
      data: { success: true },
      error: null,
    });
  } catch (error: any) {
    console.error('Error deleting board:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

