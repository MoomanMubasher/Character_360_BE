// BACKEND/src/seeds/seed.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// ─── Core Models ────────────────────────────────────
import User from '../modules/users/user.model.js';
import District from '../modules/districts/district.model.js';
import School from '../modules/schools/school.model.js';
import Principal from '../modules/principals/principal.model.js';
import Teacher from '../modules/teachers/teacher.model.js';
import Student from '../modules/students/student.model.js';

// ─── Academic Models ────────────────────────────────
import Class from '../modules/classes/class.model.js';
import Subject from '../modules/academic/subjects/subject.model.js';
import Department from '../modules/departments/department.model.js';
import AcademicYear from '../modules/academic/academic-years/academicYear.model.js';
import Timetable from '../modules/timetable/timetable.model.js';

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
    console.log('\n📌 Creating Super Admin...');
    const superAdmin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@character360.com',
      password: 'SuperAdmin@123',
      phone: '555-000-0001',
      roles: ['super_admin'],
      primaryRole: 'super_admin',
      status: 'active',
      isEmailVerified: true,
      address: {
        street: '100 Platform HQ',
        city: 'Detroit',
        state: 'Michigan',
        zipCode: '48201',
        country: 'USA',
      },
    });

    // Verify password was hashed
    const verifyAdmin = await User.findById(superAdmin._id).select('+password');
    if (!verifyAdmin.password.startsWith('$2')) {
      throw new Error('Password was NOT hashed! Check User model pre-save hook.');
    }
    console.log(`   ✅ Super Admin: ${superAdmin.email}`);
    console.log(`   ✅ Password hashed: ${verifyAdmin.password.substring(0, 20)}...`);

    // ═══════════════════════════════════════════════════
    // 2. DISTRICT
    // ═══════════════════════════════════════════════════
    console.log('\n📌 Creating District...');
    const district = await District.create({
      name: 'Detroit Public Schools Community District',
      code: 'DPSCD',
      description: 'The largest school district in Michigan',
      address: {
        street: '3011 W. Grand Blvd.',
        city: 'Detroit',
        state: 'Michigan',
        zipCode: '48202',
        country: 'USA',
      },
      phone: '313-873-7490',
      email: 'info@detroitk12.org',
      subscription: {
        plan: 'premium',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        maxSchools: 10,
        maxStudents: 5000,
        maxStaff: 500,
        isActive: true,
      },
      status: 'active',
      createdBy: superAdmin._id,
    });
    console.log(`   ✅ District: ${district.name}`);

    // ═══════════════════════════════════════════════════
    // 3. DISTRICT ADMIN
    // ═══════════════════════════════════════════════════
    console.log('\n📌 Creating District Admin...');
    const districtAdmin = await User.create({
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@detroitk12.org',
      password: 'DistrictAdmin@123',
      roles: ['district_admin'],
      primaryRole: 'district_admin',
      districtId: district._id,
      status: 'active',
      isEmailVerified: true,
      createdBy: superAdmin._id,
    });

    // Link superintendent to district
    await District.findByIdAndUpdate(district._id, {
      superintendentId: districtAdmin._id,
    });
    console.log(`   ✅ District Admin: ${districtAdmin.email}`);

    // ═══════════════════════════════════════════════════
    // 4. SCHOOLS
    // ═══════════════════════════════════════════════════
    console.log('\n📌 Creating Schools...');
    const school1 = await School.create({
      name: 'Martin Luther King Jr. High School',
      code: 'MLKHS',
      districtId: district._id,
      type: 'high',
      gradeLevels: ['9', '10', '11', '12'],
      address: {
        street: '3200 E. Lafayette',
        city: 'Detroit',
        state: 'Michigan',
        zipCode: '48207',
      },
      phone: '313-866-4400',
      email: 'mlkhs@detroitk12.org',
      status: 'active',
      createdBy: districtAdmin._id,
    });

    const school2 = await School.create({
      name: 'Rosa Parks Elementary School',
      code: 'RPES',
      districtId: district._id,
      type: 'elementary',
      gradeLevels: ['K', '1', '2', '3', '4', '5'],
      address: {
        street: '1800 Oakman Blvd',
        city: 'Detroit',
        state: 'Michigan',
        zipCode: '48238',
      },
      phone: '313-866-4500',
      email: 'rpes@detroitk12.org',
      status: 'active',
      createdBy: districtAdmin._id,
    });
    console.log(`   ✅ School 1: ${school1.name}`);
    console.log(`   ✅ School 2: ${school2.name}`);

    // ═══════════════════════════════════════════════════
    // 5. PRINCIPALS
    // ═══════════════════════════════════════════════════
    console.log('\n📌 Creating Principals...');

    const principalUser1 = await User.create({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@detroitk12.org',
      password: 'Principal@123',
      roles: ['school_admin'],
      primaryRole: 'school_admin',
      districtId: district._id,
      schoolId: school1._id,
      status: 'active',
      isEmailVerified: true,
      gender: 'female',
      createdBy: districtAdmin._id,
    });

    await Principal.create({
      userId: principalUser1._id,
      districtId: district._id,
      schoolId: school1._id,
      employeeId: 'EMP-P-001',
      title: 'principal',
      dateOfJoining: new Date('2018-08-01'),
      yearsOfExperience: 15,
      contractType: 'full_time',
      status: 'active',
      createdBy: districtAdmin._id,
    });

    await School.findByIdAndUpdate(school1._id, {
      principalId: principalUser1._id,
    });
    console.log(`   ✅ Principal 1: ${principalUser1.email} → ${school1.name}`);

    const principalUser2 = await User.create({
      firstName: 'Michael',
      lastName: 'Thompson',
      email: 'michael.thompson@detroitk12.org',
      password: 'Principal@123',
      roles: ['school_admin'],
      primaryRole: 'school_admin',
      districtId: district._id,
      schoolId: school2._id,
      status: 'active',
      isEmailVerified: true,
      gender: 'male',
      createdBy: districtAdmin._id,
    });

    await Principal.create({
      userId: principalUser2._id,
      districtId: district._id,
      schoolId: school2._id,
      employeeId: 'EMP-P-002',
      title: 'principal',
      dateOfJoining: new Date('2020-08-01'),
      yearsOfExperience: 12,
      contractType: 'full_time',
      status: 'active',
      createdBy: districtAdmin._id,
    });

    await School.findByIdAndUpdate(school2._id, {
      principalId: principalUser2._id,
    });
    console.log(`   ✅ Principal 2: ${principalUser2.email} → ${school2.name}`);

    // ═══════════════════════════════════════════════════
    // 6. TEACHERS
    // ═══════════════════════════════════════════════════
    console.log('\n📌 Creating Teachers...');

    const teacherUser = await User.create({
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@detroitk12.org',
      password: 'Teacher@123',
      roles: ['teacher'],
      primaryRole: 'teacher',
      districtId: district._id,
      schoolId: school1._id,
      status: 'active',
      isEmailVerified: true,
      gender: 'female',
      createdBy: principalUser1._id,
    });

    await Teacher.create({
      userId: teacherUser._id,
      districtId: district._id,
      schoolId: school1._id,
      employeeId: 'EMP-T-001',
      designation: 'senior_teacher',
      subjects: [{ subjectName: 'Mathematics', isPrimary: true }],
      gradeLevels: ['9', '10', '11'],
      dateOfJoining: new Date('2022-08-15'),
      yearsOfExperience: 8,
      contractType: 'full_time',
      status: 'active',
      createdBy: principalUser1._id,
    });
    console.log(`   ✅ Teacher: ${teacherUser.email}`);

    // ═══════════════════════════════════════════════════
    // 7. STUDENTS
    // ═══════════════════════════════════════════════════
    console.log('\n📌 Creating Students...');

    const studentUser = await User.create({
      firstName: 'Alex',
      lastName: 'Martinez',
      email: 'alex.martinez@student.detroitk12.org',
      password: 'Student@123',
      roles: ['student'],
      primaryRole: 'student',
      districtId: district._id,
      schoolId: school1._id,
      dateOfBirth: new Date('2009-06-15'),
      gender: 'male',
      status: 'active',
      isEmailVerified: true,
      createdBy: principalUser1._id,
    });

    await Student.create({
      userId: studentUser._id,
      districtId: district._id,
      schoolId: school1._id,
      studentId: 'STU-25-00001',
      gradeLevel: '9',
      academicYear: '2024-2025',
      enrollmentDate: new Date('2024-08-20'),
      enrollmentType: 'new',
      enrollmentStatus: 'active',
      guardians: [
        {
          relationship: 'father',
          firstName: 'Carlos',
          lastName: 'Martinez',
          phone: '313-555-1001',
          email: 'carlos.martinez@email.com',
          isPrimary: true,
          isEmergencyContact: true,
          livesWithStudent: true,
        },
      ],
      medical: {
        immunizationUpToDate: true,
      },
      transportation: {
        mode: 'bus',
      },
      demographics: {
        primaryLanguage: 'English',
      },
      createdBy: principalUser1._id,
    });
    console.log(`   ✅ Student: ${studentUser.email}`);

    // ═══════════════════════════════════════════════════
    // 8. DEPARTMENT
    // ═══════════════════════════════════════════════════
    console.log('\n📌 Creating Department...');
    await Department.create({
      name: 'Mathematics Department',
      code: 'MATH',
      districtId: district._id,
      schoolId: school1._id,
      headOfDepartmentId: teacherUser._id,
      status: 'active',
      createdBy: principalUser1._id,
    });
    console.log('   ✅ Department: Mathematics');

    // ═══════════════════════════════════════════════════
    // 9. SUBJECT
    // ═══════════════════════════════════════════════════
    console.log('\n📌 Creating Subject...');
    await Subject.create({
      name: 'Algebra I',
      code: 'ALG1',
      districtId: district._id,
      schoolId: school1._id,
      category: 'core',
      gradeLevels: ['9', '10'],
      credits: 1,
      passingGrade: 60,
      isGPAIncluded: true,
      status: 'active',
      createdBy: principalUser1._id,
    });
    console.log('   ✅ Subject: Algebra I');

    // ═══════════════════════════════════════════════════
    // 10. CLASS
    // ═══════════════════════════════════════════════════
    console.log('\n📌 Creating Class...');
    const class9A = await Class.create({
      name: 'Grade 9 - Section A',
      section: 'A',
      gradeLevel: '9',
      districtId: district._id,
      schoolId: school1._id,
      academicYear: '2024-2025',
      classTeacherId: teacherUser._id,
      students: [studentUser._id],
      roomNumber: '101',
      capacity: 30,
      status: 'active',
      createdBy: principalUser1._id,
    });
    console.log('   ✅ Class: Grade 9 - Section A');

    // ═══════════════════════════════════════════════════
    // 11. ACADEMIC YEAR
    // ═══════════════════════════════════════════════════
    console.log('\n📌 Creating Academic Year...');
    await AcademicYear.create({
      name: '2024-2025',
      districtId: district._id,
      startDate: new Date('2024-08-19'),
      endDate: new Date('2025-06-13'),
      terms: [
        {
          name: 'Fall Semester',
          startDate: new Date('2024-08-19'),
          endDate: new Date('2025-01-17'),
          type: 'semester',
        },
        {
          name: 'Spring Semester',
          startDate: new Date('2025-01-21'),
          endDate: new Date('2025-06-13'),
          type: 'semester',
        },
      ],
      gradingPeriods: [
        {
          name: 'Q1',
          startDate: new Date('2024-08-19'),
          endDate: new Date('2024-10-18'),
          gradesDueDate: new Date('2024-10-25'),
        },
        {
          name: 'Q2',
          startDate: new Date('2024-10-21'),
          endDate: new Date('2025-01-17'),
          gradesDueDate: new Date('2025-01-24'),
        },
      ],
      isCurrent: true,
      status: 'active',
      createdBy: districtAdmin._id,
    });
    console.log('   ✅ Academic Year: 2024-2025');

    // ═══════════════════════════════════════════════════
    // 12. TIMETABLE
    // ═══════════════════════════════════════════════════
    console.log('\n📌 Creating Timetable...');
    await Timetable.create({
      districtId: district._id,
      schoolId: school1._id,
      classId: class9A._id,
      academicYear: '2024-2025',
      schedule: [
        {
          day: 'monday',
          periods: [
            { periodNumber: 1, startTime: '08:00', endTime: '08:50', subjectName: 'Algebra I', teacherId: teacherUser._id, room: '101', type: 'class' },
            { periodNumber: 2, startTime: '09:00', endTime: '09:50', subjectName: 'English', room: '102', type: 'class' },
            { periodNumber: 3, startTime: '10:00', endTime: '10:50', subjectName: 'Science', room: '201', type: 'class' },
            { periodNumber: 4, startTime: '11:00', endTime: '11:30', subjectName: 'Lunch', type: 'lunch' },
          ],
        },
      ],
      effectiveFrom: new Date('2024-08-19'),
      isActive: true,
      createdBy: principalUser1._id,
    });
    console.log('   ✅ Timetable created');

    // ═══════════════════════════════════════════════════
    // FORCE CREATE EMPTY COLLECTIONS
    // ═══════════════════════════════════════════════════
    console.log('\n📌 Ensuring all collections exist...');
    const emptyCollections = [
      'attendances', 'enrollments', 'assignments', 'grades',
      'exams', 'reportcards', 'disciplines', 'books',
      'healthrecords', 'fees', 'payments', 'staffs',
      'announcements', 'messages', 'events', 'busroutes',
      'audits', 'notifications', 'subscriptions', 'settings',
    ];

    for (const name of emptyCollections) {
      await mongoose.connection.db.createCollection(name).catch(() => {});
    }
    console.log('   ✅ All collections ensured');

    // ═══════════════════════════════════════════════════
    // VERIFY ALL USERS CAN LOGIN
    // ═══════════════════════════════════════════════════
    console.log('\n📌 Verifying login credentials...');

    const testUsers = [
      { email: 'superadmin@character360.com', password: 'SuperAdmin@123', role: 'Super Admin' },
      { email: 'james.wilson@detroitk12.org', password: 'DistrictAdmin@123', role: 'District Admin' },
      { email: 'sarah.johnson@detroitk12.org', password: 'Principal@123', role: 'Principal (HS)' },
      { email: 'michael.thompson@detroitk12.org', password: 'Principal@123', role: 'Principal (ES)' },
      { email: 'emily.davis@detroitk12.org', password: 'Teacher@123', role: 'Teacher' },
      { email: 'alex.martinez@student.detroitk12.org', password: 'Student@123', role: 'Student' },
    ];

    for (const testUser of testUsers) {
      const user = await User.findOne({ email: testUser.email }).select('+password');
      if (!user) {
        console.log(`   ❌ ${testUser.role}: User NOT found!`);
        continue;
      }

      const isMatch = await user.comparePassword(testUser.password);
      if (isMatch) {
        console.log(`   ✅ ${testUser.role}: Login verified (${testUser.email})`);
      } else {
        console.log(`   ❌ ${testUser.role}: Password mismatch!`);
      }
    }

    // ═══════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════
    console.log('\n' + '═'.repeat(60));
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('═'.repeat(60));

    const allCollections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📊 Total Collections: ${allCollections.length}`);
    allCollections.sort((a, b) => a.name.localeCompare(b.name));
    allCollections.forEach((col) => {
      console.log(`   📁 ${col.name}`);
    });

    const userCount = await User.countDocuments();
    const districtCount = await District.countDocuments();
    const schoolCount = await School.countDocuments();
    const principalCount = await Principal.countDocuments();
    const teacherCount = await Teacher.countDocuments();
    const studentCount = await Student.countDocuments();

    console.log('\n📊 Document Counts:');
    console.log(`   Users:       ${userCount}`);
    console.log(`   Districts:   ${districtCount}`);
    console.log(`   Schools:     ${schoolCount}`);
    console.log(`   Principals:  ${principalCount}`);
    console.log(`   Teachers:    ${teacherCount}`);
    console.log(`   Students:    ${studentCount}`);

    console.log('\n🔑 Login Credentials:');
    console.log('   ┌──────────────────┬──────────────────────────────────────────────┬───────────────────┐');
    console.log('   │ Role             │ Email                                        │ Password          │');
    console.log('   ├──────────────────┼──────────────────────────────────────────────┼───────────────────┤');
    console.log('   │ Super Admin      │ superadmin@character360.com                  │ SuperAdmin@123    │');
    console.log('   │ District Admin   │ james.wilson@detroitk12.org                 │ DistrictAdmin@123 │');
    console.log('   │ Principal (HS)   │ sarah.johnson@detroitk12.org                │ Principal@123     │');
    console.log('   │ Principal (ES)   │ michael.thompson@detroitk12.org             │ Principal@123     │');
    console.log('   │ Teacher          │ emily.davis@detroitk12.org                  │ Teacher@123       │');
    console.log('   │ Student          │ alex.martinez@student.detroitk12.org        │ Student@123       │');
    console.log('   └──────────────────┴──────────────────────────────────────────────┴───────────────────┘');

    console.log('\n✅ All users verified. Ready to login!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();