let queue = Promise.resolve();

export function enqueueModeOperation(operation) {
  const result = queue.then(operation);
  queue = result.catch(() => {});
  return result;
}
