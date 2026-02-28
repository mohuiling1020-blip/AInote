import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background - same Morandi gradient as main app */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-transparent">
        <div className="absolute top-[-10%] left-[-2%] w-[200px] h-[200px] rounded-full bg-[#EBE2AA] blur-[50px] opacity-60" />
        <div className="absolute bottom-[5%] left-[0%] w-[800px] h-[600px] rounded-full bg-[#C8D5C5] blur-[200px] opacity-60" />
        <div className="absolute top-[8%] right-[10%] w-[380px] h-[380px] rounded-full bg-[#EBE2AA] blur-[150px] opacity-85" />
        <div className="absolute top-[5%] left-[1%] w-[800px] h-[800px] rounded-full bg-[#949F97] blur-[200px] opacity-80" />
        <div className="absolute bottom-[1%] right-[1%] w-[1000px] h-[700px] rounded-full bg-[#EEE9D0] blur-[130px] opacity-60" />
      </div>

      <div className="relative z-10">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_30px_60px_-15px_rgba(148,159,151,0.25)] rounded-[20px]',
            },
          }}
        />
      </div>
    </div>
  );
}
