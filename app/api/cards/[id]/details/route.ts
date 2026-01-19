import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET /api/cards/[id]/details - Récupérer tous les détails d'une carte
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cardId = params.id;
    
    // Récupérer la carte
    const cardResult = await query(
      'SELECT * FROM cards WHERE id = $1',
      [cardId]
    );
    
    if (cardResult.rows.length === 0) {
      return NextResponse.json(
        { data: null, error: 'Card not found' },
        { status: 404 }
      );
    }
    
    const card = cardResult.rows[0];
    
    // Récupérer l'assignee si présent
    let assignee = null;
    if (card.assignee_id) {
      const assigneeResult = await query(
        'SELECT * FROM users WHERE id = $1',
        [card.assignee_id]
      );
      assignee = assigneeResult.rows[0] || null;
    }
    
    // Récupérer les commentaires avec leurs auteurs
    const commentsResult = await query(
      `SELECT c.*, u.id as author_id, u.name as author_name, u.avatar as author_avatar, u.created_at as author_created_at
       FROM comments c
       INNER JOIN users u ON c.author_id = u.id
       WHERE c.card_id = $1
       ORDER BY c.created_at ASC`,
      [cardId]
    );
    
    const comments = commentsResult.rows.map((c: any) => ({
      id: c.id,
      card_id: c.card_id,
      author_id: c.author_id,
      text: c.text,
      created_at: c.created_at,
      updated_at: c.updated_at,
      author: {
        id: c.author_id,
        name: c.author_name,
        avatar: c.author_avatar,
        created_at: c.author_created_at,
      },
    }));
    
    // Récupérer les tags
    const tagsResult = await query(
      `SELECT t.* FROM tags t
       INNER JOIN card_tags ct ON t.id = ct.tag_id
       WHERE ct.card_id = $1`,
      [cardId]
    );
    
    // Récupérer les subtasks
    const subtasksResult = await query(
      'SELECT * FROM subtasks WHERE card_id = $1 ORDER BY position',
      [cardId]
    );
    
    // Récupérer les activités
    const activitiesResult = await query(
      `SELECT a.*, u.id as user_id, u.name as user_name, u.avatar as user_avatar, u.created_at as user_created_at
       FROM card_activities a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.card_id = $1
       ORDER BY a.created_at DESC`,
      [cardId]
    );
    
    const activities = activitiesResult.rows.map((a: any) => ({
      id: a.id,
      card_id: a.card_id,
      user_id: a.user_id,
      action_type: a.action_type,
      field_name: a.field_name,
      old_value: a.old_value,
      new_value: a.new_value,
      created_at: a.created_at,
      user: a.user_id ? {
        id: a.user_id,
        name: a.user_name,
        avatar: a.user_avatar,
        created_at: a.user_created_at,
      } : null,
    }));
    
    return NextResponse.json({
      data: {
        ...card,
        assignee,
        comments,
        tags: tagsResult.rows,
        subtasks: subtasksResult.rows,
        activities,
      },
      error: null,
    });
  } catch (error: any) {
    console.error('Error fetching card details:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

