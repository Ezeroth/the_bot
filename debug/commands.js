var extentions = require('./extentions.js');
var helpers = require('./helpers.js');
var bin = helpers.bot_debugger;
var config = helpers.config;

var commands = [];

var find_command = function (name) {
    commands.forEach(command => {
        if (command.name == name) {
            return command;
        } else if (command.aliases.has(name)) {
            return command;
        } else return null;
    });
}

class Command {
    constructor(command_name, aliases, callback) {
        this.command_name = command_name,
            this.callback = callback,
            this.aliases = aliases
    }

    execute(message_object) {
        var status_code = 0;

        try {
            status_code = callback(message_object);
        } catch (e) {
            status_code = 1;
            bin.log(`'${this.command_name}' command: RUNTIME_EXCEPTION = ${e}`);
            return status_code;
        }

        if (config.log_level = 0) {
            bin.log(`'${this.command_name}' command: STATUS_CODE = ${status_code}`);
        }
    }
}

//The help command.
//This command displays help and command information.
commands.push(new Command('help', helpers.get_aliases('help'), function (m) {

    var help_string = helpers.get_string('help_command_reply');
    try {
        m.channel.send(help_string);
    } catch (e) {
        m.author.send(help_string);
    }

    return 0;
}));

//The stats command
//This command shows information about the bots' stats and etc.
commands.push(new Command('stats', helpers.get_aliases('stats'), function (m) {
    var stats_string = helpers.get_string('stats_command_template');
    var stats = helpers.get_stats(m);

    stats_string = stats_string.replace('$_MEMBER_COUNT_$', stats.member_count)
    .replace('$_GUILD_COUNT_$', stats.guild_count)
    .replace('$_COMMAND_COUNT_$', stats.command_count);

    try {
        m.channel.send(stats_string);
    } catch (e) {
        m.author.send(stats_string);
    }

    return 0;
}));

//The about command
//This command displays data about the owner and contact
commands.push(new Command('about', helpers.get_aliases('about'), function (m) {
    var about_string = helpers.get_string('about_command_reply');
    try {
        m.channel.send(about_string);
    } catch (e) {
        m.author.send(about_string);
    }

    return 0;
}));

//The guild random command
//The core command of this bot. The command that grabs a random guild invite and sends it to the user.
commands.push(new Command('guild_random', helpers.get_aliases('guild_random'), function (m) {
    var guild = m.client.guilds.random();
    var invite_code = helpers.get_guild_invite(guild);
    var invite_message = helpers.get_string('guild_random_template').replace('$_INVITE_CODE_$', invite_code);

    try {
        m.channel.send(invite_message);
    } catch (e) {
        m.author.send(invite_message);
    }

    return 0;
}));


//Module exports:

module.exports = {
    commands: commands,
    Command: Command,
    find_command: find_command,
    module_desc: 'This module contains the command code and command class.',
    module_name: 'commands.js'
}