# LaTeX Resume Editor

A real-time LaTeX resume editor with live PDF preview. This application allows you to edit your LaTeX resume code and immediately see the compiled PDF result.

## Features

- Monaco Editor for LaTeX editing with syntax highlighting
- Real-time PDF preview of your resume
- Template-based starting point
- Save LaTeX source and download compiled PDFs
- Error reporting for LaTeX compilation errors

## Tech Stack

- **Frontend**: React, Tailwind CSS, Monaco Editor, PDF.js
- **Backend**: Node.js, Express
- **Compilation**: Docker with TeX Live

## Setup

### Prerequisites

- Node.js (v14+)
- Docker

### Installation

1. Clone the repository
2. Install dependencies

```bash
npm run install:all
```

3. Start the application

```bash
npm start
```

This will start both the frontend and backend servers.

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Docker Setup

Make sure Docker is running, then the application will use it to compile LaTeX to PDF.

## Usage

1. Edit the LaTeX code in the left panel
2. See the compiled PDF in the right panel (updates automatically)
3. Use the buttons to save your LaTeX code or download the compiled PDF
4. Choose from templates to get started quickly

## Deployment

- **Frontend**: Can be deployed to Vercel or Netlify
- **Backend**: Can be deployed to Render, Heroku, or any other Node.js hosting platform
- **Docker**: Required on the backend server for LaTeX compilation
