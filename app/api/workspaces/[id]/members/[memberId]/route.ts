import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/database';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

// PATCH /api/workspaces/[id]/members/[memberId] - Modifier le rôle d'un membre
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
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

    const { id: workspaceId, memberId } = params;
    const body = await request.json();
    const { role } = body;

    // Vérifier que l'utilisateur a les permissions
    const memberCheck = await query(
      'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [workspaceId, payload.userId]
    );

    if (memberCheck.rows.length === 0 || 
        memberCheck.rows[0].role !== 'owner') {
      return NextResponse.json(
        { error: 'Seul le propriétaire peut modifier les rôles' },
        { status: 403 }
      );
    }

    // Vérifier qu'on ne change pas le rôle du owner
    const targetMember = await query(
      'SELECT role FROM workspace_members WHERE id = $1',
      [memberId]
    );

    if (targetMember.rows[0].role === 'owner') {
      return NextResponse.json(
        { error: 'Impossible de modifier le rôle du propriétaire' },
        { status: 400 }
      );
    }

    // Mettre à jour le rôle
    const result = await query(
      'UPDATE workspace_members SET role = $1 WHERE id = $2 RETURNING *',
      [role, memberId]
    );

    return NextResponse.json({ data: result.rows[0] });
  } catch (error: any) {
    console.error('Error updating member role:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification du rôle' },
      { status: 500 }
    );
  }
}

// DELETE /api/workspaces/[id]/members/[memberId] - Retirer un membre
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
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

    const { id: workspaceId, memberId } = params;

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

    // Vérifier qu'on ne retire pas le owner
    const targetMember = await query(
      'SELECT role FROM workspace_members WHERE id = $1',
      [memberId]
    );

    if (targetMember.rows[0].role === 'owner') {
      return NextResponse.json(
        { error: 'Impossible de retirer le propriétaire' },
        { status: 400 }
      );
    }

    // Retirer le membre
    await query('DELETE FROM workspace_members WHERE id = $1', [memberId]);

    return NextResponse.json({ data: { success: true } });
  } catch (error: any) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Erreur lors du retrait du membre' },
      { status: 500 }
    );
  }
}


