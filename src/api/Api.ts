import type { NitroFetchRequest, NitroFetchOptions } from "nitropack";

export interface ApiOptions extends NitroFetchOptions<NitroFetchRequest> {
	server?: boolean;
	lazy?: boolean;
}

/**
 * API wrapper around $fetch to set common options
 */
export class Api {
	static request<T>(url: NitroFetchRequest, options: ApiOptions = {}) {
		const config = useRuntimeConfig();

		return $fetch<T>("/api" + url, {
			// Can be overridden per request
			lazy: true,
			server: false,
			// Options
			...options,
			// Defaults
			baseURL: config.public.apiBase,
			headers: {
				...options.headers,
				"X-Requested-With": "XMLHttpRequest",
			},
		});
	}

	static get<T>(url: NitroFetchRequest, options: ApiOptions = {}) {
		return this.request<T>(url, {
			...options,
			method: "GET",
		});
	}

	static post<T>(url: NitroFetchRequest, options: ApiOptions = {}) {
		return this.request<T>(url, {
			...options,
			method: "POST",
		});
	}

	static put<T>(url: NitroFetchRequest, options: ApiOptions = {}) {
		return this.request<T>(url, {
			...options,
			method: "PUT",
		});
	}

	static patch<T>(url: NitroFetchRequest, options: ApiOptions = {}) {
		return this.request<T>(url, {
			...options,
			method: "PATCH",
		});
	}

	static delete<T>(url: NitroFetchRequest, options: ApiOptions = {}) {
		return this.request<T>(url, {
			...options,
			method: "DELETE",
		});
	}
}
