const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Telegram's token
const token = '772391451:AAFDnyayueAIEmOok2NWCBEYUpHfCRHSCj4';

//OpenWeatherMap API key
const appID = '73996a19f42b0049722f47595281984d';

// OpenWeatherMap endpoint for getting weather by city name
const weatherEndpoint = (city) => (
  `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&&appid=${appID}`
);


// URL that provides icon according to the weather
const weatherIcon = (icon) => `http://openweathermap.org/img/w/${icon}.png`;

// Template for weather response
const weatherHtmlTemplate = (name, main, weather, wind, clouds) => (
  `The weather in <b>${name}</b>:
<b>${weather.main}</b> - ${weather.description}
Temperature: <b>${main.temp} °C</b>
Pressure: <b>${main.pressure} hPa</b>
Humidity: <b>${main.humidity} %</b>
Wind: <b>${wind.speed} meter/sec</b>
Clouds: <b>${clouds.all} %</b>
`
);

// Created instance of TelegramBot
const bot = new TelegramBot(token, {
  polling: true
});

// Function that gets the weather by the city name
const getWeather = (chatId, city) => {
  const endpoint = weatherEndpoint(city);

  axios.get(endpoint).then((resp) => {
    const {
      name,
      main,
      weather,
      wind,
      clouds
    } = resp.data;

    bot.sendPhoto(chatId, weatherIcon(weather[0].icon))
    bot.sendMessage(
      chatId,
      weatherHtmlTemplate(name, main, weather[0], wind, clouds), {
        parse_mode: "HTML"
      }
    );
  }, error => {
    console.log("error", error);
    bot.sendMessage(
      chatId,
      `Ooops...I couldn't be able to get weather for <b>${city}</b>`, {
        parse_mode: "HTML"
      }
    );
  });
}

// Listener (handler) for telegram's /weather event
bot.onText(/\/weather/, (msg, match) => {
  const chatId = msg.chat.id;
  const city = match.input.split(' ')[1];

  if (city === undefined) {
    bot.sendMessage(
      chatId,
      `Please provide city name`
    );
    return;
  }
  getWeather(chatId, city);
});

// Listener (handler) for telegram's /start event
// This event happened when you start the conversation with both by the very first time
// Provide the list of available commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Welcome at <b>MyTestWeatherInfoBot</b>, thank you for using my service
    
Available commands:

/weather <b>city</b> - shows weather for selected <b>city</b>
  `, {
      parse_mode: "HTML"
    }
  );
  init(msg);
});



var obj = {
    title:'Выберите город:',
    buttons:[
      [{ text: 'Bishkek', callback_data: '1' }],
      [{ text: 'Almaty', callback_data: '2' }],
      [{ text: 'Moscow', callback_data: '3' }]
    ]
}


//new code
function init(msg){

  var chatId = chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id; // Если сообщение отправлял пользователь, то свойство msg.chat.id, если же он кликал на кнопку, то msg.from.id
  var options = {
    reply_markup:JSON.stringify({
      inline_keyboard : obj.buttons,
    })
  };
  var title = obj.title;

  bot.sendMessage(chatId,title,options);
}

bot.on('callback_query', function (msg) {

  //here I should be able to see which button was clicked...
  var cityCode = msg.data;

  if(cityCode == '1'){
    getWeather(msg.from.id,'Bishkek');  
  }else if(cityCode=='2'){
    getWeather(msg.from.id,'Almaty');
  }
  
  init(msg);
});