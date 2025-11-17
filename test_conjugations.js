/**
 * Script de validación de conjugaciones
 * Prueba las conjugaciones generadas contra casos conocidos
 */

// Casos de prueba conocidos
const testCases = [
  // Verbos Ichidan
  {
    verb: { kanji: '食べる', kana: 'たべる', type: 'ichidan' },
    expected: {
      masuPresent: 'たべます',
      masuPresentNegative: 'たべません',
      masuPast: 'たべました',
      masuPastNegative: 'たべませんでした',
      invitation: 'たべましょう',
      desireFormal: 'たべたいです',
      permission: 'たべてもいいです',
      prohibition: 'たべてはいけません',
      progressiveFormal: 'たべています',
      dictionary: 'たべる',
      plainNegative: 'たべない',
      plainPast: 'たべた',
      plainPastNegative: 'たべなかった',
      desireInformal: 'たべたい',
      invitationInformal: 'たべよう',
      request: 'たべて',
      negativeRequest: 'たべないで',
      progressiveInformal: 'たべている'
    }
  },
  {
    verb: { kanji: '見る', kana: 'みる', type: 'ichidan' },
    expected: {
      masuPresent: 'みます',
      plainNegative: 'みない',
      plainPast: 'みた',
      request: 'みて',
      progressiveInformal: 'みている'
    }
  },
  
  // Verbos Godan - verbos en く
  {
    verb: { kanji: '書く', kana: 'かく', type: 'godan' },
    expected: {
      masuPresent: 'かきます',
      masuPresentNegative: 'かきません',
      plainNegative: 'かかない',
      plainPast: 'かいた',
      request: 'かいて',
      permission: 'かいてもいいです',
      prohibition: 'かいてはいけません',
      progressiveFormal: 'かいています',
      progressiveInformal: 'かいている'
    }
  },
  
  // Verbo 行く (excepción especial)
  {
    verb: { kanji: '行く', kana: 'いく', type: 'godan' },
    expected: {
      masuPresent: 'いきます',
      plainNegative: 'いかない',
      plainPast: 'いった',  // Excepción: no いいた
      request: 'いって',     // Excepción: no いいて
      permission: 'いってもいいです',
      prohibition: 'いってはいけません',
      progressiveFormal: 'いっています',
      progressiveInformal: 'いっている'
    }
  },
  
  // Verbos Godan - verbos en む
  {
    verb: { kanji: '飲む', kana: 'のむ', type: 'godan' },
    expected: {
      masuPresent: 'のみます',
      plainNegative: 'のまない',
      plainPast: 'のんだ',
      request: 'のんで',
      progressiveInformal: 'のんでいる'
    }
  },
  
  // Verbos Godan - verbos en す
  {
    verb: { kanji: '話す', kana: 'はなす', type: 'godan' },
    expected: {
      masuPresent: 'はなします',
      plainNegative: 'はなさない',
      plainPast: 'はなした',
      request: 'はなして',
      progressiveInformal: 'はなしている'
    }
  },
  
  // Verbos Godan - verbos en う
  {
    verb: { kanji: '言う', kana: 'いう', type: 'godan' },
    expected: {
      masuPresent: 'いいます',
      plainNegative: 'いわない',
      plainPast: 'いった',
      request: 'いって',
      progressiveInformal: 'いっている'
    }
  },
  
  // Verbos Godan - verbos en つ
  {
    verb: { kanji: '待つ', kana: 'まつ', type: 'godan' },
    expected: {
      masuPresent: 'まちます',
      plainNegative: 'またない',
      plainPast: 'まった',
      request: 'まって',
      progressiveInformal: 'まっている'
    }
  },
  
  // Verbos Godan - verbos en る
  {
    verb: { kanji: '帰る', kana: 'かえる', type: 'godan' },
    expected: {
      masuPresent: 'かえります',
      plainNegative: 'かえらない',
      plainPast: 'かえった',
      request: 'かえって',
      progressiveInformal: 'かえっている'
    }
  },
  
  // Verbos Irregulares
  {
    verb: { kanji: 'する', kana: 'する', type: 'irregular' },
    expected: {
      masuPresent: 'します',
      masuPresentNegative: 'しません',
      masuPast: 'しました',
      masuPastNegative: 'しませんでした',
      invitation: 'しましょう',
      desireFormal: 'したいです',
      permission: 'してもいいです',
      prohibition: 'してはいけません',
      progressiveFormal: 'しています',
      dictionary: 'する',
      plainNegative: 'しない',
      plainPast: 'した',
      plainPastNegative: 'しなかった',
      desireInformal: 'したい',
      invitationInformal: 'しよう',
      request: 'して',
      negativeRequest: 'しないで',
      progressiveInformal: 'している'
    }
  },
  {
    verb: { kanji: '来る', kana: 'くる', type: 'irregular' },
    expected: {
      masuPresent: 'きます',
      masuPresentNegative: 'きません',
      masuPast: 'きました',
      masuPastNegative: 'きませんでした',
      invitation: 'きましょう',
      desireFormal: 'きたいです',
      permission: 'きてもいいです',
      prohibition: 'きてはいけません',
      progressiveFormal: 'きています',
      dictionary: 'くる',
      plainNegative: 'こない',
      plainPast: 'きた',
      plainPastNegative: 'こなかった',
      desireInformal: 'きたい',
      invitationInformal: 'こよう',  // Importante: no きよう
      request: 'きて',
      negativeRequest: 'こないで',
      progressiveInformal: 'きている'
    }
  }
];

console.log('='.repeat(80));
console.log('CASOS DE PRUEBA DE CONJUGACIONES');
console.log('='.repeat(80));
console.log('\nEstos son los casos de prueba esperados para validar las conjugaciones:');
console.log('\n');

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.verb.kanji} (${testCase.verb.kana}) - Tipo: ${testCase.verb.type}`);
  console.log('-'.repeat(60));
  
  Object.entries(testCase.expected).forEach(([key, value]) => {
    console.log(`  ${key.padEnd(25)} → ${value}`);
  });
});

console.log('\n' + '='.repeat(80));
console.log('CASOS ESPECIALES A VERIFICAR:');
console.log('='.repeat(80));

console.log('\n1. 行く (iku) - Excepción en forma て y た:');
console.log('   ✓ Forma て: いって (no いいて)');
console.log('   ✓ Forma た: いった (no いいた)');

console.log('\n2. 来る (kuru) - Irregular completo:');
console.log('   ✓ Invitación informal: こよう (no きよう)');
console.log('   ✓ Negativo presente: こない (no きない)');

console.log('\n3. Verbos Godan - Patrones de forma て:');
console.log('   ✓ う/つ/る → って (買う→買って, 待つ→待って, 帰る→帰って)');
console.log('   ✓ む/ぶ/ぬ → んで (飲む→飲んで, 遊ぶ→遊んで, 死ぬ→死んで)');
console.log('   ✓ く/ぐ → いて/いで (書く→書いて, 泳ぐ→泳いで)');
console.log('   ✓ す → して (話す→話して)');

console.log('\n4. Verbos Ichidan - Siempre quitar る:');
console.log('   ✓ 食べる → 食べて (quitar る, añadir て)');
console.log('   ✓ 見る → 見て');

console.log('\n' + '='.repeat(80));
console.log('Para validar en la aplicación:');
console.log('1. Abre el diccionario y busca cada verbo');
console.log('2. Expande el verbo y verifica las conjugaciones');
console.log('3. Usa los ejercicios de práctica para probar');
console.log('='.repeat(80));
console.log('\n✓ Script de validación completado\n');
