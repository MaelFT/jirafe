import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET /api/tags?board_id=xxx - Récupérer les tags d'un board
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('board_id');
    
    if (!boardId) {
      return NextResponse.json(
        { data: null, error: 'board_id is required' },
        { status: 400 }
      );
    }
    
    const result = await query(
      'SELECT * FROM tags WHERE board_id = $1 ORDER BY name',
      [boardId]
    );
    
    return NextResponse.json({
      data: result.rows,
      error: null,
    });
  } catch (error: any) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/tags - Créer un tag
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, color, board_id } = body;
    
    const result = await query(
      'INSERT INTO tags (name, color, board_id) VALUES ($1, $2, $3) RETURNING *',
      [name, color || '#3b82f6', board_id]
    );
    
    return NextResponse.json({
      data: result.rows[0],
      error: null,
    });
  } catch (error: any) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}


