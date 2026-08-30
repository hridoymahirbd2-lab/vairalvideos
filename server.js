const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// আপনার বটের টোকেন এখানে সেট করা আছে
const token = '8942375370:AAGQ8iaF-4qDn-NYKkReaNOUZOD5-uE2GFQ'; 
const bot = new TelegramBot(token, { polling: true });

// ডাটাবেজ: ওয়েবসাইটে যে Video ID দেবেন, তার বিপরীতে টেলিগ্রাম চ্যানেলের আসল file_id এখানে বসবে
const videoDatabase = {
    "video_1": "এখানে_আপনার_টেলিগ্রাম_ভিডিওর_file_id_বসাবেন"
};

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

// টেলিগ্রাম বটের লজিক: ইউজার লিংক থেকে এসে /start কমান্ড দিলে ভিডিও পাঠাবে
bot.onText(/\/start (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const requestedId = match[1]; // যেমন: "video_1"

    const videoFileId = videoDatabase[requestedId];

    if (videoFileId) {
        bot.sendVideo(chatId, videoFileId, { 
            caption: "Here is your video! It will be automatically deleted after 1 hour." 
        })
        .then((sentMessage) => {
            // ১ ঘণ্টা (৩৬০০০০০ মিলিপ্রি সেকেন্ড) পর ভিডিও ডিলিট করার টাইমার
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
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server & Telegram Bot are running on port ${PORT}`);
});