export function serializeSMap(obj) {
  return Object.entries(obj).reduce((acc, [key, value]:any) => {
    acc[key] = value.start.line
    return acc
  }, {});
}

// console.log(serializeSMap())

export function deserializeSMap(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[key] = { start: { line: value } }
    return acc
  }, {});
}
