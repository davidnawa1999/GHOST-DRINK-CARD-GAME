/* ================= BRIDGE LAYER =================
   ตัวเชื่อม Menu → Core Game
   ไม่มี UI
   ไม่มี logic ใหม่
   แค่เรียกฟังก์ชันของเกมจริง
================================================= */

/* Dice จากเมนู */
function menuRollDice() {
  if (typeof openDiceGame === "function") {
    openDiceGame("menu");
  } else {
    console.warn("openDiceGame() not found");
  }
}

/* Spin จากเมนู */
function menuSpinNumber() {
  if (typeof openNumberGame === "function") {
    openNumberGame();
  } else {
    console.warn("openNumberGame() not found");
  }
}
