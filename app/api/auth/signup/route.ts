import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { hashPassword, createToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nom, email et mot de passe requis' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existing = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const passwordHash = await hashPassword(password);

    // Créer l'utilisateur
    const result = await query(
      'INSERT INTO users (name, email, password_hash, avatar) VALUES ($1, $2, $3, $4) RETURNING id, name, email, avatar',
      [name, email.toLowerCase(), passwordHash, '👤']
    );

    const user = result.rows[0];

    // Créer un workspace personnel pour le nouvel utilisateur
    const workspaceName = `Espace de ${name}`;
    const workspaceSlug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-workspace`;
    
    const workspaceResult = await query(
      `INSERT INTO workspaces (name, slug, description, avatar, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        workspaceName,
        workspaceSlug,
        'Votre espace de travail personnel',
        '🏢',
        user.id
      ]
    );

    // Ajouter l'utilisateur comme owner du workspace
    await query(
      `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [workspaceResult.rows[0].id, user.id]
    );

    // Créer le token JWT
    const token = await createToken({
      userId: user.id,
      email: user.email,
    });

    // Créer la réponse avec le cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });

    // Définir le cookie dans la réponse
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}
