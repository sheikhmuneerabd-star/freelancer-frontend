// pages/Chat.jsx
import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { authDataContext } from "../Context/AuthContext";
import { userDataContext } from "../Context/UserContext";
import { socketDataContext } from "../Context/SocketContext";
import Nav from "../Components/Nav";
import { TbSend, TbArrowLeft } from "react-icons/tb";

function Chat() {
  const { serverUrl } = useContext(authDataContext);
  const { userData } = useContext(userDataContext);
  const { socket } = useContext(socketDataContext);

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/chat/conversations`, { withCredentials: true });
      setConversations(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const openChat = async (conv) => {
    setActiveChat(conv);
    try {
      const res = await axios.get(`${serverUrl}/api/chat/messages/${conv.userId}`, { withCredentials: true });
      setMessages(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;

    const newMessage = {
      senderId: userData._id,
      receiverId: activeChat.userId,
      text: input,
      createdAt: new Date()
    };

    socket.emit("sendMessage", {
      receiverId: activeChat.userId,
      message: newMessage
    });

    setMessages(prev => [...prev, newMessage]);

    axios.post(`${serverUrl}/api/chat/send`, {
      receiverId: activeChat.userId,
      text: input
    }, { withCredentials: true }).catch(err => console.log(err));

    setInput("");
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (message) => {
      if (activeChat && message.senderId === activeChat.userId) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [socket, activeChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-gray-200">
      <Nav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <p className="text-[18px] font-medium text-gray-50 mb-5">Messages</p>

        <div className="flex border border-gray-700 rounded-lg overflow-hidden h-[calc(100vh-180px)] sm:h-[560px]">

          {/* Sidebar - mobile: full width when no chat selected, hidden when chat open */}
          <div className={`
            w-full sm:w-[260px] border-r border-gray-700 overflow-y-auto
            ${activeChat ? "hidden sm:block" : "block"}
          `}>
            {conversations.length === 0 ? (
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
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-gray-100 truncate">{conv.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{conv.projectTitle}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Window - mobile: full width when chat selected, hidden when not */}
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
                {/* Header - with back button on mobile */}
                <div className="p-3.5 border-b border-gray-700 flex items-center gap-2.5">
                  <button
                    onClick={() => setActiveChat(null)}
                    className="sm:hidden text-gray-400 hover:text-gray-200 flex-shrink-0"
                  >
                    <TbArrowLeft size={20} />
                  </button>
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-gray-100 truncate">{activeChat.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{activeChat.projectTitle}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-2.5">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.senderId === userData._id ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] sm:max-w-[70%] px-3.5 py-2 rounded-lg text-[13px] break-words ${
                        msg.senderId === userData._id
                          ? "bg-[#534AB7] text-white rounded-br-none"
                          : "bg-[#ffffff10] text-gray-100 rounded-bl-none"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-2.5 sm:p-3 border-t border-gray-700 flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
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