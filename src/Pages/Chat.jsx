// pages/Chat.jsx
import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { authDataContext } from "../Context/AuthContext";
import { userDataContext } from "../Context/UserContext";
import { socketDataContext } from "../Context/SocketContext";
import Nav from "../Components/Nav";
import { TbSend } from "react-icons/tb";

function Chat() {
  const { serverUrl } = useContext(authDataContext);
  const { userData } = useContext(userDataContext);
  const { socket } = useContext(socketDataContext);

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  // Conversations fetch karo
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

  // Messages fetch karo jab conversation select ho
  const openChat = async (conv) => {
    setActiveChat(conv);
    try {
      const res = await axios.get(`${serverUrl}/api/chat/messages/${conv.userId}`, { withCredentials: true });
      setMessages(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Naya message bhejo
  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;

    const newMessage = {
      senderId: userData._id,
      receiverId: activeChat.userId,
      text: input,
      createdAt: new Date()
    };

    // Socket se bhejo
    socket.emit("sendMessage", {
      receiverId: activeChat.userId,
      message: newMessage
    });

    // Apni screen pe bhi dikhao
    setMessages(prev => [...prev, newMessage]);

    // Database mein save karo
    axios.post(`${serverUrl}/api/chat/send`, {
      receiverId: activeChat.userId,
      text: input
    }, { withCredentials: true }).catch(err => console.log(err));

    setInput("");
  };

  // Real-time message receive karo
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (message) => {
      // Sirf agar active chat se related ho
      if (activeChat && message.senderId === activeChat.userId) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [socket, activeChat]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-gray-200">
      <Nav />

      <div className="max-w-7xl mx-auto px-6 pt-10">
        <p className="text-[18px] font-medium text-gray-50 mb-5">Messages</p>

        <div className="flex border border-gray-700 rounded-lg overflow-hidden" style={{ height: "560px" }}>

          {/* Sidebar */}
          <div className="w-[260px] border-r border-gray-700 overflow-y-auto">
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
                    <div className="w-9 h-9 rounded-full bg-[#534ab730] flex items-center justify-center text-[12px] font-medium text-[#a5b4fc]">
                      {conv.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-gray-100">{conv.name}</p>
                      <p className="text-[11px] text-gray-500">{conv.projectTitle}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            {!activeChat ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Chat shuru karne ke liye conversation select karo</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-3.5 border-b border-gray-700">
                  <p className="text-[14px] font-medium text-gray-100">{activeChat.name}</p>
                  <p className="text-[11px] text-gray-500">{activeChat.projectTitle}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.senderId === userData._id ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] px-3.5 py-2 rounded-lg text-[13px] ${
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
                <form onSubmit={sendMessage} className="p-3 border-t border-gray-700 flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message likho..."
                    className="flex-1 bg-transparent border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-[#534AB7]"
                  />
                  <button type="submit" className="bg-[#534AB7] hover:bg-[#4840a0] text-white px-4 rounded-md">
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