const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const token = '8942375370:AAGQ8iaF-4qDn-NYKkReaNOUZOD5-uE2GFQ'; 
const bot = new TelegramBot(token, { polling: true });

// সমস্ত পোস্ট এবং ভিডিওর তথ্য একসাথে এখানে জমা থাকবে
let posts = [];

app.get('/', (res) => {
    res.render('index', { posts });
});

app.get('/admin', (req, res) => {
    res.render('admin');
});

// অ্যাডমিন প্যানেল থেকে ফর্ম সাবমিট করলে সরাসরি এখানে সেভ হবে
app.post('/add-post', (req, res) => {
    const { title, thumbnail, videoId } = req.body;
    
    // posts অ্যারেতে টাইটেল, থাম্বনেইল এবং টেলিগ্রামের fileId (videoId ফিল্ডে যেটা দেবেন) সেভ হবে
    posts.push({ title, thumbnail, videoId });
    res.redirect('/');
});

// টেলিগ্রাম বটের লজিক: ইউজার লিংক থেকে এসে /start কমান্ড দিলে সরাসরি ডাটা থেকে ভিডিও পাঠাবে
bot.onText(/\/start (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const requestedId = match[1]; // এটি হবে অ্যাডমিন প্যানেলে দেওয়া টেলিগ্রাম file_id

    // posts অ্যারে থেকে খোঁজা যে এই file_id দিয়ে কোনো পোস্ট আছে কি না
    const foundPost = posts.find(p => p.videoId === requestedId);

    if (foundPost) {
        bot.sendVideo(chatId, foundPost.videoId, { 
            caption: `Here is your video: ${foundPost.title}\n\nIt will be automatically deleted after 1 hour.` 
        })
        .then((sentMessage) => {
            setTimeout(() => {
                bot.deleteMessage(chatId, sentMessage.message_id)
                    .catch((err) => console.log("Deletion error:", err));
            }, 3600000); // ১ ঘণ্টা পর ডিলিট
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
    console.log(`Server & Telegram Bot are running on port `${PORT}`);
});