// BACKEND/src/modules/announcements/announcement.service.js

import Announcement from './announcement.model.js';
import { paginate } from '../../utils/pagination.js';

class AnnouncementService {
  async createAnnouncement(data, authorId) {
    return Announcement.create({
      ...data,
      authorId,
      createdBy: authorId,
      status: data.publishAt && new Date(data.publishAt) > new Date() ? 'draft' : 'published',
    });
  }

  async getAllAnnouncements(query, scope) {
    const {
      page = 1, limit = 20, classId, category, priority,
      status = 'published', search, audience, isPinned,
    } = query;

    const filter = { ...scope, status };
    if (classId) filter.classId = classId;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (audience) filter.audience = audience;
    if (isPinned !== undefined) filter.isPinned = isPinned === 'true' || isPinned === true;
    if (search) filter.title = { $regex: search, $options: 'i' };

    // Filter out expired announcements
    filter.$or = [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } },
    ];

    return paginate(Announcement, filter, {
      page,
      limit,
      sort: { isPinned: -1, createdAt: -1 },
      populate: [
        { path: 'authorId', select: 'firstName lastName avatar' },
        { path: 'classId', select: 'name section gradeLevel' },
      ],
    });
  }

  async getAnnouncementById(id, scope) {
    const announcement = await Announcement.findOne({ _id: id, ...scope })
      .populate('authorId', 'firstName lastName avatar')
      .populate('classId', 'name section gradeLevel')
      .populate('subjectId', 'name code')
      .lean();

    if (announcement) {
      // Increment view count without blocking
      Announcement.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();
    }

    return announcement;
  }

  async updateAnnouncement(id, data, updatedBy, scope) {
    return Announcement.findOneAndUpdate(
      { _id: id, ...scope },
      { ...data, updatedBy },
      { new: true, runValidators: true }
    );
  }

  async deleteAnnouncement(id, scope) {
    return Announcement.findOneAndDelete({ _id: id, ...scope });
  }

  async pinAnnouncement(id, updatedBy, scope) {
    return Announcement.findOneAndUpdate(
      { _id: id, ...scope },
      { isPinned: true, pinnedAt: new Date(), updatedBy },
      { new: true }
    );
  }

  async unpinAnnouncement(id, updatedBy, scope) {
    return Announcement.findOneAndUpdate(
      { _id: id, ...scope },
      { isPinned: false, pinnedAt: null, updatedBy },
      { new: true }
    );
  }

  async archiveAnnouncement(id, updatedBy, scope) {
    return Announcement.findOneAndUpdate(
      { _id: id, ...scope },
      { status: 'archived', updatedBy },
      { new: true }
    );
  }
}

export default new AnnouncementService();
