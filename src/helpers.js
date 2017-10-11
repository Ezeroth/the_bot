var config_manager = require('./config_manager.js');
var bot_debugger = require('./debugger.js');
var extentions = require('./extentions.js');
var fs = require('fs');
var config = config_manager.get_config();

//I know this is a pretty bad way to do this, but it's fine for now
//as this is a pretty straightforward bot.

var previous_stats = {
    total_member_count: 0,
    total_command_count: 0,
};

var update_stats_wait = 0;
var member_use_wait = 0;
var initial_member_use = true;

module.exports = {
    get_guild_invite: async function (guild) {
        var invite_code = null;
        var create_invite = true;

        var invite = await guild.channels.first().createInvite(config.invite_options, config.invite_options.reason);
        invite_code = invite.code;

        return invite_code; //return if no invite is found.
    },

    get_aliases: function (command_name) {
        var aliases = null;

        config.aliases.forEach(alias => {
            if (alias.name == command_name) {
                aliases = alias.aliases;
            }
        });

        return aliases;
    },

    get_string: function (string_name) {
        var data = null;

        config.helpers.forEach(helper => {
            if (helper.name == string_name) {
                data = helper.data;
            }
        });

        return data;
    },

    get_stats: function (message_object) {
        var client = message_object.client;
        var guild_count = client.guilds.size;
        var member_count = this.get_member_count(client.guilds);

        return {
            member_count: member_count,
            guild_count: guild_count,
            command_count: this.get_command_count()
        };

    },

    get_member_count: function (guilds) {
        var member_count = 0;

        if (member_use_wait >= config.member_update_wait || initial_member_use) {
            member_use_wait = 0;
            initial_member_use = false;

            guilds.forEach(guild => {
                member_count += guild.memberCount;
            });

            previous_stats.total_member_count = member_count;
            this.stats_check();

            return previous_stats.total_member_count;
        }

        member_use_wait++;
        return previous_stats.total_member_count;
    },

    get_command_count: function () {
        return previous_stats.total_command_count;
    },

    command_used: function () {
        previous_stats.total_command_count++;
        this.stats_check();
    },

    stats_check: function () {
        update_stats_wait++;
        if (update_stats_wait >= config.stats_update_wait) {
            update_stats_wait = 0;
            this.update_stats_file();
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

    is_sudoer: function (id) {
        if (this.is_null(id)) return false;

        return config.sudoers.includes(id);
    },

    get_uptime: function () {
        var date_one = this.start_time;
        var date_two = new Date();

        var diff = date_two.getTime() - date_one.getTime();

        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        diff -= days * (1000 * 60 * 60 * 24);

        var hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);

        var mins = Math.floor(diff / (1000 * 60));
        diff -= mins * (1000 * 60);

        var seconds = Math.floor(diff / (1000));
        diff -= seconds * (1000);

        return (days + " days, " + hours + " hours, " + mins + " minutes, " + seconds + " seconds");
    },

    send: async function (message_object, data, invite = false) {
        if (config.reply_in_dms || (invite && config.invite_in_dms)) this.internal_send(message_object.author, data);
        else this.internal_send(message_object.channel, data, message_object.author);
    },

    internal_send: async function (channel, data, recovery_channel = null) {
        try {
            channel.send(data);
        } catch (e) {
            if (!this.is_null(recovery_channel)) {
                recovery_channel.send(data);
            }
        }
    },

    bot_debugger: bot_debugger,

    config: config,

    module_desc: 'This module contains helpers and extentions to help out the core bot\'s code.',

    module_name: 'helpers.js',

    start_time: new Date(),

    environment: null
}