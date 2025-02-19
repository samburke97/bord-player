import { FunnelIcon } from "@heroicons/react/24/outline";

interface SearchHeaderProps {
  venueCount: number;
  onOpenFilters?: () => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  venueCount,
  onOpenFilters,
}) => {
  if (venueCount === 0) return null;

  return (
    <div className="flex justify-between items-center w-full px-6 py-6 border-b-[1px] border-[#4c4d4c]">
      <div className="text-sm font-medium">
        Found {venueCount} {venueCount === 1 ? "venue" : "venues"} to cure
        bord-om.
      </div>
      <button
        onClick={onOpenFilters}
        className="flex items-center gap-2 text-sm font-medium hover:bg-gray-100 px-3 py-1.5 rounded-full border border-gray-300"
      >
        <FunnelIcon className="w-5 h-5" />
        Filters
      </button>
    </div>
  );
};

export default SearchHeader;
