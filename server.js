const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const token = '8942375370:AAGQ8iaF-4qDn-NYKkReaNOUZOD5-uE2GFQ'; 
const bot = new TelegramBot(token, { polling: true });

// পার্মানেন্ট মেমোরি অ্যারে
if (!global.myPosts) {
    global.myPosts = [];
}

app.get('/', (req, res) => {
    res.render('index', { posts: global.myPosts });
});

app.get('/admin', (req, res) => {
    res.render('admin');
});

app.post('/add-post', (req, res) => {
    const { title, thumbnail, videoId } = req.body;
    if (title && thumbnail && videoId) {
        global.myPosts.unshift({ 
            title: title.trim(), 
            thumbnail: thumbnail.trim(), 
            videoId: videoId.trim() 
        });
        res.redirect('/');
    } else {
        res.send("All fields are required! <a href='/admin'>Go Back</a>");
    }
});

// ১০০% নিশ্চিত ভিডিও পাঠানোর বট হ্যান্ডলার
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text && text.startsWith('/start')) {
        const parts = text.split(' ');
        if (parts.length > 1) {
            const requestedId = parts[1].trim(); 
            const foundPost = global.myPosts.find(p => p.videoId === requestedId);

            if (foundPost) {
                // ইউজারকে আগে টেক্সট পাঠিয়ে চ্যাট একটিভ করা, তারপর ভিডিও পাঠানো
                bot.sendMessage(chatId, "⏳ Your video is loading...").then(() => {
                    return bot.sendVideo(chatId, foundPost.videoId, { 
                        caption: `🎥 Here is your video: ${foundPost.title}` 
                    });
                }).catch((err) => {
                    console.error("Bot send error:", err);
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