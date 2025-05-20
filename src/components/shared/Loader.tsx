const Loader = () => {
  return (
    <div className="flex-center w-full" role="status" aria-busy="true">
      <img
        src="/assets/icons/loader.svg"
        width={24}
        height={24}
        alt="Loading..."
        className="animate-spin"
      />
    </div>
  );
};

export default Loader;
