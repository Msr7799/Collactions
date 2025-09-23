# Structure Drawing Tool - Advanced Diagramming Application
  <p align="center">
  <img src="public/app-icon-red.svg" alt="App Icon" width="300" height="300">
</p>


[![Next.js Version](https://img.shields.io/badge/Next.js-14.0+-blue.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0+-blue.svg)](https://tailwindcss.com/)

[![Releases](https://img.shields.io/badge/Releases-green?style=for-the-badge&logo=github)](https://github.com/your-repo/releases)

## Overview

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

  <p align="center">
  <img src="public/small_icon_lime.svg" alt="App Icon" width="300" height="300">
</p>

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

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/structure-drawing-tool.git
   cd structure-drawing-tool
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| Web (Desktop) | ✅ | Full support |
| Web (Mobile) | ✅ | Responsive design |
| PWA | ✅ | Offline capable |
| Electron | 🔄 | In development |

## 🏗️ Project Structure

```
src/
├── app/                        # Next.js 14 App Router
│   ├── api/                   # API routes
│   │   └── chat/             # AI chat endpoints
│   ├── dashboard/            # Main dashboard
│   ├── enhanced-chat/        # AI chat interface
│   └── prompts/             # AI prompt management
├── components/              # React components
│   ├── ai/                 # AI-related components
│   ├── layout/            # Layout components
│   └── prompts/          # Prompt components
├── contexts/             # React contexts
│   └── LanguageContext.tsx # Language switching
├── lib/                 # Utility libraries
│   ├── api.ts          # API utilities
│   ├── mcp.ts         # MCP integration
│   └── utils.ts      # General utilities
└── types/           # TypeScript type definitions
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Database
DATABASE_URL=your_database_url

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Available Drawing Tools

#### Shape Tools
- **Basic Shapes**: Rectangle, Circle, Triangle, Line
- **Flowchart**: Process, Decision, Connector, Terminal
- **Network**: Server, Router, Database, Cloud
- **UML**: Class, Sequence, Use Case diagrams

#### AI Features
- **Smart Layout**: Automatic diagram organization
- **Text-to-Diagram**: Generate diagrams from descriptions
- **Style Transfer**: Apply consistent styling
- **Content Suggestions**: Intelligent content recommendations

## 🎯 Usage

### Basic Diagram Creation
1. Launch the application and sign in
2. Select "New Diagram" from the dashboard
3. Choose a template or start blank
4. Use the toolbar to add shapes and connections
5. Customize styling and properties

### AI-Assisted Drawing
1. Open the AI chat panel
2. Describe the diagram you want to create
3. The AI will generate suggestions and layouts
4. Refine and customize the generated content

### Collaboration
1. Share your diagram with team members
2. Enable real-time collaboration mode
3. See live cursors and changes
4. Use comments for feedback

### Export & Sharing
1. Click the export button in the toolbar
2. Choose your preferred format (PNG/SVG/PDF)
3. Configure export settings
4. Download or share the diagram

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain bilingual support (English/Arabic)
- Write comprehensive tests
- Update documentation
- Ensure responsive design

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Your Name**
- 📧 Email: your.email@example.com
- 🌐 GitHub: [Your GitHub Profile](https://github.com/yourusername)

## 🐛 Bug Reports & Feature Requests

If you encounter any issues or have suggestions for improvements:

📧 **Email**: your.email@example.com

Please include:
- Browser and OS information
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots (if applicable)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- OpenAI and Anthropic for AI capabilities
- Tailwind CSS for styling system
- Open-source community contributors

---

**Structure Drawing Tool** - Empowering visual communication with intelligent diagramming

Built with ❤️ for the global community
