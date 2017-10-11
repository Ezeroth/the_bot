var obj = JSON.parse(require('fs').readFileSync('config.json').toString());

var string = 'SAME | WOW | U_TOO';
var p = string.replace('WOW', 'y').
replace('SAME', 'x').
replace('U_TOO', 'z');

console.log(p);


//random tests uwu