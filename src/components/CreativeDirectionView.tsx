import React, { useState } from 'react';
import { Palette, Sparkles, Sun, Eye, Volume2, Copy, Check, LayoutGrid } from 'lucide-react';
import { CreativeDirection } from '../types/event';

interface CreativeDirectionViewProps {
  creative: CreativeDirection;
}

export const CreativeDirectionView: React.FC<CreativeDirectionViewProps> = ({ creative }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopyHex = (hex: string) => {
    void navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Narrative & Concept Manifesto */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Creative Director Vision & Spatial Concept</span>
          </div>

          <h3 className="text-2xl font-bold tracking-tight text-white">
            {creative.conceptTitle}
          </h3>

          <p className="text-sm font-medium text-amber-200/90 italic">
            "{creative.tagline}"
          </p>

          <p className="text-xs text-neutral-300 leading-relaxed pt-1">
            {creative.narrative}
          </p>
        </div>
      </div>

      {/* Color Palette & Materiality */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curated Color Palette */}
        <div className="lg:col-span-2 bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Architectural Color Palette</span>
            </h4>
            <span className="text-xs text-neutral-400">
              Click to copy HEX
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {creative.colorPalette.map((color, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleCopyHex(color.hex)}
                className="text-left bg-neutral-950/80 border border-neutral-800 rounded-lg p-2.5 hover:border-neutral-700 transition-all cursor-pointer group"
              >
                <div
                  className="w-full h-14 rounded-md shadow-inner border border-white/10 mb-2 relative flex items-center justify-center transition-transform group-hover:scale-[1.02]"
                  style={{ backgroundColor: color.hex }}
                >
                  <div className="opacity-0 group-hover:opacity-100 bg-neutral-950/80 text-white rounded p-1 transition-opacity">
                    {copiedHex === color.hex ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-neutral-300" />
                    )}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-white truncate">
                    {color.name}
                  </div>
                  <div className="font-mono text-[11px] text-amber-400/90 font-medium">
                    {color.hex}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    {color.role}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Materiality & Textural Palette */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-3">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-neutral-400" />
            <span>Tactile Materiality</span>
          </h4>
          <p className="text-xs text-neutral-400">
            Physical textures and surfaces specified for scenic staging and spatial finishes.
          </p>

          <div className="space-y-2 pt-1">
            {creative.materiality.map((mat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs text-neutral-300 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span>{mat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lighting Architecture & Sensory Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lighting Architecture */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Atmospheric Lighting Architecture</span>
          </h4>

          <div className="space-y-3 text-xs">
            <div className="bg-neutral-950/60 border border-neutral-800 rounded-lg p-3 space-y-1">
              <span className="font-semibold text-neutral-200">01. Ambient Base Layer</span>
              <p className="text-neutral-400 leading-relaxed">
                {creative.lightingDesign.ambient}
              </p>
            </div>

            <div className="bg-neutral-950/60 border border-neutral-800 rounded-lg p-3 space-y-1">
              <span className="font-semibold text-neutral-200">02. Focal Presentation Layer</span>
              <p className="text-neutral-400 leading-relaxed">
                {creative.lightingDesign.focal}
              </p>
            </div>

            <div className="bg-neutral-950/60 border border-neutral-800 rounded-lg p-3 space-y-1">
              <span className="font-semibold text-neutral-200">03. Architectural Accent Layer</span>
              <p className="text-neutral-400 leading-relaxed">
                {creative.lightingDesign.accent}
              </p>
            </div>
          </div>
        </div>

        {/* Sensory Profile */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span>Multi-Sensory Engagement Profile</span>
          </h4>

          <div className="space-y-3 text-xs">
            <div className="bg-neutral-950/60 border border-neutral-800 rounded-lg p-3 space-y-1">
              <span className="font-semibold text-neutral-200">Acoustic & Sound Envelope</span>
              <p className="text-neutral-400 leading-relaxed">
                {creative.sensoryProfile.acoustic}
              </p>
            </div>

            <div className="bg-neutral-950/60 border border-neutral-800 rounded-lg p-3 space-y-1">
              <span className="font-semibold text-neutral-200">Olfactory & Atmospheric Scent</span>
              <p className="text-neutral-400 leading-relaxed">
                {creative.sensoryProfile.olfactory}
              </p>
            </div>

            <div className="bg-neutral-950/60 border border-neutral-800 rounded-lg p-3 space-y-1">
              <span className="font-semibold text-neutral-200">Culinary & Mixology Pairing</span>
              <p className="text-neutral-400 leading-relaxed">
                {creative.sensoryProfile.taste}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Spatial Blueprint & Floor Plan Layout */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
              <span>Spatial Layout & Blueprint Zones</span>
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              Floor plan division and capacity orchestration for seamless attendee circulation.
            </p>
          </div>

          <span className="text-xs font-mono text-neutral-400">
            {creative.spatialZones.length} Architectural Zones
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {creative.spatialZones.map((zone, idx) => (
            <div
              key={idx}
              className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-white text-sm">
                    {zone.name}
                  </span>
                  <span className="font-mono tabular-nums text-amber-400 font-semibold bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                    {zone.capacityPercentage}% Capacity
                  </span>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  {zone.description}
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-900 space-y-1">
                <span className="text-[11px] font-semibold text-neutral-300 block">
                  Key Technical Elements:
                </span>
                <div className="space-y-1 text-xs text-neutral-400">
                  {zone.keyElements.map((el, elIdx) => (
                    <div key={elIdx} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-neutral-600 shrink-0" />
                      <span>{el}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
