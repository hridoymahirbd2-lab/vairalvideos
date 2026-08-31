const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const token = '8942375370:AAGQ8iaF-4qDn-NYKkReaNOUZOD5-uE2GFQ'; 
const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', (error) => {
    // পোলিং এরর ইগনোর করবে যাতে লোগ পরিষ্কার থাকে
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

// সরাসরি এবং ইনস্ট্যান্ট ভিডিও পাঠানোর লজিক
bot.on('message', async (msg) => {
    try {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (text && text.startsWith('/start')) {
            const parts = text.split(' ');
            if (parts.length > 1) {
                const requestedId = parts[1].trim(); 
                const foundPost = postsList.find(p => p.videoId === requestedId);

                if (foundPost) {
                    await bot.sendMessage(chatId, "🎬 Your video is arriving...");
                    await bot.sendVideo(chatId, foundPost.videoId, { 
                        caption: `🎥 Here is your video: ${foundPost.title}` 
                    });
                } else {
                    await bot.sendMessage(chatId, "⚠️ Sorry, video not found in database.");
                }
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