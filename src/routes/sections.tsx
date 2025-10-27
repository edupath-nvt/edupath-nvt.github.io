import { lazy } from 'react';
import { Outlet, type RouteObject } from 'react-router';

import { LayoutMobile } from 'src/layouts/mobile/layout';

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------

const routesSection: RouteObject[] = [
  {
    path: '/',
    element: (
      <LayoutMobile>
        <Outlet />
      </LayoutMobile>
    ),
    children: [
      {
        index: true,
        element: 'Hello',
      },
      {
        path: 'target',
        Component: lazy(() => import('src/pages/target/page')),
      },
      { path: '*', Component: lazy(() => import('src/pages/not-found-view/index')) },
    ],
  },
  { path: '*', Component: lazy(() => import('src/pages/not-found-view/index')) },
];

export default routesSection;
