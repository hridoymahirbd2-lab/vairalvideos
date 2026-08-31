const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const token = '8942375370:AAGQ8iaF-4qDn-NYKkReaNOUZOD5-uE2GFQ'; 

// পোলিং কনফ্লিক্ট এড়ানোর জন্য পোলিং বন্ধ করে সরাসরি ওয়েবটোকেন বা সেফ ইনস্ট্যান্স মোড দেওয়া হলো
const bot = new TelegramBot(token, { polling: true });

// পোলিং এরর যাতে কনসোল লাল না করে
bot.on('polling_error', (error) => {
    // ইগনোর কনফ্লিক্ট এরর লোগো
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

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text && text.startsWith('/start')) {
        const parts = text.split(' ');
        if (parts.length > 1) {
            const requestedId = parts[1].trim(); 
            const foundPost = postsList.find(p => p.videoId === requestedId);

            if (foundPost) {
                bot.sendVideo(chatId, foundPost.videoId, { 
                    caption: `🎥 Here is your video: ${foundPost.title}` 
                }).catch((err) => {
                    console.error("Send video error:", err.message);
                    bot.sendMessage(chatId, "⚠️ Failed to send video. Make sure the File ID is correct.");
                });
            } else {
                bot.sendMessage(chatId, "⚠️ Sorry, video not found in database.");
            }
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});