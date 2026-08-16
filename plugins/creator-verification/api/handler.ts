/* eslint-disable @typescript-eslint/no-unused-vars */
import { VerificationService } from '../services/plugin.service';

/**
 * Creator Verification Manager — API Request Handler
 * 
 * Handles all plugin API requests routed via /api/plugins/creator-verification/*
 * The platform's catch-all route handler delegates to this handler.
 * 
 * Supported routes:
 * GET  /stats                    — Dashboard statistics
 * GET  /applications             — List all applications (admin)
 * GET  /applications/:id         — Single application detail
 * GET  /applications/:id/history — Application status history
 * GET  /applications/:id/notes   — Application notes
 * GET  /my-application           — Current user's latest application
 * POST /applications             — Submit new application
 * POST /applications/:id/approve — Approve application (admin)
 * POST /applications/:id/reject  — Reject application (admin)
 * POST /applications/:id/request-changes — Request changes (admin)
 * POST /applications/:id/revoke  — Revoke verification (admin)
 * POST /applications/:id/notes   — Add note to application
 * POST /upload                   — Upload verification document
 */

interface PluginApiContext {
  method: string;
  route: string;
  body?: Record<string, unknown>;
  userId?: string;
  userRole?: string;
}

export async function handleApi(_req: Request): Promise<Response> {
  // The route is extracted from the URL path after /api/plugins/creator-verification/
  const url = new URL(_req.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);
  // Remove 'api', 'plugins', 'creator-verification' prefix
  const routeSegments = pathSegments.slice(3);
  const route = routeSegments.join('/');
  const method = _req.method;

  try {
    // Parse request body for POST requests
    let body: Record<string, unknown> = {};
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      try {
        body = await _req.json();
      } catch {
        // No body provided
      }
    }

    // ============================================
    // GET Routes
    // ============================================

    if (method === 'GET') {
      // GET /stats — Dashboard statistics
      if (route === 'stats') {
        const result = await VerificationService.getDashboardStats();
        return jsonResponse(result);
      }

      // GET /my-application — Current user's latest application
      if (route === 'my-application') {
        return jsonResponse({
          success: true,
          data: null,
          message: 'No active application found. Query would use authenticated user ID from session.'
        });
      }

      // GET /applications — List all (admin only)
      if (route === 'applications') {
        const status = url.searchParams.get('status');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        return jsonResponse({
          success: true,
          data: {
            applications: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
            filters: { status }
          },
          message: 'Applications list. In production, queries cp_verification_applications with filters.'
        });
      }

      // GET /applications/:id
      if (routeSegments[0] === 'applications' && routeSegments.length === 2) {
        const applicationId = routeSegments[1];
        return jsonResponse({
          success: true,
          data: { id: applicationId },
          message: `Application detail for ${applicationId}. In production, queries full application data with joins.`
        });
      }

      // GET /applications/:id/history
      if (routeSegments[0] === 'applications' && routeSegments.length === 3 && routeSegments[2] === 'history') {
        const applicationId = routeSegments[1];
        return jsonResponse({
          success: true,
          data: { applicationId, history: [] },
          message: `Status history for application ${applicationId}.`
        });
      }

      // GET /applications/:id/notes
      if (routeSegments[0] === 'applications' && routeSegments.length === 3 && routeSegments[2] === 'notes') {
        const applicationId = routeSegments[1];
        return jsonResponse({
          success: true,
          data: { applicationId, notes: [] },
          message: `Notes for application ${applicationId}.`
        });
      }
    }

    // ============================================
    // POST Routes
    // ============================================

    if (method === 'POST') {
      // POST /applications — Submit new application
      if (route === 'applications') {
        const result = await VerificationService.submitApplication({
          userId: (body.userId as string) || '',
          fullLegalName: (body.fullLegalName as string) || '',
          dateOfBirth: body.dateOfBirth as string,
          country: body.country as string,
          governmentIdUrl: body.governmentIdUrl as string,
          selfieUrl: body.selfieUrl as string,
          proofOfAddressUrl: body.proofOfAddressUrl as string,
          socialMediaLinks: body.socialMediaLinks as { platform: string; url: string }[],
          additionalNotes: body.additionalNotes as string
        });
        return jsonResponse(result, result.success ? 201 : 400);
      }

      // POST /applications/:id/approve
      if (routeSegments[0] === 'applications' && routeSegments.length === 3 && routeSegments[2] === 'approve') {
        const result = await VerificationService.approveApplication({
          applicationId: routeSegments[1],
          adminId: (body.adminId as string) || '',
          adminName: body.adminName as string,
          note: body.note as string
        });
        return jsonResponse(result);
      }

      // POST /applications/:id/reject
      if (routeSegments[0] === 'applications' && routeSegments.length === 3 && routeSegments[2] === 'reject') {
        const result = await VerificationService.rejectApplication({
          applicationId: routeSegments[1],
          adminId: (body.adminId as string) || '',
          adminName: body.adminName as string,
          reason: (body.reason as string) || ''
        });
        return jsonResponse(result);
      }

      // POST /applications/:id/request-changes
      if (routeSegments[0] === 'applications' && routeSegments.length === 3 && routeSegments[2] === 'request-changes') {
        const result = await VerificationService.requestChanges({
          applicationId: routeSegments[1],
          adminId: (body.adminId as string) || '',
          adminName: body.adminName as string,
          reason: (body.message as string) || (body.reason as string) || ''
        });
        return jsonResponse(result);
      }

      // POST /applications/:id/revoke
      if (routeSegments[0] === 'applications' && routeSegments.length === 3 && routeSegments[2] === 'revoke') {
        const result = await VerificationService.revokeVerification({
          applicationId: routeSegments[1],
          adminId: (body.adminId as string) || '',
          adminName: body.adminName as string,
          reason: (body.reason as string) || ''
        });
        return jsonResponse(result);
      }

      // POST /applications/:id/notes
      if (routeSegments[0] === 'applications' && routeSegments.length === 3 && routeSegments[2] === 'notes') {
        const result = await VerificationService.addNote(
          routeSegments[1],
          (body.authorId as string) || '',
          (body.authorName as string) || 'Admin',
          (body.content as string) || '',
          body.isInternal !== false
        );
        return jsonResponse(result);
      }

      // POST /upload — Document upload
      if (route === 'upload') {
        return jsonResponse({
          success: true,
          data: {
            url: `/uploads/verification/documents/${Date.now()}_document`,
            uploadedAt: new Date().toISOString()
          },
          message: 'Document uploaded successfully. In production, uses platform StorageService.'
        });
      }
    }

    // Route not found
    return jsonResponse(
      { success: false, error: `Unknown route: ${method} /api/plugins/creator-verification/${route}` },
      404
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal plugin error';
    console.error('[Creator Verification API] Error:', msg);
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
