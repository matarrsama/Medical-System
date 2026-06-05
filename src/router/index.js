import { createRouter, createWebHashHistory } from 'vue-router'
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/dashboard', name: 'Dashboard', component: () => import('@/views/DashboardView.vue') },
  { path: '/super-admin-dashboard', name: 'SuperAdminDashboard', component: () => import('@/views/SuperAdminDashboard.vue') },
  { path: '/tickets', name: 'Tickets', component: () => import('@/views/TicketsView.vue') },
  { path: '/tickets-legacy', name: 'TicketsLegacy', component: () => import('@/views/TicketsLegacyView.vue') },
  { path: '/requests', name: 'Requests', component: () => import('@/views/RequestsView.vue') },
  { path: '/inventory', name: 'Inventory', component: () => import('@/views/InventoryView.vue') },
  { path: '/inventory-legacy', name: 'InventoryLegacy', component: () => import('@/views/InventoryLegacyView.vue') },
  { path: '/maintenance', name: 'Maintenance', component: () => import('@/views/MaintenanceView.vue') },
  { path: '/procurement', name: 'Procurement', component: () => import('@/views/ProcurementView.vue') },
  { path: '/biomedical', name: 'Biomedical', component: () => import('@/views/BiomedicalView.vue') },
  { path: '/leave-requests', name: 'LeaveRequests', component: () => import('@/views/LeaveRequestsView.vue') },
  { path: '/departments', name: 'Departments', component: () => import('@/views/DepartmentsView.vue'), meta: { requireRole: 'canAccessDepartments' } },
  { path: '/reports', name: 'Reports', component: () => import('@/views/ReportsView.vue') },
  { path: '/staffs', name: 'Staffs', component: () => import('@/views/UsersView.vue'), meta: { requireRole: 'canViewUsers' } },
  { path: '/notifications', name: 'Notifications', component: () => import('@/views/NotificationsView.vue') },
  { path: '/audit-logs', name: 'AuditLogs', component: () => import('@/views/AuditLogsView.vue'), meta: { requireRole: 'canAccessAuditLogs' } },
  { path: '/admin', name: 'AdminSettings', component: () => import('@/views/AdminSettingsView.vue'), meta: { requireRole: 'canAccessAdmin' } },
  { path: '/roles', name: 'Roles', component: () => import('@/views/RolesView.vue'), meta: { requireRole: 'canManageRoles' } },
  { path: '/settings', name: 'Settings', component: () => import('@/views/SettingsView.vue') },
  { path: '/404', name: 'NotFound', component: () => import('@/views/NotFoundView.vue') },
  { path: '/500', name: 'ServerError', component: () => import('@/views/ServerErrorView.vue') },
  { path: '/access-denied', name: 'AccessDenied', component: () => import('@/views/AccessDeniedView.vue') },
  { path: '/offline', name: 'Offline', component: () => import('@/views/OfflineView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/404' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const publicRoutes = ['Login', 'NotFound', 'ServerError', 'AccessDenied', 'Offline']

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  if (auth.loading) {
    await Promise.race([
      new Promise((resolve) => {
        const unwatch = watch(() => auth.loading, (val) => {
          if (!val) { unwatch(); resolve() }
        }, { immediate: true })
      }),
      new Promise(r => setTimeout(r, 5000))
    ])
  }

  if (publicRoutes.includes(to.name)) return next()

  if (!auth.isAuthenticated) return next('/login')

  const required = to.meta?.requireRole
  if (required) {
    const val = auth[required]
    console.log(`[RouteGuard] path: ${to.path}, required: ${required}, value:`, val, 'departmentHeadOf:', auth.departmentHeadOf)
    if (!val) return next('/access-denied')
  }

  next()
})

export default router
