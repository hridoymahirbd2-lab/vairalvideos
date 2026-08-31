const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const token = '8942375370:AAGQ8iaF-4qDn-NYKkReaNOUZOD5-uE2GFQ'; 
const bot = new TelegramBot(token, { polling: true });

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
        postsList.unshift({ title, thumbnail, videoId });
        res.redirect('/');
    } else {
        res.send("All fields are required! <a href='/admin'>Go Back</a>");
    }
});

// টেলিগ্রাম বটের কমান্ড হ্যান্ডলার (ভিডিও পাঠানোর জন্য নিখুঁত কোড)
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
                    console.error("Send video error:", err);
                    bot.sendMessage(chatId, "Sorry, failed to send the video file ID.");
                });
            } else {
                bot.sendMessage(chatId, "Sorry, video not found or link has expired.");
            }
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});