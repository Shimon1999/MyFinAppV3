import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Documentation() {
  const [activeTopic, setActiveTopic] = useState('overview');
  
  const topics = [
    { id: 'overview', title: 'Overview' },
    { id: 'architecture', title: 'Architecture' },
    { id: 'datamodel', title: 'Data Model' },
    { id: 'features', title: 'Key Features' },
    { id: 'apis', title: 'APIs & SDKs' },
    { id: 'pages', title: 'Page Structure' },
    { id: 'flows', title: 'User Flows' },
    { id: 'integration', title: 'Backend Integration' },
    { id: 'auth', title: 'Custom Authentication' },
    { id: 'theme', title: 'Theme Customization' }
  ];
  
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">MyFinApp Documentation</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4">
          <div className="sticky top-8 bg-white/80 p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium mb-4">Contents</h2>
            <div className="flex flex-col gap-2">
              {topics.map(topic => (
                <Button 
                  key={topic.id}
                  variant={activeTopic === topic.id ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTopic(topic.id)}
                >
                  {topic.title}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="md:w-3/4">
          {activeTopic === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="mb-4">
                MyFinApp is a personal finance management application designed to help users take control of their financial lives. It enables users to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Upload transaction data via CSV files (with planned bank connections).</li>
                <li>Track income and expenses across various categories.</li>
                <li>Set and monitor monthly budgets.</li>
                <li>Create and track progress towards financial goals.</li>
                <li>View insightful summaries and trends of their financial activities.</li>
              </ul>
              <p className="mb-4">
                The application is built with a modern tech stack, focusing on a responsive user interface, intuitive user experience, and extensibility.
                It utilizes a component-based architecture, making it modular and maintainable.
              </p>
              <p>
                This documentation provides a comprehensive guide to the application's architecture, features, data model, APIs, and integration points to help developers understand, customize, and extend the application effectively.
              </p>
            </div>
          )}
          
          {activeTopic === 'architecture' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Architecture</h2>
              
              <h3 className="text-xl font-medium mt-6 mb-3">Core Technologies</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Frontend Framework</strong>: React.js for building the user interface.</li>
                <li><strong>Styling</strong>: Tailwind CSS for utility-first styling, with custom CSS variables for global theming.</li>
                <li><strong>UI Components</strong>: Shadcn UI components, providing a set of accessible and customizable building blocks.</li>
                <li><strong>State Management</strong>: React's built-in `useState` and `useEffect` hooks for component-level state and side effects.</li>
                <li><strong>Routing</strong>: React Router DOM for client-side navigation between pages.</li>
                <li><strong>Form Handling</strong>: React Hook Form for efficient and validated form submissions.</li>
                <li><strong>Animation</strong>: Framer Motion for smooth UI transitions and animations.</li>
                <li><strong>Date & Time</strong>: `date-fns` for robust date manipulation and formatting.</li>
                <li><strong>Icons</strong>: Lucide React for a comprehensive set of SVG icons.</li>
                <li><strong>Data Persistence</strong>: Base44 platform's built-in entity system.</li>
              </ul>
              <h3 className="text-xl font-medium mt-6 mb-3">Application Structure</h3>
              <p className="mb-2">The application follows a standard project structure:</p>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm mb-6">
                <pre>
{`myfinapp/
├── components/           # Reusable UI components
│   ├── auth/             # Authentication related components
│   ├── budgets/          # Budget management components
│   ├── dashboard/        # Dashboard specific components
│   ├── expenses/         # Expense management components
│   ├── goals/            # Financial goal components
│   ├── transactions/     # Transaction related components
│   └── ui/               # Shadcn UI base components
├── entities/             # JSON schema definitions for data models
│   ├── Budget.json
│   ├── FinancialGoal.json
│   ├── Transaction.json
│   ├── TransactionSource.json
│   └── UserPreference.json
├── pages/                # Top-level page components
│   ├── AddSource.js
│   ├── CategoryTransactions.js
│   ├── ComingSoon.js
│   ├── Dashboard.js
│   ├── Documentation.js  (This page)
│   ├── Goals.js
│   ├── Home.js           (Landing page)
│   ├── Onboarding.js
│   ├── Register.js
│   └── Sources.js
│   └── Transactions.js
├── functions/            # Backend functions (Deno Deploy handlers)
│   └── (Examples: exportData.js, customAuth.js)
├── Layout.js             # Main application layout wrapper
├── utils/                # Utility functions (e.g., createPageUrl)
└── ...                   # Other configuration files
`}
                </pre>
              </div>
              <p>
                The `Layout.js` component wraps all authenticated pages. Pages fetch data and compose UI components. Components are reusable and focused.
              </p>
            </div>
          )}

          {/* Data Model Section */}
          {activeTopic === 'datamodel' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Data Model</h2>
              <p className="mb-4">
                Data is structured using JSON schemas managed by Base44. Each entity includes `id`, `created_date`, `updated_date`, and `created_by`.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="user">
                  <AccordionTrigger>User Entity (`User.json` - Built-in, extendable)</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Represents an authenticated user.</p>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
{`{
  "id": "string (auto-generated)",
  "created_date": "string (ISO date, auto-generated)",
  "full_name": "string",
  "email": "string (unique)",
  "role": "string ('admin' or 'user', auto-managed)"
}`}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="userpreference">
                  <AccordionTrigger>UserPreference Entity (`UserPreference.json`)</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Stores user-specific settings.</p>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
{`{
  "default_currency": { "type": "string", "default": "AED" },
  "date_format": { "type": "string", "enum": ["DD/MM/YYYY", ...], "default": "DD/MM/YYYY" },
  "has_completed_onboarding": { "type": "boolean", "default": false },
  "selected_month": { "type": "string", "description": "YYYY-MM" },
  "notification_preferences": { /* ... */ }
}`}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="budget">
                  <AccordionTrigger>Budget Entity (`Budget.json`)</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Defines monthly category budgets.</p>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
{`{
  "category": { "type": "string", "enum": ["groceries", ...] },
  "month": { "type": "string", "description": "YYYY-MM" },
  "amount": { "type": "number" },
  "currency": { "type": "string", "default": "AED" },
  "color": { "type": "string" },
  "icon": { "type": "string" }
}`}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="transaction">
                  <AccordionTrigger>Transaction Entity (`Transaction.json`)</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Individual financial transactions.</p>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
{`{
  "source_id": { "type": "string" },
  "date": { "type": "string", "format": "date" },
  "amount": { "type": "number" },
  "description": { "type": "string" },
  "category": { "type": "string" },
  "month": { "type": "string" },
  "income_type": { "type": "string" },
  "expense_type": { "type": "string" },
  "is_non_cashflow": { "type": "boolean", "default": false }
}`}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="transactionsource">
                  <AccordionTrigger>TransactionSource Entity (`TransactionSource.json`)</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Sources of transactions (accounts, CSVs).</p>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
{`{
  "name": { "type": "string" },
  "type": { "type": "string", "enum": ["csv", "bank"] },
  "status": { "type": "string", "enum": ["active", ...], "default": "active" }
}`}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="financialgoal">
                  <AccordionTrigger>FinancialGoal Entity (`FinancialGoal.json`)</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">User-defined financial savings goals.</p>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
{`{
  "name": { "type": "string" },
  "target_amount": { "type": "number" },
  "current_amount": { "type": "number", "default": 0 },
  "target_date": { "type": "string", "format": "date" },
  "is_completed": { "type": "boolean", "default": false }
}`}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Key Features Section */}
          {activeTopic === 'features' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Key Features</h2>
              <div className="space-y-4">
                {[
                  { title: "User Authentication & Onboarding", desc: "Secure registration and guided setup." },
                  { title: "Dashboard Overview", desc: "Centralized financial summary, charts, and filters." },
                  { title: "Transaction Management", desc: "Comprehensive listing, filtering, editing, and categorization." },
                  { title: "Budgeting", desc: "Create, edit, delete monthly budgets; visualize spending progress." },
                  { title: "Financial Goals", desc: "Set, track, and manage multiple financial goals." },
                  { title: "Account Source Management", desc: "CSV uploads (bank connections planned)." },
                  { title: "Category-Specific Insights", desc: "Drill-down views for category spending." },
                  { title: "Responsive Design", desc: "Optimized for desktop and mobile." },
                  { title: "Theming and Customization", desc: "Easy theme customization via CSS variables." }
                ].map(feature => (
                  <div key={feature.title} className="p-4 bg-white rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium mb-1">{feature.title}</h3>
                    <p className="text-gray-700 text-sm">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* APIs & SDKs Section */}
          {activeTopic === 'apis' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">APIs & SDKs</h2>
              <p className="mb-4">Interaction via Base44 Entity SDKs and Core Integrations.</p>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-medium mb-4">Entity SDKs</h3>
                  <p className="mb-2">Import like: `import {"{Transaction}"} from '@/api/entities';`</p>
                  <h4 className="text-lg font-medium my-2">Common Methods:</h4>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
{`EntityName.list(orderBy, limit)
EntityName.filter(filters, orderBy, limit)
EntityName.create(data)
EntityName.bulkCreate(arrayOfData)
EntityName.update(id, updates)
EntityName.delete(id)
EntityName.schema()`}
                  </pre>
                  <h4 className="text-lg font-medium my-2">User Specific:</h4>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
{`User.me()
User.updateMyUserData(data)
User.login() // Platform login
User.logout() // Platform logout`}
                  </pre>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-4">Core Integrations</h3>
                  <p className="mb-2">Import like: `import {"{IntegrationName}"} from "@/api/integrations";`</p>
                  {[
                    { name: "InvokeLLM", desc: "LLM interaction." },
                    { name: "UploadFile", desc: "File uploads." },
                    { name: "ExtractDataFromUploadedFile", desc: "Structured data extraction." },
                    { name: "SendEmail", desc: "Email sending." }
                  ].map(int => (
                    <div key={int.name} className="mb-4">
                      <h4 className="text-lg font-medium">{int.name}</h4>
                      <p className="text-sm text-gray-600">{int.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Page Structure Section */}
          {activeTopic === 'pages' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Page Structure</h2>
              <p className="mb-4">Key pages in MyFinApp:</p>
              <Tabs defaultValue="core">
                <TabsList className="mb-4">
                  <TabsTrigger value="core">Core</TabsTrigger>
                  <TabsTrigger value="auth">Auth</TabsTrigger>
                  <TabsTrigger value="utility">Utility</TabsTrigger>
                </TabsList>
                <TabsContent value="core">
                  {[
                    { name: "Dashboard.js", desc: "Main financial summary hub.", url: "/Dashboard" },
                    { name: "Transactions.js", desc: "Transaction history and management.", url: "/Transactions" },
                    { name: "Goals.js", desc: "Financial goals management.", url: "/Goals" },
                    { name: "Sources.js", desc: "Transaction sources/accounts management.", url: "/Sources" }
                  ].map(page => (
                    <div key={page.name} className="bg-white p-4 rounded-lg shadow-sm mb-4">
                      <h3 className="text-lg font-medium">{page.name}</h3>
                      <p className="text-gray-700 text-sm">{page.desc}</p>
                      <p className="text-xs text-gray-500 mt-1">URL: {page.url}</p>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="auth">
                  {[
                    { name: "home.js", desc: "Landing page with login/register.", url: "/home or /" },
                    { name: "Register.js", desc: "Custom user registration.", url: "/Register" },
                    { name: "Onboarding.js", desc: "New user setup wizard.", url: "/Onboarding" }
                  ].map(page => (
                     <div key={page.name} className="bg-white p-4 rounded-lg shadow-sm mb-4">
                      <h3 className="text-lg font-medium">{page.name}</h3>
                      <p className="text-gray-700 text-sm">{page.desc}</p>
                      <p className="text-xs text-gray-500 mt-1">URL: {page.url}</p>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="utility">
                  {[
                    { name: "AddSource.js", desc: "Adding new transaction sources.", url: "/AddSource" },
                    { name: "CategoryTransactions.js", desc: "Detailed view for a category.", url: "/CategoryTransactions" },
                    { name: "Documentation.js", desc: "This documentation page.", url: "/Documentation" }
                  ].map(page => (
                     <div key={page.name} className="bg-white p-4 rounded-lg shadow-sm mb-4">
                      <h3 className="text-lg font-medium">{page.name}</h3>
                      <p className="text-gray-700 text-sm">{page.desc}</p>
                      <p className="text-xs text-gray-500 mt-1">URL: {page.url}</p>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {/* User Flows Section */}
          {activeTopic === 'flows' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">User Flows</h2>
              <p className="mb-4">Main user navigation paths:</p>
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-medium mb-2">Registration & Onboarding</h3>
                  <ol className="list-decimal pl-5 text-sm space-y-1">
                    <li>Visit /home → Click Register → /Register page.</li>
                    <li>Complete form → Account created (custom backend) & UserPreference in Base44.</li>
                    <li>Redirect to /Onboarding → Complete steps → Update UserPreference.</li>
                    <li>Redirect to /Dashboard. `has_completed_onboarding` is true.</li>
                  </ol>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-medium mb-2">Login Flow</h3>
                  <ol className="list-decimal pl-5 text-sm space-y-1">
                    <li>Visit /home → Click Login → Base44 Login page.</li>
                    <li>Authenticate → Session established.</li>
                    <li>Redirect to /Dashboard (or /Onboarding if incomplete).</li>
                  </ol>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-medium mb-2">Transaction Import</h3>
                  <ol className="list-decimal pl-5 text-sm space-y-1">
                    <li>/Sources → Add Account/Upload CSV → /AddSource.</li>
                    <li>Upload CSV → Processed by `ExtractDataFromUploadedFile` → TransactionSource created.</li>
                    <li>Transactions created in Base44 → User reviews/categorizes on /Transactions.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
          
          {/* Backend Integration Section */}
          {activeTopic === 'integration' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Backend Integration</h2>
              <p className="mb-4">
                Use Base44 Backend Functions (`functions/`) for custom server-side logic or external API connections.
              </p>
              <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h3 className="text-xl font-medium mb-2">Using Backend Functions</h3>
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                  <li>Define function in `functions/yourFunctionName.js` (Deno Deploy handler).</li>
                  <li>
                    Example Structure:
                    <pre className="bg-gray-50 p-3 rounded-md overflow-auto mt-1 text-xs">
{`import { createClient } from 'npm:@base44/sdk@0.1.0';
const base44 = createClient({ appId: Deno.env.get('BASE44_APP_ID') });

Deno.serve(async (req) => {
  // 1. Authenticate (IMPORTANT!)
  const authHeader = req.headers.get('Authorization');
  // ... verify token with base44.auth.me() ...
  const user = await base44.auth.me();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const payload = await req.json();
  try {
    // Your logic: e.g., call external API
    // const externalApiResp = await fetch('https://your-api.com', { ... });
    // const data = await externalApiResp.json();
    const data = { message: "Success from custom backend", userEmail: user.email, received: payload };
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});`}
                    </pre>
                  </li>
                  <li>Call from frontend: `import {"{yourFunctionName}"} from '@/api/functions/yourFunctionName'; const response = await yourFunctionName(payload);`</li>
                  <li>Secrets: Use `requestSecrets` action. Access via `Deno.env.get("SECRET_NAME")`.</li>
                </ol>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-medium mb-2">Replacing Entity Operations</h3>
                <p className="text-sm">
                  To use your own backend for all data:
                  1. Create backend functions for CRUD operations for your data types.
                  2. Call these functions from frontend instead of Base44 Entity SDK methods.
                  3. Still use Base44 for user authentication to secure your backend functions.
                </p>
              </div>
            </div>
          )}
          
          {/* Custom Authentication Section */}
          {activeTopic === 'auth' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Custom Authentication</h2>
              <p className="mb-4">
                For a fully custom login/registration system beyond the built-in Base44 `/Login` and the current `Register.js`:
              </p>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-1">1. Backend Functions</h3>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>`registerUserCustom.js`: Accepts credentials, registers in YOUR backend, links/creates Base44 user (critical for token), creates `UserPreference`.</li>
                    <li>`loginUserCustom.js`: Authenticates against YOUR backend, retrieves/generates Base44 token.</li>
                    <li>`checkAuthStatusCustom.js` (Recommended): Verifies Base44 token.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">2. Frontend Pages</h3>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>New `pages/CustomLoginPage.js`: Form calls `loginUserCustom`. Stores token.</li>
                    <li>Update `pages/Register.js` to call `registerUserCustom`.</li>
                    <li>Update `pages/home.js` links.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">3. Session Management</h3>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Store Base44 token (localStorage/sessionStorage).</li>
                    <li>Attach token to all backend function requests (`Authorization: Bearer token`).</li>
                    <li>Protected Routes: Check auth status on page load; redirect if needed.</li>
                    <li>Logout: Clear token, redirect.</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-1">Crucial: All interactions with Base44 services need a valid Base44 user token.</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Theme Customization Section */}
          {activeTopic === 'theme' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Theme Customization</h2>
              <p className="mb-4">
                Customize look and feel via CSS variables in `Layout.js` within the global style tag.
              </p>
              <h3 className="text-xl font-medium mt-6 mb-3">Key CSS Variables</h3>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
{`:root {
  --primary-start: #00C6FF;
  --primary-end: #0072FF;
  --accent-start: #FF758C;
  --accent-end: #FF7EB3;
  --surface: #FFFFFF;
  --text-primary: #212121;
  /* ... and others ... */
}`}
              </pre>
              <h3 className="text-xl font-medium mt-6 mb-3">How to Customize</h3>
              <ol className="list-decimal pl-5 text-sm space-y-1">
                <li>Open `Layout.js`.</li>
                <li>Locate the global style block.</li>
                <li>Modify CSS variable values in `:root`.</li>
                <li>Save; changes reflect live.</li>
              </ol>
              <p className="mt-2 text-sm">Tailwind classes use these variables (e.g., `bg-[var(--surface)]`).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}