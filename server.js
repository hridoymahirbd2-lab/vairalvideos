bot.on('message', async (msg) => {
    try {
        const chatId = msg.chat.id;
        const text = msg.text;

        console.log("Received message from Telegram:", text); // এটি টার্মিনাল লগে দেখাবে ইউজার কি লিখেছে

        if (text && text.startsWith('/start')) {
            const parts = text.split(' ');
            if (parts.length > 1) {
                const requestedId = parts[1].trim(); 
                console.log("Looking for Video ID in list:", requestedId);
                console.log("Current total posts in memory:", postsList.length);

                const foundPost = postsList.find(p => p.videoId === requestedId);

                if (foundPost) {
                    console.log("Post found! Sending video...");
                    await bot.sendMessage(chatId, "🎬 Your video is arriving...");
                    await bot.sendVideo(chatId, foundPost.videoId, { 
                        caption: `🎥 Here is your video: ${foundPost.title}` 
                    });
                } else {
                    console.log("Post NOT found in postsList!");
                    await bot.sendMessage(chatId, "⚠️ Sorry, video not found in database. Please add the post from Admin panel first.");
                }
            }
        }
    } catch (err) {
        console.error("Telegram Error:", err.message);
    }
});