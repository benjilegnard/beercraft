import { RenderMode, type ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // data comes from the API at request time, nothing to prerender
  { path: '**', renderMode: RenderMode.Server },
];
