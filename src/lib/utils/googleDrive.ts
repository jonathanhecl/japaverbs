import { browser } from '$app/environment';
import type { UserProfile } from '$lib/stores/userProgress';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const APP_FOLDER_NAME = 'JapaVerbs';
const PROGRESS_FILE_NAME = 'user-progress.json';
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata';

// Types
interface GoogleAuthResponse {
	access_token: string;
	expires_in: number;
	token_type: string;
}

interface DriveFile {
	id: string;
	name: string;
	mimeType: string;
}

interface DriveListResponse {
	files: DriveFile[];
}

let tokenClient: any = null;
let accessToken: string | null = null;

/**
 * Initialize Google OAuth2 token client
 */
export function initGoogleDrive(): Promise<void> {
	return new Promise((resolve, reject) => {
		if (!browser) {
			reject(new Error('Google Drive can only be initialized in browser'));
			return;
		}

		if (!GOOGLE_CLIENT_ID) {
			reject(new Error('Google Client ID not configured'));
			return;
		}

		// Load Google Identity Services
		const script = document.createElement('script');
		script.src = 'https://accounts.google.com/gsi/client';
		script.async = true;
		script.defer = true;
		script.onload = () => {
			if (typeof google !== 'undefined') {
				resolve();
			} else {
				reject(new Error('Google Identity Services failed to load'));
			}
		};
		script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
		document.head.appendChild(script);
	});
}

/**
 * Request Google OAuth token
 */
export function requestGoogleAuth(): Promise<string> {
	return new Promise((resolve, reject) => {
		if (!browser || typeof google === 'undefined') {
			reject(new Error('Google Identity Services not available'));
			return;
		}

		tokenClient = google.accounts.oauth2.initTokenClient({
			client_id: GOOGLE_CLIENT_ID,
			scope: SCOPES,
			callback: (response: GoogleAuthResponse) => {
				if (response.access_token) {
					accessToken = response.access_token;
					// Store token with expiration
					const expiresAt = Date.now() + response.expires_in * 1000;
					localStorage.setItem('gdrive_token', accessToken);
					localStorage.setItem('gdrive_token_expires', expiresAt.toString());
					resolve(accessToken);
				} else {
					reject(new Error('Failed to obtain access token'));
				}
			},
			error_callback: (error: any) => {
				reject(new Error(error?.message || 'Authentication failed'));
			}
		});

		tokenClient.requestAccessToken();
	});
}

/**
 * Get valid access token (from memory or storage)
 */
async function getAccessToken(): Promise<string> {
	if (accessToken) {
		return accessToken;
	}

	// Check if we have a stored token
	if (browser) {
		const stored = localStorage.getItem('gdrive_token');
		const expires = localStorage.getItem('gdrive_token_expires');
		
		if (stored && expires && Date.now() < parseInt(expires)) {
			accessToken = stored;
			return stored;
		}
	}

	// Need to request new token
	return requestGoogleAuth();
}

/**
 * Revoke Google OAuth token
 */
export async function revokeGoogleAuth(): Promise<void> {
	if (accessToken) {
		try {
			await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
				method: 'POST',
			});
		} catch (error) {
			console.error('Failed to revoke token:', error);
		}
		
		accessToken = null;
		if (browser) {
			localStorage.removeItem('gdrive_token');
			localStorage.removeItem('gdrive_token_expires');
		}
	}
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
	if (!browser) return false;
	
	const token = localStorage.getItem('gdrive_token');
	const expires = localStorage.getItem('gdrive_token_expires');
	
	if (!token || !expires) return false;
	
	return Date.now() < parseInt(expires);
}

/**
 * Find or create app folder in Google Drive
 */
async function getAppFolderId(): Promise<string> {
	const token = await getAccessToken();

	// Search for existing folder
	const searchResponse = await fetch(
		`https://www.googleapis.com/drive/v3/files?q=name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&spaces=drive`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!searchResponse.ok) {
		throw new Error('Failed to search for app folder');
	}

	const searchData: DriveListResponse = await searchResponse.json();

	if (searchData.files && searchData.files.length > 0) {
		return searchData.files[0].id;
	}

	// Create folder if it doesn't exist
	const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			name: APP_FOLDER_NAME,
			mimeType: 'application/vnd.google-apps.folder',
		}),
	});

	if (!createResponse.ok) {
		throw new Error('Failed to create app folder');
	}

	const folderData = await createResponse.json();
	return folderData.id;
}

/**
 * Find progress file in app folder
 */
async function findProgressFile(folderId: string): Promise<string | null> {
	const token = await getAccessToken();

	const searchResponse = await fetch(
		`https://www.googleapis.com/drive/v3/files?q=name='${PROGRESS_FILE_NAME}' and '${folderId}' in parents and trashed=false&spaces=drive`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!searchResponse.ok) {
		return null;
	}

	const searchData: DriveListResponse = await searchResponse.json();

	if (searchData.files && searchData.files.length > 0) {
		return searchData.files[0].id;
	}

	return null;
}

/**
 * Save user progress to Google Drive
 */
export async function saveProgressToDrive(profile: UserProfile): Promise<void> {
	const token = await getAccessToken();
	const folderId = await getAppFolderId();
	const existingFileId = await findProgressFile(folderId);

	const progressData = JSON.stringify(profile, null, 2);
	const blob = new Blob([progressData], { type: 'application/json' });

	const metadata = {
		name: PROGRESS_FILE_NAME,
		mimeType: 'application/json',
		parents: [folderId],
	};

	const form = new FormData();
	form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
	form.append('file', blob);

	const url = existingFileId
		? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
		: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

	const method = existingFileId ? 'PATCH' : 'POST';

	const response = await fetch(url, {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: form,
	});

	if (!response.ok) {
		throw new Error('Failed to save progress to Drive');
	}
}

/**
 * Load user progress from Google Drive
 */
export async function loadProgressFromDrive(): Promise<UserProfile | null> {
	const token = await getAccessToken();
	const folderId = await getAppFolderId();
	const fileId = await findProgressFile(folderId);

	if (!fileId) {
		return null;
	}

	const response = await fetch(
		`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) {
		throw new Error('Failed to load progress from Drive');
	}

	const data = await response.json();
	return data as UserProfile;
}

/**
 * Delete progress file from Google Drive
 */
export async function deleteProgressFromDrive(): Promise<void> {
	const token = await getAccessToken();
	const folderId = await getAppFolderId();
	const fileId = await findProgressFile(folderId);

	if (!fileId) {
		return; // Nothing to delete
	}

	const response = await fetch(
		`https://www.googleapis.com/drive/v3/files/${fileId}`,
		{
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) {
		throw new Error('Failed to delete progress from Drive');
	}
}
