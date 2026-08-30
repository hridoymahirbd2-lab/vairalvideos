const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const token = '8942375370:AAGQ8iaF-4qDn-NYKkReaNOUZOD5-uE2GFQ'; 
const bot = new TelegramBot(token, { polling: true });

let posts = [];

app.get('/', (req, res) => {
    res.render('index', { posts });
});

app.get('/admin', (req, res) => {
    res.render('admin');
});

app.post('/add-post', (req, res) => {
    const { title, thumbnail, videoId } = req.body;
    posts.push({ title, thumbnail, videoId });
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
                    caption: `Here is your video: ${foundPost.title}\n\nIt will be automatically deleted after 1 hour.` 
                })
                .then((sentMessage) => {
                    setTimeout(() => {
                        bot.deleteMessage(chatId, sentMessage.message_id)
                            .catch((err) => console.log("Deletion error:", err));
                    }, 3600000); 
                })
                .catch((err) => {
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