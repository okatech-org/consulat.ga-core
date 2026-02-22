#!/usr/bin/env bun
/**
 * DEDUPLICATE DOCUMENTS — Remove duplicate documents, keep oldest
 *
 * Duplicates = same ownerId + same storageId (first file in files array)
 * Keeps the document with the earliest _creationTime.
 * Before deleting, checks if any profile, childProfile, or request references
 * the duplicate doc and re-points it to the kept doc.
 *
 * Usage:
 *   env $(grep -v '^#' .env.production | xargs) bun run scripts/dedup-documents.ts
 *
 * Add --dry-run to preview without deleting:
 *   env $(grep -v '^#' .env.production | xargs) bun run scripts/dedup-documents.ts --dry-run
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.VITE_CONVEX_URL!;
if (!CONVEX_URL) { console.error("❌ VITE_CONVEX_URL is not set"); process.exit(1); }

const DRY_RUN = process.argv.includes("--dry-run");
const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
	console.log("═══════════════════════════════════════════════════════════════");
	console.log(`  DEDUPLICATE DOCUMENTS ${DRY_RUN ? "(DRY RUN)" : ""}`);
	console.log("═══════════════════════════════════════════════════════════════");
	console.log(`  Convex: ${CONVEX_URL}\n`);

	// ── Step 1: Fetch all documents in batches ──────────────────
	console.log("  📦 Fetching all documents...");
	type DocItem = { _id: string; _creationTime: number; ownerId: string; documentType?: string; firstStorageId: string | null };
	const allDocs: DocItem[] = [];
	const seenIds = new Set<string>();
	let cursor: number | undefined = undefined;

	while (true) {
		const batch = await client.query(api.migrations.getDocumentBatch, { cursor } as any) as DocItem[];
		if (batch.length === 0) break;
		for (const doc of batch) {
			if (!seenIds.has(doc._id)) {
				seenIds.add(doc._id);
				allDocs.push(doc);
			}
		}
		cursor = batch[batch.length - 1]._creationTime;
		process.stdout.write(`\r  ✅ Fetched ${allDocs.length} documents...`);
	}
	console.log(`\r  ✅ Found ${allDocs.length} documents          \n`);

	// ── Step 2: Group by dedup key (ownerId + first storageId) ──
	const groups = new Map<string, typeof allDocs>();
	for (const doc of allDocs) {
		const storageId = doc.firstStorageId || "no-file";
		const key = `${doc.ownerId}|${storageId}`;
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key)!.push(doc);
	}

	// ── Step 3: Build replacement map (deleteId → keepId) ───────
	const replaceMap = new Map<string, string>(); // oldId → newId (kept)
	const toDelete: string[] = [];
	let dupGroups = 0;

	for (const [, docs] of groups) {
		if (docs.length <= 1) continue;
		dupGroups++;
		docs.sort((a, b) => a._creationTime - b._creationTime);
		const keepId = docs[0]._id;
		for (let i = 1; i < docs.length; i++) {
			replaceMap.set(docs[i]._id, keepId);
			toDelete.push(docs[i]._id);
		}
	}

	console.log("  📊 Analysis:");
	console.log(`     Unique documents: ${groups.size}`);
	console.log(`     Duplicate groups: ${dupGroups}`);
	console.log(`     Documents to delete: ${toDelete.length}`);
	console.log(`     Documents to keep: ${allDocs.length - toDelete.length}\n`);

	if (toDelete.length === 0) {
		console.log("  ✅ No duplicates found!");
		return;
	}

	if (DRY_RUN) {
		console.log("  ⚠️  DRY RUN — showing 5 example groups:\n");
		let shown = 0;
		for (const [key, docs] of groups) {
			if (docs.length <= 1) continue;
			if (shown >= 5) break;
			shown++;
			const [ownerId, storageId] = key.split("|");
			console.log(`  Group: owner=${ownerId} storage=${storageId?.slice(0, 20)}...`);
			console.log(`    ✅ Keep:   ${docs[0]._id} (${new Date(docs[0]._creationTime).toISOString()})`);
			for (let i = 1; i < docs.length; i++) {
				console.log(`    🗑️  Delete: ${docs[i]._id} (${new Date(docs[i]._creationTime).toISOString()})`);
			}
			console.log();
		}
		console.log("  Remove --dry-run to execute.\n");
		return;
	}

	// ── Step 4: Scan & re-point references ──────────────────────
	console.log("  🔗 Scanning references...");
	let refsFixed = 0;

	// 4a. Profile documents (object: { passport: docId, ... })
	console.log("     Scanning profiles...");
	const profileRefs = await client.query(api.migrations.getAllProfileDocRefs, {} as any);
	for (const p of profileRefs) {
		const docs = p.documents as Record<string, string> | undefined;
		if (!docs) continue;
		for (const val of Object.values(docs)) {
			if (val && replaceMap.has(val)) {
				await client.mutation(api.migrations.repointDocRef, {
					table: "profiles",
					recordId: p._id,
					field: "documents",
					oldDocId: val,
					newDocId: replaceMap.get(val)!,
				} as any);
				refsFixed++;
			}
		}
	}
	console.log(`     ✅ ${profileRefs.length} profiles checked`);

	// 4b. ChildProfile documents (object: { passport: docId, ... })
	console.log("     Scanning childProfiles...");
	const childRefs = await client.query(api.migrations.getAllChildProfileDocRefs, {} as any);
	for (const cp of childRefs) {
		const docs = cp.documents as Record<string, string> | undefined;
		if (!docs) continue;
		for (const val of Object.values(docs)) {
			if (val && replaceMap.has(val)) {
				await client.mutation(api.migrations.repointDocRef, {
					table: "childProfiles",
					recordId: cp._id,
					field: "documents",
					oldDocId: val,
					newDocId: replaceMap.get(val)!,
				} as any);
				refsFixed++;
			}
		}
	}
	console.log(`     ✅ ${childRefs.length} childProfiles checked`);

	// 4c. Request documents (array: [docId, docId, ...])
	console.log("     Scanning requests...");
	const requestRefs = await client.query(api.migrations.getAllRequestDocRefs, {} as any);
	for (const r of requestRefs) {
		const docs = r.documents as string[] | undefined;
		if (!docs) continue;
		const hasOld = docs.some((id) => replaceMap.has(id));
		if (hasOld) {
			for (const id of docs) {
				if (replaceMap.has(id)) {
					await client.mutation(api.migrations.repointDocRef, {
						table: "requests",
						recordId: r._id,
						field: "documents",
						oldDocId: id,
						newDocId: replaceMap.get(id)!,
					} as any);
					refsFixed++;
				}
			}
		}
	}
	console.log(`     ✅ ${requestRefs.length} requests checked`);
	console.log(`  🔗 Fixed ${refsFixed} references\n`);

	// ── Step 5: Delete duplicates ───────────────────────────────
	console.log("  🗑️  Deleting duplicates...");
	let deleted = 0, deleteErrors = 0;

	for (const docId of toDelete) {
		try {
			await client.mutation(api.migrations.deleteDocument, { documentId: docId } as any);
			deleted++;
		} catch (err) {
			deleteErrors++;
			console.error(`  ⚠️  ${docId}: ${err}`);
		}

		if (deleted % 50 === 0 || deleted === toDelete.length) {
			process.stdout.write(`\r  📊 Progress: ${deleted}/${toDelete.length} deleted | ${deleteErrors} errors`);
		}
	}

	console.log("\n");
	console.log("═══════════════════════════════════════════════════════════════");
	console.log("  DEDUPLICATION COMPLETE");
	console.log("═══════════════════════════════════════════════════════════════");
	console.log(`  📋 Total documents: ${allDocs.length}`);
	console.log(`  🔗 References re-pointed: ${refsFixed}`);
	console.log(`  🗑️  Deleted: ${deleted}`);
	console.log(`  ✅ Remaining: ${allDocs.length - deleted}`);
	console.log(`  ❌ Errors: ${deleteErrors}`);
	console.log("═══════════════════════════════════════════════════════════════");
}

main().catch(console.error);
