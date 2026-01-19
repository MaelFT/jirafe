import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// PATCH /api/columns/[id] - Mettre à jour une colonne
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const columnId = params.id;
    const body = await request.json();
    const { name, position } = body;
    
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (name) {
      fields.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (position !== undefined) {
      fields.push(`position = $${paramIndex++}`);
      values.push(position);
    }
    
    values.push(columnId);
    
    const result = await query(
      `UPDATE columns SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    return NextResponse.json({
      data: result.rows[0],
      error: null,
    });
  } catch (error: any) {
    console.error('Error updating column:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/columns/[id] - Supprimer une colonne
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const columnId = params.id;
    
    await query('DELETE FROM columns WHERE id = $1', [columnId]);
    
    return NextResponse.json({
      data: { success: true },
      error: null,
    });
  } catch (error: any) {
    console.error('Error deleting column:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}


