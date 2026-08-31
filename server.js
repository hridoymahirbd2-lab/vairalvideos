const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
    if (title && thumbnail && videoId) {
        posts.unshift({ title, thumbnail, videoId });
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Success</title>
                <style>
                    body { font-family: Arial; background: #f4f4f9; padding: 50px; text-align: center; }
                    .box { background: white; max-width: 400px; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                    a { display: inline-block; margin-top: 15px; background: #0088cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="box">
                    <h2 style="color: green;">Post Published Successfully!</h2>
                    <p>Your video has been added to the gallery.</p>
                    <a href="/">Go to Homepage</a> | <a href="/admin">Add More</a>
                </div>
            </body>
            </html>
        `);
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
            const requestedId = parts[1]; 
            const foundPost = posts.find(p => p.videoId === requestedId);

            if (foundPost) {
                bot.sendVideo(chatId, foundPost.videoId, { 
                    caption: `Here is your video: ${foundPost.title}` 
                }).catch((err) => {
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