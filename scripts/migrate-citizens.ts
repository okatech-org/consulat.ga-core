#!/usr/bin/env bun
/**
 * User-centric migration with parallelization.
 * 
 * For each legacy user: profile → documents → requests → appointments
 * Processes BATCH_SIZE users concurrently.
 *
 * Usage:
 *   env $(grep -v '^#' .env.production | xargs) bun run scripts/migrate-citizens.ts <snapshot_dir>
 *   env $(grep -v '^#' .env.production | xargs) bun run scripts/migrate-citizens.ts <snapshot_dir> --dry-run
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from "node:fs";
import * as path from "node:path";

// ─── Config ────────────────────────────────────────────────────────────────

const SNAPSHOT_DIR = process.argv[2] ?? "docs/snapshot_greedy-horse-339_1771762341945755898";
const DRY_RUN = process.argv.includes("--dry-run");
const BATCH_SIZE = 10; // parallel users at once
const CONSULAT_SLUG = "fr-consulat-paris";

const CONVEX_URL = process.env.VITE_CONVEX_URL;
const SITE_URL = process.env.VITE_CONVEX_SITE_URL;

if (!CONVEX_URL) {
	console.error("❌ VITE_CONVEX_URL not set");
	process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

console.log(`\n═══════════════════════════════════════════════════════════`);
console.log(`  CITIZEN MIGRATION${DRY_RUN ? " (DRY RUN)" : ""} — User-Centric`);
console.log(`═══════════════════════════════════════════════════════════`);
console.log(`  Snapshot:   ${SNAPSHOT_DIR}`);
console.log(`  Convex:     ${CONVEX_URL}`);
console.log(`  Batch size: ${BATCH_SIZE}`);
console.log(`═══════════════════════════════════════════════════════════\n`);

// ─── JSONL Reader ──────────────────────────────────────────────────────────

function readJsonl(table: string): Array<Record<string, unknown>> {
	const filePath = path.join(SNAPSHOT_DIR, table, "documents.jsonl");
	if (!fs.existsSync(filePath)) return [];
	const content = fs.readFileSync(filePath, "utf-8").trim();
	if (!content) return [];
	return content.split("\n").map((l) => JSON.parse(l));
}

// ─── Stats ─────────────────────────────────────────────────────────────────

const stats = {
	profiles: { ok: 0, skip: 0, err: 0 },
	documents: { ok: 0, skip: 0, err: 0 },
	requests: { ok: 0, skip: 0, err: 0 },
	appointments: { ok: 0, skip: 0, err: 0 },
	childProfiles: { ok: 0, skip: 0, err: 0 },
	consularRegs: { ok: 0, skip: 0, err: 0 },
};
const errors: string[] = [];

function logErr(ctx: string, msg: string) {
	const entry = `${ctx}: ${msg}`;
	errors.push(entry);
	if (errors.length <= 20) console.log(`  ⚠️  ${entry}`);
}

// ─── Step 0: Lookup Consulat ───────────────────────────────────────────────

let consulatOrgId: string;
let registrationOrgServiceId: string | undefined;

async function lookupConsulat() {
	console.log("🏛️  Looking up Consulat...");
	const result = await client.query(api.migrations.lookupOrgBySlug, { slug: CONSULAT_SLUG });
	if (!result) {
		console.error("❌ Consulat not found!");
		process.exit(1);
	}
	consulatOrgId = result.orgId as string;
	registrationOrgServiceId = result.registrationOrgServiceId;
	console.log(`  ✅ ${result.orgName} → ${consulatOrgId}`);
	if (registrationOrgServiceId) console.log(`  ✅ Registration orgService → ${registrationOrgServiceId}`);
}

// ─── Step 1: Load legacy data, group by user ───────────────────────────────

interface UserBundle {
	legacyUserId: string;
	email: string;
	newUserId: string; // already migrated
	profile: Record<string, unknown> | null;
	documents: Array<Record<string, unknown>>;
	requests: Array<Record<string, unknown>>;
	appointments: Array<Record<string, unknown>>;
	childProfiles: Array<Record<string, unknown>>;
}

function buildUserBundles(): UserBundle[] {
	console.log("\n📦 Loading legacy data and grouping by user...");

	const legacyUsers = readJsonl("users");
	const legacyProfiles = readJsonl("profiles");
	const legacyDocuments = readJsonl("documents");
	const legacyRequests = readJsonl("requests");
	const legacyAppointments = readJsonl("appointments");
	const legacyChildProfiles = readJsonl("childProfiles");

	console.log(`  📊 ${legacyUsers.length} users, ${legacyProfiles.length} profiles, ${legacyDocuments.length} docs, ${legacyRequests.length} requests, ${legacyAppointments.length} appointments, ${legacyChildProfiles.length} childProfiles`);

	// Build indexes
	const profileByUserId = new Map<string, Record<string, unknown>>();
	const profileToUser = new Map<string, string>(); // profileId → userId
	for (const p of legacyProfiles) {
		profileByUserId.set(p.userId as string, p);
		profileToUser.set(p._id as string, p.userId as string);
	}

	const docsByProfile = new Map<string, Array<Record<string, unknown>>>();
	for (const doc of legacyDocuments) {
		const ownerType = doc.ownerType as string;
		if (ownerType === "profile") {
			const profileId = doc.ownerId as string;
			if (!docsByProfile.has(profileId)) docsByProfile.set(profileId, []);
			docsByProfile.get(profileId)!.push(doc);
		}
	}

	const requestsByProfile = new Map<string, Array<Record<string, unknown>>>();
	for (const req of legacyRequests) {
		// Legacy requesterId is actually a profileId (prefix kh7)
		const profileId = (req.requesterId as string) ?? (req.profileId as string);
		if (!profileId) continue;
		if (!requestsByProfile.has(profileId)) requestsByProfile.set(profileId, []);
		requestsByProfile.get(profileId)!.push(req);
	}

	const appointmentsByProfile = new Map<string, Array<Record<string, unknown>>>();
	for (const appt of legacyAppointments) {
		// Legacy: participants[].id is the profileId, participants[].role is "attendee" or "agent"
		const participants = (appt.participants as Array<Record<string, unknown>>) ?? [];
		for (const p of participants) {
			if (p.role !== "attendee") continue;
			const profileId = p.id as string;
			if (profileId) {
				if (!appointmentsByProfile.has(profileId)) appointmentsByProfile.set(profileId, []);
				appointmentsByProfile.get(profileId)!.push(appt);
				break;
			}
		}
	}

	// childProfiles grouped by authorUserId (legacy userId)
	const childProfilesByUser = new Map<string, Array<Record<string, unknown>>>();
	for (const cp of legacyChildProfiles) {
		const userId = cp.authorUserId as string;
		if (!userId) continue;
		if (!childProfilesByUser.has(userId)) childProfilesByUser.set(userId, []);
		childProfilesByUser.get(userId)!.push(cp);
	}

	// Build bundles
	const bundles: UserBundle[] = [];
	for (const user of legacyUsers) {
		const legacyUserId = user._id as string;
		const profile = profileByUserId.get(legacyUserId) ?? null;
		const profileId = profile?._id as string | undefined;

		bundles.push({
			legacyUserId,
			email: user.email as string,
			newUserId: "", // will query from prod
			profile,
			documents: profileId ? (docsByProfile.get(profileId) ?? []) : [],
			requests: profileId ? (requestsByProfile.get(profileId) ?? []) : [],
			appointments: profileId ? (appointmentsByProfile.get(profileId) ?? []) : [],
			childProfiles: childProfilesByUser.get(legacyUserId) ?? [],
		});
	}

	console.log(`  ✅ ${bundles.length} user bundles built`);
	return bundles;
}

// ─── Transform helpers ─────────────────────────────────────────────────────

function clean<T extends Record<string, unknown>>(obj: T): T {
	const result = {} as Record<string, unknown>;
	for (const [k, v] of Object.entries(obj)) {
		if (v !== undefined && v !== null && v !== "") result[k] = v;
	}
	return result as T;
}

function transformProfile(profile: Record<string, unknown>, newUserId: string) {
	const personal = (profile.personal as Record<string, unknown>) ?? {};
	const contacts = (profile.contacts as Record<string, unknown>) ?? {};
	const family = (profile.family as Record<string, unknown>) ?? {};
	const profession = (profile.professionSituation as Record<string, unknown>) ?? {};
	const contactAddress = (contacts.address as Record<string, unknown>) ?? {};
	const passportInfos = (personal.passportInfos as Record<string, unknown>) ?? {};
	const emergencyContacts = (profile.emergencyContacts as Array<Record<string, unknown>>) ?? [];
	const consularCard = profile.consularCard as Record<string, unknown> | undefined;

	// Map emergency contacts to the new schema format
	const firstEmergency = emergencyContacts[0];

	return {
		userId: newUserId,
		userType: "long_stay",
		countryOfResidence: (profile.residenceCountry as string) ?? undefined,

		identity: clean({
			firstName: (personal.firstName as string) ?? undefined,
			lastName: (personal.lastName as string) ?? undefined,
			birthDate: (personal.birthDate as number) ?? undefined,
			birthPlace: (personal.birthPlace as string) ?? undefined,
			birthCountry: (personal.birthCountry as string) ?? undefined,
			gender: (personal.gender as string) ?? undefined,
			nationality: (personal.nationality as string) ?? undefined,
			nationalityAcquisition: (personal.acquisitionMode as string) ?? undefined,
		}),

		passportInfo: (passportInfos.number && passportInfos.issueDate && passportInfos.expiryDate && passportInfos.issueAuthority) ? {
			number: passportInfos.number as string,
			issueDate: passportInfos.issueDate as number,
			expiryDate: passportInfos.expiryDate as number,
			issuingAuthority: passportInfos.issueAuthority as string,
		} : undefined,

		// New schema: { residence?, homeland? }
		addresses: {
			residence: contactAddress.street ? {
				street: (contactAddress.street as string) ?? "",
				city: (contactAddress.city as string) ?? "",
				postalCode: (contactAddress.postalCode as string) ?? "",
				country: (contactAddress.country as string) ?? "FR",
			} : undefined,
		},

		// New schema: { phone?, email?, emergencyHomeland?, emergencyResidence? }
		contacts: {
			email: (contacts.email as string) ?? undefined,
			phone: (contacts.phone as string) ?? undefined,
			emergencyResidence: firstEmergency ? {
				firstName: (firstEmergency.firstName as string) ?? "",
				lastName: (firstEmergency.lastName as string) ?? "",
				phone: (firstEmergency.phoneNumber as string) ?? (firstEmergency.phone as string) ?? "",
				email: (firstEmergency.email as string) || undefined,
			} : undefined,
		},

		family: {
			maritalStatus: (family.maritalStatus as string) ?? undefined,
			father: family.father ? {
				firstName: ((family.father as Record<string, unknown>).firstName as string) ?? "",
				lastName: ((family.father as Record<string, unknown>).lastName as string) ?? "",
			} : undefined,
			mother: family.mother ? {
				firstName: ((family.mother as Record<string, unknown>).firstName as string) ?? "",
				lastName: ((family.mother as Record<string, unknown>).lastName as string) ?? "",
			} : undefined,
		},

		profession: clean({
			status: (profession.workStatus as string) ?? undefined,
			title: (profession.profession as string) ?? undefined,
			employer: (profession.employer as string) ?? undefined,
		}),

		consularCard: consularCard?.cardNumber ? {
			orgId: consulatOrgId,
			cardNumber: consularCard.cardNumber as string,
			cardIssuedAt: (consularCard.issuedAt as number) ?? Date.now(),
			cardExpiresAt: (consularCard.expiresAt as number) ?? Date.now() + 5 * 365 * 86400000,
		} : undefined,
	};
}

function transformDocument(doc: Record<string, unknown>, newProfileId: string) {
	const storageId = doc.storageId as string | undefined;
	if (!storageId) return null;

	const typeToCategory: Record<string, string> = {
		passport: "identity", identity_card: "identity",
		birth_certificate: "civil_status", marriage_certificate: "civil_status", death_certificate: "civil_status",
		proof_of_address: "residence", residence_permit: "residence", photo: "identity",
	};

	const validations = (doc.validations as Array<Record<string, unknown>>) ?? [];
	const last = validations[validations.length - 1];
	let status = "pending";
	if (last) {
		const vs = last.status as string;
		if (vs === "approved" || vs === "validated") status = "validated";
		else if (vs === "rejected") status = "rejected";
	}

	return {
		ownerId: newProfileId,
		files: [clean({
			storageId,
			filename: (doc.fileName as string) ?? "unknown",
			mimeType: (doc.fileType as string) ?? "application/octet-stream",
			sizeBytes: (doc.fileSize as number) ?? 0,
			uploadedAt: (doc._creationTime as number) ?? Date.now(),
		})],
		documentType: (doc.type as string) ?? undefined,
		category: typeToCategory[(doc.type as string)] ?? undefined,
		status,
		label: (doc.fileName as string) ?? undefined,
	};
}

function transformRequest(req: Record<string, unknown>, newUserId: string, newProfileId?: string) {
	const status = req.status as string;
	const statusMap: Record<string, string> = {
		pending: "pending", submitted: "submitted",
		in_review: "under_review", under_review: "under_review",
		in_production: "in_production",
		pending_completion: "pending",
		validated: "validated",
		approved: "completed",
		rejected: "rejected", cancelled: "cancelled",
		completed: "completed",
		ready_for_pickup: "ready_for_pickup",
		appointment_scheduled: "appointment_scheduled",
	};

	return {
		reference: `LEG-${(req.number as string) ?? (req._id as string).slice(-8).toUpperCase()}`,
		userId: newUserId,
		profileId: newProfileId,
		orgId: consulatOrgId,
		orgServiceId: registrationOrgServiceId,
		status: statusMap[status] ?? "submitted",
		priority: (req.priority as string) ?? "normal",
		metadata: { legacyId: req._id as string },
	};
}

function transformAppointment(appt: Record<string, unknown>, newProfileId: string) {
	// Legacy uses startAt/endAt as timestamps (numbers)
	const startAt = appt.startAt as number | undefined;
	const endAt = appt.endAt as number | undefined;
	let date = new Date().toISOString().split("T")[0]!;
	let time = "09:00";
	let endTime: string | undefined;

	if (startAt) {
		const d = new Date(startAt);
		date = d.toISOString().split("T")[0]!;
		time = d.toISOString().split("T")[1]!.slice(0, 5);
	}
	if (endAt) {
		endTime = new Date(endAt).toISOString().split("T")[1]!.slice(0, 5);
	}

	return {
		orgId: consulatOrgId,
		attendeeProfileId: newProfileId,
		orgServiceId: registrationOrgServiceId,
		date,
		time,
		endTime,
		// Legacy statuses: confirmed, scheduled, missed, cancelled
		// Schema statuses: confirmed, cancelled, completed, no_show, rescheduled
		status: ({scheduled: "confirmed", missed: "no_show", confirmed: "confirmed", cancelled: "cancelled"} as Record<string, string>)[(appt.status as string)] ?? "confirmed",
		// Legacy types: document_submission, interview, other, emergency, document_collection
		// Schema types: deposit, pickup
		appointmentType: (appt.type === "document_collection" ? "pickup" : "deposit") as any,
	};
}

function transformChildProfile(cp: Record<string, unknown>, newUserId: string) {
	const personal = (cp.personal as Record<string, unknown>) ?? {};
	const passportInfos = (personal.passportInfos as Record<string, unknown>) ?? {};
	const parents = (cp.parents as Array<Record<string, unknown>>) ?? [];

	return {
		authorUserId: newUserId,
		status: (cp.status as string) ?? "draft",
		identity: clean({
			firstName: (personal.firstName as string) ?? undefined,
			lastName: (personal.lastName as string) ?? undefined,
			birthDate: (personal.birthDate as number) ?? undefined,
			birthPlace: (personal.birthPlace as string) ?? undefined,
			birthCountry: (personal.birthCountry as string) ?? undefined,
			gender: (personal.gender as string) ?? undefined,
			nationality: (personal.nationality as string) ?? undefined,
			nationalityAcquisition: (personal.acquisitionMode as string) ?? undefined,
		}),
		passportInfo: (passportInfos.number && passportInfos.issueDate && passportInfos.expiryDate && passportInfos.issueAuthority) ? {
			number: passportInfos.number as string,
			issueDate: passportInfos.issueDate as number,
			expiryDate: passportInfos.expiryDate as number,
			issuingAuthority: passportInfos.issueAuthority as string,
		} : undefined,
		consularCard: cp.consularCard ? {
			cardNumber: ((cp.consularCard as Record<string, unknown>).cardNumber as string) ?? undefined,
			issuedAt: ((cp.consularCard as Record<string, unknown>).cardIssuedAt ?? (cp.consularCard as Record<string, unknown>).issuedAt) as number | undefined,
			expiresAt: ((cp.consularCard as Record<string, unknown>).cardExpiresAt ?? (cp.consularCard as Record<string, unknown>).expiresAt) as number | undefined,
		} : undefined,
		parents: parents.map((p) => ({
			firstName: (p.firstName as string) ?? "",
			lastName: (p.lastName as string) ?? "",
			phone: (p.phoneNumber as string) ?? (p.phone as string) ?? undefined,
			email: (p.email as string) || undefined,
			role: (p.role as string) ?? "mother",
		})),
	};
}

// ─── Process one user ──────────────────────────────────────────────────────

async function processUser(bundle: UserBundle): Promise<void> {
	// 1. Find the user in prod (already migrated)
	const existing = await client.query(api.migrations.lookupUserByEmail, { email: bundle.email });
	if (!existing) {
		logErr(bundle.email, "User not found in prod");
		return;
	}
	bundle.newUserId = existing._id as string;

	// 2. Migrate profile
	let newProfileId: string | undefined;
	if (bundle.profile) {
		try {
			const payload = transformProfile(bundle.profile, bundle.newUserId);
			if (DRY_RUN) {
				newProfileId = `dry_${bundle.profile._id}`;
				stats.profiles.ok++;
			} else {
				newProfileId = await client.mutation(api.migrations.insertProfile, payload as any) as string;
				stats.profiles.ok++;
			}

			// Create consularRegistration if profile has a consular card
			const card = bundle.profile.consularCard as Record<string, unknown> | undefined;
			if (card?.cardNumber && newProfileId) {
				try {
					const regPayload = {
						profileId: newProfileId,
						orgId: consulatOrgId,
						registrationOrgServiceId: registrationOrgServiceId,
						type: "registration",
						status: "active",
						registeredAt: (card.cardIssuedAt as number) ?? Date.now(),
						activatedAt: (card.cardIssuedAt as number) ?? undefined,
						expiresAt: (card.cardExpiresAt as number) ?? undefined,
						cardNumber: card.cardNumber as string,
						cardIssuedAt: (card.cardIssuedAt as number) ?? undefined,
						cardExpiresAt: (card.cardExpiresAt as number) ?? undefined,
					};
					if (!DRY_RUN) {
						await client.mutation(api.migrations.insertConsularRegistration, regPayload as any);
					}
					stats.consularRegs.ok++;
				} catch (err) {
					stats.consularRegs.err++;
					logErr(bundle.email, `ConsularReg: ${err}`);
				}
			}
		} catch (err) {
			stats.profiles.err++;
			logErr(bundle.email, `Profile: ${err}`);
		}
	}

	// 3. Migrate documents (only if profile created)
	if (newProfileId) {
		for (const doc of bundle.documents) {
			const payload = transformDocument(doc, newProfileId);
			if (!payload) { stats.documents.skip++; continue; }
			try {
				if (!DRY_RUN) {
					await client.mutation(api.migrations.insertDocument, payload as any);
				}
				stats.documents.ok++;
			} catch (err) {
				stats.documents.err++;
				logErr(bundle.email, `Doc ${doc._id}: ${err}`);
			}
		}
	}

	// 4. Migrate requests
	for (const req of bundle.requests) {
		const payload = transformRequest(req, bundle.newUserId, newProfileId);
		try {
			if (!DRY_RUN) {
				await client.mutation(api.migrations.insertRequest, payload as any);
			}
			stats.requests.ok++;
		} catch (err) {
			stats.requests.err++;
			logErr(bundle.email, `Request ${req._id}: ${err}`);
		}
	}

	// 5. Migrate appointments
	if (newProfileId) {
		for (const appt of bundle.appointments) {
			const payload = transformAppointment(appt, newProfileId);
			try {
				if (!DRY_RUN) {
					await client.mutation(api.migrations.insertAppointment, payload as any);
				}
				stats.appointments.ok++;
			} catch (err) {
				stats.appointments.err++;
				logErr(bundle.email, `Appointment ${appt._id}: ${err}`);
			}
		}
	}

	// 6. Migrate child profiles
	for (const cp of bundle.childProfiles) {
		try {
			const payload = transformChildProfile(cp, bundle.newUserId);
			let childProfileId: string | undefined;
			if (!DRY_RUN) {
				childProfileId = await client.mutation(api.migrations.insertChildProfile, payload as any) as string;
			} else {
				childProfileId = `dry_child_${cp._id}`;
			}
			stats.childProfiles.ok++;

			// Create consularRegistration if child has a consular card
			const card = cp.consularCard as Record<string, unknown> | undefined;
			if (card?.cardNumber && childProfileId) {
				try {
					const regPayload = {
						profileId: childProfileId, // using childProfile ID as profileId
						orgId: consulatOrgId,
						registrationOrgServiceId: registrationOrgServiceId,
						type: "registration",
						status: "active",
						registeredAt: (card.cardIssuedAt as number) ?? Date.now(),
						activatedAt: (card.cardIssuedAt as number) ?? undefined,
						expiresAt: (card.cardExpiresAt as number) ?? undefined,
						cardNumber: card.cardNumber as string,
						cardIssuedAt: (card.cardIssuedAt as number) ?? undefined,
						cardExpiresAt: (card.cardExpiresAt as number) ?? undefined,
					};
					if (!DRY_RUN) {
						await client.mutation(api.migrations.insertConsularRegistration, regPayload as any);
					}
					stats.consularRegs.ok++;
				} catch (err) {
					stats.consularRegs.err++;
					logErr(bundle.email, `ChildConsularReg ${cp._id}: ${err}`);
				}
			}
		} catch (err) {
			stats.childProfiles.err++;
			logErr(bundle.email, `ChildProfile ${cp._id}: ${err}`);
		}
	}
}

// ─── Parallel batch processor ──────────────────────────────────────────────

async function processBatch(bundles: UserBundle[], start: number, size: number) {
	const batch = bundles.slice(start, start + size);
	await Promise.all(batch.map(processUser));
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
	await lookupConsulat();
	const bundles = buildUserBundles();

	console.log(`\n🚀 Processing ${bundles.length} users in batches of ${BATCH_SIZE}...\n`);

	for (let i = 0; i < bundles.length; i += BATCH_SIZE) {
		await processBatch(bundles, i, BATCH_SIZE);
		const pct = Math.min(100, Math.round(((i + BATCH_SIZE) / bundles.length) * 100));
		process.stdout.write(`\r  📊 Progress: ${Math.min(i + BATCH_SIZE, bundles.length)}/${bundles.length} (${pct}%)`);
	}

	console.log(`\n\n═══════════════════════════════════════════════════════════`);
	console.log(`  CITIZEN MIGRATION COMPLETE${DRY_RUN ? " (DRY RUN)" : ""}`);
	console.log(`═══════════════════════════════════════════════════════════`);
	console.log(`  📋 Profiles:      ${stats.profiles.ok} ok, ${stats.profiles.err} err`);
	console.log(`  📄 Documents:     ${stats.documents.ok} ok, ${stats.documents.skip} skip, ${stats.documents.err} err`);
	console.log(`  📨 Requests:      ${stats.requests.ok} ok, ${stats.requests.err} err`);
	console.log(`  📅 Appointments:  ${stats.appointments.ok} ok, ${stats.appointments.err} err`);
	console.log(`  👶 ChildProfiles: ${stats.childProfiles.ok} ok, ${stats.childProfiles.err} err`);
	console.log(`  🪪 ConsularRegs:  ${stats.consularRegs.ok} ok, ${stats.consularRegs.err} err`);
	if (errors.length > 20) {
		console.log(`  ⚠️  ... and ${errors.length - 20} more errors`);
	}
	console.log(`═══════════════════════════════════════════════════════════\n`);
}

main().catch((err) => {
	console.error("❌ Fatal:", err);
	process.exit(1);
});
