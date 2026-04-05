"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

type MapPickerProps = {
  initialPosition: [number, number] | null
  onLocationSelect: (lat: number, lng: number) => void
}

const MAP_LAYERS = {
  sade: { url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", maxZoom: 20 },
  detayli: { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", maxZoom: 19 },
  uydu: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", maxZoom: 19 }
}

function MapController({ center, zoom }: { center: [number, number] | null, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, map, zoom]);
  return null
}

export default function MapPicker({ initialPosition, onLocationSelect }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(initialPosition); // haritadaki işaretçiyi tuttuğum state
  
  // arama kutusu state'leri
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // haritanın tam ortasını tutan state . Varsayılan olarak Ankara koordinatları
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(initialPosition || [39.92077, 32.85411]);
  const [mapZoom, setMapZoom] = useState(initialPosition ? 18 : 6);
  const [activeLayer, setActiveLayer] = useState<keyof typeof MAP_LAYERS>("sade"); // kullanıcının o anki seçtiği harita tipi 

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
      setMapCenter(initialPosition);
      if (mapZoom < 15) setMapZoom(16);
    }
  }, [initialPosition]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          setSearchResults(data);
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery]);

  // haritaya tıklama fonksiyonu
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
        setSearchResults([]);
      },
    })
    return position === null ? null : <Marker position={position} />
  }

  // adres girip tıklayınca haritada konuma giden fonksiyon
  const handleSelectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setMapCenter([lat, lon]);
    setMapZoom(18);
    setPosition([lat, lon]);
    onLocationSelect(lat, lon);
    setSearchResults([]);
    setSearchQuery(result.display_name.split(",")[0]);
  }

  return (
    <div className="flex flex-col gap-2">
      
      <div className="relative z-[1000]">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mekan veya adres arayın..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 text-xs"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
               <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
          )}
        </div>
        
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1d24] border border-white/10 rounded-xl max-h-40 overflow-y-auto custom-scrollbar shadow-2xl z-[1000] animate-fadeIn">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectResult(result)}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-indigo-500/20 hover:text-white border-b border-white/5 last:border-0 transition-colors duration-200 cursor-pointer"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full h-[220px] rounded-xl overflow-hidden border border-white/10 z-0 relative shadow-inner group">
        
        <div className="absolute top-2 right-2 z-[1000] flex bg-[#0f1118]/90 backdrop-blur-md p-1 rounded-lg border border-white/10 shadow-lg opacity-80 hover:opacity-100 transition-opacity duration-300">
          <button type="button" onClick={() => setActiveLayer("sade")} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all duration-300 cursor-pointer ${activeLayer === "sade" ? "bg-indigo-500 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>Sade</button>
          <button type="button" onClick={() => setActiveLayer("detayli")} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all duration-300 cursor-pointer ${activeLayer === "detayli" ? "bg-indigo-500 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>Detaylı</button>
          <button type="button" onClick={() => setActiveLayer("uydu")} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all duration-300 cursor-pointer ${activeLayer === "uydu" ? "bg-indigo-500 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>Uydu</button>
        </div>

        <MapContainer center={[39.92077, 32.85411]} zoom={6} style={{ width: "100%", height: "100%", zIndex: 0 }}>
          <TileLayer key={activeLayer} url={MAP_LAYERS[activeLayer].url} maxZoom={MAP_LAYERS[activeLayer].maxZoom} attribution='&copy; OSM' />
          <MapController center={mapCenter} zoom={mapZoom} />
          <LocationMarker />
        </MapContainer>
      </div>

    </div>
  )
}