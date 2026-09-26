export function mountRoles(): void {
  const instruction = document.getElementById("role-instruction")!;
  const next = document.getElementById("role-next") as HTMLAnchorElement;
  for (const role of ["organizer", "holder"] as const) {
    document.getElementById(`role-${role}`)!.addEventListener("click", () => {
      for (const id of ["organizer", "holder"]) document.getElementById(`role-${id}`)!.setAttribute("aria-pressed", String(id === role));
      instruction.textContent = role === "organizer"
        ? "주최자: 계약·네트워크·전달 채널을 정하고 비밀값은 비공개로 전달하세요. 실제 배포에는 지갑 승인이 필요합니다. 아래 공개 확인 예제는 앱이 고정한 별도 계약이며 새 배포가 자동 등록되지 않습니다."
        : "소지자: 받은 계약 주소·네트워크를 확인하고 자기 환경에서만 비밀값을 입력하세요. 실제 claim에는 지갑 승인이 필요합니다. 확인자에게 비밀값을 전달하지 마세요.";
      next.href = role === "organizer" ? "#network-title" : "#network-address";
      next.textContent = role === "organizer" ? "주최자 배포 실험으로 이동" : "소지자 계약 확인·사용으로 이동";
    });
  }
}
