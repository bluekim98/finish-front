import createClient from 'openapi-fetch';
import type { paths } from '~/types/api';

export const makeApiClient = () => {
  const host = useRequestURL().host;
  const protocol = useRequestURL().protocol;

  const client = createClient<paths>({ baseUrl: `${protocol}//${host}/api/caribbean-proxy/` });
  return client;
};
