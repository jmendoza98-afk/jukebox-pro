import db from "#db/client";

export async function createPlaylistTrack(playlistId, trackId) {
  const sql = `
  INSERT INTO playlists_tracks
    (playlist_id, track_id)
  VALUES
    ($1, $2)
  RETURNING *
  `;
  const {
    rows: [playlistTrack],
  } = await db.query(sql, [playlistId, trackId]);
  return playlistTrack;
}

export async function getTracksInPlaylist(playlistId) {
  const { rows } = await db.query(
    `SELECT tracks.*
     FROM playlists_tracks
     JOIN tracks ON tracks.id = playlists_tracks.track_id
     WHERE playlists_tracks.playlist_id = $1`,
    [playlistId]
  );
  return rows;
}

export async function addTrackToPlaylist(playlistId, trackId) {
  const { rows } = await db.query(
    `INSERT INTO playlists_tracks (playlist_id, track_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [playlistId, trackId]
  );
  return rows[0]; 
}
