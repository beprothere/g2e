const Loader = ({ line }: { line: string }) => {
  return (
    <div className="loader-box w-fit max-w-xs text-center bg-white border border-gray-200 flex items-center gap-4 flex-col p-8 rounded shadow-lg shadow-gray-500">
      <span className="loader"></span>
      <p>{line}</p>
    </div>
  );
};

export default Loader;
