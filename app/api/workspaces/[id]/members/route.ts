import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/database';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

// POST /api/workspaces/[id]/members - Inviter un membre
export async function POST(
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
    const body = await request.json();
    const { email, role } = body;

    // Vérifier que l'utilisateur a les permissions
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

    // Trouver l'utilisateur par email
    const userResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const newUserId = userResult.rows[0].id;

    // Vérifier s'il n'est pas déjà membre
    const existingMember = await query(
      'SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [workspaceId, newUserId]
    );

    if (existingMember.rows.length > 0) {
      return NextResponse.json(
        { error: 'Cet utilisateur est déjà membre du workspace' },
        { status: 400 }
      );
    }

    // Ajouter le membre
    const result = await query(
      `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [workspaceId, newUserId, role || 'member']
    );

    return NextResponse.json({ data: result.rows[0] });
  } catch (error: any) {
    console.error('Error adding member:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout du membre' },
      { status: 500 }
    );
  }
}


