// app/api/boq/route.ts

import { NextResponse } from 'next/server';
import { createBoq, getBoqsForArtisan, getBoqsForClient } from '@/lib/boq';

// POST: Create a new BOQ
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { artisanId, ...inputData } = body;

    if (!artisanId) {
      return NextResponse.json({ error: 'artisanId is required' }, { status: 400 });
    }

    if (!inputData.client_id || !inputData.title || !inputData.items?.length) {
      return NextResponse.json({ error: 'Title, client_id, and at least one item are required' }, { status: 400 });
    }

    const newBoq = await createBoq(inputData, artisanId);
    return NextResponse.json({ success: true, data: newBoq }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Fetch BOQs for either artisan or client via query param (?artisanId=... or ?clientId=...)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const artisanId = searchParams.get('artisanId');
    const clientId = searchParams.get('clientId');

    if (artisanId) {
      const boqs = await getBoqsForArtisan(artisanId);
      return NextResponse.json({ success: true, data: boqs });
    }

    if (clientId) {
      const boqs = await getBoqsForClient(clientId);
      return NextResponse.json({ success: true, data: boqs });
    }

    return NextResponse.json(
      { error: 'Either artisanId or clientId query parameter is required' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
