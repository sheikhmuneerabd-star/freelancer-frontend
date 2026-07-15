import { useState, useEffect, useContext, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { authDataContext } from "../Context/AuthContext";
import { userDataContext } from "../Context/UserContext";
import { socketDataContext } from "../Context/SocketContext";
import Nav from "../Components/Nav";
import { TbSend2, TbArrowLeft, TbCheck, TbChecks, TbSearch, TbMessageCircle, TbClockHour4 } from "react-icons/tb";

function formatDayLabel(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

  if (isSameDay(date, today)) return "Aaj";
  if (isSameDay(date, yesterday)) return "Kal";
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function Chat() {
  const { serverUrl } = useContext(authDataContext);
  const { userData } = useContext(userDataContext);
  const { socket } = useContext(socketDataContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const activeChatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/chat/conversations`, { withCredentials: true });
      setConversations(res.data);
      return res.data;
    } catch (error) {
      console.log(error);
      return [];
    } finally {
      setLoadingConvos(false);
    }
  };

  useEffect(() => {
    fetchConversations().then((convos) => {
      const withUserId = searchParams.get("with");
      if (withUserId) {
        const match = convos.find((c) => c.userId === withUserId);
        if (match) {
          openChat(match);
        }
      }
    });
  }, []);

  const openChat = async (conv) => {
    setActiveChat(conv);
    setMessages([]);
    setLoadingMessages(true);
    setSearchParams({});
    try {
      const res = await axios.get(`${serverUrl}/api/chat/messages/${conv.userId}`, { withCredentials: true });
      setMessages(res.data);
      setConversations((prev) =>
        prev.map((c) => (c.userId === conv.userId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingMessages(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !activeChat) return;

    setInput("");
    socket?.emit("stopTyping", { receiverId: activeChat.userId, senderId: userData._id });

    try {
      const res = await axios.post(`${serverUrl}/api/chat/send`, {
        receiverId: activeChat.userId,
        text
      }, { withCredentials: true });

      setMessages((prev) => [...prev, res.data]);

      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.userId === activeChat.userId
            ? {
                ...c,
                lastMessageText: text,
                lastMessageAt: res.data.createdAt,
                lastMessageSenderId: userData._id,
                lastMessageSeen: false
              }
            : c
        );
        return updated.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!activeChat || !socket) return;

    socket.emit("typing", { receiverId: activeChat.userId, senderId: userData._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: activeChat.userId, senderId: userData._id });
    }, 1500);
  };

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      const current = activeChatRef.current;

      if (current && message.senderId === current.userId) {
        setMessages((prev) => [...prev, message]);
      } else {
        setConversations((prev) => {
          const exists = prev.some((c) => c.userId === message.senderId);
          if (!exists) {
            fetchConversations();
            return prev;
          }
          return prev.map((c) =>
            c.userId === message.senderId
              ? { ...c, unreadCount: (c.unreadCount || 0) + 1 }
              : c
          );
        });
      }

      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.userId === message.senderId
            ? {
                ...c,
                lastMessageText: message.text,
                lastMessageAt: message.createdAt,
                lastMessageSenderId: message.senderId,
                lastMessageSeen: false
              }
            : c
        );
        return updated.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
      });
    };

    const handleUserTyping = (senderId) => {
      if (activeChatRef.current && senderId === activeChatRef.current.userId) {
        setIsOtherTyping(true);
      }
    };

    const handleUserStoppedTyping = (senderId) => {
      if (activeChatRef.current && senderId === activeChatRef.current.userId) {
        setIsOtherTyping(false);
      }
    };

    // 🔴 NEW: seen hone par sidebar ka tick bhi turant double-tick ho
    const handleMessageSeen = ({ seenBy }) => {
      if (activeChatRef.current && seenBy === activeChatRef.current.userId) {
        setMessages((prev) => prev.map((m) => ({ ...m, seen: true })));
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.userId === seenBy ? { ...c, lastMessageSeen: true } : c
        )
      );
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);
    socket.on("message:seen", handleMessageSeen);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
      socket.off("message:seen", handleMessageSeen);
    };
  }, [socket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    return conversations.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()));
  }, [conversations, search]);

  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDateLabel = null;
    let lastSenderId = null;

    messages.forEach((msg, i) => {
      const dayLabel = formatDayLabel(msg.createdAt);
      if (dayLabel !== lastDateLabel) {
        groups.push({ type: "date", label: dayLabel, key: `date-${msg._id || i}` });
        lastDateLabel = dayLabel;
        lastSenderId = null;
      }

      const isFirstInGroup = msg.senderId !== lastSenderId;
      const nextMsg = messages[i + 1];
      const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId || formatDayLabel(nextMsg.createdAt) !== dayLabel;

      groups.push({ type: "message", data: msg, isFirstInGroup, isLastInGroup, key: msg._id || i });
      lastSenderId = msg.senderId;
    });

    return groups;
  }, [messages]);

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-gray-200">
      <Nav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[19px] font-semibold text-gray-50 tracking-tight">Messages</p>
            <p className="text-[12px] text-gray-500 mt-0.5">Apne connections se baat karo</p>
          </div>
        </div>

        <div className="flex bg-[#0d0d13] border border-gray-800 rounded-2xl overflow-hidden h-[calc(100vh-190px)] sm:h-[600px] shadow-2xl shadow-black/40">

          {/* Sidebar */}
          <div className={`
            w-full sm:w-[300px] border-r border-gray-800/80 flex flex-col
            ${activeChat ? "hidden sm:flex" : "flex"}
          `}>
            <div className="p-3 border-b border-gray-800/80">
              <div className="relative">
                <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-[15px]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search karo..."
                  className="w-full bg-[#16161f] border border-transparent focus:border-[#534AB7]/50 rounded-lg pl-9 pr-3 py-2 text-[13px] text-gray-200 placeholder-gray-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto notif-scroll">
              {loadingConvos ? (
                <div className="p-3 flex flex-col gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-[60px] bg-[#ffffff06] rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#534ab715] flex items-center justify-center mb-3">
                    <TbMessageCircle className="text-[#a5b4fc] text-xl" />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">
                    {search ? "Koi match nahi mila" : "Koi conversation nahi hai"}
                  </p>
                  {!search && (
                    <p className="text-gray-600 text-[12px] mt-1">Proposal ya hire hone ke baad yahan chat shuru hogi</p>
                  )}
                </div>
              ) : (
                <div className="p-2 flex flex-col gap-0.5">
                  {filteredConversations.map((conv) => {
                    const isActive = activeChat?.userId === conv.userId;
                    const isLastFromMe = conv.lastMessageSenderId === userData._id;

                    return (
                      <div
                        key={conv.userId}
                        onClick={() => openChat(conv)}
                        className={`px-2.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                          isActive ? "bg-[#534AB7]" : "hover:bg-[#ffffff08]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold ${
                              isActive ? "bg-white/15 text-white" : "bg-gradient-to-tr from-violet-600/80 to-indigo-600/80 text-white"
                            }`}>
                              {conv.name?.charAt(0).toUpperCase()}
                            </div>
                            {/* 🔴 "Not hired yet" indicator ab avatar ke corner pe hai, message text se alag */}
                            {conv.status === "proposal" && (
                              <span
                                title="Abhi hire nahi hua"
                                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 ${
                                  isActive ? "border-[#534AB7] bg-amber-400" : "border-[#0d0d13] bg-amber-500"
                                }`}
                              >
                                <TbClockHour4 className="text-[8px] text-[#0d0d13]" />
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-[13.5px] font-medium truncate ${isActive ? "text-white" : "text-gray-100"}`}>
                                {conv.name}
                              </p>
                              {conv.lastMessageAt && (
                                <span className={`text-[10.5px] flex-shrink-0 ${isActive ? "text-white/70" : "text-gray-600"}`}>
                                  {formatTime(conv.lastMessageAt)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <p className={`text-[12px] truncate flex items-center gap-1 ${
                                isActive ? "text-white/75" : conv.unreadCount > 0 ? "text-gray-300 font-medium" : "text-gray-500"
                              }`}>
                                {/* 🔴 Ab yahan seen/delivered tick — sirf jab last message MAINE bheja ho */}
                                {isLastFromMe && conv.lastMessageText && (
                                  conv.lastMessageSeen ? (
                                    <TbChecks className={`flex-shrink-0 text-[14px] ${isActive ? "text-white" : "text-sky-400"}`} />
                                  ) : (
                                    <TbCheck className={`flex-shrink-0 text-[14px] ${isActive ? "text-white/70" : "text-gray-500"}`} />
                                  )
                                )}
                                {conv.lastMessageText || conv.projectTitle}
                              </p>
                              {conv.unreadCount > 0 && !isActive && (
                                <span className="bg-[#534AB7] text-white text-[10px] font-semibold w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0">
                                  {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`
            flex-1 flex flex-col bg-[#0a0a0f]
            ${activeChat ? "flex" : "hidden sm:flex"}
          `}>
            {!activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-[#534ab712] flex items-center justify-center mb-4">
                  <TbMessageCircle className="text-[#a5b4fc] text-3xl" />
                </div>
                <p className="text-gray-300 text-[15px] font-medium">Apni messages yahan dekho</p>
                <p className="text-gray-600 text-[13px] mt-1">Baaen taraf se conversation select karo</p>
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-gray-800/80 flex items-center gap-3 bg-[#0d0d13]">
                  <button
                    onClick={() => setActiveChat(null)}
                    className="sm:hidden text-gray-400 hover:text-gray-200 flex-shrink-0"
                  >
                    <TbArrowLeft size={20} />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600/80 to-indigo-600/80 flex items-center justify-center text-[13px] font-semibold text-white flex-shrink-0">
                    {activeChat.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-medium text-gray-100 truncate">{activeChat.name}</p>
                    <p className="text-[11.5px] truncate">
                      {isOtherTyping ? (
                        <span className="text-[#a5b4fc] font-medium">type kar raha hai...</span>
                      ) : (
                        <span className="text-gray-500">{activeChat.projectTitle}</span>
                      )}
                    </p>
                  </div>
                  {activeChat.status === "proposal" && (
                    <span className="text-[10.5px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
                      Hire nahi hua abhi
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto notif-scroll px-3 sm:px-5 py-4 flex flex-col gap-0.5">
                  {loadingMessages ? (
                    <div className="flex-1 flex flex-col justify-end gap-2.5 pb-2">
                      <div className="h-9 w-2/5 bg-[#ffffff08] rounded-2xl animate-pulse self-start"></div>
                      <div className="h-9 w-1/3 bg-[#ffffff08] rounded-2xl animate-pulse self-end"></div>
                      <div className="h-9 w-1/2 bg-[#ffffff08] rounded-2xl animate-pulse self-start"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <p className="text-gray-500 text-sm">Koi message nahi hai</p>
                      <p className="text-gray-700 text-[12px] mt-1">Sabse pehla message aap bhejo</p>
                    </div>
                  ) : (
                    groupedMessages.map((item) => {
                      if (item.type === "date") {
                        return (
                          <div key={item.key} className="flex items-center justify-center my-4">
                            <span className="text-[11px] font-medium text-gray-600 bg-[#ffffff06] px-3 py-1 rounded-full">
                              {item.label}
                            </span>
                          </div>
                        );
                      }

                      const msg = item.data;
                      const isMe = msg.senderId === userData._id;

                      return (
                        <div
                          key={item.key}
                          className={`flex ${isMe ? "justify-end" : "justify-start"} ${item.isFirstInGroup ? "mt-2.5" : "mt-0.5"}`}
                        >
                          <div
                            className={`max-w-[82%] sm:max-w-[65%] px-3.5 py-2 text-[13.5px] leading-relaxed break-words ${
                              isMe ? "bg-[#534AB7] text-white" : "bg-[#1a1a24] text-gray-100"
                            } ${
                              isMe
                                ? item.isLastInGroup ? "rounded-2xl rounded-br-md" : "rounded-2xl"
                                : item.isLastInGroup ? "rounded-2xl rounded-bl-md" : "rounded-2xl"
                            }`}
                          >
                            <p>{msg.text}</p>
                            {item.isLastInGroup && (
                              <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                                <span className={`text-[10px] ${isMe ? "text-white/60" : "text-gray-600"}`}>
                                  {formatTime(msg.createdAt)}
                                </span>
                                {isMe && (
                                  msg.seen ? (
                                    <TbChecks className="text-[13px] text-sky-300" />
                                  ) : (
                                    <TbCheck className="text-[13px] text-white/60" />
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {isOtherTyping && (
                    <div className="flex justify-start mt-1.5">
                      <div className="bg-[#1a1a24] px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5 items-center">
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>

                <form onSubmit={sendMessage} className="p-3 border-t border-gray-800/80 bg-[#0d0d13] flex items-center gap-2.5">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Message likho..."
                    className="flex-1 bg-[#16161f] border border-transparent focus:border-[#534AB7]/50 rounded-full px-4 py-2.5 text-[13.5px] text-gray-100 placeholder-gray-600 outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="bg-[#534AB7] hover:bg-[#4840a0] disabled:opacity-40 disabled:cursor-not-allowed text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  >
                    <TbSend2 size={17} />
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Chat;