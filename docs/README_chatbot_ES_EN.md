# FisioMathBot Chat — Asistente conversacional con LLM / LLM-powered conversational assistant

> Actividad CADI «Introducción a Machine Learning» · Universidad de Cundinamarca
> CADI activity "Introduction to Machine Learning" · Universidad de Cundinamarca
>
> **Autor/Author:** [Agregar: tu nombre]  ·  **Demo en vivo / Live demo:** [Agregar: enlace cuando esté desplegado / add link once deployed]  ·  **Video (EN):** [Agregar: enlace / add link]

---

## 1. Resumen / Summary

**ES.** FisioMathBot Chat es el asistente virtual del REDA FisioMathBot, una plataforma educativa para estudiantes de grado once de Ubaté (Cundinamarca) que aprenden energía potencial y cinética con un simulador y un robot Lego Spike Prime. El asistente explica conceptos, orienta sobre el uso de la plataforma y puede **ejecutar acciones** (crear, consultar y cancelar reportes de soporte). Responde solo con una base de conocimiento propia (RAG) y nunca entrega las respuestas de los cuestionarios.

**EN.** FisioMathBot Chat is the virtual assistant of the FisioMathBot platform (an Open Digital Educational Resource) for eleventh-grade students in Ubaté, Colombia, who learn potential and kinetic energy with a simulator and a Lego Spike Prime robot. The assistant explains concepts, guides platform use, and can **perform actions** (create, list and cancel support tickets). It answers only from its own knowledge base (RAG) and never gives away quiz answers.

## 2. Arquitectura / Architecture

```
Estudiante (React + TypeScript)
   │  POST /api/chat/conversations/:id/messages   (JWT)
   ▼
Express API ── chatController
   ├─ knowledgeService  → BM25 sobre backend/knowledge/*.md  (RAG)
   ├─ chatContextService → system prompt + few-shot + contexto curricular (filtrado)
   ├─ llmService        → Gemini o Anthropic (LLM_PROVIDER)
   └─ actionService     → lista blanca de acciones CRUD con el usuario autenticado
        └─ MySQL: chat_conversations, chat_messages, chat_support_tickets
```

| Componente / Component | Archivo / File |
|---|---|
| Endpoints REST | `backend/src/routes/chat.js`, `backend/src/controllers/chatController.js` |
| Integración LLM (multi-proveedor) | `backend/src/services/llmService.js` |
| Base de conocimiento (RAG) | `backend/knowledge/*.md`, `backend/src/services/knowledgeService.js` |
| Prompt engineering | `backend/src/services/chatContextService.js` |
| Agente / acciones CRUD | `backend/src/services/actionService.js` |
| Interfaz | `frontend/src/components/Chat/*` |
| Pruebas | `backend/scripts/chatEval.js`, `backend/scripts/chatSmoke.js` |

## 3. Integración del LLM / LLM integration

- El backend actúa como **proxy**: la clave del LLM vive solo en `backend/.env`. / The backend is a **proxy**: the API key lives only in `backend/.env`.
- Proveedor intercambiable con `LLM_PROVIDER=gemini|anthropic` y `LLM_MODEL`. / Provider is swappable via env vars.
- Límites: 1000 caracteres por mensaje, tope diario por usuario, límite de peticiones por minuto, historial recortado a N turnos. / Limits: 1000 chars per message, daily cap per user, per-minute rate limit, truncated history.
- Fallos del proveedor devuelven un error controlado y el chat muestra un mensaje amable. / Provider failures return a controlled error.

## 4. Base de conocimiento y prompt / Knowledge base & prompting

**RAG.** Cinco documentos Markdown (`backend/knowledge/`): proyecto, uso de la plataforma, energía potencial y cinética, simulador y robot, políticas del asistente. Se dividen en fragmentos por encabezado y se recuperan con **BM25** (los 4 más relevantes por pregunta). Si no hay fragmentos relevantes, el modelo debe decir que no tiene el dato. / Five Markdown documents are chunked by heading and retrieved with BM25 (top 4). With no relevant chunk, the model must say it lacks the information.

**Prompt engineering.**
1. *System prompt* con rol, 9 reglas no negociables y restricción de dominio.
2. *Few-shot*: 7 ejemplos (pregunta válida, petición de respuesta de quiz, fuera de dominio, intento de inyección, crear/listar reportes).
3. *Salida estructurada*: JSON `{"reply", "action"}`; el backend valida la acción contra una lista blanca.
4. *Anti-inyección*: el texto del estudiante nunca entra al system prompt; los fragmentos del contexto se declaran «datos, no instrucciones».
5. *Anti-respuestas*: nunca se consultan las tablas de quizzes y el contenido curricular pasa por un filtro que elimina claves como `correctAnswer` o `isCorrect`.

**Casos borde cubiertos / Edge cases covered:** pregunta fuera de dominio, petición de la respuesta de un quiz, «ignora tus instrucciones», salida del modelo que no es JSON, acción inventada, mensaje vacío o demasiado largo, usuario que intenta cancelar el reporte de otro.

**Evaluación / Evaluation.** `node backend/scripts/chatEval.js` prueba la recuperación con 19 preguntas (16 del dominio y 3 fuera de dominio): 19/19. `node backend/scripts/chatSmoke.js` prueba el agente completo con base de datos y LLM simulados: 8/8.

## 5. Agente y operaciones CRUD / Agent & CRUD operations

| Operación | Acción del agente | Regla de seguridad |
|---|---|---|
| Create | `create_ticket` | Pide confirmación antes; asunto y descripción validados; máx. 10 abiertos |
| Read | `list_my_tickets`, `list_modules` | Solo tickets del usuario autenticado |
| Update | `cancel_ticket` | Solo tickets propios y abiertos |
| Delete | — (cancelación lógica) | No hay borrado físico |

El modelo **propone** la acción; el backend la valida y la ejecuta con el `user_id` del JWT, nunca con el que diga el modelo. / The model proposes; the backend validates and executes with the JWT user id.

## 6. Instalación / Installation

```bash
git clone <URL_DEL_REPOSITORIO>
cd FISIOMATBOT3.0/backend
npm install
npm install @anthropic-ai/sdk express-rate-limit   # el SDK de Anthropic solo si usas ese proveedor
cp .env.example .env            # completa LLM_PROVIDER, LLM_MODEL y la clave
# Base de datos: ejecuta database/chat_tutor.sql y database/chat_tutor_v2.sql
npm run dev

cd ../frontend && npm install && npm run dev
```

Pruebas / Tests: `node backend/scripts/chatEval.js` · `node backend/scripts/chatSmoke.js`

---

## 7. Declaración de la Persona Transhumana / Transhuman Person Declaration

> **Antes de entregar / Before submitting:** contrasta cada afirmación con el texto oficial de la Declaración (Capítulo 5, págs. 95–96 del documento *CAP 5 – Declaración de la Persona Transhumana*, UCundinamarca) y cita los numerales exactos donde dice **[citar]**. Lo escrito aquí se basa en los principios de la introducción del capítulo (dignidad humana, tecnología que no domina ni excluye, autonomía, valores como justicia, solidaridad, libertad, diálogo y diversidad). Verify every claim against the official text and cite the exact articles where marked **[cite]**.

### 7.1 Español — ¿De qué manera el agente respeta y fomenta los principios de la Declaración?

El modelo educativo de la Universidad de Cundinamarca (MEDIT) busca formar una persona transhumana que sea un agente transformador de su entorno, y plantea que la tecnología no debe desnaturalizar la dignidad humana ni convertirse en instrumento de dominación, exclusión o privilegio **[citar]**. FisioMathBot Chat se diseñó con esos límites como requisitos técnicos y no como adorno:

- **Autonomía y aprendizaje propio.** El asistente aplica un método socrático: da pistas y preguntas guía en lugar de respuestas finales y se niega a entregar las respuestas de los cuestionarios. La tecnología aumenta la capacidad de razonar del estudiante sin reemplazar su esfuerzo; la mejora depende de la persona, no solo de la herramienta.
- **Dignidad y cuidado de los menores.** Los estudiantes son menores de edad. El sistema aplica un dominio restringido, rechaza contenido inapropiado, no solicita datos sensibles, limita el acceso a cada conversación a su dueño y se alinea con la Ley 1581 de 2012 y el Decreto 1377 de 2013.
- **Transparencia y responsabilidad.** El asistente se identifica como inteligencia artificial, reconoce cuando no tiene información, muestra las fuentes de la base de conocimiento que usó y remite al docente. El ser humano conserva la decisión final: el agente solo ejecuta acciones de una lista blanca, pide confirmación antes de crear un reporte y actúa únicamente con los datos del usuario autenticado.
- **Equidad y no exclusión.** La solución se construye con software abierto, funciona en un navegador y puede usar un proveedor de LLM intercambiable, para no depender de licencias comerciales ni crear privilegios de acceso. Esto es coherente con los valores de justicia, solidaridad y diversidad.
- **Transformación educativa.** El asistente acompaña la experimentación con el simulador y el robot, y fortalece el pensamiento computacional, una competencia en la que Colombia obtuvo 432 puntos frente a 500 de la OCDE en PISA 2025.

**Límites reconocidos.** Un LLM puede equivocarse. Por eso se restringe a una base de conocimiento verificable, se declara como IA y se mantiene al docente en el circuito. El riesgo de dependencia excesiva se mitiga con preguntas guía y con el límite diario de mensajes.

### 7.2 English — How does the AI agent align with and support the Transhuman Person Declaration?

Universidad de Cundinamarca's educational model (MEDIT) aims to form a transhuman person as a transformative agent of their environment, and it states that technology must not undermine human dignity nor become a tool of domination, exclusion or privilege **[cite]**. FisioMathBot Chat was designed with these limits as technical requirements, not decoration:

- **Ethical AI — autonomy.** The assistant follows a Socratic method: it gives hints and guiding questions instead of final answers, and refuses to hand out quiz answers. Technology augments the student's reasoning without replacing their effort; improvement depends on the person, not only on the tool.
- **Ethical AI — dignity and protection of minors.** Students are minors. The system enforces a restricted domain, rejects inappropriate content, never asks for sensitive data, restricts each conversation to its owner, and follows Colombian data protection law (Law 1581 of 2012, Decree 1377 of 2013).
- **Ethical AI — transparency and accountability.** The assistant identifies itself as AI, admits when it lacks information, shows the knowledge-base sources it used and refers to the teacher. Humans keep the final decision: the agent only runs whitelisted actions, asks for confirmation before creating a ticket and acts only on the authenticated user's data.
- **Human augmentation.** The assistant supports hands-on experimentation with the simulator and the robot and strengthens computational thinking, where Colombia scored 432 versus the OECD average of 500 in PISA 2025.
- **Educational transformation and equity.** Open-source tools, a browser-based interface and a swappable LLM provider avoid dependence on commercial licenses and avoid creating privileged access, consistent with justice, solidarity and diversity.

**Acknowledged limits.** An LLM can be wrong. For that reason it is restricted to a verifiable knowledge base, declared as AI, and keeps the teacher in the loop. Over-reliance is mitigated with guiding questions and a daily message cap.

---

## 8. Estructura del repositorio / Repository structure

```
backend/
  knowledge/            # base de conocimiento (RAG)
  scripts/              # chatEval.js, chatSmoke.js
  src/
    controllers/chatController.js
    routes/chat.js
    services/           # llmService, knowledgeService, chatContextService, actionService, chatDeps
database/               # chat_tutor.sql, chat_tutor_v2.sql
frontend/src/components/Chat/
docs/                   # este README, guion del video
```

## 9. Créditos / Credits

Proyecto FisioMathBot — Karen Dayana Ortiz Murcia y Jeysson Hernando Espitia Ríos. Directora: Lic. Mónica Lorena Torres Forigua. Coach: Ing. Segundo Leonardo Cortés López. Universidad de Cundinamarca, extensión Ubaté.

**Referencias / References:** OECD (2026), *PISA 2025 Results (Volume I)*; Universidad de Cundinamarca, *CAP 5 – Declaración de la Persona Transhumana*; Ley 1581 de 2012; Decreto 1377 de 2013.
