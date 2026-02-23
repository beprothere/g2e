"use client";

import dynamic from "next/dynamic";

function SectionFallback({ height = "h-96" }: { height?: string }) {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`w-full rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse ${height}`}
        />
      </div>
    </section>
  );
}

export const VideoSectionClient = dynamic(() => import("./VideoSection"), {
  ssr: false,
  loading: () => <SectionFallback height="h-[420px]" />,
});

export const TestimonialSliderClient = dynamic(
  () => import("@/components/testimonial-slider"),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
    ),
  },
);

export const BackToTopClient = dynamic(() => import("@/components/BackToTop"), {
  ssr: false,
});
