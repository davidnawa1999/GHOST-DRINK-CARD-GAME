document.addEventListener("DOMContentLoaded", () => {

  let ratingValue = 0;

  const ratingPopup = document.getElementById("ratingPopup");
  const stars = document.querySelectorAll(".star");
  const submitRatingBtn = document.getElementById("submitRating");
  const ratingText = document.getElementById("ratingText");
  const dontShowToday = document.getElementById("dontShowToday");
  const closeRating = document.getElementById("closeRating");

  /* ================= RESET STATE ================= */

  function resetRatingState() {
    ratingValue = 0;
    ratingText.value = "";
    dontShowToday.checked = false;

    stars.forEach(star => {
      star.classList.remove("active");
      star.style.pointerEvents = "auto";
      star.style.opacity = "1";
    });

    ratingText.disabled = false;
    ratingText.style.opacity = "1";

    submitRatingBtn.disabled = false;
    submitRatingBtn.style.opacity = "1";
  }

  /* เปิด popup */
  window.showRatingPopup = function () {
    const today = new Date().toDateString();
    const hideUntil = localStorage.getItem("hideRatingUntil");
    if (hideUntil === today) return;

    resetRatingState();
    ratingPopup.classList.remove("hidden");
  };

  /* ================= STAR ================= */

  stars.forEach(star => {
    star.addEventListener("click", () => {
      if (dontShowToday.checked) return;

      ratingValue = parseInt(star.dataset.value);
      updateStars();

      // ถ้าเริ่มให้คะแนน → disable checkbox
      dontShowToday.disabled = true;
      dontShowToday.style.opacity = "0.5";
    });
  });

  function updateStars() {
    stars.forEach(star => {
      const score = parseInt(star.dataset.value);
      star.classList.toggle("active", score <= ratingValue);
    });
  }

  /* ================= TEXT ================= */

  ratingText.addEventListener("input", () => {
    if (ratingText.value.trim() !== "") {
      dontShowToday.disabled = true;
      dontShowToday.style.opacity = "0.5";
    }
  });

  /* ================= CHECKBOX ================= */

  dontShowToday.addEventListener("change", () => {
    if (dontShowToday.checked) {
      // disable ทุกอย่าง
      stars.forEach(star => {
        star.style.pointerEvents = "none";
        star.style.opacity = "0.4";
      });
      ratingText.disabled = true;
      ratingText.style.opacity = "0.4";
      submitRatingBtn.disabled = true;
      submitRatingBtn.style.opacity = "0.4";
    } else {
      // เอาติ๊กออก → ต้อง enable กลับ
      stars.forEach(star => {
        star.style.pointerEvents = "auto";
        star.style.opacity = "1";
      });
      ratingText.disabled = false;
      ratingText.style.opacity = "1";
      submitRatingBtn.disabled = false;
      submitRatingBtn.style.opacity = "1";
    }
  });

  /* ================= CLOSE ================= */

  closeRating.addEventListener("click", () => {
    if (dontShowToday.checked) {
      const today = new Date().toDateString();
      localStorage.setItem("hideRatingUntil", today);
    }
    ratingPopup.classList.add("hidden");
  });

  /* ================= SUBMIT ================= */

  submitRatingBtn.addEventListener("click", () => {
    if (ratingValue === 0) {
      alert("กรุณาให้คะแนนก่อน 🙏");
      return;
    }

    // ยิงเข้า Google Form แบบเงียบ
    const formActionUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLSclQv5MMu8f6cXSAsddoy4OpoGw_TNIn4MLaYL5BPD8voss7g/formResponse";

    const formData = new FormData();
    formData.append("entry.1590266567", ratingValue);
    formData.append("entry.842577264", ratingText.value || "");
    formData.append("entry.774314303", "V1.0");

    fetch(formActionUrl, {
      method: "POST",
      mode: "no-cors",
      body: formData
    });

    // บันทึกว่าเคย submit แล้ว → ไม่ต้องโชว์อีก
    localStorage.setItem("hasRated", "true");

    ratingPopup.classList.add("hidden");
    showThankYouFlow();
  });

});

/* ================= THANK YOU FLOW ================= */

function showThankYouFlow() {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const overlay = document.getElementById("overlay");

  modalTitle.innerHTML = `<div class="thankyou-title">ขอบคุณมากครับ ❤️</div>`;

  modalBody.innerHTML = `
    <div style="text-align:center; line-height:1.6;">
      <p>
        ขอบคุณที่ช่วยให้คะแนนเกม<br>
        ฟีดแบ็กของคุณมีค่ามากสำหรับเรา 🙏
      </p>

      <p style="margin-top:20px;">
        อยากสนับสนุนผู้พัฒนามั้ย?
      </p>

      <div style="display:flex; gap:12px; justify-content:center; margin-top:14px;">
        <button class="btn" onclick="goSupport()">ไปหน้าสนับสนุน</button>
        <button class="btn" onclick="closeThankYou()">ไม่เป็นไร</button>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function closeThankYou() {
  document.getElementById("modal").classList.add("hidden");
  document.getElementById("overlay").classList.add("hidden");
}

function goSupport() {
  closeThankYou();

  if (typeof window.openPage === "function") {
    window.openPage("support");
  } else {
    alert("openPage not found");
  }
}

