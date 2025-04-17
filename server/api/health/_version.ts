export default defineEventHandler((event) => ({
  env: process.env.ENV_NAME ?? 'unknown',
  status: event.node.res.statusCode,
}));
