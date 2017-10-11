var helpers = require('./helpers.js');
var bin = require('./debugger.js');
var extentions = require('./extentions.js');
var command_handler = require('./command_handler.js');
var commands = require('./commands.js');
var discord = require('discord.js');
var client = new discord.Client();
var config = helpers.config;


var process_message = function(message){
    var content = message.content;
    if(config.lower_message) content = content.toLowerCase();

    var command_args = content.split(' ');
    if(command_args[0].startsWith(config.prefix)){

        var command = commands.find_command(command_args[0].substr(config.prefix.length));

        if(!helpers.is_null(command)){
            command.execute(message);
        }
    }
}

module.exports = {
    process_message: process_message
}