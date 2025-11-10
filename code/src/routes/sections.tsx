import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { MobileLayout } from 'src/layouts/mobile-layout';
import { DashboardContent } from 'src/layouts/dashboard';

import { CheckAuth } from './components/check-auth';
import { renderFallback } from './components/fallback';
// ----------------------------------------------------------------------

const routesSection: RouteObject[] = [
  {
    element: (
      <CheckAuth fallback={renderFallback()}>
        <MobileLayout>
          <DashboardContent maxWidth="sm">
            <Suspense fallback={renderFallback()}>
              <Outlet />
            </Suspense>
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
        path: '*',
        Component: () => 'not found',
      },
    ],
  },
  {
    path: 'sign-up',
    Component: lazy(() => import('src/pages/user-mgt/sign-up')),
  },
  {
    path: 'sign-in',
    Component: lazy(() => import('src/pages/sign-in')),
  },
  { path: '*', Component: lazy(() => import('src/pages/not-found-view/index')) },
];

export default routesSection;
