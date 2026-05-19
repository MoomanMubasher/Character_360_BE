// BACKEND/src/constants/permissions.js
// All permission strings used across the platform.
// Pattern: 'resource:action'

export const PERMISSIONS = {
  // ─── Teachers ────────────────────────────────────
  TEACHERS_READ:   'teachers:read',
  TEACHERS_CREATE: 'teachers:create',
  TEACHERS_UPDATE: 'teachers:update',
  TEACHERS_DELETE: 'teachers:delete',

  // ─── Students ────────────────────────────────────
  STUDENTS_READ:   'students:read',
  STUDENTS_CREATE: 'students:create',
  STUDENTS_UPDATE: 'students:update',
  STUDENTS_DELETE: 'students:delete',

  // ─── Principals ──────────────────────────────────
  PRINCIPALS_READ:   'principals:read',
  PRINCIPALS_CREATE: 'principals:create',
  PRINCIPALS_UPDATE: 'principals:update',
  PRINCIPALS_DELETE: 'principals:delete',

  // ─── Classes ─────────────────────────────────────
  CLASSES_READ:   'classes:read',
  CLASSES_CREATE: 'classes:create',
  CLASSES_UPDATE: 'classes:update',
  CLASSES_DELETE: 'classes:delete',

  // ─── Subjects ────────────────────────────────────
  SUBJECTS_READ:   'subjects:read',
  SUBJECTS_CREATE: 'subjects:create',
  SUBJECTS_UPDATE: 'subjects:update',
  SUBJECTS_DELETE: 'subjects:delete',

  // ─── Attendance ──────────────────────────────────
  ATTENDANCE_READ:   'attendance:read',
  ATTENDANCE_MARK:   'attendance:mark',
  ATTENDANCE_UPDATE: 'attendance:update',
  ATTENDANCE_DELETE: 'attendance:delete',

  // ─── Announcements ───────────────────────────────
  ANNOUNCEMENTS_READ:   'announcements:read',
  ANNOUNCEMENTS_CREATE: 'announcements:create',
  ANNOUNCEMENTS_UPDATE: 'announcements:update',
  ANNOUNCEMENTS_DELETE: 'announcements:delete',
  ANNOUNCEMENTS_PIN:    'announcements:pin',

  // ─── Assignments ─────────────────────────────────
  ASSIGNMENTS_READ:   'assignments:read',
  ASSIGNMENTS_CREATE: 'assignments:create',
  ASSIGNMENTS_UPDATE: 'assignments:update',
  ASSIGNMENTS_DELETE: 'assignments:delete',
  ASSIGNMENTS_GRADE:  'assignments:grade',

  // ─── Grades ──────────────────────────────────────
  GRADES_READ:   'grades:read',
  GRADES_CREATE: 'grades:create',
  GRADES_UPDATE: 'grades:update',
  GRADES_DELETE: 'grades:delete',

  // ─── Exams ───────────────────────────────────────
  EXAMS_READ:   'exams:read',
  EXAMS_CREATE: 'exams:create',
  EXAMS_UPDATE: 'exams:update',
  EXAMS_DELETE: 'exams:delete',

  // ─── Enrollment ──────────────────────────────────
  ENROLLMENT_READ:    'enrollment:read',
  ENROLLMENT_CREATE:  'enrollment:create',
  ENROLLMENT_APPROVE: 'enrollment:approve',
  ENROLLMENT_DELETE:  'enrollment:delete',

  // ─── Timetable ───────────────────────────────────
  TIMETABLE_READ:   'timetable:read',
  TIMETABLE_CREATE: 'timetable:create',
  TIMETABLE_UPDATE: 'timetable:update',
  TIMETABLE_DELETE: 'timetable:delete',

  // ─── Schools ─────────────────────────────────────
  SCHOOLS_READ:   'schools:read',
  SCHOOLS_CREATE: 'schools:create',
  SCHOOLS_UPDATE: 'schools:update',
  SCHOOLS_DELETE: 'schools:delete',

  // ─── Districts ───────────────────────────────────
  DISTRICTS_READ:   'districts:read',
  DISTRICTS_CREATE: 'districts:create',
  DISTRICTS_UPDATE: 'districts:update',
  DISTRICTS_DELETE: 'districts:delete',

  // ─── Departments ─────────────────────────────────
  DEPARTMENTS_READ:   'departments:read',
  DEPARTMENTS_CREATE: 'departments:create',
  DEPARTMENTS_UPDATE: 'departments:update',
  DEPARTMENTS_DELETE: 'departments:delete',

  // ─── Users ───────────────────────────────────────
  USERS_READ:   'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',

  // ─── Roles ───────────────────────────────────────
  ROLES_READ:   'roles:read',
  ROLES_MANAGE: 'roles:manage',

  // ─── Settings ────────────────────────────────────
  SETTINGS_READ:   'settings:read',
  SETTINGS_UPDATE: 'settings:update',

  // ─── Branding ────────────────────────────────────
  BRANDING_READ:   'branding:read',
  BRANDING_UPDATE: 'branding:update',

  // ─── Library ─────────────────────────────────────
  LIBRARY_READ:   'library:read',
  LIBRARY_MANAGE: 'library:manage',

  // ─── Discipline ──────────────────────────────────
  DISCIPLINE_READ:   'discipline:read',
  DISCIPLINE_CREATE: 'discipline:create',
  DISCIPLINE_UPDATE: 'discipline:update',

  // ─── Notifications ───────────────────────────────
  NOTIFICATIONS_READ: 'notifications:read',
  NOTIFICATIONS_SEND: 'notifications:send',

  // ─── Reports & Report Cards ──────────────────────
  REPORTS_READ:        'reports:read',
  REPORT_CARDS_READ:   'report_cards:read',
  REPORT_CARDS_CREATE: 'report_cards:create',

  // ─── Academic Years ──────────────────────────────
  ACADEMIC_YEARS_READ:   'academic_years:read',
  ACADEMIC_YEARS_MANAGE: 'academic_years:manage',

  // ─── Geography ───────────────────────────────────
  COUNTRIES_READ:   'countries:read',
  COUNTRIES_MANAGE: 'countries:manage',
  STATES_READ:      'states:read',
  STATES_MANAGE:    'states:manage',
  COUNTIES_READ:    'counties:read',
  COUNTIES_MANAGE:  'counties:manage',

  // ─── Subscriptions ───────────────────────────────
  SUBSCRIPTIONS_READ:   'subscriptions:read',
  SUBSCRIPTIONS_MANAGE: 'subscriptions:manage',

  // ─── Audit ───────────────────────────────────────
  AUDIT_READ: 'audit:read',

  // ─── Search ──────────────────────────────────────
  SEARCH_GLOBAL: 'search:global',
};

export default PERMISSIONS;
