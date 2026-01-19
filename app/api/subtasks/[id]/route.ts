import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// PATCH /api/subtasks/[id] - Mettre à jour une subtask
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const subtaskId = params.id;
    const body = await request.json();
    
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if ('title' in body) {
      fields.push(`title = $${paramIndex++}`);
      values.push(body.title);
    }
    if ('completed' in body) {
      fields.push(`completed = $${paramIndex++}`);
      values.push(body.completed);
    }
    if ('position' in body) {
      fields.push(`position = $${paramIndex++}`);
      values.push(body.position);
    }
    
    values.push(subtaskId);
    
    const result = await query(
      `UPDATE subtasks SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    return NextResponse.json({
      data: result.rows[0],
      error: null,
    });
  } catch (error: any) {
    console.error('Error updating subtask:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/subtasks/[id] - Supprimer une subtask
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const subtaskId = params.id;
    
    await query('DELETE FROM subtasks WHERE id = $1', [subtaskId]);
    
    return NextResponse.json({
      data: { success: true },
      error: null,
    });
  } catch (error: any) {
    console.error('Error deleting subtask:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}


