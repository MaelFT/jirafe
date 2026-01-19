import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// POST /api/activities - Créer une activité
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { card_id, user_id, action_type, field_name, old_value, new_value } = body;
    
    const result = await query(
      `INSERT INTO card_activities (card_id, user_id, action_type, field_name, old_value, new_value)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [card_id, user_id || null, action_type, field_name || null, old_value || null, new_value || null]
    );
    
    return NextResponse.json({
      data: result.rows[0],
      error: null,
    });
  } catch (error: any) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}


