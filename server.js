const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;


// ==========================================
// SERVE WEBSITE FILES
// ==========================================

app.use(
    express.static(__dirname)
);


// ==========================================
// SERVE MUSIC + COVER FILES
// ==========================================

app.use(
    "/music",
    express.static(
        path.join(__dirname, "music")
    )
);


// ==========================================
// SONG API
// ==========================================

app.get(
    "/api/songs",
    (req, res) => {

        const musicFolder =
            path.join(
                __dirname,
                "music"
            );


        fs.readdir(
            musicFolder,
            (err, files) => {

                if (err) {

                    return res
                        .status(500)
                        .json({

                            error:
                                "Unable to read music folder"

                        });

                }


                const songs =
                    files

                        .filter(
                            file =>
                                file
                                    .toLowerCase()
                                    .endsWith(".mp3")
                        )

                        .map(
                            file => {

                                const baseName =
                                    file.replace(
                                        /\.mp3$/i,
                                        ""
                                    );


                                // ==================================
                                // FIND MATCHING COVER
                                // ==================================

                                const possibleCovers = [

                                    `${baseName}.jpg`,

                                    `${baseName}.jpeg`,

                                    `${baseName}.png`,

                                    `${baseName}.webp`

                                ];


                                let coverFile =
                                    null;


                                for (
                                    const cover
                                    of possibleCovers
                                ) {

                                    if (
                                        files.includes(
                                            cover
                                        )
                                    ) {

                                        coverFile =
                                            cover;

                                        break;

                                    }

                                }


                                return {

                                    title:
                                        baseName
                                            .replace(
                                                /[-_]/g,
                                                " "
                                            ),

                                    artist:
                                        "AK MusicHub",

                                    file:
                                        `/music/${encodeURIComponent(
                                            file
                                        )}`,

                                    cover:
                                        coverFile
                                            ? `/music/${encodeURIComponent(
                                                coverFile
                                            )}`
                                            : null

                                };

                            }
                        );


                res.json(
                    songs
                );

            }
        );

    }
);


// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    () => {

        console.log(
            `AK MusicHub running at http://localhost:${PORT}`
        );

    }
);