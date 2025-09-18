export default function PopupTitle() {
  return (
    <div className="flex flex-col">
      <div className="flex gap-2 justify-center items-center p-4 select-none">
        <img src="/thumbnail.png" alt="Thumbnail" className="w-10 h-10" />
        <h1 className="text-2xl font-semibold">BJCORD</h1>
      </div>

      <a
        href="https://github.com/BaekjoonCord/BJCORD-extension/blob/main/README.md"
        target="_blank"
        rel="noreferrer"
        className="text-sm underline underline-offset-2 text-center"
      >
        사용법 안내
      </a>
    </div>
  );
}
