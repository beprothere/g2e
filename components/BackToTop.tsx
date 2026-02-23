'use client'

const BackToTop = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className="back-to-top-btn"
      type="button"
      aria-label="Back to top"
      title="Back to top"
    >
      {"\u2191"}
    </button>
  );
};

export default BackToTop;
