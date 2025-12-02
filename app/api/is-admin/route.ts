import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { isAdminUser } from '@/lib/admin'

export async function GET() {
  const { userId } = await auth()
  return NextResponse.json({ isAdmin: isAdminUser(userId) })
}

