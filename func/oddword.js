const stdin = process.stdin;

stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

let odd = false;
let prev = false;
let switched = false;

const isAlpha = key => {
  const char = key.charCodeAt(0);
  return (
      char >= "A".charCodeAt(0) && char <= "Z".charCodeAt(0)) || (
      char >= "a".charCodeAt(0) && char <= "z".charCodeAt(0));
};

const charOut = c => process.stdout.write(c);

let dump = (f1, b1) => {
  if (b1) { f1() } else { dump = dump }
};


const rev = (key, switched) => {

  switched ? charOut(key) && dump() :

};

const fwd = (key, func) => {
  func ? func() && charOut(key) : charOut(key);
};

stdin.on('data', key => {
  if (key === '\u0003') {
    process.exit();
  }

  odd = isAlpha(key) ? odd : !odd;
  switched = prev !== odd;
  odd ? rev(key, switched) : fwd(key, switched);
  prev = odd;
});
