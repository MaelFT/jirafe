import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET /api/users - Récupérer tous les utilisateurs
export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM users ORDER BY name'
    );
    
    return NextResponse.json({
      data: result.rows,
      error: null,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}


