import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dispatchLead } from '@/lib/order-dispatcher';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const leadId = searchParams.get('leadId');

    if (!process.env.LEAD_RETRY_SECRET || secret !== process.env.LEAD_RETRY_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: {
        landing: true,
        variant: true,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const result = await dispatchLead(lead);

    await db.lead.update({
      where: { id: lead.id },
      data: {
        status: result.ok ? 'sent' : 'failed',
        csCartResponse: result.raw ?? (result.error ? { error: result.error } : undefined),
      },
    });

    if (result.ok) {
      return NextResponse.json({
        success: true,
        status: 'sent',
        orderId: result.externalOrderId,
      });
    }

    return NextResponse.json(
      {
        success: false,
        status: 'failed',
        error: result.error,
      },
      { status: 500 },
    );
  } catch (error: any) {
    console.error('Retry error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
