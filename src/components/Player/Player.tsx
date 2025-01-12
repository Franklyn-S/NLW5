import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePlayer } from "../../context/PlayerContext";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import styles from "./styles.module.scss";
import { convertDurationToTimeString } from "../../utils/date";

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  const {
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    togglePlay,
    setIsPlayingState,
    playNext,
    playPrevious,
    hasPrevious,
    hasNext,
    isLooping,
    toggleLoop,
    toggleShuffle,
    isShuffling,
    clearPlayerState,
  } = usePlayer();

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const episode = episodeList[currentEpisodeIndex];

  function setupProgressListener() {
    audioRef.current.currentTime = 0;
    audioRef.current.addEventListener("timeupdate", () =>
      setProgress(Math.floor(audioRef.current.currentTime))
    );
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if (hasNext) {
      playNext();
    } else {
      clearPlayerState();
    }
  }

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src='/playing.svg' alt='Tocando agora' />
        <strong>Tocando agora</strong>
      </header>

      {episode ? (
        <div className={styles.currentEpisode}>
          <Image
            width={592}
            height={592}
            src={episode.thumbnail}
            objectFit={"cover"}
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ""}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            {episode ? (
              <Slider
                trackStyle={{ backgroundColor: "#04d361" }}
                railStyle={{ backgroundColor: "#9f75ff" }}
                handleStyle={{ borderColor: "#04d361", borderWidth: 4 }}
                max={episode.file.duration}
                value={progress}
                onChange={handleSeek}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          <span>{convertDurationToTimeString(episode?.file.duration ?? 0)}</span>
        </div>

        {episode && (
          <audio
            ref={audioRef}
            src={episode.file.url}
            autoPlay
            loop={isLooping}
            onEnded={handleEpisodeEnded}
            onPlay={() => setIsPlayingState(true)}
            onPause={() => setIsPlayingState(false)}
            onLoadedMetadata={setupProgressListener}
          />
        )}

        <div className={styles.buttons}>
          <button
            type='button'
            disabled={!episode || episodeList.length === 1}
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ""}
          >
            <img src='/shuffle.svg' alt='Aleatório' />
          </button>
          <button type='button' disabled={!episode || !hasPrevious}>
            <img src='/play-previous.svg' alt='Anterior' onClick={playPrevious} />
          </button>
          <button
            type='button'
            className={styles.playButton}
            disabled={!episode}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <img src='/pause.svg' alt='Tocar' />
            ) : (
              <img src='/play.svg' alt='Tocar' />
            )}
          </button>
          <button type='button' disabled={!episode || !hasNext} onClick={playNext}>
            <img src='/play-next.svg' alt='Próxima' />
          </button>
          <button
            type='button'
            disabled={!episode}
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ""}
          >
            <img src='/repeat.svg' alt='Repetir' />
          </button>
        </div>
      </footer>
    </div>
  );
}
