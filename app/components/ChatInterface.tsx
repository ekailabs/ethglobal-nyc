'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import { useChat } from '@/lib/useChat';

interface ChatInterfaceProps {
  isDarkMode: boolean;
}

export default function ChatInterface({ isDarkMode }: ChatInterfaceProps) {
  const { messages, isLoading, error, sendMessage, clearMessages, clearError } = useChat();
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full px-8 py-8 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center animate-in">
                <div className="w-20 h-20 bg-gradient-to-br from-[#004f4f] to-[#006666] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h3 className="text-4xl font-bold text-[#004f4f] mb-6">
                  Welcome to VistAI
                </h3>
                <p className="text-[#004f4f]/60 text-xl max-w-2xl mx-auto leading-relaxed">
                  Start a conversation with your AI companion
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.isUser ? 'justify-end' : 'justify-start'} animate-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {!message.isUser && (
                    <div className="w-10 h-10 bg-gradient-to-br from-[#004f4f] to-[#006666] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                  )}
                  <div className={`max-w-[75%] ${message.isUser ? '' : 'ml-0'}`}>
                    <div className={`px-6 py-5 rounded-3xl ${
                      message.isUser 
                        ? 'bg-[#004f4f] text-white shadow-lg rounded-br-lg'
                        : 'bg-white shadow-lg border border-[#004f4f]/8 rounded-bl-lg'
                    }`}>
                      {message.isUser ? (
                        <p className="text-white leading-relaxed text-lg">{message.text}</p>
                      ) : (
                        <div className="prose prose-lg max-w-none text-[#004f4f]">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed text-lg">{children}</p>,
                              h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-[#004f4f]">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-[#004f4f]">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-lg font-bold mb-3 text-[#004f4f]">{children}</h3>,
                              ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
                              li: ({ children }) => <li className="text-[#004f4f] text-lg">{children}</li>,
                              code: ({ children, className }) => {
                                const isInline = !className;
                                if (isInline) {
                                  return <code className="px-3 py-1 rounded text-base font-mono bg-[#004f4f]/10 text-[#004f4f]">{children}</code>;
                                }
                                
                                const language = className ? className.replace('language-', '') : '';
                                const codeString = String(children).replace(/\n$/, '');
                                
                                let highlightedCode = codeString;
                                if (language && Prism.languages[language]) {
                                  try {
                                    highlightedCode = Prism.highlight(codeString, Prism.languages[language], language);
                                  } catch (error) {
                                    console.warn('Prism highlighting failed:', error);
                                  }
                                }
                                
                                return (
                                  <div className="relative my-4">
                                    {language && (
                                      <span className="absolute top-4 right-4 text-sm uppercase font-medium bg-[#004f4f]/10 text-[#004f4f] px-3 py-1 rounded-lg">
                                        {language}
                                      </span>
                                    )}
                                    <pre className="p-5 rounded-xl overflow-x-auto font-mono text-base bg-[#004f4f]/5 border border-[#004f4f]/10">
                                      <code 
                                        dangerouslySetInnerHTML={{ __html: highlightedCode }}
                                        className="text-[#004f4f]"
                                      />
                                    </pre>
                                  </div>
                                );
                              },
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-[#004f4f]/30 pl-5 my-4 italic text-[#004f4f]/80 text-lg">
                                  {children}
                                </blockquote>
                              ),
                              a: ({ children, href }) => (
                                <a 
                                  href={href} 
                                  className="underline transition-colors text-[#006666] hover:text-[#004f4f]" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  {children}
                                </a>
                              ),
                              strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>,
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <div className={`text-sm mt-3 opacity-50 ${
                      message.isUser ? 'text-right text-[#004f4f]/50' : 'text-left text-[#004f4f]/50'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {message.isUser && (
                    <div className="w-10 h-10 bg-[#004f4f]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#004f4f]">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 justify-start animate-in">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#004f4f] to-[#006666] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div className="max-w-[75%]">
                    <div className="px-6 py-5 rounded-3xl bg-white shadow-lg border border-[#004f4f]/8 rounded-bl-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full animate-bounce bg-[#004f4f]" style={{ animationDelay: '-0.32s' }}></div>
                          <div className="w-3 h-3 rounded-full animate-bounce bg-[#004f4f]" style={{ animationDelay: '-0.16s' }}></div>
                          <div className="w-3 h-3 rounded-full animate-bounce bg-[#004f4f]"></div>
                        </div>
                        <span className="text-[#004f4f]/70 text-base font-medium">AI is typing...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-8 mb-6">
          <div className="p-5 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-center gap-4 w-full">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-base">{error}</span>
            <button 
              onClick={clearError} 
              className="ml-auto h-6 w-6 p-0 hover:bg-red-200/20 rounded"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modern Chat Input */}
      <div className="bg-transparent border-t border-[#004f4f]/10 px-8 py-6">
        <div className="w-full">
          <div className="relative bg-[#FFFCEC] rounded-3xl border border-[#004f4f]/15 shadow-lg focus-within:shadow-xl focus-within:border-[#004f4f]/25 transition-all duration-200">
            <div className="flex items-end gap-4 p-5">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message VistAI..."
                  rows={1}
                  disabled={isLoading}
                  className="w-full min-h-[28px] max-h-[140px] resize-none bg-transparent text-[#004f4f] placeholder:text-[#004f4f]/40 focus:outline-none text-lg leading-6"
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 140) + 'px';
                  }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="w-12 h-12 bg-[#004f4f] hover:bg-[#006666] disabled:bg-[#004f4f]/50 rounded-full flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex-shrink-0"
                title="Send message"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white translate-x-0.5"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                  </svg>
                )}
              </button>
            </div>
            {/* Subtle hint text */}
            <div className="px-5 pb-4">
              <p className="text-sm text-[#004f4f]/30">Press Enter to send • Shift + Enter for new line</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}