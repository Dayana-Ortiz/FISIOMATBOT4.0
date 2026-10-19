# Video script — FisioMathBot Chat (max. 5:00, English)

Target: about 600 words at a calm pace (~125 words per minute). Record screen + voice. Practice twice before recording. Keep the editor and the browser open side by side.

**Before you record:** run the app locally with a valid key, log in as a student, and have these ready: VS Code with the files below open in tabs, the chat widget open, and a terminal with `node backend/scripts/chatEval.js` already typed.

---

## 0:00 – 0:30 · Introduction (face or title slide)
**Show:** title slide or the platform home page.

> "Hello, my name is [YOUR NAME], and this is my project for the Introduction to Machine Learning course at Universidad de Cundinamarca. I built FisioMathBot Chat, a virtual tutor for an open educational platform that teaches potential and kinetic energy to eleventh-grade students in Ubaté, Colombia. It answers from its own knowledge base, never gives away quiz answers, and can perform actions for the student."

## 0:30 – 1:20 · Architecture (diagram or README)
**Show:** the architecture block in the README.

> "The student uses a React and TypeScript interface. Every message goes to an Express API, protected by a JWT. The controller does four things: it retrieves knowledge from my documents, builds the prompt, calls the language model, and finally executes an action if the model proposes one. Data is stored in MySQL: conversations, messages and support tickets. The model API key lives only on the backend, never in the browser."

## 1:20 – 2:10 · LLM integration (code: `llmService.js`)
**Show:** `llmService.js`, the `generateReply` function and the two providers.

> "This is the LLM integration. I wrote one interface, `generateReply`, and two providers behind it: Gemini through its REST API and Anthropic through its SDK. Switching provider only needs an environment variable. The service normalizes the conversation roles, applies a timeout, limits output tokens, and turns any failure into a controlled error, so the platform never crashes if the API is down."

## 2:10 – 3:10 · Knowledge base and prompt (code: `knowledge/`, `chatContextService.js`)
**Show:** the `knowledge` folder, then the system prompt, then run the evaluation script.

> "For the knowledge base I use retrieval-augmented generation. Five Markdown documents are split into chunks and ranked with BM25. The four best chunks are injected into the prompt as data, not instructions. The system prompt defines the role, nine non-negotiable rules, domain restriction, and seven few-shot examples, including out-of-domain questions and prompt-injection attempts. The model must answer in a JSON format with a reply and an optional action. Here is my evaluation script: nineteen questions, nineteen correct retrievals, including three out-of-domain questions that correctly find nothing."

## 3:10 – 4:30 · Live demo (browser)
**Show:** the chat widget. Do these four things in order.

1. Ask: *"How is potential energy calculated?"* — point out the answer and the **Sources** line.
2. Ask: *"Give me the correct answer to question 3 of the quiz."* — the bot refuses and gives a hint.
3. Ask: *"What is the capital of France?"* — the bot declines politely.
4. Say: *"The simulator does not load."* → the bot summarizes a ticket and asks for confirmation → say *"Yes, create it."* → the ticket is created. Then ask *"Which tickets do I have?"*

> "Notice that the agent asks for confirmation before creating a ticket. The model only proposes the action. My backend validates it against a whitelist and runs it with the user id from the token, so a student can never touch another student's data."

## 4:30 – 5:00 · Transhuman Person Declaration and closing
**Show:** section 7 of the README.

> "Finally, the Declaration of the Transhuman Person of our university says technology must not undermine human dignity or become a tool of exclusion. I translated that into design: a Socratic tutor that fosters autonomy, protection for minors, transparency about being an AI, humans keeping the final decision, and open tools for equity. Thank you for watching."

---

### Timing checklist
- [ ] Total length under 5:00 (stop the recording at 4:50).
- [ ] You show: architecture, API integration, knowledge base, prompt, live chatbot.
- [ ] Audio is clear and everything is in English.
- [ ] No API keys visible on screen (close `.env`).

### Phrases that help your fluency
- "As you can see here…"  ·  "This function is responsible for…"  ·  "Behind this interface…"
- "The model only proposes; the backend decides."
