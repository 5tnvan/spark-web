import { useEffect, useRef } from "react";

const ArrowDownFetchMore = ({ fetchMore }: { fetchMore: () => void }) => {
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          fetchMore(); // Call the function to fetch more data
        }
      },
      { threshold: 1.0 } // Trigger when 100% of the element is in view
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [fetchMore]);

  return (
    <div
      ref={observerRef}
      className="flex justify-center items-center"
      style={{ height: "50px", width: "50px" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-6 h-6 animate-bounce"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
};

export default ArrowDownFetchMore;
