# Structure Drawing Tool - Advanced Diagramming Application
   <td align="center" style="padding: 50px;">
        <img src="public/app-icon-red.svg" width="300" height="300" style="border-radius: 10px; flex: 1; align-items: center; justify-content: center; padding: 10px; margin: 10px; box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);" />
      </td>

[![Next.js Version](https://img.shields.io/badge/Next.js-15%2B-blue.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-blue.svg)](https://tailwindcss.com/)

[![Read in Arabic](https://img.shields.io/badge/Read%20in%20Arabic-%E2%9C%85-white?style=for-the-badge&logo=readme&logoColor=white)](README-ar.md)

Structure Drawing Tool is a sophisticated web-based diagramming application built with Next.js and TypeScript, featuring native Arabic language support and advanced drawing capabilities. The application provides a seamless, modern experience for creating professional diagrams, flowcharts, and structural visualizations with powerful AI-enhanced features.

<div align="center">
  <table>
    <tr>
      <td align="center" style="padding: 50px;">
        <img src="public/screenshots/diagram-editor.png" width="300" height="200" style="border-radius: 10px; box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);" />
      </td>
      <td align="center" style="padding: 50px;">
        <img src="public/screenshots/ai-chat.png" width="300" height="200" style="border-radius: 10px; box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);" />
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 50px;">
        <img src="public/screenshots/dashboard.png" width="300" height="200" style="border-radius: 10px; box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);" />
      </td>
      <td align="center" style="padding: 50px;">
        <img src="public/screenshots/templates.png" width="300" height="200" style="border-radius: 10px; box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);" />
      </td>
    </tr>
  </table>
</div>

## ✨ Key Features

[![Features](https://img.shields.io/badge/Features-%E2%9C%85-white?style=for-the-badge&logo=readme&logoColor=white)](FEATURES.md)

<img src="public/collactions-logo.svg" width="150" height="150" />

### 🎨 **Advanced Drawing Engine**
- **Interactive Canvas**: High-performance drawing canvas with zoom and pan
- **Smart Shapes**: Intelligent shape recognition and auto-alignment
- **Vector Graphics**: Scalable vector-based diagrams for crisp rendering
- **Layer Management**: Multi-layer support for complex diagrams
- **Grid & Guidelines**: Precision drawing with snap-to-grid functionality

### 🤖 **AI-Powered Features**
- **Smart Suggestions**: AI-powered shape and layout recommendations
- **Auto-Generation**: Generate diagrams from text descriptions
- **Enhanced Chat**: Interactive AI assistant for diagram creation
- **Template Recognition**: AI-driven template suggestions
- **Content Analysis**: Intelligent diagram analysis and optimization

### 🌐 **Bilingual Support**
- **Native Arabic Support**: Full RTL layout and Arabic text rendering
- **Dual Interface**: Seamless English-Arabic interface switching
- **Localized Content**: Context-aware content in both languages
- **RTL Diagrams**: Native right-to-left diagram flow support

### 🎨 **Modern User Interface**
- **Dark/Light Mode**: Elegant theming with user preferences
- **Responsive Design**: Optimized for all screen sizes
- **Material Design**: Clean, intuitive interface design
- **Accessibility**: Full WCAG 2.1 compliance

### 🔧 **Professional Tools**
- **Export Options**: Multiple export formats (PNG, SVG, PDF, JSON)
- **Template Library**: Pre-built professional templates
- **Collaboration**: Real-time collaborative editing
- **Version Control**: Diagram versioning and history
- **Cloud Sync**: Automatic cloud synchronization

### 🔐 **Security & Privacy**
- **Secure Authentication**: Clerk-based secure login system
- **Data Encryption**: End-to-end encrypted data storage
- **Privacy-First**: Local processing with optional cloud sync
- **Permission Management**: Granular access controls

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- pnpm 8.0 or higher
- Git

### Run locally

```bash
git clone https://github.com/Msr7799/collactions.git
cd collactions
pnpm install
cp .env.example .env.local
# edit .env.local to provide your keys (Clerk, OpenAI/Anthropic if used)
pnpm dev

# Open http://localhost:3000
```

Notes:
- The app uses MCP integration under `src/lib/mcp.ts` and the MCP API routes in `src/app/api/mcp`.
- AI backends are pluggable and configured via environment variables. The project integrates with free model endpoints where possible — see `src/app/api/generate-image/route.ts` and `src/app/api/chat/*` for examples.

## Project Layout (high level)

```
src/
├─ app/                # Next.js App Router (pages, API routes, terminal)
├─ components/         # UI components (ai, layout, prompts, providers)
├─ contexts/           # React contexts (LanguageContext, ThemeContext)
├─ lib/                # Utilities (api, mcp, models, translations)
├─ config/             # mcp-servers.json and related config
└─ styles/             # CSS / fonts
```

## Important Files to Review

- `src/app/terminal/page.tsx` — terminal emulator and nano-like editor behavior
- `src/app/prompts/CodeBlock.tsx` — the advanced code block UI
- `src/app/api/mcp/templates/route.ts` — MCP templates API
- `src/lib/mcp.ts` — MCP client/server utilities

## Environment variables

Create `.env.local` (example keys):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Optional AI service keys (if you want to use external models)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Technologies Used

- Next.js (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Clerk (authentication)
- Model Context Protocol (MCP) integration (`@modelcontextprotocol/sdk`)
- Free AI model integrations (configurable via environment variables)
- Zustand (state management)
- Lucide icons, MUI (select components)

## Development notes

- Keep templates and MCP server configuration in `config/mcp-servers.json` and the API routes under `src/app/api/mcp`.
- The language system uses a cookie + middleware for SSR-friendly language selection in `middleware.ts` and `src/contexts/LanguageContext.tsx`.
- If you add new AI backends, implement them behind `src/lib/api.ts` and the API routes so the UI can call them securely.

## Contributing

Contributions are welcome — fork, create a feature branch, and open a pull request. Please keep language support and tests in mind.

## License

MIT — see [LICENSE](LICENSE)

---

If you want, I can also add a short developer section that lists how to run unit tests, linting commands, and how to add MCP templates programmatically.
