import logo from "../../../../assets/logo.png";

const PageLoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="mb-8 flex items-center gap-3">
        <img
          src={logo}
          alt="JobTrack"
          className="h-12 w-12 animate-pulse object-contain"
        />
        <span className="text-xl font-semibold text-gray-950">JobTrack</span>
      </div>

      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

export default PageLoadingScreen;
