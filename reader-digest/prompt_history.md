# Prompt history


Log all prompts for memo and more refinement in .

- git log: v1 init prod repo
- prompt: 

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

- git log: v2 fix frontend issue
- prompts 
    - error occurs when accessing the localhost:3000, fix it
    - "Attempted to call useAuth() from the server but useAuth is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component."
    - still not working, fix issue "Cannot find module 'autoprefixer'"
    - fix issue "The current Flask app is not registered with this 'SQLAlchemy' instance. Did you forget to call 'init_app', or did you create multiple 'SQLAlchemy' instances?"


AI Agent useful scripts

- lsof -ti:5001 | xargs kill -9 (kill any existing process on port 5001)