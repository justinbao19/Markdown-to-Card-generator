"use client";

import React, { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { toPng } from "html-to-image";
import { 
  Download, 
  LayoutTemplate, 
  Palette, 
  Type, 
  Sparkles,
  Maximize2,
  Monitor,
  Minus,
  Plus
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility for cleaner tailwind classes ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types & Constants ---
type Theme = 'minimal' | 'obsidian' | 'aurora';

const THEMES = {
  minimal: {
    name: "Notion Light",
    bg: "bg-[#F3F4F6]",
    card: "bg-white border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
    text: "prose-slate",
    controls: "bg-gray-100"
  },
  obsidian: {
    name: "Dev Dark",
    bg: "bg-[#09090B]",
    card: "bg-[#18181B] border border-white/10 shadow-2xl shadow-black/50",
    text: "prose-invert prose-pre:bg-[#27272A]",
    controls: "bg-[#27272A]"
  },
  aurora: {
    name: "OpenAI Glass",
    bg: "bg-gradient-to-br from-rose-100 to-teal-100",
    card: "bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
    text: "prose-slate prose-headings:text-slate-800",
    controls: "bg-white/50"
  }
};

const DEFAULT_MARKDOWN = `# The Art of Design

**Simplicity** is the ultimate sophistication. 

> "Good design is as little design as possible." 
> — Dieter Rams

* Clean Typography
* Balanced Whitespace
* Visual Hierarchy

Keep it simple.`;

// --- Main Component ---
export default function CardGenerator() {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // State
  const [content, setContent] = useState(DEFAULT_MARKDOWN);
  const [theme, setTheme] = useState<Theme>('minimal');
  const [showWindowControls, setShowWindowControls] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState(100);

  // Export Function
  const handleExport = useCallback(async () => {
    if (cardRef.current === null) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'my-card.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
    } finally {
      setIsExporting(false);
    }
  }, [cardRef]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-slate-900 font-sans">
      
      {/* --- LEFT PANEL: EDITOR --- */}
      <div className="w-[40%] h-full flex flex-col border-r border-gray-200 bg-white z-10 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Studio</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">MARKDOWN INPUT</span>
        </div>
        
        <textarea
          className="flex-1 w-full p-6 resize-none outline-none font-mono text-sm text-slate-600 leading-relaxed selection:bg-indigo-100"
          placeholder="Type your markdown here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
        />
        
        <div className="p-4 bg-slate-50 border-t border-gray-100 text-xs text-slate-400 flex gap-4">
           <span>**Bold**</span>
           <span>*Italic*</span>
           <span>&gt; Quote</span>
           <span># H1</span>
        </div>
      </div>

      {/* --- RIGHT PANEL: PREVIEW CANVAS --- */}
      <div className={cn(
        "relative flex-1 h-full flex flex-col overflow-hidden transition-colors duration-500",
        THEMES[theme].bg
      )}>
        
        {/* Background Grid Pattern (Subtle) */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 w-full h-full overflow-y-auto overflow-x-auto">
          <div className="min-h-full flex flex-col items-center p-8 sm:p-12">
            <div 
              className="my-auto transition-transform duration-200 ease-out origin-center"
              style={{ transform: `scale(${scale / 100})` }}
            >
              {/* --- THE CARD (Capture Target) --- */}
              <div 
                ref={cardRef}
                className={cn(
                  "w-[520px] min-h-[300px] rounded-2xl p-8 sm:p-12 flex flex-col relative transition-all duration-500",
                  THEMES[theme].card
                )}
              >
                {/* Decorative Window Controls */}
                {showWindowControls && (
                  <div className="flex gap-2 mb-8 opacity-80">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  </div>
                )}

                {/* Rendered Content */}
                <div className={cn(
                  "prose prose-lg leading-normal max-w-none",
                  "prose-headings:font-bold prose-headings:tracking-tight",
                  "prose-p:font-medium prose-p:opacity-90",
                  "prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-4 prose-blockquote:italic",
                  "prose-code:rounded-md prose-code:bg-black/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none",
                  THEMES[theme].text
                )}>
                  <ReactMarkdown>{content || "Start typing..."}</ReactMarkdown>
                </div>

                {/* Card Footer Branding */}
                <div className="mt-12 pt-6 border-t border-black/5 flex items-center justify-between opacity-40">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-current rounded-full opacity-20" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Generated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FLOATING TOOLBAR --- */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/90 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-full z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">
          
          {/* Theme Switcher */}
          <div className="flex items-center gap-1 px-2 border-r border-gray-200 pr-4">
            {(Object.keys(THEMES) as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110",
                  theme === t ? "ring-2 ring-offset-2 ring-indigo-500" : "opacity-50 hover:opacity-100",
                  t === 'minimal' ? 'bg-gray-200' : t === 'obsidian' ? 'bg-gray-800' : 'bg-gradient-to-br from-rose-300 to-teal-300'
                )}
                title={THEMES[t].name}
              />
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 px-2 border-r border-gray-200 pr-4">
            <button
              onClick={() => setScale(s => Math.max(50, s - 10))}
              className="p-1.5 rounded-full hover:bg-gray-100 text-slate-500 transition-colors"
              title="Zoom Out"
            >
              <Minus size={16} />
            </button>
            <input
              type="range"
              min="50"
              max="150"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <button
              onClick={() => setScale(s => Math.min(150, s + 10))}
              className="p-1.5 rounded-full hover:bg-gray-100 text-slate-500 transition-colors"
              title="Zoom In"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Toggles */}
          <button 
            onClick={() => setShowWindowControls(!showWindowControls)}
            className={cn(
              "p-2.5 rounded-full hover:bg-gray-100 text-slate-500 transition-colors",
              showWindowControls && "bg-gray-100 text-indigo-600"
            )}
            title="Toggle Window Controls"
          >
            <Monitor size={18} />
          </button>

          <div className="w-px h-4 bg-gray-200 mx-1" />

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-medium text-sm transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <span>Saving...</span>
            ) : (
              <>
                <span>Export</span>
                <Download size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

