interface String {
  toUnicode(): string;
  fromUnicode(): string;
}

const UNICODE_IDENTIFIER = /\\u([a-fA-F0-9]{4})/g;

String.prototype.toUnicode = function () {
  let result = '';

  for (let i = 0; i < this.length; i++) {
    result += '\\u' + ('000' + this[i].charCodeAt(0).toString(16)).substr(-4);
  }

  return result;
};

String.prototype.fromUnicode = function () {
  return this.replace(UNICODE_IDENTIFIER, function(g, m1) {
    return String.fromCharCode(parseInt(m1, 16));
  });
}
