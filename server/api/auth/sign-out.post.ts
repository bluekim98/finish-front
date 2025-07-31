import { sessionCookieOptions } from '~/server/utils/session-cookie';

export default defineEventHandler(async (event) => {
  await clearUserSession(event, {
    cookie: sessionCookieOptions,
  });

  return {
    success: true,
  };
});
