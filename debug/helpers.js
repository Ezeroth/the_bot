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

        return null; //return if no invite is found.
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

        return {
            member_count: member_count,
            guild_count: guild_count,
            command_count: get_command_count()
        };

    },

    get_member_count: function (guilds) {
        var member_count = 0;

        if (member_use_wait >= config.member_update_wait) {

            guilds.forEach(guild => {
                member_count += guild.memberCount;
            });

            previous_stats.total_member_count = member_count;
            stats_check();

            return member_count;
        }

        return previous_stats.total_member_count;
    },

    get_command_count: function () {
        return previous_stats.total_command_count;
    },

    command_used: function () {
        previous_stats.total_command_count++;
        stats_check();
    },

    stats_check: function () {
        update_stats_wait++;
        if (update_stats_wait >= config.stats_update_wait) {
            update_stats_wait = 0;
            update_stats_file();
        }
    },

    update_stats_file: function () {
        var new_stats = {
            stats: previous_stats
        };

        var json_data = JSON.stringify(new_stats);
        fs.writeFileSync(config.stats_file_name, json_data);
    },

    grab_stats_file: function () {
        var file_json = fs.readFileSync(config.stats_file_name).toString();

        var data = JSON.parse(file_json);
        previous_stats = data.stats;
    },

    is_null: function (object) {
        if (object == null || object == undefined) {
            return true;
        }

        return false;
    },

    is_sudoer: function(id){
        if(is_null(id)) return false;

        return config.sudoers.has(id);
    },

    bot_debugger: bot_debugger,

    config: config,

    module_desc: 'This module contains helpers and extentions to help out the core bot\'s code.',

    module_name: 'helpers.js'
}