<script lang="ts">
	import { onMount } from 'svelte';
	import { userProfile, googleDriveAuth } from '$lib/stores/userProgress';

	let isAuthenticated = $state(false);
	let isLoading = $state(false);
	let statusMessage = $state('');
	let statusType: 'success' | 'error' | 'info' = $state('info');
	let showConfirmOverwrite = $state(false);
	let pendingDriveData: any = null;

	onMount(async () => {
		try {
			await googleDriveAuth.init();
			isAuthenticated = googleDriveAuth.isAuthenticated();
		} catch (error) {
			console.error('Failed to init Google Drive:', error);
		}
	});

	async function handleLogin() {
		isLoading = true;
		statusMessage = '';
		
		try {
			await googleDriveAuth.login();
			isAuthenticated = true;
			statusMessage = '✓ Sesión iniciada con Google';
			statusType = 'success';
		} catch (error) {
			statusMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
			statusType = 'error';
		} finally {
			isLoading = false;
		}
	}

	async function handleLogout() {
		isLoading = true;
		statusMessage = '';
		
		try {
			await googleDriveAuth.logout();
			isAuthenticated = false;
			statusMessage = 'Sesión cerrada';
			statusType = 'info';
		} catch (error) {
			statusMessage = 'Error al cerrar sesión';
			statusType = 'error';
		} finally {
			isLoading = false;
		}
	}

	async function handleSync() {
		isLoading = true;
		statusMessage = '';
		
		try {
			const result = await userProfile.syncWithDrive();
			statusMessage = result.message;
			statusType = result.success ? 'success' : 'error';
		} catch (error) {
			statusMessage = error instanceof Error ? error.message : 'Error al sincronizar';
			statusType = 'error';
		} finally {
			isLoading = false;
		}
	}

	async function handleLoad() {
		isLoading = true;
		statusMessage = '';
		
		try {
			const result = await userProfile.loadFromDrive();
			
			if (result.data) {
				// Local data is more recent, show confirmation
				showConfirmOverwrite = true;
				pendingDriveData = result.data;
				statusMessage = result.message;
				statusType = 'info';
			} else {
				statusMessage = result.message;
				statusType = result.success ? 'success' : 'error';
			}
		} catch (error) {
			statusMessage = error instanceof Error ? error.message : 'Error al cargar';
			statusType = 'error';
		} finally {
			isLoading = false;
		}
	}

	async function confirmOverwrite() {
		isLoading = true;
		statusMessage = '';
		showConfirmOverwrite = false;
		
		try {
			const result = await userProfile.forceLoadFromDrive();
			statusMessage = result.message;
			statusType = result.success ? 'success' : 'error';
		} catch (error) {
			statusMessage = error instanceof Error ? error.message : 'Error al cargar';
			statusType = 'error';
		} finally {
			isLoading = false;
			pendingDriveData = null;
		}
	}

	function cancelOverwrite() {
		showConfirmOverwrite = false;
		pendingDriveData = null;
		statusMessage = 'Carga cancelada. Tu progreso local se mantuvo.';
		statusType = 'info';
	}
</script>

<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
	<div class="mb-4 flex items-center gap-3">
		<svg class="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
			<path d="M6.5 13.5l-3 6L12 16l8.5 3.5-3-6L21 9l-7-1L12 2 9 8l-7 1z"/>
		</svg>
		<h3 class="text-xl font-bold text-slate-100">Sincronización con Google Drive</h3>
	</div>

	<p class="mb-6 text-sm text-slate-300">
		Guarda tu progreso en Google Drive para accederlo desde cualquier dispositivo.
	</p>

	{#if !isAuthenticated}
		<button
			onclick={handleLogin}
			disabled={isLoading}
			class="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition-all hover:bg-slate-100 disabled:opacity-50"
		>
			{#if isLoading}
				<div class="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent"></div>
				<span>Conectando...</span>
			{:else}
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
					<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
					<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
					<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
					<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
				</svg>
				<span>Iniciar sesión con Google</span>
			{/if}
		</button>
	{:else}
		<div class="space-y-3">
			<div class="flex flex-wrap gap-3">
				<button
					onclick={handleSync}
					disabled={isLoading}
					class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50"
				>
					{#if isLoading}
						<div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
					{:else}
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
						</svg>
					{/if}
					<span>Guardar en Drive</span>
				</button>

				<button
					onclick={handleLoad}
					disabled={isLoading}
					class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition-all hover:bg-green-700 disabled:opacity-50"
				>
					{#if isLoading}
						<div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
					{:else}
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
						</svg>
					{/if}
					<span>Cargar de Drive</span>
				</button>
			</div>

			<button
				onclick={handleLogout}
				disabled={isLoading}
				class="w-full rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-slate-700/50 disabled:opacity-50"
			>
				Cerrar sesión
			</button>
		</div>
	{/if}

	{#if statusMessage}
		<div
			class="mt-4 rounded-lg p-3 text-sm {statusType === 'success' ? 'bg-green-900/30 text-green-300' : statusType === 'error' ? 'bg-red-900/30 text-red-300' : 'bg-blue-900/30 text-blue-300'}"
		>
			{statusMessage}
		</div>
	{/if}

	{#if showConfirmOverwrite}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
			<div class="w-full max-w-md rounded-lg bg-slate-800 p-6 shadow-xl">
				<h4 class="mb-4 text-lg font-bold text-slate-100">
					⚠️ Confirmar sobrescritura
				</h4>
				<p class="mb-6 text-slate-300">
					Tu progreso local es más reciente que el de Google Drive. 
					¿Estás seguro que quieres reemplazarlo con los datos de Drive?
				</p>
				<div class="flex gap-3">
					<button
						onclick={cancelOverwrite}
						class="flex-1 rounded-lg border border-slate-600 px-4 py-2 font-medium text-slate-300 transition-all hover:bg-slate-700"
					>
						Cancelar
					</button>
					<button
						onclick={confirmOverwrite}
						class="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-all hover:bg-red-700"
					>
						Sobrescribir
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
