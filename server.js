// আপনার server.js ফাইলের বট হ্যান্ডলার অংশটি হুবহু এই কোড দিয়ে আপডেট করুন:

bot.on('message', async (msg) => {
    try {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (text && text.startsWith('/start')) {
            const parts = text.split(' ');
            if (parts.length > 1) {
                const requestedId = parts[1].trim(); 
                const foundPost = postsList.find(p => p.videoId === requestedId);

                if (foundPost) {
                    // সরাসরি ভিডিও সেন্ড করার বদলে ইনলাইন বাটন দিয়ে পাঠানো, যাতে টেলিগ্রাম ব্লক না করে
                    await bot.sendMessage(chatId, `🎥 Click the button below to get your video: "${foundPost.title}"`, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "▶️ Watch / Get Video", callback_data: `get_vid_${requestedId}` }]
                            ]
                        }
                    });
                } else {
                    await bot.sendMessage(chatId, "⚠️ Sorry, video not found in database.");
                }
            } else {
                await bot.sendMessage(chatId, "Welcome! Please go back to the website and click 'Watch Video' to get your desired video.");
            }
        }
    } catch (err) {
        console.error("Telegram Error:", err.message);
    }
});

// যখন ইউজার বাটনএ ক্লিক করবে, তখন ইনস্ট্যান্ট ভিডিও চলে যাবে
bot.on('callback_query', async (callbackQuery) => {
    try {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const data = callbackQuery.data;

        if (data.startsWith('get_vid_')) {
            const requestedId = data.replace('get_vid_', '').trim();
            const foundPost = postsList.find(p => p.videoId === requestedId);

            if (foundPost) {
                await bot.answerCallbackQuery(callbackQuery.id, { text: "Sending your video..." });
                await bot.sendVideo(chatId, foundPost.videoId, { 
                    caption: `🎥 Here is your video: ${foundPost.title}` 
                });
            } else {
                await bot.answerCallbackQuery(callbackQuery.id, { text: "Video not found!" });
            }
        }
    } else {
        // Safe fallback for callback handling
    } catch (err) {
        console.error("Callback Error:", err.message);
    }
});