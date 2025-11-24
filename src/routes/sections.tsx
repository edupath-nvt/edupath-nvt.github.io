import type { RouteObject } from 'react-router';

import { lazy } from 'react';
import { Outlet } from 'react-router-dom';

import { MobileLayout } from 'src/layouts/mobile-layout';
import { DashboardContent } from 'src/layouts/dashboard';

import { CheckAuth } from './components/check-auth';
// ----------------------------------------------------------------------

const routesSection: RouteObject[] = [
  {
    element: (
      <CheckAuth>
        <MobileLayout>
          <DashboardContent maxWidth="sm">
            <Outlet />
          </DashboardContent>
        </MobileLayout>
      </CheckAuth>
    ),
    children: [
      {
        path: '/',
        Component: lazy(() => import('src/pages/target/page')),
      },
      {
        path: '/calendar',
        Component: lazy(() => import('src/pages/schedule/page')),
      },
      {
        path: '/setting',
        Component: lazy(() => import('src/pages/settings/page')),
      },
      {
        path: '/ai-analysis',
        Component: lazy(() => import('src/pages/ai-analysis/page')),
      },
      {
        path: '*',
        Component: lazy(() => import('src/pages/not-found-view/index')),
      },
    ],
  },
  { path: '*', Component: lazy(() => import('src/pages/not-found-view/index')) },
];

export default routesSection;
