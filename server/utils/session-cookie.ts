export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  path: '/',
} as const;
