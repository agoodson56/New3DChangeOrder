
import React, { useState, useRef } from 'react';
import { GoldButton } from './GoldButton';
import { generateChangeOrder } from '../services/geminiService';
import { ChangeOrderData } from '../types';

interface COGeneratorProps {
  onResult: (data: ChangeOrderData) => void;
}

export const COGenerator: React.FC<COGeneratorProps> = ({ onResult }) => {
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Administrative Fields
  const [adminData, setAdminData] = useState({
    customer: '',
    contact: '',
    projectName: '',
    address: '',
    phone: '',
    projectNumber: '53160',
    rfiNumber: '',
    pcoNumber: ''
  });

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async () => {
    if (!intent.trim()) return;
    setLoading(true);
    try {
      const result = await generateChangeOrder(intent, images, adminData);
      onResult(result);
    } catch (error) {
      console.error(error);
      alert("Error generating Change Order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-[#0a0a0a] border border-gray-800 text-white p-2.5 focus:border-[#D4AF37] outline-none transition-all text-sm placeholder-gray-700";
  const labelClasses = "block text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-1.5";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      {/* Administrative Intake Section */}
      <div className="p-6 bg-white/5 border border-gray-900 shadow-xl space-y-6">
        <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.3em] border-b border-gray-800 pb-2">Administrative Intake</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>Customer Name</label>
              <input name="customer" value={adminData.customer} onChange={handleAdminChange} className={inputClasses} placeholder="e.g. Warehouse Client" />
            </div>
            <div>
              <label className={labelClasses}>Contact Person</label>
              <input name="contact" value={adminData.contact} onChange={handleAdminChange} className={inputClasses} placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className={labelClasses}>Project Name</label>
              <input name="projectName" value={adminData.projectName} onChange={handleAdminChange} className={inputClasses} placeholder="Warehouse Infrastructure Expansion" />
            </div>
            <div>
              <label className={labelClasses}>Site Address</label>
              <input name="address" value={adminData.address} onChange={handleAdminChange} className={inputClasses} placeholder="123 Industrial Way, Rancho Cordova, CA" />
            </div>
            <div>
              <label className={labelClasses}>Phone</label>
              <input name="phone" value={adminData.phone} onChange={handleAdminChange} className={inputClasses} placeholder="(916) 555-0199" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>3DTSI Project #</label>
              <input name="projectNumber" value={adminData.projectNumber} onChange={handleAdminChange} className={inputClasses} placeholder="53160" />
            </div>
            <div>
              <label className={labelClasses}>RFI #</label>
              <input name="rfiNumber" value={adminData.rfiNumber} onChange={handleAdminChange} className={inputClasses} placeholder="-" />
            </div>
            <div>
              <label className={labelClasses}>PCO #</label>
              <input name="pcoNumber" value={adminData.pcoNumber} onChange={handleAdminChange} className={inputClasses} placeholder="-" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-[#D4AF37] uppercase tracking-widest">
            Coordinator Intent Description
          </label>
          <button
            type="button"
            onClick={() => {
              // Check for browser support
              const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
              if (!SpeechRecognition) {
                alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
                return;
              }

              const recognition = new SpeechRecognition();
              recognition.continuous = true;
              recognition.interimResults = true;
              recognition.lang = 'en-US';

              // Visual feedback via React state
              setIsListening(true);

              let finalTranscript = '';

              recognition.onresult = (event: any) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                  const transcript = event.results[i][0].transcript;
                  if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                  } else {
                    interimTranscript += transcript;
                  }
                }
                // Update the intent with the transcribed text
                setIntent(prev => prev + finalTranscript);
                finalTranscript = '';
              };

              recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
              };

              recognition.onend = () => {
                setIsListening(false);
              };

              recognition.start();

              // Stop after 30 seconds max
              setTimeout(() => {
                recognition.stop();
              }, 30000);
            }}
            className={`flex items-center gap-2 px-4 py-2 font-bold text-xs uppercase tracking-wider transition-all ${isListening ? 'animate-pulse bg-red-600 text-white' : 'bg-[#D4AF37] text-black hover:bg-[#FFD700]'}`}
          >
            {isListening ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" /></svg>
                Listening...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Voice Input
              </>
            )}
          </button>
        </div>
        <textarea
          className="w-full h-40 bg-[#0a0a0a] border border-gray-800 text-white p-6 focus:border-[#D4AF37] outline-none transition-all resize-none shadow-inner text-lg placeholder-gray-700"
          placeholder="Type your description here, or click 'Voice Input' to speak it. e.g., 'Add two cameras in the warehouse at column B4 and C6. Include cabling back to MDF-1.'"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
        />
      </div>

      {/* Guidance Section */}
      <div className="p-6 bg-white/5 border border-gray-900 shadow-xl space-y-4">
        <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.3em] border-b border-gray-800 pb-2">Tips for Best Results</h3>
        <div className="text-sm text-gray-400 space-y-3">
          <p className="leading-relaxed">
            <span className="text-[#D4AF37] font-bold">Be specific about manufacturers:</span> If you have a preferred brand, include it in your description.
            <span className="text-gray-500 italic"> Example: "Add 4 Axis cameras..." or "Run Panduit Cat6 cabling..."</span>
          </p>
          <p className="leading-relaxed">
            <span className="text-[#D4AF37] font-bold">Include model numbers when known:</span> Specific models ensure accurate pricing and compatibility.
            <span className="text-gray-500 italic"> Example: "Install Axis P3245-V cameras" or "Use Leviton 6A250 jacks"</span>
          </p>
          <p className="leading-relaxed">
            <span className="text-[#D4AF37] font-bold">Mention heights and distances:</span> Include ceiling heights (for lift requirements) and cable run lengths.
            <span className="text-gray-500 italic"> Example: "Cameras at 18ft ceiling height, approximately 150ft cable runs to MDF"</span>
          </p>
          <p className="leading-relaxed">
            <span className="text-[#D4AF37] font-bold">If no manufacturer specified:</span> The system will select appropriate professional-grade equipment and maintain brand consistency within each system type.
          </p>
          <p className="leading-relaxed border-t border-gray-800 pt-3 mt-3">
            <span className="text-[#D4AF37] font-bold">⚡ NECA MLU Aligned:</span> Labor formulas are aligned with NECA Manual of Labor Units (MLU) standards, featuring Normal/Difficult/Very Difficult condition multipliers for accurate estimating.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-8 border-t border-gray-900">
        <GoldButton
          onClick={handleSubmit}
          loading={loading}
          className="w-full md:w-auto"
        >
          Generate Service Change Order
        </GoldButton>
      </div>
    </div>
  );
};
