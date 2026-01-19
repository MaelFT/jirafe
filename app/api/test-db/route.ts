import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    const result = await query('SELECT current_user, current_database(), version()');
    const users = await query('SELECT name, avatar FROM users LIMIT 3');
    
    return NextResponse.json({
      success: true,
      connection: result.rows[0],
      users: users.rows,
    });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


