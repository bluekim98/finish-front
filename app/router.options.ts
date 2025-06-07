import type { RouterConfig } from '@nuxt/schema';

export default <RouterConfig>{
  routes: (scannedRoutes) => [
    ...scannedRoutes,
    {
      path: '/',
      name: 'index',
      redirect: '/membership',
    },
  ],
};
