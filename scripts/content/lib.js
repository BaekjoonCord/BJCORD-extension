function getHandle() {
  const element = document.querySelector("a.username");
  if (!element) {
    console.error(
      "handle을 불러오지 못했습니다 : 필요한 요소를 찾을 수 없습니다."
    );
    return null;
  }

  const handle = element.innerText?.trim();
  if (!handle) {
    console.error("handle을 불러오지 못했습니다 : 로그인되지 않았습니다.");
    return null;
  }

  return handle;
}
