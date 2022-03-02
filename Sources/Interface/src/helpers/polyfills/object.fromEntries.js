/**
 * полифилл самописный и не претендует на верность. MR приветствуются
 */

if (typeof Object.fromEntries === "undefined") {
  Object.fromEntries = function (arr) {
    if (!Array.isArray(arr)) throw new TypeError('Переданный аргумент не является объектом');
    if (!arr.every(function (el) {
      return Array.isArray(el)
        && el.length === 2
    })) throw new TypeError('Не все элементы массива являются массивом из двух элементов');
    
    const obj = {};
    
    arr.forEach(function (pair) {
      obj[pair[0]] = pair[1];
    });
    
    return obj;
  }
}
