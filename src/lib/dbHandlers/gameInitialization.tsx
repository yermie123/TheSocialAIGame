import { pool } from "../database";

const gameEventInitialization = async () => {
  // Create a new game event
  let result: any = await pool.query("CALL game_events_insert($1)", [null]);

  console.log(
    "Generated connection code:",
    await result.rows[0].p_connection_code
  );
  return result.rows[0].p_connection_code;
};

export { gameEventInitialization };
