const emptyObject = {};

const StyleRegistry = {
  resolve: (style: unknown) => {
    if (!style) {
      return emptyObject;
    }

    return { style };
  },
};

export default StyleRegistry;
