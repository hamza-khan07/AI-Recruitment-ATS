import { candidateRepository } from "../repositories/candidate.repository.js";
import type { CandidateProfileInput } from "../validators/candidate.validator.js";

export const candidateService = {
  async getProfile(userId: string) {
    const profile = await candidateRepository.findProfileByUserId(userId);
    return profile;
  },

  async upsertProfile(userId: string, data: CandidateProfileInput) {
    return candidateRepository.upsertProfile(userId, data);
  },
};
