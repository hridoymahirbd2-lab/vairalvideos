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
        // অতিরিক্ত স্পেস দূর করার জন্য .trim() ব্যবহার করা হলো
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

// ১০০% নিখুঁত টেলিগ্রাম বট হ্যান্ডলার
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text && text.startsWith('/start')) {
        const parts = text.split(' ');
        if (parts.length > 1) {
            const requestedId = parts[1].trim(); 
            const foundPost = postsList.find(p => p.videoId.trim() === requestedId);

            if (foundPost) {
                bot.sendVideo(chatId, foundPost.videoId, { 
                    caption: `🎥 Here is your video: ${foundPost.title}` 
                }).catch((err) => {
                    console.error("Telegram Send Video Error:", err);
                    bot.sendMessage(chatId, "⚠️ Sorry, failed to send the video file. Make sure the File ID is correct.");
                });
            } else {
                bot.sendMessage(chatId, "⚠️ Sorry, video not found in the database.");
            }
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});