export function formDataToObject(data: { [key: string]: any }): any {
  let output;
  for (const key in data) {
    output = setOrCreateFormDataKey(key, output, data[key]);
  }

  return output;
}

function setOrCreateFormDataKey(key: string, target: any, value) {
  if (!target) {
    target = {};
  }
  let validKey: string | number;
  let others: string;
  const propertyKey = /^([^\[\.\[]+)\.?(.*)/.exec(key);
  if (propertyKey) {
    validKey = propertyKey[1];
    others = propertyKey?.[2];
  } else {
    const indexKey = /^\[(\d+)\]\.?(.*)/.exec(key);
    if (indexKey) {
      validKey = +indexKey[1];
      others = indexKey?.[2];
    }
  }
  if ((validKey || validKey === 0) && others) {
    let nestedTarget;
    if (!target[validKey]) {
      if (/^\[\d+\].*/.test(others)) {
        nestedTarget = [];
      } else {
        nestedTarget = {};
      }
    } else {
      nestedTarget = target[validKey];
    }
    target[validKey] = setOrCreateFormDataKey(others, nestedTarget, value);
  } else {
    target[validKey] = value;
  }
  return target;
}
