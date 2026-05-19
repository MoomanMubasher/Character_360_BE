// BACKEND/src/modules/announcements/announcement.controller.js

import announcementService from './announcement.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const buildScope = (user) => {
  const scope = { districtId: user.districtId, schoolId: user.schoolId };
  if (user.hasRole('super_admin')) { delete scope.districtId; delete scope.schoolId; }
  else if (user.hasRole('district_admin') || user.hasRole('district_superintendent')) { delete scope.schoolId; }
  return scope;
};

class AnnouncementController {
  async create(req, res, next) {
    try {
      const announcement = await announcementService.createAnnouncement(req.body, req.user._id);
      return sendSuccess(res, 201, 'Announcement created successfully', announcement);
    } catch (error) { next(error); }
  }

  async getAll(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const result = await announcementService.getAllAnnouncements(req.query, scope);
      return sendSuccess(res, 200, 'Announcements fetched successfully', result);
    } catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const announcement = await announcementService.getAnnouncementById(req.params.id, scope);
      if (!announcement) return sendError(res, 404, 'Announcement not found');
      return sendSuccess(res, 200, 'Announcement fetched successfully', announcement);
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const scope = buildScope(req.user);
      // Teachers can only update their own announcements
      if (req.user.hasRole('teacher') || req.user.hasRole('teaching_assistant')) {
        scope.authorId = req.user._id;
      }
      const announcement = await announcementService.updateAnnouncement(
        req.params.id, req.body, req.user._id, scope
      );
      if (!announcement) return sendError(res, 404, 'Announcement not found');
      return sendSuccess(res, 200, 'Announcement updated successfully', announcement);
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      const scope = buildScope(req.user);
      if (req.user.hasRole('teacher') || req.user.hasRole('teaching_assistant')) {
        scope.authorId = req.user._id;
      }
      const announcement = await announcementService.deleteAnnouncement(req.params.id, scope);
      if (!announcement) return sendError(res, 404, 'Announcement not found');
      return sendSuccess(res, 200, 'Announcement deleted successfully');
    } catch (error) { next(error); }
  }

  async pin(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const announcement = await announcementService.pinAnnouncement(req.params.id, req.user._id, scope);
      if (!announcement) return sendError(res, 404, 'Announcement not found');
      return sendSuccess(res, 200, 'Announcement pinned', announcement);
    } catch (error) { next(error); }
  }

  async unpin(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const announcement = await announcementService.unpinAnnouncement(req.params.id, req.user._id, scope);
      if (!announcement) return sendError(res, 404, 'Announcement not found');
      return sendSuccess(res, 200, 'Announcement unpinned', announcement);
    } catch (error) { next(error); }
  }

  async archive(req, res, next) {
    try {
      const scope = buildScope(req.user);
      const announcement = await announcementService.archiveAnnouncement(req.params.id, req.user._id, scope);
      if (!announcement) return sendError(res, 404, 'Announcement not found');
      return sendSuccess(res, 200, 'Announcement archived', announcement);
    } catch (error) { next(error); }
  }
}

export default new AnnouncementController();
