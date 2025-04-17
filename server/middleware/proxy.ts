import { eventHandler } from 'h3';
import { createCaribbeanProxyRequestWithAuth } from '../utils/proxy-util';

export default eventHandler(async (event) => {
  console.log('event.node.req.url: ', event.node.req.url);
  if (event.node.req.url?.startsWith('/api/caribbean-proxy')) {
    const targetPath = event.node.req.url.replace(/^\/api\/caribbean-proxy/, '') || '';
    return createCaribbeanProxyRequestWithAuth(event, targetPath);
  }
  return;
});
