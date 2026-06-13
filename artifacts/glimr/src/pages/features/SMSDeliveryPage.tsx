import React, { useState } from 'react';

export default function SMSDeliveryPage() {
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [glimrUrl, setGlimrUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [copied, setCopied] = useState(false);

  const displayUrl = glimrUrl || 'https://glimr.com.au/view/abc123';
  const displaySender = senderName || 'Your Name';
  const displayRecipient = recipientName || 'Sarah';
  const displayCaption = caption || 'I recorded something for you. Open this when you have a moment.';
  const timeStr = new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleCopy = () => {
    const msg = `${displayCaption}\n\n${displayUrl}`;
    navigator.clipboard.writeText(msg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white p-8 font-sans">
      <header className="mb-10">
        <p className="text-[11px] tracking-[3px] text-orange-500 uppercase mb-2">Feature 05</p>
        <h1 className="text-4xl font-bold tracking-tight">SMS + iMessage Delivery</h1>
        <p className="text-gray-500 text-sm mt-2 max-w-md">
          Preview exactly how your Glimr lands in the recipient's messages app before you send.
        </p>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="bg-[#141414] rounded-xl border border-[#222] p-5 space-y-4">
            <p className="text-[11px] tracking-[2px] text-gray-500 uppercase">Message Details</p>

            <label className="block">
              <span className="text-xs text-gray-500">Your Name</span>
              <input
                className="mt-1 w-full bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-orange-600 transition-colors"
                placeholder="Alex"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-xs text-gray-500">Recipient Name</span>
              <input
                className="mt-1 w-full bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-orange-600 transition-colors"
                placeholder="Sarah"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-xs text-gray-500">Glimr Link</span>
              <input
                className="mt-1 w-full bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-orange-600 transition-colors"
                placeholder="https://glimr.com.au/view/..."
                value={glimrUrl}
                onChange={(e) => setGlimrUrl(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-xs text-gray-500">Caption</span>
              <textarea
                className="mt-1 w-full bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-orange-600 transition-colors resize-none h-24"
                placeholder="I recorded something for you. Open this when you have a moment."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </label>
          </div>

          <button
            onClick={handleCopy}
            className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-colors ${
              copied ? 'bg-green-700 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white'
            }`}
          >
            {copied ? 'Copied to Clipboard' : 'Copy Message'}
          </button>
        </div>

        {/* Phone mockup */}
        <div className="flex justify-center">
          <div className="relative w-72">
            {/* Phone shell */}
            <div className="bg-[#1a1a1a] rounded-[44px] border-[3px] border-[#2a2a2a] overflow-hidden shadow-2xl">
              {/* Notch */}
              <div className="bg-[#111] h-8 flex items-center justify-center">
                <div className="w-20 h-4 bg-black rounded-full" />
              </div>

              {/* Status bar */}
              <div className="bg-[#f2f2f7] px-5 py-1.5 flex justify-between items-center">
                <span className="text-[10px] font-semibold text-black">{timeStr}</span>
                <div className="flex gap-1 items-center">
                  <div className="w-4 h-2.5 border border-black/60 rounded-[2px] relative">
                    <div className="absolute inset-0.5 bg-black/70 rounded-[1px]" />
                  </div>
                </div>
              </div>

              {/* Messages header */}
              <div className="bg-[#f2f2f7] px-4 py-2 border-b border-[#d1d1d6] text-center">
                <p className="text-[10px] text-[#8e8e93] mb-0.5">{displaySender}</p>
                <p className="text-sm font-semibold text-black">{displayRecipient}</p>
              </div>

              {/* Messages thread */}
              <div className="bg-[#f2f2f7] px-3 py-4 min-h-[360px] flex flex-col justify-end gap-2">
                {/* Timestamp */}
                <p className="text-center text-[9px] text-[#8e8e93] mb-1">{timeStr}</p>

                {/* Sent bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-[#007aff] rounded-2xl rounded-br-sm px-3 py-2">
                    <p className="text-white text-[12px] leading-relaxed">{displayCaption}</p>
                  </div>
                </div>

                {/* Rich link preview card */}
                <div className="flex justify-end">
                  <div className="max-w-[90%] bg-white rounded-2xl rounded-br-sm overflow-hidden shadow-sm border border-[#e5e5ea]">
                    {/* Preview image placeholder */}
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] h-28 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full border border-orange-500/50 mx-auto mb-1.5 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[9px] border-t-transparent border-b-transparent border-l-orange-400 ml-0.5" />
                        </div>
                        <p className="text-[9px] text-orange-400 tracking-widest uppercase">Glimr</p>
                      </div>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-[9px] text-[#8e8e93] uppercase tracking-wider">glimr.com.au</p>
                      <p className="text-[11px] font-semibold text-black mt-0.5">A Glimr from {displaySender}</p>
                      <p className="text-[10px] text-[#6d6d72] mt-0.5 truncate">{displayUrl}</p>
                    </div>
                  </div>
                </div>

                {/* Read receipt */}
                <p className="text-right text-[9px] text-[#8e8e93] pr-1">Delivered</p>
              </div>

              {/* Input bar */}
              <div className="bg-[#f2f2f7] border-t border-[#d1d1d6] px-3 py-2 flex items-center gap-2">
                <div className="flex-1 bg-white border border-[#d1d1d6] rounded-full px-3 py-1.5">
                  <span className="text-[11px] text-[#c7c7cc]">iMessage</span>
                </div>
                <div className="w-6 h-6 bg-[#007aff] rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-t-transparent border-b-transparent border-l-white ml-0.5" />
                </div>
              </div>

              {/* Bottom home indicator */}
              <div className="bg-[#f2f2f7] flex justify-center py-2">
                <div className="w-24 h-1 bg-black/20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
