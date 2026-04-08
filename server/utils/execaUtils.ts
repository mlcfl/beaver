import { $ } from "execa";

/**
 * Decodes a Buffer from Windows cp866 (used by cmd.exe) or falls back to UTF-8.
 * When execa runs through cmd.exe on Windows, stderr bytes are in cp866.
 */
function decodeBuffer(buf: Buffer | string | undefined): string {
	if (!buf) {
		return "";
	}

	if (typeof buf === "string") {
		return buf;
	}

	if (process.platform === "win32") {
		try {
			return new TextDecoder("ibm866").decode(buf);
		} catch {
			// ibm866 not available in this Node build
		}
	}

	return buf.toString("utf8");
}

/**
 * Extracts a readable error message from an execa error caught when
 * using $({ encoding: 'buffer' }).
 *
 * Handles:
 * - ENOENT: command binary not found by Node spawn
 * - cmd.exe "not recognized" in any language (garbled cp866 decoded properly)
 */
export function execaMessage(cmd: string, e: unknown): string {
	const err = e as {
		code?: string;
		cause?: { code?: string };
		stderr?: Buffer | string;
		stdout?: Buffer | string;
		message?: string;
	};

	if (err.code === "ENOENT" || err.cause?.code === "ENOENT") {
		return `${cmd}: command not found. Make sure it is installed and added to PATH.`;
	}

	if (err.code === "EACCES" || err.cause?.code === "EACCES") {
		return `${cmd}: permission denied. Try running Beaver as administrator.`;
	}

	const msg =
		decodeBuffer(err.stderr).trim() ||
		decodeBuffer(err.stdout).trim() ||
		err.message ||
		String(e);

	return msg;
}

/**
 * Pre-configured execa $ with encoding: 'buffer' so stderr/stdout are raw
 * Buffers. Required for correct cp866 decoding on Windows.
 */
export const $buf = $({ encoding: "buffer" });
