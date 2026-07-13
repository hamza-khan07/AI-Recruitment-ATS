import { jobService } from "../services/job.service.js";
import { createJobSchema, updateJobSchema, jobIdParamSchema } from "../validators/job.validator.js";
export const jobController = {
    async listJobs(req, res, next) {
        try {
            const companyId = req.query.companyId;
            const page = parseInt(req.query.page ?? "1", 10);
            const perPage = parseInt(req.query.perPage ?? "20", 10);
            const filters = { search: req.query.search, status: req.query.status };
            const currentUserId = req.user?.id;
            if (!currentUserId)
                return res.status(401).json({ success: false, message: "Authentication required." });
            const result = await jobService.listJobs(companyId, currentUserId, req.user.role, page, perPage, filters);
            return res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    },
    async getJob(req, res, next) {
        try {
            const { jobId } = jobIdParamSchema.parse(req.params);
            const companyId = req.query.companyId;
            const currentUserId = req.user?.id;
            if (!currentUserId)
                return res.status(401).json({ success: false, message: "Authentication required." });
            const job = await jobService.getJobById(jobId, companyId, currentUserId, req.user.role);
            return res.status(200).json({ success: true, data: job });
        }
        catch (error) {
            next(error);
        }
    },
    async createJob(req, res, next) {
        try {
            const data = createJobSchema.parse(req.body);
            const currentUserId = req.user?.id;
            if (!currentUserId)
                return res.status(401).json({ success: false, message: "Authentication required." });
            const job = await jobService.createJob({ ...data, createdBy: currentUserId }, currentUserId, req.user.role);
            return res.status(201).json({ success: true, data: job });
        }
        catch (error) {
            next(error);
        }
    },
    async updateJob(req, res, next) {
        try {
            const { jobId } = jobIdParamSchema.parse(req.params);
            const data = updateJobSchema.parse(req.body);
            const companyId = req.query.companyId;
            const currentUserId = req.user?.id;
            if (!currentUserId)
                return res.status(401).json({ success: false, message: "Authentication required." });
            const updated = await jobService.updateJob(jobId, companyId, data, currentUserId, req.user.role);
            return res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            next(error);
        }
    },
    async patchStatus(req, res, next) {
        try {
            const { jobId } = jobIdParamSchema.parse(req.params);
            const status = req.body.status ?? "DRAFT";
            const companyId = req.query.companyId;
            const currentUserId = req.user?.id;
            if (!currentUserId)
                return res.status(401).json({ success: false, message: "Authentication required." });
            const updated = await jobService.patchJobStatus(jobId, companyId, status, currentUserId, req.user.role);
            return res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            next(error);
        }
    },
    async deleteJob(req, res, next) {
        try {
            const { jobId } = jobIdParamSchema.parse(req.params);
            const companyId = req.query.companyId;
            const currentUserId = req.user?.id;
            if (!currentUserId)
                return res.status(401).json({ success: false, message: "Authentication required." });
            await jobService.deleteJob(jobId, companyId, currentUserId, req.user.role);
            return res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=job.controller.js.map