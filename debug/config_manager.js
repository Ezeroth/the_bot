const config_file_name = 'config.json';
const fs = require('fs');

module.exports = {
    get_config: function(){
        return JSON.parse(fs.readFileSync(config_file_name).toString());
    }
}