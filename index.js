const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const PORT = 8000;

const { pool } = require('./config/db')

const token = '6572869925:AAHF10URck10LHvmeenurxj9Auc-JRzrUu0';
const webAppUrl = 'https://flourishing-mermaid-7f2674.netlify.app';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

const redis = require("redis");

// Connect to redis | async anonymous func
(async () => {
    client = redis.createClient();
  
    client.on("error", (error) => console.log('Что-то пошло не так', error)); // вешаем хук на ошибку подключения к серверу Redis
  
    await client.connect(); // подключаемся к серверу
})();

const onRequest = async (key, reqFunc) => {
    let results; // заранее объявляем переменную для результата

    const cacheData = await client.get(key); // пытаемся получить переменную post из базы данных Redis

    if(cacheData) {
        results = JSON.parse(cacheData); // парсим данные из формата сырой строки в формат структуры
    } else {
        results = await reqFunc(); // вызываем функцию получения данных с удаленного сервера
    if(results.length === 0) throw "API error"; // обрабатываем пустой результат ошибкой
        await client.set(key, JSON.stringify(results)); // кэшируем полученные данные
    }

    return results;
}


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


app.post('/web-data', async (req, res) => {
    const {queryId, products, totalPrice} = req.body
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {message_text: 'Поздравляю с покупкой, вы приобрели товар на сумму ' + totalPrice}
        })

        return res.status(200).json({})
        
    } catch (error) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {message_text: 'Не удалось приобрести товар'}
        })
        return res.status(500).json({})
    }
})

app.get('/', async (req, res) => {
    let result
    pool.query('SELECT * FROM test_table', (error, results) => {
        if (error) {
            throw error
        }
        result = results.rows
    })
    let resValue = await client.set("first_rds_key", JSON.stringify(result)); // кэшируем полученные данные
    res.status(200).json(resValue)
})
app.get('/getredis', async (req, res) => {
    const cacheData = await client.get("first_rds_key"); // пытаемся получить переменную post из базы данных Redis
    if (cacheData) {
        res.status(200).json({cache_data: cacheData})
        
    } else {
        res.status(500).json({error: 'error'})
        
    }
})

app.listen(PORT, () => console.log('server started on port ' + PORT))
