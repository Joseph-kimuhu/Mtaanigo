import { useState, useEffect, useRef } from 'react';
import { customerService } from '../../services/customerService';

export default function MessagesTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await customerService.getMyRequests();
        setRequests(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async (req) => {
    setSelectedRequest(req);
    setLoadingMessages(true);
    try {
      const data = await customerService.getMessages(req.id);
      setMessages(data || []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRequest) return;
    setSending(true);
    try {
      const sent = await customerService.sendMessage(selectedRequest.id, newMessage.trim());
      setMessages((prev) => [...prev, sent]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const uniqueConversations = requests.filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i);

  return (
    <div>
      <h1 className="font-landing-display text-[26px] font-medium text-ink mb-6">Messages</h1>
      <p className="text-mute text-[14px] font-landing-sans mb-6">Chat with your service providers about bookings.</p>

      <div className="rounded-2xl border border-ink/[0.06] bg-white overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-mute text-sm">Loading conversations…</div>
        ) : uniqueConversations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-mute font-landing-sans text-sm mb-2">No messages yet.</p>
            <p className="text-ink/60 font-landing-sans text-xs">Book a service to start chatting with providers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-x divide-ink/[0.06]">
            <div className="sm:col-span-1 max-h-[500px] overflow-y-auto">
              {uniqueConversations.map((r) => (
                <button
                  key={r.id}
                  onClick={() => loadMessages(r)}
                  className={`w-full text-left px-4 py-3.5 border-b border-ink/[0.04] transition-colors ${
                    selectedRequest?.id === r.id ? 'bg-forest-50' : 'hover:bg-sand-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-[10px] font-bold text-forest-700 shrink-0">
                      {r.provider?.full_name ? r.provider.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'PR'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-landing-sans font-semibold text-ink truncate">{r.provider?.full_name || 'Provider'}</p>
                      <p className="text-[12px] text-mute font-landing-sans truncate">{r.category?.name || 'Service'} request</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="sm:col-span-2 flex flex-col">
              {selectedRequest ? (
                <>
                  <div className="px-4 py-3 border-b border-ink/[0.06] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-[10px] font-bold text-forest-700">
                      {selectedRequest.provider?.full_name ? selectedRequest.provider.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'PR'}
                    </div>
                    <div>
                      <p className="text-[13.5px] font-landing-sans font-semibold text-ink">{selectedRequest.provider?.full_name || 'Provider'}</p>
                      <p className="text-[12px] text-mute font-landing-sans">{selectedRequest.category?.name || 'Service'}</p>
                    </div>
                  </div>
                  <div ref={scrollRef} className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[360px] bg-sand-50/40">
                    {loadingMessages ? (
                      <p className="text-mute text-xs text-center py-6">Loading messages…</p>
                    ) : messages.length === 0 ? (
                      <p className="text-mute text-xs text-center py-6">No messages yet. Start the conversation!</p>
                    ) : (
                      messages.map((m) => (
                        <div key={m.id} className={`flex ${m.sender_id === selectedRequest?.customer_id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[13.5px] font-landing-sans ${
                            m.sender_id === selectedRequest?.customer_id ? 'bg-forest-500 text-white rounded-br-sm' : 'bg-white border border-ink/[0.06] text-ink rounded-bl-sm'
                          }`}>
                            <p>{m.message}</p>
                            <p className={`text-[10px] mt-1 ${m.sender_id === selectedRequest?.customer_id ? 'text-white/70' : 'text-mute'}`}>
                              {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleSend} className="p-3 border-t border-ink/[0.06] flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message…"
                      className="flex-1 rounded-xl border border-ink/[0.07] px-4 py-2.5 text-[14px] font-landing-sans text-ink outline-none focus:border-forest-500 transition-colors"
                    />
                    <button type="button" className="p-2.5 rounded-xl border border-ink/[0.07] text-mute hover:bg-sand-100 transition-colors" title="Share location">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s7-7.4 7-12a7 7 0 10-14 0c0 4.6 7 12 7 12z" /><circle cx="12" cy="9" r="2.4" /></svg>
                    </button>
                    <button type="submit" disabled={sending || !newMessage.trim()} className="p-2.5 rounded-xl bg-forest-500 text-white hover:bg-forest-600 transition-colors disabled:opacity-50">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                    </button>
                  </form>
                </>
              ) : (
                <div className="p-8 text-center text-mute text-sm">Select a conversation to start messaging.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
