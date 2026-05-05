// BACKEND/src/modules/academic/subjects/subject.seed.js
// Seed data for subjects

import Subject from './subject.model.js';
import Department from '../../departments/department.model.js';

export const seedSubjects = async (districtId, schoolId) => {
  try {
    // First, get or create departments
    const mathDept = await Department.findOne({ name: 'Mathematics', schoolId });
    const englishDept = await Department.findOne({ name: 'English', schoolId });
    const physicsDept = await Department.findOne({ name: 'Physics', schoolId });
    const chemistryDept = await Department.findOne({ name: 'Chemistry', schoolId });

    const subjectsData = [
      // Mathematics Subjects
      {
        name: 'Algebra & Functions',
        code: 'MATH101',
        description: 'Introduction to algebraic concepts, functions, and problem-solving techniques.',
        category: 'core',
        departmentId: mathDept?._id,
        credits: 4,
        gradeLevels: ['9', '10'],
        districtId,
        schoolId,
        status: 'active',
      },
      {
        name: 'Advanced Algebra',
        code: 'MATH201',
        description: 'Deep dive into advanced algebraic theories and complex problem-solving.',
        category: 'core',
        departmentId: mathDept?._id,
        credits: 3,
        gradeLevels: ['11'],
        districtId,
        schoolId,
        status: 'active',
      },
      {
        name: 'Applied Mathematics',
        code: 'MATH301',
        description: 'Real-world applications of mathematical concepts in modern scenarios.',
        category: 'core',
        departmentId: mathDept?._id,
        credits: 5,
        gradeLevels: ['12'],
        districtId,
        schoolId,
        status: 'active',
      },
      {
        name: 'Statistics & Probability',
        code: 'MATH102',
        description: 'Statistical analysis and probability theory with practical applications.',
        category: 'elective',
        departmentId: mathDept?._id,
        credits: 3,
        gradeLevels: ['10', '11', '12'],
        districtId,
        schoolId,
        status: 'active',
      },
      {
        name: 'Calculus',
        code: 'MATH401',
        description: 'Differential and integral calculus for advanced students.',
        category: 'honors',
        departmentId: mathDept?._id,
        credits: 4,
        gradeLevels: ['11', '12'],
        districtId,
        schoolId,
        status: 'active',
      },

      // English Subjects
      {
        name: 'English Literature',
        code: 'ENG101',
        description: 'Study of classic and contemporary literature with critical analysis.',
        category: 'core',
        departmentId: englishDept?._id,
        credits: 4,
        gradeLevels: ['9', '10'],
        districtId,
        schoolId,
        status: 'active',
      },
      {
        name: 'Creative Writing',
        code: 'ENG102',
        description: 'Develop creative writing skills in various genres.',
        category: 'elective',
        departmentId: englishDept?._id,
        credits: 3,
        gradeLevels: ['10', '11', '12'],
        districtId,
        schoolId,
        status: 'active',
      },

      // Physics Subjects
      {
        name: 'Physics I',
        code: 'PHY101',
        description: 'Mechanics, energy, and motion - fundamental physics concepts.',
        category: 'core',
        departmentId: physicsDept?._id,
        credits: 4,
        gradeLevels: ['9', '10'],
        districtId,
        schoolId,
        status: 'active',
      },
      {
        name: 'Physics II',
        code: 'PHY201',
        description: 'Electricity, magnetism, and waves.',
        category: 'core',
        departmentId: physicsDept?._id,
        credits: 4,
        gradeLevels: ['11'],
        districtId,
        schoolId,
        status: 'active',
      },

      // Chemistry Subjects
      {
        name: 'Chemistry I',
        code: 'CHEM101',
        description: 'Atomic structure, bonding, and basic reactions.',
        category: 'core',
        departmentId: chemistryDept?._id,
        credits: 4,
        gradeLevels: ['10', '11'],
        districtId,
        schoolId,
        status: 'active',
      },
      {
        name: 'Organic Chemistry',
        code: 'CHEM201',
        description: 'Organic compounds and reactions.',
        category: 'elective',
        departmentId: chemistryDept?._id,
        credits: 4,
        gradeLevels: ['12'],
        districtId,
        schoolId,
        status: 'active',
      },
    ];

    // Create subjects
    const createdSubjects = await Subject.insertMany(subjectsData);

    // Update departments with subject references
    if (mathDept) {
      await Department.updateOne(
        { _id: mathDept._id },
        { $push: { subjects: { $each: createdSubjects.filter(s => s.departmentId.equals(mathDept._id)).map(s => s._id) } } }
      );
    }
    if (englishDept) {
      await Department.updateOne(
        { _id: englishDept._id },
        { $push: { subjects: { $each: createdSubjects.filter(s => s.departmentId.equals(englishDept._id)).map(s => s._id) } } }
      );
    }
    if (physicsDept) {
      await Department.updateOne(
        { _id: physicsDept._id },
        { $push: { subjects: { $each: createdSubjects.filter(s => s.departmentId.equals(physicsDept._id)).map(s => s._id) } } }
      );
    }
    if (chemistryDept) {
      await Department.updateOne(
        { _id: chemistryDept._id },
        { $push: { subjects: { $each: createdSubjects.filter(s => s.departmentId.equals(chemistryDept._id)).map(s => s._id) } } }
      );
    }

    console.log('✅ Subjects seeded successfully');
    return createdSubjects;
  } catch (error) {
    console.error('❌ Error seeding subjects:', error);
    throw error;
  }
};
