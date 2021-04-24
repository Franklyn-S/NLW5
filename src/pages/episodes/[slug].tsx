import Head from "next/head";
import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/Link";
import { api } from "../../services/api";
import { convertDurationToTimeString } from "../../utils/date";
import { useRouter } from "next/router";
import { usePlayer } from "../../context/PlayerContext";

import styles from "./episodes.module.scss";

type file = {
  url: string;
  type: "string";
  duration: number;
  durationAsString: string;
};

type Episode = {
  id: string;
  title: string;
  publishedAt: string;
  members: string;
  thumbnail: string;
  description: string;
  file: file;
};

type EpisodeProps = {
  episode: Episode;
};

export default function Episode({ episode }: EpisodeProps) {
  //const router = useRouter();
  //if (router.isFallback) {
  //  return <p>Carregando...</p>;
  //}

  const { play } = usePlayer();

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title} | Podcastr</title>
      </Head>
      <div className={styles.thumbnailContainer}>
        <Link href='/'>
          <button type='button'>
            <img src='/arrow-left.svg' alt='Voltar' />
          </button>
        </Link>
        <Image width={700} height={160} src={episode.thumbnail} objectFit='cover' />
        <button type='button' onClick={() => play(episode)}>
          <img src='/play.svg' alt='Tocar episódio' />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.file.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get("episodes", {
    params: {
      _limit: 2,
      _sort: "published_at",
      _order: "desc",
    },
  });

  const paths = data.map(episode => {
    return {
      params: {
        slug: episode.id,
      },
    };
  });
  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ctx => {
  const { slug } = ctx.params;

  const { data } = await api.get(`/episodes/${slug}`);
  console.log(data);

  const episode = {
    ...data,
    publishedAt: format(parseISO(data.published_at), "d MMM yy", {
      locale: ptBR,
    }),
    file: {
      ...data.file,
      duration: Number(data.file.duration),
      durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    },
  };
  return {
    props: { episode },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};
