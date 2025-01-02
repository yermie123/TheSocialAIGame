"use server";

import { eventHandler } from "vinxi/http";
import { getUniqueRandomQuestion } from "./dbHandlers/gameQuestions";
import cache from "./cache";
import registerRole from "./websocketHandlers/registerRole";

import { usedQuestions } from "./websocketHandlers/connection";
import { getCurrentQuestion } from "./cache";

const WSCONNECTIONS = new Map();

function clearQuestionCache() {
  usedQuestions.clear();
  console.log("Question cache cleared");
}

export default eventHandler({
  handler() {},
  websocket: {
    async open(peer) {
      WSCONNECTIONS.set(peer.id, peer);
      console.log("Connected:", peer.id);
    },

    async message(peer, msg) {
      try {
        const data = JSON.parse(msg.text());

        switch (data.type) {
          case "REGISTER_ROLE": {
            const { role } = data.payload;
            registerRole(peer, role, WSCONNECTIONS, data.payload);
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
            // if (!viewers.has(peer.id)) return;

            // Broadcast to all presenters
            // presenters.forEach((presenterId: any) => {
            //   const presenterPeer = WSCONNECTIONS.get(presenterId);
            //   if (presenterPeer) {
            //     presenterPeer.send(
            //       JSON.stringify({
            //         type: "REVEAL_CARD",
            //         payload: { cardName: data.payload.cardName },
            //       })
            //     );
            //   }
            // });
            break;
          }

          case "CLEAR_QUESTION_CACHE": {
            // if (!viewers.has(peer.id)) return;
            clearQuestionCache();
            break;
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },

    async close(peer) {
      WSCONNECTIONS.delete(peer.id);
      console.log("Disconnected:", peer.id);
    },
  },
});
