import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const positions = await prisma.position.findMany({ 
    orderBy: { order: 'asc' },
    include: { category: true }
  });
  return NextResponse.json(positions);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, order, iconType, categoryId } = await request.json();
  const position = await prisma.position.create({
    data: { name, order: order || 0, iconType: iconType || 'crown', categoryId },
  });
  return NextResponse.json(position);
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, name, order, iconType, categoryId } = await request.json();
  const position = await prisma.position.update({
    where: { id },
    data: { name, order, iconType, categoryId },
  });
  return NextResponse.json(position);
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  await prisma.position.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
