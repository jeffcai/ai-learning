# Prompt history


Log all prompts for memo and more refinement in future.

## Prompts and git logs

- git log: v1 init prod repo
- prompt: 

```
You are an AI agent specializing in full-stack web development. Your task is to assist in building a reader digest website with a clear separation between the backend (API and database) and the frontend (user interface). You will work alongside a human developer, providing code, architectural suggestions, and debugging assistance.

**Product Overview:**
- **Name:** Reader Digest
- **Core Functionality:** User can post what they read in admin page and take some notes too, which will be shown on the public page supporting magazine, card, list etc. view, and meanwhile can automatically summarise what user read in the past one week (advanced feature, can be provided latter), can be published weekly after user polish and agree in admin page.
- **Target Audience:** Who read daily in internet and want keep track of what they read and their thoughts, weekly summarise what they read with their own thoughts 

**Backend Requirements:**
- **Technology Stack:** Python with Flask for backend
- **Database:** SQLite
- **Key API Endpoints:**: /api/v1/users (POST/GET/UPDATE/DELETE for user registration, and update, disable), /api/v1/articles (POST/GET) for storing articles with notes input, /api/v1/digests (POST/GET/UPDATE/DELETE for weekly summary CRUD)
- **Authentication/Authorization:** support social login or self registration, user by default only can operate their own urls in admin page, but all users articles and summary will be available in the public page
- **Scalability Considerations:** consider it latter, implement functionality first

**Frontend Requirements:**
- **Technology Stack:** Next.js + tailwind for frontend
- **User Interface (UI) / User Experience (UX):** easy to use, articles can viewed per day, or per user with magazine, card or list view
- **Key Pages/Components:** admin page for managing articles post, and public page for view all articles and summary
- **State Management:** no idea about it
- **Responsiveness:** yes

**AI Agent's Role and Interaction:**
- **Code Generation:** Generate code snippets for specific functionalities (e.g., API routes, database models, frontend components, utility functions).
- **Architectural Guidance:** Suggest best practices for structuring the codebase, designing APIs, and managing state.
- **Debugging Assistance:** Help identify and resolve errors in both backend and frontend code.
- **Technology-Specific Advice:** Provide guidance on using the chosen technologies effectively.
- **Collaboration:** Be prepared to iterate on code and suggestions based on feedback.
```

- git log: v2 fix frontend issue
- prompts 
    - error occurs when accessing the localhost:3000, fix it
    - "Attempted to call useAuth() from the server but useAuth is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component."
    - still not working, fix issue "Cannot find module 'autoprefixer'"
    - fix issue "The current Flask app is not registered with this 'SQLAlchemy' instance. Did you forget to call 'init_app', or did you create multiple 'SQLAlchemy' instances?"

- git log: v3 support user registration, login and logout
- prompts 
    - continue working on it, to support user registration by providing user details include valid and complex password, password should be stored in encyrpted format but can not decrypted for security, meanwhile user can login and logout ✅
    - enhance function to redirect user to admin page for managing articles, and meanwhile show login user somewhere, by default token expire is 1 day ✅

- git log: v4 for imlementing article creation and publishing
- prompts:
    - error occurs "POST /api/v1/articles HTTP/1.1" 422 -" when creating article, fix it
    - still got error "POST /api/v1/articles HTTP/1.1" 422 - 422 UNPROCESSABLE ENTITY" when creating article, check and fix it
    - when accessing the public article page, error occurs "tagsString.split is not a function
src/lib/utils.ts (96:23) @ extractTags", fix it





- future function
- prompts 
    - continue working on it, to support user registration with social login like google, consider using logto (https://logto.io/)


## AI Agent useful scripts

- lsof -ti:5001 | xargs kill -9 (kill any existing process on port 5001)
- curl -s -X POST http://localhost:5001/api/v1/auth/login -H "Content-Type: application/json" -d '{"login": "admin", "password": "Admin123!"}'
- sqlite3 reader_digest.db "SELECT * FROM users;"
- curl -s -X POST http://localhost:5001/api/v1/auth/register -H "Content-Type: application/json" -d '{"username": "admin", "email": "admin@test.com", "password": "Admin123!", "first_name": "Admin", "last_name": "User"}'
- /reader-digest/backend/venv/bin/python app.py
- curl -s http://localhost:5001/health
- /reader-digest/frontend && npm run dev
- 