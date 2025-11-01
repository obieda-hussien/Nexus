import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Edit3, HelpCircle } from 'lucide-react';

const MarkdownEditor = ({ value, onChange, placeholder = "Write the article content using Markdown..." }) => {
  const [isPreview, setIsPreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const markdownHelp = [
    { syntax: '# Main Heading', description: 'Heading Level 1' },
    { syntax: '## Subheading', description: 'Heading Level 2' },
    { syntax: '**Bold Text**', description: 'Bold text' },
    { syntax: '*Italic Text*', description: 'Italic text' },
    { syntax: '- List Item', description: 'Bulleted list' },
    { syntax: '1. Numbered Item', description: 'Numbered list' },
    { syntax: '[Link](https://example.com)', description: 'Create a link' },
    { syntax: '`code`', description: 'Inline code' },
    { syntax: '```multi-line code```', description: 'Code block' },
    { syntax: '> Quote', description: 'Blockquote' },
  ];

  const handlePreviewToggle = () => {
    setIsPreview(!isPreview);
  };

  const handleHelpToggle = () => {
    setShowHelp(!showHelp);
  };

  return (
    <div className="space-y-3 bg-gray-900 p-4 rounded-lg border border-gray-600">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handlePreviewToggle}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
              isPreview 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-700 text-gray-200 hover:text-white hover:bg-gray-600'
            }`}
          >
            {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{isPreview ? 'Edit' : 'Preview'}</span>
          </button>
          
          <button
            type="button"
            onClick={handleHelpToggle}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
              showHelp 
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-gray-700 text-gray-200 hover:text-white hover:bg-gray-600'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help</span>
          </button>
        </div>
        
        <div className="text-xs text-gray-400">
          Supports Markdown for advanced formatting
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Markdown Quick Guide</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {markdownHelp.map((item, index) => (
              <div key={index} className="flex flex-col space-y-1">
                <code className="text-blue-300 bg-gray-900 px-2 py-1 rounded text-sm">
                  {item.syntax}
                </code>
                <span className="text-gray-300 text-xs">{item.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor/Preview Area */}
      <div className="border border-gray-600 rounded-lg overflow-hidden min-h-[250px]">
        {isPreview ? (
          <div className="p-4 min-h-[250px] bg-white">
            {value ? (
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  className="text-gray-900"
                  components={{
                    // Enhanced styling for better readability
                    h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">{children}</h1>,
                    h2: ({children}) => <h2 className="text-2xl font-bold text-gray-800 mb-3 mt-6">{children}</h2>,
                    h3: ({children}) => <h3 className="text-xl font-bold text-gray-800 mb-2 mt-4">{children}</h3>,
                    h4: ({children}) => <h4 className="text-lg font-semibold text-gray-800 mb-2 mt-3">{children}</h4>,
                    p: ({children}) => <p className="text-gray-700 mb-4 leading-relaxed text-base">{children}</p>,
                    strong: ({children}) => <strong className="text-gray-900 font-bold">{children}</strong>,
                    em: ({children}) => <em className="text-gray-700 italic">{children}</em>,
                    ul: ({children}) => <ul className="text-gray-700 mb-4 ml-6 list-disc space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="text-gray-700 mb-4 ml-6 list-decimal space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-gray-700">{children}</li>,
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 my-4 bg-gray-50 py-3 italic text-gray-600"> {/* Changed border-r-4 to border-l-4 and pr-4 to pl-4 */}
                        {children}
                      </blockquote>
                    ),
                    code: ({children}) => (
                      <code className="bg-gray-200 text-red-600 px-2 py-1 rounded text-sm font-mono">
                        {children}
                      </code>
                    ),
                    pre: ({children}) => (
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm">
                        {children}
                      </pre>
                    ),
                    a: ({children, href}) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {children}
                      </a>
                    ),
                    table: ({children}) => (
                      <div className="overflow-x-auto my-4">
                        <table className="border-collapse border border-gray-400 w-full">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({children}) => (
                      <th className="border border-gray-400 bg-gray-100 px-4 py-2 text-left font-semibold text-gray-900"> {/* Changed text-right to text-left */}
                        {children}
                      </th>
                    ),
                    td: ({children}) => (
                      <td className="border border-gray-400 px-4 py-2 text-gray-700">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-12 flex flex-col items-center justify-center">
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">Write something to see the preview here</p>
                <p className="text-sm mt-1 opacity-70">Use Markdown format for styling</p>
              </div>
            )}
          </div>
        ) : (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-[250px] p-4 bg-gray-800 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            dir="ltr" // Changed from rtl to ltr
            style={{ minHeight: '250px' }}
          />
        )}
      </div>
      
      {/* Character Count */}
      <div className="text-xs text-gray-400 text-right"> {/* Changed text-left to text-right */}
        {value?.length || 0} characters
      </div>
    </div>
  );
};

export default MarkdownEditor;
