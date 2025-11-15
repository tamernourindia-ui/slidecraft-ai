# SlideCraft AI

An intelligent web application that transforms scientific PDF articles into professional, presentation-ready PowerPoint files using AI.

[cloudflarebutton]

SlideCraft AI is an advanced web application designed to intelligently convert scientific PDF articles into professional PowerPoint presentations. The user initiates the process by uploading a PDF and providing the article's title. They can then customize the output by specifying the desired number of slides, the level of summarization (low, medium, high), and aesthetic choices like fonts and color themes optimized for projectors. The backend, powered by Cloudflare Workers and AI, first analyzes the PDF to extract its content and structure. It then leverages a powerful AI model to summarize the text according to the user's preferences, structuring the output logically across the specified number of slides. The summarized content is then professionally translated. Finally, the system generates two distinct PowerPoint files: a visually polished 'Presentation Version' for audiences, complete with animations, and a 'Presenter Version' with simplified slides and comprehensive speaker notes. The application provides a seamless experience, from a multi-step input form to a real-time progress view and a final results page where users can download their generated presentations.

## ✨ Key Features

-   **Intelligent PDF to Presentation:** Automatically convert scientific PDF articles into polished PowerPoint presentations.
-   **AI-Powered Summarization:** Leverages large language models to summarize complex content based on user-defined length and detail levels.
-   **Dual Output:** Generates two distinct versions: a visually appealing presentation for the audience and a detailed version with speaker notes for the presenter.
-   **Deep Customization:** Allows users to select the number of slides, summarization depth, fonts (Farsi & English), and color themes.
-   **Optimized for Presentation:** Color themes are designed for high contrast and readability on low-light projectors.
-   **Real-Time Progress:** A dynamic interface shows the status of each step, from analysis to generation.
-   **Serverless Architecture:** Built entirely on the Cloudflare stack for scalability, performance, and reliability.

## 🛠️ Technology Stack

-   **Frontend:**
    -   **Framework:** React (with Vite)
    -   **Language:** TypeScript
    -   **Styling:** Tailwind CSS
    -   **UI Components:** shadcn/ui
    -   **State Management:** Zustand
    -   **Animation:** Framer Motion
-   **Backend & Platform:**
    -   **Runtime:** Cloudflare Workers
    -   **Routing:** Hono
    -   **AI Integration:** Cloudflare AI Gateway
    -   **Persistence:** Cloudflare Durable Objects
-   **Core Libraries:**
    -   `pptxgenjs` for PowerPoint generation
    -   `pdf-parse` for PDF text extraction
    -   `react-dropzone` for file uploads

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or later)
-   [Bun](https://bun.sh/) (v1.0 or later)
-   A Cloudflare account

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd slidecraft_ai
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Set up environment variables:**
    Create a `.dev.vars` file in the root of the project for local development. Do not commit this file.
    ```ini
    # .dev.vars

    # Required for AI functionality
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="your-cloudflare-api-key"
    ```
    Replace the placeholder values with your actual Cloudflare Account ID, Gateway ID, and an API key.

## 🖥️ Local Development

To start the local development server, which runs both the Vite frontend and the Cloudflare Worker backend concurrently:

```bash
bun run dev
```

The application will be available at `http://localhost:3000`.

The project is structured as follows:
-   `src/`: Contains all the frontend React code.
-   `worker/`: Contains the backend Cloudflare Worker code, including API routes and AI logic.

## 🌐 Deployment

This project is designed for seamless deployment to Cloudflare Pages.

1.  **One-Click Deploy:**
    You can deploy this application to your Cloudflare account with a single click.

    [cloudflarebutton]

2.  **Manual Deployment via CLI:**
    If you prefer to deploy from your local machine, use the following command:
    ```bash
    bun run deploy
    ```
    This command will build the frontend application and deploy it along with the worker to your Cloudflare account.

3.  **Configure Secrets:**
    After deployment, you must configure the necessary secrets in your Cloudflare dashboard for the production environment to work correctly.
    -   Navigate to your Worker/Page settings.
    -   Go to `Settings` > `Variables`.
    -   Add the following secret variables:
        -   `CF_AI_BASE_URL`: Your Cloudflare AI Gateway URL.
        -   `CF_AI_API_KEY`: Your Cloudflare API Key.

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for more details.