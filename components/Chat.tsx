"use client"

import React, { useEffect, useRef, useState } from "react"
import { MessageSquareText, X } from "lucide-react"
import toast from "react-hot-toast"

const Chat = () => {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [bubble, setBubble] = useState(false)
  const [closing, setClosing] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // previously we blocked scrolling; keep background scroll enabled per request
    return () => {}
  }, [open])

  useEffect(() => {
    if (open) {
      // trigger a quick bubble animation when opening
      setBubble(true)
      const t = setTimeout(() => setBubble(false), 900)
      return () => clearTimeout(t)
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData) as {
      name: string
      email: string
      topic: string
      message: string
    }

    setSending(true)
    setStatus(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setStatus("Message sent. Thank you!")
        form.reset()
        toast.success("Message submitted successfully")
        startClose()
      } else {
        setStatus(data?.message || "Failed to send message")
      }
    } catch (err) {
      setStatus("Server error")
    } finally {
      setSending(false)
    }
  }

  const ANIM_DURATION = 420

  function startClose() {
    setClosing(true)
    setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, ANIM_DURATION)
  }

  return (
    <div>
      <div className="fixed right-4 bottom-22 pointer-events-auto" style={{ zIndex: 99999 }}>
        <div className="relative">
          <button
            aria-label="Open contact"
            type="button"
            aria-expanded={open}
            onClick={() => {
              console.log("Chat button clicked, open=", open)
              setOpen((v) => !v)
            }}
            className="group relative w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-cyan-400 shadow-lg flex items-center justify-center text-white hover:scale-105 transform transition"
          >
            <MessageSquareText size={24} />
            {bubble && (
              <span className="absolute -top-6 -right-2 w-3 h-3 rounded-full animate-bubble bg-white/60" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div
          ref={ref}
          className="fixed bottom-18 inset-0 flex items-end justify-end p-6 pointer-events-auto"
          style={{ zIndex: 99998 }}
        >
          <div
            className="absolute inset-0" 
            onClick={() => startClose()}
          />

          <div
            className={`w-full max-w-sm ml-auto transform-gpu panelWrap ${
              closing ? "animate-scaleClose" : "animate-scaleOpen"
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 100000, transformOrigin: "100% 100%" }}
          >
            <div className="glassmorph rounded-xl p-5 shadow-2xl" role="dialog">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-primary font-semibold">Contact Us</h3>
                <button
                  aria-label="Close contact"
                  onClick={() => startClose()}
                  className="p-1 text-primary rounded hover:bg-primary hover:text-white"
                >
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                <div>
                  <label className="text-primary block mb-1">Name</label>
                  <input
                    name="name"
                    required
                    className="w-full rounded-sm px-3 py-2 bg-transparent border-2! border-primary/60 text-primary placeholder-white/60"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="text-primary block mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full rounded-sm px-3 py-2 bg-transparent border-2! border-primary/60 text-primary placeholder-white/60"
                    placeholder="you@domain.com"
                  />
                </div>

                <div>
                  <label className="text-primary block mb-1">Subject</label>
                  <input
                    name="topic"
                    required
                    className="w-full rounded-sm px-3 py-2 bg-transparent border-2! border-primary/60 text-primary placeholder-white/60"
                    placeholder="What is this about?"
                  />
                </div>

                <div>
                  <label className="text-primary block mb-1">Message</label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    className="w-full rounded-md px-3 py-2 bg-transparent border border-primary/60 text-primary placeholder-primary/60 resize-none"
                    placeholder="Type your message..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-white hover:opacity-95 disabled:opacity-60"
                  >
                    {sending ? "Sending…" : "Send"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .glassmorph {
          background: #fff;
          box-shadow: 0 8px 24px rgba(2,6,23,0.10);
          backdrop-filter: blur(10px) saturate(25%);
        }

        @keyframes panelOpen {
          0% { transform: translateY(18px) scale(0.92); opacity: 0 }
          60% { transform: translateY(-8px) scale(1.02); opacity: 1 }
          100% { transform: translateY(0) scale(1); opacity: 1 }
        }


        .animate-scaleOpen {
          animation: panelOpen 420ms cubic-bezier(.22,1,.36,1) forwards, scaleReveal 420ms cubic-bezier(.22,1,.36,1) forwards;
          transform-origin: 100% 100%;
        }

        .animate-scaleClose {
          animation: scaleHide 420ms cubic-bezier(.22,1,.36,1) forwards, panelClose 420ms cubic-bezier(.22,1,.36,1) forwards;
          animation-fill-mode: forwards;
          transform-origin: 100% 100%;
        }

        @keyframes scaleReveal {
          0% { transform: scale(0.6) translateY(24px); opacity: 0 }
          60% { transform: scale(1.06) translateY(-6px); opacity: 1 }
          100% { transform: scale(1) translateY(0); opacity: 1 }
        }

        @keyframes scaleHide {
          0% { transform: scale(1) translateY(0); opacity: 1 }
          100% { transform: scale(0.6) translateY(24px); opacity: 0 }
        }

        @keyframes panelClose {
          0% { transform: translateY(0) scale(1); opacity: 1 }
          100% { transform: translateY(24px) scale(0.85); opacity: 0 }
        }

        @keyframes bubble {
          0% { transform: translateY(0) scale(0.8); opacity: 1 }
          100% { transform: translateY(-24px) scale(1.6); opacity: 0 }
        }

        .animate-bubble {
          animation: bubble 900ms cubic-bezier(.2,.9,.2,1);
        }

        .animate-bubble, .animate-bubble::after {
          background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.95), rgba(255,255,255,0.5));
        }

        .animate-bubble {
          box-shadow: 0 6px 18px rgba(0,0,0,0.35);
        }

        .animate-bubble {
          --tw-bg-opacity: 1;
        }
      `}</style>
    </div>
  )
}

export default Chat
