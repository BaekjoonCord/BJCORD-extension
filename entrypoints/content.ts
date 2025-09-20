export default defineContentScript({
  matches: ["*://acmicpc.net/*"],
  main() {
    console.log("Hello content.");
  },
});
