const ROLES = {
  ADMIN: 'admin',
  EMPLOYER: 'employer',
  APPLICANT: 'applicant',
};

const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'manage_users',
    'manage_jobs',
    'manage_applications',
    'view_analytics',
    'manage_roles',
    'moderate_content',
    'view_audit_logs',
    'system_settings',
  ],
  [ROLES.EMPLOYER]: [
    'post_jobs',
    'edit_own_jobs',
    'delete_own_jobs',
    'view_applications',
    'manage_applications',
    'manage_company_profile',
    'view_own_analytics',
  ],
  [ROLES.APPLICANT]: [
    'apply_jobs',
    'view_jobs',
    'manage_own_profile',
    'track_applications',
    'bookmark_jobs',
    'upload_resume',
  ],
};

const hasPermission = (role, permission) => {
  if (!PERMISSIONS[role]) return false;
  return PERMISSIONS[role].includes(permission);
};

const APPLICATION_STATUS = {
  APPLIED: 'applied',
  REVIEWING: 'reviewing',
  SHORTLISTED: 'shortlisted',
  INTERVIEW: 'interview',
  OFFERED: 'offered',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

const JOB_STATUS = {
  DRAFT: 'draft',
  OPEN: 'open',
  CLOSED: 'closed',
  PAUSED: 'paused',
};

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

const EXPERIENCE_LEVELS = ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'];

module.exports = {
  ROLES,
  PERMISSIONS,
  hasPermission,
  APPLICATION_STATUS,
  JOB_STATUS,
  JOB_TYPES,
  EXPERIENCE_LEVELS,
};
