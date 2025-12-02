export function isAdminUser(userId?: string | null): boolean {
  const raw = process.env.ADMIN_USER_IDS || process.env.NEXT_PUBLIC_ADMIN_USER_IDS || 'user_36FDqjFrTzodSyvTtEGJnDo4QoP'
  const list = raw.split(',').map(s => s.trim()).filter(Boolean)
  return !!userId && list.includes(userId)
}

