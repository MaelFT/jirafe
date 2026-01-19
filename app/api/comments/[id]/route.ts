import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// PATCH /api/comments/[id] - Mettre à jour un commentaire
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    const body = await request.json();
    const { text } = body;
    
    const result = await query(
      'UPDATE comments SET text = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [text, commentId]
    );
    
    return NextResponse.json({
      data: result.rows[0],
      error: null,
    });
  } catch (error: any) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/comments/[id] - Supprimer un commentaire
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    
    await query('DELETE FROM comments WHERE id = $1', [commentId]);
    
    return NextResponse.json({
      data: { success: true },
      error: null,
    });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}


