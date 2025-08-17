
"use client";

import { DynamicWidget } from "@/lib/dynamic";
import DynamicMethods from "@/app/components/Methods";
import ChatInterface from "@/app/components/ChatInterface";
import { useDarkMode } from "@/lib/useDarkMode";
import "./page.css";

export default function Main() {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="main-content">
        <div className="wallet-section">
          <DynamicWidget />
          <DynamicMethods isDarkMode={isDarkMode} />
        </div>
        <div className="chat-section">
          <ChatInterface isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
}
