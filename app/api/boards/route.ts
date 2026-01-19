import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/database';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

// GET /api/boards - Récupérer tous les boards
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');

    if (!workspaceId) {
      return NextResponse.json({
        data: [],
        error: null,
      });
    }

    const result = await query(
      'SELECT * FROM boards WHERE workspace_id = $1 ORDER BY created_at DESC',
      [workspaceId]
    );
    
    return NextResponse.json({
      data: result.rows,
      error: null,
    });
  } catch (error: any) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/boards - Créer un nouveau board
export async function POST(request: Request) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();
    const { name, workspace_id } = body;

    // Vérifier que l'utilisateur est membre du workspace
    const memberCheck = await query(
      'SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [workspace_id, payload.userId]
    );

    if (memberCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }
    
    const result = await query(
      'INSERT INTO boards (name, owner_id, workspace_id) VALUES ($1, $2, $3) RETURNING *',
      [name, payload.userId, workspace_id]
    );
    
    return NextResponse.json({
      data: result.rows[0],
      error: null,
    });
  } catch (error: any) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

