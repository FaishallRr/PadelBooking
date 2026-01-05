"use client";

export default function Notification({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[999]">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />

      <div className="relative bg-white px-8 py-6 rounded-2xl shadow-xl w-[85%] max-w-md text-center animate-fadeIn">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl font-bold"
            style={{ background: type === "success" ? "#2ecc71" : "#e74c3c" }}
          >
            {type === "success" ? "✓" : "!"}
          </div>
          <p className="text-gray-600 text-lg font-semibold">{message}</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
