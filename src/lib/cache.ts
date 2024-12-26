"use server";

import NodeCache from "node-cache";

const cache = new NodeCache({
  stdTTL: 0,
  checkperiod: 0,
  useClones: true,
  deleteOnExpire: false,
  maxKeys: -1,
});

export { cache };
