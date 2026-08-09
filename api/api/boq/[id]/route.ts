// app/api/boq/[id]/route.ts

import { NextResponse } from 'next/server';
import { getBoqById, updateBoqStatus } from '@/lib/boq';

// GET: Fetch a single BOQ with its line items
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const boqId = params.id;
    if (!boqId) {
      return NextResponse.json({ error: 'BOQ ID is required' }, { status: 400 });
    }

    const boq = await getBoqById(boqId);
    return NextResponse.json({ success: true, data: boq });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Update status of a BOQ (Client approves, rejects, or requests revision)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const boqId = params.id;
    const body = await request.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updatedBoq = await updateBoqStatus(boqId, status, notes);
    return NextResponse.json({ success: true, data: updatedBoq });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}