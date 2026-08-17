'use client';

import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

export const ProjectEstimationCalculator: React.FC = () => {
  const [serviceType, setServiceType] = useState<'design' | 'development' | 'both'>('both');
  const [pages, setPages] = useState<number>(5);
  const [needContent, setNeedContent] = useState<boolean>(false);
  const [needSEO, setNeedSEO] = useState<boolean>(false);
  const [timeline, setTimeline] = useState<'regular' | 'fast' | 'rush'>('regular');

  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [agencyPrice, setAgencyPrice] = useState<number>(0);
  const [freelancerPrice, setFreelancerPrice] = useState<number>(0);

  useEffect(() => {
    // Base prices by service
    let base = 499;
    let perPage = 200;
    
    if (serviceType === 'design') {
      base = 399;
      perPage = 100;
    } else if (serviceType === 'development') {
      base = 199;
      perPage = 100;
    } else {
      base = 499;
      perPage = 200;
    }

    let total = Math.max(base, base + (pages - 1) * perPage);
    
    if (needContent) total += pages * 50;
    if (needSEO) total += pages * 50;
    if (timeline === 'rush') total += pages * 100;
    if (timeline === 'fast') total += pages * 25;

    setTotalPrice(total);

    // Agency Cost
    const agencyPerPage = serviceType === 'both' ? 1000 : 400;
    setAgencyPrice(8000 + (pages - 1) * agencyPerPage);

    // Freelancer Cost
    const freelancerPerPage = serviceType === 'both' ? 500 : 200;
    setFreelancerPrice(3000 + (pages - 1) * freelancerPerPage);

  }, [serviceType, pages, needContent, needSEO, timeline]);

  const CustomRadio = ({ active }: { active: boolean }) => (
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${active ? 'border-[#FF5656]' : 'border-gray-500'}`}>
      {active && <div className="w-2.5 h-2.5 rounded-full bg-[#FF5656]" />}
    </div>
  );

  const CustomCheckbox = ({ checked }: { checked: boolean }) => (
    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${checked ? 'border-[#FF5656] bg-[#FF5656]' : 'border-gray-500'}`}>
      {checked && <Check size={14} className="text-white" strokeWidth={3} />}
    </div>
  );

  return (
    <section id="calculator-section" className="bg-[var(--color-bg)] py-16 md:py-28 px-4 md:px-16 w-full">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-[#71717A] dark:text-[#A1A1AA]">
            Try project estimation calculator
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-[#18181B] dark:text-[#FDF2F8]">
            Get premium website within your budget
          </h2>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl">
          
          {/* LEFT COLUMN */}
          <div className="bg-[#0D0D0D] p-8 lg:p-12 text-white divide-y divide-[#1E1E1E]">
            
            {/* Service Type */}
            <div className="pb-8 space-y-6">
              <h3 className="text-lg font-medium">What kind of service do you need?</h3>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {[
                  { id: 'design', label: 'Only Design' },
                  { id: 'development', label: 'Only Development' },
                  { id: 'both', label: 'Design + Development' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setServiceType(option.id as any)}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity text-sm sm:text-base text-left"
                  >
                    <CustomRadio active={serviceType === option.id} />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Pages */}
            <div className="py-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Number of Pages</h3>
                <span className="text-[#FF5656] text-xl font-bold">{pages}</span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={pages}
                  onChange={(e) => setPages(Number(e.target.value))}
                  className="w-full accent-[#FF5656] h-2 bg-[#1E1E1E] rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 font-mono">
                  <span>1</span>
                  <span>30</span>
                </div>
              </div>
            </div>

            {/* Add-ons */}
            <div className="py-8 space-y-6">
              <h3 className="text-lg font-medium">Add-ons</h3>
              <div className="space-y-4">
                <button
                  onClick={() => setNeedContent(!needContent)}
                  className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <CustomCheckbox checked={needContent} />
                    <span className="text-sm sm:text-base text-left">I will need help with content</span>
                  </div>
                  <span className="text-[#FF5656] text-sm font-medium">+$50/pages</span>
                </button>
                <button
                  onClick={() => setNeedSEO(!needSEO)}
                  className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <CustomCheckbox checked={needSEO} />
                    <span className="text-sm sm:text-base text-left">I want to optimize my website for SEO</span>
                  </div>
                  <span className="text-[#FF5656] text-sm font-medium">+$50/pages</span>
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="pt-8 space-y-6">
              <h3 className="text-lg font-medium">How fast do you need this?</h3>
              <div className="space-y-4 flex flex-col items-start">
                {[
                  { id: 'rush', label: 'Within 7 Days', price: '+$100/pages' },
                  { id: 'fast', label: 'Within 14 Days', price: '+$25/pages' },
                  { id: 'regular', label: 'Regular Speed (Based on discussion)', price: 'No Extra' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTimeline(option.id as any)}
                    className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-3">
                      <CustomRadio active={timeline === option.id} />
                      <span className="text-sm sm:text-base text-left">{option.label}</span>
                    </div>
                    {option.price !== 'No Extra' ? (
                      <span className="text-[#FF5656] text-sm font-medium">{option.price}</span>
                    ) : (
                      <span className="text-gray-500 text-sm font-medium">{option.price}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="bg-[#050505] p-8 lg:p-12 border border-white/10 lg:rounded-r-2xl text-white flex flex-col justify-center min-h-[717.98px]">
            <div className="space-y-8 w-full max-w-md mx-auto">
              
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Estimated Cost</h3>
                <p className="text-[#A1A1AA] text-sm">Compare our transparent pricing with typical market rates.</p>
              </div>

              <div className="space-y-4">
                
                {/* Agency Card */}
                <div className="bg-[#1A1A1A]/50 rounded-2xl p-6 space-y-3 border border-white/5">
                  <p className="text-sm text-[#A1A1AA]">Typical Agency charges minimum</p>
                  <p className="text-3xl sm:text-4xl font-bold text-gray-400 line-through decoration-red-500/50">
                    ${agencyPrice.toLocaleString()}
                  </p>
                  <p className="text-xs text-red-400 font-medium">+ Too much extra time & additional cost</p>
                </div>

                {/* Freelancer Card */}
                <div className="bg-[#1A1A1A]/50 rounded-2xl p-6 space-y-3 border border-white/5">
                  <p className="text-sm text-[#A1A1AA]">Regular Freelancer charges minimum</p>
                  <p className="text-3xl sm:text-4xl font-bold text-gray-400 line-through decoration-red-500/50">
                    ${freelancerPrice.toLocaleString()}
                  </p>
                  <p className="text-xs text-orange-400 font-medium">+ Too much headache & back-and-forth</p>
                </div>

                {/* Your Price Card */}
                <div className="bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl p-6 space-y-3 shadow-[0_0_40px_rgba(236,72,153,0.3)] transform lg:scale-105 border border-white/20">
                  <p className="text-sm text-white/90 font-medium">With Webfluin Studio (Example)</p>
                  <p className="text-4xl sm:text-5xl font-black text-white">
                    ${totalPrice.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/90 font-bold bg-white/20 inline-block px-2 py-1 rounded-full">
                    Save your money, time & headache
                  </p>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProjectEstimationCalculator;
