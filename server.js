const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const token = '8942375370:AAGQ8iaF-4qDn-NYKkReaNOUZOD5-uE2GFQ'; 
const bot = new TelegramBot(token, { polling: true });

// পোস্টগুলো জমা রাখার জন্য লোকাল স্টোরেজ অ্যারে
let posts = [];

app.get('/', (req, res) => {
    res.render('index', { posts });
});

app.get('/admin', (req, res) => {
    // পিসিতে বা ব্রাউজারে অ্যাডমিন পেজ বানানোর জন্য একটি ছোট ফর্ম দিতে পারেন
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Admin Panel</title>
            <style>
                body { font-family: Arial; padding: 30px; text-align: center; background: #f4f4f9; }
                form { background: white; max-width: 400px; margin: 0 auto; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                input { width: 90%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px; }
                button { background: #0088cc; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer; }
            </button>
        </head>
        <body>
            <h2>Add New Video Post</h2>
            <form action="/add-post" method="POST">
                <input type="text" name="title" placeholder="Video Title" required><br>
                <input type="text" name="thumbnail" placeholder="Thumbnail Image URL" required><br>
                <input type="text" name="videoId" placeholder="Telegram Video File ID / Custom ID" required><br>
                <button type="submit">Publish Post</button>
            </form>
        </body>
        </html>
    `);
});

app.post('/add-post', (req, res) => {
    const { title, thumbnail, videoId } = req.body;
    if (title && thumbnail && videoId) {
        posts.unshift({ title, thumbnail, videoId }); // নতুন পোস্ট সবার উপরে দেখাবে
    }
    res.redirect('/');
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text && text.startsWith('/start')) {
        const parts = text.split(' ');
        if (parts.length > 1) {
            const requestedId = parts[1]; 
            const foundPost = posts.find(p => p.videoId === requestedId);

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