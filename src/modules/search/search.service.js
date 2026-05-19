// BACKEND/src/modules/search/search.service.js
// Unified search across DB entities with role-based filtering and tenant scoping.

import { PERMISSIONS } from '../../constants/permissions.js';
import { resolveUserPermissions } from '../../middlewares/rbac.middleware.js';

// ─── Searchable Entity Definitions ───────────────────────────────────────────
// Each entry: which permission gates this collection, how to search, what route to build.

const SEARCHABLE_ENTITIES = [
  {
    key: 'teachers',
    permission: PERMISSIONS.TEACHERS_READ,
    label: 'Teachers',
    icon: 'teacher',
    modelPath: '../teachers/teacher.model.js',
    search: async (Model, regex, scope, limit) => {
      const User = (await import('../users/user.model.js')).default;
      const matchingUsers = await User.find({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { email: regex },
        ],
      }).select('_id').lean();
      const filter = {
        ...scope,
        $or: [
          { userId: { $in: matchingUsers.map((u) => u._id) } },
          { employeeId: regex },
        ],
      };
      return Model.find(filter)
        .limit(limit)
        .populate('userId', 'firstName lastName email avatar')
        .lean();
    },
    toResult: (item, user) => ({
      id: item._id,
      label: item.userId
        ? `${item.userId.firstName} ${item.userId.lastName}`
        : 'Unknown Teacher',
      description: `Teacher • ${item.designation || 'teacher'}`,
      route: buildRoute(user, 'teachers', item._id),
      type: 'teacher',
      icon: 'teacher',
      avatar: item.userId?.avatar || null,
    }),
  },
  {
    key: 'students',
    permission: PERMISSIONS.STUDENTS_READ,
    label: 'Students',
    icon: 'student',
    modelPath: '../students/student.model.js',
    search: async (Model, regex, scope, limit) => {
      const User = (await import('../users/user.model.js')).default;
      const matchingUsers = await User.find({
        $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
      }).select('_id').lean();
      const filter = {
        ...scope,
        $or: [
          { userId: { $in: matchingUsers.map((u) => u._id) } },
          { studentId: regex },
        ],
      };
      return Model.find(filter)
        .limit(limit)
        .populate('userId', 'firstName lastName email avatar')
        .lean();
    },
    toResult: (item, user) => ({
      id: item._id,
      label: item.userId
        ? `${item.userId.firstName} ${item.userId.lastName}`
        : 'Unknown Student',
      description: `Student • Grade ${item.gradeLevel || ''}`,
      route: buildRoute(user, 'students', item._id),
      type: 'student',
      icon: 'student',
      avatar: item.userId?.avatar || null,
    }),
  },
  {
    key: 'schools',
    permission: PERMISSIONS.SCHOOLS_READ,
    label: 'Schools',
    icon: 'school',
    modelPath: '../schools/school.model.js',
    search: async (Model, regex, scope, limit) => {
      const filter = {
        ...scope,
        $or: [{ name: regex }, { code: regex }],
      };
      return Model.find(filter).limit(limit).lean();
    },
    toResult: (item, user) => ({
      id: item._id,
      label: item.name,
      description: `School • ${item.code || ''} • ${item.type || ''}`,
      route: buildRoute(user, 'schools', item._id),
      type: 'school',
      icon: 'school',
    }),
  },
  {
    key: 'classes',
    permission: PERMISSIONS.CLASSES_READ,
    label: 'Classes',
    icon: 'class',
    modelPath: '../classes/class.model.js',
    search: async (Model, regex, scope, limit) => {
      const filter = { ...scope, name: regex, status: 'active' };
      return Model.find(filter).limit(limit).populate('schoolId', 'name').lean();
    },
    toResult: (item, user) => ({
      id: item._id,
      label: `${item.name} ${item.section || ''}`.trim(),
      description: `Class • Grade ${item.gradeLevel} • ${item.schoolId?.name || ''}`,
      route: buildRoute(user, 'classes', item._id),
      type: 'class',
      icon: 'class',
    }),
  },
  {
    key: 'subjects',
    permission: PERMISSIONS.SUBJECTS_READ,
    label: 'Subjects',
    icon: 'subject',
    modelPath: '../academic/subjects/subject.model.js',
    search: async (Model, regex, scope, limit) => {
      const filter = { ...scope, $or: [{ name: regex }, { code: regex }] };
      return Model.find(filter).limit(limit).lean();
    },
    toResult: (item, user) => ({
      id: item._id,
      label: item.name,
      description: `Subject • ${item.code || ''} • ${item.category || ''}`,
      route: buildRoute(user, 'subjects', item._id),
      type: 'subject',
      icon: 'subject',
    }),
  },
  {
    key: 'announcements',
    permission: PERMISSIONS.ANNOUNCEMENTS_READ,
    label: 'Announcements',
    icon: 'announcement',
    modelPath: '../announcements/announcement.model.js',
    search: async (Model, regex, scope, limit) => {
      const filter = { ...scope, title: regex, status: 'published' };
      return Model.find(filter).limit(limit).populate('authorId', 'firstName lastName').lean();
    },
    toResult: (item, user) => ({
      id: item._id,
      label: item.title,
      description: `Announcement • by ${item.authorId?.firstName || ''} ${item.authorId?.lastName || ''}`,
      route: buildRoute(user, 'announcements', item._id),
      type: 'announcement',
      icon: 'announcement',
    }),
  },
  {
    key: 'assignments',
    permission: PERMISSIONS.ASSIGNMENTS_READ,
    label: 'Assignments',
    icon: 'assignment',
    modelPath: '../academic/assignments/assignment.model.js',
    search: async (Model, regex, scope, limit) => {
      const filter = { ...scope, title: regex, status: { $in: ['published', 'closed'] } };
      return Model.find(filter)
        .limit(limit)
        .populate('subjectId', 'name')
        .populate('classId', 'name section')
        .lean();
    },
    toResult: (item, user) => ({
      id: item._id,
      label: item.title,
      description: `Assignment • ${item.subjectId?.name || ''} • ${item.classId?.name || ''}`,
      route: buildRoute(user, 'assignments', item._id),
      type: 'assignment',
      icon: 'assignment',
    }),
  },
  {
    key: 'districts',
    permission: PERMISSIONS.DISTRICTS_READ,
    label: 'Districts',
    icon: 'district',
    modelPath: '../districts/district.model.js',
    search: async (Model, regex, scope, limit) => {
      const filter = { $or: [{ name: regex }, { code: regex }] };
      if (scope.districtId) filter._id = scope.districtId;
      return Model.find(filter).limit(limit).lean();
    },
    toResult: (item) => ({
      id: item._id,
      label: item.name,
      description: `District • ${item.code || ''}`,
      route: `/superadmin/districts/${item._id}`,
      type: 'district',
      icon: 'district',
    }),
  },
];

// ─── Route Builder ────────────────────────────────────────────────────────────

function buildRoute(user, resource, id) {
  const primaryRole = user.primaryRole || (user.roles || [])[0] || '';
  const prefix = getRolePrefix(primaryRole);
  return `${prefix}/${resource}/${id}`;
}

function getRolePrefix(role) {
  const map = {
    super_admin: '/superadmin',
    district_admin: '/district',
    district_superintendent: '/district',
    school_admin: '/principal',
    vice_principal: '/principal',
    office_admin: '/principal',
    teacher: '/teacher',
    teaching_assistant: '/teacher',
  };
  return map[role] || '/dashboard';
}

// ─── Search Service ───────────────────────────────────────────────────────────

class SearchService {
  async search(query, user, limit = 5) {
    if (!query || query.trim().length < 2) return [];

    const regex = { $regex: query.trim(), $options: 'i' };
    const userPermissions = resolveUserPermissions(user);

    // Build tenant scope
    const scope = {};
    if (user.districtId) scope.districtId = user.districtId;
    if (user.schoolId) scope.schoolId = user.schoolId;
    if (user.hasRole && user.hasRole('super_admin')) {
      delete scope.districtId;
      delete scope.schoolId;
    } else if (user.hasRole && (user.hasRole('district_admin') || user.hasRole('district_superintendent'))) {
      delete scope.schoolId;
    }

    // Filter entities by permission
    const allowedEntities = SEARCHABLE_ENTITIES.filter((e) =>
      userPermissions.has(e.permission)
    );

    // Run searches in parallel
    const results = await Promise.allSettled(
      allowedEntities.map(async (entity) => {
        try {
          const Model = (await import(entity.modelPath)).default;
          const items = await entity.search(Model, regex, scope, limit);
          if (!items.length) return null;
          return {
            category: entity.label,
            icon: entity.icon,
            items: items.map((item) => entity.toResult(item, user)),
          };
        } catch {
          return null;
        }
      })
    );

    return results
      .filter((r) => r.status === 'fulfilled' && r.value !== null)
      .map((r) => r.value);
  }
}

export default new SearchService();
