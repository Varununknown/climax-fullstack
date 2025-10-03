import { Home, Film, Search, Tv, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onSearch: (query: string) => void; // Make sure this is passed from UserDashboard
}

export default function BottomNav({ currentPage, onNavigate, onSearch }: BottomNavProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setIsSearchOpen(false);
  };

  // Close overlay if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen]);

  return (
    <>
      {/* Bottom Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
        <div
          className="flex justify-around items-center
          backdrop-blur-md bg-gradient-to-r from-blue-500/30 to-black/30
          text-white shadow-lg rounded-2xl py-2 px-3 border border-white/20"
        >
          <button
            onClick={() => onNavigate("home")}
            className={`flex flex-col items-center text-sm hover:scale-110 transition ${
              currentPage === "home" ? "text-blue-400" : ""
            }`}
          >
            <Home size={22} />
            <span>Home</span>
          </button>

          <button
            onClick={() => onNavigate("movies")}
            className={`flex flex-col items-center text-sm hover:scale-110 transition ${
              currentPage === "movies" ? "text-blue-400" : ""
            }`}
          >
            <Film size={22} />
            <span>Movies</span>
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className={`flex flex-col items-center text-sm hover:scale-110 transition ${
              currentPage === "search" ? "text-blue-400" : ""
            }`}
          >
            <Search size={22} />
            <span>Search</span>
          </button>

          <button
            onClick={() => onNavigate("series")}
            className={`flex flex-col items-center text-sm hover:scale-110 transition ${
              currentPage === "series" ? "text-blue-400" : ""
            }`}
          >
            <Tv size={22} />
            <span>TV</span>
          </button>

          <button
            onClick={() => onNavigate("profile")}
            className={`flex flex-col items-center text-sm hover:scale-110 transition ${
              currentPage === "profile" ? "text-blue-400" : ""
            }`}
          >
            <User size={22} />
            <span>Profile</span>
          </button>
        </div>
      </nav>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24 px-4"
        >
          <form
            ref={overlayRef}
            onSubmit={handleSearchSubmit}
            className="w-full max-w-md backdrop-blur-lg bg-gradient-to-r from-blue-500/30 to-black/30 rounded-2xl p-4 flex items-center border border-white/20"
          >
            <Search className="w-5 h-5 text-white mr-3" />
            <input
              
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contents . . . & press Enter"
              className="flex-1 bg-transparent text-white placeholder-gray-300 outline-none px-2 py-2 rounded-xl"
              autoFocus
            />
          </form>
        </div>
      )}
    </>
  );
}
