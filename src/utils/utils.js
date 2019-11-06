const formatTooltip = value => {
  const formatArrayItem = item => {
    if (item === null) {
      return '';
    }

    if (Array.isArray(item)) {
      return item.join(', ');
    }

    if (typeof item === 'object') {
      return formatObject(item);
    }

    return item;
  };

  const formatObject = obj => {
    let returnValue = '';

    Object.keys(obj).forEach((key, index) => {
      if (Array.isArray(obj[key])) {
        returnValue += `${key}:`;
        returnValue += JSON.stringify(obj[key])
          .replace(/"|{|}/gi, '')
          .replace(/:/gi, ': ')
          .replace(/,/gi, '\n\t');
      } else {
        returnValue += `${key}: ${obj[key]}`;
      }

      if (index < Object.keys(obj).length - 1) {
        returnValue += `\n`;
      }
    });

    return returnValue;
  };

  if (value === null) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.map(item => formatArrayItem(item)).join();
  }

  if (typeof value === 'object' && Object.keys(value).length) {
    return formatObject(value);
  }

  return value;
};

export { formatTooltip };
