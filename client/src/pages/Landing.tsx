import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="max-w-sm mx-auto bg-card min-h-screen relative overflow-hidden">
      <div className="relative h-screen bg-gradient-to-br from-primary to-secondary overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-40 right-8 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-40 left-6 w-12 h-12 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-12 w-24 h-24 bg-white rounded-full"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center text-white">
          {/* Logo/Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <i className="fas fa-hands-helping text-4xl text-white"></i>
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl font-bold mb-4">Shram Daan</h1>
          <p className="text-xl text-white/90 mb-2">श्रमदान</p>
          
          {/* Tagline */}
          <p className="text-lg text-white/80 mb-12 leading-relaxed">
            Connect with your community through meaningful volunteer work
          </p>
          
          {/* Features */}
          <div className="space-y-4 mb-12">
            <div className="flex items-center space-x-3">
              <i className="fas fa-map-marker-alt text-lg"></i>
              <span className="text-white/90">Find projects near you</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="fas fa-users text-lg"></i>
              <span className="text-white/90">Join community efforts</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="fas fa-trophy text-lg"></i>
              <span className="text-white/90">Earn recognition</span>
            </div>
          </div>
          
          {/* CTA Button */}
          <Button 
            className="w-full bg-white text-primary font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-50"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-get-started"
          >
            Get Started
          </Button>
          
          <p className="text-sm text-white/70 mt-6">
            Already have an account?{" "}
            <span 
              className="underline cursor-pointer"
              onClick={() => window.location.href = '/api/login'}
              data-testid="link-sign-in"
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
