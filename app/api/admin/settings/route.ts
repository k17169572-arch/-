import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const setting = await prisma.setting.findFirst();
  return NextResponse.json({ 
    backgroundUrl: setting?.backgroundUrl || '', 
    musicUrl: setting?.musicUrl || '',
    landingBackgroundUrl: setting?.landingBackgroundUrl || '',
    landingTitle: setting?.landingTitle || 'Layout Lady',
    landingSubtitle: setting?.landingSubtitle || 'Member of The Layout Lady'
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { backgroundUrl, musicUrl, landingBackgroundUrl, landingTitle, landingSubtitle, password } = body;
  
  let setting = await prisma.setting.findFirst();
  const data: any = { 
    backgroundUrl, 
    musicUrl,
    landingBackgroundUrl,
    landingTitle,
    landingSubtitle
  };
  
  if (password) {
    data.adminPasswordHash = await bcrypt.hash(password, 10);
  }

  if (!setting) {
    if (!data.adminPasswordHash) {
      data.adminPasswordHash = await bcrypt.hash('admin123', 10);
    }
    setting = await prisma.setting.create({ data });
  } else {
    setting = await prisma.setting.update({
      where: { id: setting.id },
      data,
    });
  }

  return NextResponse.json(setting);
}
