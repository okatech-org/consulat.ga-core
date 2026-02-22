#!/usr/bin/env bun
/**
 * FINALIZE PROFILES — Post-migration: formData + consularRegistrations
 *
 * Usage:
 *   env $(grep -v '^#' .env.production | xargs) bun run scripts/finalize-profiles.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.VITE_CONVEX_URL!;
if (!CONVEX_URL) { console.error("❌ VITE_CONVEX_URL is not set"); process.exit(1); }

const client = new ConvexHttpClient(CONVEX_URL);

function fmt(ts: number | undefined): string | undefined {
	if (!ts) return undefined;
	const d = new Date(ts);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildFormData(profile: Record<string, any>, duration: string): Record<string, unknown> {
	const identity = profile.identity ?? {};
	const passportInfo = profile.passportInfo ?? {};
	const family = profile.family ?? {};
	const addresses = profile.addresses ?? {};
	const contacts = profile.contacts ?? {};
	const profession = profile.profession ?? {};
	const residence = addresses.residence ?? {};
	const emergencyRes = contacts.emergencyResidence ?? {};

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
		contact_info: { email: contacts.email || undefined, phone: contacts.phone || undefined },
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

async function main() {
	console.log("═══════════════════════════════════════════════════════════════");
	console.log("  FINALIZE PROFILES — formData + consularRegistrations");
	console.log("═══════════════════════════════════════════════════════════════");
	console.log(`  Convex: ${CONVEX_URL}\n`);

	// Lookup org
	const orgInfo = await client.query(api.migrations.lookupOrgBySlug, { slug: "fr-consulat-paris" });
	if (!orgInfo) { console.error("❌ Org not found"); process.exit(1); }
	console.log(`  🏛️  Org: ${orgInfo.orgName} → ${orgInfo.orgId}\n`);

	// Step 1: Get ALL profile IDs in one call
	console.log("  📦 Fetching all profile IDs...");
	const allIds = await client.query(api.migrations.getAllProfileIds, {});
	console.log(`  ✅ Found ${allIds.length} profiles\n`);

	let processed = 0, regsCreated = 0, formDataFilled = 0, docsAttached = 0, skipped = 0, errors = 0;

	// Step 2: Process each profile one by one
	for (const profileId of allIds) {
		processed++;
		try {
			// Fetch full profile
			const profile = await client.query(api.migrations.getProfileById, { profileId } as any);
			if (!profile) { skipped++; continue; }

			// Get request for this profile
			const request = await client.query(api.migrations.getRequestForProfile, { profileId } as any);
			if (!request || request.status === "draft") { skipped++; continue; }

			// Fill formData if empty
			let needsPatch = false;
			const patchData: Record<string, any> = { requestId: request._id };

			if (!request.formData) {
				patchData.formData = buildFormData(profile, profile.userType || "long_stay");
				formDataFilled++;
				needsPatch = true;
			}

			// Attach documents if not already attached (to request AND to profile)
			const ownerDocs = await client.query(api.migrations.getDocumentsByOwner, { ownerId: profileId } as any);
			if (ownerDocs && ownerDocs.length > 0) {
				// Patch request documents
				if (!request.documents || request.documents.length === 0) {
					patchData.documents = ownerDocs.map((d: any) => d._id);
					docsAttached++;
					needsPatch = true;
				}

				// Patch profile.documents field
				const profileDocs = profile.documents as Record<string, any> | undefined;
				if (!profileDocs || Object.values(profileDocs).every((v: any) => !v)) {
					const docMap: Record<string, string> = {};
					for (const doc of ownerDocs as any[]) {
						const t = doc.documentType;
						if (t === "passport") docMap.passport = doc._id;
						else if (t === "birth_certificate") docMap.birthCertificate = doc._id;
						else if (t === "proof_of_address" || t === "address_proof") docMap.proofOfAddress = doc._id;
						else if (t === "identity_photo") docMap.identityPhoto = doc._id;
						else if (t === "residence_permit") docMap.proofOfResidency = doc._id;
					}
					if (Object.keys(docMap).length > 0) {
						await client.mutation(api.migrations.patchProfileDocuments, { profileId, documents: docMap } as any);
					}
				}
			}

			if (needsPatch) {
				await client.mutation(api.migrations.patchRequest, patchData as any);
			}

			// Check existing consularRegistration
			const existingReg = await client.query(api.migrations.getRegForProfile, { profileId } as any);
			if (!existingReg) {
				const card = profile.consularCard as Record<string, any> | undefined;
				await client.mutation(api.migrations.insertConsularRegistration, {
					profileId,
					orgId: orgInfo.orgId,
					registrationOrgServiceId: orgInfo.registrationOrgServiceId,
					type: "inscription",
					status: card?.cardNumber ? "active" : "requested",
					registeredAt: card?.cardIssuedAt || request._creationTime || Date.now(),
					activatedAt: card?.cardIssuedAt ?? undefined,
					expiresAt: card?.cardExpiresAt ?? undefined,
					cardNumber: card?.cardNumber ?? undefined,
					cardIssuedAt: card?.cardIssuedAt ?? undefined,
					cardExpiresAt: card?.cardExpiresAt ?? undefined,
				} as any);
				regsCreated++;
			}
		} catch (err) {
			errors++;
			console.error(`  ⚠️  ${profileId}: ${err}`);
		}

		if (processed % 10 === 0 || processed === allIds.length) {
			process.stdout.write(`\r  📊 Progress: ${processed}/${allIds.length} | ${regsCreated} regs | ${formDataFilled} formData | ${docsAttached} docs | ${skipped} skip | ${errors} err`);
		}
	}

	console.log("\n");
	console.log("═══════════════════════════════════════════════════════════════");
	console.log("  ADULT PROFILES DONE");
	console.log(`  📋 ${processed} processed | 🪪 ${regsCreated} regs | 📝 ${formDataFilled} formData | 📎 ${docsAttached} docs | ⏩ ${skipped} skip | ❌ ${errors} err`);
	console.log("═══════════════════════════════════════════════════════════════\n");

	// ═══════════════════════════════════════════════════════════════
	// Phase 2: CHILD PROFILES
	// ═══════════════════════════════════════════════════════════════
	console.log("  👶 Fetching all child profile IDs...");
	const childIds = await client.query(api.migrations.getAllChildProfileIds, {});
	console.log(`  ✅ Found ${childIds.length} child profiles\n`);

	let cpProcessed = 0, cpRegsCreated = 0, cpSkipped = 0, cpErrors = 0;

	for (const childProfileId of childIds) {
		cpProcessed++;
		try {
			const cp = await client.query(api.migrations.getChildProfileById, { childProfileId } as any);
			if (!cp) { cpSkipped++; continue; }

			// Check existing reg
			const existingReg = await client.query(api.migrations.getRegForChildProfile, { childProfileId } as any);
			if (existingReg) { cpSkipped++; continue; }

			// Find a request: registrationRequestId → parent's request via authorUserId
			let requestId = cp.registrationRequestId;
			if (!requestId) {
				const parentRequest = await client.query(api.migrations.getRequestByUserId, {
					userId: cp.authorUserId,
				} as any);
				if (!parentRequest || parentRequest.status === "draft") {
					cpSkipped++;
					continue;
				}
				requestId = parentRequest._id;
			}

			const card = cp.consularCard as Record<string, any> | undefined;
			await client.mutation(api.migrations.insertChildConsularRegistration, {
				childProfileId,
				requestId,
				orgId: orgInfo.orgId,
				type: "inscription",
				status: card?.cardNumber ? "active" : "requested",
				registeredAt: card?.issuedAt || Date.now(),
				activatedAt: card?.issuedAt ?? undefined,
				expiresAt: card?.expiresAt ?? undefined,
				cardNumber: card?.cardNumber ?? undefined,
				cardIssuedAt: card?.issuedAt ?? undefined,
				cardExpiresAt: card?.expiresAt ?? undefined,
			} as any);
			cpRegsCreated++;
		} catch (err) {
			cpErrors++;
			console.error(`  ⚠️  ${childProfileId}: ${err}`);
		}

		if (cpProcessed % 10 === 0 || cpProcessed === childIds.length) {
			process.stdout.write(`\r  📊 ChildProfiles: ${cpProcessed}/${childIds.length} | ${cpRegsCreated} regs | ${cpSkipped} skip | ${cpErrors} err`);
		}
	}

	console.log("\n");
	console.log("═══════════════════════════════════════════════════════════════");
	console.log("  CHILD PROFILES DONE");
	console.log(`  👶 ${cpProcessed} processed | ${cpRegsCreated} regs | ${cpSkipped} skip | ${cpErrors} err`);
	console.log("═══════════════════════════════════════════════════════════════\n");

	// ═══════════════════════════════════════════════════════════════
	// Phase 3: PATCH CHILD CONSULAR CARDS FROM SOURCE SNAPSHOT
	// ═══════════════════════════════════════════════════════════════
	console.log("  🔧 Phase 3: Patching childProfile consularCard from source...");
	const snapshotPath = new URL("../docs/snapshot_greedy-horse-339_1771762341945755898/childProfiles/documents.jsonl", import.meta.url);
	const snapshotFile = Bun.file(snapshotPath);
	const snapshotText = await snapshotFile.text();
	const snapshotLines = snapshotText.trim().split("\n");

	// Parse children with actual card data from source
	const sourceCardsMap = new Map<string, {cardNumber: string, issuedAt?: number, expiresAt?: number}>();
	for (const line of snapshotLines) {
		const doc = JSON.parse(line);
		const card = doc.consularCard;
		if (card?.cardNumber) {
			// Key = firstName|lastName from personal
			const p = doc.personal ?? {};
			const key = `${(p.firstName || "").trim().toLowerCase()}|${(p.lastName || "").trim().toLowerCase()}`;
			sourceCardsMap.set(key, {
				cardNumber: card.cardNumber,
				issuedAt: card.cardIssuedAt ?? card.issuedAt,
				expiresAt: card.cardExpiresAt ?? card.expiresAt,
			});
		}
	}
	console.log(`  📦 Found ${sourceCardsMap.size} children with cards in source\n`);

	let cardsPatched = 0, cardsSkipped = 0;
	for (const childProfileId of childIds) {
		const cp = await client.query(api.migrations.getChildProfileById, { childProfileId } as any);
		if (!cp) continue;

		// Check if already has a card
		const existingCard = cp.consularCard as Record<string, any> | undefined;
		if (existingCard?.cardNumber) { cardsSkipped++; continue; }

		// Match by name
		const identity = cp.identity as Record<string, any> | undefined;
		const key = `${(identity?.firstName || "").trim().toLowerCase()}|${(identity?.lastName || "").trim().toLowerCase()}`;
		const sourceCard = sourceCardsMap.get(key);

		if (sourceCard) {
			await client.mutation(api.migrations.patchChildProfile, {
				childProfileId,
				consularCard: sourceCard,
			} as any);
			cardsPatched++;
		}
	}
	console.log(`  ✅ Patched ${cardsPatched} childProfiles with consularCard data (${cardsSkipped} already had cards)\n`);

	console.log("═══════════════════════════════════════════════════════════════");
	console.log("  FINALIZATION COMPLETE");
	console.log("═══════════════════════════════════════════════════════════════");
	console.log(`  📋 Adult profiles: ${processed} (${regsCreated} regs, ${formDataFilled} formData, ${docsAttached} docs)`);
	console.log(`  👶 Child profiles: ${cpProcessed} (${cpRegsCreated} regs)`);
	console.log(`  🪪 Child cards patched: ${cardsPatched}`);
	console.log(`  ⏩ Skipped: ${skipped + cpSkipped}`);
	console.log(`  ❌ Errors: ${errors + cpErrors}`);
	console.log("═══════════════════════════════════════════════════════════════");
}

main().catch(console.error);
