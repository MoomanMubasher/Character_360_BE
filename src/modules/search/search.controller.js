// BACKEND/src/modules/search/search.controller.js

import searchService from './search.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

class SearchController {
  async globalSearch(req, res, next) {
    try {
      const { q, limit } = req.query;

      if (!q || q.trim().length < 2) {
        return sendSuccess(res, 200, 'Query too short', []);
      }

      const results = await searchService.search(q.trim(), req.user, parseInt(limit) || 5);
      return sendSuccess(res, 200, 'Search results', results);
    } catch (error) {
      next(error);
    }
  }
}

export default new SearchController();
