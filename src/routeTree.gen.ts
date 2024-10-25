/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AuthImport } from './routes/_auth'
import { Route as LoginRouteImport } from './routes/login/route'
import { Route as IndexImport } from './routes/index'
import { Route as AuthGradeImport } from './routes/_auth.grade'
import { Route as AuthDashboardImport } from './routes/_auth._dashboard'
import { Route as AuthIntegrateSendEnquiriesRouteImport } from './routes/_auth.integrate-send-enquiries/route'
import { Route as AuthGradePidImport } from './routes/_auth.grade/$pid'
import { Route as AuthDashboardListRouteImport } from './routes/_auth._dashboard/list/route'
import { Route as AuthDashboardImportRouteImport } from './routes/_auth._dashboard/import/route'
import { Route as AuthDashboardEachRouteImport } from './routes/_auth._dashboard/each/route'
import { Route as AuthGradePidShareImport } from './routes/_auth.grade/$pid_.share'
import { Route as AuthGradeShareSuccessRouteImport } from './routes/_auth.grade_.share_.success/route'
import { Route as AuthGradePidShareConfirmImport } from './routes/_auth.grade/$pid_.share/confirm'
import { Route as AuthGradePidShareCreateNewRouteImport } from './routes/_auth.grade/$pid_.share/create-new/route'
import { Route as AuthGradePidShareIndexRouteImport } from './routes/_auth.grade/$pid_.share/index/route'

// Create/Update Routes

const AuthRoute = AuthImport.update({
  id: '/_auth',
  getParentRoute: () => rootRoute,
} as any)

const LoginRouteRoute = LoginRouteImport.update({
  path: '/login',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/login/route.lazy').then((d) => d.Route))

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const AuthGradeRoute = AuthGradeImport.update({
  path: '/grade',
  getParentRoute: () => AuthRoute,
} as any)

const AuthDashboardRoute = AuthDashboardImport.update({
  id: '/_dashboard',
  getParentRoute: () => AuthRoute,
} as any)

const AuthIntegrateSendEnquiriesRouteRoute =
  AuthIntegrateSendEnquiriesRouteImport.update({
    path: '/integrate-send-enquiries',
    getParentRoute: () => AuthRoute,
  } as any).lazy(() =>
    import('./routes/_auth.integrate-send-enquiries/route.lazy').then(
      (d) => d.Route,
    ),
  )

const AuthGradePidRoute = AuthGradePidImport.update({
  path: '/$pid',
  getParentRoute: () => AuthGradeRoute,
} as any)

const AuthDashboardListRouteRoute = AuthDashboardListRouteImport.update({
  path: '/list',
  getParentRoute: () => AuthDashboardRoute,
} as any).lazy(() =>
  import('./routes/_auth._dashboard/list/route.lazy').then((d) => d.Route),
)

const AuthDashboardImportRouteRoute = AuthDashboardImportRouteImport.update({
  path: '/import',
  getParentRoute: () => AuthDashboardRoute,
} as any).lazy(() =>
  import('./routes/_auth._dashboard/import/route.lazy').then((d) => d.Route),
)

const AuthDashboardEachRouteRoute = AuthDashboardEachRouteImport.update({
  path: '/each',
  getParentRoute: () => AuthDashboardRoute,
} as any).lazy(() =>
  import('./routes/_auth._dashboard/each/route.lazy').then((d) => d.Route),
)

const AuthGradePidShareRoute = AuthGradePidShareImport.update({
  path: '/$pid/share',
  getParentRoute: () => AuthGradeRoute,
} as any)

const AuthGradeShareSuccessRouteRoute = AuthGradeShareSuccessRouteImport.update(
  {
    path: '/grade/share/success',
    getParentRoute: () => AuthRoute,
  } as any,
).lazy(() =>
  import('./routes/_auth.grade_.share_.success/route.lazy').then(
    (d) => d.Route,
  ),
)

const AuthGradePidShareConfirmRoute = AuthGradePidShareConfirmImport.update({
  path: '/confirm',
  getParentRoute: () => AuthGradePidShareRoute,
} as any)

const AuthGradePidShareCreateNewRouteRoute =
  AuthGradePidShareCreateNewRouteImport.update({
    path: '/create-new',
    getParentRoute: () => AuthGradePidShareRoute,
  } as any).lazy(() =>
    import('./routes/_auth.grade/$pid_.share/create-new/route.lazy').then(
      (d) => d.Route,
    ),
  )

const AuthGradePidShareIndexRouteRoute =
  AuthGradePidShareIndexRouteImport.update({
    path: '/',
    getParentRoute: () => AuthGradePidShareRoute,
  } as any).lazy(() =>
    import('./routes/_auth.grade/$pid_.share/index/route.lazy').then(
      (d) => d.Route,
    ),
  )

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      preLoaderRoute: typeof LoginRouteImport
      parentRoute: typeof rootRoute
    }
    '/_auth': {
      preLoaderRoute: typeof AuthImport
      parentRoute: typeof rootRoute
    }
    '/_auth/integrate-send-enquiries': {
      preLoaderRoute: typeof AuthIntegrateSendEnquiriesRouteImport
      parentRoute: typeof AuthImport
    }
    '/_auth/_dashboard': {
      preLoaderRoute: typeof AuthDashboardImport
      parentRoute: typeof AuthImport
    }
    '/_auth/grade': {
      preLoaderRoute: typeof AuthGradeImport
      parentRoute: typeof AuthImport
    }
    '/_auth/_dashboard/each': {
      preLoaderRoute: typeof AuthDashboardEachRouteImport
      parentRoute: typeof AuthDashboardImport
    }
    '/_auth/_dashboard/import': {
      preLoaderRoute: typeof AuthDashboardImportRouteImport
      parentRoute: typeof AuthDashboardImport
    }
    '/_auth/_dashboard/list': {
      preLoaderRoute: typeof AuthDashboardListRouteImport
      parentRoute: typeof AuthDashboardImport
    }
    '/_auth/grade/$pid': {
      preLoaderRoute: typeof AuthGradePidImport
      parentRoute: typeof AuthGradeImport
    }
    '/_auth/grade/share/success': {
      preLoaderRoute: typeof AuthGradeShareSuccessRouteImport
      parentRoute: typeof AuthImport
    }
    '/_auth/grade/$pid/share': {
      preLoaderRoute: typeof AuthGradePidShareImport
      parentRoute: typeof AuthGradeImport
    }
    '/_auth/grade/$pid/share/': {
      preLoaderRoute: typeof AuthGradePidShareIndexRouteImport
      parentRoute: typeof AuthGradePidShareImport
    }
    '/_auth/grade/$pid/share/create-new': {
      preLoaderRoute: typeof AuthGradePidShareCreateNewRouteImport
      parentRoute: typeof AuthGradePidShareImport
    }
    '/_auth/grade/$pid/share/confirm': {
      preLoaderRoute: typeof AuthGradePidShareConfirmImport
      parentRoute: typeof AuthGradePidShareImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  LoginRouteRoute,
  AuthRoute.addChildren([
    AuthIntegrateSendEnquiriesRouteRoute,
    AuthDashboardRoute.addChildren([
      AuthDashboardEachRouteRoute,
      AuthDashboardImportRouteRoute,
      AuthDashboardListRouteRoute,
    ]),
    AuthGradeRoute.addChildren([
      AuthGradePidRoute,
      AuthGradePidShareRoute.addChildren([
        AuthGradePidShareIndexRouteRoute,
        AuthGradePidShareCreateNewRouteRoute,
        AuthGradePidShareConfirmRoute,
      ]),
    ]),
    AuthGradeShareSuccessRouteRoute,
  ]),
])

/* prettier-ignore-end */
