//
// โหลดไฟล์รูป card1.png - card54.png
//
const images = [];
for (let i = 1; i <= 54; i++) {
    images.push(`images/card${i}.png`);
}

// สำรับไพ่
let availableCards = [...images];
let usedCount = 0;

// อ้างอิง Element
const cardImage = document.getElementById("cardImage");
const flipButton = document.getElementById("flipButton");
const nextButton = document.getElementById("nextButton");
const counter = document.getElementById("counter");
const finishScreen = document.getElementById("finishScreen");
const playAgainButton = document.getElementById("playAgain");

// Mini Game Elements
const miniGameBox = document.getElementById("miniGameBox");
const miniGameTitle = document.getElementById("miniGameTitle");
const miniGameDesc = document.getElementById("miniGameDesc");
const closeMiniGame = document.getElementById("closeMiniGame");

// โหลดเสียง
const flipSound = document.getElementById("flipSound");
const shuffleSound = document.getElementById("shuffleSound");
const finishSound = document.getElementById("finishSound");

let currentCard = null;
let flipped = false;
let miniGameActive = false; // ตรวจสอบว่าอยู่ระหว่าง Mini Game หรือไม่

// ลิสต์ Mini Games
const miniGames = [
    {title: "จำชื่อผีต่อกัน", desc: "พูดชื่อผีต่อกัน ต้องพูดคำของคนก่อนหน้าทั้งหมดด้วย\nEX: A=ผีกระสือ , B=ผีกระสือ,ผีจูออน , C=ผีกระสือ,ผีจูออน,ผีหัวขาด"},
    {title: "จำชื่อผลไม้ต่อกัน", desc: "พูดชื่อผลไม้ต่อกัน ต้องพูดคำของคนก่อนหน้าทั้งหมดด้วย\nEX: A=ส้ม , B=ส้ม,แตงโม , C=ส้ม,แตงโม,แอปเปิ้ล"},
    {title: "จำชื่อสัตว์ต่อกัน", desc: "พูดชื่อสัตว์ต่อกัน ต้องพูดคำของคนก่อนหน้าทั้งหมดด้วย\nEX: A=หมา , B=หมา,แมว , C=หมา,แมว,สิงโต"},
    {title: "จำท่าเต้นต่อกัน", desc: "ทำท่าเต้นต่อกัน ต้องเต้นท่าของคนก่อนหน้าทั้งหมดด้วย"},
    {title: "จำเสียงสัตว์ต่อกัน", desc: "พูดชื่อผีต่อกัน ต้องพูดคำของคนก่อนหน้าทั้งหมดด้วย"},
    {title: "จังหวัดต่อพยางค์", desc: "พูดชื่อจังหวัดแบบต่อพยางค์คำต่อคำ ห้ามซ้ำกัน\nEX: A=กรุง , B=เทพ , C=ศรี , D=ษะ , E=เกษ"},
    {title: "ประเทศต่อพยางค์", desc: "พูดชื่อประเทศแบบต่อพยางค์คำต่อคำ ห้ามซ้ำกัน\nEX: A=แค , B=นา , C=ดา , D=ฟิน , E=แลนด์"},
    {title: "ห้ามนับเลขท้าย", desc: "คนที่จับได้ไพ่กำหนดเลขท้าย วนกันนับเลข\nนับได้แค่คนละ 2 เลข ใครนับเลขท้ายโดน"},
    {title: "ห้ามนับหารลง", desc: "คนที่จับได้ไพ่กำหนดเลขหลักหน่วย วนกันนับเลข\nหากต้องพูดเลขที่กำหนดหรือเลขหารลงตัว ให้พูด BUZZ"},
    {title: "ห้า สิบ สิบห้า!!!", desc: "เกมนี้ใช้มือสองข้าง ถ้าแบมือจะมี 5 คะแนน ถ้ากำมือจะมี 0 คะแนน\nให้ทุกคนบนโต๊ะทายคะแนนรวมวนกัน ทายถูก รอด คนท้าย โดน!!"},
    {title: "ทายเลเวลกลัวผี", desc: "ให้ทำฉลาก 1-9 ทุกคนวนกันจับเลข แล้วแอคติ้งตามระดับที่ตัวเองได้\nคนทายเลขเพื่อนถูก รอด ถ้าไม่มีใครทายถูก คนแอคติ้งโดน วนจนครบทุกคน"},
    {title: "ทายเลเวลถูกหวย", desc: "ให้ทำฉลาก 1-9 ทุกคนวนกันจับเลข แล้วแอคติ้งตามระดับที่ตัวเองได้\nคนทายเลขเพื่อนถูก รอด ถ้าไม่มีใครทายถูก คนแอคติ้งโดน วนจนครบทุกคน"},
    {title: "ทายเลเวลอกหัก", desc: "ให้ทำฉลาก 1-9 ทุกคนวนกันจับเลข แล้วแอคติ้งตามระดับที่ตัวเองได้\nคนทายเลขเพื่อนถูก รอด ถ้าไม่มีใครทายถูก คนแอคติ้งโดน วนจนครบทุกคน"},
    {title: "คู่หรือคี่ทายมาสิ", desc: "ให้คนที่จับไพ่เขย่าลูกเต๋า 2 ลูก แล้วให้ทุกคนทายว่า\nได้คู่หรือได้คี่ ใครผิด ดื่ม ต้องเล่นทั้งหมด 3 รอบ"},
    {title: "เพลงไหนนะมีคำนี้", desc: "ให้คนที่จับไพ่กำหนดคำขึ้นมาหนึ่งคำ แล้วให้ผลัดกันร้องเพลง\nซึ่งเพลงที่ร้องต้องมีคำที่กำหนดอยู่ในเพลงด้วย ใครพลาด โดน"}
];

// อัปเดตจำนวนไพ่
function updateCounter() {
    counter.textContent = `${usedCount}/54`;
}

// เปิดไพ่
flipButton.onclick = function () {
    if (currentCard && !flipped) {
        flipped = true;
        flipSound.currentTime = 0;
        flipSound.play();
        cardImage.classList.add("flip");

        setTimeout(() => {
            cardImage.src = currentCard;

            // ถ้าเป็นไพ่ Mini Game ให้โชว์กล่องหลังเปิดไพ่ 2 วินาที
            if (["images/card33.png","images/card34.png","images/card35.png","images/card36.png"].includes(currentCard)) {
                miniGameActive = true; // ล็อกปุ่มใบต่อไป
                nextButton.disabled = true; // ปิดการใช้งานปุ่มใบต่อไป
                setTimeout(() => {
                    showMiniGame();
                }, 2000);
            }

        }, 300);
    }
};

// สุ่มไพ่ใบต่อไป
nextButton.onclick = function () {
    if (!flipped && currentCard !== null) {
        alert("กรุณาเปิดไพ่ก่อนกดใบต่อไป!");
        return;
    }

    if (miniGameActive) {
        alert("คุณต้องรอเปิดกล่อง Mini Game ก่อนครับ!");
        return;
    }

    if (availableCards.length === 0) {
        finishScreen.classList.remove("hidden");
        finishSound.currentTime = 0;
        finishSound.play();
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableCards.length);
    currentCard = availableCards[randomIndex];
    availableCards.splice(randomIndex, 1);
    usedCount++;
    updateCounter();

    flipped = false;
    cardImage.classList.remove("flip");
    cardImage.classList.add("fade-in");
    cardImage.src = "images/back.png";
    setTimeout(() => {
        cardImage.classList.remove("fade-in");
    }, 400);

    shuffleSound.currentTime = 0;
    shuffleSound.play();
};

// ปุ่มเล่นใหม่
playAgainButton.onclick = function () {
    availableCards = [...images];
    usedCount = 0;
    updateCounter();
    currentCard = null;
    flipped = false;
    cardImage.src = "images/back.png";
    cardImage.classList.remove("flip");
    finishScreen.classList.add("hidden");
};

// ฟังก์ชันโชว์ Mini Game
function showMiniGame() {
    const randomGame = miniGames[Math.floor(Math.random() * miniGames.length)];
    miniGameTitle.textContent = randomGame.title;
    miniGameDesc.textContent = randomGame.desc;
    miniGameBox.classList.add("show");
}

// ปุ่มปิด Mini Game
closeMiniGame.onclick = function() {
    miniGameBox.classList.remove("show");
    miniGameActive = false; // ปลดล็อกปุ่มใบต่อไป
    nextButton.disabled = false; // เปิดปุ่มใบต่อไป
};

