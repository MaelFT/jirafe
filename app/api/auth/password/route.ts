import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/database';
import { verifyToken, COOKIE_NAME, verifyPassword, hashPassword } from '@/lib/auth';

export async function PATCH(request: Request) {
  try {
    // Récupérer le token depuis les cookies
    const token = cookies().get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier le token
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Mot de passe actuel et nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [payload.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    // Vérifier le mot de passe actuel
    const isValid = await verifyPassword(currentPassword, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect' },
        { status: 401 }
      );
    }

    // Hasher le nouveau mot de passe
    const newPasswordHash = await hashPassword(newPassword);

    // Mettre à jour le mot de passe
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, payload.userId]
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('Update password error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du changement de mot de passe' },
      { status: 500 }
    );
  }
}


