
"use client";

import { DynamicWidget } from "@/lib/dynamic";
import { useState, useEffect } from "react";
import DynamicMethods from "@/app/components/Methods";
import { useDarkMode } from "@/lib/useDarkMode";
import "./page.css";
import Image from "next/image";

export default function Main() {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="modal">
        <DynamicWidget />
        <DynamicMethods isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}
