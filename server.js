require("dotenv").config();
console.log("Loaded API Key:", process.env.OPENAI_API_KEY);
const express = require("express");
const { railFenceEncrypt } = require("./cipher");
const { getUserCipher, setUserCipher, users } = require("./users");
const { addMessage, getHistory } = require("./firebase");
const OpenAI = require("openai");


const app = express();
app.use(express.json());

app.use(express.static("public"));
// Initialize ChatGPT
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Route: Update Cipher Settings
 */
app.post("/setCipher", (req, res) => {
  const { userId, rails, offset } = req.body;
  setUserCipher(userId, parseInt(rails), parseInt(offset));
  res.json({ success: true, message: "Cipher updated!" });
});

/**
 * Route: Chat (Public or Secret)
 * - All users share the same chat per channel
 * - ChatGPT always sees raw text history
 * - Secret channel encrypts replies for display
 */
app.post("/chat/:channel", async (req, res) => {
  const { channel } = req.params;          // "public" or "secret"
  const { userId, message } = req.body;
  const { rails, offset } = getUserCipher(userId);

  // 1. Save user message tied to channel
 await addMessage(channel, role, name, content, Date.now());

  // 2. Get full history for this channel
  const history = await getHistory(channel);

  // 3. Format history for ChatGPT
  const formattedHistory = history.map(m => ({
    role: m.role,
    name: m.name,
    content: m.content
  }));

  // 4. Send channel history to ChatGPT (raw text only)
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: formattedHistory,
  });

  const aiReplyRaw = response.choices[0].message.content;

  // 5. Save AI reply in channel history
  await addMessage(channel, "assistant", "AI", aiReplyRaw);

  // 6. Return response
  if (channel === "public") {
    res.json({
      userMessage: { user: userId, content: message },
      aiReply: { user: "AI", content: aiReplyRaw }
    });
  } else if (channel === "secret") {
    res.json({
      userMessage: { user: "Anonymous", content: railFenceEncrypt(message, rails, offset) },
      aiReply: { user: "AI", content: railFenceEncrypt(aiReplyRaw, rails, offset) }
    });
  }
});

app.post("/presence", async (req, res) => {
  const { userId, channel, status } = req.body;
  await db.collection("presence").doc(userId).set({
    userId, channel, status, lastSeen: Date.now()
  });
  res.json({ success: true });
});

app.post("/typing", async (req, res) => {
  const { userId, channel, typing } = req.body;
  await db.collection("typing").doc(userId).set({ userId, channel, typing });
  res.json({ success: true });
});

app.post("/chat/:channel", async (req, res) => {
  const { userId, message } = req.body;
  const channel = req.params.channel;

  try {
    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: message }]
    });

    const aiReply = completion.choices[0].message.content;

    // Save user message
    await db.collection("history").add({
      channel,
      name: userId,
      content: message,
      timestamp: Date.now()
    });

    // Save AI reply
    await db.collection("history").add({
      channel,
      name: "AI Bot",
      content: aiReply,
      timestamp: Date.now()
    });

    res.json({ reply: aiReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process message" });
  }
});


// Start server
app.listen(3000, () => console.log("Shared Chat Server running on port 3000"));