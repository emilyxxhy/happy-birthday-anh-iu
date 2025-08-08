// script.js - Phiên bản đã được khắc phục lỗi

document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const startGameBtn = document.getElementById('startGameBtn');
    const continueToSiteBtn = document.getElementById('continueToSiteBtn');
    const revealEasterEggBtn = document.getElementById('revealEasterEggBtn');
    const continueAfterGameBtn = document.getElementById('continueAfterGameBtn');

    const gameIntroSection = document.getElementById('game-intro');
    const gameAreaSection = document.getElementById('game-area');
    const birthdayMessageSection = document.getElementById('birthday-message');
    const scrapbookSection = document.getElementById('scrapbook');
    const loveLetterSection = document.getElementById('love-letter');
    const surpriseSection = document.getElementById('surprise');
    const journalSection = document.getElementById('journal');

    const easterEggContent = document.getElementById('easterEggContent');
    const secretAudio = document.getElementById('secretAudio');
    
    // Game Canvas elements
    const canvas = document.getElementById('birthdayGameCanvas');
    const ctx = canvas.getContext('2d');
    const gameOverOverlay = document.getElementById('gameOverOverlay');
    const finalScoreDisplay = document.getElementById('finalScore');
    
    // Music Player elements
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const nextSongBtn = document.getElementById('nextSongBtn');
    const currentSongTitle = document.getElementById('currentSongTitle');
    const musicalNotesAnimationArea = document.querySelector('.musical-notes-animation');
    
    // --- Music Player Configuration ---
    const songs = [
        { title: 'Day One - HONNE', src: 'audio/honne_day_one.mp3' },
        { title: 'Lover - Taylor Swift', src: 'audio/taylor_swift_lover.mp3' },
        { title: 'Chỉ Cần Anh Muốn - Vũ Thảo Mỹ', src: 'audio/VuThaoMy_ChiCanAnhMuon.mp3' },
        { title: 'Anh iu - Saabirose', src: 'audio/saabirose_anh_iu.mp3' },
        { title: 'Paris In The Rain - Lauv', src: 'audio/lauv_paris_in_the_rain.mp3' },
        { title: '24/7 - Celina Sharma', src: 'audio/247_Celina_Sharma.mp3' },
        { title: 'Hẹn Gặp Em Dưới Ánh Trăng - MANBO, Hurrykng, HIEUTHUHAI', src: 'audio/hengapemduoianhtrang_gerdnang.mp3' }
    ];
    let currentSongIndex = 0;
    let isPlaying = false;

    // --- Game Variables ---
    let player;
    let hearts = [];
    let score = 0;
    const gameTime = 30; // seconds
    let timeLeft = gameTime;
    let heartSpawnInterval;
    let gameRunning = false;
    let animationFrameId;

    // Game Assets
    const playerImg = new Image();
    playerImg.src = 'images/game-assets/pixel-player.png';
    const heartImg = new Image();
    heartImg.src = 'images/game-assets/pixel-heart-collectible.png';

    // Player Object Configuration
    const playerConfig = {
        width: 40,
        height: 40,
        speed: 6,
    };
    
    // Object để theo dõi các phím được nhấn
    const keys = {};

    // --- Game Functions ---

    /**
     * Cập nhật kích thước canvas và vị trí player khi có thay đổi.
     * Chức năng này sẽ được gọi khi trang tải và khi cửa sổ trình duyệt thay đổi kích thước.
     */
    const resizeCanvasAndPlayer = () => {
        // Lấy kích thước hiển thị thực tế của canvas từ CSS
        const container = document.getElementById('gameCanvasContainer');
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        
        // Cập nhật vị trí của player dựa trên kích thước canvas mới
        if (player) {
            player.x = canvas.width / 2 - player.width / 2;
            player.y = canvas.height - player.height - 20;
        }
    };

    function drawGameElements() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (player && playerImg.complete && playerImg.naturalWidth > 0) {
            ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
        } else if (player) {
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }

        hearts.forEach(heart => {
            if (heartImg.complete && heartImg.naturalWidth > 0) {
                ctx.drawImage(heartImg, heart.x, heart.y, heart.width, heart.height);
            } else {
                ctx.fillStyle = '#ff3366';
                ctx.fillRect(heart.x, heart.y, heart.width, heart.height);
            }
        });
        
        ctx.fillStyle = '#ecf0f1';
        ctx.font = '16px "Press Start 2P"';
        ctx.fillText(`Score: ${score}`, 10, 30);
        ctx.fillText(`Time: ${timeLeft}`, canvas.width - 120, 30);
    }
    
    function updateGameLogic() {
        if (!gameRunning) return;
        
        // Cập nhật vị trí player
        if (keys['arrowleft'] || keys['a']) {
            player.x -= player.speed;
        }
        if (keys['arrowright'] || keys['d']) {
            player.x += player.speed;
        }
        player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));

        // Cập nhật vị trí hearts và kiểm tra va chạm
        for (let i = hearts.length - 1; i >= 0; i--) {
            const heart = hearts[i];
            heart.y += heart.speed;
            
            // Va chạm
            if (heart.x < player.x + player.width &&
                heart.x + heart.width > player.x &&
                heart.y < player.y + player.height &&
                heart.y + heart.height > player.y) {
                score += 1;
                hearts.splice(i, 1);
            }
            // Bỏ lỡ
            else if (heart.y > canvas.height) {
                hearts.splice(i, 1);
            }
        }
    }
    
    function spawnHeart() {
        if (gameRunning) {
            hearts.push({
                width: 30,
                height: 30,
                x: Math.random() * (canvas.width - 30),
                y: -30,
                speed: 2 + Math.random() * 2,
            });
        }
    }
    
    function gameLoop() {
        if (!gameRunning) {
            cancelAnimationFrame(animationFrameId);
            return;
        }
        updateGameLogic();
        drawGameElements();
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    function startGame() {
        // Reset trạng thái game
        score = 0;
        timeLeft = gameTime;
        hearts = [];
        gameRunning = true;
        
        // Điều chỉnh kích thước canvas và vị trí player ngay trước khi bắt đầu game
        resizeCanvasAndPlayer();
        
        // Hiển thị khu vực game
        hideAllSections();
        if (gameAreaSection) gameAreaSection.classList.remove('hidden');

        // Xóa mọi interval/frame cũ
        if (heartSpawnInterval) clearInterval(heartSpawnInterval);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        
        // Bắt đầu game
        animationFrameId = requestAnimationFrame(gameLoop);
        heartSpawnInterval = setInterval(spawnHeart, 800);
        
        const timerInterval = setInterval(() => {
            if (!gameRunning) {
                clearInterval(timerInterval);
                return;
            }
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endGame();
            }
        }, 1000);
    }
    
    function endGame() {
        gameRunning = false;
        clearInterval(heartSpawnInterval);
        cancelAnimationFrame(animationFrameId);
        if (finalScoreDisplay) finalScoreDisplay.textContent = score;
        if (gameOverOverlay) gameOverOverlay.classList.remove('hidden');
    }
    
    // --- Keyboard & Touch Event Listeners ---
    document.addEventListener('keydown', (e) => {
        const keyName = e.key.toLowerCase();
        if (gameRunning && (keyName === 'arrowleft' || keyName === 'arrowright' || keyName === 'a' || keyName === 'd')) {
            keys[keyName] = true;
            e.preventDefault();
        }
    });
    document.addEventListener('keyup', (e) => {
        const keyName = e.key.toLowerCase();
        if (keyName === 'arrowleft' || keyName === 'arrowright' || keyName === 'a' || keyName === 'd') {
            keys[keyName] = false;
        }
    });
    
    let touchStartX = 0;
    if (canvas) {
        canvas.addEventListener('touchstart', (e) => {
            if (!gameRunning) return;
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
        });
        canvas.addEventListener('touchmove', (e) => {
            if (!gameRunning || touchStartX === 0) return;
            e.preventDefault();
            const currentTouchX = e.touches[0].clientX;
            const deltaX = currentTouchX - touchStartX;
            player.x += deltaX * 0.5;
            player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
            touchStartX = currentTouchX;
        });
        canvas.addEventListener('touchend', () => {
            touchStartX = 0;
        });
    }

    // --- Section Visibility & Navigation Handlers ---
    function showSectionWithAnimation(section) {
        if(section) {
            section.classList.remove('hidden');
            setTimeout(() => {
                section.classList.add('show');
            }, 10);
        }
    }

    function hideAllSections() {
        const sections = [
            gameIntroSection, gameAreaSection, birthdayMessageSection,
            scrapbookSection, loveLetterSection, surpriseSection, journalSection
        ];
        sections.forEach(section => {
            if (section) {
                section.classList.remove('show');
                section.classList.add('hidden');
            }
        });
    }
    
    // Lần đầu tải trang, chỉ hiện game intro
    hideAllSections();
    showSectionWithAnimation(gameIntroSection);

    // --- Event Listeners for Buttons ---
    if (startGameBtn) {
        startGameBtn.addEventListener('click', startGame);
    }
    
    if (continueAfterGameBtn) {
        continueAfterGameBtn.addEventListener('click', () => {
            hideAllSections();
            showSectionWithAnimation(birthdayMessageSection);
            if (birthdayMessageSection) {
                window.scrollTo({ top: birthdayMessageSection.offsetTop, behavior: 'smooth' });
            }
        });
    }
    
    if (continueToSiteBtn) {
        continueToSiteBtn.addEventListener('click', () => {
            hideAllSections();
            showSectionWithAnimation(scrapbookSection);
            showSectionWithAnimation(loveLetterSection);
            showSectionWithAnimation(surpriseSection);
            showSectionWithAnimation(journalSection);
            if (scrapbookSection) {
                window.scrollTo({ top: scrapbookSection.offsetTop, behavior: 'smooth' });
            }
        });
    }

    // --- Music Player Logic ---
    function loadSong(songIndex) {
        const song = songs[songIndex];
        if (audioPlayer) audioPlayer.src = song.src;
        if (currentSongTitle) currentSongTitle.textContent = song.title;
    }
    
    function playNextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex);
        if (audioPlayer) audioPlayer.play();
        if (playPauseBtn) playPauseBtn.textContent = '⏸️';
        isPlaying = true;
    }
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (audioPlayer.paused) {
                audioPlayer.play();
                playPauseBtn.textContent = '⏸️';
                isPlaying = true;
            } else {
                audioPlayer.pause();
                playPauseBtn.textContent = '▶️';
                isPlaying = false;
            }
        });
    }
    
    if (nextSongBtn) {
        nextSongBtn.addEventListener('click', playNextSong);
    }
    
    if (audioPlayer) {
        audioPlayer.addEventListener('ended', () => {
            playNextSong();
        });
        loadSong(currentSongIndex);
    }

    // --- Floating Musical Notes Animation ---
    function createMusicalNote() {
        if (!isPlaying || !musicalNotesAnimationArea) return;
        const note = document.createElement('div');
        note.textContent = '🎵';
        note.classList.add('musical-note');
        note.style.left = `${Math.random() * 80 + 10}%`;
        note.style.fontSize = `${16 + Math.random() * 12}px`;
        note.style.setProperty('--random-x-offset', `${(Math.random() - 0.5) * 60}px`);
        musicalNotesAnimationArea.appendChild(note);
        note.addEventListener('animationend', () => note.remove());
    }
    setInterval(createMusicalNote, 1200);

    // --- Hidden Surprise Logic (Easter Egg) ---
if (revealEasterEggBtn && easterEggContent && secretVideo) {
    revealEasterEggBtn.addEventListener('click', () => {
        easterEggContent.classList.toggle('hidden');
        if (!easterEggContent.classList.contains('hidden')) {
            secretVideo.play().catch(e => console.error("Error playing secret video:", e));
        } else {
            secretVideo.pause();
            secretVideo.currentTime = 0;
        }
    });
}
    // --- Navbar smooth scroll ---
    document.querySelectorAll('.navbar a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            hideAllSections();
            if (targetId === '#game-intro') {
                showSectionWithAnimation(gameIntroSection);
            } else if (targetSection) {
                showSectionWithAnimation(targetSection);
            }
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- Xử lý chức năng gửi email từ Nhật Ký ---
    function setupEmailJS() {
        const YOUR_PUBLIC_KEY = "EhjdtWxCXuM--8jy5"; 
        const YOUR_SERVICE_ID = "service_96bf1al"; 
        const YOUR_TEMPLATE_ID = "template_0zc2pse"; 

        // Kiểm tra xem EmailJS đã được tải chưa
        if (typeof emailjs !== 'undefined') {
            emailjs.init(YOUR_PUBLIC_KEY);

            const memoryForm = document.getElementById('memoryForm');
            const formMessage = document.getElementById('formMessage');

            if (memoryForm) {
                memoryForm.addEventListener('submit', function(event) {
                    event.preventDefault(); 
                    
                    const message = document.getElementById('memoryInput').value;
                    const recipient = document.getElementById('recipient').value;
                    let toEmail, toName, fromEmail, fromName;

                    if (recipient === "to_em") {
                        toEmail = "hngathu4306@gmail.com";
                        toName = "Anh Thư";
                        fromEmail = "hieutran1681998@gmail.com";
                        fromName = "Hiếu";
                    } else {
                        toEmail = "hieutran1681998@gmail.com";
                        toName = "Hiếu";
                        fromEmail = "hngathu4306@gmail.com";
                        fromName = "Anh Thư";
                    }
                    
                    const templateParams = {
                        to_name: toName,
                        to_email: toEmail,
                        from_name: fromName,
                        from_email: fromEmail,
                        message: message
                    };

                    emailjs.send(YOUR_SERVICE_ID, YOUR_TEMPLATE_ID, templateParams)
                    .then(function(response) {
                        console.log('SUCCESS!', response.status, response.text);
                        if (formMessage) formMessage.classList.remove('hidden');
                        const memoryInput = document.getElementById('memoryInput');
                        if (memoryInput) memoryInput.value = '';
                    }, function(error) {
                        console.log('FAILED...', error);
                        if (formMessage) {
                            formMessage.textContent = 'Có lỗi xảy ra, không thể gửi tin nhắn.';
                            formMessage.classList.remove('hidden');
                            formMessage.style.color = '#ff3366';
                        }
                    });
                });
            }
        } else {
            console.error("EmailJS library not loaded. The form will not work.");
            const form = document.getElementById('memoryForm');
            if (form) {
                form.innerHTML = "<p class='pixel-text' style='color: #ff3366;'>Lỗi: Chức năng gửi tin nhắn không hoạt động. Vui lòng kiểm tra kết nối mạng.</p>";
            }
        }
    }
    
    // --- Gán sự kiện resize và khởi tạo ban đầu ---
    window.addEventListener('resize', resizeCanvasAndPlayer);
    
    // Gán vị trí player ban đầu SAU KHI DOMContentLoaded và canvas đã được render
    player = { ...playerConfig };
    resizeCanvasAndPlayer();
    
    // Thiết lập EmailJS
    setupEmailJS();
});
