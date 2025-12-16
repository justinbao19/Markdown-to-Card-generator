"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Palette, 
  Download, 
  Eye,
  Code,
  Layers,
  Moon,
  Sun,
  ChevronRight,
  Star,
  Check
} from "lucide-react";

// Animated gradient orb component
function GradientOrb({ className }: { className?: string }) {
  return (
    <div className={`absolute rounded-full blur-3xl opacity-30 animate-pulse ${className}`} />
  );
}

// Feature card component
function FeatureCard({ 
  icon: Icon, 
  title, 
  description,
  delay = 0
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  delay?: number;
}) {
  return (
    <div 
      className="group relative p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05] transition-all duration-500"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// Animated code block for demo
function AnimatedCodeBlock() {
  const [currentLine, setCurrentLine] = useState(0);
  const lines = [
    { text: "# Hello, FlipMark", color: "text-cyan-400" },
    { text: "", color: "" },
    { text: "Transform your **ideas** into", color: "text-gray-300" },
    { text: "stunning visual cards.", color: "text-gray-300" },
    { text: "", color: "" },
    { text: "> Beautiful. Simple. Powerful.", color: "text-indigo-400" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLine((prev) => (prev + 1) % (lines.length + 2));
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-indigo-500/20 rounded-3xl blur-2xl opacity-50" />
      
      <div className="relative bg-[#0d0d0f] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Window header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/[0.05]">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-3 text-xs text-gray-500 font-mono">markdown</span>
        </div>
        
        {/* Code content */}
        <div className="p-6 font-mono text-sm leading-relaxed min-h-[200px]">
          {lines.map((line, idx) => (
            <div 
              key={idx} 
              className={`transition-opacity duration-300 ${idx <= currentLine ? 'opacity-100' : 'opacity-0'} ${line.color}`}
            >
              {line.text || <br />}
            </div>
          ))}
          <span className={`inline-block w-2 h-5 bg-indigo-500 animate-pulse ${currentLine >= lines.length ? 'opacity-100' : 'opacity-0'}`} />
        </div>
      </div>
    </div>
  );
}

// Card preview mockup
function CardPreviewMockup() {
  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-60" />
      
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 rounded-2xl p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
        <div className="bg-white/95 rounded-xl p-8 backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Hello, FlipMark</h3>
          <p className="text-gray-600 mb-4">Transform your <strong>ideas</strong> into stunning visual cards.</p>
          <blockquote className="border-l-4 border-indigo-500 pl-4 text-gray-500 italic">
            Beautiful. Simple. Powerful.
          </blockquote>
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-gray-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">FlipMark</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats component
function Stats() {
  const stats = [
    { value: "9+", label: "Stunning Themes" },
    { value: "4K", label: "Export Quality" },
    { value: "100%", label: "Free to Use" },
    { value: "<1s", label: "Generation Time" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, idx) => (
        <div key={idx} className="text-center">
          <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
            {stat.value}
          </div>
          <div className="text-gray-500 text-sm uppercase tracking-wider">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Code,
      title: "Markdown Native",
      description: "Write in Markdown, see it transform instantly. Support for headings, lists, quotes, code blocks, and more."
    },
    {
      icon: Palette,
      title: "9+ Premium Themes",
      description: "From minimal Notion-style to vibrant gradients. Dark mode, light mode, and everything in between."
    },
    {
      icon: Eye,
      title: "Real-time Preview",
      description: "See your changes instantly as you type. Pinch-to-zoom on mobile, smooth scaling on desktop."
    },
    {
      icon: Download,
      title: "HD Export up to 4x",
      description: "Export in stunning quality up to 4x resolution. Perfect for social media, presentations, or print."
    },
    {
      icon: Layers,
      title: "Window Decorations",
      description: "macOS, Browser, Terminal, Notion styles. Add that extra touch of polish to your cards."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "No sign-up required. No watermarks. No limits. Just pure, instant card generation."
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <GradientOrb className="w-[800px] h-[800px] -top-[400px] -left-[400px] bg-indigo-600" />
        <GradientOrb className="w-[600px] h-[600px] top-1/2 -right-[300px] bg-cyan-600" />
        <GradientOrb className="w-[500px] h-[500px] -bottom-[250px] left-1/4 bg-purple-600" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold tracking-tight">FlipMark</span>
            </div>
            
            <div className="flex items-center gap-6">
              <Link 
                href="/app"
                className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-medium text-sm hover:bg-gray-100 transition-colors"
              >
                Launch App
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.1] text-sm text-gray-400 mb-8">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Free & Open Source</span>
            </div>
            
            {/* Main headline */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
                Transform Markdown
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                into Visual Art
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-400 leading-relaxed mb-10 max-w-2xl mx-auto">
              Create stunning, shareable cards from your text in seconds. 
              No design skills required. Just write and export.
            </p>
            
            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/app"
                className="group flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
              >
                Start Creating
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="https://github.com/justinbao19/Markdown-to-Card-generator"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/[0.05] transition-colors"
              >
                View on GitHub
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Demo area */}
          <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <AnimatedCodeBlock />
            </div>
            <div className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <CardPreviewMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6">
          <Stats />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Everything you need,
              <br />
              <span className="text-gray-500">nothing you don't</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features wrapped in a simple interface. 
              Focus on your content, we handle the design.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <FeatureCard 
                key={idx} 
                {...feature} 
                delay={idx * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 py-32 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Three steps to
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">beautiful cards</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Write", desc: "Type or paste your Markdown content. Use headings, lists, quotes, and more." },
              { step: "02", title: "Style", desc: "Pick a theme, adjust typography, add window decorations. Make it yours." },
              { step: "03", title: "Export", desc: "Download in up to 4x resolution. Share anywhere, impress everyone." },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-white/10 mb-6">
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">{item.step}</span>
                </div>
                <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-cyan-600/20 to-purple-600/20 blur-3xl" />
            
            <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-3xl border border-white/[0.1] p-12 md:p-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                Ready to create something
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">beautiful?</span>
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
                Join thousands of creators who use FlipMark to make their content stand out.
              </p>
              <Link 
                href="/app"
                className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Launch FlipMark
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              {/* Trust badges */}
              <div className="flex items-center justify-center gap-6 mt-10 text-gray-500 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>No sign-up</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>No watermark</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>100% free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">FlipMark</span>
            </div>
            
            <p className="text-gray-500 text-sm">
              Built with ❤️ by Justin Bao. Open source on GitHub.
            </p>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="https://github.com/justinbao19/Markdown-to-Card-generator" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

