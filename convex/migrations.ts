/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MIGRATION MUTATIONS — Internal endpoints for the ETL migration script
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * These mutations are called by `scripts/migrate.ts` via ConvexHttpClient.
 * They perform direct inserts without auth checks (migration-only).
 *
 * ⚠️  DELETE THIS FILE AFTER MIGRATION IS COMPLETE.
 */

import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// ─── Queries for local finalization script ────────────────────────────

export const getAllProfileIds = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();
    return profiles.map((p) => p._id);
  },
});

export const getProfileById = query({
  args: { profileId: v.string() },
  handler: async (ctx, args) => {
    const p = await ctx.db.get(args.profileId as any);
    if (!p) return null;
    return {
      _id: p._id,
      userId: (p as any).userId,
      userType: (p as any).userType,
      identity: (p as any).identity,
      passportInfo: (p as any).passportInfo,
      family: (p as any).family,
      addresses: (p as any).addresses,
      contacts: (p as any).contacts,
      profession: (p as any).profession,
      consularCard: (p as any).consularCard,
      documents: (p as any).documents,
    };
  },
});

export const getAllChildProfileIds = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("childProfiles").collect();
    return all.map((cp) => cp._id);
  },
});

export const getChildProfileById = query({
  args: { childProfileId: v.string() },
  handler: async (ctx, args) => {
    const cp = await ctx.db.get(args.childProfileId as any);
    if (!cp) return null;
    return {
      _id: cp._id,
      authorUserId: (cp as any).authorUserId,
      identity: (cp as any).identity,
      consularCard: (cp as any).consularCard,
      registrationRequestId: (cp as any).registrationRequestId,
      documents: (cp as any).documents,
    };
  },
});

export const patchChildProfile = mutation({
  args: { childProfileId: v.string(), consularCard: v.optional(v.any()), documents: v.optional(v.any()) },
  handler: async (ctx, args) => {
    const patch: Record<string, any> = {};
    if (args.consularCard !== undefined) patch.consularCard = args.consularCard;
    if (args.documents !== undefined) patch.documents = args.documents;
    await ctx.db.patch(args.childProfileId as any, patch as any);
  },
});

export const patchProfileDocuments = mutation({
  args: { profileId: v.string(), documents: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId as any, { documents: args.documents } as any);
  },
});

export const getDocumentsByOwner = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("documents")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId as any))
      .collect();
  },
});

export const getDocumentBatch = query({
  args: { cursor: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("documents").order("asc").collect();
    let filtered = all;
    if (args.cursor !== undefined) {
      filtered = all.filter((d) => d._creationTime > args.cursor!);
    }
    const batch = filtered.slice(0, 300);
    return batch.map((d) => ({
      _id: d._id,
      _creationTime: d._creationTime,
      ownerId: d.ownerId,
      documentType: d.documentType,
      firstStorageId: d.files?.[0]?.storageId ?? null,
    }));
  },
});

export const deleteDocument = mutation({
  args: { documentId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.documentId as any);
  },
});

/** Re-point a document reference on a profile, childProfile, or request */
export const repointDocRef = mutation({
  args: {
    table: v.string(),        // "profiles" | "childProfiles" | "requests"
    recordId: v.string(),
    field: v.string(),         // e.g. "documents.passport" or "documents" (for request array)
    oldDocId: v.string(),
    newDocId: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.recordId as any);
    if (!record) return;

    if (args.table === "requests") {
      // requests.documents is an array of doc IDs
      const docs = (record as any).documents as string[] | undefined;
      if (docs) {
        const updated = docs.map((id: string) => id === args.oldDocId ? args.newDocId : id);
        await ctx.db.patch(args.recordId as any, { documents: updated } as any);
      }
    } else {
      // profiles/childProfiles: documents is an object { passport: id, ... }
      const documents = (record as any).documents as Record<string, string> | undefined;
      if (documents) {
        const updated = { ...documents };
        for (const [key, val] of Object.entries(updated)) {
          if (val === args.oldDocId) updated[key] = args.newDocId;
        }
        await ctx.db.patch(args.recordId as any, { documents: updated } as any);
      }
    }
  },
});

/** Get all profile doc refs (just id + documents field) */
export const getAllProfileDocRefs = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("profiles").collect();
    return all
      .filter((p) => p.documents)
      .map((p) => ({ _id: p._id, documents: p.documents }));
  },
});

export const getAllChildProfileDocRefs = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("childProfiles").collect();
    return all
      .filter((cp) => cp.documents)
      .map((cp) => ({ _id: cp._id, documents: cp.documents }));
  },
});

export const getAllRequestDocRefs = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("requests").collect();
    return all
      .filter((r) => r.documents && r.documents.length > 0)
      .map((r) => ({ _id: r._id, documents: r.documents }));
  },
});

export const getRequestForProfile = query({
  args: { profileId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("requests")
      .filter((q) => q.eq(q.field("profileId"), args.profileId as any))
      .first();
  },
});

export const getRequestByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("requests")
      .filter((q) => q.eq(q.field("userId"), args.userId as any))
      .first();
  },
});

export const getRegForProfile = query({
  args: { profileId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("consularRegistrations")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId as any))
      .first();
  },
});

export const getRegForChildProfile = query({
  args: { childProfileId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("consularRegistrations")
      .withIndex("by_childProfile", (q) => q.eq("childProfileId", args.childProfileId as any))
      .first();
  },
});

export const patchRequest = mutation({
  args: { requestId: v.string(), formData: v.optional(v.any()), documents: v.optional(v.any()) },
  handler: async (ctx, args) => {
    const patch: Record<string, any> = {};
    if (args.formData !== undefined) patch.formData = args.formData;
    if (args.documents !== undefined) patch.documents = args.documents;
    await ctx.db.patch(args.requestId as any, patch as any);
  },
});

// ─── Lookup (for migration script to find pre-seeded entities) ────────
export const lookupOrgBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query("orgs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!org) return null;

    // Find registration orgService for this org
    const orgServices = await ctx.db
      .query("orgServices")
      .filter((q) => q.eq(q.field("orgId"), org._id))
      .collect();

    let registrationOrgServiceId: string | undefined;
    for (const os of orgServices) {
      const service = await ctx.db.get(os.serviceId);
      if (service?.category === "registration" && service.isActive) {
        registrationOrgServiceId = os._id;
        break;
      }
    }

    return {
      orgId: org._id,
      orgName: org.name,
      registrationOrgServiceId,
    };
  },
});

// ─── Users ────────────────────────────────────────────────────────────────

export const lookupUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const insertUser = mutation({
  args: {
    authId: v.string(),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    role: v.optional(v.string()),
    isActive: v.boolean(),
    isSuperadmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists by email
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("users", {
      authId: args.authId,
      email: args.email,
      name: args.name,
      phone: args.phone,
      firstName: args.firstName,
      lastName: args.lastName,
      role: args.role as any,
      isActive: args.isActive,
      isSuperadmin: args.isSuperadmin,
      updatedAt: Date.now(),
    });
  },
});

// ─── Organizations ────────────────────────────────────────────────────────

export const insertOrg = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    type: v.string(),
    isActive: v.boolean(),
    jurisdictionCountries: v.array(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if org already exists by slug
    const existing = await ctx.db
      .query("orgs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("orgs", {
      slug: args.slug,
      name: args.name,
      type: args.type as any,
      isActive: args.isActive,
      jurisdictionCountries: args.jurisdictionCountries as any,
      email: args.email,
      phone: args.phone,
      country: "",
      address: {},
      timezone: "Europe/Paris",
    } as any);
  },
});

// ─── Documents ────────────────────────────────────────────────────────────

export const insertDocument = mutation({
  args: {
    ownerId: v.string(),
    files: v.array(
      v.object({
        storageId: v.string(),
        filename: v.string(),
        mimeType: v.string(),
        sizeBytes: v.number(),
        uploadedAt: v.number(),
      }),
    ),
    documentType: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.string(),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Idempotency: check by ownerId + documentType
    if (args.documentType) {
      const existing = await ctx.db
        .query("documents")
        .filter((q) => q.and(
          q.eq(q.field("ownerId"), args.ownerId as any),
          q.eq(q.field("documentType"), args.documentType as any)
        ))
        .first();
      if (existing) return existing._id;
    }

    return await ctx.db.insert("documents", {
      ownerId: args.ownerId as any,
      files: args.files as any,
      documentType: args.documentType as any,
      category: args.category as any,
      status: args.status as any,
      label: args.label,
    });
  },
});

// ─── Services (global catalog) ────────────────────────────────────────────

export const insertService = mutation({
  args: {
    slug: v.string(),
    code: v.string(),
    name: v.object({ fr: v.string(), en: v.string() }),
    description: v.object({ fr: v.string(), en: v.string() }),
    category: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if service already exists by code
    const existing = await ctx.db
      .query("services")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("services", {
      slug: args.slug,
      code: args.code,
      name: args.name,
      description: args.description,
      category: args.category as any,
      isActive: args.isActive,
      estimatedDays: 7,
      requiresAppointment: false,
      requiresPickupAppointment: false,
    });
  },
});

// ─── OrgServices ──────────────────────────────────────────────────────────

export const insertOrgService = mutation({
  args: {
    orgId: v.string(),
    serviceId: v.string(),
    isActive: v.boolean(),
    pricing: v.optional(
      v.object({
        amount: v.number(),
        currency: v.string(),
        isFree: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orgServices", {
      orgId: args.orgId as any,
      serviceId: args.serviceId as any,
      isActive: args.isActive,
      pricing: args.pricing as any,
    });
  },
});

// ─── Profiles ─────────────────────────────────────────────────────────────

export const insertProfile = mutation({
  args: {
    userId: v.string(),
    userType: v.string(),
    countryOfResidence: v.optional(v.string()),
    identity: v.any(),
    passportInfo: v.optional(v.any()),
    addresses: v.optional(v.any()),
    contacts: v.optional(v.any()),
    family: v.optional(v.any()),
    profession: v.optional(v.any()),
    consularCard: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Check if profile for this user already exists
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId as any))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("profiles", {
      userId: args.userId as any,
      userType: args.userType as any,
      countryOfResidence: args.countryOfResidence as any,
      identity: args.identity,
      passportInfo: args.passportInfo,
      addresses: args.addresses ?? {},
      contacts: args.contacts ?? {},
      family: args.family ?? {},
      profession: args.profession,
      consularCard: args.consularCard,
      updatedAt: Date.now(),
    } as any);
  },
});

// ─── Positions ────────────────────────────────────────────────────────────

export const insertPosition = mutation({
  args: {
    orgId: v.string(),
    code: v.string(),
    title: v.object({ fr: v.string(), en: v.string() }),
    level: v.number(),
    grade: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if position already exists
    const existing = await ctx.db
      .query("positions")
      .withIndex("by_org", (q) =>
        q.eq("orgId", args.orgId as any).eq("isActive", true),
      )
      .collect();

    const match = existing.find((p) => p.code === args.code);
    if (match) {
      return match._id;
    }

    return await ctx.db.insert("positions", {
      orgId: args.orgId as any,
      code: args.code,
      title: args.title,
      level: args.level,
      grade: args.grade as any,
      isActive: args.isActive,
      isRequired: false,
      tasks: [], // Will be populated by the admin later
    });
  },
});

// ─── Memberships ──────────────────────────────────────────────────────────

export const insertMembership = mutation({
  args: {
    userId: v.string(),
    orgId: v.string(),
    positionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if membership already exists
    const existing = await ctx.db
      .query("memberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", args.userId as any).eq("orgId", args.orgId as any),
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("memberships", {
      userId: args.userId as any,
      orgId: args.orgId as any,
      positionId: args.positionId as any,
    });
  },
});

// ─── Requests ─────────────────────────────────────────────────────────────

export const insertRequest = mutation({
  args: {
    reference: v.string(),
    userId: v.string(),
    profileId: v.optional(v.string()),
    orgId: v.string(),
    orgServiceId: v.optional(v.string()),
    status: v.string(),
    priority: v.string(),
    formData: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Idempotent by reference
    const existing = await ctx.db
      .query("requests")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("requests", {
      reference: args.reference,
      userId: args.userId as any,
      profileId: args.profileId as any,
      orgId: args.orgId as any,
      orgServiceId: args.orgServiceId as any,
      status: args.status as any,
      priority: args.priority as any,
      formData: args.formData,
      updatedAt: Date.now(),
    } as any);
  },
});

// ─── Appointments ─────────────────────────────────────────────────────────

export const insertAppointment = mutation({
  args: {
    orgId: v.string(),
    attendeeProfileId: v.string(),
    orgServiceId: v.optional(v.string()),
    agentId: v.optional(v.string()),
    requestId: v.optional(v.string()),
    date: v.string(),
    time: v.string(),
    endTime: v.optional(v.string()),
    status: v.string(),
    appointmentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Idempotency: check by attendeeProfileId + date + time
    const existing = await ctx.db
      .query("appointments")
      .withIndex("by_attendee", (q) => q.eq("attendeeProfileId", args.attendeeProfileId as any))
      .collect();
    const match = existing.find((a) => a.date === args.date && a.time === args.time);
    if (match) return match._id;

    return await ctx.db.insert("appointments", {
      orgId: args.orgId as any,
      attendeeProfileId: args.attendeeProfileId as any,
      orgServiceId: args.orgServiceId as any,
      agentId: args.agentId as any,
      requestId: args.requestId as any,
      date: args.date,
      time: args.time,
      endTime: args.endTime,
      status: args.status as any,
      appointmentType: args.appointmentType as any,
    });
  },
});

// ─── Child Profiles ───────────────────────────────────────────────────────

export const insertChildProfile = mutation({
  args: {
    authorUserId: v.string(),
    status: v.string(),
    identity: v.any(),
    passportInfo: v.optional(v.any()),
    consularCard: v.optional(v.any()),
    parents: v.any(),
    registrationRequestId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Idempotency: check by authorUserId + firstName + lastName
    const identity = args.identity as any;
    const existing = await ctx.db
      .query("childProfiles")
      .withIndex("by_author", (q) => q.eq("authorUserId", args.authorUserId as any))
      .collect();
    const match = existing.find((cp: any) =>
      cp.identity?.firstName === identity?.firstName &&
      cp.identity?.lastName === identity?.lastName
    );
    if (match) return match._id;

    return await ctx.db.insert("childProfiles", {
      authorUserId: args.authorUserId as any,
      status: args.status as any,
      identity: args.identity,
      passportInfo: args.passportInfo,
      consularCard: args.consularCard,
      parents: args.parents,
      registrationRequestId: args.registrationRequestId as any,
      updatedAt: Date.now(),
    } as any);
  },
});

// ─── Consular Registrations ──────────────────────────────────────────
export const insertConsularRegistration = mutation({
  args: {
    profileId: v.string(),
    orgId: v.string(),
    registrationOrgServiceId: v.optional(v.string()),
    requestId: v.optional(v.string()),
    type: v.string(),
    status: v.string(),
    duration: v.optional(v.string()),
    registeredAt: v.number(),
    activatedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    cardNumber: v.optional(v.string()),
    cardIssuedAt: v.optional(v.number()),
    cardExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Idempotency: check by cardNumber
    if (args.cardNumber) {
      const existing = await ctx.db
        .query("consularRegistrations")
        .withIndex("by_card_number", (q) => q.eq("cardNumber", args.cardNumber))
        .first();
      if (existing) return existing._id;
    }

    // Resolve a valid requestId (v.id("requests")) — can't use profileId
    let resolvedReqId = args.requestId as any;
    if (!resolvedReqId) {
      const req = await ctx.db.query("requests")
        .filter((q) => q.eq(q.field("profileId"), args.profileId as any))
        .first();
      if (req) {
        resolvedReqId = req._id;
      } else {
        const profile = await ctx.db.get(args.profileId as any);
        resolvedReqId = await ctx.db.insert("requests", {
          reference: `REG-${args.cardNumber ?? Date.now()}`,
          userId: (profile as any)?.userId ?? ("" as any),
          profileId: args.profileId as any,
          orgId: args.orgId as any,
          orgServiceId: (args.registrationOrgServiceId ?? "") as any,
          status: "completed" as any,
          priority: "normal" as any,
          updatedAt: Date.now(),
        } as any);
      }
    }
    return await ctx.db.insert("consularRegistrations", {
      profileId: args.profileId as any,
      orgId: args.orgId as any,
      requestId: resolvedReqId,
      type: args.type as any,
      status: args.status as any,
      duration: args.duration as any,
      registeredAt: args.registeredAt,
      activatedAt: args.activatedAt,
      expiresAt: args.expiresAt,
      cardNumber: args.cardNumber,
      cardIssuedAt: args.cardIssuedAt,
      cardExpiresAt: args.cardExpiresAt,
    } as any);
  },
});

/**
 * Insert consular registration for a CHILD profile.
 * Uses the new childProfileId field in the schema.
 */
export const insertChildConsularRegistration = mutation({
  args: {
    childProfileId: v.string(),
    requestId: v.string(),
    orgId: v.string(),
    type: v.string(),
    status: v.string(),
    registeredAt: v.number(),
    activatedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    cardNumber: v.optional(v.string()),
    cardIssuedAt: v.optional(v.number()),
    cardExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Idempotency: check existing by childProfile
    const existing = await ctx.db.query("consularRegistrations")
      .withIndex("by_childProfile", (q) => q.eq("childProfileId", args.childProfileId as any))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("consularRegistrations", {
      childProfileId: args.childProfileId as any,
      orgId: args.orgId as any,
      requestId: args.requestId as any,
      type: args.type as any,
      status: args.status as any,
      registeredAt: args.registeredAt,
      activatedAt: args.activatedAt,
      expiresAt: args.expiresAt,
      cardNumber: args.cardNumber,
      cardIssuedAt: args.cardIssuedAt,
      cardExpiresAt: args.cardExpiresAt,
    } as any);
  },
});

// ─── Cleanup: Deduplicate child profiles ──────────────────────────────
export const deduplicateChildProfiles = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("childProfiles").collect();
    const seen = new Map<string, string>(); // key -> kept _id
    let deleted = 0;
    for (const cp of all) {
      const key = `${cp.authorUserId}|${(cp.identity as any)?.firstName}|${(cp.identity as any)?.lastName}`;
      if (seen.has(key)) {
        await ctx.db.delete(cp._id);
        deleted++;
      } else {
        seen.set(key, cp._id);
      }
    }
    return { total: all.length, deleted, remaining: all.length - deleted };
  },
});

// ─── Cleanup: Deduplicate documents ───────────────────────────────────
export const deduplicateDocuments = mutation({
  args: { afterId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Get a batch of documents ordered by _creationTime
    let q = ctx.db.query("documents").order("asc");
    const batch = await q.take(800);

    if (batch.length === 0) return { deleted: 0, checked: 0, done: true };

    // Skip docs we already processed (by _id comparison)
    const toProcess = args.afterId
      ? batch.filter((d) => d._id > (args.afterId as any))
      : batch;

    if (toProcess.length === 0) return { deleted: 0, checked: 0, done: true };

    const seen = new Map<string, string>(); // key -> first _id
    let deleted = 0;

    for (const doc of toProcess) {
      const key = `${doc.ownerId}|${doc.documentType}`;
      if (seen.has(key)) {
        await ctx.db.delete(doc._id);
        deleted++;
      } else {
        seen.set(key, doc._id);
      }
    }

    const lastId = toProcess[toProcess.length - 1]!._id;
    return { deleted, checked: toProcess.length, done: toProcess.length < 800, nextAfterId: lastId };
  },
});

// ─── Cleanup: Deduplicate request.documents arrays ───────────────────
export const deduplicateRequestDocuments = mutation({
  args: {},
  handler: async (ctx) => {
    const requests = await ctx.db.query("requests").collect();
    let fixed = 0;
    for (const req of requests) {
      const docs = (req as any).documents as string[] | undefined;
      if (!docs || docs.length === 0) continue;
      const unique = [...new Set(docs)];
      if (unique.length < docs.length) {
        await ctx.db.patch(req._id, { documents: unique } as any);
        fixed++;
      }
    }
    return { total: requests.length, fixed };
  },
});

// ─── Cleanup: Sync consularCard from childProfiles → consularRegistrations ──
export const syncChildProfileCards = mutation({
  args: {},
  handler: async (ctx) => {
    const childProfiles = await ctx.db.query("childProfiles").collect();
    let fixed = 0;
    let skipped = 0;
    for (const cp of childProfiles) {
      const card = cp.consularCard as { cardNumber?: string; issuedAt?: number; expiresAt?: number } | undefined;
      if (!card?.cardNumber) continue;

      const reg = await ctx.db.query("consularRegistrations")
        .withIndex("by_childProfile", (q) => q.eq("childProfileId", cp._id))
        .first();

      if (!reg) { skipped++; continue; }
      if (reg.cardNumber) continue; // already set

      await ctx.db.patch(reg._id, {
        cardNumber: card.cardNumber,
        cardIssuedAt: card.issuedAt,
        cardExpiresAt: card.expiresAt,
        activatedAt: card.issuedAt,
        status: "active" as any,
      });
      fixed++;
    }
    return { total: childProfiles.length, fixed, skipped };
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// POST-MIGRATION FINALIZATION
// ═══════════════════════════════════════════════════════════════════════════

function buildFormData(profile: Record<string, any>, duration: string): Record<string, unknown> {
  const identity = profile.identity ?? {};
  const passportInfo = profile.passportInfo ?? {};
  const family = profile.family ?? {};
  const addresses = profile.addresses ?? {};
  const contacts = profile.contacts ?? {};
  const profession = profile.profession ?? {};
  const residence = addresses.residence ?? {};
  const emergencyRes = contacts.emergencyResidence ?? {};

  const fmt = (ts: number | undefined) => {
    if (!ts) return undefined;
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  return {
    type: "registration", profileId: profile._id, duration,
    basic_info: {
      last_name: identity.lastName || undefined,
      first_name: identity.firstName || undefined,
      gender: identity.gender || undefined,
      birth_date: fmt(identity.birthDate),
      birth_place: identity.birthPlace || undefined,
      birth_country: identity.birthCountry || undefined,
      nationality: identity.nationality || undefined,
      nationality_acquisition: identity.nationalityAcquisition || undefined,
    },
    passport_info: {
      passport_number: passportInfo.number || undefined,
      passport_issue_date: fmt(passportInfo.issueDate),
      passport_expiry_date: fmt(passportInfo.expiryDate),
      passport_issuing_authority: passportInfo.issuingAuthority || undefined,
    },
    family_info: {
      marital_status: family.maritalStatus || undefined,
      father_last_name: family.father?.lastName || undefined,
      father_first_name: family.father?.firstName || undefined,
      mother_last_name: family.mother?.lastName || undefined,
      mother_first_name: family.mother?.firstName || undefined,
    },
    contact_info: {
      email: contacts.email || undefined,
      phone: contacts.phone || undefined,
    },
    residence_address: {
      residence_street: residence.street || undefined,
      residence_city: residence.city || undefined,
      residence_postal_code: residence.postalCode || undefined,
      residence_country: residence.country || undefined,
    },
    emergency_residence: {
      emergency_residence_last_name: emergencyRes.lastName || undefined,
      emergency_residence_first_name: emergencyRes.firstName || undefined,
      emergency_residence_phone: emergencyRes.phone || undefined,
      emergency_residence_email: emergencyRes.email || undefined,
    },
    professional_info: {
      work_status: profession.status || undefined,
      profession: profession.title || undefined,
      employer: profession.employer || undefined,
    },
  };
}

/**
 * Finalize profiles: fill formData on requests + create consularRegistrations.
 * Self-looping — run once: npx convex run --prod migrations:startFinalization
 */
export const startFinalization = mutation({
  args: {},
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(0, internal.migrations.finalizeProfilesBatch, { afterId: "" });
    return "Started! Check Convex dashboard logs for progress.";
  },
});

export const finalizeProfilesBatch = internalMutation({
  args: { afterId: v.string() },
  handler: async (ctx, args) => {
    const org = await ctx.db.query("orgs")
      .withIndex("by_slug", (q) => q.eq("slug", "fr-consulat-paris"))
      .first();
    if (!org) throw new Error("Org not found");

    // Fetch batch of 30 profiles after cursor
    let profiles = await ctx.db.query("profiles").order("asc").take(500);
    if (args.afterId) profiles = profiles.filter((p) => p._id > (args.afterId as any));
    profiles = profiles.slice(0, 30);

    if (profiles.length === 0) {
      console.log("✅ FINALIZATION COMPLETE — all profiles processed");
      return;
    }

    let regsCreated = 0;
    let formDataFilled = 0;

    for (const profile of profiles) {
      const request = await ctx.db.query("requests")
        .filter((q) => q.eq(q.field("profileId"), profile._id))
        .first();

      // Fill formData on request if empty
      if (request && !request.formData) {
        await ctx.db.patch(request._id, {
          formData: buildFormData(profile as any, profile.userType || "long_stay"),
        } as any);
        formDataFilled++;
      }

      // Create consularRegistration for any profile with a non-draft request
      if (request && request.status !== "draft") {
        const existingReg = await ctx.db.query("consularRegistrations")
          .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
          .first();

        if (!existingReg) {
          const card = profile.consularCard;
          await ctx.db.insert("consularRegistrations", {
            profileId: profile._id,
            orgId: org._id,
            requestId: request._id,
            type: "inscription" as any,
            status: card?.cardNumber ? "active" as any : "requested" as any,
            duration: profile.userType as any,
            registeredAt: card?.cardIssuedAt || request._creationTime || Date.now(),
            activatedAt: card?.cardIssuedAt || undefined,
            expiresAt: card?.cardExpiresAt || undefined,
            cardNumber: card?.cardNumber || undefined,
            cardIssuedAt: card?.cardIssuedAt || undefined,
            cardExpiresAt: card?.cardExpiresAt || undefined,
          });
          regsCreated++;
        }
      }
    }

    const lastId = profiles[profiles.length - 1]!._id;
    console.log(`📊 Batch: ${profiles.length} profiles | ${regsCreated} regs created | ${formDataFilled} formData filled | cursor: ${lastId}`);

    // Schedule next batch automatically
    if (profiles.length >= 30) {
      await ctx.scheduler.runAfter(0, internal.migrations.finalizeProfilesBatch, { afterId: lastId });
    } else {
      console.log("✅ FINALIZATION COMPLETE — all profiles processed");
    }
  },
});
