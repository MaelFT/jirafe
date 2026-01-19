import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// POST /api/comments - Créer un nouveau commentaire
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { card_id, author_id, text } = body;
    
    const result = await query(
      'INSERT INTO comments (card_id, author_id, text) VALUES ($1, $2, $3) RETURNING *',
      [card_id, author_id, text]
    );
    
    return NextResponse.json({
      data: result.rows[0],
      error: null,
    });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}


