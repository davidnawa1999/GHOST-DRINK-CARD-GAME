/* ================= SOUND TOGGLE =================
   ปุ่มเปิด/ปิดเสียงทั้งเกม
   ใช้ baseSounds จาก Core Game ตรง ๆ
================================================= */

window.isMuted = false;

const soundToggle = document.getElementById("soundToggle");

function updateSoundUI() {
  soundToggle.textContent = window.isMuted ? "🔇 MUTE" : "🔊 UNMUTE";
}

soundToggle.onclick = () => {
  window.isMuted = !window.isMuted;

  if (typeof baseSounds === "object") {
    Object.values(baseSounds).forEach(sound => {
      sound.volume = window.isMuted ? 0 : 1;
    });
  }

  updateSoundUI();
};

// init
updateSoundUI();
