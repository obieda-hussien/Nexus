import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownDisplay = ({ content, className = "" }) => {
  if (!content) {
    return (
      <div className="text-purple-300 text-center py-8">
        <p>لا يوجد محتوى لعرضه</p>
      </div>
    );
  }

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        className="text-white"
        components={{
          // Style markdown elements for RTL and dark theme
          h1: ({children}) => (
            <h1 className="text-3xl font-bold text-white mb-6 border-b border-purple-400 pb-2">
              {children}
            </h1>
          ),
          h2: ({children}) => (
            <h2 className="text-2xl font-bold text-white mb-4 mt-8">
              {children}
            </h2>
          ),
          h3: ({children}) => (
            <h3 className="text-xl font-bold text-white mb-3 mt-6">
              {children}
            </h3>
          ),
          h4: ({children}) => (
            <h4 className="text-lg font-bold text-white mb-2 mt-4">
              {children}
            </h4>
          ),
          p: ({children}) => (
            <p className="text-purple-100 mb-4 leading-relaxed text-right">
              {children}
            </p>
          ),
          strong: ({children}) => (
            <strong className="text-white font-bold bg-blue-500/20 px-1 rounded">
              {children}
            </strong>
          ),
          em: ({children}) => (
            <em className="text-purple-200 italic">
              {children}
            </em>
          ),
          ul: ({children}) => (
            <ul className="text-purple-100 mb-4 mr-6 list-disc space-y-1">
              {children}
            </ul>
          ),
          ol: ({children}) => (
            <ol className="text-purple-100 mb-4 mr-6 list-decimal space-y-1">
              {children}
            </ol>
          ),
          li: ({children}) => (
            <li className="mb-1 text-right">
              {children}
            </li>
          ),
          blockquote: ({children}) => (
            <blockquote className="border-r-4 border-blue-400 pr-4 my-6 bg-blue-500/10 py-3 rounded-l-lg">
              <div className="text-blue-100">
                {children}
              </div>
            </blockquote>
          ),
          code: ({children}) => (
            <code className="bg-black/40 text-green-300 px-2 py-1 rounded text-sm font-mono">
              {children}
            </code>
          ),
          pre: ({children}) => (
            <pre className="bg-black/60 text-green-300 p-4 rounded-lg overflow-x-auto my-4 border border-green-500/20">
              {children}
            </pre>
          ),
          a: ({children, href}) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300 transition-colors"
            >
              {children}
            </a>
          ),
          table: ({children}) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-purple-400/30">
                {children}
              </table>
            </div>
          ),
          th: ({children}) => (
            <th className="border border-purple-400/30 bg-purple-500/20 px-3 py-2 text-white font-semibold text-right">
              {children}
            </th>
          ),
          td: ({children}) => (
            <td className="border border-purple-400/30 px-3 py-2 text-purple-100 text-right">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="border-purple-400/30 my-6" />
          ),
          img: ({src, alt}) => (
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full h-auto rounded-lg border border-purple-400/30 my-4"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownDisplay;