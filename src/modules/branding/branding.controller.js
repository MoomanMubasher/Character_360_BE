// BACKEND/src/modules/branding/branding.controller.js

import School from '../schools/school.model.js';
import District from '../districts/district.model.js';
import { sendSuccess } from '../../utils/response.js';

// ─── Platform Default Branding ───────────────────────────────────────────────
// Used when no org code is provided or the code resolves to nothing.
const PLATFORM_DEFAULTS = {
  primaryColor:    '#7f0000',
  secondaryColor:  '#1e293b',
  accentColor:     '#2563eb',
  backgroundColor: '#ffffff',
  textColor:       '#0f172a',
  fontFamily:      'Inter, system-ui, sans-serif',
  logo:            null,
  favicon:         null,
  loginBannerText: 'Welcome to Character360',
  loginSubText:    'Real-time insights into school operations and progress tracking',
};

/**
 * Merge branding layers left-to-right.
 * A later layer only overrides a key when its value is non-null / non-empty.
 * Platform defaults → district branding → school branding
 */
function mergeBranding(...layers) {
  return layers.reduce((acc, layer = {}) => {
    Object.keys(layer).forEach((key) => {
      if (layer[key] !== null && layer[key] !== undefined && layer[key] !== '') {
        acc[key] = layer[key];
      }
    });
    return acc;
  }, {});
}

class BrandingController {
  /**
   * GET /api/v1/branding/resolve?code=XYZ
   *
   * Public endpoint — no authentication required.
   *
   * Resolution order:
   *   1. code matches an active School  → merge(platform, district, school)
   *   2. code matches an active District → merge(platform, district)
   *   3. no code / not found            → platform defaults (silent fallback)
   */
  async resolve(req, res, next) {
    try {
      const rawCode       = req.query.code;
      const rawDistrictId = req.query.districtId;

      // ── districtId param — used post-login by district_admin ─
      if (!rawCode && rawDistrictId) {
        const district = await District
          .findById(rawDistrictId)
          .select('name branding status')
          .lean();

        if (district && district.status === 'active') {
          const merged = mergeBranding(PLATFORM_DEFAULTS, district.branding ?? {});
          return sendSuccess(res, 200, 'District branding resolved', {
            type:       'district',
            orgName:    district.name,
            orgId:      district._id,
            districtId: district._id,
            branding:   merged,
          });
        }

        return sendSuccess(res, 200, 'Platform default branding', {
          type: 'platform', orgName: null, orgId: null, branding: PLATFORM_DEFAULTS,
        });
      }

      // ── No code → platform default ───────────────────────────
      if (!rawCode) {
        return sendSuccess(res, 200, 'Platform default branding', {
          type:     'platform',
          orgName:  null,
          orgId:    null,
          branding: PLATFORM_DEFAULTS,
        });
      }

      const code = String(rawCode).toUpperCase().trim();

      // ── 1. Try school first ───────────────────────────────────
      const school = await School
        .findOne({ code, status: 'active' })
        .select('name branding districtId')
        .populate({ path: 'districtId', select: 'name branding' })
        .lean();

      if (school) {
        const districtBranding = school.districtId?.branding ?? {};
        const schoolBranding   = school.branding ?? {};

        const merged = mergeBranding(PLATFORM_DEFAULTS, districtBranding, schoolBranding);

        return sendSuccess(res, 200, 'School branding resolved', {
          type:       'school',
          orgName:    school.name,
          orgId:      school._id,
          districtId: school.districtId?._id ?? null,
          branding:   merged,
        });
      }

      // ── 2. Try district ───────────────────────────────────────
      const district = await District
        .findOne({ code, status: 'active' })
        .select('name branding')
        .lean();

      if (district) {
        const merged = mergeBranding(PLATFORM_DEFAULTS, district.branding ?? {});

        return sendSuccess(res, 200, 'District branding resolved', {
          type:     'district',
          orgName:  district.name,
          orgId:    district._id,
          branding: merged,
        });
      }

      // ── 3. Code not found → silent fallback ──────────────────
      return sendSuccess(res, 200, 'Platform default branding', {
        type:     'platform',
        orgName:  null,
        orgId:    null,
        branding: PLATFORM_DEFAULTS,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BrandingController();
