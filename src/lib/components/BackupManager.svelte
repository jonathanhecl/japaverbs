<script lang="ts">
	import { userProfile } from '$lib/stores/userProgress';

	let isLoading = $state(false);
	let statusMessage = $state('');
	let statusType: 'success' | 'error' | 'info' = $state('info');
	let fileInput: HTMLInputElement;

	async function handleExport() {
		isLoading = true;
		statusMessage = '';
		
		try {
			await userProfile.downloadBackup();
			statusMessage = '✓ Backup descargado exitosamente';
			statusType = 'success';
			
			// Clear message after 3 seconds
			setTimeout(() => {
				statusMessage = '';
			}, 3000);
		} catch (error) {
			statusMessage = error instanceof Error ? error.message : 'Error al exportar';
			statusType = 'error';
		} finally {
			isLoading = false;
		}
	}

	async function handleImport(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		
		if (!file) return;
		
		isLoading = true;
		statusMessage = '';
		
		try {
			const text = await file.text();
			const data = JSON.parse(text);
			
			// Validate basic structure
			if (!data || typeof data !== 'object') {
				throw new Error('Archivo JSON inválido');
			}
			
			// Ask for confirmation before overwriting
			const currentProfile = await userProfile.getCurrentProfile();
			if (currentProfile.totalPractices > 0) {
				const confirm = window.confirm(
					'¿Estás seguro de que quieres cargar este backup? Tu progreso actual será reemplazado.'
				);
				if (!confirm) {
					statusMessage = 'Importación cancelada';
					statusType = 'info';
					input.value = '';
					isLoading = false;
					return;
				}
			}
			
			userProfile.importFromJson(data);
			statusMessage = '✓ Progreso importado exitosamente';
			statusType = 'success';
			
			// Clear message after 3 seconds
			setTimeout(() => {
				statusMessage = '';
			}, 3000);
		} catch (error) {
			statusMessage = error instanceof Error ? error.message : 'Error al importar';
			statusType = 'error';
		} finally {
			isLoading = false;
			input.value = ''; // Reset file input
		}
	}

	function triggerFileInput() {
		fileInput?.click();
	}
</script>

<section class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
	<h2 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
		<span>💾</span>
		<span>Backup de Progreso</span>
	</h2>
	
	<p class="text-sm text-slate-400 mb-4">
		Descarga tu progreso como archivo JSON para guardarlo o transferirlo a otro dispositivo.
	</p>

	<!-- Action Buttons -->
	<div class="space-y-3">
		<button
			onclick={handleExport}
			disabled={isLoading}
			class="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{#if isLoading}
				<span class="animate-spin">⏳</span>
			{:else}
				<span>📥</span>
			{/if}
			<span>Descargar backup</span>
		</button>

		<input
			type="file"
			accept=".json"
			bind:this={fileInput}
			onchange={handleImport}
			class="hidden"
		/>

		<button
			onclick={triggerFileInput}
			disabled={isLoading}
			class="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm font-medium text-indigo-300 transition-colors hover:border-indigo-500/50 hover:bg-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{#if isLoading}
				<span class="animate-spin">⏳</span>
			{:else}
				<span>📤</span>
			{/if}
			<span>Cargar backup</span>
		</button>
	</div>

	<!-- Status Message -->
	{#if statusMessage}
		<div 
			class="mt-4 rounded-lg p-3 text-sm {statusType === 'success' 
				? 'bg-green-500/10 border border-green-500/30 text-green-300' 
				: statusType === 'error' 
				? 'bg-red-500/10 border border-red-500/30 text-red-300'
				: 'bg-blue-500/10 border border-blue-500/30 text-blue-300'}"
		>
			{statusMessage}
		</div>
	{/if}

	<!-- Info Box -->
	<div class="mt-4 rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
		<p class="text-xs text-slate-400 leading-relaxed">
			<span class="font-semibold text-slate-300">💡 Consejo:</span> Guarda el archivo en un lugar seguro 
			(como tu nube personal, email, o USB) para no perder tu progreso. Puedes cargarlo en cualquier 
			dispositivo donde uses JapaVerbs.
		</p>
	</div>
</section>
