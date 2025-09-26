# 🧠 Fluentia - AI-Powered Accessibility for Digital Reading

> **Making digital content accessible for everyone through intelligent text transformation**

[![Demo](https://img.shields.io/badge/Demo-Live%20Website-blue?style=for-the-badge)](https://your-demo-url.com)
[![Extension](https://img.shields.io/badge/Extension-Chrome%20Web%20Store-green?style=for-the-badge)](https://chrome.google.com/webstore)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-red?style=for-the-badge)](http://localhost:8000)

## 🎯 Project Overview

**Fluentia** is a comprehensive accessibility solution that transforms any digital text to be more readable and accessible for people with different cognitive conditions. Built with Google Gemini AI, it offers both a browser extension for web content and a PDF reader for documents.

### 🌟 Key Features

- **🎨 4 Accessibility Profiles**: Dyslexia, ADHD, Aphasia, and Autism
- **🌐 Browser Extension**: Transform any highlighted text on any website
- **📄 PDF Reader**: Upload and process PDF documents with accessibility adaptations
- **🤖 AI-Powered**: Uses Google Gemini 2.5 Flash for intelligent text transformation
- **🔊 Text-to-Speech**: Built-in TTS with profile-specific speech rates
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+ (for development)
- Google Gemini API key

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/fluentia.git
   cd fluentia/Build-with-AI-2025
   ```

2. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**

   ```bash
   # Create .env file
   echo "GEMINI_API_KEY=your_api_key_here" > .env
   ```

4. **Run the backend server**
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Open the website**

   ```bash
   # Navigate to the website directory
   cd website

   # Serve the files (using Python's built-in server)
   python -m http.server 8001
   ```

   Or simply open `index.html` in your browser.

### Browser Extension Setup

1. **Load the extension**

   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `highlight-to-api` folder

2. **Configure the backend URL**
   - Click the extension icon and set the backend URL to `http://localhost:8000`

## 🎮 How to Use

### Browser Extension

1. **Highlight any text** on any website
2. **Right-click** and select "Transform with Fluentia" or use `Ctrl+Shift+Y`
3. **Choose an accessibility profile** (Dyslexia, ADHD, Aphasia, or Autism)
4. **View the transformed text** in a popup
5. **Listen with TTS** or copy the adapted content

### PDF Reader

1. **Visit the website** and navigate to the "Live Demo" section
2. **Upload a PDF file** using the file input
3. **Select an accessibility profile** from the dropdown
4. **Configure options** specific to your chosen profile
5. **Click "Transform Content"** to process the PDF
6. **Toggle between original and adapted views**
7. **Download the adapted text** or use text-to-speech

## 🧠 Accessibility Profiles

### 🧠 Dyslexia

- **Clear, concise wording** with simplified sentence structures
- **Dyslexia-friendly fonts** (OpenDyslexic) with enhanced spacing
- **Configurable line height and letter spacing** for optimal readability
- **Visual formatting** optimized for easier reading

### ⚡ ADHD

- **Content chunking** - breaks long text into digestible pieces
- **Bullet point summaries** for quick comprehension
- **Focus optimization** with clear paragraph breaks
- **Structured formatting** to maintain attention

### 🗣️ Aphasia

- **Simplified vocabulary** using common, everyday words
- **Short sentences** with one idea per sentence
- **Clear structure** with logical flow
- **Reduced complexity** while preserving meaning

### 🌟 Autism

- **Literal language** avoiding idioms and figurative speech
- **Explicit context** with emoji clarification where helpful
- **Direct communication** style
- **Consistent formatting** for predictable reading experience

## 🏗️ Technical Architecture

### Backend (FastAPI)

```
├── main.py              # FastAPI application with /transform endpoint
├── gemini_client.py     # Google Gemini AI integration
├── schemas.py           # Pydantic models for request/response
└── requirements.txt     # Python dependencies
```

### Frontend (Vanilla JS)

```
├── index.html           # Main website with responsive design
├── styles.css           # Modern CSS with accessibility features
├── app.js              # Interactive functionality and API integration
└── OpenDyslexic-Regular.otf  # Dyslexia-friendly font
```

### Browser Extension (Chrome Manifest V3)

```
├── manifest.json        # Extension configuration
├── background.js        # Service worker for API calls
├── content.js          # Content script for text extraction
├── popup.html/js/css   # Extension popup interface
├── options.html/js     # Extension settings page
└── viewer.html/js/css  # Full-screen text viewer
```

## 🔧 API Endpoints

### POST `/transform`

Transform text for accessibility.

**Request Body:**

```json
{
  "text": "Your text to transform",
  "disability_type": "dyslexia|adhd|aphasia|autism",
  "options": {
    "chunking": true,
    "bulletSummary": true,
    "simplify": true,
    "shortSentences": true,
    "idiomSimplification": true,
    "useEmojis": true,
    "fontMode": true
  }
}
```

**Response:**

```json
{
  "text": "Transformed accessible text"
}
```

### GET `/health`

Health check endpoint.

**Response:**

```json
{
  "status": "OK"
}
```

## 🎨 Design Features

### Modern UI/UX

- **Gradient text effects** and smooth animations
- **Responsive grid layouts** that adapt to all screen sizes
- **Interactive elements** with hover effects and transitions
- **Accessible color schemes** with high contrast support

### Accessibility-First Design

- **Semantic HTML** with proper ARIA labels
- **Keyboard navigation** support throughout
- **Screen reader compatibility** with descriptive alt text
- **Reduced motion** support for users with vestibular disorders

### Visual Appeal

- **Floating animations** and scroll-triggered effects
- **Modern typography** with Inter font family
- **Card-based layouts** with subtle shadows and borders
- **Icon integration** with Font Awesome for visual clarity

## 🚀 Demo Scenarios

### For Judges

1. **Try the Live Demo**

   - Upload a complex academic paper or technical document
   - Switch between different accessibility profiles
   - Compare original vs. adapted text side-by-side

2. **Test the Browser Extension**

   - Visit any news website or blog
   - Highlight a paragraph of text
   - Use the extension to see real-time transformation

3. **Explore Accessibility Features**
   - Test text-to-speech with different profiles
   - Adjust dyslexia font settings
   - Experience the visual adaptations

## 🏆 Hackathon Impact

### Problem Solved

- **Accessibility Gap**: Millions of people struggle with reading digital content due to cognitive conditions
- **One-Size-Fits-All**: Current accessibility tools are limited and don't address specific cognitive needs
- **Complex Implementation**: Existing solutions require extensive setup and technical knowledge

### Our Solution

- **AI-Powered**: Intelligent text adaptation using state-of-the-art language models
- **Multi-Platform**: Browser extension + web application for maximum reach
- **Profile-Specific**: Tailored adaptations for different cognitive conditions
- **Easy to Use**: Simple interface that works immediately

### Technical Innovation

- **Google Gemini Integration**: Leveraging cutting-edge AI for natural language processing
- **Real-time Processing**: Instant text transformation without delays
- **Scalable Architecture**: FastAPI backend with efficient PDF processing
- **Modern Web Standards**: Progressive enhancement with fallbacks

## 🔮 Future Enhancements

- **Mobile App**: Native iOS and Android applications
- **More Languages**: Support for multiple languages beyond English
- **Custom Profiles**: User-defined accessibility preferences
- **Analytics Dashboard**: Usage insights and effectiveness metrics
- **Integration APIs**: Connect with popular platforms (WordPress, Medium, etc.)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Backend development
pip install -r requirements.txt
python -m uvicorn main:app --reload

# Frontend development
cd website
python -m http.server 8001
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful language processing capabilities
- **OpenDyslexic** for the dyslexia-friendly font
- **PDF.js** for client-side PDF processing
- **FastAPI** for the robust backend framework
- **Chrome Extension APIs** for seamless browser integration

## 📞 Contact

- **Project Lead**: [Your Name](mailto:your.email@example.com)
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **LinkedIn**: [Your Profile](https://linkedin.com/in/yourprofile)

---

**Built with ❤️ for accessibility and inclusion**

_Making the digital world more accessible, one text at a time._
