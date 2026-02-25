import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Video,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  ChevronDown,
  ChevronUp,
  Search,
  Clapperboard,
} from "lucide-react";
import {
  generateShortsStrategy,
  generateThumbnailImage,
  ShortStrategy,
} from "./services/geminiService";

export default function App() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategies, setStrategies] = useState<ShortStrategy[]>([]);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError("");
    try {
      const results = await generateShortsStrategy(topic);
      setStrategies(results);
    } catch (err: any) {
      setError(err.message || "Failed to generate strategy");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-semibold text-lg tracking-tight">
            Shorts Strategist
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero / Input Section */}
        <div className="max-w-2xl mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Viral ideas, <span className="text-indigo-400">on demand.</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Enter a topic and get 5 cinematic YouTube Shorts scripts, complete
            with SEO metadata and thumbnail concepts.
          </p>

          <form onSubmit={handleGenerate} className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Personal Finance for Beginners, Home Workout..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-32 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600"
            />
            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="absolute right-2 top-2 bottom-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white px-6 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              <span>Generate</span>
            </button>
          </form>
          {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
        </div>

        {/* Results Section */}
        {strategies.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-white/10"></div>
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                Generated Strategy
              </span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            {strategies.map((strategy, index) => (
              <ShortCard key={index} strategy={strategy} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const ShortCard: React.FC<{ strategy: ShortStrategy; index: number }> = ({
  strategy,
  index,
}) => {
  const [expanded, setExpanded] = useState(index === 0);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const handleGenerateImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGeneratingImage(true);
    setImageError("");
    try {
      const url = await generateThumbnailImage(
        strategy.thumbnailImageIdea,
        strategy.emotion,
        strategy.thumbnailText,
      );
      setThumbnailUrl(url);
    } catch (err: any) {
      setImageError(err.message || "Failed to generate image");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden"
    >
      {/* Card Header (Clickable) */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-6 flex items-start gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 font-mono text-xl font-bold text-gray-400">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
              Short #{index + 1}
            </span>
            <h3 className="text-xl font-semibold truncate">
              {strategy.seoTitle}
            </h3>
          </div>
          <p className="text-gray-400 text-sm line-clamp-1">
            Problem: {strategy.problem}
          </p>
        </div>
        <div className="shrink-0 text-gray-500 mt-2">
          {expanded ? (
            <ChevronUp className="w-6 h-6" />
          ) : (
            <ChevronDown className="w-6 h-6" />
          )}
        </div>
      </div>

      {/* Card Body */}
      {expanded && (
        <div className="p-6 pt-0 border-t border-white/5 mt-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            {/* Left Column: Script & Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hook & Script */}
              <div className="space-y-4">
                <h4 className="text-sm font-mono text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Clapperboard className="w-4 h-4" /> Script & Direction
                </h4>

                <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                  <div className="mb-4">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1 block">
                      The Hook (0-2s)
                    </span>
                    <p className="text-lg font-medium">"{strategy.hook}"</p>
                  </div>

                  <div className="mb-4">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 block">
                      Voiceover
                    </span>
                    <p className="text-gray-300 italic">
                      "{strategy.voiceover}"
                    </p>
                  </div>

                  <div className="mb-4">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 block">
                      Visual Scenes
                    </span>
                    <p className="text-gray-300">{strategy.scenes}</p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 block">
                      Cinematic Flow
                    </span>
                    <p className="text-gray-400 text-sm">
                      {strategy.cinematicScript}
                    </p>
                  </div>
                </div>
              </div>

              {/* SEO Metadata */}
              <div className="space-y-4">
                <h4 className="text-sm font-mono text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-4 h-4" /> SEO Metadata
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <span className="text-xs text-gray-500 block mb-2">
                      Target Keywords
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {strategy.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="text-xs bg-white/10 px-2 py-1 rounded-md text-gray-300"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <span className="text-xs text-gray-500 block mb-2">
                      Hashtags
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {strategy.tags.map((tag, i) => (
                        <span key={i} className="text-xs text-indigo-300">
                          #{tag.replace("#", "")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <span className="text-xs text-gray-500 block mb-2">
                    Description
                  </span>
                  <p className="text-sm text-gray-400 whitespace-pre-wrap">
                    {strategy.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Thumbnail */}
            <div className="space-y-4">
              <h4 className="text-sm font-mono text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Thumbnail Concept
              </h4>

              <div className="bg-white/5 rounded-xl p-5 border border-white/5 flex flex-col h-full">
                <div className="space-y-3 mb-6">
                  <div>
                    <span className="text-xs text-gray-500 block">
                      Text Overlay
                    </span>
                    <p className="font-bold text-xl uppercase tracking-tight">
                      {strategy.thumbnailText}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">
                      Visual Idea
                    </span>
                    <p className="text-sm text-gray-300">
                      {strategy.thumbnailImageIdea}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Emotion</span>
                    <p className="text-sm text-gray-300 capitalize">
                      {strategy.emotion}
                    </p>
                  </div>
                </div>

                <div className="mt-auto">
                  {thumbnailUrl ? (
                    <div className="relative aspect-[9/16] rounded-lg overflow-hidden border border-white/10">
                      <img
                        src={thumbnailUrl}
                        alt="Generated Thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                        <p className="font-bold text-2xl uppercase text-white drop-shadow-lg leading-tight w-2/3">
                          {strategy.thumbnailText}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage}
                      className="w-full aspect-[9/16] rounded-lg border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-indigo-400 group"
                    >
                      {isGeneratingImage ? (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <span className="text-sm font-medium">
                            Generating...
                          </span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">
                            Generate AI Thumbnail
                          </span>
                        </>
                      )}
                    </button>
                  )}
                  {imageError && (
                    <p className="text-red-400 text-xs mt-2 text-center">
                      {imageError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
