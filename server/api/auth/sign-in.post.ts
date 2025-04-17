import dayjs from 'dayjs';
import cookieParser from 'cookie';
import { UserSession } from '~/types/auth';

type SignInRequest = {
  email: string;
  password: string;
};

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody<SignInRequest>(event);
  const authHost = `${process.env.FINISH_ADMIN_API_URL}`;
  const res = await fetch(`${authHost}/auth/sign-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: email,
      password,
    }),
  });

  const data = await res.json();

  if (!data || !data.id) {
    const statusCode = res.status || 500;
    const message = '계정 정보를 확인해주세요';

    console.error(`Error ${statusCode}: ${message}`);

    throw createError({
      status: statusCode,
      message: message,
      data: { message },
    });
  }

  const cookies = res.headers.get('Set-Cookie') ?? '';
  const cookieSet = cookieParser.parse(cookies);

  const accessToken = cookieSet.Authentication!;
  const refreshToken = cookieSet.Refresh!;
  const expiresIn = +(cookieSet.Expires ?? 60 * 60);

  const expiredTimestamp = dayjs().add(expiresIn, 'second').valueOf();
  const sessionData: UserSession = {
    user: {
      email,
      name: data.name,
    },
    accessToken,
    refreshToken,
    expiredTimestamp,
  };

  if (!event.node.res.headersSent) {
    await setUserSession(event, sessionData);
  }

  return {
    success: true,
    accessToken,
    expiredTimestamp,
  };
});
