"use client";

import React from "react";
import { MapPin, Calendar, Heart } from "lucide-react";
import { MemoryData } from "@/types";

interface MemoryTimelineProps {
  memories: MemoryData[];
}

export default function MemoryTimeline({ memories }: MemoryTimelineProps) {
  if (!memories || memories.length === 0) {
    return null;
  }

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8">
      <div className="text-center max-w-xl mx-auto mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-rosewarm">
          Bizim Hikayemiz
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-wine mt-1">
          Anı Zaman Tüneli 📸
        </h3>
        <p className="text-sm text-[#6D2E46] mt-1">
          Seninle biriktirdiğimiz ve kalbimin en güzel köşesinde sakladığım unutulmaz anlarımız:
        </p>
      </div>

      <div className="relative border-l-2 border-rosewarm/40 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-8">
        {memories.map((mem) => (
          <div key={mem.id} className="relative group">
            {/* Zaman Tüneli İkonu */}
            <div className="absolute -left-[37px] sm:-left-[45px] top-2 w-7 h-7 rounded-full bg-gradient-to-br from-rosewarm to-wine text-white flex items-center justify-center shadow">
              <Heart className="w-3.5 h-3.5 fill-white" />
            </div>

            <div className="bg-white/85 rounded-3xl overflow-hidden border border-rosewarm/25 shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-12">
              <div className="md:col-span-5 h-56 md:h-auto relative overflow-hidden bg-powder">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mem.mediaUrl}
                  alt={mem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="md:col-span-7 p-5 sm:p-6 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-rosewarm mb-2">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(mem.date).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  {mem.location && (
                    <span className="inline-flex items-center gap-1 text-wine/80">
                      <MapPin className="w-3.5 h-3.5" />
                      {mem.location}
                    </span>
                  )}
                </div>

                <h4 className="font-serif text-xl font-bold text-wine mb-2">
                  {mem.title}
                </h4>
                <p className="text-sm text-[#6D2E46] leading-relaxed">
                  {mem.story}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
