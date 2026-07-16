import prisma from "../config/prisma.js";
import type { CandidateProfileInput } from "../validators/candidate.validator.js";

const anyPrisma = prisma as any;

export const candidateRepository = {
  async findProfileByUserId(userId: string) {
    return anyPrisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        workExperience: true,
        education: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  },

  async upsertProfile(userId: string, data: CandidateProfileInput) {
    const { workExperience, education, name, email, ...rest } = data;

    // Build a clean profileData object — only fields the DB schema accepts
    // Convert undefined values to null for Prisma compatibility
    const profileData = {
      title: rest.title ?? null,
      bio: rest.bio ?? null,
      phone: rest.phone ?? null,
      location: rest.location ?? null,
      linkedinUrl: rest.linkedinUrl ?? null,
      portfolioUrl: rest.portfolioUrl ?? null,
      resumeUrl: rest.resumeUrl ?? null,
      avatar: rest.avatar ?? null,
      skills: Array.isArray(rest.skills) ? rest.skills.filter(Boolean) : [],
    };

    return anyPrisma.$transaction(async (tx: any) => {
      // Update User if name or email provided
      if (name !== undefined || email !== undefined) {
        const userUpdate: any = {};
        if (name !== undefined) userUpdate.name = name;
        if (email !== undefined) userUpdate.email = email;
        await tx.user.update({
          where: { id: userId },
          data: userUpdate,
        });
      }

      // Upsert the top-level profile
      const profile = await tx.candidateProfile.upsert({
        where: { userId },
        update: profileData,
        create: {
          userId,
          ...profileData,
        },
      });

      // Replace work experience records when provided
      if (workExperience !== undefined && workExperience !== null) {
        await tx.workExperience.deleteMany({ where: { candidateProfileId: profile.id } });
        if (workExperience.length > 0) {
          await tx.workExperience.createMany({
            data: workExperience.map((we: any) => ({
              role: we.role,
              company: we.company,
              startDate: we.startDate ?? null,
              endDate: we.endDate ?? null,
              current: !!we.current,
              description: we.description ?? null,
              candidateProfileId: profile.id,
            })),
          });
        }
      }

      // Replace education records when provided
      if (education !== undefined && education !== null) {
        await tx.education.deleteMany({ where: { candidateProfileId: profile.id } });
        if (education.length > 0) {
          await tx.education.createMany({
            data: education.map((ed: any) => ({
              degree: ed.degree,
              field: ed.field ?? null,
              institution: ed.institution,
              startYear: ed.startYear ?? null,
              endYear: ed.endYear ?? null,
              current: !!ed.current,
              candidateProfileId: profile.id,
            })),
          });
        }
      }

      // Return the full updated profile
      return tx.candidateProfile.findUnique({
        where: { userId },
        include: {
          workExperience: true,
          education: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    });
  },
};
