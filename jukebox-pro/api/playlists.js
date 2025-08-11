import express from "express";
const router = express.Router();
export default router;

import {
  createPlaylist,
  getPlaylistById,
  getPlaylists,
} from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { getTracksByPlaylistId } from "#db/queries/tracks";
import { getPlaylistById } from "../db/queries/playlists.js";
import { getTracksInPlaylist } from "../db/queries/playlists_tracks.js";
import { getUserFromToken } from "../middleware/getUserFromToken.js";
import { requireUser } from "../middleware/requireUser.js";
import { addTrackToPlaylist } from "../db/queries/playlists_tracks.js";

router
  .route("/")
  .get(async (req, res) => {
    const playlists = await getPlaylists();
    res.send(playlists);
  })
  .post(async (req, res) => {
    if (!req.body) return res.status(400).send("Request body is required.");

    const { name, description } = req.body;
    if (!name || !description)
      return res.status(400).send("Request body requires: name, description");

    const playlist = await createPlaylist(name, description);
    res.status(201).send(playlist);
  });

router.param("id", async (req, res, next, id) => {
  const playlist = await getPlaylistById(id);
  if (!playlist) return res.status(404).send("Playlist not found.");

  req.playlist = playlist;
  next();
});

router.route("/:id").get((req, res) => {
  res.send(req.playlist);
});

router.use(getUserFromToken);
router.use(requireUser);

router
  .route("/:id/tracks")
  .get(async (req, res) => {
    const tracks = await getTracksByPlaylistId(req.playlist.id);
    res.send(tracks);
  })
  .post(async (req, res) => {
    if (!req.body) return res.status(400).send("Request body is required.");

    const { trackId } = req.body;
    if (!trackId) return res.status(400).send("Request body requires: trackId");

    const playlistTrack = await createPlaylistTrack(req.playlist.id, trackId);
    res.status(201).send(playlistTrack);

    try {
      const playlist = await getPlaylistById(playlistId);
  
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }
  
      if (playlist.owner_id !== userId) {
        return res.status(403).json({ error: "Forbidden: You do not own this playlist" });
      }
  
      const tracks = await getTracksInPlaylist(playlistId);
      res.json(tracks);
    } catch (err) {
      console.error("Error fetching tracks:", err);
      res.status(500).json({ error: "Internal server error" });
    }
    const added = await addTrackToPlaylist(playlistId, trackId);

    if (!added) {
      return res.status(409).json({ error: "Track already in playlist" });
    }

    res.status(201).json({ message: "Track added", entry: added });
    
  });
