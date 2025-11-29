import { readFile, writeFile } from "node:fs/promises";
import { generateKeyPairSync } from "node:crypto";
import { join } from "node:path";
import { getRootPath } from "../../utils";

/**
 * Creates private and public keys for JWT, saves them in each /[app]-backend and in /entry-server
 */
export default defineEventHandler(async (event): Promise<void> => {
	const apps = await readBody<string[]>(event);
	const rootPath = getRootPath();
	const appsPath = join(rootPath, "apps");

	// Generate RSA key pair
	const { privateKey, publicKey } = generateKeyPairSync("rsa", {
		modulusLength: 3072,
		privateKeyEncoding: {
			type: "pkcs8",
			format: "pem",
		},
		publicKeyEncoding: {
			type: "spki",
			format: "pem",
		},
	});

	// Convert keys to base64 for easy storage in .env files
	const privateKeyBase64 = Buffer.from(privateKey, "utf8").toString("base64");
	const publicKeyBase64 = Buffer.from(publicKey, "utf8").toString("base64");
	let envContent: string;

	// Save to backend of each app
	for (const appId of apps) {
		const rootAppPath = join(appsPath, appId, `${appId}-backend`);
		const envDevPath = join(rootAppPath, ".env.development");
		const envProdPath = join(rootAppPath, ".env.production");

		// Dev
		envContent = await readFile(envDevPath, "utf-8");
		envContent = envContent.replace(
			/JWT_PUBLIC_KEY=.*/g,
			`JWT_PUBLIC_KEY=${publicKeyBase64}`
		);

		if (appId === "auth") {
			envContent = envContent.replace(
				/JWT_PRIVATE_KEY=.*/g,
				`JWT_PRIVATE_KEY=${privateKeyBase64}`
			);
		}

		await writeFile(envDevPath, envContent, "utf-8");

		// Prod
		envContent = await readFile(envProdPath, "utf-8");
		envContent = envContent.replace(
			/JWT_PUBLIC_KEY=.*/g,
			`JWT_PUBLIC_KEY=${publicKeyBase64}`
		);

		if (appId === "auth") {
			envContent = envContent.replace(
				/JWT_PRIVATE_KEY=.*/g,
				`JWT_PRIVATE_KEY=${privateKeyBase64}`
			);
		}

		await writeFile(envProdPath, envContent, "utf-8");
	}

	// Save to /entry-server
	const entryServerPath = join(rootPath, "entry-server");
	const entryEnvDevPath = join(entryServerPath, ".env.development");
	const entryEnvProdPath = join(entryServerPath, ".env.production");

	// Dev
	envContent = await readFile(entryEnvDevPath, "utf-8");
	envContent = envContent
		.replace(/JWT_PUBLIC_KEY=.*/g, `JWT_PUBLIC_KEY=${publicKeyBase64}`)
		.replace(/JWT_PRIVATE_KEY=.*/g, `JWT_PRIVATE_KEY=${privateKeyBase64}`);
	await writeFile(entryEnvDevPath, envContent, "utf-8");

	// Prod
	envContent = await readFile(entryEnvProdPath, "utf-8");
	envContent = envContent
		.replace(/JWT_PUBLIC_KEY=.*/g, `JWT_PUBLIC_KEY=${publicKeyBase64}`)
		.replace(/JWT_PRIVATE_KEY=.*/g, `JWT_PRIVATE_KEY=${privateKeyBase64}`);
	await writeFile(entryEnvProdPath, envContent, "utf-8");
});
