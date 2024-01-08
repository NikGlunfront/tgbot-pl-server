const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '6572869925:AAHF10URck10LHvmeenurxj9Auc-JRzrUu0';
const webAppUrl = 'https://flourishing-mermaid-7f2674.netlify.app';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());


bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text

    console.log(msg)

  // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'Received your message');

    if (text === '/start') {

        // Кнопка клавиатура
        await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заполни форму', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        })

        // Кнопка INLINE
        await bot.sendMessage(chatId, 'Зайти в WebApp приложение по кнопке', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Заполни форму', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        })
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)

            await bot.sendMessage(chatId, 'Спасибо за обратную связь')
            await bot.sendMessage(chatId, 'Ваш город: ' + data?.city)
            await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street)
            
            setTimeout(async () => {
                await bot.sendMessage(chatId, "Всю информацию вы получите в этом чате")
            }, 3000);
        } catch (error) {
            console.log(e)
        }
    }

});

const PORT = 8000;
app.listen(PORT, () => console.log('server started on port ' + PORT))

app.post('/web-data', async (req, res) => {
    // const {queryId, products, totalPrice} = req.body
    await bot.sendMessage(658318611, 'Спасибо за обратную связь')
    // try {
    //     await bot.answerWebAppQuery(queryId, {
    //         type: 'article',
    //         id: queryId,
    //         title: 'Успешная покупка',
    //         input_message_content: {message_text: 'Поздравляю с покупкой, вы приобрели товар на сумму ' + totalPrice}
    //     })

    //     return res.status(200).json({})
        
    // } catch (error) {
    //     await bot.answerWebAppQuery(queryId, {
    //         type: 'article',
    //         id: queryId,
    //         title: 'Успешная покупка',
    //         input_message_content: {message_text: 'Не удалось приобрести товар'}
    //     })
    //     return res.status(500).json({})
    // }
})

app.get('/', (req, res) => {
    res.json({ username: 'Flavio' })
})
