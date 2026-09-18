import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import axios from '../api/api';
import { STORAGE_URL } from '../api/api';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState([]);
  const [other, setOther] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const bottomRef = useRef(null);

  const loadConversations = () => {
    axios.get('/api/messages')
      .then((response) => {
        setConversations(response.data || []);
        return response.data || [];
      })
      .catch(() => []);
  };

  const openThread = (userId) => {
    setActive(userId);
    axios.get(`/api/messages/${userId}`)
      .then((response) => {
        setOther(response.data.other);
        setThread(response.data.messages || []);
        loadConversations();
      })
      .catch(() => setError('Could not load the conversation.'));
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const fromQuery = searchParams.get('user');
    if (fromQuery && !active) {
      openThread(Number(fromQuery));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const handleSend = () => {
    if (!text.trim() || !active) return;
    setSending(true);
    setError('');
    axios.post('/api/messages', {
      receiver_id: active,
      body: text,
    })
      .then(() => {
        setText('');
        return axios.get(`/api/messages/${active}`);
      })
      .then((response) => {
        setThread(response.data.messages || []);
        loadConversations();
      })
      .catch(() => setError('Could not send the message.'))
      .finally(() => setSending(false));
  };

  const avatarFor = (user) => {
    const src = user?.profile_image ? `${STORAGE_URL}${user.profile_image}` : null;
    const name = user?.name || 'U';
    return src ? (
      <img src={src} alt={name} className="h-9 w-9 rounded-full object-cover" />
    ) : (
      <span className="h-9 w-9 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-bold">
        {name.charAt(0).toUpperCase()}
      </span>
    );
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-gray-500">Talk to hosts and students privately.</p>

        {error && <p className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</p>}

        <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden lg:flex">
          {/* Conversation list */}
          <div className="lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <input
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Search conversations..."
              />
            </div>
            <div className="max-h-[55vh] lg:max-h-[65vh] overflow-y-auto">
              {conversations.length === 0 && (
                <p className="p-4 text-sm text-gray-500">No conversations yet. Open a listing and tap &quot;Message&quot; to contact the host.</p>
              )}
              {conversations.map((conv) => (
                <button
                  key={conv.user.id}
                  onClick={() => openThread(conv.user.id)}
                  className={`w-full flex items-start gap-3 p-4 text-left transition-colors ${
                    active === conv.user.id ? 'bg-indigo-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {avatarFor(conv.user)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900 truncate">{conv.user.name}</p>
                      <span className="text-[11px] text-gray-400 shrink-0">{new Date(conv.last_message_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
                    {conv.unread > 0 && (
                      <span className="mt-1 inline-block px-2 py-0.5 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-bold rounded-full">
                        {conv.unread} new
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Thread */}
          <div className="flex-1 flex flex-col">
            {!active ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg className="h-10 w-10 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <p className="text-sm">Select a conversation to start chatting.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                  {avatarFor(other)}
                  <div>
                    <p className="font-bold text-gray-900">{other?.name}</p>
                    <p className="text-xs text-gray-500">StudentNest member</p>
                  </div>
                </div>

                <div className="flex-1 p-4 space-y-3 max-h-[45vh] overflow-y-auto bg-gray-50">
                  {thread.length === 0 && <p className="text-sm text-gray-500 text-center pt-8">No messages yet. Say hello!</p>}
                  {thread.map((message) => (
                    <div key={message.id} className={`flex ${message.mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                        message.mine
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-md'
                          : 'bg-white text-gray-800 rounded-bl-md'
                      }`}>
                        <p>{message.body}</p>
                        <p className={`mt-1 text-[10px] ${message.mine ? 'text-indigo-200' : 'text-gray-400'}`}>{formatTime(message.created_at)}</p>
                        {message.listing_title && (
                          <p className={`mt-1 text-[10px] font-semibold ${message.mine ? 'text-indigo-200' : 'text-indigo-500'}`}>
                            About: {message.listing_title}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                <div className="p-4 border-t border-gray-100 flex items-center gap-3">
                  <input
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Write a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !text.trim()}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold rounded-full shadow-lg disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;