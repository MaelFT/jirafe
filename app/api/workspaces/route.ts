import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/database';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

// GET /api/workspaces - Récupérer tous les workspaces de l'utilisateur
export async function GET() {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer tous les workspaces dont l'utilisateur est membre
    const result = await query(
      `SELECT 
        w.*,
        wm.role,
        COUNT(DISTINCT b.id) as board_count,
        COUNT(DISTINCT wm2.user_id) as member_count
      FROM workspaces w
      INNER JOIN workspace_members wm ON w.id = wm.workspace_id
      LEFT JOIN boards b ON w.id = b.workspace_id
      LEFT JOIN workspace_members wm2 ON w.id = wm2.workspace_id
      WHERE wm.user_id = $1
      GROUP BY w.id, w.name, w.slug, w.description, w.avatar, w.created_by, w.created_at, w.updated_at, wm.role
      ORDER BY w.created_at DESC`,
      [payload.userId]
    );

    return NextResponse.json({ data: result.rows });
  } catch (error: any) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des workspaces' },
      { status: 500 }
    );
  }
}

// POST /api/workspaces - Créer un nouveau workspace
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
    const { name, description, avatar } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Le nom du workspace est requis' },
        { status: 400 }
      );
    }

    // Générer un slug à partir du nom
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Créer le workspace
    const workspaceResult = await query(
      `INSERT INTO workspaces (name, slug, description, avatar, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name.trim(), slug, description || null, avatar || '🏢', payload.userId]
    );

    const workspace = workspaceResult.rows[0];

    // Ajouter l'utilisateur comme owner
    await query(
      `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [workspace.id, payload.userId]
    );

    return NextResponse.json({ data: workspace });
  } catch (error: any) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du workspace' },
      { status: 500 }
    );
  }
}


