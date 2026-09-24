'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/app/header';
import Footer from '@/app/footer';
import { Phone, Clock, MapPin, Calendar, MessageCircle, ExternalLink, Send, CheckCircle2 } from 'lucide-react';

export default function ContactUsPage() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Compose WhatsApp message directly to the business number
    const text = `Hello Kunddan Home Foods!%0A%0A*Name:* ${encodeURIComponent(name || 'Customer')}%0A*Mobile:* ${encodeURIComponent(mobile || 'Not provided')}%0A*Message:* ${encodeURIComponent(message)}`;
    window.open(`https://wa.me/919398965589?text=${text}`, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#231E1A]">
      <Header />

      <main className="flex-1 w-full">
        {/* Page Hero Header */}
        <section className="app-container pt-8 md:pt-14 pb-8 md:pb-12">
          <div className="max-w-3xl space-y-4">
            <div className="text-eyebrow">
              GET IN TOUCH
            </div>
            <h1 className="text-page-title">
              Contact Kunddan Home Foods
            </h1>
            <p className="text-body-lead">
              Have questions about our fresh homemade items, custom orders, or need help with delivery? We are here to help you everyday.
            </p>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="app-container pb-16 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Direct Contact Info Cards */}
            <div className="lg:col-span-6 space-y-6">
              {/* Phone & WhatsApp Card */}
              <div className="card-feature !p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FBF0EB] flex items-center justify-center text-[#963A1F] flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="card-feature-title !text-lg">Phone &amp; WhatsApp</h3>
                    <p className="card-feature-desc">Call or chat with us for fast response</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                  <a
                    href="tel:9398965589"
                    className="btn-primary !py-2.5 !px-5 gap-2 text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call 9398965589</span>
                  </a>
                  <a
                    href="https://wa.me/919398965589?text=Hello%20Kunddan%20Home%20Foods,%20I%20would%20like%20to%20inquire%20about%20your%20products."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline !py-2.5 !px-5 gap-2 text-sm !border-[#25D366] !text-[#1E7E34] hover:!bg-[#E8F8EE]"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>WhatsApp Us</span>
                  </a>
                </div>
              </div>

              {/* Working Hours & Schedule Card */}
              <div className="card-feature !p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FBF0EB] flex items-center justify-center text-[#963A1F] flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="card-feature-title !text-lg">Business Working Hours</h3>
                    <p className="card-feature-desc">Open every day of the year</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-3.5 bg-[#FAF6F0] rounded-lg border border-[#E8E0D2]">
                    <div className="text-[11px] uppercase tracking-wider font-bold text-[#9E3E22] flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Daily Hours</span>
                    </div>
                    <p className="text-base font-bold text-[#231E1A]">10:00 AM – 7:30 PM</p>
                  </div>

                  <div className="p-3.5 bg-[#FAF6F0] rounded-lg border border-[#E8E0D2]">
                    <div className="text-[11px] uppercase tracking-wider font-bold text-[#9E3E22] flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Weekly Schedule</span>
                    </div>
                    <p className="text-base font-bold text-[#231E1A]">365 Days Working</p>
                  </div>
                </div>
              </div>

              {/* Address & Google Maps Card */}
              <div className="card-feature !p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FBF0EB] flex items-center justify-center text-[#963A1F] flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="card-feature-title !text-lg">Kitchen &amp; Store Address</h3>
                    <p className="card-feature-desc">Ramavarappadu, Vijayawada</p>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF6F0] rounded-lg border border-[#E8E0D2] space-y-2">
                  <p className="text-sm md:text-base font-semibold text-[#231E1A] leading-relaxed">
                    Flat no - SF2, Ayodhya enclave, ballem vari street, Ramavarappadu, Vijayawada, AP - 521108
                  </p>
                </div>

                <div className="pt-1">
                  <a
                    href="https://maps.app.goo.gl/vewvJyvmar8fmVSV9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary !py-2.5 !px-5 gap-2 text-sm inline-flex items-center"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Send Message Form */}
            <div className="lg:col-span-6">
              <div className="bg-white border border-[#E8E0D2] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <div className="text-eyebrow">
                    QUICK INQUIRY
                  </div>
                  <h2 className="text-section-title !text-2xl mt-1">
                    Send Us a Message
                  </h2>
                  <p className="text-body-regular text-sm mt-1">
                    Fill out the form below to message us directly on WhatsApp or call our team anytime between 10:00 AM and 7:30 PM.
                  </p>
                </div>

                {submitted && (
                  <div className="p-4 bg-[#E8F8EE] border border-[#A5D6A7] rounded-xl flex items-start gap-3 text-sm text-[#1E7E34]">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Message prepared!</p>
                      <p className="text-xs text-[#2E7D32] mt-0.5">
                        Your message has been sent to our WhatsApp. We will reply to you as soon as possible.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-[#6B5E54] mb-1.5">
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-bold uppercase tracking-wider text-[#6B5E54] mb-1.5">
                      Mobile Number
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="e.g. 9398965589"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider text-[#6B5E54] mb-1.5">
                      Message / Order Details
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      placeholder="Let us know what products you'd like to order or ask about..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="textarea-field"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="btn-primary w-full !py-3 gap-2 text-sm font-semibold shadow-xs"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send via WhatsApp (9398965589)</span>
                    </button>
                  </div>
                </form>

                <div className="pt-4 border-t border-[#F0E9DD] text-xs text-[#96887D] space-y-1">
                  <p>• We prepare and deliver very fresh food with love and care.</p>
                  <p>• Working hours: 10:00 AM to 7:30 PM (365 days working).</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
