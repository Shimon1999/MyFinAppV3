import React from 'react';
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ExportGuide() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Exporting Your MyFinApp Code</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-medium mb-4">Exporting Your Code</h2>
          <p className="mb-4">
            To export your MyFinApp code from Base44:
          </p>
          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <p className="font-medium">Use the Export function</p>
              <p className="text-sm text-gray-600">
                In the Base44 workspace, look for an "Export" or "Download" option in the main menu or project settings. 
                This should allow you to download a ZIP file containing all your project files.
              </p>
            </li>
            <li>
              <p className="font-medium">Extract the ZIP file</p>
              <p className="text-sm text-gray-600">
                Once downloaded, extract the ZIP file to a local directory on your computer.
              </p>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-4">Pushing to GitHub</h2>
          <p className="mb-4">
            After exporting your code, you can push it to GitHub using these steps:
          </p>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="newrepo">
              <AccordionTrigger className="text-lg font-medium">Creating a New GitHub Repository</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <p>Go to <a href="https://github.com/new" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">github.com/new</a></p>
                  </li>
                  <li>
                    <p>Name your repository (e.g., "myfinapp")</p>
                  </li>
                  <li>
                    <p>Choose public or private visibility</p>
                  </li>
                  <li>
                    <p>Click "Create repository"</p>
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="command">
              <AccordionTrigger className="text-lg font-medium">Command Line Steps</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">Open a terminal or command prompt and run:</p>
                <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm mb-4">
                  <pre>{`# Navigate to your extracted project folder
cd path/to/extracted/myfinapp

# Initialize a Git repository
git init

# Add all files to the repository
git add .

# Commit the files
git commit -m "Initial commit of MyFinApp"

# Add your GitHub repository as a remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push your code to GitHub
git push -u origin main
`}</pre>
                </div>
                <p className="text-sm text-gray-600">
                  Replace "YOUR_USERNAME" and "YOUR_REPO_NAME" with your actual GitHub username and repository name.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 mt-4">
                  <p className="font-medium mb-1">Note:</p>
                  <p>If you're using GitHub's default branch naming, you might need to use "main" instead of "master" in the last command. If you get an error, try:</p>
                  <code className="block mt-2">git push -u origin main</code>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="github">
              <AccordionTrigger className="text-lg font-medium">Using GitHub Desktop</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p>For a more visual interface:</p>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <p>Download and install <a href="https://desktop.github.com/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">GitHub Desktop</a></p>
                  </li>
                  <li>
                    <p>Open GitHub Desktop</p>
                  </li>
                  <li>
                    <p>Go to File &gt; Add Local Repository</p>
                  </li>
                  <li>
                    <p>Browse to your extracted project folder and select it</p>
                  </li>
                  <li>
                    <p>Click "Publish repository" button</p>
                  </li>
                  <li>
                    <p>Choose the GitHub.com repository name, description, etc.</p>
                  </li>
                  <li>
                    <p>Click "Publish Repository"</p>
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-4">Local Development</h2>
          <p className="mb-4">
            If you want to run and develop your MyFinApp locally after exporting:
          </p>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-3">Setting Up Local Environment</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <p className="font-medium">Install Node.js and npm</p>
                <p className="text-sm text-gray-600">
                  Download and install from <a href="https://nodejs.org/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">nodejs.org</a>
                </p>
              </li>
              <li>
                <p className="font-medium">Install dependencies</p>
                <p className="text-sm text-gray-600">
                  Navigate to your project directory in a terminal and run: <code>npm install</code>
                </p>
              </li>
              <li>
                <p className="font-medium">Environment setup</p>
                <p className="text-sm text-gray-600">
                  Create a <code>.env</code> file with necessary environment variables (refer to Base44 documentation for specific variables needed).
                </p>
              </li>
              <li>
                <p className="font-medium">Start development server</p>
                <p className="text-sm text-gray-600">
                  Run <code>npm run dev</code> or the appropriate start command from your package.json
                </p>
              </li>
            </ol>
            <div className="bg-amber-50 p-4 rounded-lg text-amber-700 mt-6 text-sm">
              <p className="font-medium">Important:</p>
              <p>
                You'll need to replace Base44 SDK references with your own backend implementation, or set up API keys and connection details for any third-party services used in the application.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-4">Backend Considerations</h2>
          <p className="mb-4">
            MyFinApp relies on Base44's built-in data storage (entities) and authentication. If moving to your own infrastructure:
          </p>
          <ul className="list-disc pl-6 space-y-3">
            <li>Replace Entity SDK calls with your own API endpoints</li>
            <li>Implement authentication to replace Base44's system</li>
            <li>Set up database tables that mirror the entity structure</li>
            <li>Rewrite backend functions to work with your server environment</li>
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            For detailed instructions on backend integration, refer to the "Backend Integration" section in the Documentation.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-center text-gray-600">
          For more help with GitHub, refer to <a href="https://docs.github.com/en/get-started" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">GitHub's documentation</a>.
        </p>
      </div>
    </div>
  );
}