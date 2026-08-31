const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const token = '8803240976:AAFPKnYiow-64a_xvQ0Ch6UrqwCh2x5KHOo'; 
const bot = new TelegramBot(token, { polling: true });
bot.on('polling_error', (error) => {});

let postsList = []; 

app.get('/', (req, res) => {
    res.render('index', { posts: postsList });
});

app.get('/video/:shortCode', (req, res) => {
    const shortCode = req.params.shortCode;
    const post = postsList.find(p => p.shortCode === shortCode);
    if (post) {
        res.render('video', { post: post });
    } else {
        res.send("Video not found! <a href='/'>Go Home</a>");
    }
});

app.get('/admin', (req, res) => {
    res.render('admin');
});

app.post('/add-post', (req, res) => {
    const { title, thumbnail, screenshots, description } = req.body;
    
    const fileIds = [];
    for (let i = 1; i <= 10; i++) {
        const id = req.body[`videoId${i}`];
        if (id && id.trim() !== "") fileIds.push(id.trim());
    }
    
    if (title && thumbnail && fileIds.length > 0) {
        const shortCode = 'vid' + Math.floor(Math.random() * 1000000);
        postsList.unshift({ 
            title: title.trim(), 
            thumbnail: thumbnail.trim(), 
            screenshots: screenshots ? screenshots.trim() : '', 
            fileIds: fileIds, 
            description: description ? description.trim() : '', 
            shortCode: shortCode
        });
        res.redirect('/');
    } else {
        res.send("Title, Thumbnail and at least ONE Video ID are required! <a href='/admin'>Go Back</a>");
    }
});

bot.on('message', async (msg) => {
    try {
        const chatId = msg.chat.id;
        const text = msg.text;
        
        if (msg.video || msg.photo || msg.document) {
            let fileId = '';
            if (msg.video) fileId = msg.video.file_id;
            else if (msg.document) fileId = msg.document.file_id;
            else if (msg.photo) fileId = msg.photo[msg.photo.length - 1].file_id;

            await bot.sendMessage(chatId, `✅ File ID:\n<code>${fileId}</code>`, { parse_mode: 'HTML' });
            return;
        }

        if (text && text.startsWith('/start')) {
            const parts = text.split(' ');
            if (parts.length > 1) {
                const requestedId = parts[1].trim(); 
                const foundPost = postsList.find(p => p.shortCode === requestedId);

                if (foundPost) {
                    await bot.sendMessage(chatId, `🎬 Sending ${foundPost.fileIds.length} file(s)..\n\n⚠️ 1 ঘণ্টা পর ফাইলগুলো অটোমেটিক ডিলিট হয়ে যাবে।`);
                    
                    for (let i = 0; i < foundPost.fileIds.length; i++) {
                        let currentFileId = foundPost.fileIds[i];
                        let captionText = (i === 0) ? `🎥 ${foundPost.title}` : `🎥 Part ${i + 1}`;
                        
                        let sentMsg;
                        try {
                            sentMsg = await bot.sendVideo(chatId, currentFileId, { caption: captionText });
                        } catch (err) {
                            try {
                                sentMsg = await bot.sendPhoto(chatId, currentFileId, { caption: captionText });
                            } catch (err2) {
                                sentMsg = await bot.sendDocument(chatId, currentFileId, { caption: captionText });
                            }
                        }

                        // ১ ঘণ্টা (৩৬০০০০০ মিলি-সেকেন্ড) পর মেসেজ ডিলিট করার ফাংশন
                        if (sentMsg) {
                            setTimeout(async () => {
                                try {
                                    await bot.deleteMessage(chatId, sentMsg.message_id);
                                } catch (e) {
                                    console.error("Delete Error:", e.message);
                                }
                            }, 3600000); 
                        }
                    }
                } else {
                    await bot.sendMessage(chatId, "⚠️ Sorry, video not found.");
                }
            } else {
                await bot.sendMessage(chatId, "👋 Welcome to OnlyVPSS Bot!");
            }
        }
    } catch (err) {}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });