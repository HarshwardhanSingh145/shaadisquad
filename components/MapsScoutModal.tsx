'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/wedding-context';
import { 
  MapPin, 
  X, 
  Search, 
  ExternalLink, 
  Plus, 
  Sparkles, 
  Navigation, 
  Store, 
  Clock, 
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';

interface MapsScoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlaceForTask: (placeTitle: string, placeAddress?: string) => void;
}

interface GroundedPlace {
  title: string;
  uri: string;
  snippet?: string;
}

export function MapsScoutModal({
  isOpen,
  onClose,
  onSelectPlaceForTask,
}: MapsScoutModalProps) {
  const { wedding } = useWedding();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultsText, setResultsText] = useState<string | null>(null);
  const [places, setPlaces] = useState<GroundedPlace[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) return;

    setQuery(q);
    setLoading(true);
    setError(null);
    setResultsText(null);
    setPlaces([]);

    try {
      const res = await fetch('/api/maps-scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          latitude: 28.5360, // Venue default coordinates
          longitude: 77.3915,
        }),
      });

      if (!res.ok) {
        let errMessage = 'Failed to fetch Google Maps data';
        try {
          const errData = await res.json();
          if (errData?.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      const data = await res.json();
      setResultsText(data.text || '');
      setPlaces(data.places || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error retrieving Google Maps data');
    } finally {
      setLoading(false);
    }
  };

  const quickScouts = [
    { label: '🌸 Fresh Flower Vendor', query: 'Find flower vendors and garland shops near the venue' },
    { label: '💊 24/7 Medical Pharmacy', query: 'Find 24/7 chemist pharmacy for first aid and medicines' },
    { label: '🏧 Cash ATM', query: 'Find closest ATM or bank cash dispenser' },
    { label: '👔 Emergency Dry Cleaner', query: 'Find dry cleaners or express laundry for wedding clothes' },
    { label: '🍬 Mithai & Sweets', query: 'Find fresh Indian sweets and mithai shop near the venue' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#E8DFC8] z-10 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-8 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#16A34A] text-white flex items-center justify-center shadow-xs">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-[#2B1E16]">Nearby Maps Scout</h2>
                <span className="text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1] px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Google Maps Grounded
                </span>
              </div>
              <p className="text-[11px] text-[#7C6A58]">
                Find emergency supplies, vendors & stores near {wedding?.name || 'Venue'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#5C4A3A] hover:bg-[#EFE6D5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="mb-3 shrink-0"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search stores, flowers, pharmacy, print shop..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-20 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#2B1E16] placeholder:text-[#9C8A79] focus:outline-hidden focus:border-[#4A3525]"
            />
            <Search className="w-4 h-4 text-[#8C7A68] absolute left-3 top-3" />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-[#4A3525] text-white text-xs font-bold hover:bg-[#382618] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Finding...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Quick Scout Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shrink-0 no-scrollbar">
          {quickScouts.map((qs, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSearch(qs.query)}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#FAF7F2] text-[#4A3B2E] border border-[#DECDB3] hover:bg-[#F3EDE2] transition-colors whitespace-nowrap shrink-0"
            >
              {qs.label}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[200px]">
          {loading && (
            <div className="p-8 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-[#2B1E16]">Searching Google Maps real-time data...</p>
              <p className="text-[11px] text-[#7C6A58]">
                Grounding places with gemini-3.5-flash and venue coordinates
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-[#FFF5F5] border border-[#FECACA] text-xs text-[#DC2626] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !resultsText && !error && (
            <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-[#DECDB3] my-4">
              <Store className="w-8 h-8 text-[#8C7A68] mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-[#2B1E16]">Emergency Logistics Scout</p>
              <p className="text-[11px] text-[#7C6A58] mt-1 max-w-xs mx-auto">
                Need extra safa/turbans, safety pins, dry ice, cash, or midnight pharmacy? Tap any quick search above!
              </p>
            </div>
          )}

          {/* AI Grounded Advice Summary */}
          {resultsText && !loading && (
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#DECDB3] text-xs text-[#3D2B1E] leading-relaxed">
              <h4 className="font-bold text-[#2B1E16] mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
                Logistics Intel:
              </h4>
              <p className="whitespace-pre-line text-[#4A3B2E]">{resultsText}</p>
            </div>
          )}

          {/* Grounded Google Maps Places Cards */}
          {places.length > 0 && !loading && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C6A58] px-1">
                Google Maps Locations ({places.length})
              </h4>
              {places.map((place, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-white border border-[#E8DFC8] shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                      <h5 className="text-xs font-bold text-[#2B1E16] truncate">{place.title}</h5>
                    </div>
                    {place.snippet && (
                      <p className="text-[11px] text-[#7C6A58] truncate mt-0.5 ml-5">
                        &ldquo;{place.snippet}&rdquo;
                      </p>
                    )}
                    {place.uri && (
                      <a
                        href={place.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-[#0369A1] hover:underline flex items-center gap-1 mt-1 ml-5"
                      >
                        Open in Google Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onSelectPlaceForTask(place.title);
                      onClose();
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-[#4A3525] text-white text-xs font-bold hover:bg-[#382618] transition-colors shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Assign Task
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 text-center shrink-0">
          <p className="text-[10px] text-[#8C7A68]">
            Powered by Google Maps Platform & Gemini 3.5 Flash Grounding
          </p>
        </div>
      </div>
    </div>
  );
}
