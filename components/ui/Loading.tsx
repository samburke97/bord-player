import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const Loading: React.FC = () => {
  const isLoading = useSelector((state: RootState) => state.search.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-full px-4 py-2 z-50 flex items-center">
      <div className="flex space-x-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      </div>
    </div>
  );
};

export default Loading;
