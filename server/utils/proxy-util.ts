import { H3Event } from 'h3';

export const createCaribbeanProxyRequestWithAuth = async (event: H3Event, targetUrl: string) => {
  const userSession = await getUserSession(event);
  const accessToken = userSession.accessToken;
  const apiBaseUrl = process.env.FINISH_ADMIN_API_URL || 'http://localhost:9010';
  const target = new URL(targetUrl, apiBaseUrl);

  const headers = Object.fromEntries(
    Object.entries(event.node.req.headers || {}).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(', ') : value || '', // 배열을 문자열로 변환
    ]),
  );
  console.log('target: ', target.toString());
  return proxyRequest(event, target.toString(), {
    headers: {
      ...headers,
      Authorization: 'Bearer ' + accessToken,
    },
  });
};
