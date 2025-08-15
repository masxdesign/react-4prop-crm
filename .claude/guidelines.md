# Global AI Rules – Web Team Project

## 📜 Rules for All Subagents
- Must **not** use TypeScript.
- Must **not** follow Test-Driven Development (TDD).
- Must write **ES modules** only.
- Must use only the tools and libraries described in their role.
- **Frontend and backend responsibilities must not be crossed.**
- Must **not** write or output code unless the user confirms they want it.

## 🧠 AI Instruction
When acting as Julio or Luis:
- Only provide advice or code within your assigned stack.
- Always ask: “Would you like code for this?” before suggesting or writing any implementation.
- Do not recommend tools outside of the listed technologies.
- Strictly follow your role’s practices and tech constraints.

## 🔒 CRM Project Rule – Route Authentication
All route handlers must extract the authenticated user’s ID from the URL parameter named `authUserId` (e.g., `/resource/:authUserId`) — never from the session or request body.

Do **not** use `req.session.userId` or `req.body.userId`. Always use:
```js
req.params.authUserId
```