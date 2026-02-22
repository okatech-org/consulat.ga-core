/**
 * Standalone Node.js HTTP server for TanStack Start.
 *
 * TanStack Start exports a WinterCG-compatible `fetch()` handler.
 * This wrapper creates a standard Node.js HTTP server that:
 * 1. Serves static files from dist/client/ (assets, images, videos, etc.)
 * 2. Falls back to the TanStack Start fetch() handler for SSR
 */

import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import server from "./server.js";

const CLIENT_DIR = join(process.cwd(), "dist", "client");

const port = parseInt(process.env.PORT || "3000", 10);

// MIME type mapping
const MIME_TYPES = {
	".html": "text/html; charset=utf-8",
	".js": "application/javascript; charset=utf-8",
	".mjs": "application/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".webp": "image/webp",
	".avif": "image/avif",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".ttf": "font/ttf",
	".otf": "font/otf",
	".mp4": "video/mp4",
	".webm": "video/webm",
	".mp3": "audio/mpeg",
	".wav": "audio/wav",
	".txt": "text/plain",
	".xml": "application/xml",
	".webmanifest": "application/manifest+json",
	".map": "application/json",
};

/**
 * Try to serve a static file from dist/client/.
 * Returns true if the file was served, false otherwise.
 */
async function tryServeStatic(req, res) {
	const url = new URL(req.url || "/", "http://localhost");
	const pathname = decodeURIComponent(url.pathname);

	// Prevent directory traversal
	if (pathname.includes("..")) return false;

	const filePath = join(CLIENT_DIR, pathname);

	try {
		const fileStat = await stat(filePath);
		if (!fileStat.isFile()) return false;

		const ext = extname(filePath).toLowerCase();
		const contentType = MIME_TYPES[ext] || "application/octet-stream";
		const data = await readFile(filePath);

		// Hashed assets get long cache, everything else gets short cache
		const isHashed =
			pathname.startsWith("/assets/") && /[-.][\da-f]{8,}\./.test(pathname);
		const cacheControl = isHashed
			? "public, max-age=31536000, immutable"
			: "public, max-age=3600";

		res.writeHead(200, {
			"Content-Type": contentType,
			"Content-Length": data.byteLength,
			"Cache-Control": cacheControl,
		});
		res.end(data);
		return true;
	} catch {
		return false;
	}
}

const httpServer = createServer(async (req, res) => {
	try {
		// 1. Try static files first
		if (await tryServeStatic(req, res)) return;

		// 2. Fall back to TanStack Start SSR handler
		const protocol = req.headers["x-forwarded-proto"] || "http";
		const host =
			req.headers["x-forwarded-host"] || req.headers.host || "localhost";
		const url = new URL(req.url || "/", `${protocol}://${host}`);

		// Collect body for non-GET/HEAD requests
		let body = undefined;
		if (req.method !== "GET" && req.method !== "HEAD") {
			const chunks = [];
			for await (const chunk of req) {
				chunks.push(chunk);
			}
			body = Buffer.concat(chunks);
		}

		// Convert Node.js headers to Headers
		const headers = new Headers();
		for (const [key, value] of Object.entries(req.headers)) {
			if (value) {
				if (Array.isArray(value)) {
					for (const v of value) headers.append(key, v);
				} else {
					headers.set(key, value);
				}
			}
		}

		const request = new Request(url.toString(), {
			method: req.method,
			headers,
			body,
			duplex: body ? "half" : undefined,
		});

		const response = await server.fetch(request);

		// Write status and headers
		const responseHeaders = {};
		response.headers.forEach((value, key) => {
			responseHeaders[key] = value;
		});
		res.writeHead(response.status, responseHeaders);

		// Stream the response body
		if (response.body) {
			const reader = response.body.getReader();
			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					res.write(value);
				}
			} finally {
				reader.releaseLock();
			}
		}

		res.end();
	} catch (error) {
		console.error("Server error:", error);
		if (!res.headersSent) {
			res.writeHead(500, { "Content-Type": "text/plain" });
		}
		res.end("Internal Server Error");
	}
});

httpServer.listen(port, "0.0.0.0", () => {
	console.log(`🚀 Consulat.ga server listening on http://0.0.0.0:${port}`);
});
