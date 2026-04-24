<script>
            const API_URL = "https://script.google.com/macros/s/AKfycbxu59eNH8lSjsVwHRrhxj1eBlM6ZLViupjrVswvFhVsqKaj3NsLnOrS01RlwSNswaGyFA/exec";


            const adList = [{
                    url: "https://youtu.be/f-9IaGAlgEA",
                    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiNieRjpuAX6e4AHXvGRMn0CzkmKbsfhzMyuzjyalisdj0dHeMPVBtsgvccxMDbaxnRhvnwe-OJ9qo6V7UIeQ7YjsKjbssmiRvUtro9P4OCDywKHthNAWlIjBIbt5ZrhaZqs20imAxkoiYgCKiVach-sZLDOoGxPIjroz4dC6Br5g4w5GCFbiXegdXVHp8/s1600/channels4_banner.jpg"
                },
                {
                    url: "https://youtu.be/w0D_wOJa21g",
                    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjhoLzti-0_KPDHfuyXn7-rA44nmc0Z5ZyTEczCHC5aufsSsUXsT_kGPs06AQS7ulK33MyI0lKdV_M0GN3hTCPL3B3tcUx9heblAe_CRIyQJVaIxQTHf5AwcMliiLQL9lMJPfJ0irrov5Fx6UYHPIbA5gDd0Le_xOy7JRG_wOV6Q15i4AMNpA62-So_h_c/s1600/channels4_banner%20%281%29.jpg"
                },
                {
                    url: "https://youtu.be/JUhcNNwha7w",
                    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhBjBKO0cS9k1KqrBX4kJ0Q63NGN8nN28jRpsQkqL8I2eD3fdlfkYdrOycjrMzOfSt0ysAqfpxHE4W6HMdyFUbTsiXUAX6S_g-8VukWsqyOc92nuqmvdYNwoe3eo1maXjGWQlh_-KifhHrNjlSez7jzLHoQ6By12AXkOHiaD2hyphenhyphenrx2TXYkBR0zz-yi3on4/s320/channels4_banner%20%282%29.jpg"
                }
            ];
        </script>
      
      
      
      
      
      
      
      
      
       <script>
           
           

        
            let userLoc = {
                lat: 0,
                lon: 0
            };
            let userData = null;
            let selectedRange = 100;
            let base64Image = "";
            let currentId = null;
            let allNewsData = [];
            let editingNewsId = null;
            let editInterval = null;

            function disableKeys(e) {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return true;
                if (e.keyCode == 123) return false;
                if (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) return false;
                if (e.ctrlKey && e.keyCode == 85) return false;
            }

            window.onload = () => {
                checkSavedLogin();
                if (!userData) {
                    setTimeout(() => {
                        if (window.google) google.accounts.id.prompt();
                    }, 1500);
                }
                navigator.geolocation.getCurrentPosition(pos => {
                    userLoc = {
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude
                    };
                    fetchNews();
                }, () => {
                    fetchNews();
                });
                startAdRotation();
            };

            function checkSavedLogin() {
                const saved = localStorage.getItem("baithkee_user");
                if (saved) {
                    userData = JSON.parse(saved);
                    document.getElementById("authContainer").style.display = "none";
                    document.getElementById("userMenu").style.display = "flex";
                    document.getElementById("navProfilePic").src = userData.photo;
                }
            }

            function handleCredentialResponse(response) {
                const payload = JSON.parse(atob(response.credential.split('.')[1]));
                userData = {
                    name: payload.name,
                    email: payload.email,
                    photo: payload.picture
                };
                localStorage.setItem("baithkee_user", JSON.stringify(userData));
                document.getElementById("authContainer").style.display = "none";
                document.getElementById("userMenu").style.display = "flex";
                document.getElementById("navProfilePic").src = userData.photo;
                showToast("लॉगिन सफल!");


                fetch(API_URL, {
                    method: "POST",
                    body: JSON.stringify({
                        action: "saveUser",
                        email: userData.email,
                        name: userData.name,
                        photo: userData.photo
                    })
                }).catch(err => console.log("User save error", err));

                fetchNews();
            }

            function toggleMenu(menuId) {
                const d = document.getElementById(menuId);
                d.style.display = (d.style.display === "block") ? "none" : "block";
            }

            function logoutUser() {
                localStorage.removeItem("baithkee_user");
                location.reload();
            }

            function showToast(msg) {
                let toast = document.getElementById("toastMsg");
                toast.innerText = msg;
                toast.classList.add("show");
                setTimeout(() => toast.classList.remove("show"), 3000);
            }

            function checkAuth() {
                if (!userData) {
                    showToast("लॉगिन आवश्यक है!");
                    if (window.google) google.accounts.id.prompt();
                } else {
                    document.getElementById("publishOverlay").style.display = 'flex';
                }
            }

            function loadSkeletons() {
                document.getElementById("loadingState").style.display = "block";
                let h = "";
                for (let i = 0; i < 4; i++) {
                    h += `<div class="skeleton-strip"><div class="skeleton-img skeleton"></div><div style="flex:1; display:flex; flex-direction:column; justify-content:center;"><div class="skeleton-text skeleton" style="width:90%"></div><div class="skeleton-text skeleton" style="width:60%"></div></div></div>`;
                }
                document.getElementById("newsContainer").innerHTML = h;
            }

            async function fetchNews() {
                loadSkeletons();
                const urlParams = new URLSearchParams(window.location.search);
                const newsId = urlParams.get('news') || "";

                try {
                    const res = await fetch(`${API_URL}?action=getNews&lat=${userLoc.lat}&lon=${userLoc.lon}&range=${selectedRange}&newsId=${newsId}`);
                    const responseText = await res.text();

                    if (responseText === "blocked") {
                        document.getElementById("loadingState").style.display = "none";
                        document.getElementById("newsContainer").innerHTML = `<h3 style="text-align:center; color:red; margin-top:50px;">नियमों का उल्लंघन करने के कारण आपका अकाउंट ब्लॉक कर दिया गया है।</h3>`;
                        return;
                    }

                    allNewsData = JSON.parse(responseText);
                    document.getElementById("loadingState").style.display = "none";
                    renderNews(allNewsData);

                    if (newsId) {
                        const sharedNews = allNewsData.find(n => n.id == newsId);
                        if (sharedNews) {
                            showDetail(sharedNews);
                            window.history.replaceState({}, document.title, window.location.pathname);
                        }
                    }
                } catch (e) {
                    console.log(e);
                    document.getElementById("loadingState").style.display = "none";
                }
            }

            function filterNews(query) {
                let clearBtn = document.getElementById("clearSearch");
                if (!query) {
                    clearBtn.style.display = "none";
                    return renderNews(allNewsData);
                }
                clearBtn.style.display = "block";
                let lowerQ = query.toLowerCase();
                let filtered = allNewsData.filter(n => n.headline.toLowerCase().includes(lowerQ) || (n.locationName && n.locationName.toLowerCase().includes(lowerQ)) || (n.text && n.text.toLowerCase().includes(lowerQ)));
                renderNews(filtered);
            }

            function clearSearchField() {
                document.getElementById("searchInput").value = "";
                filterNews("");
            }

            function renderNews(data) {
                const container = document.getElementById("newsContainer");
                container.innerHTML = "";

                if (data.length === 0) {
                    container.innerHTML = `<h3 style="text-align:center; color:var(--gray); margin-top:50px; line-height: 1.6;"> कोई खबर नहीं मिली।<br> <span style="font-size: 16px;">आप खुद अपने आस-पास की खबरों को यहाँ पब्लिश कर सकते हैं।</span><br> <span style="font-size: 14px;">न्यूज़ पोस्ट करने के लिए नीचे <b style="color:var(--primary); font-size:20px;">【+】</b> आइकॉन वाले बटन पर क्लिक कीजिए।</span> </h3>`;
                    return;
                }

                data.forEach((item, index) => {
                    let thumb = item.image ? `<img class="strip-img" src="${item.image}">` : `<div class="strip-img" style="display:flex; align-items:center; justify-content:center; font-size:30px;">📰</div>`;
                    const strip = document.createElement("div");
                    strip.className = "newsStrip";
                    strip.id = "strip_" + item.id;

                    strip.innerHTML = ` 
                ${thumb} 
                <div class="strip-content"> 
                    <div class="headlineText">${item.headline}</div> 
                    <div class="strip-meta"> 
                        <div class="meta-box left"><span class="meta-label">लोकेशन</span><span class="meta-item locTag"><span style="display:inline-block; max-width:100%; overflow:hidden; text-overflow:ellipsis;">${item.locationName}</span></span></div> 
                        <div class="meta-box center"><span class="meta-label">व्यूज़</span><span class="meta-item viewsTag" id="stripView_${item.id}">${formatNumber(item.views)}</span></div> 
                        <div class="meta-box right"><span class="meta-label">समय</span><span class="meta-item timeTag" id="stripTime_${item.id}">${getTimeAgo(item.time)}</span></div> 
                    </div> 
                </div> 
            `;
                    strip.onclick = () => showDetail(item);
                    container.appendChild(strip);

                    if ((index + 1) % 5 === 0) {
                        insertAdStrip(container);
                    }
                });

                if (data.length > 0 && data.length < 5) {
                    insertAdStrip(container);
                }
            }

            function insertAdStrip(container) {
                let randomAd = adList[Math.floor(Math.random() * adList.length)];
                let adEl = document.createElement("a");
                adEl.className = "ad-strip dynamic-ad";
                adEl.href = randomAd.url;
                adEl.target = "_blank";
                adEl.innerHTML = `<span class="ad-label">SPONSORED</span><img class="ad-img" src="${randomAd.img}">`;
                container.appendChild(adEl);
            }

            function startAdRotation() {
                setInterval(() => {
                    document.querySelectorAll('.dynamic-ad .ad-img').forEach(img => {
                        let newAd = adList[Math.floor(Math.random() * adList.length)];
                        img.src = newAd.img;
                        if (img.closest('a')) img.closest('a').href = newAd.url;
                    });
                }, 4000);
            }

            function showDetail(item) {
                currentId = item.id;
                document.getElementById("pImg").src = item.photo;
                document.getElementById("pName").innerText = item.username;
                document.getElementById("pTime").innerText = "📍 " + item.locationName;
                document.getElementById("pHeadline").innerText = item.headline;


                if (item.hideBlueTick) {
                    document.getElementById("verifiedBadge").style.display = "none";
                } else {
                    document.getElementById("verifiedBadge").style.display = "inline-block";
                }


                let contentHTML = "";
                if (item.isEdited) {
                    contentHTML += `<span class="edited-tag">Edited</span> `;
                }
                contentHTML += item.text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
                document.getElementById("pContent").innerHTML = contentHTML;


                clearInterval(editInterval);
                let editBtn = document.getElementById("editNewsBtn");
                let delBtn = document.getElementById("deleteNewsBtn");
                let timerText = document.getElementById("editTimerText");

                if (userData && userData.email === item.email) {
                    delBtn.style.display = "block";

                    let updateTimer = () => {
                        let timeLeft = (item.time + 5 * 60 * 1000) - Date.now(); // 5 मिनट का हिसाब
                        if (timeLeft <= 0) {
                            editBtn.style.display = "none";
                            clearInterval(editInterval);
                        } else {
                            editBtn.style.display = "block";
                            let m = Math.floor(timeLeft / 60000);
                            let s = Math.floor((timeLeft % 60000) / 1000);
                            timerText.innerText = `(${m}:${s < 10 ? '0' : ''}${s} शेष)`;
                        }
                    };

                    updateTimer();
                    editInterval = setInterval(updateTimer, 1000);
                } else {
                    editBtn.style.display = "none";
                    delBtn.style.display = "none";
                }

                document.getElementById("pImages").innerHTML = item.image ? `<div class="premium-frame"><img src="${item.image}"></div>` : "";

                let exactDateObj = new Date(item.time);
                let exactOptions = {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                };
                document.getElementById("pExactTime").innerText = exactDateObj.toLocaleString('en-IN', exactOptions);

                // Bottom Ad Insert Logic
                let bottomAd = adList[Math.floor(Math.random() * adList.length)];
                document.getElementById("bottomAdContainer").innerHTML = `
            <a class="ad-strip dynamic-ad" href="${bottomAd.url}" target="_blank" style="margin: 0; display: block; text-decoration: none; background: #fffbe6; border: 1px solid #ffe58f; border-radius: 4px; padding: 4px;">
                <span class="ad-label" style="font-size: 5px; color: #d48806; font-weight: bold; margin-bottom: 4px; display: block; text-align: center;">SPONSORED</span>
                <img class="ad-img" src="${bottomAd.img}" style="width: 100%; height: 100%; border-radius: 2px; object-fit: 100% 100%;">
            </a>`;

                document.getElementById("detailOverlay").style.display = "flex";
                fetch(`${API_URL}?action=addView&id=${item.id}`);
                item.views = Number(item.views) + 1;
                document.getElementById("pViews").innerText = formatNumber(item.views) + " Views";
                let stripView = document.getElementById("stripView_" + item.id);
                if (stripView) stripView.innerText = "" + formatNumber(item.views);

                document.getElementById("detailPopupContent").scrollTop = 0;
            }

            let isReading = false;

            function toggleReader() {
                let btn = document.getElementById("ttsBtn");
                if (isReading) {
                    window.speechSynthesis.cancel();
                    isReading = false;
                    btn.innerHTML = "🔊";
                    return;
                }
                let textToRead = document.getElementById("pHeadline").innerText + ". " + document.getElementById("pContent").innerText;
                let speech = new SpeechSynthesisUtterance(textToRead);
                speech.lang = 'hi-IN';
                speech.rate = 0.9;
                speech.onend = () => {
                    isReading = false;
                    btn.innerHTML = "🔊";
                };
                speech.onerror = () => {
                    isReading = false;
                    btn.innerHTML = "🔊";
                };
                isReading = true;
                btn.innerHTML = "🔇";
                window.speechSynthesis.speak(speech);
            }

            function getTimeAgo(ts) {
                let diff = Math.floor((new Date().getTime() - ts) / 1000);
                if (diff < 60) return diff + "s ago";
                if (diff < 3600) return Math.floor(diff / 60) + "m ago";
                return Math.floor(diff / 3600) + "h ago";
            }

            function formatNumber(v) {
                if (v >= 1000) return (v / 1000).toFixed(1) + "K";
                return v;
            }

            function closePopup(e, id) {
                if (e.target.id === id) closeWithAnimation(id);
            }

            function closeWithAnimation(id) {
                window.speechSynthesis.cancel();
                isReading = false;
                clearInterval(editInterval);

                if (document.getElementById("ttsBtn")) document.getElementById("ttsBtn").innerHTML = "🔊";
                let popup = document.querySelector(`#${id} .popup`);
                popup.style.animation = "slideDown 0.3s ease-in forwards";
                setTimeout(() => {
                    document.getElementById(id).style.display = 'none';
                    popup.style.animation = "slideUp 0.3s ease-out";
                }, 280);
            }

            function shareNews() {
                let shareUrl = window.location.href.split('?')[0] + "?news=" + currentId;
                let title = document.getElementById("pHeadline").innerText;
                if (navigator.share) {
                    navigator.share({
                        title: 'BaithKee News Local Updates',
                        text: title,
                        url: shareUrl
                    });
                } else {
                    navigator.clipboard.writeText(shareUrl);
                    showToast("लिंक कॉपी हो गया!");
                }
            }

            async function reportNews() {
                if (!userData) {
                    showToast("लॉगिन करें!");
                    return;
                }
                showToast("रिपोर्ट दर्ज़ की जा रही है...");
                await fetch(`${API_URL}?action=report&id=${currentId}&email=${userData.email}`);
                showToast("धन्यवाद! न्यूज़ को रिपोर्ट कर दिया गया है।");
                closeWithAnimation("detailOverlay");
            }

            function updateRange() {
                selectedRange = document.getElementById("rangeSlider").value;
                closeWithAnimation("rangeOverlay");
                fetchNews();
            }

            function previewSingleImage(e) {
                const file = e.target.files[0];
                if (!file) return;
                document.getElementById("uploadLabel").innerText = "⏳ फोटो प्रोसेस हो रही है...";
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    let img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        let canvas = document.createElement('canvas');
                        let MAX_WIDTH = 400;
                        let scale = img.width > MAX_WIDTH ? (MAX_WIDTH / img.width) : 1;
                        canvas.width = img.width * scale;
                        canvas.height = img.height * scale;
                        let ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        base64Image = canvas.toDataURL('image/jpeg', 0.4);
                        document.getElementById("imgPreviewArea").innerHTML = `<img src="${base64Image}" style="width:100px; height:100px; object-fit:cover; border-radius:12px; border: 2px solid var(--primary);">`;
                        document.getElementById("uploadLabel").innerText = "✅ फोटो सेलेक्ट हो गई";
                    };
                };
            }

            async function publishNews() {
                const head = document.getElementById("headInput").value;
                const body = document.getElementById("bodyInput").value;
                const loc = document.getElementById("locInput").value;

                if (!head || !body || !loc) return showToast("Headline, Details aur Location भरना जरूरी है!");


                document.getElementById("submitBtn").disabled = true;
                document.getElementById("submitText").innerText = "खबर पब्लिश हो रही है...";
                document.getElementById("submitLoader").style.display = "block";

                const payload = {
                    action: editingNewsId ? "editNews" : "postNews",
                    id: editingNewsId,
                    headline: head,
                    text: body,
                    imageUrl: base64Image,
                    locationName: loc,
                    username: userData.name,
                    email: userData.email,
                    photo: userData.photo,
                    latitude: userLoc.lat,
                    longitude: userLoc.lon
                };

                try {
                    await fetch(API_URL, {
                        method: "POST",
                        body: JSON.stringify(payload)
                    });
                    showToast(editingNewsId ? "खबर अपडेट हो गई!" : "खबर पब्लिश हो गई");


                    document.getElementById("headInput").value = "";
                    document.getElementById("bodyInput").value = "";
                    document.getElementById("locInput").value = "";
                    document.getElementById("imgInput").value = "";
                    document.getElementById("imgPreviewArea").innerHTML = "";
                    document.getElementById("uploadLabel").innerText = "📸 1 फोटो चुनें (Optional)";
                    base64Image = "";
                    editingNewsId = null;

                } catch (err) {
                    console.log(err);
                    showToast("Process में दिक्कत आई, दोबारा try करें!");
                }


                document.getElementById("submitBtn").disabled = false;
                document.getElementById("submitText").innerText = "खबर पब्लिश करें";
                document.getElementById("submitLoader").style.display = "none";


                closeWithAnimation("publishOverlay");
                fetchNews();
            }

            function openEditMode() {
                let item = allNewsData.find(n => n.id === currentId);
                if (!item) return;

                document.getElementById("headInput").value = item.headline;
                document.getElementById("bodyInput").value = item.text;
                document.getElementById("locInput").value = item.locationName;

                if (item.image) {
                    base64Image = item.image;
                    document.getElementById("imgPreviewArea").innerHTML = `<img src="${item.image}" style="width:100px; height:100px; object-fit:cover; border-radius:12px; border: 2px solid var(--primary);">`;
                    document.getElementById("uploadLabel").innerText = "✅ पुरानी फोटो लोडेड (बदलने के लिए क्लिक करें)";
                } else {
                    base64Image = "";
                    document.getElementById("imgPreviewArea").innerHTML = "";
                    document.getElementById("uploadLabel").innerText = "📸 1 फोटो चुनें (Optional)";
                }

                editingNewsId = item.id;
                document.getElementById("submitText").innerText = "अपडेट करें";

                closeWithAnimation('detailOverlay');
                setTimeout(() => {
                    document.getElementById("publishOverlay").style.display = 'flex';
                }, 300);
            }


            function askDeleteConfirm() {
                document.getElementById("deleteConfirmOverlay").style.display = "flex";
            }

            function closeDeleteConfirm() {
                document.getElementById("deleteConfirmOverlay").style.display = "none";
            }

            async function proceedToDelete() {
                closeDeleteConfirm();
                showToast("न्यूज़ डिलीट की जा रही है...");
                document.getElementById("deleteNewsBtn").innerText = "⏳...";

                try {
                    let res = await fetch(`${API_URL}?action=deleteNews&id=${currentId}&email=${userData.email}`);
                    let text = await res.text();
                    if (text === "deleted") {
                        showToast("न्यूज़ सफलतापूर्वक डिलीट हो गई!");
                        closeWithAnimation('detailOverlay');
                        fetchNews();
                    } else {
                        showToast("एरर: न्यूज़ डिलीट नहीं हो पाई।");
                    }
                } catch (e) {
                    showToast("सर्वर एरर!");
                }

                document.getElementById("deleteNewsBtn").innerHTML = "🗑️ डिलीट करें";
            }

            let deferredPrompt;
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                setTimeout(() => {
                    document.getElementById('installBanner').style.display = 'block';
                }, 2000);
            });

            document.getElementById('downloadAppBtn').addEventListener('click', async () => {
                document.getElementById('installBanner').style.display = 'none';
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const {
                        outcome
                    } = await deferredPrompt.userChoice;
                    deferredPrompt = null;
                }
            });

            window.onclick = function(event) {
                if (!event.target.closest('.brand-menu')) {
                    const brandDrop = document.getElementById('brandDropdown');
                    if (brandDrop && brandDrop.style.display === 'block') brandDrop.style.display = 'none';
                }
                if (!event.target.closest('.user-menu')) {
                    const profileDrop = document.getElementById('profileDropdown');
                    if (profileDrop && profileDrop.style.display === 'block') profileDrop.style.display = 'none';
                }
            };

            setInterval(() => {

                if (allNewsData && allNewsData.length > 0) {
                    allNewsData.forEach(item => {

                        let timeElement = document.getElementById("stripTime_" + item.id);
                        if (timeElement) {

                            timeElement.innerText = getTimeAgo(item.time);
                        }
                    });
                }
            }, 1000);



            function toggleTheme() {
                let body = document.body;
                let btn = document.getElementById("themeToggleBtn");
                body.classList.toggle("dark-mode");

                let isDark = body.classList.contains("dark-mode");
                localStorage.setItem("localupdates_theme", isDark ? "dark" : "light");
                btn.innerText = isDark ? "☀️ लाइट मोड" : "🌚 डार्क मोड";
            }


            let savedTheme = localStorage.getItem("localupdates_theme");
            if (savedTheme === "dark") {
                document.body.classList.add("dark-mode");
                document.getElementById("themeToggleBtn").innerText = "☀️ लाइट मोड";
            }
      

       
           
       </script>
       

<script>
            function shareApplication() {
                const appUrl = "https://baithkeenews.blogspot.com"; //"https://tinyurl.com/mry6tfmp";//


                const shareText = "🎤 आप खुद बनें रिपोर्टर: कहीं कुछ गलत हो रहा है या कोई अच्छा काम हुआ है? बस 1 क्लिक करें और अपनी ख़बर फोटो के साथ खुद पब्लिश करें\n\nसिर्फ सच्ची ख़बरें: कोई अफवाह या फालतू अलर्ट नहीं, सिर्फ आपके एरिया की काम की बातें।\n\nतो इंतज़ार किस बात का? आज ही अपने लोकल नेटवर्क से जुड़ें और अपनी आवाज़ को एक नई ताक़त दें। 👇 नीचे दिए गए लिंक पर *क्लिक करें* और *BaithKee News* - Local Updates से अभी जुड़ें:\n\n" + appUrl;


                let whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;


                window.open(whatsappUrl, '_blank');
            }
        </script>