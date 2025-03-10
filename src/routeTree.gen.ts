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
import { Route as AuthComImport } from './routes/_auth._com'
import { Route as ViewDetailsPidRouteImport } from './routes/view-details.$pid/route'
import { Route as AuthGradeSharingIndexImport } from './routes/_auth.grade-sharing_.index'
import { Route as AccessHashOwnerUidImport } from './routes/access.$hash.$ownerUid'
import { Route as AuthGradeGradeWidgetImport } from './routes/_auth.grade._gradeWidget'
import { Route as AuthGradeSharingSetupEmailImport } from './routes/_auth.grade-sharing_.setup-email'
import { Route as AuthGradeSharingSelectClientImport } from './routes/_auth.grade-sharing.select-client'
import { Route as AuthComUserImport } from './routes/_auth._com/user'
import { Route as AuthDashboardListRouteImport } from './routes/_auth._dashboard/list/route'
import { Route as AuthDashboardImportRouteImport } from './routes/_auth._dashboard/import/route'
import { Route as AuthDashboardEachRouteImport } from './routes/_auth._dashboard/each/route'
import { Route as AuthComAgentRouteImport } from './routes/_auth._com/agent/route'
import { Route as AccessHashOwnerUidSharedImport } from './routes/access.$hash.$ownerUid.shared'
import { Route as AuthGradeGradeWidgetPidImport } from './routes/_auth.grade._gradeWidget/$pid'
import { Route as AuthDashboardListImportidImport } from './routes/_auth._dashboard/list_.$import_id'
import { Route as AuthGradeShareSuccessRouteImport } from './routes/_auth.grade_.share_.success/route'
import { Route as AuthComUserRenameSearchReferenceRouteImport } from './routes/_auth._com/user/rename-search-reference/route'
import { Route as AuthComUserEmailAgentsRouteImport } from './routes/_auth._com/user/email-agents/route'
import { Route as AuthComUserSubRouteImport } from './routes/_auth._com/user/$sub/route'
import { Route as AccessHashOwnerUidSharedIndexImport } from './routes/access.$hash.$ownerUid.shared.index'
import { Route as AccessHashOwnerUidSharedTagidImport } from './routes/access.$hash.$ownerUid.shared.$tag_id'
import { Route as AuthGradeGradeWidgetPidShareImport } from './routes/_auth.grade._gradeWidget/$pid_.share'
import { Route as AuthGradeGradeWidgetPidCrmPromoImport } from './routes/_auth.grade._gradeWidget/$pid_.crm-promo'
import { Route as AuthDashboardListImportidSharedImport } from './routes/_auth._dashboard/list_.$import_id.shared'
import { Route as AuthDashboardListImportidSharedIndexImport } from './routes/_auth._dashboard/list_.$import_id.shared.index'
import { Route as AuthGradeGradeWidgetPidShareConfirmImport } from './routes/_auth.grade._gradeWidget/$pid_.share/confirm'
import { Route as AuthDashboardListImportidSharedTagidImport } from './routes/_auth._dashboard/list_.$import_id.shared.$tag_id'
import { Route as AuthGradeGradeWidgetPidShareIndexRouteImport } from './routes/_auth.grade._gradeWidget/$pid_.share/index/route'

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

const AuthComRoute = AuthComImport.update({
  id: '/_com',
  getParentRoute: () => AuthRoute,
} as any)

const ViewDetailsPidRouteRoute = ViewDetailsPidRouteImport.update({
  path: '/view-details/$pid',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/view-details.$pid/route.lazy').then((d) => d.Route),
)

const AuthGradeSharingIndexRoute = AuthGradeSharingIndexImport.update({
  path: '/grade-sharing/',
  getParentRoute: () => AuthRoute,
} as any)

const AccessHashOwnerUidRoute = AccessHashOwnerUidImport.update({
  path: '/access/$hash/$ownerUid',
  getParentRoute: () => rootRoute,
} as any)

const AuthGradeGradeWidgetRoute = AuthGradeGradeWidgetImport.update({
  id: '/_gradeWidget',
  getParentRoute: () => AuthGradeRoute,
} as any)

const AuthGradeSharingSetupEmailRoute = AuthGradeSharingSetupEmailImport.update(
  {
    path: '/grade-sharing/setup-email',
    getParentRoute: () => AuthRoute,
  } as any,
)

const AuthGradeSharingSelectClientRoute =
  AuthGradeSharingSelectClientImport.update({
    path: '/grade-sharing/select-client',
    getParentRoute: () => AuthRoute,
  } as any)

const AuthComUserRoute = AuthComUserImport.update({
  path: '/user',
  getParentRoute: () => AuthComRoute,
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

const AuthComAgentRouteRoute = AuthComAgentRouteImport.update({
  path: '/agent',
  getParentRoute: () => AuthComRoute,
} as any).lazy(() =>
  import('./routes/_auth._com/agent/route.lazy').then((d) => d.Route),
)

const AccessHashOwnerUidSharedRoute = AccessHashOwnerUidSharedImport.update({
  path: '/shared',
  getParentRoute: () => AccessHashOwnerUidRoute,
} as any)

const AuthGradeGradeWidgetPidRoute = AuthGradeGradeWidgetPidImport.update({
  path: '/$pid',
  getParentRoute: () => AuthGradeGradeWidgetRoute,
} as any)

const AuthDashboardListImportidRoute = AuthDashboardListImportidImport.update({
  path: '/list/$import_id',
  getParentRoute: () => AuthDashboardRoute,
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

const AuthComUserRenameSearchReferenceRouteRoute =
  AuthComUserRenameSearchReferenceRouteImport.update({
    path: '/rename-search-reference',
    getParentRoute: () => AuthComUserRoute,
  } as any).lazy(() =>
    import('./routes/_auth._com/user/rename-search-reference/route.lazy').then(
      (d) => d.Route,
    ),
  )

const AuthComUserEmailAgentsRouteRoute =
  AuthComUserEmailAgentsRouteImport.update({
    path: '/email-agents',
    getParentRoute: () => AuthComUserRoute,
  } as any).lazy(() =>
    import('./routes/_auth._com/user/email-agents/route.lazy').then(
      (d) => d.Route,
    ),
  )

const AuthComUserSubRouteRoute = AuthComUserSubRouteImport.update({
  path: '/$sub',
  getParentRoute: () => AuthComUserRoute,
} as any).lazy(() =>
  import('./routes/_auth._com/user/$sub/route.lazy').then((d) => d.Route),
)

const AccessHashOwnerUidSharedIndexRoute =
  AccessHashOwnerUidSharedIndexImport.update({
    path: '/',
    getParentRoute: () => AccessHashOwnerUidSharedRoute,
  } as any)

const AccessHashOwnerUidSharedTagidRoute =
  AccessHashOwnerUidSharedTagidImport.update({
    path: '/$tag_id',
    getParentRoute: () => AccessHashOwnerUidSharedRoute,
  } as any)

const AuthGradeGradeWidgetPidShareRoute =
  AuthGradeGradeWidgetPidShareImport.update({
    path: '/$pid/share',
    getParentRoute: () => AuthGradeGradeWidgetRoute,
  } as any)

const AuthGradeGradeWidgetPidCrmPromoRoute =
  AuthGradeGradeWidgetPidCrmPromoImport.update({
    path: '/$pid/crm-promo',
    getParentRoute: () => AuthGradeGradeWidgetRoute,
  } as any)

const AuthDashboardListImportidSharedRoute =
  AuthDashboardListImportidSharedImport.update({
    path: '/shared',
    getParentRoute: () => AuthDashboardListImportidRoute,
  } as any)

const AuthDashboardListImportidSharedIndexRoute =
  AuthDashboardListImportidSharedIndexImport.update({
    path: '/',
    getParentRoute: () => AuthDashboardListImportidSharedRoute,
  } as any)

const AuthGradeGradeWidgetPidShareConfirmRoute =
  AuthGradeGradeWidgetPidShareConfirmImport.update({
    path: '/confirm',
    getParentRoute: () => AuthGradeGradeWidgetPidShareRoute,
  } as any)

const AuthDashboardListImportidSharedTagidRoute =
  AuthDashboardListImportidSharedTagidImport.update({
    path: '/$tag_id',
    getParentRoute: () => AuthDashboardListImportidSharedRoute,
  } as any)

const AuthGradeGradeWidgetPidShareIndexRouteRoute =
  AuthGradeGradeWidgetPidShareIndexRouteImport.update({
    path: '/',
    getParentRoute: () => AuthGradeGradeWidgetPidShareRoute,
  } as any).lazy(() =>
    import(
      './routes/_auth.grade._gradeWidget/$pid_.share/index/route.lazy'
    ).then((d) => d.Route),
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
    '/view-details/$pid': {
      preLoaderRoute: typeof ViewDetailsPidRouteImport
      parentRoute: typeof rootRoute
    }
    '/_auth/_com': {
      preLoaderRoute: typeof AuthComImport
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
    '/_auth/_com/agent': {
      preLoaderRoute: typeof AuthComAgentRouteImport
      parentRoute: typeof AuthComImport
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
    '/_auth/_com/user': {
      preLoaderRoute: typeof AuthComUserImport
      parentRoute: typeof AuthComImport
    }
    '/_auth/grade-sharing/select-client': {
      preLoaderRoute: typeof AuthGradeSharingSelectClientImport
      parentRoute: typeof AuthImport
    }
    '/_auth/grade-sharing/setup-email': {
      preLoaderRoute: typeof AuthGradeSharingSetupEmailImport
      parentRoute: typeof AuthImport
    }
    '/_auth/grade/_gradeWidget': {
      preLoaderRoute: typeof AuthGradeGradeWidgetImport
      parentRoute: typeof AuthGradeImport
    }
    '/access/$hash/$ownerUid': {
      preLoaderRoute: typeof AccessHashOwnerUidImport
      parentRoute: typeof rootRoute
    }
    '/_auth/grade-sharing/': {
      preLoaderRoute: typeof AuthGradeSharingIndexImport
      parentRoute: typeof AuthImport
    }
    '/_auth/_com/user/$sub': {
      preLoaderRoute: typeof AuthComUserSubRouteImport
      parentRoute: typeof AuthComUserImport
    }
    '/_auth/_com/user/email-agents': {
      preLoaderRoute: typeof AuthComUserEmailAgentsRouteImport
      parentRoute: typeof AuthComUserImport
    }
    '/_auth/_com/user/rename-search-reference': {
      preLoaderRoute: typeof AuthComUserRenameSearchReferenceRouteImport
      parentRoute: typeof AuthComUserImport
    }
    '/_auth/grade/share/success': {
      preLoaderRoute: typeof AuthGradeShareSuccessRouteImport
      parentRoute: typeof AuthImport
    }
    '/_auth/_dashboard/list/$import_id': {
      preLoaderRoute: typeof AuthDashboardListImportidImport
      parentRoute: typeof AuthDashboardImport
    }
    '/_auth/grade/_gradeWidget/$pid': {
      preLoaderRoute: typeof AuthGradeGradeWidgetPidImport
      parentRoute: typeof AuthGradeGradeWidgetImport
    }
    '/access/$hash/$ownerUid/shared': {
      preLoaderRoute: typeof AccessHashOwnerUidSharedImport
      parentRoute: typeof AccessHashOwnerUidImport
    }
    '/_auth/_dashboard/list/$import_id/shared': {
      preLoaderRoute: typeof AuthDashboardListImportidSharedImport
      parentRoute: typeof AuthDashboardListImportidImport
    }
    '/_auth/grade/_gradeWidget/$pid/crm-promo': {
      preLoaderRoute: typeof AuthGradeGradeWidgetPidCrmPromoImport
      parentRoute: typeof AuthGradeGradeWidgetImport
    }
    '/_auth/grade/_gradeWidget/$pid/share': {
      preLoaderRoute: typeof AuthGradeGradeWidgetPidShareImport
      parentRoute: typeof AuthGradeGradeWidgetImport
    }
    '/access/$hash/$ownerUid/shared/$tag_id': {
      preLoaderRoute: typeof AccessHashOwnerUidSharedTagidImport
      parentRoute: typeof AccessHashOwnerUidSharedImport
    }
    '/access/$hash/$ownerUid/shared/': {
      preLoaderRoute: typeof AccessHashOwnerUidSharedIndexImport
      parentRoute: typeof AccessHashOwnerUidSharedImport
    }
    '/_auth/grade/_gradeWidget/$pid/share/': {
      preLoaderRoute: typeof AuthGradeGradeWidgetPidShareIndexRouteImport
      parentRoute: typeof AuthGradeGradeWidgetPidShareImport
    }
    '/_auth/_dashboard/list/$import_id/shared/$tag_id': {
      preLoaderRoute: typeof AuthDashboardListImportidSharedTagidImport
      parentRoute: typeof AuthDashboardListImportidSharedImport
    }
    '/_auth/grade/_gradeWidget/$pid/share/confirm': {
      preLoaderRoute: typeof AuthGradeGradeWidgetPidShareConfirmImport
      parentRoute: typeof AuthGradeGradeWidgetPidShareImport
    }
    '/_auth/_dashboard/list/$import_id/shared/': {
      preLoaderRoute: typeof AuthDashboardListImportidSharedIndexImport
      parentRoute: typeof AuthDashboardListImportidSharedImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  LoginRouteRoute,
  AuthRoute.addChildren([
    AuthComRoute.addChildren([
      AuthComAgentRouteRoute,
      AuthComUserRoute.addChildren([
        AuthComUserSubRouteRoute,
        AuthComUserEmailAgentsRouteRoute,
        AuthComUserRenameSearchReferenceRouteRoute,
      ]),
    ]),
    AuthDashboardRoute.addChildren([
      AuthDashboardEachRouteRoute,
      AuthDashboardImportRouteRoute,
      AuthDashboardListRouteRoute,
      AuthDashboardListImportidRoute.addChildren([
        AuthDashboardListImportidSharedRoute.addChildren([
          AuthDashboardListImportidSharedTagidRoute,
          AuthDashboardListImportidSharedIndexRoute,
        ]),
      ]),
    ]),
    AuthGradeRoute.addChildren([
      AuthGradeGradeWidgetRoute.addChildren([
        AuthGradeGradeWidgetPidRoute,
        AuthGradeGradeWidgetPidCrmPromoRoute,
        AuthGradeGradeWidgetPidShareRoute.addChildren([
          AuthGradeGradeWidgetPidShareIndexRouteRoute,
          AuthGradeGradeWidgetPidShareConfirmRoute,
        ]),
      ]),
    ]),
    AuthGradeSharingSelectClientRoute,
    AuthGradeSharingSetupEmailRoute,
    AuthGradeSharingIndexRoute,
    AuthGradeShareSuccessRouteRoute,
  ]),
  ViewDetailsPidRouteRoute,
  AccessHashOwnerUidRoute.addChildren([
    AccessHashOwnerUidSharedRoute.addChildren([
      AccessHashOwnerUidSharedTagidRoute,
      AccessHashOwnerUidSharedIndexRoute,
    ]),
  ]),
])

/* prettier-ignore-end */
