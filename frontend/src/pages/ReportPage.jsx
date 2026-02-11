import React from "react";
import UploadLocation from "../components/UploadLocation";
import LocationList from "../components/LocationList";

const ReportPage = () => {
  return (
    <div className="min-h-screen bg-asphalt-950">
      {/* Full-bleed header with topo texture */}
      <div className="relative pt-28 pb-14 px-6 overflow-hidden">
        <div className="absolute inset-0 topo-lines noise-bg opacity-60" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-warn/[0.03] rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="text-[11px] font-mono text-warn tracking-[0.3em] uppercase mb-3">
                // report.submit
              </p>
              <h1 className="text-4xl md:text-5xl font-display text-white leading-tight">
                Report Damage
              </h1>
              <p className="text-road-light mt-3 max-w-lg text-[15px] leading-relaxed">
                Upload dashcam or phone footage with GPS coordinates. Your reports feed directly
                into the AI detection pipeline and municipal repair queue.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-6 text-right">
              <div>
                <div className="text-2xl font-display text-white">30s</div>
                <div className="text-[10px] text-road uppercase tracking-widest">avg upload</div>
              </div>
              <div className="w-px h-10 bg-asphalt-700" />
              <div>
                <div className="text-2xl font-display text-warn">95%</div>
                <div className="text-[10px] text-road uppercase tracking-widest">detection</div>
              </div>
            </div>
          </div>
        </div>
        {/* Divider line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-asphalt-700 to-transparent" />
      </div>

      {/* Content area — asymmetric layout */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Upload — left column, sticky on desktop */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <UploadLocation />
            </div>
          </div>

          {/* Vertical separator */}
          <div className="hidden lg:flex justify-center">
            <div className="w-px bg-gradient-to-b from-asphalt-700 via-asphalt-700/50 to-transparent" />
          </div>

          {/* Reports — right column, scrollable */}
          <div className="lg:col-span-6">
            <LocationList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
