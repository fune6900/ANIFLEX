export interface AnimeGenre {
  id: number;
  name: string;
  emoji: string;
  color: string; // Tailwind グラデーションクラス（ヘッダー用）
}

export const ANIME_GENRES: AnimeGenre[] = [
  { id: 10759, name: "アクション・冒険", emoji: "⚔️",  color: "from-red-950 via-red-900 to-orange-950" },
  { id: 35,    name: "コメディ",        emoji: "😄",  color: "from-yellow-950 via-amber-900 to-yellow-950" },
  { id: 18,    name: "ドラマ",          emoji: "🎭",  color: "from-blue-950 via-blue-900 to-indigo-950" },
  { id: 10765, name: "SF・ファンタジー", emoji: "🔮",  color: "from-purple-950 via-violet-900 to-indigo-950" },
  { id: 9648,  name: "ミステリー",      emoji: "🔍",  color: "from-slate-900 via-gray-800 to-zinc-950" },
  { id: 10751, name: "ファミリー",      emoji: "🏠",  color: "from-green-950 via-emerald-900 to-teal-950" },
  { id: 10762, name: "キッズ",          emoji: "⭐",  color: "from-cyan-950 via-sky-900 to-blue-950" },
  { id: 10768, name: "戦争・政治",      emoji: "🗡️",  color: "from-zinc-900 via-stone-800 to-neutral-950" },
];

export function findGenre(id: number): AnimeGenre | undefined {
  return ANIME_GENRES.find((g) => g.id === id);
}
