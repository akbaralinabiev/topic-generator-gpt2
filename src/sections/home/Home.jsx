import React, { useRef, useState } from "react";
import "./home.css";

const Home = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi, enter the name of the topic you would like to know more about" },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newMessages = [...messages, { sender: "user", text: inputValue }];
    setMessages(newMessages);

    setInputValue("");

    const gptResponse = await getGptResponse(inputValue);
    setMessages([...newMessages, { sender: "bot", text: gptResponse }]);
  };

  const getGptResponse = async (userMessage) => {
    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      return data.response || "No response from AstroMind.";
    } catch (error) {
      console.error("Error fetching AstroMind response:", error);
      return "Error fetching AstroMind response.";
    }
  };

  return (
    <div className="chat-container">
      {/* Chat messages area */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender === "user" ? "user" : "bot"}`}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Chat input area */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your topic..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button type="button" className="send-button" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Home;
