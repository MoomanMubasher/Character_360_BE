// BACKEND/src/seeds/seed.js
// ─────────────────────────────────────────────────────────────────────────────
// Full hierarchy:
//   Country (USA) → State (Michigan) → County (Wayne) → District (Romulus)
//     → School 1 : Romulus High School          (code: RHS)
//     → School 2 : Romulus Early College HS     (code: RECHS)
//
// Users per school:
//   • District Superintendent
//   • IT Admin (office_admin)
//   • Principal
//   • 2 Teachers
//   • 2 Students
//
// Branding codes to test on login page:
//   ROMULUS  → district branding (navy + red)
//   RHS      → school 1 override (navy + gold)
//   RECHS    → school 2 override (green + white)
// ─────────────────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// ─── Core Models ────────────────────────────────────
import User       from '../modules/users/user.model.js';
import District   from '../modules/districts/district.model.js';
import School     from '../modules/schools/school.model.js';
import Principal  from '../modules/principals/principal.model.js';
import Teacher    from '../modules/teachers/teacher.model.js';
import Student    from '../modules/students/student.model.js';

// ─── Geographic Models ──────────────────────────────
import Country from '../modules/countries/country.model.js';
import State   from '../modules/states/state.model.js';
import County  from '../modules/counties/county.model.js';

// ─── Academic Models ────────────────────────────────
import AcademicYear from '../modules/academic/academic-years/academicYear.model.js';
import Department   from '../modules/departments/department.model.js';
import Subject      from '../modules/academic/subjects/subject.model.js';
import Class        from '../modules/classes/class.model.js';
import Timetable    from '../modules/timetable/timetable.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/character360';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: process.env.DB_NAME || 'character360',
    });
    console.log('✅ Connected to MongoDB');

    // ─── Clear ALL collections ────────────────────────
    console.log('⚠️  Clearing existing data...');
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    console.log('🗑️  All collections cleared');

    // ═══════════════════════════════════════════════════
    // 1. SUPER ADMIN
    // ═══════════════════════════════════════════════════
    console.log('\n📌 [1] Creating Super Admin...');
    const superAdmin = await User.create({
      firstName: 'Super',
      lastName:  'Admin',
      email:     'superadmin@character360.com',
      password:  'SuperAdmin@123',
      phone:     '555-000-0001',
      roles:       ['super_admin'],
      primaryRole: 'super_admin',
      status:          'active',
      isEmailVerified: true,
      address: {
        street:  '100 Platform HQ',
        city:    'Detroit',
        state:   'Michigan',
        zipCode: '48201',
        country: 'USA',
      },
    });

    // Sanity check — password must be bcrypt-hashed
    const _verify = await User.findById(superAdmin._id).select('+password');
    if (!_verify.password.startsWith('$2')) {
      throw new Error('Password NOT hashed — check User model pre-save hook.');
    }
    console.log(`   ✅ ${superAdmin.email}  (password hashed ✓)`);

    // ═══════════════════════════════════════════════════
    // 2. DISTRICT — created first (academicYearId = null initially)
    // ═══════════════════════════════════════════════════
    console.log('\n📌 [2] Creating District...');
    const district = await District.create({
      name:        'Romulus Community Schools',
      code:        'ROMULUS',
      description: 'Public school district serving the city of Romulus, Michigan.',
      address: {
        street:  '36540 Grant Rd',
        city:    'Romulus',
        state:   'Michigan',
        zipCode: '48174',
        country: 'USA',
      },
      phone:   '734-532-1700',
      email:   'info@romulus.k12.mi.us',
      website: 'https://www.romulus.k12.mi.us',
      subscription: {
        plan:        'premium',
        startDate:   new Date('2025-01-01'),
        endDate:     new Date('2026-12-31'),
        maxSchools:  10,
        maxStudents: 5000,
        maxStaff:    500,
        isActive:    true,
      },
      // ── District Branding — BASE theme for all Romulus schools ──
      branding: {
        primaryColor:    '#002147',   // Romulus navy
        secondaryColor:  '#C8102E',   // cardinal red
        accentColor:     '#F0B323',   // gold
        backgroundColor: '#FFFFFF',
        textColor:       '#111827',
        fontFamily:      'Inter, system-ui, sans-serif',
        logo:            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iODAiPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IiMwMDIxNDciIHJ4PSI2Ii8+PHRleHQgeD0iMTAwIiB5PSIzMiIgZm9udC1mYW1pbHk9IkFyaWFsLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTUiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjQzgxMDJFIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Sb211bHVzIFNjaG9vbHM8L3RleHQ+PHRleHQgeD0iMTAwIiB5PSI1NiIgZm9udC1mYW1pbHk9IkFyaWFsLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiNGRkZGRkYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNvbW11bml0eSBTY2hvb2wgRGlzdHJpY3Q8L3RleHQ+PC9zdmc+',
        favicon:         null,
        loginBannerText: 'Romulus Community Schools',
        loginSubText:    'Empowering students — Inspiring excellence.',
      },
      settings: {
        timezone:          'America/Detroit',
        gradingScale:      'letter',
        academicYearStart: 8,
        academicYearEnd:   6,
      },
      status:    'active',
      createdBy: superAdmin._id,
    });
    console.log(`   ✅ District: ${district.name}  (code: ${district.code})`);

    // ═══════════════════════════════════════════════════
    // 3. ACADEMIC YEAR (needs district first)
    // ═══════════════════════════════════════════════════
    console.log('\n📌 [3] Creating Academic Year...');
    const academicYear = await AcademicYear.create({
      name:       '2024-2025',
      districtId: district._id,
      startDate:  new Date('2024-08-26'),
      endDate:    new Date('2025-06-06'),
      terms: [
        {
          name:      'Fall Semester',
          startDate: new Date('2024-08-26'),
          endDate:   new Date('2025-01-17'),
          type:      'semester',
        },
        {
          name:      'Spring Semester',
          startDate: new Date('2025-01-21'),
          endDate:   new Date('2025-06-06'),
          type:      'semester',
        },
      ],
      gradingPeriods: [
        {
          name:           'Q1',
          startDate:      new Date('2024-08-26'),
          endDate:        new Date('2024-10-18'),
          gradesDueDate:  new Date('2024-10-25'),
        },
        {
          name:           'Q2',
          startDate:      new Date('2024-10-21'),
          endDate:        new Date('2025-01-17'),
          gradesDueDate:  new Date('2025-01-24'),
        },
        {
          name:           'Q3',
          startDate:      new Date('2025-01-21'),
          endDate:        new Date('2025-03-28'),
          gradesDueDate:  new Date('2025-04-04'),
        },
        {
          name:           'Q4',
          startDate:      new Date('2025-03-31'),
          endDate:        new Date('2025-06-06'),
          gradesDueDate:  new Date('2025-06-13'),
        },
      ],
      isCurrent: true,
      status:    'active',
      createdBy: superAdmin._id,
    });
    console.log(`   ✅ Academic Year: ${academicYear.name}`);

    // ═══════════════════════════════════════════════════
    // 4. GEOGRAPHIC HIERARCHY  (academicYearId required by each model)
    // ═══════════════════════════════════════════════════
    console.log('\n📌 [4] Creating Geographic Hierarchy...');

    const country = await Country.create({
      name:           'United States of America',
      code:           'USA',
      academicYearId: academicYear._id,
      status:         'active',
      createdBy:      superAdmin._id,
    });
    console.log(`   ✅ Country: ${country.name}  (${country.code})`);

    const state = await State.create({
      name:           'Michigan',
      code:           'MI',
      countryId:      country._id,
      academicYearId: academicYear._id,
      status:         'active',
      createdBy:      superAdmin._id,
    });
    console.log(`   ✅ State: ${state.name}  (${state.code})`);

    const county = await County.create({
      name:           'Wayne County',
      code:           'WAYNE',
      countryId:      country._id,
      stateId:        state._id,
      academicYearId: academicYear._id,
      status:         'active',
      createdBy:      superAdmin._id,
    });
    console.log(`   ✅ County: ${county.name}`);

    // Backfill district with geographic IDs + academic year
    await District.findByIdAndUpdate(district._id, {
      academicYearId: academicYear._id,
      countryId:      country._id,
      stateId:        state._id,
      countyId:       county._id,
    });
    console.log(`   ✅ District geographic refs linked`);

    // ── 4b. SPRINGFIELD — standalone district (no schools) for branding testing ──
    console.log('\n📌 [4b] Creating Springfield district (branding test, no schools)...');
    const district2 = await District.create({
      name:        'Springfield Public School District',
      code:        'SPRINGFIELD',
      description: 'Test district for district-level branding verification — no schools assigned.',
      address: {
        street:  '1 Springfield Center Dr',
        city:    'Springfield',
        state:   'Michigan',
        zipCode: '48111',
        country: 'USA',
      },
      phone:          '734-600-0001',
      email:          'info@springfield.k12.mi.us',
      website:        'https://www.springfield.k12.mi.us',
      academicYearId: academicYear._id,
      countryId:      country._id,
      stateId:        state._id,
      countyId:       county._id,
      subscription: {
        plan:        'basic',
        startDate:   new Date('2025-01-01'),
        endDate:     new Date('2026-12-31'),
        maxSchools:  5,
        maxStudents: 2000,
        maxStaff:    100,
        isActive:    true,
      },
      branding: {
        primaryColor:    '#4B0082',   // deep purple
        secondaryColor:  '#FFD700',   // gold
        accentColor:     '#FF6B35',   // orange accent
        backgroundColor: '#FAFAFA',
        textColor:       '#1A0033',
        fontFamily:      'Poppins, sans-serif',
        logo:            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iODAiPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IiM0QjAwODIiIHJ4PSI2Ii8+PHRleHQgeD0iMTAwIiB5PSIzMiIgZm9udC1mYW1pbHk9IkFyaWFsLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTUiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZENzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TcHJpbmdmaWVsZCBVU0Q8L3RleHQ+PHRleHQgeD0iMTAwIiB5PSI1NiIgZm9udC1mYW1pbHk9IkFyaWFsLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiNGRkQ3MDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlVuaWZpZWQgU2Nob29sIERpc3RyaWN0PC90ZXh0Pjwvc3ZnPg==',
        favicon:         null,
        loginBannerText: 'Springfield Public School District',
        loginSubText:    'Building futures, one student at a time.',
      },
      settings: {
        timezone:          'America/Detroit',
        gradingScale:      'letter',
        academicYearStart: 8,
        academicYearEnd:   6,
      },
      status:    'active',
      createdBy: superAdmin._id,
    });
    console.log(`   ✅ District 2: ${district2.name}  (code: ${district2.code})`);

    // ═══════════════════════════════════════════════════
    // 5. DISTRICT SUPERINTENDENT
    // ═══════════════════════════════════════════════════
    console.log('\n📌 [5] Creating District Superintendent...');
    const superintendent = await User.create({
      firstName:       'Robert',
      lastName:        'Hayes',
      email:           'r.hayes@romulus.k12.mi.us',
      password:        'Superintendent@123',
      phone:           '734-532-1701',
      roles:           ['district_admin'],
      primaryRole:     'district_admin',
      districtId:      district._id,
      status:          'active',
      isEmailVerified: true,
      gender:          'male',
      address: {
        street:  '100 Elm St',
        city:    'Romulus',
        state:   'Michigan',
        zipCode: '48174',
      },
      createdBy: superAdmin._id,
    });
    await District.findByIdAndUpdate(district._id, {
      superintendentId: superintendent._id,
    });
    console.log(`   ✅ Superintendent: ${superintendent.email}`);

    // ═══════════════════════════════════════════════════
    // 6. SCHOOLS
    // ═══════════════════════════════════════════════════
    console.log('\n📌 [6] Creating Schools...');

    // ── School 1 : Romulus High School ──────────────
    const school1 = await School.create({
      name:         'Romulus High School',
      code:         'RHS',
      description:  'The flagship high school of Romulus Community Schools.',
      districtId:   district._id,
      type:         'high',
      gradeLevels:  ['9', '10', '11', '12'],
      address: {
        street:  '9650 Wayne Rd',
        city:    'Romulus',
        state:   'Michigan',
        zipCode: '48174',
      },
      phone:   '734-532-1800',
      email:   'info@rhs.romulus.k12.mi.us',
      website: 'https://rhs.romulus.k12.mi.us',
      capacity: { maxStudents: 1200, maxTeachers: 80, maxClassrooms: 60 },
      schedule: {
        startTime:     '07:30',
        endTime:       '14:30',
        periodsPerDay: 7,
        periodDuration: 50,
        daysOfWeek:    ['monday','tuesday','wednesday','thursday','friday'],
      },
      currentAcademicYear: '2024-2025',
      // ── School 1 branding — OVERRIDES district on primary/accent only ──
      branding: {
        primaryColor:    '#1B3A6B',   // slightly darker navy (school identity)
        secondaryColor:  null,        // inherits district red
        accentColor:     '#F0B323',   // gold — school specific
        backgroundColor: null,        // inherit
        textColor:       null,        // inherit
        fontFamily:      null,        // inherit
        logo:            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iODAiPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IiMxQjNBNkIiIHJ4PSI2Ii8+PHRleHQgeD0iMTAwIiB5PSIzMiIgZm9udC1mYW1pbHk9IkFyaWFsLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRjBCMzIzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5SSFMgRWFnbGVzPC90ZXh0Pjx0ZXh0IHg9IjEwMCIgeT0iNTYiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjRjBCMzIzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Sb211bHVzIEhpZ2ggU2Nob29sPC90ZXh0Pjwvc3ZnPg==',
        favicon:         null,
        loginBannerText: 'Welcome to Romulus High School',
        loginSubText:    'Home of the Eagles — Soar Higher.',
      },
      status:    'active',
      createdBy: superintendent._id,
    });
    console.log(`   ✅ School 1: ${school1.name}  (code: ${school1.code})`);

    // ── School 2 : Romulus Early College High School ──
    const school2 = await School.create({
      name:        'Romulus Early College High School',
      code:        'RECHS',
      description: 'Early college program offering dual-enrollment with Wayne County Community College.',
      districtId:  district._id,
      type:        'high',
      gradeLevels: ['9', '10', '11', '12'],
      address: {
        street:  '36540 Grant Rd',
        city:    'Romulus',
        state:   'Michigan',
        zipCode: '48174',
      },
      phone:   '734-532-1900',
      email:   'info@rechs.romulus.k12.mi.us',
      website: 'https://rechs.romulus.k12.mi.us',
      capacity: { maxStudents: 600, maxTeachers: 45, maxClassrooms: 30 },
      schedule: {
        startTime:      '08:00',
        endTime:        '15:00',
        periodsPerDay:  6,
        periodDuration: 55,
        daysOfWeek:     ['monday','tuesday','wednesday','thursday','friday'],
      },
      currentAcademicYear: '2024-2025',
      // ── School 2 branding — FULL OVERRIDE (green identity) ────────────
      branding: {
        primaryColor:    '#006747',   // forest green — clearly different
        secondaryColor:  '#FFFFFF',
        accentColor:     '#A8C957',   // lime accent
        backgroundColor: '#F0F7EE',   // light green tint
        textColor:       '#0D1F0D',
        fontFamily:      'Merriweather, Georgia, serif',
        logo:            null,
        favicon:         null,
        loginBannerText: 'Romulus Early College High School',
        loginSubText:    'Your college journey starts here.',
      },
      status:    'active',
      createdBy: superintendent._id,
    });
    console.log(`   ✅ School 2: ${school2.name}  (code: ${school2.code})`);

    // ═══════════════════════════════════════════════════
    // 7. IT ADMIN — one per school (role: office_admin)
    // ═══════════════════════════════════════════════════
    console.log('\n📌 [7] Creating IT Admins...');

    const itAdmin1 = await User.create({
      firstName:       'Marcus',
      lastName:        'Rivera',
      email:           'm.rivera@rhs.romulus.k12.mi.us',
      password:        'ITAdmin@123',
      phone:           '734-532-1810',
      roles:           ['office_admin'],
      primaryRole:     'office_admin',
      districtId:      district._id,
      schoolId:        school1._id,
      status:          'active',
      isEmailVerified: true,
      gender:          'male',
      createdBy:       superintendent._id,
    });
    console.log(`   ✅ IT Admin (RHS): ${itAdmin1.email}`);

    const itAdmin2 = await User.create({
      firstName:       'Priya',
      lastName:        'Sharma',
      email:           'p.sharma@rechs.romulus.k12.mi.us',
      password:        'ITAdmin@123',
      phone:           '734-532-1910',
      roles:           ['office_admin'],
      primaryRole:     'office_admin',
      districtId:      district._id,
      schoolId:        school2._id,
      status:          'active',
      isEmailVerified: true,
      gender:          'female',
      createdBy:       superintendent._id,
    });
    console.log(`   ✅ IT Admin (RECHS): ${itAdmin2.email}`);

    // ═══════════════════════════════════════════════════
    // 8. PRINCIPALS — one per school
    // ═══════════════════════════════════════════════════
    console.log('\n📌 [8] Creating Principals...');

    const principalUser1 = await User.create({
      firstName:       'Diana',
      lastName:        'Foster',
      email:           'd.foster@rhs.romulus.k12.mi.us',
      password:        'Principal@123',
      phone:           '734-532-1802',
      roles:           ['school_admin'],
      primaryRole:     'school_admin',
      districtId:      district._id,
      schoolId:        school1._id,
      status:          'active',
      isEmailVerified: true,
      gender:          'female',
      createdBy:       superintendent._id,
    });
    await Principal.create({
      userId:            principalUser1._id,
      districtId:        district._id,
      schoolId:          school1._id,
      employeeId:        'RHS-P-001',
      title:             'principal',
      dateOfJoining:     new Date('2019-07-01'),
      yearsOfExperience: 18,
      contractType:      'full_time',
      status:            'active',
      createdBy:         superintendent._id,
    });
    await School.findByIdAndUpdate(school1._id, { principalId: principalUser1._id });
    console.log(`   ✅ Principal (RHS): ${principalUser1.email}`);

    const principalUser2 = await User.create({
      firstName:       'Kevin',
      lastName:        'Okafor',
      email:           'k.okafor@rechs.romulus.k12.mi.us',
      password:        'Principal@123',
      phone:           '734-532-1902',
      roles:           ['school_admin'],
      primaryRole:     'school_admin',
      districtId:      district._id,
      schoolId:        school2._id,
      status:          'active',
      isEmailVerified: true,
      gender:          'male',
      createdBy:       superintendent._id,
    });
    await Principal.create({
      userId:            principalUser2._id,
      districtId:        district._id,
      schoolId:          school2._id,
      employeeId:        'RECHS-P-001',
      title:             'principal',
      dateOfJoining:     new Date('2021-08-01'),
      yearsOfExperience: 14,
      contractType:      'full_time',
      status:            'active',
      createdBy:         superintendent._id,
    });
    await School.findByIdAndUpdate(school2._id, { principalId: principalUser2._id });
    console.log(`   ✅ Principal (RECHS): ${principalUser2.email}`);

    // ═══════════════════════════════════════════════════
    // 9. TEACHERS — two per school
    // ═══════════════════════════════════════════════════
    console.log('\n📌 [9] Creating Teachers...');

    // ─ RHS Teacher 1
    const teacherU1 = await User.create({
      firstName:       'James',
      lastName:        'Kowalski',
      email:           'j.kowalski@rhs.romulus.k12.mi.us',
      password:        'Teacher@123',
      roles:           ['teacher'],
      primaryRole:     'teacher',
      districtId:      district._id,
      schoolId:        school1._id,
      status:          'active',
      isEmailVerified: true,
      gender:          'male',
      createdBy:       principalUser1._id,
    });
    await Teacher.create({
      userId:            teacherU1._id,
      districtId:        district._id,
      schoolId:          school1._id,
      employeeId:        'RHS-T-001',
      designation:       'senior_teacher',
      subjects:          [{ subjectName: 'Mathematics', isPrimary: true }],
      gradeLevels:       ['9', '10', '11'],
      dateOfJoining:     new Date('2017-08-15'),
      yearsOfExperience: 12,
      contractType:      'full_time',
      status:            'active',
      createdBy:         principalUser1._id,
    });
    console.log(`   ✅ Teacher 1 (RHS): ${teacherU1.email}`);

    // ─ RHS Teacher 2
    const teacherU2 = await User.create({
      firstName:       'Angela',
      lastName:        'Brooks',
      email:           'a.brooks@rhs.romulus.k12.mi.us',
      password:        'Teacher@123',
      roles:           ['teacher'],
      primaryRole:     'teacher',
      districtId:      district._id,
      schoolId:        school1._id,
      status:          'active',
      isEmailVerified: true,
      gender:          'female',
      createdBy:       principalUser1._id,
    });
    await Teacher.create({
      userId:            teacherU2._id,
      districtId:        district._id,
      schoolId:          school1._id,
      employeeId:        'RHS-T-002',
      designation:       'teacher',
      subjects:          [{ subjectName: 'English Literature', isPrimary: true }],
      gradeLevels:       ['10', '11', '12'],
      dateOfJoining:     new Date('2020-08-17'),
      yearsOfExperience: 6,
      contractType:      'full_time',
      status:            'active',
      createdBy:         principalUser1._id,
    });
    console.log(`   ✅ Teacher 2 (RHS): ${teacherU2.email}`);

    // ─ RECHS Teacher 1
    const teacherU3 = await User.create({
      firstName:       'Naomi',
      lastName:        'Patel',
      email:           'n.patel@rechs.romulus.k12.mi.us',
      password:        'Teacher@123',
      roles:           ['teacher'],
      primaryRole:     'teacher',
      districtId:      district._id,
      schoolId:        school2._id,
      status:          'active',
      isEmailVerified: true,
      gender:          'female',
      createdBy:       principalUser2._id,
    });
    await Teacher.create({
      userId:            teacherU3._id,
      districtId:        district._id,
      schoolId:          school2._id,
      employeeId:        'RECHS-T-001',
      designation:       'lead_teacher',
      subjects:          [{ subjectName: 'Biology', isPrimary: true }],
      gradeLevels:       ['9', '10', '11', '12'],
      dateOfJoining:     new Date('2018-08-20'),
      yearsOfExperience: 10,
      contractType:      'full_time',
      status:            'active',
      createdBy:         principalUser2._id,
    });
    console.log(`   ✅ Teacher 1 (RECHS): ${teacherU3.email}`);

    // ─ RECHS Teacher 2
    const teacherU4 = await User.create({
      firstName:       'Carlos',
      lastName:        'Mendez',
      email:           'c.mendez@rechs.romulus.k12.mi.us',
      password:        'Teacher@123',
      roles:           ['teacher'],
      primaryRole:     'teacher',
      districtId:      district._id,
      schoolId:        school2._id,
      status:          'active',
      isEmailVerified: true,
      gender:          'male',
      createdBy:       principalUser2._id,
    });
    await Teacher.create({
      userId:            teacherU4._id,
      districtId:        district._id,
      schoolId:          school2._id,
      employeeId:        'RECHS-T-002',
      designation:       'teacher',
      subjects:          [{ subjectName: 'Computer Science', isPrimary: true }],
      gradeLevels:       ['9', '10', '11', '12'],
      dateOfJoining:     new Date('2022-01-10'),
      yearsOfExperience: 4,
      contractType:      'full_time',
      status:            'active',
      createdBy:         principalUser2._id,
    });
    console.log(`   ✅ Teacher 2 (RECHS): ${teacherU4.email}`);

    // ═══════════════════════════════════════════════════
    // 10. STUDENTS — two per school
    // ═══════════════════════════════════════════════════
    console.log('\n📌 [10] Creating Students...');

    // ─ RHS Student 1
    const studentU1 = await User.create({
      firstName:       'Tyler',
      lastName:        'Nguyen',
      email:           't.nguyen@student.romulus.k12.mi.us',
      password:        'Student@123',
      roles:           ['student'],
      primaryRole:     'student',
      districtId:      district._id,
      schoolId:        school1._id,
      dateOfBirth:     new Date('2009-03-12'),
      gender:          'male',
      status:          'active',
      isEmailVerified: true,
      createdBy:       principalUser1._id,
    });
    await Student.create({
      userId:          studentU1._id,
      districtId:      district._id,
      schoolId:        school1._id,
      studentId:       'RHS-STU-2025-001',
      stateStudentId:  'MI-RHS-001',
      gradeLevel:      '10',
      academicYear:    '2024-2025',
      enrollmentDate:  new Date('2024-08-26'),
      enrollmentType:      're_enrollment',
      enrollmentStatus:'active',
      guardians: [
        {
          relationship:       'mother',
          firstName:          'Linh',
          lastName:           'Nguyen',
          phone:              '734-555-2001',
          email:              'linh.nguyen@email.com',
          isPrimary:          true,
          isEmergencyContact: true,
          livesWithStudent:   true,
        },
      ],
      medical:      { immunizationUpToDate: true },
      transportation:{ mode: 'bus' },
      demographics:  { primaryLanguage: 'English' },
      createdBy:     principalUser1._id,
    });
    console.log(`   ✅ Student 1 (RHS): ${studentU1.email}`);

    // ─ RHS Student 2
    const studentU2 = await User.create({
      firstName:       'Aisha',
      lastName:        'Robinson',
      email:           'a.robinson@student.romulus.k12.mi.us',
      password:        'Student@123',
      roles:           ['student'],
      primaryRole:     'student',
      districtId:      district._id,
      schoolId:        school1._id,
      dateOfBirth:     new Date('2008-11-05'),
      gender:          'female',
      status:          'active',
      isEmailVerified: true,
      createdBy:       principalUser1._id,
    });
    await Student.create({
      userId:          studentU2._id,
      districtId:      district._id,
      schoolId:        school1._id,
      studentId:       'RHS-STU-2025-002',
      stateStudentId:  'MI-RHS-002',
      gradeLevel:      '11',
      academicYear:    '2024-2025',
      enrollmentDate:  new Date('2024-08-26'),
      enrollmentType:      're_enrollment',
      enrollmentStatus:'active',
      guardians: [
        {
          relationship:       'father',
          firstName:          'Derek',
          lastName:           'Robinson',
          phone:              '734-555-2002',
          email:              'derek.robinson@email.com',
          isPrimary:          true,
          isEmergencyContact: true,
          livesWithStudent:   true,
        },
      ],
      medical:      { immunizationUpToDate: true },
      transportation:{ mode: 'car' },
      demographics:  { primaryLanguage: 'English' },
      createdBy:     principalUser1._id,
    });
    console.log(`   ✅ Student 2 (RHS): ${studentU2.email}`);

    // ─ RECHS Student 1
    const studentU3 = await User.create({
      firstName:       'Sofia',
      lastName:        'Castillo',
      email:           's.castillo@student.romulus.k12.mi.us',
      password:        'Student@123',
      roles:           ['student'],
      primaryRole:     'student',
      districtId:      district._id,
      schoolId:        school2._id,
      dateOfBirth:     new Date('2007-07-22'),
      gender:          'female',
      status:          'active',
      isEmailVerified: true,
      createdBy:       principalUser2._id,
    });
    await Student.create({
      userId:          studentU3._id,
      districtId:      district._id,
      schoolId:        school2._id,
      studentId:       'RECHS-STU-2025-001',
      stateStudentId:  'MI-RECHS-001',
      gradeLevel:      '12',
      academicYear:    '2024-2025',
      enrollmentDate:  new Date('2024-08-26'),
      enrollmentType:      're_enrollment',
      enrollmentStatus:'active',
      guardians: [
        {
          relationship:       'mother',
          firstName:          'Maria',
          lastName:           'Castillo',
          phone:              '734-555-3001',
          email:              'maria.castillo@email.com',
          isPrimary:          true,
          isEmergencyContact: true,
          livesWithStudent:   true,
        },
      ],
      medical:      { immunizationUpToDate: true },
      transportation:{ mode: 'bus' },
      demographics:  { primaryLanguage: 'Spanish' },
      createdBy:     principalUser2._id,
    });
    console.log(`   ✅ Student 1 (RECHS): ${studentU3.email}`);

    // ─ RECHS Student 2
    const studentU4 = await User.create({
      firstName:       'Elijah',
      lastName:        'Washington',
      email:           'e.washington@student.romulus.k12.mi.us',
      password:        'Student@123',
      roles:           ['student'],
      primaryRole:     'student',
      districtId:      district._id,
      schoolId:        school2._id,
      dateOfBirth:     new Date('2007-01-30'),
      gender:          'male',
      status:          'active',
      isEmailVerified: true,
      createdBy:       principalUser2._id,
    });
    await Student.create({
      userId:          studentU4._id,
      districtId:      district._id,
      schoolId:        school2._id,
      studentId:       'RECHS-STU-2025-002',
      stateStudentId:  'MI-RECHS-002',
      gradeLevel:      '12',
      academicYear:    '2024-2025',
      enrollmentDate:  new Date('2024-08-26'),
      enrollmentType:      're_enrollment',
      enrollmentStatus:'active',
      guardians: [
        {
          relationship:       'father',
          firstName:          'Gregory',
          lastName:           'Washington',
          phone:              '734-555-3002',
          email:              'greg.washington@email.com',
          isPrimary:          true,
          isEmergencyContact: true,
          livesWithStudent:   true,
        },
      ],
      medical:      { immunizationUpToDate: true },
      transportation:{ mode: 'car' },
      demographics:  { primaryLanguage: 'English' },
      createdBy:     principalUser2._id,
    });
    console.log(`   ✅ Student 2 (RECHS): ${studentU4.email}`);

    // ═══════════════════════════════════════════════════
    // 11. DEPARTMENTS & SUBJECTS (RHS only, for reference data)
    // ═══════════════════════════════════════════════════
    console.log('\n📌 [11] Creating Departments & Subjects...');

    await Department.create({
      name:                'Mathematics Department',
      code:                'MATH',
      districtId:          district._id,
      schoolId:            school1._id,
      headOfDepartmentId:  teacherU1._id,
      status:              'active',
      createdBy:           principalUser1._id,
    });

    await Subject.create({
      name:        'Algebra II',
      code:        'ALG2',
      districtId:  district._id,
      schoolId:    school1._id,
      category:    'core',
      gradeLevels: ['10', '11'],
      credits:     1,
      passingGrade:60,
      isGPAIncluded: true,
      status:      'active',
      createdBy:   principalUser1._id,
    });
    console.log('   ✅ Department: Mathematics  |  Subject: Algebra II');

    // ═══════════════════════════════════════════════════
    // 12. ENSURE EMPTY COLLECTIONS EXIST
    // ═══════════════════════════════════════════════════
    console.log('\n📌 [12] Ensuring all collections exist...');
    const emptyCollections = [
      'attendances','enrollments','assignments','grades','exams',
      'reportcards','disciplines','books','healthrecords','fees',
      'payments','staffs','announcements','messages','events',
      'busroutes','audits','notifications','subscriptions','settings',
    ];
    for (const name of emptyCollections) {
      await mongoose.connection.db.createCollection(name).catch(() => {});
    }
    console.log('   ✅ All collections ensured');

    // ═══════════════════════════════════════════════════
    // 13. VERIFY ALL PASSWORDS
    // ═══════════════════════════════════════════════════
    console.log('\n📌 [13] Verifying login credentials...');
    const testUsers = [
      { email: 'superadmin@character360.com',              password: 'SuperAdmin@123',     label: 'Super Admin' },
      { email: 'r.hayes@romulus.k12.mi.us',                password: 'Superintendent@123', label: 'Superintendent' },
      { email: 'm.rivera@rhs.romulus.k12.mi.us',           password: 'ITAdmin@123',        label: 'IT Admin (RHS)' },
      { email: 'p.sharma@rechs.romulus.k12.mi.us',         password: 'ITAdmin@123',        label: 'IT Admin (RECHS)' },
      { email: 'd.foster@rhs.romulus.k12.mi.us',           password: 'Principal@123',      label: 'Principal (RHS)' },
      { email: 'k.okafor@rechs.romulus.k12.mi.us',         password: 'Principal@123',      label: 'Principal (RECHS)' },
      { email: 'j.kowalski@rhs.romulus.k12.mi.us',         password: 'Teacher@123',        label: 'Teacher 1 (RHS)' },
      { email: 'a.brooks@rhs.romulus.k12.mi.us',           password: 'Teacher@123',        label: 'Teacher 2 (RHS)' },
      { email: 'n.patel@rechs.romulus.k12.mi.us',          password: 'Teacher@123',        label: 'Teacher 1 (RECHS)' },
      { email: 'c.mendez@rechs.romulus.k12.mi.us',         password: 'Teacher@123',        label: 'Teacher 2 (RECHS)' },
      { email: 't.nguyen@student.romulus.k12.mi.us',       password: 'Student@123',        label: 'Student 1 (RHS)' },
      { email: 'a.robinson@student.romulus.k12.mi.us',     password: 'Student@123',        label: 'Student 2 (RHS)' },
      { email: 's.castillo@student.romulus.k12.mi.us',     password: 'Student@123',        label: 'Student 1 (RECHS)' },
      { email: 'e.washington@student.romulus.k12.mi.us',   password: 'Student@123',        label: 'Student 2 (RECHS)' },
    ];

    for (const u of testUsers) {
      const found = await User.findOne({ email: u.email }).select('+password');
      if (!found) { console.log(`   ❌ NOT FOUND: ${u.label}`); continue; }
      const ok = await found.comparePassword(u.password);
      console.log(`   ${ok ? '✅' : '❌'} ${u.label}: ${u.email}`);
    }

    // ═══════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════
    console.log('\n' + '═'.repeat(70));
    console.log('🎉  DATABASE SEEDED SUCCESSFULLY — ROMULUS COMMUNITY SCHOOLS');
    console.log('═'.repeat(70));

    console.log('\n📊 Document Counts:');
    console.log(`   Users:      ${await User.countDocuments()}`);
    console.log(`   Districts:  ${await District.countDocuments()}`);
    console.log(`   Schools:    ${await School.countDocuments()}`);
    console.log(`   Principals: ${await Principal.countDocuments()}`);
    console.log(`   Teachers:   ${await Teacher.countDocuments()}`);
    console.log(`   Students:   ${await Student.countDocuments()}`);

    console.log(`
🎨 BRANDING TEST CODES (type these on the login page):
   ┌──────────────┬────────────────────────────────┬──────────────────────────────────────────────┐
   │ Code         │ Org                            │ Logo & Theme                                 │
   ├──────────────┼────────────────────────────────┼──────────────────────────────────────────────┤
   │ (no code)    │ Platform default               │ No logo — maroon #7f0000                     │
   │ ROMULUS      │ Romulus Community Schools      │ District logo (navy/red placeholder)         │
   │ RHS          │ Romulus High School            │ School-specific logo (navy/gold placeholder) │
   │ RECHS        │ Romulus Early College HS       │ No school logo → falls back to district logo │
   │ SPRINGFIELD  │ Springfield Public Schools     │ District logo (purple/gold placeholder)      │
   └──────────────┴────────────────────────────────┴──────────────────────────────────────────────┘

   Logo cascade: school.logo → district.logo → platform logo (bundled asset)

🔑 LOGIN CREDENTIALS:
   ┌────────────────────────┬────────────────────────────────────────────┬──────────────────────┐
   │ Role                   │ Email                                      │ Password             │
   ├────────────────────────┼────────────────────────────────────────────┼──────────────────────┤
   │ Super Admin            │ superadmin@character360.com                │ SuperAdmin@123       │
   │ Superintendent         │ r.hayes@romulus.k12.mi.us                  │ Superintendent@123   │
   │ IT Admin (RHS)         │ m.rivera@rhs.romulus.k12.mi.us             │ ITAdmin@123          │
   │ IT Admin (RECHS)       │ p.sharma@rechs.romulus.k12.mi.us           │ ITAdmin@123          │
   │ Principal (RHS)        │ d.foster@rhs.romulus.k12.mi.us             │ Principal@123        │
   │ Principal (RECHS)      │ k.okafor@rechs.romulus.k12.mi.us           │ Principal@123        │
   │ Teacher 1 (RHS)        │ j.kowalski@rhs.romulus.k12.mi.us           │ Teacher@123          │
   │ Teacher 2 (RHS)        │ a.brooks@rhs.romulus.k12.mi.us             │ Teacher@123          │
   │ Teacher 1 (RECHS)      │ n.patel@rechs.romulus.k12.mi.us            │ Teacher@123          │
   │ Teacher 2 (RECHS)      │ c.mendez@rechs.romulus.k12.mi.us           │ Teacher@123          │
   │ Student 1 (RHS)        │ t.nguyen@student.romulus.k12.mi.us         │ Student@123          │
   │ Student 2 (RHS)        │ a.robinson@student.romulus.k12.mi.us       │ Student@123          │
   │ Student 1 (RECHS)      │ s.castillo@student.romulus.k12.mi.us       │ Student@123          │
   │ Student 2 (RECHS)      │ e.washington@student.romulus.k12.mi.us     │ Student@123          │
   └────────────────────────┴────────────────────────────────────────────┴──────────────────────┘
`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    if (error.code === 11000) {
      console.error('   → Duplicate key — run the seed again (it clears all data first).');
    }
    process.exit(1);
  }
};

seedDatabase();
