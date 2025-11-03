// Script de prueba para verificar la función getLocalDateString
// Este script demuestra la diferencia entre UTC y la fecha local

function getLocalDateString(date = new Date()) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function testDateFunctions() {
	console.log('=== Prueba de funciones de fecha ===');
	
	// Fecha actual
	const now = new Date();
	console.log('Fecha y hora actual:', now.toString());
	console.log('Fecha UTC (toISOString().split):', now.toISOString().split('T')[0]);
	console.log('Fecha local (getLocalDateString):', getLocalDateString());
	console.log('¿Son diferentes?', now.toISOString().split('T')[0] !== getLocalDateString());
	
	// Prueba con una fecha específica que cruza medianoche en UTC
	const testDate = new Date('2025-01-15T02:30:00Z'); // 2:30 AM UTC
	console.log('\n--- Fecha de prueba: 2:30 AM UTC ---');
	console.log('Fecha y hora completa:', testDate.toString());
	console.log('Fecha UTC:', testDate.toISOString().split('T')[0]);
	console.log('Fecha local:', getLocalDateString(testDate));
	
	// Prueba con diferentes husos horarios simulados
	console.log('\n--- Simulación de diferentes husos horarios ---');
	
	// Si estás en UTC-5 (ej. México, Colombia)
	const utcMinus5 = new Date('2025-01-15T02:30:00Z');
	console.log('En UTC-5 (América):', utcMinus5.toString());
	console.log('Fecha local UTC-5:', getLocalDateString(utcMinus5));
	
	// Si estás en UTC+3 (ej. Moscú)
	const utcPlus3 = new Date('2025-01-15T02:30:00Z');
	console.log('En UTC+3 (Europa):', utcPlus3.toString());
	console.log('Fecha local UTC+3:', getLocalDateString(utcPlus3));
	
	console.log('\n=== Conclusión ===');
	console.log('La función getLocalDateString siempre usa la zona horaria del cliente,');
	console.log('mientras que toISOString().split() siempre usa UTC.');
	console.log('Esto asegura que el progreso se guarde en el día correcto para el usuario.');
}

// Ejecutar la prueba
testDateFunctions();
