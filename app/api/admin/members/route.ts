import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const members = await prisma.member.findMany({ include: { position: true } });
  return NextResponse.json(members);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, positionId, image, facebookLink, pageLink } = await request.json();
  const member = await prisma.member.create({
    data: { name, positionId, image, facebookLink, pageLink },
  });
  return NextResponse.json(member);
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, name, positionId, image, facebookLink, pageLink } = await request.json();
  const member = await prisma.member.update({
    where: { id },
    data: { name, positionId, image, facebookLink, pageLink },
  });
  return NextResponse.json(member);
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  await prisma.member.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

