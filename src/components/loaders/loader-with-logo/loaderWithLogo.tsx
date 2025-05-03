import { CircularProgress } from "@nextui-org/progress";

function LoaderWithLogo() {
  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.05)] p-8 w-[400px] transform translate-y-[-10%]">
        <div className="flex flex-col items-center">
          <div className="mb-6">
            <CircularProgress
              classNames={{
                svg: "w-12 h-12",
                indicator: "stroke-[#4F46E5]",
                track: "stroke-[#E0E7FF]",
              }}
              strokeWidth={4}
              value={60}
              showValueLabel={false}
            />
          </div>
          
          <h3 className="text-[20px] font-medium text-gray-800 mb-2">Creating Your Interview</h3>
          <p className="text-[14px] text-gray-500 mb-4">Please wait while we set everything up...</p>
          
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-[#4F46E5] animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-[#4F46E5] animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-[#4F46E5] animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoaderWithLogo;
