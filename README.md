## Metal Quoter

Welcome to Metal Quoter! This system is designed to help manage quotes, RFQs (Requests for Quotes), and inventory for a metal service center. Our goal is to streamline the process of generating quotes based on customer requests and ensuring accurate and efficient management of stock and customer data.

### Note: This is a take-home project for a job application in which I was asked to design and implement a system for managing quotes, RFQs, and inventory for a metal service center within 7 days.
- Link to the specifications: [Take-Home Screen](https://kodiakllc.notion.site/Take-Home-Screen-ec3477d8d6ec49dbbf123ebf407b4d36)

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Directory Structure](#directory-structure)
- [API Documentation](#api-documentation)
- [Engineering Spec](#engineering-spec)
- [Contact](#contact)

## Features

✨ **Approve/Unapprove Quotes**: Easily approve or unapprove quotes using our intuitive API endpoints.

📧 **Email Integration**: Receive RFQs via email and process them automatically.

📊 **Data Extraction**: Extract structured data from RFQs for further processing using OpenAI.

🛠 **RFQ to Quote Conversion**: Convert structured RFQ data into quotes with calculated prices, availability checks, and detailed logic explanations.

🔍 **Breadcrumbs Generation**: Dynamically generate breadcrumbs for better navigation.

📈 **Inventory Management**: Keep track of stock items, including specifications, availability, and pricing.

🤖 **OpenAI Integration**: Leverage AI for extracting structured data from emails and validating quotes.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (>=18.x)
- npm (>=9.x)
- PostgreSQL
- Supabase Account
- Slack Account for Notifications (optional)

### Installation

1. **Clone the Repository**:

    ```sh
    git clone https://github.com/kodiakllc/metal-quoter.git
    cd metal-quoter
    ```

2. **Install Dependencies**:

    ```sh
    npm install
    ```

3. **Set Up Environment Variables**:

    Create a `.env.local` file in the root directory and add the following (see `.env.example`):

    ```env
    OPENAI_API_KEY=
    SLACK_WEBHOOK_URL=
    SLACK_CHANNEL=
    SLACK_TOKEN=
    VERCEL_PROJECT_PRODUCTION_URL=http://localhost:3000
    POSTGRES_URL=
    POSTGRES_PRISMA_URL=
    ```

4. **Generate Prisma Client**:

    ```sh
    npm run prisma:generate
    ```

5. **Deploy Data Model to Database**:

    ```sh
    ./scripts/clean.setup.db.sh
    ```

6. **Start the Application**:

    ```sh
    npm run dev
    ```

    You can now visit [http://localhost:3000](http://localhost:3000) to see the application in action!

#### Other Useful Commands

- **Build the Project**:

    ```bash
    npm run build
    ```

- **Start the Production Server**:

    ```bash
    npm run start
    ```

- **Lint the Code**:

    ```bash
    npm run lint
    ```

## Directory Structure

Here's an overview of the project's directory structure:

```
metal-quoter/
├── __tests__/                 [Test files]
├── cf-worker/                [Cloudflare Worker code]
├── components/               [Reusable React components]
├── docs/                     [Documentation files]
├── hooks/                    [Custom React hooks]
├── lib/                      [Library code]
├── pages/                    [Next.js pages and API routes]
│   ├── api/                  [API routes]
├── prisma/                   [Prisma schema and seed files]
├── public/                   [Static assets]
├── styles/                   [Global CSS styles]
├── types/                    [TypeScript type definitions]
├── utils/
│   ├── app/                  [Utility functions for the application]
│   ├── data/                 [Data processing utilities]
│   ├── server/               [Utility functions for the server]
│   ├── breadcrumbs.ts        [Breadcrumbs generation]
│   ├── index.ts              [Main utility file]
└── .env.example              [Example environment variables]
```

### RFQ to Quote Conversion (with OpenAI Assistant)

Instructions and methods to convert RFQs to Quotes and validate them:

```typescript
// /utils/server/assistant.ts
const convertRFQToQuoteInstructions = `
  ...
`;

const validatePotentialQuoteInstructions = `
  ...
`;
```

## Engineering Spec 📑

### Overview

The Metal Quoter project is a Next.js application designed to help metal service centers generate quotes faster and more accurately. The application leverages OpenAI's GPT-4-128K (and GPT-4o) for intelligent data extraction and processing, and it integrates with Slack for real-time notifications for new RFQs (Requests for Quotes) and quotes.

### Architecture

#### General Architecture

- **Frontend:** Built with Next.js and React, using TypeScript for type safety and Radix UI for design components.
- **Backend:** Serverless functions hosted on Vercel. Uses Prisma ORM to interact with a PostgreSQL database hosted on Supabase.
- **Data Storage:** PostgreSQL for structured data, Supabase for additional features.
- **Notifications:** Integrates with Slack via webhooks and the Slack API for debugging and real-time alerts.

#### Key Components

1. **Next.js Application**
   - Handles server-side rendering (SSR) and client-side rendering (CSR).
   - Manages routes, API endpoints, and static assets.

2. **Prisma ORM**
   - Simplifies database access and migrations.
   - Provides type-safe database interactions.

3. **OpenAI Integration**
   - Processes RFQs (Requests for Quotes) and generates intelligent responses.
   - Extracts structured data from emails.

4. **Slack Integration**
   - Sends notifications about new RFQs and quotes.
   - Uses Slack Web API and incoming webhooks.

#### Directory Structure

- **`/cf-worker`**: Cloudflare Worker code for processing incoming RFQs.
- **`/components`**: Reusable React components.
- **`/hooks`**: Custom React hooks.
- **`/lib`**: Library code, including database and API clients.
- **`/pages`**: Next.js pages and API routes.
- **`/prisma`**: Prisma schema and seed files.
- **`/styles`**: Global CSS styles.
- **`/types`**: TypeScript type definitions.
- **`/utils`**: Utility functions and helpers.

### Design Choices

1. **Server-Side Rendering (SSR):** Utilized to ensure that data is available on the first page load, enhancing the user experience and SEO.
2. **Serverless Functions:** Deployed on Vercel for scalability and cost-effectiveness.
3. **Prisma ORM:** Chosen for its type safety, ease of use, and compatibility with PostgreSQL.
4. **Vercel Edge Functions:** Used for particular API routes to reduce latency, improve performance, and to trigger downstream Serverless Functions.
5. **OpenAI GPT-4-128K:** Selected for its advanced natural language processing capabilities (particular models were chosen specifically based on my experience with the OpenAI API).
6. **Cloudflare Workers:** Used in conjunction with Cloudflare Email Routing to process incoming RFQs and trigger the appropriate API endpoints.
7. **Slack Webhooks:** Integrated for real-time notifications and debugging purposes.
8. **Prettier and ESLint:** Configured to enforce code style consistency and best practices.

### Assumptions and Trade-offs

1. **Assumptions**
   - The user has valid API keys for OpenAI and Slack.
   - The database URLs provided in the environment variables are correct and accessible.
   - The user has basic knowledge of Next.js, Prisma, and React.
   - The quotes arrive in a relatively similar fashion as provided in the Take-Home Screen.
   - The user has a basic understanding of the RFQs and the data extraction process.

2. **Trade-offs**
   - **Serverless Functions:** While they simplify deployment and scaling, there may be cold start latency.
   - **No Authentication:** For simplicity, the application does not include user authentication, which would be a requirement for production.
   - **Ability to Add Products:** The application does not currently support adding new products, which would be necessary for a real-world scenario.
   - **Ability to Add Stock:** The application does not currently support adding new stock items, which would be necessary for a real-world scenario.
   - **Prisma ORM:** Adds an abstraction layer, which might introduce slight overhead but significantly improves developer productivity and code safety.
   - **Ability to do most of the things:** The application is not fully functional and merely a prototype to demonstrate my understanding of the requirements, the technologies, and the architecture.

### Future Improvements

1. **Caching:** Implement more aggressive caching strategies to reduce load times and server costs.
2. **Error Handling:** Enhance error handling mechanisms across the application to provide more user-friendly error messages and logs.
3. **Unit Tests:** Increase test coverage to ensure robustness and reliability of the application.
4. **User Authentication:** Implement user authentication to secure the application and provide personalized experiences.
5. **Everything Else:** Complete the missing functionality, including the ability to add products, manage stock, and generate quotes, etc.

## Try It Out

You can send a quote to `quote@kdk.dev` and a corresponding RFQ and quote will appear at [https://mq.kdk.dev/](https://mq.kdk.dev/).

## Contact

For any questions or support, please reach out to [nick@kdk.dev](mailto:nick@kdk.dev).
