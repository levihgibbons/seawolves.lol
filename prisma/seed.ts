import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { TEACHERS } from "./teachers";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Password123!";

async function main() {
  console.log(`Seeding ${TEACHERS.length} teachers...`);
  for (const teacher of TEACHERS) {
    const existing = await prisma.teacher.findFirst({ where: { name: teacher.name } });
    if (existing) {
      await prisma.teacher.update({
        where: { id: existing.id },
        data: {
          department: teacher.department,
          isFaculty: teacher.isFaculty ?? true,
          photoUrl: teacher.photoUrl,
          active: true,
        },
      });
    } else {
      await prisma.teacher.create({ data: { ...teacher, isFaculty: teacher.isFaculty ?? true } });
    }
  }

  // Demo account emails always use this domain for naming purposes, even
  // when ALLOWED_EMAIL_DOMAIN is unset/empty (sign-up open to any domain) —
  // `||` here deliberately catches "" too, not just null/undefined.
  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || "pacificachristian.example.edu";
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: `admin@${allowedDomain}` },
    update: {},
    create: {
      email: `admin@${allowedDomain}`,
      name: "Site Admin",
      hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const student = await prisma.user.upsert({
    where: { email: `student@${allowedDomain}` },
    update: {},
    create: {
      email: `student@${allowedDomain}`,
      name: "Demo Student",
      hashedPassword,
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const secondStudent = await prisma.user.upsert({
    where: { email: `student2@${allowedDomain}` },
    update: {},
    create: {
      email: `student2@${allowedDomain}`,
      name: "Demo Student Two",
      hashedPassword,
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  console.log(`Demo accounts ready (password: ${DEMO_PASSWORD})`);
  console.log(`  admin:   ${admin.email}`);
  console.log(`  student: ${student.email}`);
  console.log(`  student: ${secondStudent.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
