// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as DashboardImport } from './routes/dashboard'
import { Route as LoginRouteImport } from './routes/login/route'
import { Route as IndexImport } from './routes/index'
import { Route as DashboardDataClientsImport } from './routes/dashboard/data/clients'
import { Route as DashboardDataEachListRouteImport } from './routes/dashboard/data/each/list/route'
import { Route as DashboardDataClientsListRouteImport } from './routes/dashboard/data/clients/list/route'
import { Route as DashboardDataClientsImportRouteImport } from './routes/dashboard/data/clients/import/route'
import { Route as DashboardDataClientsAddRouteImport } from './routes/dashboard/data/clients/add/route'

// Create/Update Routes

const DashboardRoute = DashboardImport.update({
  path: '/dashboard',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/dashboard.lazy').then((d) => d.Route))

const LoginRouteRoute = LoginRouteImport.update({
  path: '/login',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/login/route.lazy').then((d) => d.Route))

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const DashboardDataClientsRoute = DashboardDataClientsImport.update({
  path: '/data/clients',
  getParentRoute: () => DashboardRoute,
} as any).lazy(() =>
  import('./routes/dashboard/data/clients.lazy').then((d) => d.Route),
)

const DashboardDataEachListRouteRoute = DashboardDataEachListRouteImport.update(
  {
    path: '/data/each/list',
    getParentRoute: () => DashboardRoute,
  } as any,
).lazy(() =>
  import('./routes/dashboard/data/each/list/route.lazy').then((d) => d.Route),
)

const DashboardDataClientsListRouteRoute =
  DashboardDataClientsListRouteImport.update({
    path: '/list',
    getParentRoute: () => DashboardDataClientsRoute,
  } as any).lazy(() =>
    import('./routes/dashboard/data/clients/list/route.lazy').then(
      (d) => d.Route,
    ),
  )

const DashboardDataClientsImportRouteRoute =
  DashboardDataClientsImportRouteImport.update({
    path: '/import',
    getParentRoute: () => DashboardDataClientsRoute,
  } as any).lazy(() =>
    import('./routes/dashboard/data/clients/import/route.lazy').then(
      (d) => d.Route,
    ),
  )

const DashboardDataClientsAddRouteRoute =
  DashboardDataClientsAddRouteImport.update({
    path: '/add',
    getParentRoute: () => DashboardDataClientsRoute,
  } as any).lazy(() =>
    import('./routes/dashboard/data/clients/add/route.lazy').then(
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
    '/dashboard': {
      preLoaderRoute: typeof DashboardImport
      parentRoute: typeof rootRoute
    }
    '/dashboard/data/clients': {
      preLoaderRoute: typeof DashboardDataClientsImport
      parentRoute: typeof DashboardImport
    }
    '/dashboard/data/clients/add': {
      preLoaderRoute: typeof DashboardDataClientsAddRouteImport
      parentRoute: typeof DashboardDataClientsImport
    }
    '/dashboard/data/clients/import': {
      preLoaderRoute: typeof DashboardDataClientsImportRouteImport
      parentRoute: typeof DashboardDataClientsImport
    }
    '/dashboard/data/clients/list': {
      preLoaderRoute: typeof DashboardDataClientsListRouteImport
      parentRoute: typeof DashboardDataClientsImport
    }
    '/dashboard/data/each/list': {
      preLoaderRoute: typeof DashboardDataEachListRouteImport
      parentRoute: typeof DashboardImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  LoginRouteRoute,
  DashboardRoute.addChildren([
    DashboardDataClientsRoute.addChildren([
      DashboardDataClientsAddRouteRoute,
      DashboardDataClientsImportRouteRoute,
      DashboardDataClientsListRouteRoute,
    ]),
    DashboardDataEachListRouteRoute,
  ]),
])
