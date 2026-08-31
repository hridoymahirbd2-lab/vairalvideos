const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const token = '8942375370:AAGQ8iaF-4qDn-NYKkReaNOUZOD5-uE2GFQ'; 
const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', (error) => {
    // পোলিং এরর ইগনোর করবে
});

let postsList = [];

app.get('/', (req, res) => {
    res.render('index', { posts: postsList });
});

app.get('/admin', (req, res) => {
    res.render('admin');
});

app.post('/add-post', (req, res) => {
    const { title, thumbnail, videoId } = req.body;
    if (title && thumbnail && videoId) {
        postsList.unshift({ 
            title: title.trim(), 
            thumbnail: thumbnail.trim(), 
            videoId: videoId.trim() 
        });
        res.redirect('/');
    } else {
        res.send("All fields are required! <a href='/admin'>Go Back</a>");
    }
});

// ১০০% নির্ভুল টেলিগ্রাম বট হ্যান্ডলার ও ইনলাইন বাটন সিস্টেম
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

// বাটন ক্লিক হ্যান্ডলার
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
    } catch (err) {
        console.error("Callback Error:", err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});