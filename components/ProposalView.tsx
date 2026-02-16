
import React from 'react';
import { ProposalData, ChangeOrderData } from '../types';
import { GoldButton } from './GoldButton';
import { Icons } from '../constants';

interface ProposalViewProps {
    proposal: ProposalData;
    coData: ChangeOrderData;
    onBack: () => void;
}

export const ProposalView: React.FC<ProposalViewProps> = ({ proposal, coData, onBack }) => {
    return (
        <div className="w-full max-w-5xl mx-auto mb-20">
            {/* Print-Hidden Controls */}
            <div className="flex gap-4 mb-8 print:hidden">
                <GoldButton onClick={onBack} variant="outline" className="px-8">
                    ← Back to Change Order
                </GoldButton>
                <GoldButton onClick={() => window.print()} className="px-8 flex-1">
                    🖨️ PRINT PROPOSAL
                </GoldButton>
            </div>

            {/* ==================== PAGE 1: COVER PAGE ==================== */}
            <div className="bg-white text-black shadow-2xl print:shadow-none overflow-hidden proposal-page" style={{ pageBreakAfter: 'always' }}>
                {/* Premium Header Bar - Gold Gradient */}
                <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-8 py-6 flex justify-between items-center">
                    <div className="w-56">
                        <Icons.Logo className="w-full h-auto" />
                    </div>
                    <div className="text-right">
                        <div className="text-white text-xs font-bold uppercase tracking-[0.3em]">Service Proposal</div>
                        <div className="text-white/80 text-[10px] mt-1">{proposal.generatedDate}</div>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 via-transparent to-[#008a8a]/10"></div>
                    <div className="relative px-12 py-16 text-center">
                        <div className="text-xs font-bold uppercase tracking-[0.4em] text-[#D4AF37] mb-4">Technology Investment Proposal</div>
                        <h1 className="text-4xl font-black uppercase tracking-tight leading-tight mb-6 text-black">
                            {proposal.projectTitle}
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#008a8a] mx-auto mb-6"></div>
                        <div className="text-lg font-semibold text-gray-700">
                            Prepared Exclusively for <span className="text-[#008a8a] font-black">{proposal.clientName}</span>
                        </div>
                    </div>
                </div>

                {/* Executive Summary - Clean White with Gold Border */}
                <div className="px-12 pb-12">
                    <div className="bg-white border-2 border-[#D4AF37] p-8 shadow-lg">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-4 flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Executive Summary
                        </h2>
                        <p className="text-gray-800 leading-relaxed text-base font-medium">
                            {proposal.executiveSummary}
                        </p>
                    </div>
                </div>

                {/* Project Details Grid */}
                <div className="px-12 pb-12">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="border-b-2 border-gray-200 pb-2">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Client</div>
                                <div className="text-lg font-bold text-black">{coData.customer}</div>
                            </div>
                            <div className="border-b-2 border-gray-200 pb-2">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Project</div>
                                <div className="text-lg font-bold text-black">{coData.projectName}</div>
                            </div>
                            <div className="border-b-2 border-gray-200 pb-2">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Location</div>
                                <div className="text-base font-medium text-gray-700">{coData.address}</div>
                            </div>
                        </div>
                        {/* Total Investment Box - Teal Gradient */}
                        <div className="bg-gradient-to-br from-[#008a8a] to-[#006666] text-white p-8 flex flex-col justify-center items-center text-center rounded-lg shadow-lg">
                            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] mb-2">Total Investment</div>
                            <div className="text-4xl font-black">
                                ${proposal.investmentSummary.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-white/80 mt-2">Complete Turnkey Solution</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#008a8a]/20 px-12 py-4 text-center border-t border-[#D4AF37]/30">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                        3D Technology Services | 11365 Sunrise Gold Circle, Rancho Cordova, CA 95742 | (916) 853-9111
                    </div>
                </div>
            </div>

            {/* ==================== PAGE 2: SOLUTION & VALUE ==================== */}
            <div className="bg-white text-black shadow-2xl print:shadow-none overflow-hidden mt-8 print:mt-0 proposal-page" style={{ pageBreakAfter: 'always' }}>
                {/* Compact Header - Gold Gradient */}
                <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-8 py-4 flex justify-between items-center">
                    <div className="w-32">
                        <Icons.Logo className="w-full h-auto" />
                    </div>
                    <div className="text-white text-xs font-bold uppercase tracking-[0.2em]">Solution Overview</div>
                </div>

                {/* The Challenge */}
                {proposal.problemStatement && (
                    <div className="px-10 py-6 border-b border-gray-200">
                        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-gray-900 mb-3 flex items-center gap-2">
                            <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm">!</span>
                            The Challenge
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{proposal.problemStatement}</p>
                    </div>
                )}

                {/* Our Solution */}
                <div className="px-10 py-6 border-b border-gray-200 bg-gradient-to-r from-[#D4AF37]/10 to-transparent">
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 bg-[#D4AF37] text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                        Our Solution
                    </h3>
                    <p className="text-gray-800 leading-relaxed font-medium">{proposal.solutionOverview}</p>
                </div>

                {/* Technical Highlights & Value Proposition Grid */}
                <div className="grid grid-cols-2 divide-x divide-gray-200">
                    {/* Technical Highlights */}
                    <div className="px-8 py-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.15em] text-[#008a8a] mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Technical Highlights
                        </h3>
                        <ul className="space-y-2">
                            {proposal.technicalHighlights.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="text-[#008a8a] font-bold mt-0.5">▸</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Value Proposition */}
                    <div className="px-8 py-6 bg-[#D4AF37]/5">
                        <h3 className="text-xs font-black uppercase tracking-[0.15em] text-[#D4AF37] mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            Business Value
                        </h3>
                        <ul className="space-y-2">
                            {proposal.valueProposition.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="text-[#D4AF37] font-bold mt-0.5">★</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Industry Insights - Teal Gradient */}
                <div className="px-10 py-6 bg-gradient-to-r from-[#008a8a] to-[#006666] text-white">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/80 mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        Industry Insights & Market Intelligence
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {proposal.industryInsights.map((insight, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                                <span className="text-[#D4AF37] font-bold">📊</span>
                                <span className="text-white/90">{insight}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#008a8a]/20 px-10 py-3 text-center border-t border-[#D4AF37]/30">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                        Page 2 | Confidential Proposal for {proposal.clientName}
                    </div>
                </div>
            </div>

            {/* ==================== PAGE 3: INVESTMENT & AUTHORIZATION ==================== */}
            <div className="bg-white text-black shadow-2xl print:shadow-none overflow-hidden mt-8 print:mt-0 proposal-page">
                {/* Compact Header - Gold Gradient */}
                <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-8 py-4 flex justify-between items-center">
                    <div className="w-32">
                        <Icons.Logo className="w-full h-auto" />
                    </div>
                    <div className="text-white text-xs font-bold uppercase tracking-[0.2em]">Investment Summary</div>
                </div>

                {/* Investment Breakdown */}
                <div className="px-10 py-8">
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-gray-900 mb-6 text-center">Your Investment</h3>
                    <div className="max-w-md mx-auto space-y-3">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-medium">Professional Labor & Installation</span>
                            <span className="font-bold font-mono">${proposal.investmentSummary.laborTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-medium">Equipment & Materials</span>
                            <span className="font-bold font-mono">${proposal.investmentSummary.materialsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-medium">Applicable Taxes</span>
                            <span className="font-bold font-mono">${proposal.investmentSummary.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        {/* Total Investment - Teal Gradient */}
                        <div className="flex justify-between items-center py-4 bg-gradient-to-r from-[#008a8a] to-[#006666] text-white px-4 -mx-4 mt-4 rounded-lg">
                            <span className="font-black uppercase tracking-wider">Total Investment</span>
                            <span className="font-black font-mono text-2xl text-[#D4AF37]">${proposal.investmentSummary.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {/* Why Choose 3D & Credentials Grid */}
                <div className="grid grid-cols-2 divide-x divide-gray-200 border-t border-gray-200">
                    {/* Why Choose Us */}
                    <div className="px-8 py-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.15em] text-[#008a8a] mb-4">Why Choose 3D Technology Services</h3>
                        <ul className="space-y-2">
                            {proposal.whyChooseUs.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="text-[#D4AF37]">✓</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Credentials */}
                    <div className="px-8 py-6 bg-[#008a8a]/5">
                        <h3 className="text-xs font-black uppercase tracking-[0.15em] text-[#D4AF37] mb-4">Our Credentials</h3>
                        <ul className="space-y-2">
                            {proposal.companyCredentials.slice(0, 5).map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="text-[#008a8a]">●</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="px-10 py-6 bg-[#D4AF37]/10 border-t border-[#D4AF37]/30">
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-gray-900 mb-4 text-center">Next Steps</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {proposal.nextSteps.map((step, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white px-4 py-2 rounded shadow-sm border border-[#D4AF37]/30">
                                <span className="w-6 h-6 bg-[#D4AF37] text-white rounded-full flex items-center justify-center text-xs font-black">{i + 1}</span>
                                <span className="text-sm font-medium text-gray-800">{step}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to Action - Teal Gradient instead of black */}
                <div className="px-10 py-8 bg-gradient-to-r from-[#008a8a] to-[#006666] text-white text-center">
                    <p className="text-lg font-semibold max-w-2xl mx-auto leading-relaxed">
                        {proposal.callToAction}
                    </p>
                </div>

                {/* Authorization Section */}
                <div className="px-10 py-8 border-t-4 border-[#D4AF37]">
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-gray-900 mb-6 text-center">Authorization to Proceed</h3>
                    <div className="max-w-2xl mx-auto">
                        <p className="text-sm text-gray-600 mb-6 text-center italic">
                            By signing below, you authorize 3D Technology Services to proceed with the proposed work under the terms specified.
                        </p>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <div className="border-b-2 border-[#008a8a] h-12 mb-2"></div>
                                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Authorized Signature</div>
                            </div>
                            <div>
                                <div className="border-b-2 border-[#008a8a] h-12 mb-2"></div>
                                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Date</div>
                            </div>
                            <div>
                                <div className="border-b-2 border-[#008a8a] h-12 mb-2"></div>
                                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Printed Name</div>
                            </div>
                            <div>
                                <div className="border-b-2 border-[#008a8a] h-12 mb-2"></div>
                                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Title</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Gold Gradient with actual logo */}
                <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-10 py-6 text-center">
                    <div className="w-32 mx-auto mb-3">
                        <Icons.Logo className="w-full h-auto" />
                    </div>
                    <div className="text-[10px] text-white/90 uppercase tracking-widest">
                        11365 Sunrise Gold Circle, Rancho Cordova, CA 95742 | Phone: (916) 853-9111 | License: #875745
                    </div>
                    <div className="text-[9px] text-white mt-2 uppercase tracking-[0.3em] font-bold">
                        Intelligence At Work™
                    </div>
                </div>
            </div>
        </div>
    );
};
