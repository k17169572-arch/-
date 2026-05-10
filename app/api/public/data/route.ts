import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        positions: {
          orderBy: { order: 'asc' },
          include: {
            members: true,
          }
        }
      },
    });

    const setting = await prisma.setting.findFirst();

    return NextResponse.json({
      categories,
      setting: setting ? { 
        backgroundUrl: setting.backgroundUrl, 
        musicUrl: setting.musicUrl,
        landingBackgroundUrl: setting.landingBackgroundUrl,
        landingTitle: setting.landingTitle,
        landingSubtitle: setting.landingSubtitle
      } : null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
