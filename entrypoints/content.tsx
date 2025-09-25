export default defineContentScript({
  matches: ["*://www.acmicpc.net/*", "*://acmicpc.net/*"],
  async main() {
    console.log("Injecting script...");

    await injectScript("/main-world-script.js", {
      keepInDom: true,
    });

    console.log("Done!");
  },
});
