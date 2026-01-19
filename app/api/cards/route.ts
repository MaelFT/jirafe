import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// POST /api/cards - Créer une nouvelle carte
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { column_id, title, description, assignee_id, priority, position } = body;
    
    const result = await query(
      `INSERT INTO cards (column_id, title, description, assignee_id, priority, position)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [column_id, title || '', description || '', assignee_id || null, priority || 'P3', position || 0]
    );
    
    return NextResponse.json({
      data: result.rows[0],
      error: null,
    });
  } catch (error: any) {
    console.error('Error creating card:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}


