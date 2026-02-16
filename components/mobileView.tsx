import React from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Laptop, Smartphone, ArrowRight } from "lucide-react"
import Image from "next/image"

const MobileView = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0A0A0A] relative overflow-hidden">
      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      
      {/* Stars */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-transparent" 
           style={{backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "50px 50px", opacity: "0.1"}}>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-md px-4">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center mb-8">
          <Image src="/assets/web-blue.svg" alt="Spidey" width={45} height={45} />
          <h1 className="text-2xl font-bold text-white ml-2 tracking-tight">Spidey Platform</h1>
        </div>

        {/* Warning Card */}
        <Card className="w-full bg-black/30 backdrop-blur-xl border border-blue-500/10 shadow-2xl">
          <div className="p-8 space-y-6">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Laptop className="h-8 w-8 text-blue-400" />
              </div>
            </div>

            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold text-white">Desktop Experience Required</h2>
              <p className="text-sm text-gray-400">Please access Spidey Platform on a desktop device for the best experience</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Smartphone className="h-4 w-4" />
              <span>Mobile version coming soon</span>
              <ArrowRight className="h-4 w-4" />
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => window.location.href = "https://thespidey.com"}
                variant="outline" 
                className="w-full bg-transparent border border-blue-500/20 text-white hover:bg-blue-500/10 hover:border-blue-500/30 h-12"
              >
                Visit Website
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default MobileView