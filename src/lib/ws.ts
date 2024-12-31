"use server";

import { eventHandler } from "vinxi/http";
import { gameEventInitialization } from "./dbHandlers/gameInitialization";
import { getUniqueRandomQuestion } from "./dbHandlers/gameQuestions";
import type { CacheEntry } from "./cache";
import cache from "./cache";

import {
  connections,
  presenters,
  viewers,
  usedQuestions,
  MAX_RETRY_ATTEMPTS,
} from "./websocketHandlers/connection";
import { getCurrentQuestion } from "./cache";

const WSCONNECTIONS = new Map();

function clearQuestionCache() {
  usedQuestions.clear();
  console.log("Question cache cleared");
}

async function broadcastCurrentQuestion(code: string) {
  const question = await getCurrentQuestion(code);
  if (!question) return;

  // Send to all connections
  connections.forEach((peer: any) => {
    peer.send(
      JSON.stringify({
        type: "SYNC_QUESTION",
        payload: question,
      })
    );
  });
}

export default eventHandler({
  handler() {},
  websocket: {
    async open(peer) {
      connections.set(peer.id, peer);
      console.log("Connected:", peer.id);
    },

    async message(peer, msg) {
      try {
        const data = JSON.parse(msg.text());

        switch (data.type) {
          case "REGISTER_ROLE": {
            const { role } = data.payload;
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
                MAX_RETRY_ATTEMPTS: 5,
                peers: {
                  presenter: peer.id,
                },
              };
              WSCONNECTIONS.set(peer.id, peer);
              let cacheData = await cache.set(code as string, cacheEntry);
            } else if (role === "viewer") {
              console.log("Accepting viewer: ", peer.id);
              // Check for existing presenter
              if (data.payload.code !== null && data.payload.code !== "") {
                // Check if presenter of same code exists
                const cacheDataOG = cache.get(data.payload.code);
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
                WSCONNECTIONS.set(peer.id, peer);
                cache.set(data.payload.code, newData);
                console.log("New Data: ", cache.get(data.payload.code));
                let currQuest = "";
                if (cacheDataOG.currentQuestion)
                  currQuest = cacheDataOG.currentQuestion; // If cache has a current question, send it
                // Send back the code
                await peer.send(
                  JSON.stringify({
                    type: "RECEIVE_CONNECTION_CODE",
                    payload: {
                      code: data.payload.code,
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
            break;
          }

          case "REQUEST_NEW_QUESTION": {
            // ! TODO: Only allow viewers to request new questions
            // if (!viewers.has(peer.id)) {
            //   peer.send(
            //     JSON.stringify({
            //       type: "SYNC_QUESTION",
            //       payload: 403,
            //     })
            //   );
            //   return;
            // }

            // Check if connection code exists
            const { code } = data.payload;
            if (code === null || code === "") {
              peer.send(
                JSON.stringify({
                  type: "SYNC_QUESTION",
                  payload: 403,
                })
              );
              return;
            }

            // Check if code even exists in cache
            const cacheData = cache.get(code);
            const cD = {
              ...cacheData,
            };
            if (!cacheData) {
              console.log("Cache with provided code does not exist");
              peer.send(
                JSON.stringify({
                  type: "SYNC_QUESTION",
                  payload: 403,
                })
              );
              return;
            }

            // If code passes all checks, send a new question to both presenters and viewers
            const question = await getUniqueRandomQuestion(code);
            if (question === "too many attempts") {
              peer.send(
                JSON.stringify({
                  type: "SYNC_QUESTION",
                  payload: 508,
                })
              );
            } else {
              let viewerPeer = WSCONNECTIONS.get(cD.peers.viewer);
              let presenterPeer = WSCONNECTIONS.get(cD.peers.presenter);
              // Broadcast to presenter and viewer of the same code
              viewerPeer.send(
                JSON.stringify({
                  type: "SYNC_QUESTION",
                  payload: question,
                })
              );
              presenterPeer.send(
                JSON.stringify({
                  type: "SYNC_QUESTION",
                  payload: question,
                })
              );
            }
            break;
          }

          case "REVEAL_CARD": {
            if (!viewers.has(peer.id)) return;

            // Broadcast to all presenters
            presenters.forEach((presenterId: any) => {
              const presenterPeer = connections.get(presenterId);
              if (presenterPeer) {
                presenterPeer.send(
                  JSON.stringify({
                    type: "REVEAL_CARD",
                    payload: { cardName: data.payload.cardName },
                  })
                );
              }
            });
            break;
          }

          case "CLEAR_QUESTION_CACHE": {
            if (!viewers.has(peer.id)) return;
            clearQuestionCache();
            break;
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },

    async close(peer) {
      connections.delete(peer.id);
      presenters.delete(peer.id);
      viewers.delete(peer.id);
      console.log("Disconnected:", peer.id);
    },
  },
});
