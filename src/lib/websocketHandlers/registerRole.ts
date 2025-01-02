import { gameEventInitialization } from "../dbHandlers/gameInitialization";
import { MAX_RETRY_ATTEMPTS } from "./connection";
import cache from "../cache";
import type { CacheEntry } from "../cache";

const registerRole = async (
  peer: any,
  role: string,
  connectionsMap: Map<string, any>,
  payload: any
) => {
  if (role === "presenter") {
    console.log("Registered presenter:", peer.id);

    // After registration, generate a game instance in postgres, and take the code
    const code: string | void = await gameEventInitialization();
    await peer.send(
      JSON.stringify({
        type: "RECEIVE_CONNECTION_CODE",
        payload: await code,
      })
    );

    // Cache the connection code with the presenter peer id
    let cacheEntry: CacheEntry = {
      MAX_RETRY_ATTEMPTS: MAX_RETRY_ATTEMPTS,
      peers: {
        presenter: peer.id,
      },
    };
    connectionsMap.set(peer.id, peer);
    let cacheData = await cache.set(code as string, cacheEntry);
  } else if (role === "viewer") {
    console.log("Accepting viewer: ", peer.id);
    // Check for existing presenter
    if (payload.code !== null && payload.code !== "") {
      // Check if presenter of same code exists
      const cacheDataOG = cache.get(payload.code);
      if (!cacheDataOG) {
        console.log("Cache with provided code does not exist");
        await peer.send(
          JSON.stringify({
            type: "RECEIVE_CONNECTION_CODE",
            payload: 403,
          })
        );
        return;
      }

      let newData = {
        ...cacheDataOG,
        peers: { ...cacheDataOG.peers, viewer: peer.id },
      };
      connectionsMap.set(peer.id, peer);
      cache.set(payload.code, newData);
      console.log("New Data: ", cache.get(payload.code));
      let currQuest = "";
      if (cacheDataOG.currentQuestion) currQuest = cacheDataOG.currentQuestion; // If cache has a current question, send it
      // Send back the code
      await peer.send(
        JSON.stringify({
          type: "RECEIVE_CONNECTION_CODE",
          payload: {
            code: payload.code,
            currentQuestion: currQuest,
          },
        })
      );
    } else {
      await peer.send(
        JSON.stringify({
          type: "RECEIVE_CONNECTION_CODE",
          payload: 403,
        })
      );
    }
  }
};

export default registerRole;
