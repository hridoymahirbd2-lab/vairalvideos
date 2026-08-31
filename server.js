const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const token = '8803240976:AAFPKnYiow-64a_xvQ0Ch6UrqwCh2x5KHOo'; 
const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', (error) => {});

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
        // লিংকের সাইজ ছোট রাখার জন্য শর্ট কোড
        const shortCode = 'vid' + Math.floor(Math.random() * 1000000);
        postsList.unshift({ 
            title: title.trim(), 
            thumbnail: thumbnail.trim(), 
            fileId: videoId.trim(),
            shortCode: shortCode
        });
        res.redirect('/');
    } else {
        res.send("All fields are required! <a href='/admin'>Go Back</a>");
    }
});

bot.on('message', async (msg) => {
    try {
        const chatId = msg.chat.id;
        const text = msg.text;
        const video = msg.video;

        if (video) {
            const fileId = video.file_id;
            await bot.sendMessage(chatId, `✅ Video Received!\n\n📋 Copy this File ID for Admin Panel:\n\n<code>${fileId}</code>`, { parse_mode: 'HTML' });
            return;
        }

        if (text && text.startsWith('/start')) {
            const parts = text.split(' ');
            if (parts.length > 1) {
                const requestedId = parts[1].trim(); 
                const foundPost = postsList.find(p => p.shortCode === requestedId);

                if (foundPost) {
                    await bot.sendMessage(chatId, "🎬 Sending your video, please wait...");
                    await bot.sendVideo(chatId, foundPost.fileId, { 
                        caption: `🎥 Here is your video: ${foundPost.title}\n\nHope you enjoyed the videos! They will be deleted after 10 minutes.` 
                    });
                } else {
                    await bot.sendMessage(chatId, "⚠️ Sorry, video not found in database.");
                }
            } else {
                await bot.sendMessage(chatId, "👋 Welcome to OnlyVPSS Bot!");
            }
        }
    } catch (err) {
        console.error("Telegram Error:", err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});