# AI-HUB

## Installation

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the backend directory and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   GEMINI_API_KEY=your_gemini_api_key
   CLAUDE_API_KEY=your_claude_api_key
   PERPLEXITY_API_KEY=your_perplexity_api_key
   ```

4. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the required Node.js packages:
   ```bash
   npm install
   ```

3. Run the frontend development server:
   ```bash
   npm run dev
   ```

## Usage

- The backend server will be running at `http://localhost:8000`.
- The frontend development server will be running at `http://localhost:3000`.

Make sure to have your API keys set up in the `.env` file for the backend to function correctly. 