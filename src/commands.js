var extentions = require('./extentions.js');
var helpers = require('./helpers.js');
var bin = helpers.bot_debugger;
var config = helpers.config;

var commands = [];

var find_command = function (name) {
    var cmd = null;

    commands.forEach(command => {
        if (command.command_name == name) {
            cmd = command;
        } else if (command.aliases.includes(name)) {
            cmd = command;
        }
    });

    return cmd;
}

class Command {
    constructor(command_name, aliases, callback) {
        this.command_name = command_name,
            this.callback = callback,
            this.aliases = aliases
    }

    execute(message_object) {
        var status_code = 0;
        helpers.command_used();

        try {
            status_code = this.callback(message_object);
        } catch (e) {
            status_code = 1;
            bin.log(`'${this.command_name}' command: RUNTIME_EXCEPTION = ${e}`);
        }

        if (config.log_level == 0) {
            bin.log(`'${this.command_name}' command: STATUS_CODE = ${status_code}`);
        }

        return status_code;
    }
}

//The help command.
//This command displays help and command information.
commands.push(new Command('help', helpers.get_aliases('help'), function (m) {

    var help_string = helpers.get_string('help_command_reply');

    helpers.send(m, help_string);

    return 0;
}));

//The stats command
//This command shows information about the bots' stats and etc.
commands.push(new Command('stats', helpers.get_aliases('stats'), function (m) {
    var stats_string = helpers.get_string('stats_command_template');
    var stats = helpers.get_stats(m);
    var uptime = helpers.get_uptime();

    stats_string = stats_string.replace('$_MEMBER_COUNT_$', stats.member_count)
        .replace('$_GUILD_COUNT_$', stats.guild_count)
        .replace('$_COMMAND_COUNT_$', stats.command_count)
        .replace('$_UPTIME_$', uptime);

    helpers.send(m, stats_string);

    return 0;
}));

//The about command
//This command displays data about the owner and contact
commands.push(new Command('about', helpers.get_aliases('about'), function (m) {
    var about_string = helpers.get_string('about_command_reply');

    helpers.send(m, about_string);

    return 0;
}));

//The guild random command
//The core command of this bot. The command that grabs a random guild invite and sends it to the user.
commands.push(new Command('guild_random', helpers.get_aliases('guild_random'), async function (m) {
    var guild = m.client.guilds.random();

    helpers.get_guild_invite(guild).then(code => {
        var invite_message = helpers.get_string('guild_random_template').replace('$_INVITE_CODE_$', code);

        helpers.send(m, invite_message, true);
    });

    return 0;
}));

//The eval command.
//Allows sudoers to eval code.
commands.push(new Command('eval', [], function (m) {
    //work in progress... 
}));

//The shutdown command
//Allows sudoers to shut off the bot.
commands.push(new Command('shutdown', [], function (m) {
    if (helpers.is_sudoer(m.author.id)) {
        m.client.destroy();
        process.exit();
    }

    return 0;
}));

//The restart command
//Allows sudoers to restart the bot
commands.push(new Command('restart', [], function (m) {
    if (helpers.is_sudoer(m.author.id)) {
        m.client.destroy();
        process.exit();
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