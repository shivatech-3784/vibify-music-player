let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

async function getsongs(folder) {
    currFolder = folder;
    let response = await fetch(`/${currFolder}/playlist.json`);
    let data = await response.json();
    songs = data.songs;

    let songul = document.querySelector(".songslist ul");
    songul.innerHTML = "";

    for (const song of songs) {
        songul.innerHTML += `<li><img class="invert" src="images/music.svg" alt="music">
            <div class="songinfo">
              <div>${song}</div>
              <div>artist name</div>
            </div>
            <div class="playnow flex items-center">
              <span>Play Now</span>
              <img class="invert" src="images/play.svg" alt="">
            </div> </li>`;
    }

    Array.from(document.querySelector(".songslist li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".songinfo").firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "images/pause.svg";
    }
    document.querySelector(".songsinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

async function Displayalbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").splice(-1)[0];
            let res = await fetch(`/songs/${folder}/playlist.json`);
            let data = await res.json();
            cardcontainer.innerHTML += `<div data-folder = "${folder}" class="card"> 
                <img class="playbutton" src="images/playbutton.svg" alt="playbutton">
                <img src="/songs/${folder}/cover.jpg" alt="${folder}">
                <h4 class="font-2 tag">${data.title}</h4>
                <p class="font-3">${data.description}</p>
              </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0], false);
        });
    });
}

async function main() {
    await getsongs("songs/happyhits");
    playMusic(songs[0], true);

    Displayalbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "images/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    currentSong.addEventListener("ended", () => {
        play.src = "images/play.svg";
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    prev.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0]);
        if (index + 1 < songs.length) {
            currentSong.pause();
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
        document.querySelector(".volume img").src = currentSong.volume === 0 ? "images/voldown.svg" : "images/volume.svg";
    });

    let previousVolume = 1;
    document.querySelector(".volume img").addEventListener("click", e => {
        if (currentSong.volume > 0) {
            previousVolume = currentSong.volume;
            currentSong.volume = 0;
            e.target.src = "images/voldown.svg";
            document.querySelector(".range input").value = 0;
        } else {
            currentSong.volume = previousVolume;
            e.target.src = "images/volume.svg";
            document.querySelector(".range input").value = previousVolume * 100;
        }
    });
}

main();