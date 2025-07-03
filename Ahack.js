class AssessmentHelper {
    constructor() {
        this.answerIsDragging = false;
        this.answerCurrentX = 0;
        this.answerCurrentY = 0;
        this.answerInitialX = 0;
        this.answerInitialY = 0;
        this.cachedArticle = null;
        this.isFetchingAnswer = false;
        this.animeScriptUrl = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js';
        this.draggabillyScriptUrl = 'https://unpkg.com/draggabilly@3/dist/draggabilly.pkgd.min.js';
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        try {
            await this.loadScript(this.animeScriptUrl);
            await this.loadScript(this.draggabillyScriptUrl);
            this.itemMetadata = {
                UI: this.createUI(),
                answerUI: this.createAnswerUI()
            };
            this.playIntroAnimation();
        } catch (error) {
            this.showAlert('Failed to load required scripts for the Assessment Helper. Some features may not work.', 'error');
            this.itemMetadata = {
                UI: this.createUI(),
                answerUI: this.createAnswerUI()
            };
            this.showUI(true);
        }
    }

    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => { resolve(); };
            script.onerror = (error) => { script.remove(); reject(new Error(`Failed to load script: ${url}`)); };
            document.head.appendChild(script);
        });
    }

    createUI() {
        const container = document.createElement("div");
        const launcher = document.createElement("div");
        launcher.id = "Launcher";
        launcher.className = "Launcher";
        launcher.style.cssText = "outline: none;min-height: 100px;opacity: 0;visibility: hidden;transition: opacity 0.5s ease;font-family: 'Nunito', sans-serif;width: 180px;height: 120px;background: #1c1e2b;position: fixed;border-radius: 12px;display: flex;flex-direction: column;align-items: center;color: white;font-size: 16px;top: 50%;right: 20px;transform: translateY(-50%);z-index: 99999;padding: 16px;box-shadow: 0 4px 8px rgba(0,0,0,0.2);overflow: hidden;white-space: nowrap;";
        const dragHandle = document.createElement("div");
        dragHandle.className = "drag-handle";
        dragHandle.style.cssText = "width: 100%;height: 24px;cursor: move;background: transparent;position: absolute;top: 0;";
        const closeButton = document.createElement("button");
        closeButton.id = "closeButton";
        closeButton.textContent = "\u00D7";
        closeButton.style.cssText = "position: absolute;top: 8px;right: 8px;background: none;border: none;color: white;font-size: 18px;cursor: pointer;padding: 2px 8px;transition: color 0.2s ease, transform 0.1s ease; opacity: 0.5; display: block; visibility: visible;";
        const getAnswerButton = document.createElement("button");
        getAnswerButton.id = "getAnswerButton";
        getAnswerButton.style.cssText = "background: #2c2e3b;border: none;color: white;padding: 12px 20px;border-radius: 8px;cursor: pointer;margin-top: 24px;width: 120px;height: 44px;font-size: 16px;transition: background 0.2s ease, transform 0.1s ease; display: flex; justify-content: center; align-items: center;";
        const loadingIndicator = document.createElement("div");
        loadingIndicator.id = "loadingIndicator";
        loadingIndicator.style.cssText = "border: 4px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top: 4px solid #fff; width: 20px; height: 20px; animation: spin 1s linear infinite; display: none;";
        const buttonTextSpan = document.createElement("span");
        buttonTextSpan.textContent = "Start";
        buttonTextSpan.id = "getAnswerButtonText";
        getAnswerButton.appendChild(loadingIndicator);
        getAnswerButton.appendChild(buttonTextSpan);
        launcher.appendChild(dragHandle);
        launcher.appendChild(closeButton);
        launcher.appendChild(getAnswerButton);
        container.appendChild(launcher);
        return container;
    }

    createAnswerUI() {
        const container = document.createElement("div");
        const answerContainer = document.createElement("div");
        answerContainer.id = "answerContainer";
        answerContainer.className = "answerLauncher";
        answerContainer.style.cssText = "outline: none;min-height: 60px;transform: translateX(0px) translateY(-50%);opacity: 0;visibility: hidden;transition: opacity 0.3s ease, transform 0.3s ease;font-family: 'Nunito', sans-serif;width: 60px;height: 60px;background: #1c1e2b;position: fixed;border-radius: 8px;display: flex;justify-content: center;align-items: center;color: white;font-size: 24px;top: 50%;right: 220px;z-index: 99998;padding: 8px;box-shadow: 0 4px 8px rgba(0,0,0,0.2);overflow: hidden;white-space: normal;";
        const dragHandle = document.createElement("div");
        dragHandle.className = "answer-drag-handle";
        dragHandle.style.cssText = "width: 100%;height: 24px;cursor: move;background: transparent;position: absolute;top: 0;";
        const closeButton = document.createElement("button");
        closeButton.id = "closeAnswerButton";
        closeButton.style.cssText = "position: absolute;top: 8px;right: 8px;background: none;border: none;color: white;font-size: 18px;cursor: pointer;padding: 2px 8px;transition: color 0.2s ease, transform 0.1s ease;";
        const answerContent = document.createElement("div");
        answerContent.id = "answerContent";
        answerContent.style.cssText = "padding: 0;margin: 0;word-wrap: break-word;font-size: 24px;font-weight: bold;display: flex;justify-content: center;align-items: center;width: 100%;height: 100%;";
        answerContainer.appendChild(dragHandle);
        answerContainer.appendChild(closeButton);
        answerContainer.appendChild(answerContent);
        container.appendChild(answerContainer);
        return container;
    }

    playIntroAnimation() {
        this.showUI();
    }

    showUI(skipAnimation = false) {
        document.body.appendChild(this.itemMetadata.UI);
        document.body.appendChild(this.itemMetadata.answerUI);
        const launcher = document.getElementById('Launcher');
        if (launcher) {
            if (skipAnimation) {
                launcher.style.visibility = 'visible';
                launcher.style.opacity = 1;
                this.setupEventListeners();
                if (localStorage.getItem('discordPopupDismissed') !== 'true') {
                    this.displayDiscordPopup();
                }
            } else {
                launcher.style.visibility = 'visible';
                setTimeout(() => {
                    launcher.style.opacity = 1;
                }, 10);
                setTimeout(() => {
                    this.setupEventListeners();
                    if (localStorage.getItem('discordPopupDismissed') !== 'true') {
                        this.displayDiscordPopup();
                    }
                }, 500);
            }
        } else {
            this.setupEventListeners();
            if (localStorage.getItem('discordPopupDismissed') !== 'true') {
                this.displayDiscordPopup();
            }
        }
    }

    showAlert(message, type = 'info') {
        const alertContainer = document.createElement('div');
        alertContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: ${type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 100000;
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
            font-family: 'Nunito', sans-serif;
            font-size: 16px;
            max-width: 80%;
            text-align: center;
        `;
        alertContainer.textContent = message;
        document.body.appendChild(alertContainer);
        setTimeout(() => alertContainer.style.opacity = 1, 10);
        setTimeout(() => {
            alertContainer.style.opacity = 0;
            alertContainer.addEventListener('transitionend', () => alertContainer.remove());
        }, 5000);
    }

    getUserNameFromDOM() {
        const element = document.evaluate('//*[@id="profile-menu"]/div', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        const elementText = element ? element.innerText.trim() : "";
        const nameMatch = elementText.match(/^([^(]+)/);
        return nameMatch ? nameMatch[1].trim() : "Friend";
    }

    displayDiscordPopup() {}

    async logToDataEndpoint(novaButtonClickCount) {
        try {
            const element = document.evaluate('//*[@id="profile-menu"]/div', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            const elementText = element ? element.innerText.trim() : "Element not found";
            const spanElement = document.querySelector('.activeClassNameNew');
            const spanText = spanElement ? spanElement.innerText.trim() : "Span element not found";
            const timestamp = new Date();
            const isoTimestamp = timestamp.toISOString();
            const normalTime = timestamp.toLocaleString();
            const os = this.getOS();
            const browser = this.getBrowser();
            let isMobile = false;
            let mobileType = 'Desktop';
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            if (/android|ipad|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
                isMobile = true;
                if (/android/i.test(userAgent)) {
                    mobileType = 'Android';
                } else if (/ipad|iphone|ipod/i.test(userAgent)) {
                    mobileType = 'iOS';
                } else {
                    mobileType = 'Mobile';
                }
            }
            const logMessage = `Name: ${elementText} | Class: ${spanText} | OS: ${os} | Browser: ${browser} | Mobile: ${isMobile} | MobileType: ${mobileType} | Time: ${normalTime} | ISO Time: ${isoTimestamp} | Nova Clicks: ${novaButtonClickCount}`;
            const payload = {
                text: logMessage,
                timestamp: isoTimestamp,
                os: os,
                browser: browser,
                isMobile: isMobile,
                mobileType: mobileType,
                novaClicks: novaButtonClickCount
            };
            const response = await fetch('https://diverse-observations-vbulletin-occasional.trycloudflare.com/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {}
    }

    getOS() {
        const userAgent = window.navigator.userAgent;
        let os = 'Unknown OS';
        if (userAgent.indexOf('Win') !== -1) os = 'Windows';
        else if (userAgent.indexOf('Mac') !== -1) os = 'macOS';
        else if (userAgent.indexOf('Linux') !== -1) os = 'Linux';
        else if (userAgent.indexOf('Android') !== -1) os = 'Android';
        else if (userAgent.indexOf('like Mac') !== -1) os = 'iOS';
        return os;
    }

    getBrowser() {
        const userAgent = window.navigator.userAgent;
        let browser = 'Unknown Browser';
        if (userAgent.indexOf('Chrome') !== -1 && !userAgent.indexOf('Edge') !== -1) browser = 'Google Chrome';
        else if (userAgent.indexOf('Firefox') !== -1) browser = 'Mozilla Firefox';
        else if (userAgent.indexOf('Safari') !== -1 && !userAgent.indexOf('Chrome') !== -1) browser = 'Apple Safari';
        else if (userAgent.indexOf('Edge') !== -1) browser = 'Microsoft Edge';
        else if (userAgent.indexOf('Opera') !== -1 || userAgent.indexOf('OPR') !== -1) browser = 'Opera';
        else if (userAgent.indexOf('Trident') !== -1 || userAgent.indexOf('MSIE') !== -1) browser = 'Internet Explorer';
        return browser;
    }

    async fetchAnswer(queryContent, retryCount = 0) {
        const MAX_RETRIES = 3;
        const RETRY_DELAY_MS = 1000;
        try {
            const response = await fetch('https://diverse-observations-vbulletin-occasional.trycloudflare.com/ask', {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q: queryContent,
                    article: this.cachedArticle || null
                })
            });
            if (!response.ok) {
                const errorBody = await response.text();
                if (response.status === 500 && errorBody.includes("429 You exceeded your current quota")) {
                    if (retryCount < MAX_RETRIES) {
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                        return this.fetchAnswer(queryContent, retryCount + 1);
                    } else {
                        throw new Error(`API request failed after multiple retries due to quota: ${errorBody}`);
                    }
                } else {
                    throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
                }
            }
            const data = await response.json();
            return data.response ? String(data.response).trim() : 'No answer available';
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }

    async fetchArticleContent() {
        const articleContainer = document.querySelector('#start-reading');
        let articleContent = '';
        if (articleContainer) {
            const paragraphs = articleContainer.querySelectorAll('p');
            articleContent = Array.from(paragraphs).map(p => p.textContent.trim()).join(' ');
        }
        const questionContainer = document.querySelector('#activity-component-react');
        let questionContent = '';
        if (questionContainer) {
            questionContent = questionContainer.textContent.trim();
        }
        const combinedContent = `${articleContent}\n\n${questionContent}`;
        this.cachedArticle = combinedContent;
        return combinedContent;
    }

    setupEventListeners() {
        const launcher = document.getElementById('Launcher');
        const answerContainer = document.getElementById('answerContainer');
        const getAnswerButton = launcher ? launcher.querySelector('#getAnswerButton') : null;
        const loadingIndicator = getAnswerButton ? getAnswerButton.querySelector('#loadingIndicator') : null;
        const buttonTextSpan = getAnswerButton ? getAnswerButton.querySelector('#getAnswerButtonText') : null;
        if (!launcher || !answerContainer) return;
        const closeButton = launcher.querySelector('#closeButton');
        const closeAnswerButton = answerContainer.querySelector('#closeAnswerButton');
        if (!document.getElementById('assessment-helper-styles')) {
            const style = document.createElement('style');
            style.id = 'assessment-helper-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                #closeButton:hover, #closeAnswerButton:hover {
                    color: #ff6b6b;
                    opacity: 1 !important;
                }
                #closeButton:active, #closeAnswerButton:active {
                    color: #e05252;
                    transform: scale(0.95);
                }
                #getAnswerButton:hover {
                    background: #3c3e4b;
                }
                #getAnswerButton:active {
                    background: #4c4e5b;
                    transform: scale(0.98);
                }
                #getAnswerButton:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .answerLauncher.show {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(-50%) scale(1);
                }
                #dismissDiscordPopupCheckbox:checked::before {
                    content: '\\2713';
                    display: block;
                    width: 100%;
                    height: 100%;
                    color: white;
                    text-align: center;
                    line-height: 14px;
                    font-size: 10px;
                    position: absolute;
                    top: 0;
                    left: 0;
                }
            `;
            document.head.appendChild(style);
        }
        if (typeof Draggabilly !== 'undefined') {
            try {
                const draggie = new Draggabilly(launcher, {
                    handle: '.drag-handle',
                    delay: 150
                });
            } catch (error) {}
        }
        const answerDragHandle = answerContainer.querySelector('.answer-drag-handle');
        const answerContent = answerContainer.querySelector('#answerContent');
        if (answerDragHandle) {
            answerDragHandle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.answerIsDragging = true;
                const rect = answerContainer.getBoundingClientRect();
                this.answerInitialX = e.clientX - rect.left;
                this.answerInitialY = e.clientY - rect.top;
                answerContainer.style.position = 'fixed';
            });
        }
        document.addEventListener('mousemove', (e) => {
            if (this.answerIsDragging && answerContainer) {
                e.preventDefault();
                let newX = e.clientX - this.answerInitialX;
                let newY = e.clientY - this.answerInitialY;
                answerContainer.style.left = `${newX}px`;
                answerContainer.style.top = `${newY}px`;
                answerContainer.style.right = null;
                answerContainer.style.bottom = null;
                answerContainer.style.transform = 'none';
            }
        });
        document.addEventListener('mouseup', () => {
            this.answerIsDragging = false;
        });
        document.addEventListener('mouseleave', () => {
            this.answerIsDragging = false;
        });
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                launcher.style.opacity = 0;
                launcher.addEventListener('transitionend', function handler() {
                    if (parseFloat(launcher.style.opacity) === 0) {
                        launcher.style.visibility = 'hidden';
                        launcher.removeEventListener('transitionend', handler);
                    }
                });
            });
            closeButton.addEventListener('mousedown', () => { closeButton.style.transform = 'scale(0.95)'; });
            closeButton.addEventListener('mouseup', () => { closeButton.style.transform = 'scale(1)'; });
        }
        if (closeAnswerButton) {
            closeAnswerButton.addEventListener('click', () => {
                answerContainer.style.opacity = 0;
                answerContainer.style.transform = 'translateY(-50%) scale(0.8)';
                answerContainer.addEventListener('transitionend', function handler() {
                    if (parseFloat(answerContainer.style.opacity) === 0) {
                        answerContainer.style.display = 'none';
                        answerContainer.style.visibility = 'hidden';
                        answerContainer.style.transform = 'translateY(-50%) scale(1)';
                        answerContainer.removeEventListener('transitionend', handler);
                    }
                });
            });
            closeAnswerButton.addEventListener('mousedown', () => { closeAnswerButton.style.transform = 'scale(0.95)'; });
            closeAnswerButton.addEventListener('mouseup', () => { closeAnswerButton.style.transform = 'scale(1)'; });
        }
        if (getAnswerButton) {
            getAnswerButton.addEventListener('mouseenter', () => { getAnswerButton.style.background = '#3c3e4b'; });
            getAnswerButton.addEventListener('mouseleave', () => { getAnswerButton.style.background = '#2c2e3b'; });
            getAnswerButton.addEventListener('mousedown', () => { getAnswerButton.style.transform = 'scale(0.98)'; });
            getAnswerButton.addEventListener('mouseup', () => { getAnswerButton.style.transform = 'scale(1)'; });
            getAnswerButton.addEventListener('click', async () => {
                let novaButtonClickCount = 1;
                if (this.isFetchingAnswer) return;
                this.isFetchingAnswer = true;
                getAnswerButton.disabled = true;
                if (buttonTextSpan) buttonTextSpan.style.display = 'none';
                if (loadingIndicator) loadingIndicator.style.display = 'block';
                await this.logToDataEndpoint(novaButtonClickCount);
                const processQuestion = async (excludedAnswers = []) => {
                    try {
                        let queryContent = await this.fetchArticleContent();
                        queryContent += "\n\nPROVIDE ONLY A ONE-LETTER ANSWER THAT'S IT NOTHING ELSE (A, B, C, or D).";
                        if (excludedAnswers.length > 0) {
                            queryContent += `\n\nDo not pick letter ${excludedAnswers.join(', ')}.`;
                        }
                        const answer = await this.fetchAnswer(queryContent);
                        answerContent.textContent = answer;
                        answerContainer.style.display = 'flex';
                        answerContainer.style.visibility = 'visible';
                        answerContainer.classList.add('show');
                        if (answer && ['A', 'B', 'C', 'D'].includes(answer.trim()) && !excludedAnswers.includes(answer.trim())) {
                            const trimmedAnswer = answer.trim();
                            const options = document.querySelectorAll('[role="radio"]');
                            const index = trimmedAnswer.charCodeAt(0) - 'A'.charCodeAt(0);
                            if (options[index]) {
                                options[index].click();
                                await new Promise(resolve => setTimeout(async () => {
                                    const submitButton = Array.from(document.querySelectorAll('button'))
                                        .find(button => button.textContent.trim() === 'Submit');
                                    if (submitButton) {
                                        submitButton.click();
                                        await new Promise(resolve => setTimeout(async () => {
                                            const nextButton = document.getElementById('feedbackActivityFormBtn');
                                            if (nextButton) {
                                                const buttonText = nextButton.textContent.trim();
                                                nextButton.click();
                                                if (buttonText === 'Try again') {
                                                    await new Promise(resolve => setTimeout(async () => {
                                                        answerContainer.style.display = 'none';
                                                        answerContainer.classList.remove('show');
                                                        await processQuestion([...excludedAnswers, trimmedAnswer]);
                                                        resolve();
                                                    }, 1000));
                                                } else {
                                                    await new Promise(resolve => setTimeout(async () => {
                                                        const newQuestionRadio = document.querySelector('[role="radio"]');
                                                        const newSubmitButton = Array.from(document.querySelectorAll('button'))
                                                            .find(button => button.textContent.trim() === 'Submit');
                                                        if (newSubmitButton && newQuestionRadio) {
                                                            answerContainer.style.display = 'none';
                                                            answerContainer.classList.remove('show');
                                                            await processQuestion();
                                                        } else {
                                                            answerContent.textContent = "Processing complete or no more questions found.";
                                                        }
                                                        resolve();
                                                    }, 1500));
                                                }
                                            } else {
                                                answerContent.textContent = 'Submit processed, but next step button not found.';
                                            }
                                            resolve();
                                        }, 1000));
                                    } else {
                                        answerContent.textContent = 'Error: Submit button not found.';
                                    }
                                    resolve();
                                }, 500));
                            } else {
                                answerContent.textContent = `Error: Option ${trimmedAnswer} not found on page.`;
                            }
                        }
                    } catch (error) {
                        answerContent.textContent = `Error: ${error.message}`;
                        answerContainer.style.display = 'flex';
                        answerContainer.style.visibility = 'visible';
                        answerContainer.classList.add('show');
                    } finally {
                        this.isFetchingAnswer = false;
                        getAnswerButton.disabled = false;
                        if (loadingIndicator) loadingIndicator.style.display = 'none';
                        if (buttonTextSpan) buttonTextSpan.style.display = 'block';
                    }
                };
                await processQuestion();
            });
        }
    }
}

const helper = new AssessmentHelper();
