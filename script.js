document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       PRELOAD ASSETS
    ===================================================== */
    const preloadImages = [];
    const preloadSounds = [];

    // Cards
    for (let i = 1; i <= 54; i++) {
        preloadImages.push(`images/card${i}.png`);
    }

    // Dice
    for (let i = 1; i <= 6; i++) {
        preloadImages.push(`images/dice${i}.png`);
    }

    preloadImages.push("images/evens.png", "images/odds.png");

    // Number game
    const numberNames = ["one","two","three","four","five","six","seven","eight","nine"];
    preloadImages.push("images/question.png");
    numberNames.forEach(n => preloadImages.push(`images/${n}.png`));

    // Sounds
    preloadSounds.push(
        "sounds/flip.mp3",
        "sounds/shuffle.mp3",
        "sounds/finish.mp3",
        "sounds/dice.mp3",
        "sounds/spin.mp3"
    );

    const allAssets = [...preloadImages, ...preloadSounds];
    let loadedCount = 0;

    const loadingScreen = document.getElementById("loadingScreen");
    const loadingFill = document.getElementById("loadingFill");
    const loadingPercent = document.getElementById("loadingPercent");
    const startScreen = document.getElementById("startScreen");
    const gameScreen = document.getElementById("gameScreen");

    function assetLoaded() {
        loadedCount++;
        const percent = Math.floor((loadedCount / allAssets.length) * 100);
        loadingFill.style.width = percent + "%";
        loadingPercent.textContent = percent + "%";

        if (loadedCount === allAssets.length) {
            setTimeout(() => {
                loadingScreen.classList.add("hidden");
                startScreen.classList.remove("hidden");
            }, 300);
        }
    }

    allAssets.forEach(src => {
        if (src.endsWith(".mp3")) {
            // iOS: preload ได้แต่ยังไม่อนุญาตให้เล่น
            const a = new Audio();
            a.src = src;
            assetLoaded();
        } else {
            const img = new Image();
            img.src = src;
            img.onload = assetLoaded;
            img.onerror = assetLoaded;
        }
    });

    /* =====================================================
       DOM
    ===================================================== */
    const startGameBtn = document.getElementById("startGame");

    const counter = document.getElementById("counter");
    const cardImage = document.getElementById("cardImage");
    const flipButton = document.getElementById("flipButton");
    const nextButton = document.getElementById("nextButton");

    const finishScreen = document.getElementById("finishScreen");
    const playAgain = document.getElementById("playAgain");

    const miniGameBox = document.getElementById("miniGameBox");
    const miniGameTitle = document.getElementById("miniGameTitle");
    const miniGameDesc = document.getElementById("miniGameDesc");
    const miniActionBtn = document.getElementById("miniActionBtn");
    const closeMiniGame = document.getElementById("closeMiniGame");

    const diceBox = document.getElementById("diceBox");
    const closeDice = document.getElementById("closeDice");
    const dice1 = document.getElementById("dice1");
    const dice2 = document.getElementById("dice2");
    const startDiceRoll = document.getElementById("startDiceRoll");

    const diceResultBox = document.getElementById("diceResultBox");
    const diceResultImage = document.getElementById("diceResultImage");

    const numberBox = document.getElementById("numberBox");
    const numberImage = document.getElementById("numberImage");
    const startSpin = document.getElementById("startSpin");
    const closeNumber = document.getElementById("closeNumber");

    /* =====================================================
       🔊 SOUND SYSTEM (FIXED FOR iOS)
    ===================================================== */

    const baseSounds = {
        flip: document.getElementById("flipSound"),
        shuffle: document.getElementById("shuffleSound"),
        finish: document.getElementById("finishSound"),
        dice: document.getElementById("diceSound"),
        spin: document.getElementById("spinSound")
    };

    // 🔁 Sound Pool (แก้เสียงชน / เสียงขาด)
    function createPool(audio, size = 3) {
        const pool = [];
        for (let i = 0; i < size; i++) {
            const a = audio.cloneNode();
            a.preload = "auto";
            pool.push(a);
        }
        let index = 0;
        return () => {
            const sound = pool[index];
            index = (index + 1) % pool.length;
            sound.pause();
            sound.currentTime = 0;
            return sound;
        };
    }

    const playFlip = createPool(baseSounds.flip, 3);
    const playShuffle = createPool(baseSounds.shuffle, 3);

    let audioUnlocked = false;

    function unlockAllSounds() {
        if (audioUnlocked) return;

        Object.values(baseSounds).forEach(sound => {
            try {
                sound.volume = 0;
                sound.currentTime = 0;
                sound.play().then(() => {
                    sound.pause();
                    sound.currentTime = 0;
                    sound.volume = 1;
                }).catch(() => {});
            } catch (e) {}
        });

        audioUnlocked = true;
    }

    function playSound(audio) {
        if (!audioUnlocked) return;
        try {
            audio.pause();
            audio.currentTime = 0;
            audio.play().catch(() => {});
        } catch (e) {}
    }

    /* =====================================================
       GAME DATA
    ===================================================== */
    const images = [];
    for (let i = 1; i <= 54; i++) images.push(`images/card${i}.png`);

    let availableCards = [];
    let usedCount = 0;
    let currentCard = null;
    let flipped = false;
    let miniGameActive = false;

    /* =====================================================
       MINI GAMES (TEXT ORIGINAL – NOT MODIFIED)
    ===================================================== */
    const miniGames = [
        {title:"จำชื่อผีต่อกัน",desc:"พูดชื่อผีต่อกัน ต้องพูดคำของคนก่อนหน้าทั้งหมดด้วย\nEX: A=ผีกระสือ , B=ผีกระสือ,ผีจูออน , C=ผีกระสือ,ผีจูออน,ผีหัวขาด"},
        {title:"จำชื่อผลไม้ต่อกัน",desc:"พูดชื่อผลไม้ต่อกัน ต้องพูดคำของคนก่อนหน้าทั้งหมดด้วย\nEX: A=ส้ม , B=ส้ม,แตงโม , C=ส้ม,แตงโม,แอปเปิ้ล"},
        {title:"จำชื่อสัตว์ต่อกัน",desc:"พูดชื่อสัตว์ต่อกัน ต้องพูดคำของคนก่อนหน้าทั้งหมดด้วย\nEX: A=หมา , B=หมา,แมว , C=หมา,แมว,สิงโต"},
        {title:"จำท่าเต้นต่อกัน",desc:"ทำท่าเต้นต่อกัน ต้องเต้นท่าของคนก่อนหน้าทั้งหมดด้วย"},
        {title:"จำเสียงสัตว์ต่อกัน",desc:"ทำเสียงสัตว์ต่อกัน ต้องทำเสียงของคนก่อนหน้าทั้งหมดด้วย"},
        {title:"จังหวัดต่อพยางค์",desc:"พูดชื่อจังหวัดแบบต่อพยางค์คำต่อคำ ห้ามซ้ำกัน\nEX: A=กรุง , B=เทพ , C=ศรี , D=ษะ , E=เกษ"},
        {title:"ประเทศต่อพยางค์",desc:"พูดชื่อประเทศแบบต่อพยางค์คำต่อคำ ห้ามซ้ำกัน\nEX: A=แค , B=นา , C=ดา , D=ฟิน , E=แลนด์"},
        {title:"ห้ามนับเลขท้าย",desc:"คนที่จับได้ไพ่กำหนดเลขท้าย วนกันนับเลข\nนับได้แค่คนละ 2 เลข ใครนับเลขท้ายโดน"},
        {title:"ห้ามนับหารลง",desc:"คนที่จับได้ไพ่กำหนดเลขหลักหน่วย วนกันนับเลข\nหากต้องพูดเลขที่กำหนดหรือเลขหารลงตัว ให้พูด BUZZ"},
        {title:"ห้า สิบ สิบห้า!!!",desc:"เกมนี้ใช้มือสองข้าง ถ้าแบมือจะมี 5 คะแนน ถ้ากำมือจะเป็น 0 คะแนน ให้ทุกคนบนโต๊ะทายคะแนนรวมวนกัน ทายถูก รอด คนท้าย โดน!!"},
        {title:"ทายเลเวลกลัวผี",desc:"ให้ทำฉลาก 1-9 ทุกคนวนกันจับเลข แล้วแอคติ้งตามระดับที่ตัวเองได้\nคนทายเลขเพื่อนถูก รอด ถ้าไม่มีใครทายถูก คนแอคติ้งโดน วนจนครบทุกคน"},
        {title:"ทายเลเวลถูกหวย",desc:"ให้ทำฉลาก 1-9 ทุกคนวนกันจับเลข แล้วแอคติ้งตามระดับที่ตัวเองได้\nคนทายเลขเพื่อนถูก รอด ถ้าไม่มีใครทายถูก คนแอคติ้งโดน วนจนครบทุกคน"},
        {title:"ทายเลเวลอกหัก",desc:"ให้ทำฉลาก 1-9 ทุกคนวนกันจับเลข แล้วแอคติ้งตามระดับที่ตัวเองได้\nคนทายเลขเพื่อนถูก รอด ถ้าไม่มีใครทายถูก คนแอคติ้งโดน วนจนครบทุกคน"},
        {title:"คู่หรือคี่ทายมาสิ",desc:"ให้คนที่จับไพ่เขย่าลูกเต๋า 2 ลูก แล้วให้ทุกคนทายว่า\nได้คู่หรือได้คี่ ใครผิด ดื่ม ต้องเล่นทั้งหมด 3 รอบ"},
        {title:"เพลงไหนนะมีคำนี้",desc:"ให้คนที่จับไพ่กำหนดคำขึ้นมาหนึ่งคำ แล้วให้ผลัดกันร้องเพลง\nซึ่งเพลงที่ร้องต้องมีคำที่กำหนดอยู่ในเพลงด้วย ใครพลาด โดน"}
    ];

    let miniGamesAvailable = [];

    /* =====================================================
       START GAME
    ===================================================== */
    startGameBtn.onclick = () => {
        unlockAllSounds(); // ⭐ iOS permission

        startScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");

        availableCards = [...images];
        miniGamesAvailable = [...miniGames];
        usedCount = 0;
        currentCard = null;
        flipped = false;
        miniGameActive = false;

        drawNextCard();
    };

    function updateCounter() {
        counter.textContent = `${usedCount}/54`;
    }

    function drawNextCard() {
        const idx = Math.floor(Math.random() * availableCards.length);
        currentCard = availableCards.splice(idx, 1)[0];
        usedCount++;
        updateCounter();

        flipped = false;
        cardImage.classList.remove("flip");
        cardImage.src = "images/back.png";

        playSound(playShuffle());
    }

    /* =====================================================
       NEXT CARD
    ===================================================== */
    nextButton.onclick = () => {
        if (miniGameActive) return alert("ต้องเล่น Mini Game ก่อน");
        if (!flipped) return alert("กรุณาเปิดไพ่ก่อน");

        if (availableCards.length === 0) {
            finishScreen.classList.remove("hidden");
            playSound(baseSounds.finish);
            return;
        }

        drawNextCard();
    };

    /* =====================================================
       FLIP CARD
    ===================================================== */
    flipButton.onclick = () => {
        if (!currentCard || flipped) return;

        flipped = true;
        playSound(playFlip());
        cardImage.classList.add("flip");

        setTimeout(() => {
            cardImage.src = currentCard;

            if (["images/card33.png","images/card34.png","images/card35.png","images/card36.png"].includes(currentCard)) {
                miniGameActive = true;
                nextButton.disabled = true;
                setTimeout(showMiniGame, 800);
            }
        }, 300);
    };

    /* =====================================================
       MINI GAME
    ===================================================== */
    function showMiniGame() {
        const idx = Math.floor(Math.random() * miniGamesAvailable.length);
        const game = miniGamesAvailable.splice(idx, 1)[0];

        miniGameTitle.textContent = game.title;
        miniGameDesc.textContent = game.desc;

        miniActionBtn.classList.add("hidden");

        if (game.title === "คู่หรือคี่ทายมาสิ") {
            miniActionBtn.textContent = "ROLL DICE";
            miniActionBtn.onclick = openDiceGame;
            miniActionBtn.classList.remove("hidden");
        }

        if (game.title.includes("ทายเลเวล")) {
            miniActionBtn.textContent = "SPIN NUMBER";
            miniActionBtn.onclick = openNumberGame;
            miniActionBtn.classList.remove("hidden");
        }

        miniGameBox.classList.remove("hidden");
    }

    closeMiniGame.onclick = () => {
        miniGameBox.classList.add("hidden");
        miniGameActive = false;
        nextButton.disabled = false;
    };

    /* =====================================================
       DICE GAME
    ===================================================== */
    let diceRolling = false;
    let dicePlayCount = 0;

    function openDiceGame() {
        miniGameBox.classList.add("hidden");
        dicePlayCount = 0;
        diceRolling = false;
        closeDice.classList.add("disabled");
        diceBox.classList.remove("hidden");
    }

    startDiceRoll.onclick = () => {
        if (diceRolling) return;

        diceRolling = true;
        playSound(diceSound);

        let count = 0;
        const roll = setInterval(() => {
            dice1.src = `images/dice${Math.ceil(Math.random()*6)}.png`;
            dice2.src = `images/dice${Math.ceil(Math.random()*6)}.png`;
            count++;

            if (count >= 12) {
                clearInterval(roll);
                const a = Math.ceil(Math.random()*6);
                const b = Math.ceil(Math.random()*6);
                dice1.src = `images/dice${a}.png`;
                dice2.src = `images/dice${b}.png`;
                showDiceResult(a + b);
                diceRolling = false;
            }
        }, 100);
    };

    function showDiceResult(sum) {
        diceResultImage.src = sum % 2 === 0 ? "images/evens.png" : "images/odds.png";
        diceResultBox.classList.remove("hidden");
        dicePlayCount++;

        setTimeout(() => {
            diceResultBox.classList.add("hidden");
            if (dicePlayCount >= 3) closeDice.classList.remove("disabled");
        }, 2000);
    }

    closeDice.onclick = () => {
        if (dicePlayCount < 3) return;
        diceBox.classList.add("hidden");
        miniGameActive = false;
        nextButton.disabled = false;
    };

    /* =====================================================
       NUMBER GAME
    ===================================================== */
    let spinning = false;

    function openNumberGame() {
        miniGameBox.classList.add("hidden");
        numberImage.src = "images/question.png";
        numberBox.classList.remove("hidden");
    }

    startSpin.onclick = () => {
        if (spinning) return;

        spinning = true;
        playSound(spinSound);

        let count = 0;
        const spin = setInterval(() => {
            numberImage.src = `images/${numberNames[Math.floor(Math.random()*9)]}.png`;
            count++;

            if (count >= 15) {
                clearInterval(spin);
                numberImage.src = `images/${numberNames[Math.floor(Math.random()*9)]}.png`;
                spinning = false;
            }
        }, 100);
    };

    closeNumber.onclick = () => {
        numberBox.classList.add("hidden");
        miniGameActive = false;
        nextButton.disabled = false;
    };

    /* =====================================================
       RESET
    ===================================================== */
    playAgain.onclick = () => {
        finishScreen.classList.add("hidden");
        startScreen.classList.remove("hidden");
    };

});
