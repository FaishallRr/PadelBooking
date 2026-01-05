import React from "react";
import { extractIframeSrc } from "@/utils/extractIframeSrc";

interface GoogleMapEmbedProps {
  maps?: string | null;
  className?: string;
}

const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({ maps, className }) => {
  const src = extractIframeSrc(maps);

  if (!src) {
    return (
      <div className="mt-2 p-3 rounded-lg bg-yellow-50 border border-yellow-300 text-sm text-yellow-800">
        <p className="font-semibold">Lokasi tidak bisa ditampilkan</p>
        <p>
          Gunakan <b>Embed Map</b> dari Google Maps:
        </p>
        <ol className="list-decimal ml-5 mt-1">
          <li>Buka Google Maps</li>
          <li>Klik Share</li>
          <li>
            Pilih <b>Embed a map</b>
          </li>
          <li>Salin iframe</li>
        </ol>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-64 rounded-xl overflow-hidden border ${
        className || ""
      }`}
    >
      <iframe
        src={src}
        width="100%"
        height="100%"
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
};

export default GoogleMapEmbed;
