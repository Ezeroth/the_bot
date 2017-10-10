var obj = JSON.parse(require('fs').readFileSync('config.json').toString());


Object.prototype.isNull = function () {
    if (this == null || this == undefined) {
      return true;
    }
  
    return false;
  }

var o = undefined;

obj.aliases.forEach(x => {
    if(x.name == 'help'){
        console.log(x);
    }
})

console.log(o.isNull());