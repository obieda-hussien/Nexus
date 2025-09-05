import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Edit3, HelpCircle } from 'lucide-react';

const MarkdownEditor = ({ value, onChange, placeholder = "اكتب محتوى المقال باستخدام Markdown..." }) => {
  const [isPreview, setIsPreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const markdownHelp = [
    { syntax: '# عنوان رئيسي', description: 'عنوان من المستوى الأول' },
    { syntax: '## عنوان فرعي', description: 'عنوان من المستوى الثاني' },
    { syntax: '**نص غامق**', description: 'نص بخط عريض' },
    { syntax: '*نص مائل*', description: 'نص مائل' },
    { syntax: '- عنصر قائمة', description: 'قائمة نقطية' },
    { syntax: '1. عنصر مرقم', description: 'قائمة مرقمة' },
    { syntax: '[رابط](https://example.com)', description: 'إنشاء رابط' },
    { syntax: '`كود`', description: 'كود مضمن' },
    { syntax: '```كود متعدد الأسطر```', description: 'كتلة كود' },
    { syntax: '> اقتباس', description: 'نص مقتبس' },
  ];

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center space-x-1 space-x-reverse px-3 py-1 rounded-lg text-sm transition-colors ${
              isPreview 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-purple-200 hover:text-white'
            }`}
          >
            {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{isPreview ? 'تحرير' : 'معاينة'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center space-x-1 space-x-reverse px-3 py-1 rounded-lg text-sm bg-white/10 text-purple-200 hover:text-white transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>مساعدة</span>
          </button>
        </div>
        
        <div className="text-xs text-purple-300">
          يدعم Markdown للتنسيق المتقدم
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">دليل Markdown السريع</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {markdownHelp.map((item, index) => (
              <div key={index} className="flex flex-col space-y-1">
                <code className="text-blue-300 bg-black/20 px-2 py-1 rounded text-sm">
                  {item.syntax}
                </code>
                <span className="text-purple-200 text-xs">{item.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor/Preview Area */}
      <div className="border border-white/20 rounded-lg overflow-hidden bg-white/5">
        {isPreview ? (
          <div className="p-4 min-h-[200px]">
            {value ? (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  className="text-white"
                  components={{
                    // Style markdown elements for RTL and dark theme
                    h1: ({children}) => <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-bold text-white mb-3">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-bold text-white mb-2">{children}</h3>,
                    p: ({children}) => <p className="text-purple-100 mb-3 leading-relaxed">{children}</p>,
                    strong: ({children}) => <strong className="text-white font-bold">{children}</strong>,
                    em: ({children}) => <em className="text-purple-200">{children}</em>,
                    ul: ({children}) => <ul className="text-purple-100 mb-3 mr-6 list-disc">{children}</ul>,
                    ol: ({children}) => <ol className="text-purple-100 mb-3 mr-6 list-decimal">{children}</ol>,
                    li: ({children}) => <li className="mb-1">{children}</li>,
                    blockquote: ({children}) => (
                      <blockquote className="border-r-4 border-blue-400 pr-4 my-4 bg-black/20 py-2">
                        {children}
                      </blockquote>
                    ),
                    code: ({children}) => (
                      <code className="bg-black/30 text-blue-300 px-1 py-0.5 rounded text-sm">
                        {children}
                      </code>
                    ),
                    pre: ({children}) => (
                      <pre className="bg-black/40 text-green-300 p-4 rounded-lg overflow-x-auto my-3">
                        {children}
                      </pre>
                    ),
                    a: ({children, href}) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-purple-300 text-center py-12">
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>اكتب شيئاً لرؤية المعاينة هنا</p>
              </div>
            )}
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-[200px] p-4 bg-transparent text-white placeholder-purple-300 resize-none focus:outline-none"
            dir="rtl"
          />
        )}
      </div>
      
      {/* Character Count */}
      <div className="text-xs text-purple-300 text-left">
        {value?.length || 0} حرف
      </div>
    </div>
  );
};

export default MarkdownEditor;