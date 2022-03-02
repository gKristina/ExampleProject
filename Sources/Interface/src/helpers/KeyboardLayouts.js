const layouts = {
  qwertyRus: [
    'Ё1234567890',
    'ЙЦУКЕНГШЩЗХ',
    'ФЫВАПРОЛДЖЭ',
    'ЯЧСМИТЬБЮЪ',
    '/-={ :space}{Стереть все:clear}'
  ],
  numpadNoDecimal: [
    "123",
    "456",
    "789",
    "0{Стереть все:clear}"
  ],
  onlyBackspace: ["{⌫:backspace}"]
};

Object.entries(layouts).forEach(([key, value]) => (layouts[key] = value.join('|')));

export default layouts 
