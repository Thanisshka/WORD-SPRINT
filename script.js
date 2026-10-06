document.addEventListener('DOMContentLoaded', () => {
    
    let currentScene = 1;
    let growthStage = 1;

    // Initialize
    initKuralText();
    
    // ==========================================================================
    // 1. NAVIGATION LOGIC
    // ==========================================================================
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');
    
    // Mobile Menu Toggle
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            mobileBtn.classList.toggle('toggle');
        });

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if(navLinks.classList.contains('nav-active')) {
                    navLinks.classList.remove('nav-active');
                    mobileBtn.classList.remove('toggle');
                }
            });
        });
    }
    
    // ==========================================================================
    // 2. SCENE MANAGEMENT & TREE ANIMATION
    // ==========================================================================
    window.nextScene = (sceneNum) => {
        // Hide all scenes
        document.querySelectorAll('.scene').forEach(s => {
            s.classList.remove('active');
        });
        
        // Show target scene
        const target = document.getElementById('scene-' + sceneNum);
        if(target) {
            setTimeout(() => { target.classList.add('active'); }, 50);
            currentScene = sceneNum;
        }
        
        updateProgressIndicator(sceneNum);
        
        const arena = document.getElementById('game-arena');
        if(arena) {
            if (sceneNum >= 3 && sceneNum <= 5) { // Game active only in scenes 3,4,5
                arena.classList.remove('hidden');
                setTimeout(() => arena.style.opacity = '1', 50);
            } else {
                arena.style.opacity = '0';
                setTimeout(() => arena.classList.add('hidden'), 500);
            }
        }
        
        // Triggers for specific scenes
        if (sceneNum === 6) setTimeout(triggerKuralReveal, 500);
        if (sceneNum === 10) setTimeout(playFinalSequence, 500);
    };

    window.updateProgressIndicator = (sceneNum) => {
        const prog = document.getElementById('journey-progress');
        let stepNum = sceneNum;
        if(sceneNum > 6) stepNum = 6;
        
        if (sceneNum >= 1 && sceneNum <= 10) {
            prog.classList.remove('hidden');
            setTimeout(() => prog.style.opacity = '1', 50);
            
            document.querySelectorAll('.progress-step').forEach((step, index) => {
                if (index + 1 <= stepNum) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        }
    };

    window.growTree = (stage) => {
        const tree = document.getElementById('css-tree');
        const stages = ['stage-seed', 'stage-sprout', 'stage-sapling', 'stage-plant', 'stage-tree'];
        stages.forEach(s => tree.classList.remove(s));
        tree.classList.add(stages[Math.min(stage - 1, 4)]);
    };

    window.breakWallGame = {
        attempts: 0,
        failures: 0,
        currentStage: 1,
        
        startGame: function() {
            this.attempts = 0;
            this.failures = 0;
            this.currentStage = 1;
            
            const arena = document.getElementById('game-arena');
            const wall = document.getElementById('wall-canvas');
            const hud = document.getElementById('game-hud');
            if(arena) arena.classList.remove('hidden');
            if(wall) wall.classList.remove('hidden', 'crack-1', 'crack-2', 'crack-3', 'wall-broken');
            if(hud) hud.classList.remove('hidden');
            
            this.updateHUD();
            
            growthStage = 1;
            growTree(1);
            
            nextScene(3);
        },
        
        updateHUD: function() {
            document.getElementById('hud-attempts').textContent = this.attempts;
            document.getElementById('hud-failures').textContent = this.failures;
            let progress = (this.currentStage - 1) * 33.3;
            if (this.currentStage > 3) progress = 100;
            document.getElementById('hud-progress').style.width = progress + '%';
            
            const wall = document.getElementById('wall-canvas');
            if(wall) {
                if (this.currentStage === 2) wall.classList.add('crack-1');
                if (this.currentStage === 3) wall.classList.add('crack-2');
            }
        },
        
        handleFail: function(sceneId) {
            this.attempts++;
            this.failures++;
            
            const wall = document.getElementById('wall-canvas');
            if(wall) {
                if(this.failures === 1) wall.classList.add('crack-1');
                if(this.failures === 2) wall.classList.add('crack-2');
                if(this.failures >= 3) wall.classList.add('crack-3');
            }
            this.updateHUD();
            
            document.getElementById(sceneId + '-challenge').classList.add('hidden');
            document.getElementById(sceneId + '-feedback').classList.remove('hidden');
        },
        
        retry: function(sceneId) {
            document.getElementById(sceneId + '-feedback').classList.add('hidden');
            document.getElementById(sceneId + '-challenge').classList.remove('hidden');
        },
        
        handleSuccess: function(sceneId, nextSceneNum) {
            this.attempts++;
            this.currentStage++;
            this.updateHUD();
            
            if (growthStage < 4) {
                growthStage++;
                growTree(growthStage);
            }
            nextScene(nextSceneNum);
        },
        
        handleFinalSuccess: function() {
            this.attempts++;
            this.currentStage = 4;
            this.updateHUD();
            
            growthStage = 5;
            growTree(5);
            
            const wall = document.getElementById('wall-canvas');
            if(wall) wall.classList.add('wall-broken');
            
            document.getElementById('s5-challenge').classList.add('hidden');
            document.getElementById('s5-success').classList.remove('hidden');
            
            setTimeout(() => {
                const hud = document.getElementById('game-hud');
                if(hud) hud.classList.add('hidden');
            }, 3000);
        }
    };

    // ==========================================================================
    // 3. KURAL REVEAL ANIMATION
    // ==========================================================================
    let kuralRevealed = false;
    function initKuralText() {
        const kuralText = "ஊழையும் உப்பக்கம் காண்பர் உலைவின்றித் தாழாது உஞற்று பவர்.";
        const kuralContainer = document.getElementById('kural-text-container');
        if (!kuralContainer) return;
        const words = kuralText.split(' ');
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = word;
            kuralContainer.appendChild(span);
            
            // Insert line break after "உலைவின்றித்" (4th word, index 3)
            if (index === 3) {
                kuralContainer.appendChild(document.createElement('br'));
            }
        });
    }

    function triggerKuralReveal() {
        if (kuralRevealed) return;
        kuralRevealed = true;
        
        const wordSpans = document.querySelectorAll('#kural-text-container span');
        wordSpans.forEach((span, index) => {
            setTimeout(() => { span.classList.add('revealed'); }, index * 300);
        });

        setTimeout(() => {
            const btn = document.getElementById('to-meaning-btn');
            if(btn) {
                btn.classList.remove('hidden');
                setTimeout(() => btn.style.opacity = '1', 50);
            }
        }, wordSpans.length * 300 + 500);
    }

    // ==========================================================================
    // 4. MODERN LIFE SECTION (EXPAND/COLLAPSE)
    // ==========================================================================
    const expandBtns = document.querySelectorAll('.expand-btn');
    const collapseBtns = document.querySelectorAll('.collapse-btn');

    expandBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.modern-card');
            card.querySelector('.card-front').classList.add('hidden');
            card.querySelector('.card-back').classList.remove('hidden');
        });
    });

    collapseBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.modern-card');
            card.querySelector('.card-back').classList.add('hidden');
            card.querySelector('.card-front').classList.remove('hidden');
        });
    });

    // ==========================================================================
    // 5. REFLECTION QUIZ
    // ==========================================================================
    const quizBtns = document.querySelectorAll('.quiz-answer-btn');
    const questions = document.querySelectorAll('.quiz-question');
    const quizContainer = document.getElementById('quiz-container');
    const quizResult = document.getElementById('quiz-result');
    const meterFill = document.getElementById('meter-fill');
    const meterPercent = document.getElementById('meter-percent');
    
    let currentQuestion = 0;
    let persistenceScore = 0;

    quizBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const score = parseInt(e.target.getAttribute('data-score'));
            persistenceScore += score;
            
            questions[currentQuestion].classList.add('hidden');
            questions[currentQuestion].classList.remove('active');
            
            currentQuestion++;
            
            if (currentQuestion < questions.length) {
                questions[currentQuestion].classList.remove('hidden');
                questions[currentQuestion].classList.add('active');
            } else {
                showQuizResult();
            }
        });
    });

    function showQuizResult() {
        quizContainer.classList.add('hidden');
        quizResult.classList.remove('hidden');
        
        const total = questions.length;
        const percentage = (persistenceScore / total) * 100;
        
        // Expose to window for lang.js
        window.persistenceScore = persistenceScore;
        
        if (typeof updateQuizSummaryText === 'function') {
            updateQuizSummaryText();
        }

        setTimeout(() => {
            if(meterFill) meterFill.style.width = `${percentage}%`;
            animateValue(meterPercent, 0, percentage, 1500);
        }, 300);
    }

    function animateValue(obj, start, end, duration) {
        if(!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start) + "%";
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // ==========================================================================
    // 6. FINAL MESSAGE SEQUENCE
    // ==========================================================================
    let finalTriggered = false;
    function playFinalSequence() {
        if (finalTriggered) return;
        finalTriggered = true;

        const texts = document.querySelectorAll('.seq-text');
        const footer = document.getElementById('final-footer');
        
        texts.forEach((text, index) => {
            setTimeout(() => {
                text.classList.remove('hidden');
                text.classList.add('fade-in');
            }, 1000 + (index * 1500));
        });

        setTimeout(() => {
            if(footer) {
                footer.classList.remove('hidden');
                footer.classList.add('fade-in');
                footer.style.opacity = '1';
            }
        }, 1000 + (texts.length * 1500) + 500);
    }

    // ==========================================================================
    // 7. RESTART FUNCTIONALITY
    // ==========================================================================
    window.restartJourney = () => {
        growthStage = 1; growTree(1);
        
        ['s3', 's4'].forEach(id => {
            const chal = document.getElementById(id + '-challenge');
            const feed = document.getElementById(id + '-feedback');
            if(chal) chal.classList.remove('hidden');
            if(feed) feed.classList.add('hidden');
        });
        
        const s5chal = document.getElementById('s5-challenge');
        if(s5chal) s5chal.classList.remove('hidden');
        const s5feed = document.getElementById('s5-feedback');
        if(s5feed) s5feed.classList.add('hidden');
        const s5succ = document.getElementById('s5-success');
        if(s5succ) s5succ.classList.add('hidden');
        
        // Ensure Wall HUD is hidden until they start the game again
        const wall = document.getElementById('wall-canvas');
        if(wall) wall.classList.add('hidden');
        const hud = document.getElementById('game-hud');
        if(hud) hud.classList.add('hidden');
        
        // Reset Quiz
        currentQuestion = 0; persistenceScore = 0;
        questions.forEach(q => q.classList.add('hidden'));
        if(questions[0]) {
            questions[0].classList.remove('hidden');
            questions[0].classList.add('active');
        }
        quizContainer.classList.remove('hidden');
        quizResult.classList.add('hidden');
        if(meterFill) meterFill.style.width = '0%';
        if(meterPercent) meterPercent.textContent = '0%';
        
        // Reset Flip Cards
        document.querySelectorAll('.modern-card').forEach(card => {
            card.querySelector('.card-back').classList.add('hidden');
            card.querySelector('.card-front').classList.remove('hidden');
        });

        // Reset Final
        finalTriggered = false;
        document.querySelectorAll('.seq-text').forEach(t => { t.classList.remove('fade-in'); });
        const footer = document.getElementById('final-footer');
        if(footer) { footer.classList.remove('fade-in'); footer.style.opacity = '0'; }
        
        // Reset Kural
        kuralRevealed = false;
        document.querySelectorAll('#kural-text-container span').forEach(span => { span.classList.remove('revealed'); });
        const btn = document.getElementById('to-meaning-btn');
        if(btn) { btn.style.opacity = '0'; setTimeout(() => btn.classList.add('hidden'), 300); }

        nextScene(1);
    };

});
