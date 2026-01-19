import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// PATCH /api/cards/[id] - Mettre à jour une carte
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cardId = params.id;
    const body = await request.json();
    
    // Construire la requête dynamiquement selon les champs fournis
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if ('title' in body) {
      fields.push(`title = $${paramIndex++}`);
      values.push(body.title);
    }
    if ('description' in body) {
      fields.push(`description = $${paramIndex++}`);
      values.push(body.description);
    }
    if ('assignee_id' in body) {
      fields.push(`assignee_id = $${paramIndex++}`);
      values.push(body.assignee_id);
    }
    if ('priority' in body) {
      fields.push(`priority = $${paramIndex++}`);
      values.push(body.priority);
    }
    if ('column_id' in body) {
      fields.push(`column_id = $${paramIndex++}`);
      values.push(body.column_id);
    }
    if ('position' in body) {
      fields.push(`position = $${paramIndex++}`);
      values.push(body.position);
    }
    if ('due_date' in body) {
      fields.push(`due_date = $${paramIndex++}`);
      values.push(body.due_date);
    }
    
    fields.push(`updated_at = NOW()`);
    values.push(cardId);
    
    const result = await query(
      `UPDATE cards SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    return NextResponse.json({
      data: result.rows[0],
      error: null,
    });
  } catch (error: any) {
    console.error('Error updating card:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/cards/[id] - Supprimer une carte
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cardId = params.id;
    
    await query('DELETE FROM cards WHERE id = $1', [cardId]);
    
    return NextResponse.json({
      data: { success: true },
      error: null,
    });
  } catch (error: any) {
    console.error('Error deleting card:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}


