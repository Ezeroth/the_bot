var config_manager = require('./config_manager.js');
var bot_debugger = require('./debugger.js');
var extentions = require('./extentions.js');
var config = config_manager.get_config();

//I know this is a pretty bad way to do this, but it's fine for now
//as this is a pretty straightforward bot.

var previous_stats = {
    total_member_count: 0,
    total_command_count: 0,
};

var update_stats_wait = 0;
var member_use_wait = 0;
var command_use_wait = 0;


module.exports = {
    get_guild_invite: function (guild) {
        guild.channels.forEach(channel => {
            if (channel.type == 'text' || channel.type == 'voice') {
                try {
                    var invite = channel.createInvite(config.invite_options);

                    if (!is_null(invite)) {
                        return invite.code;
                    }
                } catch (e) {
                    //Ignore because this should automatically ignore.
                }
            }
        });
    },

    get_aliases: function (command_name) {
        config.aliases.forEach(alias => {
            if (alias.name == command_name) {
                return alias.aliases;
            }
        });

        return null;
    },

    get_string: function (string_name) {
        config.helpers.forEach(helper => {
            if (helper.name == string_name) {
                return helper.data;
            }
        });

        return null;
    },

    get_stats: function (message_object) {
        var client = message_object.client;
        var guild_count = client.guilds.size;
        var member_count = get_member_count(client.guilds);


    },

    get_member_count: function (guilds) {
        var member_count = 0;

        guilds.forEach(guild => {
            member_count += guild.memberCount;
        });

        return member_count;
    },

    command_used: function(){
        command_use_count++;
        if(command_use_wait >= 50){
            command_use_wait = 0;
            update_stats_file();
        }

    },

    update_stats_file: function(){
        var new_stats = {
            stats: previous_stats
        };

        var json_data = JSON.stringify(new_stats);
        fs.writeFileSync('stats.json', json_data);
    },

    grab_stats_file: function(){
        var file_json = fs.readFileSync('stats.json').toString();

        var data = JSON.parse(file_json);
        previous_stats = data.stats;
    },

    is_null: function (object) {
        if (object == null || object == undefined) {
            return true;
        }

        return false;
    },

    bot_debugger: bot_debugger,

    config: config,

    module_desc: 'This module contains helpers and extentions to help out the core bot\'s code.',

    module_name: 'helpers.js'
}