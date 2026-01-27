import { type RouteConfig } from '@react-router/dev/routes';

export default [
  { path: '/', file: 'routes/home.tsx' },
  { path: '/api/avatar/connect', file: 'routes/api.avatar.connect.ts' },
] satisfies RouteConfig;
