import { pool } from "../database";

interface Teams {
  team1: {
    teamName: string;
    teamColor: string;
    players: {
      [key: string]: number;
    };
  };
  team2: {
    teamName: string;
    teamColor: string;
    players: {
      [key: string]: number;
    };
  };
}
const gameEventTeamChange = async (
  teams: Teams,
  id?: string,
  connectionCode?: string
) => {
  // Make sure that either id or connectionCode is provided
  if (!id && !connectionCode) {
    return "error";
  }
  // Update the teams in the database
  if (id) {
    try {
      const result = await pool.query({
        text: `
                    UPDATE game_events
                    SET team1 = $1, team2 = $2
                    WHERE id = $3
                `,
        values: [teams.team1, teams.team2, id],
      });
      return result;
    } catch (error) {
      console.log(error);
      return "error";
    }
  } else if (connectionCode) {
    try {
      const result = await pool.query({
        text: `
                    UPDATE game_events
                    SET team1 = $1, team2 = $2
                    WHERE connection_code = $3
                `,
        values: [teams.team1, teams.team2, connectionCode],
      });
      return result;
    } catch (error) {
      console.log(error);
      return "error";
    }
  }
};

export type { Teams };
export { gameEventTeamChange };
