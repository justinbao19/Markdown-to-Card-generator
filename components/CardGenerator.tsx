"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { toPng } from "html-to-image";
import { 
  Download, 
  Sparkles, 
  Monitor,
  Minus,
  Plus,
  Type,
  MoveHorizontal,
  Palette,
  Layout,
  GripVertical,
  CreditCard,
  Info,
  Eye,
  Edit3
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Constants ---
const THEMES = {
  minimal: {
    name: "Notion Light",
    bg: "bg-[#F3F4F6]",
    card: "bg-white border border-gray-200 shadow-xl",
    text: "prose-slate",
    preview: "bg-white"
  },
  obsidian: {
    name: "Dev Dark",
    bg: "bg-[#09090B]",
    card: "bg-[#18181B] border border-white/10 shadow-2xl shadow-black/50",
    text: "prose-invert prose-pre:bg-[#27272A]",
    preview: "bg-[#18181B]"
  },
  aurora: {
    name: "OpenAI Glass",
    bg: "bg-gradient-to-br from-rose-100 to-teal-100",
    card: "bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl",
    text: "prose-slate prose-headings:text-slate-800",
    preview: "bg-gradient-to-br from-rose-200 to-teal-200"
  },
  bamboo: {
    name: "Bamboo Forest",
    bg: "bg-stone-100",
    card: "bg-[#F0FDF4] border border-green-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)]",
    text: "prose-stone prose-headings:text-green-800",
    preview: "bg-[#F0FDF4]"
  },
  sunset: {
    name: "Sunset Vibes",
    bg: "bg-slate-50",
    card: "bg-gradient-to-br from-orange-50 to-indigo-50 border border-orange-100/50 shadow-lg",
    text: "prose-slate prose-headings:text-indigo-900",
    preview: "bg-gradient-to-br from-orange-200 to-indigo-200"
  },
  midnight: {
    name: "Midnight Blue",
    bg: "bg-[#0F172A]",
    card: "bg-[#1E293B] border border-blue-500/20 shadow-2xl shadow-blue-900/20",
    text: "prose-invert prose-headings:text-blue-200 prose-p:text-slate-300",
    preview: "bg-[#1E293B]"
  },
  skyblue: {
    name: "Filo Blue",
    bg: "bg-[#E9F6FF]", // Light 05
    card: "bg-white border border-[#CCE7FB] shadow-[0_8px_30px_rgb(34,160,251,0.1)]", // Light 04 border, Light 02 shadow
    text: "prose-slate prose-headings:text-[#22A0FB] prose-a:text-[#22A0FB]", // Light 02 text
    preview: "bg-[#9CD5FF]" // Light 01
  },
  deepocean: {
    name: "Deep Ocean",
    bg: "bg-gradient-to-br from-[#22A0FB] to-[#0F172A]", // Light 02 -> Dark
    card: "bg-[#0F172A]/90 backdrop-blur-md border border-[#9CD5FF]/30 shadow-2xl", // Light 01 border glow
    text: "prose-invert prose-headings:text-[#C1E5FF] prose-p:text-[#E9F6FF]/80", // Light 03 & 05 text
    preview: "bg-[#22A0FB]" // Light 02
  }
};

const FONTS = {
  sans: { name: "Sans", class: "font-sans" },
  serif: { name: "Serif", class: "font-serif" },
  mono: { name: "Mono", class: "font-mono" }
};

const SIZES = {
  sm: { name: "Small", class: "prose-sm" },
  base: { name: "Medium", class: "prose-base" },
  lg: { name: "Large", class: "prose-lg" },
  xl: { name: "X-Large", class: "prose-xl" }
};

const DEFAULT_MARKDOWN = `# The Art of Code

**Simplicity** is the ultimate sophistication.

> "Code is like humor. When you have to explain it, it’s bad."
> — Cory House

*   Clean Architecture
*   Readable Syntax
*   Efficient Logic

Keep it simple, keep it elegant.`;

// --- Main Component ---
export default function CardGenerator() {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // State
  const [content, setContent] = useState(DEFAULT_MARKDOWN);
  const [theme, setTheme] = useState<keyof typeof THEMES>('minimal');
  const [font, setFont] = useState<keyof typeof FONTS>('sans');
  const [fontSize, setFontSize] = useState<keyof typeof SIZES>('lg');
  const [showWindowControls, setShowWindowControls] = useState(true);
  const [scale, setScale] = useState(100);
  const [isExporting, setIsExporting] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const [footerText, setFooterText] = useState("Card Generator");
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Drag Handlers
  const startResizing = useCallback(() => {
    setIsDragging(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isDragging) {
      const newWidth = mouseMoveEvent.clientX;
      const minWidth = 360; // Min width to fit 3 theme cards (100px * 3 + gap + padding)
      const maxWidth = Math.min(800, window.innerWidth * 0.5); // Relax max width to 50% or 800px
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isDragging]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // Export
  const handleExport = useCallback(async () => {
    if (cardRef.current === null) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `card-${theme}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export', err);
    } finally {
      setIsExporting(false);
    }
  }, [cardRef, theme]);

  return (
    <div 
      className={cn(
        "flex flex-col lg:flex-row h-screen w-full overflow-hidden bg-white text-slate-900 font-sans",
        isDragging && "cursor-col-resize select-none"
      )}
    >
      
      {/* --- MOBILE TAB BAR --- */}
      <div className="lg:hidden flex items-center border-b border-gray-200 bg-white z-30">
        <button 
          onClick={() => setActiveTab('editor')}
          className={cn(
            "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative",
            activeTab === 'editor' ? "text-indigo-600 bg-indigo-50/50" : "text-slate-500"
          )}
        >
          <Edit3 size={16} />
          Editor & Style
          {activeTab === 'editor' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600" />}
        </button>
        <div className="w-px h-6 bg-gray-200" />
        <button 
          onClick={() => setActiveTab('preview')}
          className={cn(
            "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative",
            activeTab === 'preview' ? "text-indigo-600 bg-indigo-50/50" : "text-slate-500"
          )}
        >
          <Eye size={16} />
          Preview & Export
          {activeTab === 'preview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600" />}
        </button>
      </div>

      {/* --- LEFT PANEL: EDITOR & CONTROLS --- */}
      <div 
        style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? sidebarWidth : '100%' }}
        className={cn(
          "flex-shrink-0 h-full flex flex-col border-r border-gray-200 bg-white z-20 shadow-lg relative group transition-all lg:transition-none",
          // Mobile Logic: Hide if preview active, Full width if editor active
          activeTab === 'preview' ? "hidden lg:flex" : "flex w-full"
        )}
      >
        
        {/* Header */}
        <div className="h-14 px-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 relative z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-slate-800 tracking-tight">Card Studio</span>
          </div>

          {/* Info Tooltip */}
          <div className="relative group">
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
              <Info size={18} />
            </button>
            
            {/* Tooltip Content */}
            <div className="absolute top-full right-[-10px] mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-50 pointer-events-none group-hover:pointer-events-auto">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                Markdown Guide
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">**Bold**</code>
                  <span className="font-bold text-slate-600">Bold Text</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">*Italic*</code>
                  <span className="italic text-slate-600">Italic Text</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono"># Heading</code>
                  <span className="font-bold text-slate-800 underline decoration-2 decoration-indigo-200">Heading 1</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">&gt; Quote</code>
                  <span className="border-l-2 border-indigo-400 pl-2 text-slate-500 italic">Quote</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">- List</code>
                  <div className="flex items-center gap-1 text-slate-600">
                    <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                    <span>List Item</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">`Code`</code>
                  <span className="bg-indigo-50 text-indigo-600 px-1 rounded border border-indigo-100">Code</span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-slate-400 leading-relaxed">
                Tips: Use <code className="font-mono text-slate-500">---</code> for a divider line.
              </div>
            </div>
          </div>
        </div>

        {/* Markdown Editor */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-4 py-2 text-xs font-semibold text-slate-400 tracking-wider uppercase mt-2">Content</div>
          <textarea
            className="flex-1 w-full p-4 resize-none outline-none font-mono text-sm text-slate-600 leading-relaxed bg-transparent selection:bg-indigo-100"
            placeholder="Type markdown..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
          />
          {/* Quick Syntax Hint */}
          <div className="px-4 py-2 bg-slate-50 border-t border-b border-gray-100 text-[10px] text-slate-400 flex gap-3 font-mono">
            <span>**Bold**</span>
            <span>*Italic*</span>
            <span># Header</span>
            <span>&gt; Quote</span>
          </div>
        </div>

        {/* Style Controls (Bottom Half) */}
        <div className="h-[45%] bg-slate-50 border-t border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-5 space-y-6">
            
            {/* Theme Selector */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Palette size={12} /> Theme
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,100px)] gap-2 justify-between">
                {(Object.entries(THEMES) as [keyof typeof THEMES, typeof THEMES['minimal']][]).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className={cn(
                      "group relative flex flex-col items-center gap-2 p-2 rounded-xl border transition-all duration-200",
                      theme === key 
                        ? "bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500/20" 
                        : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className={cn("w-full h-8 rounded-md shadow-inner", t.preview)} />
                    <span className="text-[10px] font-medium text-slate-600">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Controls */}
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Type size={12} /> Typography
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Font Family */}
                <div className="space-y-1.5">
                   <label className="text-[10px] text-slate-400 font-medium">Font Family</label>
                   <div className="flex bg-gray-200/50 p-1 rounded-lg">
                      {(Object.keys(FONTS) as Array<keyof typeof FONTS>).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFont(f)}
                          className={cn(
                            "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                            font === f ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          {FONTS[f].name}
                        </button>
                      ))}
                   </div>
                </div>
                {/* Font Size */}
                 <div className="space-y-1.5">
                   <label className="text-[10px] text-slate-400 font-medium">Size</label>
                   <div className="flex bg-gray-200/50 p-1 rounded-lg">
                      {(Object.keys(SIZES) as Array<keyof typeof SIZES>).map((s) => (
                        <button
                          key={s}
                          onClick={() => setFontSize(s)}
                          className={cn(
                            "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                            fontSize === s ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          {s === 'sm' ? 'S' : s === 'base' ? 'M' : s === 'lg' ? 'L' : 'XL'}
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            </div>

            {/* Footer Text & Window Controls */}
             <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Layout size={12} /> Appearance
                </div>
                
                {/* Footer Text Input */}
                <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-200">
                   <div className="p-1.5 bg-gray-100 text-slate-500 rounded-md">
                      <CreditCard size={14} />
                   </div>
                   <input 
                      type="text"
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      className="flex-1 text-xs font-medium text-slate-700 outline-none placeholder:text-slate-400"
                      placeholder="Footer text..."
                   />
                </div>

                {/* Window Toggle */}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-xs font-medium text-slate-700 pl-1">Window Decoration</span>
                  <button 
                    onClick={() => setShowWindowControls(!showWindowControls)}
                    className={cn(
                      "w-10 h-5 rounded-full transition-colors relative",
                      showWindowControls ? "bg-indigo-600" : "bg-gray-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm",
                      showWindowControls ? "translate-x-5" : "translate-x-0"
                    )} />
                  </button>
                </div>
            </div>

          </div>
        </div>

        {/* Resizer Handle (Hidden on Mobile) */}
        <div
          className="hidden lg:block absolute top-0 right-0 w-1 h-full cursor-col-resize group-hover:bg-indigo-500/50 hover:bg-indigo-500 transition-colors z-50"
          onMouseDown={startResizing}
        >
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
             <GripVertical size={12} className="text-slate-400" />
           </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: PREVIEW --- */}
      <div className={cn(
        "relative flex-1 h-full flex-col overflow-hidden transition-colors duration-500",
        THEMES[theme].bg,
        // Mobile Logic: Hide if editor active
        activeTab === 'editor' ? "hidden lg:flex" : "flex w-full"
      )}>
        
        {/* Dot Pattern Background */}
        <div className="absolute inset-0 pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }}>
        </div>

        {/* Scrollable Canvas Area */}
        <div className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="min-h-full flex flex-col items-center p-8 sm:p-20 pb-32"> {/* Increased padding-bottom for mobile fab */}
            
            <div 
              className="my-auto transition-transform duration-200 ease-out origin-center will-change-transform max-w-full" // Added max-w-full for mobile safety
              style={{ transform: `scale(${scale / 100})` }}
            >
              {/* The Card Component */}
              <div 
                ref={cardRef}
                className={cn(
                  "w-[520px] min-h-[300px] rounded-xl p-12 flex flex-col relative transition-all duration-500 shadow-2xl", // Added explicit shadow
                  THEMES[theme].card,
                  FONTS[font].class,
                  // Mobile responsiveness for card itself if needed, but usually we want fixed width export
                  // We keep it fixed width (520px) and let the parent scale transform handle the fitting on small screens
                )}
              >
                {/* Window Controls */}
                {showWindowControls && (
                  <div className="flex gap-2 mb-8 opacity-80 select-none">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-sm" />
                  </div>
                )}

                {/* Content */}
                <div className={cn(
                  "prose leading-relaxed max-w-none",
                  // Base Styles
                  "prose-headings:font-bold prose-headings:tracking-tight prose-headings:mb-4",
                  "prose-p:font-medium prose-p:opacity-90 prose-p:my-3",
                  "prose-blockquote:border-l-4 prose-blockquote:border-current/20 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:opacity-80",
                  "prose-li:marker:opacity-50",
                  "prose-code:rounded-md prose-code:bg-black/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none",
                  // Dynamic Styles
                  THEMES[theme].text,
                  SIZES[fontSize].class
                )}>
                  <ReactMarkdown>{content || "Type something..."}</ReactMarkdown>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-black/5 flex items-center justify-between opacity-30 select-none">
                   <div className="flex items-center gap-1.5">
                     <div className="w-4 h-4 bg-current rounded-full opacity-20" />
                     <span className="text-[10px] uppercase tracking-widest font-bold font-sans">{footerText}</span>
                   </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* --- FLOATING ACTION BAR --- */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full z-30 animate-in slide-in-from-bottom-6">
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 px-3 py-1.5">
              <button 
                onClick={() => setScale(s => Math.max(50, s - 10))}
                className="text-slate-500 hover:text-slate-800 transition-colors"
              >
                <Minus size={16} />
              </button>
              <div className="flex flex-col w-24 gap-1 hidden sm:flex"> {/* Hide slider on very small screens */}
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <button 
                 onClick={() => setScale(s => Math.min(150, s + 10))}
                 className="text-slate-500 hover:text-slate-800 transition-colors"
              >
                <Plus size={16} />
              </button>
              <span className="text-xs font-mono text-slate-400 w-9 text-right">{scale}%</span>
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Export Action */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-full font-medium text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <span className="animate-pulse">Processing...</span>
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
