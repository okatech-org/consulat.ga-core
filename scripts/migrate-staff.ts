#!/usr/bin/env bun
/**
 * Migrate staff accounts to prod.
 * 
 * Steps:
 *   1. Lookup org by slug (verify seed data exists)
 *   2. Create Better Auth account (signup) → get authId
 *   3. Create user via insertUser mutation
 *   4. Create membership via insertMembership mutation
 * 
 * Usage:
 *   env $(cat .env.production | xargs) bun run scripts/migrate-staff.ts
 *   
 *   # Dry run:
 *   env $(cat .env.production | xargs) bun run scripts/migrate-staff.ts --dry-run
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import crypto from "crypto";

// ─── Config ────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes("--dry-run");
const CONVEX_URL = process.env.VITE_CONVEX_URL;
const SITE_URL = process.env.VITE_CONVEX_SITE_URL;
const AUTH_API = SITE_URL ? `${SITE_URL}/api/auth` : "";

if (!CONVEX_URL) {
	console.error("❌ VITE_CONVEX_URL not set. Usage: env $(cat .env.production | xargs) bun run scripts/migrate-staff.ts");
	process.exit(1);
}

if (!AUTH_API) {
	console.error("❌ VITE_CONVEX_SITE_URL not set.");
	process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

console.log(`\n═══════════════════════════════════════════════════════════`);
console.log(`  STAFF MIGRATION${DRY_RUN ? " (DRY RUN)" : ""}`);
console.log(`═══════════════════════════════════════════════════════════`);
console.log(`  Convex:   ${CONVEX_URL}`);
console.log(`  Auth API: ${AUTH_API}`);
console.log(`═══════════════════════════════════════════════════════════\n`);

// ─── Staff Data ────────────────────────────────────────────────────────────

const STAFF_BY_ORG: Record<string, Array<{ email: string; firstName: string; lastName: string; positionCode: string }>> = {
	"fr-consulat-paris": [
		{ email: "consul-general@consulatdugabon.fr", firstName: "Consul", lastName: "Général", positionCode: "consul_general" },
		{ email: "consul@consulatdugabon.fr", firstName: "Gwenaëlle", lastName: "NTSAGA", positionCode: "consul" },
		{ email: "vice-consul1@consulatdugabon.fr", firstName: "Christiane", lastName: "MOUELE", positionCode: "vice_consul" },
		{ email: "vice-consul2@consulatdugabon.fr", firstName: "Madina", lastName: "ANDJAYI KEITA", positionCode: "vice_consul" },
		{ email: "secretaire1@consulatdugabon.fr", firstName: "Léa Marcelle", lastName: "ASSEH AKORE", positionCode: "consular_agent" },
		{ email: "secretaire2@consulatdugabon.fr", firstName: "Nelly", lastName: "CALAMEPAT", positionCode: "consular_agent" },
		{ email: "secretaire3@consulatdugabon.fr", firstName: "Jacqueline", lastName: "MPEMBA", positionCode: "consular_agent" },
		{ email: "assistant-admin1@consulatdugabon.fr", firstName: "Carmel Leger", lastName: "KINGA MIHINDOU", positionCode: "consular_agent" },
		{ email: "assistant-admin2@consulatdugabon.fr", firstName: "Ray Proclèm", lastName: "NGOMONDAMI", positionCode: "consular_agent" },
		{ email: "okatech+jerome@icloud.com", firstName: "Jerome", lastName: "Agent", positionCode: "consular_agent" },
		{ email: "admin@okafrancois.dev", firstName: "Assistant", lastName: "Agent", positionCode: "consular_agent" },
		{ email: "admin+manager@okafrancois.dev", firstName: "Manager", lastName: "Test", positionCode: "consul" },
	],
	"fr-ambassade-paris": [
		{ email: "ambassadeur@ambassadedugabon.fr", firstName: "Marc", lastName: "Ngoubou", positionCode: "ambassador" },
		{ email: "agent@ambassadedugabon.fr", firstName: "Isaac", lastName: "Koumba", positionCode: "consular_agent" },
	],
	"ca-ambassade-ottawa": [
		{ email: "ambassadeur@ambagabon.ca", firstName: "Henri", lastName: "Mboumba", positionCode: "ambassador" },
		{ email: "agent@ambagabon.ca", firstName: "Éric", lastName: "Mouiri", positionCode: "consular_agent" },
	],
};

// ─── Step 1: Lookup Orgs ───────────────────────────────────────────────────

async function lookupOrg(slug: string) {
	const result = await client.query(api.migrations.lookupOrgBySlug, { slug });
	if (!result) {
		console.error(`  ❌ Org "${slug}" not found in prod!`);
		return null;
	}
	console.log(`  ✅ ${slug} → ${result.orgId} (${result.orgName})`);
	return result;
}

// ─── Step 2: Lookup Positions ──────────────────────────────────────────────

async function lookupPositions(orgId: string): Promise<Map<string, string>> {
	// We'll use the insertPosition mutation which is idempotent
	// But first let's check what positions exist
	// Actually, we just call insertPosition for each code and it returns the existing or new ID
	return new Map(); // will be populated as we go
}

// ─── Step 3: Create Auth + User + Membership ──────────────────────────────

async function createStaffMember(
	account: { email: string; firstName: string; lastName: string; positionCode: string },
	orgId: string,
	positionId: string | undefined,
) {
	const name = `${account.firstName} ${account.lastName}`;
	
	// 1. Create Better Auth account
	console.log(`\n  📧 ${account.email} (${name})`);
	
	let authId: string | undefined;
	
	if (!DRY_RUN) {
		try {
			const password = crypto.randomUUID();
			const res = await fetch(`${AUTH_API}/sign-up/email`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: account.email, password, name }),
			});

			const data = await res.json() as { user?: { id: string }; error?: { message: string } };

			if (data.user?.id) {
				authId = data.user.id;
				console.log(`     🔐 Auth created: ${authId}`);
			} else if (data.error?.message?.includes("already") || res.status === 422) {
				console.log(`     ⏭️  Auth already exists`);
				// We need the authId — query users table by email
				// The user might already exist in the app too
			} else {
				console.error(`     ❌ Auth error: ${JSON.stringify(data)}`);
				return;
			}
		} catch (err) {
			console.error(`     ❌ Auth fetch error: ${err}`);
			return;
		}
	} else {
		console.log(`     🔐 [DRY RUN] Would create auth`);
		authId = `dry-run-${account.email}`;
	}

	// 2. Create user
	if (!authId) {
		// Auth existed already. Check if user exists in app.
		// We still need to ensure the membership exists.
		// Try creating the user — insertUser is idempotent (checks by email)
		console.log(`     ℹ️  Auth existed — attempting user creation with placeholder authId`);
		// Actually, we can't create without authId. Let's skip user creation if auth already exists.
		// The user will be created on first login via ensureUser.
		console.log(`     ⚠️  Skipping user creation (will be created on first login)`);
		return;
	}

	if (!DRY_RUN) {
		try {
			const userId = await client.mutation(api.migrations.insertUser, {
				authId,
				email: account.email,
				name,
				firstName: account.firstName,
				lastName: account.lastName,
				isActive: true,
				isSuperadmin: false,
			});
			console.log(`     👤 User: ${userId}`);

			// 3. Create membership
			const membershipId = await client.mutation(api.migrations.insertMembership, {
				userId: userId as string,
				orgId,
				positionId,
			});
			console.log(`     🏛️  Membership: ${membershipId}`);
		} catch (err) {
			console.error(`     ❌ User/Membership error: ${err}`);
		}
	} else {
		console.log(`     👤 [DRY RUN] Would create user + membership`);
	}
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
	let totalCreated = 0;
	let totalSkipped = 0;

	for (const [slug, accounts] of Object.entries(STAFF_BY_ORG)) {
		console.log(`\n🏛️  Org: ${slug}`);
		console.log(`${"─".repeat(50)}`);

		// 1. Lookup org
		const orgResult = await lookupOrg(slug);
		if (!orgResult) {
			console.log(`  ⏭️  Skipping ${slug} (not found)`);
			totalSkipped += accounts.length;
			continue;
		}

		// 2. Get positions for this org
		const positionCodes = [...new Set(accounts.map(a => a.positionCode))];
		const positionMap = new Map<string, string>();

		for (const code of positionCodes) {
			// Lookup position by querying
			// The positions should already be seeded
			if (!DRY_RUN) {
				const posId = await client.mutation(api.migrations.insertPosition, {
					orgId: orgResult.orgId as string,
					code,
					title: { fr: code.replace(/_/g, " "), en: code.replace(/_/g, " ") },
					level: code === "consul_general" ? 1 : code === "ambassador" ? 1 : code === "consul" ? 2 : code === "vice_consul" ? 3 : 4,
					grade: code === "consul_general" || code === "ambassador" ? "A" : code === "consul" ? "A" : code === "vice_consul" ? "B" : "C",
					isActive: true,
				});
				positionMap.set(code, posId as string);
				console.log(`  📋 Position ${code} → ${posId}`);
			} else {
				console.log(`  📋 [DRY RUN] Position ${code}`);
			}
		}

		// 3. Create each staff member
		for (const account of accounts) {
			await createStaffMember(
				account,
				orgResult.orgId as string,
				positionMap.get(account.positionCode),
			);
			totalCreated++;
			
			// Small delay to avoid rate limiting
			await new Promise(r => setTimeout(r, 200));
		}
	}

	console.log(`\n═══════════════════════════════════════════════════════════`);
	console.log(`  STAFF MIGRATION COMPLETE${DRY_RUN ? " (DRY RUN)" : ""}`);
	console.log(`═══════════════════════════════════════════════════════════`);
	console.log(`  Created: ${totalCreated}`);
	console.log(`  Skipped: ${totalSkipped}`);
	console.log(`═══════════════════════════════════════════════════════════\n`);
}

main().catch((err) => {
	console.error("❌ Fatal:", err);
	process.exit(1);
});
