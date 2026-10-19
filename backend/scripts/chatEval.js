'use strict';
/**
 * Evaluación offline de la recuperación (RAG): no usa el LLM ni la base de datos.
 * Uso: node backend/scripts/chatEval.js
 * Cada caso indica en qué archivo debe aparecer la respuesta. "null" = fuera de dominio
 * (el bot no debe encontrar contexto relevante y debe declinar).
 */
const { search, stats } = require('../src/services/knowledgeService');

const CASES = [
  ['¿Qué es FisioMathBot?', '01_proyecto_fisiomathbot.md'],
  ['¿Quiénes desarrollan el proyecto?', '01_proyecto_fisiomathbot.md'],
  ['¿Qué metodología de desarrollo usan?', '01_proyecto_fisiomathbot.md'],
  ['¿Qué tecnologías usa la plataforma?', '01_proyecto_fisiomathbot.md'],
  ['¿Cómo me registro e inicio sesión?', '02_uso_de_la_plataforma.md'],
  ['¿Qué roles existen en la plataforma?', '02_uso_de_la_plataforma.md'],
  ['Quiero reportar un error del sistema', '02_uso_de_la_plataforma.md'],
  ['¿Dónde veo mi progreso?', '02_uso_de_la_plataforma.md'],
  ['¿Cómo edito mi perfil?', '02_uso_de_la_plataforma.md'],
  ['¿Cómo cierro sesión?', '02_uso_de_la_plataforma.md'],
  ['¿Qué lecciones tiene el módulo de matemáticas?', '02_uso_de_la_plataforma.md'],
  ['¿Cómo cambio la gravedad a la de la Luna?', '04_simulador_y_robot.md'],
  ['Soy profesor, ¿cómo edito el quiz?', '02_uso_de_la_plataforma.md'],
  ['¿Cómo se calcula la energía potencial?', '03_energia_potencial_y_cinetica.md'],
  ['¿Qué pasa si duplico la velocidad en la energía cinética?', '03_energia_potencial_y_cinetica.md'],
  ['¿Qué es el error relativo?', '03_energia_potencial_y_cinetica.md'],
  ['¿Qué es la conservación de la energía mecánica?', '03_energia_potencial_y_cinetica.md'],
  ['¿Qué sensores trae el robot Lego Spike Prime?', '04_simulador_y_robot.md'],
  ['¿Cómo se comunica el robot con la aplicación?', '04_simulador_y_robot.md'],
  ['¿Qué es la programación por bloques?', '04_simulador_y_robot.md'],
  ['¿El asistente me da las respuestas de los quizzes?', '05_politicas_del_asistente.md'],
  ['¿Cuántos mensajes puedo enviar al día?', '05_politicas_del_asistente.md'],
  // Preguntas en inglés (diccionario EN_ES de knowledgeService)
  ['How do I see my progress?', '02_uso_de_la_plataforma.md'],
  ['How do I log in to the platform?', '02_uso_de_la_plataforma.md'],
  ['How can I edit my profile?', '02_uso_de_la_plataforma.md'],
  ['I want to report a bug', '02_uso_de_la_plataforma.md'],
  ['How do I calculate kinetic energy?', '03_energia_potencial_y_cinetica.md'],
  ['What is the conservation of mechanical energy?', '03_energia_potencial_y_cinetica.md'],
  ['How do I change the gravity to the Moon in the simulator?', '04_simulador_y_robot.md'],
  ['Does the assistant give me the quiz answers?', '05_politicas_del_asistente.md'],
  ['What is the capital of France?', null],
  ['Give me a lasagna recipe', null],
  ['¿Cuál es la capital de Francia?', null],
  ['Dame una receta de lasaña', null],
  ['¿Quién ganó el mundial de fútbol?', null],
];

let ok = 0;
console.log('Base de conocimiento:', stats());
for (const [q, expected] of CASES) {
  const hits = search(q, 3);
  const top = hits[0] ? hits[0].source : null;
  const pass = expected === null ? hits.length === 0 : hits.some((h) => h.source === expected) && top === expected;
  if (pass) ok += 1;
  console.log(`${pass ? 'OK ' : 'FALLA'} | ${q} -> ${top || '(sin contexto)'}${hits[0] ? ' [' + hits[0].score.toFixed(2) + ']' : ''}`);
}
console.log(`\nResultado: ${ok}/${CASES.length}`);
process.exit(ok === CASES.length ? 0 : 1);
