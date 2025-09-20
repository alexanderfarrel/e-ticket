import { motion } from "framer-motion";

export default function SkeletonCard({ id }: { id: number }) {
  return (
    <motion.div
      key={id}
      className="rounded-lg bg-[#eee] p-3 flex flex-col gap-2 justify-center"
    >
      <div className="overflow-hidden rounded-lg w-full mx-auto relative">
        <div className="w-full aspect-[4/3] bg-gray-200 animate-pulse rounded-md" />
      </div>

      <div className="flex justify-between items-center">
        <div className="h-5 w-1/2 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
      </div>

      <div className="h-[6rem] w-full bg-gray-200 animate-pulse rounded" />

      <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded" />

      <div className="mt-auto">
        <div className="h-9 w-full bg-gray-200 animate-pulse rounded" />
      </div>
    </motion.div>
  );
}
