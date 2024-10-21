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
import { Route as AuthGradeImport } from './routes/_auth._grade'
import { Route as AuthDashboardImport } from './routes/_auth._dashboard'
import { Route as AuthIntegrateSendEnquiriesRouteImport } from './routes/_auth.integrate-send-enquiries/route'
import { Route as AuthGradeIntegrateGradeImport } from './routes/_auth._grade/integrate-grade'
import { Route as AuthDashboardListRouteImport } from './routes/_auth._dashboard/list/route'
import { Route as AuthDashboardImportRouteImport } from './routes/_auth._dashboard/import/route'
import { Route as AuthDashboardEachRouteImport } from './routes/_auth._dashboard/each/route'
import { Route as AuthGradeIntegrateGradeShareExistingRouteImport } from './routes/_auth._grade/integrate-grade-share/existing/route'
import { Route as AuthGradeIntegrateGradeShareCreateNewRouteImport } from './routes/_auth._grade/integrate-grade-share/create-new/route'
import { Route as AuthGradeIntegrateGradeShareIndexRouteImport } from './routes/_auth._grade/integrate-grade-share/index/route'

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
  id: '/_grade',
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

const AuthGradeIntegrateGradeRoute = AuthGradeIntegrateGradeImport.update({
  path: '/integrate-grade',
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

const AuthGradeIntegrateGradeShareExistingRouteRoute =
  AuthGradeIntegrateGradeShareExistingRouteImport.update({
    path: '/integrate-grade-share/existing',
    getParentRoute: () => AuthGradeRoute,
  } as any).lazy(() =>
    import(
      './routes/_auth._grade/integrate-grade-share/existing/route.lazy'
    ).then((d) => d.Route),
  )

const AuthGradeIntegrateGradeShareCreateNewRouteRoute =
  AuthGradeIntegrateGradeShareCreateNewRouteImport.update({
    path: '/integrate-grade-share/create-new',
    getParentRoute: () => AuthGradeRoute,
  } as any).lazy(() =>
    import(
      './routes/_auth._grade/integrate-grade-share/create-new/route.lazy'
    ).then((d) => d.Route),
  )

const AuthGradeIntegrateGradeShareIndexRouteRoute =
  AuthGradeIntegrateGradeShareIndexRouteImport.update({
    path: '/integrate-grade-share/',
    getParentRoute: () => AuthGradeRoute,
  } as any).lazy(() =>
    import('./routes/_auth._grade/integrate-grade-share/index/route.lazy').then(
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
    '/_auth/_grade': {
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
    '/_auth/_grade/integrate-grade': {
      preLoaderRoute: typeof AuthGradeIntegrateGradeImport
      parentRoute: typeof AuthGradeImport
    }
    '/_auth/_grade/integrate-grade-share/': {
      preLoaderRoute: typeof AuthGradeIntegrateGradeShareIndexRouteImport
      parentRoute: typeof AuthGradeImport
    }
    '/_auth/_grade/integrate-grade-share/create-new': {
      preLoaderRoute: typeof AuthGradeIntegrateGradeShareCreateNewRouteImport
      parentRoute: typeof AuthGradeImport
    }
    '/_auth/_grade/integrate-grade-share/existing': {
      preLoaderRoute: typeof AuthGradeIntegrateGradeShareExistingRouteImport
      parentRoute: typeof AuthGradeImport
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
      AuthGradeIntegrateGradeRoute,
      AuthGradeIntegrateGradeShareIndexRouteRoute,
      AuthGradeIntegrateGradeShareCreateNewRouteRoute,
      AuthGradeIntegrateGradeShareExistingRouteRoute,
    ]),
  ]),
])

/* prettier-ignore-end */
