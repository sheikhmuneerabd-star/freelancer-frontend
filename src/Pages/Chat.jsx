import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { authDataContext } from "../Context/AuthContext";
import { userDataContext } from "../Context/UserContext";
import { socketDataContext } from "../Context/SocketContext";
import Nav from "../Components/Nav";
import { TbSend, TbArrowLeft, TbCheck, TbChecks } from "react-icons/tb";

function Chat() {
  const { serverUrl } = useContext(authDataContext);
  const { userData } = useContext(userDataContext);
  const { socket } = useContext(socketDataContext);

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const activeChatRef = useRef(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/chat/conversations`, { withCredentials: true });
      setConversations(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingConvos(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const openChat = async (conv) => {
    setActiveChat(conv);
    setMessages([]);
    setLoadingMessages(true);
    try {
      const res = await axios.get(`${serverUrl}/api/chat/messages/${conv.userId}`, { withCredentials: true });
      setMessages(res.data);

      // Local unread badge foran clear karo
      setConversations((prev) =>
        prev.map((c) => (c.userId === conv.userId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingMessages(false);
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

      // Real DB message (real _id) add karo — koi fake local object nahi
      setMessages((prev) => [...prev, res.data]);

      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.userId === activeChat.userId
            ? { ...c, lastMessageText: text, lastMessageAt: res.data.createdAt }
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
        // Chat khuli hui hai, isliye turant seen mark karne ke liye messages re-fetch trigger karna theek hoga,
        // lekin simple rakhne ke liye sirf local list update kar rahe hain
      } else {
        // Chat khuli nahi hai — unread count badhao
        setConversations((prev) => {
          const exists = prev.some((c) => c.userId === message.senderId);
          if (!exists) {
            fetchConversations(); // naya banda hai jo pehli baar message bhej raha hai
            return prev;
          }
          return prev.map((c) =>
            c.userId === message.senderId
              ? { ...c, unreadCount: (c.unreadCount || 0) + 1, lastMessageText: message.text, lastMessageAt: message.createdAt }
              : c
          );
        });
      }

      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.userId === message.senderId
            ? { ...c, lastMessageText: message.text, lastMessageAt: message.createdAt }
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

    const handleMessageSeen = ({ seenBy }) => {
      if (activeChatRef.current && seenBy === activeChatRef.current.userId) {
        setMessages((prev) => prev.map((m) => ({ ...m, seen: true })));
      }
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

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-gray-200">
      <Nav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <p className="text-[18px] font-medium text-gray-50 mb-5">Messages</p>

        <div className="flex border border-gray-700 rounded-lg overflow-hidden h-[calc(100vh-180px)] sm:h-[560px]">

          {/* Sidebar */}
          <div className={`
            w-full sm:w-[280px] border-r border-gray-700 overflow-y-auto
            ${activeChat ? "hidden sm:block" : "block"}
          `}>
            {loadingConvos ? (
              <div className="p-3 flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-[#ffffff08] rounded-md animate-pulse"></div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-gray-500 text-sm p-4">Koi conversation nahi hai</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.userId}
                  onClick={() => openChat(conv)}
                  className={`p-3 cursor-pointer border-b border-gray-800 transition-colors ${
                    activeChat?.userId === conv.userId ? "bg-[#534ab720]" : "hover:bg-[#ffffff08]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#534ab730] flex items-center justify-center text-[12px] font-medium text-[#a5b4fc] flex-shrink-0">
                      {conv.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-medium text-gray-100 truncate">{conv.name}</p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-[#534AB7] text-white text-[10px] font-medium w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0">
                            {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate ${conv.unreadCount > 0 ? "text-gray-300 font-medium" : "text-gray-500"}`}>
                        {conv.lastMessageText || conv.projectTitle}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Window */}
          <div className={`
            flex-1 flex flex-col
            ${activeChat ? "block" : "hidden sm:flex"}
          `}>
            {!activeChat ? (
              <div className="flex-1 flex items-center justify-center px-4">
                <p className="text-gray-500 text-sm text-center">Chat shuru karne ke liye conversation select karo</p>
              </div>
            ) : (
              <>
                <div className="p-3.5 border-b border-gray-700 flex items-center gap-2.5">
                  <button
                    onClick={() => setActiveChat(null)}
                    className="sm:hidden text-gray-400 hover:text-gray-200 flex-shrink-0"
                  >
                    <TbArrowLeft size={20} />
                  </button>
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-gray-100 truncate">{activeChat.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {isOtherTyping ? <span className="text-[#a5b4fc]">Type kar raha hai...</span> : activeChat.projectTitle}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-2.5">
                  {loadingMessages ? (
                    <p className="text-gray-500 text-sm text-center mt-4">Loading messages...</p>
                  ) : messages.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center mt-4">Koi message nahi hai, sabse pehle aap bhejo</p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.senderId === userData._id ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[85%] sm:max-w-[70%] px-3.5 py-2 rounded-lg text-[13px] break-words ${
                          msg.senderId === userData._id
                            ? "bg-[#534AB7] text-white rounded-br-none"
                            : "bg-[#ffffff10] text-gray-100 rounded-bl-none"
                        }`}>
                          <p>{msg.text}</p>
                          {msg.senderId === userData._id && (
                            <div className="flex justify-end mt-1">
                              {msg.seen ? (
                                <TbChecks className="text-[13px] text-blue-300" />
                              ) : (
                                <TbCheck className="text-[13px] text-gray-300" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {isOtherTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[#ffffff10] px-3.5 py-2.5 rounded-lg rounded-bl-none flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>

                <form onSubmit={sendMessage} className="p-2.5 sm:p-3 border-t border-gray-700 flex gap-2">
                  <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Message likho..."
                    className="flex-1 bg-transparent border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-[#534AB7]"
                  />
                  <button type="submit" className="bg-[#534AB7] hover:bg-[#4840a0] text-white px-4 rounded-md flex-shrink-0">
                    <TbSend />
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