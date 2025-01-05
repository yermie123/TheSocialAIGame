import { gameEventInitialization } from "../dbHandlers/gameInitialization";
import { MAX_RETRY_ATTEMPTS } from "./connection";
import cache from "../cache";
import type { CacheEntry } from "../cache";
import { pool } from "../database";
import { getUniqueRandomQuestion } from "../dbHandlers/gameQuestions";
import { gameEventTeamChange } from "../dbHandlers/gameEventHandlers";

const registerRole = async (
  peer: any,
  role: string,
  connectionsMap: Map<string, any>,
  payload: any
) => {
  if (role === "presenter") {
    console.log("Registered presenter:", peer.id);

    // Check if the presenter has provided team data
    if (payload.teams === null || payload.teams === "") {
      await peer.send(
        JSON.stringify({
          type: "RECEIVE_CONNECTION_CODE",
          payload: 400,
        })
      );
      return;
    }

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
  } else if (role === "existing-presenter") {
    console.log("Accepting existing presenter: ", peer.id);

    // Send the current question to the peer
    const cacheData = cache.get(payload.code);
    if (!cacheData) {
      console.log("Cache with provided code does not exist");
      await peer.send(
        JSON.stringify({
          type: "RECEIVE_CONNECTION_CODE",
          payload: 403,
        })
      );
      return;
    }

    if (
      cacheData.currentQuestion === null ||
      cacheData.currentQuestion === "" ||
      cacheData.peers.presenter === ""
    ) {
      console.log("Information missing in cache. Attempting a database pull");

      // Attempt to get the current question from the database
      const result = await pool.query(
        `SELECT * FROM game_events WHERE connection_code = $1`,
        [payload.code]
      );
      if (result.rows.length === 0) {
        console.log("This game event not found in database");
        await peer.send(
          JSON.stringify({
            type: "RECEIVE_CONNECTION_CODE",
            payload: 403,
          })
        );
        return;
      }

      // Otherwise, validate that the game is not finished
      if (result.rows[0].game_finished === true) {
        console.log("This game event has already finished");
        await peer.send(
          JSON.stringify({
            type: "RECEIVE_CONNECTION_CODE",
            payload: 503,
          })
        );
        return;
      }

      // Otherwise, update the cache, and send the data to the peer
      let newData: CacheEntry = {
        MAX_RETRY_ATTEMPTS: MAX_RETRY_ATTEMPTS,
        team1: result.rows[0].team1,
        team2: result.rows[0].team2,
        peers: {
          presenter: peer.id,
        },
      };
      cache.set(payload.code, newData);

      await peer.send(
        JSON.stringify({
          type: "RECEIVE_CONNECTION_CODE",
          payload: payload.code,
        })
      );
    } else {
      // Reset the peer id in the cache and send back the code to the peer
      let newData = {
        ...cacheData,
        peers: { ...cacheData.peers, presenter: peer.id },
      };
      cache.set(payload.code, newData);
      await peer.send(
        JSON.stringify({
          type: "RECEIVE_CONNECTION_CODE",
          payload: payload.code,
        })
      );
    }
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

const registerRoleExisting = async (
  peer: any,
  role: string,
  connectionsMap: Map<string, any>,
  payload: any
) => {
  if (role !== "presenter") {
    // Register Existing is only for Presenters, viewers already always register existing
    peer.send(
      JSON.stringify({
        type: "RECEIVE_CONNECTION_CODE",
        payload: 403,
      })
    );
  }
};

export default registerRole;
