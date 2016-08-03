
const horizonSub = (data) => ({
  watch() {
    return {
      forEach(fn) {
        fn(data);
      }
    };
  }
});

function HorizonMock(opts = {}) {
  return () => ({
    findAll() {
      return horizonSub(opts.data);
    },
    ...horizonSub(opts.data)
  });
}

export default HorizonMock;
export { horizonSub };
