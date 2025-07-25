import { useNavigate } from 'react-router-dom';

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">About TOYBOX</h1>
        <button
          onClick={() => navigate('/')}
          className="border border-gray-300 hover:bg-gray-100 px-3 py-1 rounded text-sm"
        >
          Back to Gallery
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-blue-800 mb-1">TOYBOX Template Repository</h2>
          <p className="text-blue-700">
            This is a template repository for creating your own TOYBOX site. Fork or use as template!
          </p>
        </div>
        <a 
          href="https://github.com/Baikhojun/toybox-yooshin" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-3 md:mt-0 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          View on GitHub
        </a>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">What is TOYBOX?</h2>
          <p className="text-gray-700">
            TOYBOX is a zero-friction publishing platform for Claude AI artifacts. Create artifacts in Claude Desktop 
            and publish them instantly to your personal gallery site through conversational commands:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-700">
            <li>React components (with full reactivity)</li>
            <li>SVG images</li>
            <li>Mermaid diagrams</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Key Features</h2>
          <ul className="list-disc ml-6 space-y-1 text-gray-700">
            <li>Live component rendering with state management</li>
            <li>SVG rendering with sanitization and download options</li>
            <li>Mermaid diagram visualization with SVG export</li>
            <li>Hierarchical folder system for better organization</li>
            <li>Tagging system for flexible categorization</li>
            <li>Advanced filtering, searching, and sorting</li>
            <li>Automatic type detection based on content</li>
            <li>Complete artifact management (create, edit, delete)</li>
            <li>Import/export functionality for sharing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">How to Use TOYBOX</h2>
          
          <h3 className="text-lg font-medium mt-4 mb-2">Navigating the Gallery</h3>
          <ul className="list-disc ml-6 space-y-1 text-gray-700">
            <li>Use the folder breadcrumb navigation to move between folders</li>
            <li>Click on folder cards to navigate into subfolders</li>
            <li>Use the Home button to return to the root directory</li>
            <li>Apply filters to narrow down artifacts by type, tag, or folder</li>
            <li>Use the search bar to find artifacts by title, description, or tags</li>
          </ul>

          <h3 className="text-lg font-medium mt-4 mb-2">Creating Artifacts</h3>
          <ul className="list-disc ml-6 space-y-1 text-gray-700">
            <li>Click "Create New Artifact" in the gallery</li>
            <li>Fill in title, description, and select a type (or enable auto-detection)</li>
            <li>Choose an existing folder from the dropdown or create a new one</li>
            <li>To create a subfolder, check "Create as subfolder" and select a parent folder</li>
            <li>Add relevant tags for better organization and discoverability</li>
            <li>Paste your code in the editor (the type will be automatically detected if enabled)</li>
            <li>Click "Save Artifact" to store your creation</li>
          </ul>

          <h3 className="text-lg font-medium mt-4 mb-2">Viewing Artifacts</h3>
          <ul className="list-disc ml-6 space-y-1 text-gray-700">
            <li>Click "View" on any artifact card to see the rendered content</li>
            <li>For SVG images, use the "Copy as Image", "Download as PNG", or "Download as SVG" buttons</li>
            <li>For Mermaid diagrams, use the "Download as SVG" button</li>
            <li>The code is displayed below the rendered artifact</li>
            <li>Use "Copy to Clipboard" to copy the code</li>
            <li>Use "Download as File" to save the code as a file</li>
          </ul>

          <h3 className="text-lg font-medium mt-4 mb-2">Managing Artifacts</h3>
          <ul className="list-disc ml-6 space-y-1 text-gray-700">
            <li>Click "Edit" to modify an artifact's properties or code</li>
            <li>Click "Delete" to remove an artifact (with confirmation)</li>
            <li>Use Import/Export in the gallery to share collections</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">How It Works</h2>
          <p className="text-gray-700">
            Artifacts Gallery uses browser localStorage to store your artifacts, which means:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-700">
            <li>Your data persists between sessions without needing a server</li>
            <li>No login or account required</li>
            <li>Your artifacts stay on your device (private by default)</li>
            <li>You can export artifacts to files for sharing or backup</li>
          </ul>
          <p className="mt-3 text-gray-700">
            The application uses various technologies to render different types of content:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-700">
            <li>React components are transpiled and executed directly in the browser</li>
            <li>SVG images are sanitized and rendered safely</li>
            <li>Mermaid diagrams are processed by the Mermaid.js library</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Smart Features</h2>
          
          <h3 className="text-lg font-medium mt-3 mb-1">Automatic Type Detection</h3>
          <p className="text-gray-700">
            The application can automatically detect the correct type (React, SVG, or Mermaid) based on your code content.
            Toggle this feature on/off in the artifact editor. Color indicators show the detected type,
            and you'll receive clear error messages if the type is mismatched.
          </p>
          
          <h3 className="text-lg font-medium mt-3 mb-1">Hierarchical Folders</h3>
          <p className="text-gray-700">
            Create nested folders and subfolders to organize your artifacts. The breadcrumb navigation makes it easy
            to move between different levels of the folder structure, providing a file-explorer-like experience.
          </p>
          
          <h3 className="text-lg font-medium mt-3 mb-1">SVG Support with HTML Comments</h3>
          <p className="text-gray-700">
            SVG content with HTML comments (which often causes issues in other tools) is properly supported and rendered.
            The application can detect SVG content even with comments and provides helpful error messages.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">TOYBOX Platform</h2>
          <p className="text-gray-700">
            TOYBOX transforms Claude artifact creation into a complete publishing platform:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-700">
            <li><strong>Conversational Publishing</strong>: "Publish this to my TOYBOX" - that's it!</li>
            <li><strong>Zero Technical Setup</strong>: GitHub CLI handles all authentication and deployment</li>
            <li><strong>Live Gallery</strong>: Your artifacts appear instantly on your personal site</li>
            <li><strong>Template System</strong>: This repository is the foundation for all TOYBOX sites</li>
            <li><strong>MCP Integration</strong>: Powered by Model Context Protocol for seamless Claude integration</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">License</h2>
          <p className="text-gray-700">
            This project is open source and available under the MIT License, the same as the original Claude Artifact Runner.
          </p>
        </section>

        <div className="pt-4 border-t text-center text-gray-500 text-sm">
          TOYBOX Template Repository - Powered by Claude AI and GitHub Pages
        </div>
      </div>
    </div>
  );
}
