import dayjs from 'dayjs';

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, session, clear } = useUserSession();

  const currentTime = dayjs().valueOf();
  const expiredTimestamp = session.value.expiredTimestamp as number;

  if (to.path === '/login') {
    return;
  }

  if (!loggedIn.value || (expiredTimestamp && currentTime > expiredTimestamp)) {
    clear();

    return navigateTo('/login');
  }
});
