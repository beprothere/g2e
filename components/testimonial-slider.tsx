"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Card } from "./ui/card";
import { Pause, Play } from "lucide-react";
const testimonials = [
  {
    name: "Sarah Chen",
    role: "Basic Plan Member",
    quote:
      "Earned $500 in my first month just by sharing my referral link. Best decision ever!",
    avatar: "/img/sara.jpg",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Standard Plan Member",
    quote:
      "The investor program is a game-changer. My 30 referrals turned into $3,300 monthly passive income.",
    avatar: "/img/marcus.jpg",
    rating: 5,
  },
  {
    name: "Elena Rodriguez",
    role: "Premium Plan Member",
    quote:
      "Reached 50 members and I'm now earning 65% per signup. This is incredible!",
    avatar: "/img/elena.jpg",
    rating: 5,
  },
  {
    name: "Ahmed Khan",
    role: "Premium Plan Member",
    quote:
      "The support team is amazing. They guided me through the entire process and I'm already making profits.",
    avatar: "/img/ahmad.jpg",
    rating: 5,
  },
  {
    name: "Lisa Wong",
    role: "Standard Plan Member",
    quote:
      "This platform changed my life. Financial independence is now within my reach!",
    avatar: "/img/lisa.jpg",
    rating: 5,
  },
];

const TestimonialSlider = () => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (!swiperRef.current) return;

    if (swiperRef.current.autoplay.running) {
      swiperRef.current.autoplay.stop();
    } else {
      swiperRef.current.autoplay.start();
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <div className="testimonial-slider">
      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        modules={[Navigation, Pagination, Autoplay]}
        loop
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        slidesPerView={1}
        spaceBetween={20}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {testimonials.map((testimonial, index) => (
          <SwiperSlide key={index} className="px-4">
            <Card className="glass border-primary/20 p-6 h-72.5 hover:shadow-premium transition-all duration-300">
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-lg">
                    ⭐
                  </span>
                ))}
              </div>

              <p className="text-foreground/80 mb-6 italic">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden object-cover">
                  <img
                    src={testimonial.avatar}
                    className="rounded-full w-full h-full object-cover"
                    alt={testimonial.name + "-.-" + testimonial.role}
                  />
                </div>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-foreground/70">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mt-4 flex justify-center">
        <button
          onClick={togglePlay}
          className="px-4 py-2 rounded-full bg-primary text-white text-sm"
        >
          {isPlaying ? (
            <b className="flex items-center gap-1">
              <Pause size={18} /> Pause
            </b>
          ) : (
            <b className="flex items-center gap-1">
              <Play size={18} /> Play
            </b>
          )}
        </button>
      </div>
    </div>
  );
};

export default TestimonialSlider;
