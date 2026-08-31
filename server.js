const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const token = '8942375370:AAGQ8iaF-4qDn-NYKkReaNOUZOD5-uE2GFQ'; 
const bot = new TelegramBot(token, { polling: true });

// গ্লোবাল সেফ পোস্ট অ্যারে
if (!global.savedPosts) {
    global.savedPosts = [];
}

app.get('/', (req, res) => {
    try {
        res.render('index', { posts: global.savedPosts });
    } catch (err) {
        console.error("Index render error:", err);
        res.send("An error occurred while loading the gallery.");
    }
});

app.get('/admin', (req, res) => {
    try {
        res.render('admin');
    } catch (err) {
        console.error("Admin render error:", err);
        res.send("Admin panel loading error.");
    }
});

app.post('/add-post', (req, res) => {
    try {
        const { title, thumbnail, videoId } = req.body;
        if (title && thumbnail && videoId) {
            global.savedPosts.unshift({ title, thumbnail, videoId });
            res.redirect('/');
        } else {
            res.send("All fields are required! <a href='/admin'>Go Back</a>");
        }
    } catch (err) {
        console.error("Add post error:", err);
        res.send("Failed to add post. <a href='/admin'>Try Again</a>");
    }
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text && text.startsWith('/start')) {
        const parts = text.split(' ');
        if (parts.length > 1) {
            const requestedId = parts[1]; 
            const foundPost = global.savedPosts.find(p => p.videoId === requestedId);

            if (foundPost) {
                bot.sendVideo(chatId, foundPost.videoId, { 
                    caption: `Here is your video: ${foundPost.title}` 
                }).catch((err) => {
                    bot.sendMessage(chatId, "Sorry, failed to send the video.");
                });
            } else {
                bot.sendMessage(chatId, "Sorry, video not found or invalid link.");
            }
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server & Telegram Bot are running on port ${PORT}`);
});