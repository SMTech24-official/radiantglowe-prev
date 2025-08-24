// src/app/seeder/superAdminSeeder.ts

import config from '../config';
import { User } from '../modules/user/user.model';
import { seedCMS } from '../utils/seed/seed.cms';
import { seedPropertyTypes } from '../utils/seed/seed.propertyTypes';

export const seedSuperAdmin = async () => {
  const superAdminEmail = config.SUPERADMIN_EMAIL;
  const adminEmail = config.ADMIN_EMAIL;

  // Seed Super Admin
  // const superAdminExists = await User.findOne({ email: superAdminEmail });
  // if (!superAdminExists) {
  //   await User.create({
  //     name: 'Super Admin',
  //     email: superAdminEmail,
  //     password: config.SUPERADMIN_PASSWORD,
  //     role: 'superadmin',
  //     registerBy: 'manual',
  //     image: 'https://i.ibb.co/D9nmvXf/avatar.png',
  //   });
  //   console.log('🚀 Super Admin created successfully');
  // } else {
  //   console.log('✅ Super Admin already exists');
  // }

  // const users = await User.find({ uid: { $exists: false } });

  // for (const user of users) {
  //   user.uid = await generateUID(user.role);
  //   await user.save();
  //   console.log(`UID set for ${user.email}: ${user.uid}`);
  // }

  //
  await seedPropertyTypes();
  await seedCMS();
  // Seed Admin
  const adminExists = await User.findOne({ email: adminEmail });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: config.ADMIN_PASSWORD,
      role: 'admin',
      registerBy: 'manual',
      image: 'https://i.ibb.co/D9nmvXf/avatar.png',
      phoneNumber: '1234567890',
      isVerified: true,
      profileVerificationImage: ['https://i.ibb.co/D9nmvXf/avatar.png'],
    });
    console.log('🚀 Admin created successfully');
  } else {
    console.log('✅ Admin already exists');
  }
};
