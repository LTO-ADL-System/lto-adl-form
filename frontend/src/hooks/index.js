// Export all authentication hooks
export {
  AuthProvider,
  useAuth,
  useIsAdmin,
  useRequireAuth,
  useRequireAdmin
} from './useAuth.js';

// Export all application hooks
export {
  useApplications,
  useApplication,
  useApplicationStatus,
  useApplicationValidation
} from './useApplications.js';

// Export all document hooks
export {
  useDocuments,
  useDocumentValidation,
  useDocumentRequirements,
  useFilePreview,
  useFileDrop
} from './useDocuments.js';

// Export all appointment hooks
export {
  useAppointments,
  useAppointment,
  useAppointmentSlots,
  useAppointmentUtils,
  useAppointmentValidation,
  useAppointmentNotifications
} from './useAppointments.js';

// Export all public data hooks
export {
  usePublicData,
  useApplicationTypes,
  useVehicleCategories,
  useLocations,
  useFormOptions,
  useApiHealth,
  useOrganTypes
} from './usePublicData.js';

// Export all admin hooks
export {
  useAdminDashboard,
  useAdminApplications,
  useAdminApplicationActions,
  useAdminFilters,
  useAdminUtils,
  useSystemHealth,
  useBulkOperations
} from './useAdmin.js';