document.addEventListener("DOMContentLoaded", () => {

    gsap.registerPlugin(ScrollTrigger);

    const cover = document.getElementById("cover-page");
    const viewport = document.getElementById("viewport");
    const pages = gsap.utils.toArray(".page");

    // --- 1. Cover Interaction (Intro) ---
    if (cover) {
        
        // Setup: Ensure the main content is visible BEHIND the cover
        // but hide the text elements on Page 1 so they can animate in later
        gsap.set(viewport, { autoAlpha: 1 }); // Viewport is now waiting behind cover
        gsap.set("#page-1 .hero-name-inner, #page-1 .pill, #page-1 .bio-text", { 
            y: 30, 
            autoAlpha: 0 
        });

        function openBook() {
            // 1. HORIZONTAL SLIDE: Move the cover 100% to the left
            gsap.to(cover, {
                xPercent: -100,  // Moves entirely to the left
                duration: 1.5,   // Slower duration for a smooth "heavy" feel
                ease: "power3.inOut",
                onComplete: () => {
                    cover.style.display = "none";
                    document.body.style.overflowY = "auto"; 
                    initMainAnimations();
                }
            });
            
            // 2. Animate Page 1 Content (Slide Up)
            gsap.to("#page-1 .hero-name-inner, #page-1 .pill, #page-1 .bio-text", {
                y: 0,
                autoAlpha: 1,
                duration: 1,
                stagger: 0.1,
                ease: "power2.out",
                delay: 0.5 // Wait until cover has slid halfway
            });
        }

        // Desktop: double-click
        cover.addEventListener("dblclick", openBook);

        // Mobile / touch: double-tap (dblclick is unreliable on touch devices)
        let lastTap = 0;
        cover.addEventListener("touchend", (e) => {
            e.preventDefault();
            const now = Date.now();
            if (now - lastTap <= 400) {
                lastTap = 0;
                openBook();
            } else {
                lastTap = now;
            }
        }, { passive: false });
    }

    // --- 2. Main Animation Logic ---
    function initMainAnimations() {
        ScrollTrigger.matchMedia({
            "(min-width: 769px)": function() {
                const scrollLimit = pages.length - 2;
                let scrollTween = gsap.to(pages, {
                    xPercent: -100 * scrollLimit,
                    ease: "none",
                    scrollTrigger: {
                        trigger: "#viewport",
                        pin: true,
                        scrub: 1.2,
                        snap: {
                            snapTo: 1 / scrollLimit,
                            duration: { min: 0.3, max: 0.6 },
                            ease: "power2.inOut",
                            delay: 0
                        },
                        end: "+=3500",
                    }
                });

                const closeBtn = document.getElementById("close-book-btn");
                if (closeBtn) {
                    const newBtn = closeBtn.cloneNode(true);
                    closeBtn.parentNode.replaceChild(newBtn, closeBtn);
                    newBtn.addEventListener("dblclick", () => {
                        gsap.to(pages, {
                            xPercent: -100 * (pages.length - 1),
                            duration: 1.5,
                            ease: "power2.inOut"
                        });
                        gsap.to(newBtn, { autoAlpha: 0, duration: 0.3 });
                    });
                }

                gsap.from(".project-card", {
                    y: 100, opacity: 0, duration: 0.8, stagger: 0.2,
                    scrollTrigger: {
                        trigger: "#page-2",
                        containerAnimation: scrollTween,
                        start: "left 60%",
                        toggleActions: "play none none reverse"
                    }
                });

                gsap.fromTo(".writing-item",
                    { x: 50, autoAlpha: 0 },
                    { x: 0, autoAlpha: 1, duration: 1, stagger: 0.15,
                        scrollTrigger: {
                            trigger: "#page-3",
                            containerAnimation: scrollTween,
                            start: "left 85%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );

                gsap.from(".design-block", {
                    scale: 0.8, opacity: 0, duration: 0.8, stagger: 0.1,
                    scrollTrigger: {
                        trigger: "#page-4",
                        containerAnimation: scrollTween,
                        start: "left 60%",
                        toggleActions: "play none none reverse"
                    }
                });
            },

            "(max-width: 768px)": function() {
                gsap.set(viewport, { autoAlpha: 1 });
                if (cover) gsap.set(cover, { display: "none" });
                document.body.style.overflowY = "auto";

                pages.forEach((page) => {
                    if (page.id === "page-1") return;
                    if (page.id === "page-3") return;
                    let elements = page.querySelectorAll("h1, h2, p, .card, .writing-item, .design-block, .contact-link");
                    if (elements.length > 0) {
                        gsap.from(elements, {
                            y: 50, opacity: 0, duration: 0.8, stagger: 0.1,
                            scrollTrigger: {
                                trigger: page,
                                start: "top 95%",
                                end: "bottom 5%",
                                toggleActions: "play none none reverse"
                            }
                        });
                    }
                });
                ScrollTrigger.refresh();
            }
        });
    }

    // Do not auto-init on mobile: keep landing page visible until user double-taps to open
});