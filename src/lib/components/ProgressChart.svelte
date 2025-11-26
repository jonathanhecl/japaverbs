<script lang="ts">
	import type { DailyProgress } from '$lib/stores/userProgress';

	let { history = [] }: { history: DailyProgress[] } = $props();

	// Configuración del gráfico
	const daysToShow = 14;
	const height = 200;
	const padding = { top: 20, right: 10, bottom: 30, left: 10 };
	const barWidth = 8;
	const gap = 4;

	// Preparar datos (últimos N días, rellenando huecos si es necesario o mostrando solo días con actividad)
	// Para simplificar, mostraremos los últimos N días del historial disponible
	const chartData = $derived(history.slice(-daysToShow));

	// Escalas
	const maxQuestions = $derived(Math.max(...chartData.map((d) => d.totalQuestions), 10));

	function getX(index: number, total: number) {
		const availableWidth = 100; // Porcentaje
		const step = availableWidth / total;
		return index * step + step / 2;
	}

	function getY(value: number, max: number) {
		return height - padding.bottom - (value / max) * (height - padding.top - padding.bottom);
	}

	// Generar path para la línea de precisión
	const accuracyPath = $derived(() => {
		if (chartData.length < 2) return '';

		const points = chartData.map((d, i) => {
			const xPercent = getX(i, chartData.length);
			const accuracy = d.totalQuestions > 0 ? d.correctAnswers / d.totalQuestions : 0;
			// Escalar precisión (0-1) a altura del gráfico
			// Usamos el 100% de altura para 100% de precisión
			const y = height - padding.bottom - accuracy * (height - padding.top - padding.bottom);
			return `${xPercent},${y}`; // x en %, y en px. Wait, mixing units is tricky in SVG path.
			// Let's use 100% width for SVG and coordinate system 0-100 for X
		});

		// To make it work with responsive width, we need a fixed coordinate system or percentages.
		// SVG viewBox="0 0 100 200" (preserveAspectRatio="none") allows stretching X.
		return `M ${points
			.map((p) => {
				const [x, y] = p.split(',');
				return `${x} ${y}`;
			})
			.join(' L ')}`;
	});

	// Helper para formatear fecha con Kanji
	function formatDate(dateStr: string) {
		const date = new Date(dateStr);
		// Días de la semana en Kanji: Domingo (0) a Sábado (6)
		const kanjiDays = ['日', '月', '火', '水', '木', '金', '土'];
		const dayOfWeek = kanjiDays[date.getDay()];
		const dayOfMonth = date.getDate();
		return `${dayOfWeek} ${dayOfMonth}`;
	}
</script>

<div class="relative h-[240px] w-full select-none">
	{#if chartData.length === 0}
		<div class="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
			No hay datos suficientes para mostrar el gráfico
		</div>
	{:else}
		<!-- SVG Container -->
		<svg
			class="h-full w-full overflow-visible"
			viewBox="0 0 100 {height}"
			preserveAspectRatio="none"
		>
			<!-- Grid Lines (Horizontal) -->
			{#each [0, 0.25, 0.5, 0.75, 1] as tick}
				{@const y = height - padding.bottom - tick * (height - padding.top - padding.bottom)}
				<line
					x1="0"
					y1={y}
					x2="100"
					y2={y}
					stroke="currentColor"
					class="text-slate-800"
					stroke-width="0.5"
					stroke-dasharray="2 2"
				/>
			{/each}

			<!-- Bars (Questions) -->
			{#each chartData as day, i}
				{@const x = getX(i, chartData.length)}
				{@const barHeight =
					(day.totalQuestions / maxQuestions) * (height - padding.top - padding.bottom)}
				{@const y = height - padding.bottom - barHeight}
				{@const widthPercent = (100 / chartData.length) * 0.6}

				<g class="group">
					<!-- Bar -->
					<rect
						x={x - widthPercent / 2}
						{y}
						width={widthPercent}
						height={barHeight}
						rx="2"
						class="fill-indigo-500/50 transition-all group-hover:fill-indigo-400"
					/>

					<!-- Tooltip Area (Invisible rect for better hover target) -->
					<rect
						x={x - 100 / chartData.length / 2}
						y="0"
						width={100 / chartData.length}
						{height}
						fill="transparent"
						class="cursor-crosshair"
					>
						<title
							>{new Date(day.date).toLocaleDateString()}
							Preguntas: {day.totalQuestions}
							Correctas: {day.correctAnswers}
							Precisión: {day.totalQuestions > 0
								? Math.round((day.correctAnswers / day.totalQuestions) * 100)
								: 0}%</title
						>
					</rect>
				</g>
			{/each}

			<!-- Accuracy Line -->
			<path
				d={accuracyPath()}
				fill="none"
				stroke="currentColor"
				class="text-green-400"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				vector-effect="non-scaling-stroke"
			/>

			<!-- Accuracy Dots -->
			{#each chartData as day, i}
				{@const x = getX(i, chartData.length)}
				{@const accuracy = day.totalQuestions > 0 ? day.correctAnswers / day.totalQuestions : 0}
				{@const y = height - padding.bottom - accuracy * (height - padding.top - padding.bottom)}

				<circle
					cx={x}
					cy={y}
					r="1.5"
					class="fill-slate-900 stroke-green-400"
					stroke-width="1"
					vector-effect="non-scaling-stroke"
				/>
			{/each}
		</svg>

		<!-- X Axis Labels (HTML overlay for better text rendering) -->
		<div
			class="absolute right-0 bottom-0 left-0 flex justify-between px-[2%] text-[10px] text-slate-500"
		>
			{#each chartData as day}
				<div class="flex-1 truncate text-center">
					{formatDate(day.date)}
				</div>
			{/each}
		</div>

		<!-- Legend -->
		<div class="absolute top-0 right-0 flex gap-3 text-[10px]">
			<div class="flex items-center gap-1">
				<div class="h-2 w-2 rounded-sm bg-indigo-500/50"></div>
				<span class="text-slate-400">Preguntas</span>
			</div>
			<div class="flex items-center gap-1">
				<div class="h-0.5 w-2 bg-green-400"></div>
				<span class="text-slate-400">Precisión</span>
			</div>
		</div>
	{/if}
</div>
