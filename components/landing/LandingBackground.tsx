'use client';

export default function LandingBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Warm base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F5F0E8] via-[#EDE8DC] to-[#E8E3D7]" />

      {/* Floating orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-morandi-mint/30 blur-3xl animate-float-slow" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-morandi-cream/25 blur-3xl animate-float-medium" />
      <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-morandi-sage/20 blur-3xl animate-float-fast" />
      <div className="absolute top-[60%] left-[50%] w-[300px] h-[300px] rounded-full bg-morandi-beige/30 blur-3xl animate-float-slow" />
    </div>
  );
}
