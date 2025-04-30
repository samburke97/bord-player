import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { motion } from "framer-motion";

const Loading: React.FC = () => {
  const isLoading = useSelector((state: RootState) => state.search.isLoading);

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-full px-4 py-2 z-50 flex items-center"
    >
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Loading;
