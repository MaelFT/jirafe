import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// POST /api/columns - Créer une nouvelle colonne
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { board_id, name, position } = body;
    
    const result = await query(
      'INSERT INTO columns (board_id, name, position) VALUES ($1, $2, $3) RETURNING *',
      [board_id, name, position || 0]
    );
    
    return NextResponse.json({
      data: result.rows[0],
      error: null,
    });
  } catch (error: any) {
    console.error('Error creating column:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}


