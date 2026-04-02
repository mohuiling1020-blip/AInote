'use client';

export default function LandingBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Warm paper base */}
      <div className="absolute inset-0 bg-morandi-paper" />

      {/* Subtle warm gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-morandi-paper via-morandi-paper-warm/40 to-morandi-paper" />

      {/* Organic shapes — soft, large, slow-moving */}
      <div className="absolute top-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full bg-morandi-mint/15 blur-[120px] animate-float-slow" />
      <div className="absolute top-[40%] left-[-15%] w-[600px] h-[600px] rounded-full bg-morandi-cream/12 blur-[100px] animate-float-medium" />
      <div className="absolute bottom-[-10%] right-[15%] w-[500px] h-[500px] rounded-full bg-morandi-beige/15 blur-[100px] animate-float-fast" />

      {/* Subtle dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #6C786E 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
}
