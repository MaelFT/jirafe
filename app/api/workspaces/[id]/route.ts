import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/database';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

// GET /api/workspaces/[id] - Récupérer un workspace avec ses membres
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const workspaceId = params.id;

    // Vérifier que l'utilisateur est membre du workspace
    const memberCheck = await query(
      'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [workspaceId, payload.userId]
    );

    if (memberCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    // Récupérer le workspace
    const workspaceResult = await query(
      'SELECT * FROM workspaces WHERE id = $1',
      [workspaceId]
    );

    if (workspaceResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Workspace non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les membres
    const membersResult = await query(
      `SELECT 
        wm.*,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.avatar as user_avatar
      FROM workspace_members wm
      INNER JOIN users u ON wm.user_id = u.id
      WHERE wm.workspace_id = $1
      ORDER BY 
        CASE wm.role
          WHEN 'owner' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'member' THEN 3
        END,
        wm.joined_at`,
      [workspaceId]
    );

    const workspace = {
      ...workspaceResult.rows[0],
      members: membersResult.rows.map((m: any) => ({
        id: m.id,
        workspace_id: m.workspace_id,
        user_id: m.user_id,
        role: m.role,
        joined_at: m.joined_at,
        user: {
          id: m.user_id,
          name: m.user_name,
          email: m.user_email,
          avatar: m.user_avatar,
        },
      })),
    };

    return NextResponse.json({ data: workspace });
  } catch (error: any) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du workspace' },
      { status: 500 }
    );
  }
}

// PATCH /api/workspaces/[id] - Mettre à jour un workspace
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const workspaceId = params.id;

    // Vérifier que l'utilisateur est owner ou admin
    const memberCheck = await query(
      'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [workspaceId, payload.userId]
    );

    if (memberCheck.rows.length === 0 || 
        !['owner', 'admin'].includes(memberCheck.rows[0].role)) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, avatar } = body;

    const result = await query(
      `UPDATE workspaces 
       SET name = $1, description = $2, avatar = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, description, avatar, workspaceId]
    );

    return NextResponse.json({ data: result.rows[0] });
  } catch (error: any) {
    console.error('Error updating workspace:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du workspace' },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/[id] - Supprimer un workspace
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const workspaceId = params.id;

    // Vérifier que l'utilisateur est owner
    const memberCheck = await query(
      'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [workspaceId, payload.userId]
    );

    if (memberCheck.rows.length === 0 || memberCheck.rows[0].role !== 'owner') {
      return NextResponse.json(
        { error: 'Seul le propriétaire peut supprimer le workspace' },
        { status: 403 }
      );
    }

    // Supprimer le workspace (cascade sur members et boards)
    await query('DELETE FROM workspaces WHERE id = $1', [workspaceId]);

    return NextResponse.json({ data: { success: true } });
  } catch (error: any) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du workspace' },
      { status: 500 }
    );
  }
}


