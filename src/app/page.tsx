export default function Home() {
  return (
    <div className="text-center py-20">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">
        アニメ・声優を検索しよう
      </h2>
      <p className="text-gray-500 text-lg mb-8">
        TMDb APIを使ったアニメと声優の検索アプリです。
      </p>
      <div className="flex gap-4 justify-center">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 w-48">
          <div className="text-3xl mb-2">🎬</div>
          <h3 className="font-semibold text-blue-800">アニメ検索</h3>
          <p className="text-sm text-blue-600 mt-1">Coming soon</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 w-48">
          <div className="text-3xl mb-2">🎤</div>
          <h3 className="font-semibold text-purple-800">声優検索</h3>
          <p className="text-sm text-purple-600 mt-1">Coming soon</p>
        </div>
      </div>
    </div>
  );
}
