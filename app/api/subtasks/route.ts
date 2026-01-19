import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// POST /api/subtasks - Créer une subtask
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { card_id, title, position, completed } = body;
    
    const result = await query(
      'INSERT INTO subtasks (card_id, title, position, completed) VALUES ($1, $2, $3, $4) RETURNING *',
      [card_id, title, position || 0, completed || false]
    );
    
    return NextResponse.json({
      data: result.rows[0],
      error: null,
    });
  } catch (error: any) {
    console.error('Error creating subtask:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}


