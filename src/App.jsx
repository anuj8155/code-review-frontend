import { useState, useEffect } from 'react';
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from 'axios';
import { 
  Code2, 
  Copy, 
  Wand2, 
  Sparkles, 
  CheckCircle, 
  ArrowLeft,
  Terminal,
  Zap
} from 'lucide-react';
import './App.css';

function App() {
  const [code, setCode] = useState(`function calculateFibonacci(n) {
  if (n <= 1) return n;
  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
}

// Usage example
console.log(calculateFibonacci(10));`);
  
  const [review, setReview] = useState('');
  const [displayedReview, setDisplayedReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showEditor, setShowEditor] = useState(true);

  useEffect(() => {
    prism.highlightAll();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function reviewCode() {
    setLoading(true);
    setDisplayedReview('');
    
    if (isMobile) {
      setShowEditor(false);
    }

    try {
      const response = await axios.post('https://code-review-backend-roan.vercel.app/api/get-review', { code });
      setReview(response.data);
      simulateTypingEffect(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error("Error fetching review:", errorMessage);
      setDisplayedReview("Error fetching review. Please try again. " + errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function simulateTypingEffect(text) {
    let i = 0;
    setDisplayedReview('');
    
    const baseSpeed = 5;
    const speedAdjustment = Math.min(Math.floor(text.length / 500), 3);
    const typingSpeed = baseSpeed + speedAdjustment;
    const charsPerTick = text.length > 1000 ? 3 : 1;
    
    const interval = setInterval(() => {
      if (i < text.length) {
        const nextChars = text.slice(i, i + charsPerTick);
        setDisplayedReview(prev => prev + nextChars);
        i += charsPerTick;
      } else {
        clearInterval(interval);
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(review).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }

  function handleNewReview() {
    setShowEditor(true);
    setDisplayedReview('');
    setReview('');
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-content">
          <Terminal className="nav-icon" size={28} />
          <h1 className="nav-title">CodeReview AI</h1>
        </div>
      </nav>

      <div className="main-container">
        <div className={`editor-container ${isMobile && !showEditor ? 'mobile-hidden' : ''}`}>
          <div className="panel-header">
            <div className="header-left">
              <Code2 className="header-icon" size={22} />
              <span className="header-text">Code Editor</span>
            </div>
          </div>
          <div className="editor-content">
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={code => prism.highlight(code, prism.languages.javascript, 'javascript')}
              padding={20}
              style={{
                fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
                fontSize: 14,
                lineHeight: 1.6,
                backgroundColor: 'transparent',
                color: '#ffffff',
                height: '100%',
                width: '100%',
                caretColor: '#00d4ff',
              }}
              textareaProps={{
                style: {
                  outline: 'none',
                  resize: 'none',
                }
              }}
            />
          </div>
          <div className="panel-footer">
            <button
              onClick={reviewCode}
              disabled={loading}
              className="review-button"
              aria-label={loading ? 'Analyzing code...' : 'Review code with AI'}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Analyzing Code...</span>
                </>
              ) : (
                <>
                  <Sparkles size={22} />
                  <span>Review with AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className={`review-container ${isMobile && showEditor ? 'mobile-hidden' : ''}`}>
          <div className="panel-header">
            <div className="header-left">
              <Zap className="header-icon" size={22} />
              <span className="header-text">AI Analysis</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {review && (
                <button
                  onClick={copyToClipboard}
                  className="copy-button"
                  aria-label="Copy review to clipboard"
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle size={18} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
              {isMobile && !showEditor && (
                <button
                  onClick={handleNewReview}
                  className="copy-button"
                  aria-label="Start new review"
                >
                  <ArrowLeft size={18} />
                  <span>Back to Editor</span>
                </button>
              )}
            </div>
          </div>
          <div className="review-content">
            {displayedReview ? (
              <Markdown
                rehypePlugins={[rehypeHighlight]}
                className="markdown-content"
              >
                {displayedReview}
              </Markdown>
            ) : (
              <div className="empty-state">
                <div className="empty-state-content">
                  <Sparkles size={48} className="empty-icon" />
                  <p>Paste your code in the editor and click "Review with AI" to get intelligent suggestions and improvements</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
