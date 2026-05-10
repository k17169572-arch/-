import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Check if setting exists, if not, create it with this password as default
    let setting = await prisma.setting.findFirst();
    if (!setting) {
      const hash = await bcrypt.hash('admin123', 10);
      setting = await prisma.setting.create({
        data: {
          adminPasswordHash: hash,
        },
      });
    }

    const isValid = await bcrypt.compare(password, setting.adminPasswordHash);
    
    // Also allow 'admin123' if it's the default or fallback
    if (isValid || (password === 'admin123' && setting.adminPasswordHash === '')) {
      const token = signToken({ role: 'admin' });
      const cookieStore = await cookies();
      cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
