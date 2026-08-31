const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const token = '8803240976:AAFPKnYiow-64a_xvQ0Ch6UrqwCh2x5KHOo'; 
const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', (error) => {
    // পোলিং এরর ইগনোর করবে
});

// গ্লোবাল পোস্ট স্টোরেজ অ্যারে
let postsList = [];

// হোমপেজ রাউট
app.get('/', (req, res) => {
    res.render('index', { posts: postsList });
});

// অ্যাডমিন প্যানেল পেজ রাউট
app.get('/admin', (req, res) => {
    res.render('admin');
});

// পোস্ট অ্যাড করার রাউট
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

// বটের নতুন স্মার্ট হ্যান্ডলার: ভিডিও পাঠালে বট অটো ফাইল আইডি বলে দেবে, আর /start দিলে ভিডিও পাঠাবে
bot.on('message', async (msg) => {
    try {
        const chatId = msg.chat.id;
        const text = msg.text;
        const video = msg.video;

        // ১. আপনি যদি বটে কোনো ভিডিও আপলোড করেন, তবে বট সেটির ফাইল আইডি রিপ্লাই দিয়ে জানিয়ে দেবে
        if (video) {
            const fileId = video.file_id;
            await bot.sendMessage(chatId, `✅ Video Received Successfully!\n\n📋 Copy this Video ID / File ID for your Admin Panel:\n\n<code>${fileId}</code>`, {
                parse_mode: 'HTML'
            });
            return;
        }

        // ২. ইউজার যখন ওয়েবসাইট থেকে অ্যাড দেখে বটে এসে /start [videoId] দেবে
        if (text && text.startsWith('/start')) {
            const parts = text.split(' ');
            if (parts.length > 1) {
                const requestedId = parts[1].trim(); 
                const foundPost = postsList.find(p => p.videoId === requestedId);

                if (foundPost) {
                    await bot.sendMessage(chatId, "🎬 Sending your video, please wait...");
                    await bot.sendVideo(chatId, foundPost.videoId, { 
                        caption: `🎥 Here is your video: ${foundPost.title}\n\nHope you enjoyed the videos! They will be deleted after 10 minutes.` 
                    });
                } else {
                    await bot.sendMessage(chatId, "⚠️ Sorry, video not found in database. Make sure it's added from the admin panel using the exact Video ID.");
                }
            } else {
                await bot.sendMessage(chatId, "👋 Welcome to OnlyVPSS Bot! Please go back to the website, complete all ads, and click 'DOWNLOAD NOW' to get your video.");
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