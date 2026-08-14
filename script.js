// ==========================================
// ADFREE MUSIC - SCRIPT.JS
// ==========================================


// ==========================================
// SONG DATABASE
// ==========================================

let songs = [];


// ==========================================
// PLAYER STATE
// ==========================================

let currentSongIndex = 0;

let isPlaying = false;

let shuffleEnabled = false;

let repeatMode = false;

let hasSong = false;


// ==========================================
// AUDIO PLAYER
// ==========================================

const audio = new Audio();


// ==========================================
// HTML ELEMENTS
// ==========================================

const songList =
    document.getElementById("songList");

const currentTitle =
    document.getElementById("currentTitle");

const currentArtist =
    document.getElementById("currentArtist");

const playButton =
    document.getElementById("playButton");

const searchInput =
    document.getElementById("search");

const progressBar =
    document.getElementById("progressBar");

const volumeBar =
    document.getElementById("volumeBar");

const shuffleButton =
    document.getElementById("shuffleButton");

const repeatButton =
    document.getElementById("repeatButton");


// ==========================================
// FAVORITES
// ==========================================

let favorites =
    JSON.parse(
        localStorage.getItem(
            "akMusicHubFavorites"
        )
    ) || [];


// ==========================================
// PLAYLIST
// ==========================================

let playlist =
    JSON.parse(
        localStorage.getItem(
            "akMusicHubPlaylist"
        )
    ) || [];


// ==========================================
// VOLUME
// ==========================================

const savedVolume =
    localStorage.getItem(
        "adfreeVolume"
    );


if (savedVolume !== null) {

    audio.volume =
        Number(savedVolume);

    volumeBar.value =
        Number(savedVolume) * 100;

}

else {

    audio.volume = 0.7;

    volumeBar.value = 70;

}


// ==========================================
// SECURITY HELPERS
// ==========================================

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(text) {

    return String(text)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(seconds) {

    if (
        !seconds ||
        isNaN(seconds)
    ) {

        return "00:00";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        Math.floor(
            seconds % 60
        );


    return (

        String(minutes)
            .padStart(2, "0")

        +

        ":" +

        String(
            remainingSeconds
        ).padStart(2, "0")

    );

}


// ==========================================
// LOAD SONGS FROM SERVER
// ==========================================

async function loadSongs() {

    try {

        const response =
            await fetch(
                "/api/songs"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load songs"
            );

        }


        const musicFiles =
            await response.json();


        songs =
            musicFiles.map(song => {

                return {

                    title:
                        song.title,

                    artist:
                        song.artist ||
                        "AdFree Music",

                    file:
                        song.file,

                    cover:
                        song.cover || null

                };

            });


        console.log(
            "Songs loaded:",
            songs
        );


        displaySongs();

    }

    catch (error) {

        console.error(
            "Error loading songs:",
            error
        );


        songList.innerHTML = `

            <p style="color:#888;">

                Unable to load music 🎵

            </p>

        `;

    }

}


// ==========================================
// DISPLAY SONGS
// ==========================================

function displaySongs(
    songArray = songs
) {

    songList.innerHTML = "";


    if (
        songArray.length === 0
    ) {

        songList.innerHTML = `

            <p style="color:#888;">

                No songs here yet 🎵

            </p>

        `;

        return;

    }


    songArray.forEach(
        song => {

            const index =
                songs.indexOf(song);


            const songCard =
                document.createElement(
                    "div"
                );


            songCard.className =
                "song";


            // Currently playing

            if (
                hasSong &&
                index === currentSongIndex
            ) {

                songCard.classList.add(
                    "playing"
                );

            }


            // Favorite status

            const isFavorite =
                favorites.includes(
                    song.file
                );


            // Playlist status

            const isInPlaylist =
                playlist.includes(
                    song.file
                );


            // Cover

            let coverHTML;


            if (song.cover) {

                coverHTML = `

                    <img
                        src="${song.cover}"
                        alt="${escapeHTML(
                            song.title
                        )} cover"
                    >

                `;

            }

            else {

                coverHTML = "🎵";

            }


            // Card HTML

            songCard.innerHTML = `

                <div class="cover">

                    ${coverHTML}

                </div>


                <h3>

                    ${escapeHTML(
                        song.title
                    )}

                </h3>


                <p>

                    ${escapeHTML(
                        song.artist
                    )}

                </p>


                <button

                    class="playlist-button"

                    data-file="${escapeAttribute(
                        song.file
                    )}"

                    title="Add to Playlist"

                >

                    ${
                        isInPlaylist
                            ? "✓"
                            : "+"
                    }

                </button>


                <button

                    class="favorite-button"

                    data-file="${escapeAttribute(
                        song.file
                    )}"

                    title="Favorite"

                >

                    ${
                        isFavorite
                            ? "❤️"
                            : "♡"
                    }

                </button>


                <button

                    class="play-song-button"

                    title="Play"

                >

                    ▶

                </button>

            `;


            // Play button

            const playSongButton =
                songCard.querySelector(
                    ".play-song-button"
                );


            playSongButton.addEventListener(
                "click",
                () => {

                    playSong(index);

                }
            );


            // Favorite button

            const favoriteButton =
                songCard.querySelector(
                    ".favorite-button"
                );


            favoriteButton.addEventListener(
                "click",
                () => {

                    toggleFavorite(
                        song.file
                    );

                }
            );


            // Playlist button

            const playlistButton =
                songCard.querySelector(
                    ".playlist-button"
                );


            playlistButton.addEventListener(
                "click",
                () => {

                    togglePlaylist(
                        song.file
                    );

                }
            );


            songList.appendChild(
                songCard
            );

        }
    );

}


// ==========================================
// UPDATE CURRENT SONG COVER
// ==========================================

function updatePlayerCover(song) {

    const coverContainer =
        document.querySelector(
            ".small-cover"
        );


    if (!coverContainer) {

        return;

    }


    if (song.cover) {

        coverContainer.innerHTML = `

            <img
                src="${song.cover}"
                alt="${escapeHTML(
                    song.title
                )} cover"
            >

        `;

    }

    else {

        coverContainer.innerHTML =
            "🎵";

    }

}


// ==========================================
// PLAY SONG
// ==========================================

function playSong(index) {

    if (
        songs.length === 0
    ) {

        return;

    }


    if (
        index < 0 ||
        index >= songs.length
    ) {

        return;

    }


    currentSongIndex =
        index;


    const song =
        songs[
            currentSongIndex
        ];


    // Set audio

    audio.src =
        song.file;


    audio.load();


    // Update player text

    currentTitle.textContent =
        song.title;


    currentArtist.textContent =
        song.artist;


    // Update cover

    updatePlayerCover(
        song
    );


    // Reset progress

    progressBar.value = 0;


    hasSong = true;


    // Play

    audio.play()
        .then(() => {

            isPlaying = true;

            playButton.textContent =
                "⏸";


            displaySongs();

        })

        .catch(error => {

            console.error(
                "Unable to play:",
                error
            );

        });

}


// ==========================================
// PLAY EVENT
// ==========================================

audio.addEventListener(
    "play",
    () => {

        isPlaying = true;

        playButton.textContent =
            "⏸";


        displaySongs();

    }
);


// ==========================================
// PAUSE EVENT
// ==========================================

audio.addEventListener(
    "pause",
    () => {

        isPlaying = false;

        playButton.textContent =
            "▶";

    }
);


// ==========================================
// PLAY / PAUSE BUTTON
// ==========================================

playButton.addEventListener(
    "click",
    () => {

        if (!hasSong) {

            if (
                songs.length > 0
            ) {

                playSong(
                    currentSongIndex
                );

            }

            return;

        }


        if (audio.paused) {

            audio.play();

        }

        else {

            audio.pause();

        }

    }
);


// ==========================================
// NEXT SONG
// ==========================================

function nextSong() {

    if (
        songs.length === 0
    ) {

        return;

    }


    // Shuffle

    if (shuffleEnabled) {

        if (
            songs.length === 1
        ) {

            playSong(0);

            return;

        }


        let randomIndex;


        do {

            randomIndex =
                Math.floor(
                    Math.random() *
                    songs.length
                );

        }

        while (
            randomIndex ===
            currentSongIndex
        );


        playSong(
            randomIndex
        );


        return;

    }


    // Normal next

    currentSongIndex++;


    if (
        currentSongIndex >=
        songs.length
    ) {

        currentSongIndex = 0;

    }


    playSong(
        currentSongIndex
    );

}


// ==========================================
// PREVIOUS SONG
// ==========================================

function previousSong() {

    if (
        songs.length === 0
    ) {

        return;

    }


    // Restart current song

    if (
        audio.currentTime > 3
    ) {

        audio.currentTime = 0;

        return;

    }


    currentSongIndex--;


    if (
        currentSongIndex < 0
    ) {

        currentSongIndex =
            songs.length - 1;

    }


    playSong(
        currentSongIndex
    );

}


// ==========================================
// SONG ENDED
// ==========================================

audio.addEventListener(
    "ended",
    () => {

        if (repeatMode) {

            audio.currentTime = 0;

            audio.play();

            return;

        }


        nextSong();

    }
);


// ==========================================
// SHUFFLE
// ==========================================

if (shuffleButton) {

    shuffleButton.addEventListener(
        "click",
        () => {

            shuffleEnabled =
                !shuffleEnabled;


            shuffleButton.classList.toggle(
                "active",
                shuffleEnabled
            );


            shuffleButton.title =
                shuffleEnabled
                    ? "Shuffle ON"
                    : "Shuffle OFF";

        }
    );

}


// ==========================================
// REPEAT
// ==========================================

if (repeatButton) {

    repeatButton.addEventListener(
        "click",
        () => {

            repeatMode =
                !repeatMode;


            repeatButton.classList.toggle(
                "active",
                repeatMode
            );


            repeatButton.title =
                repeatMode
                    ? "Repeat ON"
                    : "Repeat OFF";

        }
    );

}


// ==========================================
// PROGRESS
// ==========================================

audio.addEventListener(
    "timeupdate",
    () => {

        if (
            !audio.duration ||
            isNaN(audio.duration)
        ) {

            return;

        }


        progressBar.value =

            (
                audio.currentTime /
                audio.duration
            ) * 100;


        const currentTimeElement =
            document.getElementById(
                "currentTime"
            );


        const durationElement =
            document.getElementById(
                "duration"
            );


        if (
            currentTimeElement
        ) {

            currentTimeElement.textContent =
                formatTime(
                    audio.currentTime
                );

        }


        if (
            durationElement
        ) {

            durationElement.textContent =
                formatTime(
                    audio.duration
                );

        }

    }
);


// ==========================================
// SEEK
// ==========================================

if (progressBar) {

    progressBar.addEventListener(
        "input",
        () => {

            if (
                !audio.duration ||
                isNaN(audio.duration)
            ) {

                return;

            }


            audio.currentTime =

                (
                    progressBar.value /
                    100
                ) *
                audio.duration;

        }
    );

}


// ==========================================
// VOLUME
// ==========================================

if (volumeBar) {

    volumeBar.addEventListener(
        "input",
        () => {

            const volume =
                volumeBar.value / 100;


            audio.volume =
                volume;


            localStorage.setItem(
                "adfreeVolume",
                volume
            );

        }
    );

}


// ==========================================
// SEARCH
// ==========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            const searchText =
                searchInput.value
                    .toLowerCase()
                    .trim();


            const filteredSongs =
                songs.filter(
                    song => {

                        return (

                            song.title
                                .toLowerCase()
                                .includes(
                                    searchText
                                )

                            ||

                            song.artist
                                .toLowerCase()
                                .includes(
                                    searchText
                                )

                        );

                    }
                );


            displaySongs(
                filteredSongs
            );

        }
    );

}


// ==========================================
// FAVORITES
// ==========================================

function toggleFavorite(file) {

    const position =
        favorites.indexOf(
            file
        );


    if (
        position === -1
    ) {

        favorites.push(
            file
        );

    }

    else {

        favorites.splice(
            position,
            1
        );

    }


    saveFavorites();

    displaySongs();

}


// ==========================================
// SAVE FAVORITES
// ==========================================

function saveFavorites() {

    localStorage.setItem(
        "akMusicHubFavorites",
        JSON.stringify(
            favorites
        )
    );

}


// ==========================================
// SHOW FAVORITES
// ==========================================

function showFavorites() {

    const favoriteSongs =
        songs.filter(
            song =>

                favorites.includes(
                    song.file
                )

        );


    displaySongs(
        favoriteSongs
    );

}


// ==========================================
// PLAYLIST
// ==========================================

function togglePlaylist(file) {

    const position =
        playlist.indexOf(
            file
        );


    if (
        position === -1
    ) {

        playlist.push(
            file
        );

    }

    else {

        playlist.splice(
            position,
            1
        );

    }


    savePlaylist();

    displaySongs();

}


// ==========================================
// SAVE PLAYLIST
// ==========================================

function savePlaylist() {

    localStorage.setItem(
        "adfreePlaylist",
        JSON.stringify(
            playlist
        )
    );

}


// ==========================================
// SHOW PLAYLIST
// ==========================================

function showPlaylist() {

    const playlistSongs =
        songs.filter(
            song =>

                playlist.includes(
                    song.file
                )

        );


    displaySongs(
        playlistSongs
    );

}


// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

const sidebarLinks =
    document.querySelectorAll(
        ".sidebar nav a"
    );


// HOME

if (sidebarLinks[0]) {

    sidebarLinks[0].addEventListener(
        "click",
        event => {

            event.preventDefault();


            if (searchInput) {

                searchInput.value = "";

            }


            displaySongs();

        }
    );

}


// SEARCH

if (sidebarLinks[1]) {

    sidebarLinks[1].addEventListener(
        "click",
        event => {

            event.preventDefault();


            if (searchInput) {

                searchInput.focus();

            }

        }
    );

}


// YOUR LIBRARY

if (sidebarLinks[2]) {

    sidebarLinks[2].addEventListener(
        "click",
        event => {

            event.preventDefault();

            showFavorites();

        }
    );

}


// ==========================================
// PLAYLIST SIDEBAR
// ==========================================

const playlistItems =
    document.querySelectorAll(
        ".playlists p"
    );


// MY PLAYLIST

if (playlistItems[0]) {

    playlistItems[0].addEventListener(
        "click",
        () => {

            showPlaylist();

        }
    );

}


// FAVORITES

if (playlistItems[1]) {

    playlistItems[1].addEventListener(
        "click",
        () => {

            showFavorites();

        }
    );

}


// CHILL

if (playlistItems[2]) {

    playlistItems[2].addEventListener(
        "click",
        () => {

            alert(
                "Chill playlist coming soon 🌙"
            );

        }
    );

}


// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

document.addEventListener(
    "keydown",
    event => {

        // Don't trigger shortcuts
        // while typing in search

        if (
            document.activeElement ===
            searchInput
        ) {

            return;

        }


        // Space = Play/Pause

        if (
            event.code === "Space"
        ) {

            event.preventDefault();

            playButton.click();

        }


        // Right Arrow = Next

        if (
            event.code === "ArrowRight"
        ) {

            nextSong();

        }


        // Left Arrow = Previous

        if (
            event.code === "ArrowLeft"
        ) {

            previousSong();

        }

    }
);


// ==========================================
// START APPLICATION
// ==========================================

loadSongs();