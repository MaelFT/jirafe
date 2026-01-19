import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// POST /api/card-tags - Ajouter un tag à une carte
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { card_id, tag_id } = body;
    
    // Vérifier si l'association existe déjà
    const existing = await query(
      'SELECT * FROM card_tags WHERE card_id = $1 AND tag_id = $2',
      [card_id, tag_id]
    );
    
    if (existing.rows.length > 0) {
      return NextResponse.json({
        data: existing.rows[0],
        error: null,
      });
    }
    
    const result = await query(
      'INSERT INTO card_tags (card_id, tag_id) VALUES ($1, $2) RETURNING *',
      [card_id, tag_id]
    );
    
    return NextResponse.json({
      data: result.rows[0],
      error: null,
    });
  } catch (error: any) {
    console.error('Error adding tag to card:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/card-tags?card_id=xxx&tag_id=yyy - Retirer un tag d'une carte
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('card_id');
    const tagId = searchParams.get('tag_id');
    
    if (!cardId || !tagId) {
      return NextResponse.json(
        { data: null, error: 'card_id and tag_id are required' },
        { status: 400 }
      );
    }
    
    await query(
      'DELETE FROM card_tags WHERE card_id = $1 AND tag_id = $2',
      [cardId, tagId]
    );
    
    return NextResponse.json({
      data: { success: true },
      error: null,
    });
  } catch (error: any) {
    console.error('Error removing tag from card:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}


