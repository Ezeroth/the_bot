var helpers = require('./helpers.js');
var bin = require('./debugger.js');
var extentions = require('./extentions.js');
var command_handler = require('./command_handler.js');
var commands = require('./commands.js');
var discord = require('discord.js');
var client = new discord.Client();
var config = helpers.config;

var environment = undefined;

var start_bot = function () {

    client.login(config.token);

    return 0;
}

var init_bot = function (starting_environment) {
    bin.log(`starting the bot on environment: ${starting_environment.toUpperCase()}`);
    
    environment = starting_environment;
    helpers.environment = starting_environment;
    
    helpers.grab_stats_file();

    start_bot();
}


var ready_callback = function () {

    setInterval(game_loop, config.presence_interval * 10);

    bin.log(`the bot is ready and functioning on environment ${environment.toUpperCase()}.`);
    
    return 0;
}

var server_join_callback = function (guild) {
    var message = helpers.get_string('guild_join_message');

    try {
        guild.defaultChannel.send(message);
    } catch (e) {
        if (!attempt_message_send(guild, message)) {
            try {
                guild.owner.send(message);
            } catch (e) {

            }
        }
    }

    return 0;
}

var message_callback = function (message) {
    command_handler.process_message(message);
}

var attempt_message_send = function (guild, message) {

    guild.channels.forEach(channel => {
        if (channel.type == 'text') {
            try {
                channel.send(message);
                return true;
            } catch (e) {
                //continue the iteration.
            }
        }
    });

    return false;
}

var game_loop = function(){
    client.user.setGame(config.presence_tags.random());
    return 0;
}

client.on('ready', ready_callback);
client.on('message', message_callback);
client.on('guildCreate', server_join_callback);

init_bot(config.environment);