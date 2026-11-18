(() => {
  // Optional host adapter: website embeds and Chrome use this same UI/runtime.
  const host = globalThis.__roseWidgetHost || null;
  if (host?.controller) { host.controller.open(); return; }
  const script = host?.script || document.currentScript;
  const localStorage = host?.storage || globalThis.localStorage;
  const sessionStorage = host?.storage || globalThis.sessionStorage;
  const cfg = {
    apiBase: script?.dataset.apiBase || "",
    title: script?.dataset.partnerDelivery === "true" ? "Rose" : script?.dataset.title || "Rose",
    businessName: script?.dataset.businessName || script?.dataset.company || "This site",
    accent: script?.dataset.accent || "#ff5722",
    logo: script?.dataset.logo || "/rose-mark.svg",
    ownerEmail: script?.dataset.ownerEmail || script?.dataset.leadEmail || script?.dataset.notificationEmail || "",
    fallbackUrl: script?.dataset.fallbackUrl || "",
    businessId: script?.dataset.businessId || script?.dataset.clientId || "",
    mount: script?.dataset.mount || "",
    inline: script?.dataset.inline === "true",
    contained: script?.dataset.contained === "true",
    desktopSidePanel: script?.dataset.desktopSidePanel === "true",
    toolsReview: script?.dataset.toolsReview === "true",
    toolsConfigUrl: script?.dataset.toolsConfigUrl || "",
    subtitle: script?.dataset.subtitle || "Connected to this site",
    greeting: script?.dataset.greeting || "What are you trying to do on this site?",
    placeholder: script?.dataset.placeholder || "Ask about this site…",
    website: script?.dataset.website || "",
    businessContext: script?.dataset.businessContext || "",
    services: script?.dataset.services || "",
    defaultView: script?.dataset.defaultView || (script?.dataset.inline === "true" ? "chat" : "voice"),
    shopping: script?.dataset.shopping !== "false",
    panelSize: script?.dataset.panelSize || "",
    partnerDelivery: script?.dataset.partnerDelivery === "true",
    partnerId: script?.dataset.partnerDelivery === "true" ? new URL(script?.src || location.href, location.href).searchParams.get('partner') || '' : '',
  };
  const widgetOptions = { navigation: true, autoOpen: true, productSuggestions: true, cartActions: true, voiceNavigation: true, siteControls: true };
  const settingsReady = cfg.apiBase && cfg.businessId ? fetch(`${cfg.apiBase}/api/rose-public-config?businessId=${encodeURIComponent(cfg.businessId)}${cfg.partnerDelivery ? `&partnerDelivery=1&partner=${encodeURIComponent(cfg.partnerId)}` : ''}`)
    .then(response => response.ok ? response.json() : null)
    .then(data => {
      if (cfg.partnerDelivery) {
        if (data?.widgetActive !== true || data?.config?.status !== 'published') { root.remove(); return; }
        root.classList.remove('wr-awaiting-activation');
      }
      const appearance = data?.config?.appearance || {};
      const saved = data?.config?.settings || {};
      for (const [key, field] of Object.entries({ navigation: "widgetNavigation", autoOpen: "widgetAutoOpen", productSuggestions: "widgetProductSuggestions", cartActions: "widgetCartActions", voiceNavigation: "widgetVoiceNavigation", siteControls: "widgetSiteControls" })) {
        if (typeof saved[field] === "boolean") widgetOptions[key] = saved[field];
      }
      cfg.shopping = cfg.shopping && widgetOptions.productSuggestions;
      if (data?.config?.status === "published") {
        cfg.businessName = String(saved.businessName || cfg.businessName).slice(0, 120);
        const configuredName = String(appearance.assistantName || cfg.title).trim().slice(0, 80);
        const assistantName = cfg.partnerDelivery ? "Rose" : configuredName || "Rose";
        const subtitle = String(appearance.greetingMessage || "").trim();
        cfg.title = assistantName;
        root.querySelector(".wr-title h3").textContent = assistantName;
        if (!cfg.partnerDelivery && subtitle && subtitle !== "AI intake assistant") root.querySelector(".wr-title small").textContent = subtitle.slice(0, 100);
        const greeting = cfg.partnerDelivery && saved.demoMode !== true ? `Hi, I'm ${assistantName}. How can I help you with ${cfg.businessName}?` : String(saved.demoMode === true ? (subtitle || `Hi, I'm Rose. This is a fictional demo for ${cfg.businessName}; no requests are sent.`) : (saved.assistantIntro || (subtitle && subtitle !== "AI intake assistant" ? subtitle : `Hi, I'm ${assistantName}. How can I help you with ${cfg.businessName}?`))).slice(0, 400);
        const initialGreeting = root.querySelector(".wr-chat-log .wr-msg.bot");
        if (initialGreeting?.textContent === cfg.greeting) initialGreeting.textContent = greeting;
        if (/^#[0-9a-f]{6}$/i.test(appearance.brandPrimary || "")) root.style.setProperty("--accent", appearance.brandPrimary);
        if (!cfg.partnerDelivery || !new RegExp('wild' + 'roseautomations|wilde' + 'automations', 'i').test(appearance.avatarUrl || "")) try {
          const logo = new URL(appearance.avatarUrl);
          if (logo.protocol === "https:") root.querySelectorAll("img").forEach(img => { img.src = logo.href; });
        } catch {}
      }
      if (!widgetOptions.cartActions) root.querySelectorAll(".wr-product-actions button").forEach(button => button.remove());
      if (!widgetOptions.navigation) root.querySelectorAll('[data-rose-page-results="true"]').forEach(list => list.remove());
    }).catch(() => { if (cfg.partnerDelivery) root.remove(); }) : Promise.resolve();
  const fallbackHref = /^https:\/\//i.test(cfg.fallbackUrl) || /^mailto:[^\s@]+@[^\s@]+$/i.test(cfg.fallbackUrl)
    ? cfg.fallbackUrl
    : /^[^\s@]+@[^\s@]+$/.test(cfg.ownerEmail) ? `mailto:${cfg.ownerEmail}` : "";

  const css = `
    .wr-ai,.wr-ai *{box-sizing:border-box}
    .wr-ai.wr-awaiting-activation{display:none!important}
    .wr-ai{
      --accent:${cfg.accent};
      --accent-soft:color-mix(in srgb,var(--accent) 32%,white);
      --glass:rgba(255,255,255,.34);
      --glass-strong:rgba(255,255,255,.56);
      --ink:#18120f;
      --muted:#554b45;
      position:fixed;right:22px;bottom:22px;z-index:2147483000;
      font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif;
      color:var(--ink);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
    }
    .wr-ai.inline{position:relative;right:auto;bottom:auto;width:min(430px,100%);margin:0 auto;z-index:3}.wr-ai.inline:before{right:50%;bottom:50%;transform:translate(50%,50%);width:280px;height:280px}.wr-ai.inline .wr-fab{display:none!important}.wr-ai.inline .wr-close{display:none}.wr-ai.inline .wr-panel{position:relative;right:auto;bottom:auto;display:grid;width:100%;height:560px}.wr-ai.inline .wr-panel.open{display:grid;animation:none}.wr-ai.contained{position:absolute;right:18px;bottom:18px;z-index:20}.wr-ai.contained .wr-panel{width:min(390px,calc(100vw - 52px));height:min(570px,calc(100vh - 110px))}@media (max-width:720px){.wr-ai.contained{right:12px;bottom:12px}.wr-ai.contained .wr-panel{width:min(360px,calc(100vw - 36px));height:min(560px,calc(100vh - 92px))}}
    .wr-ai:before{content:"";position:absolute;right:-26px;bottom:-26px;width:176px;height:176px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--accent) 28%,transparent),color-mix(in srgb,var(--accent) 0%,transparent) 68%);filter:blur(10px);pointer-events:none;opacity:.9}
    .wr-fab{width:76px;height:76px;border:0;padding:0;border-radius:28px;display:grid;place-items:center;cursor:pointer;background:linear-gradient(145deg,rgba(255,255,255,.66),rgba(255,255,255,.22));box-shadow:0 26px 70px rgba(34,20,14,.24),0 0 0 1px rgba(255,255,255,.55),inset 0 1px 0 rgba(255,255,255,.95),inset 0 -1px 0 rgba(255,255,255,.24);backdrop-filter:blur(34px) saturate(1.55);-webkit-backdrop-filter:blur(34px) saturate(1.55);transition:transform .22s cubic-bezier(.2,.8,.2,1),box-shadow .22s ease,filter .22s ease;position:relative;overflow:hidden}
    .wr-fab:before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(135deg,rgba(255,255,255,.92),rgba(255,255,255,0) 38%,color-mix(in srgb,var(--accent) 18%,transparent) 100%);mix-blend-mode:screen;pointer-events:none}
    .wr-fab:after{content:"";position:absolute;inset:9px;border-radius:22px;border:1px solid rgba(255,255,255,.42);pointer-events:none}
    .wr-fab:hover{transform:translateY(-4px) scale(1.035);box-shadow:0 34px 86px rgba(34,20,14,.30),0 0 0 1px rgba(255,255,255,.70),0 0 36px color-mix(in srgb,var(--accent) 18%,transparent),inset 0 1px 0 rgba(255,255,255,.98)}
    .wr-dot{width:56px;height:56px;border-radius:20px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(255,255,255,.72),rgba(255,255,255,.26));box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 12px 30px rgba(36,20,12,.15);overflow:hidden;position:relative}.wr-dot img{width:92%;height:92%;object-fit:contain;filter:drop-shadow(0 5px 12px rgba(0,0,0,.14))}
    .wr-panel{position:absolute;right:0;bottom:0;width:min(382px,calc(100vw - 24px));height:min(578px,calc(100vh - 24px));display:none;grid-template-rows:auto auto 1fr auto;overflow:hidden;border-radius:38px;background:linear-gradient(145deg,#fffefd,color-mix(in srgb,var(--accent) 7%,white) 46%,color-mix(in srgb,var(--accent) 16%,white));border:1px solid rgba(255,255,255,.75);box-shadow:0 34px 110px rgba(29,18,12,.28),0 0 0 1px rgba(255,255,255,.28),inset 0 1px 0 rgba(255,255,255,.92),inset 0 -1px 0 rgba(255,255,255,.20);backdrop-filter:blur(44px) saturate(1.8);-webkit-backdrop-filter:blur(44px) saturate(1.8)}
    .wr-panel:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 12% 0%,rgba(255,255,255,.88),transparent 30%),radial-gradient(circle at 92% 10%,color-mix(in srgb,var(--accent) 26%,transparent),transparent 34%),linear-gradient(160deg,rgba(255,255,255,.38),transparent 45%);pointer-events:none}.wr-panel:after{content:"";position:absolute;inset:1px;border-radius:37px;border:1px solid rgba(255,255,255,.40);pointer-events:none}.wr-panel.open{display:grid;animation:wrGlassIn .28s cubic-bezier(.18,.9,.2,1)}@keyframes wrGlassIn{from{opacity:0;transform:translateY(18px) scale(.972);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}
    .wr-head,.wr-tabs,.wr-compose{position:relative;z-index:1}.wr-head{padding:17px 17px 12px}.wr-top{display:flex;align-items:center;justify-content:space-between;gap:12px}.wr-brand{display:flex;align-items:center;gap:11px}.wr-mark{width:44px;height:44px;border-radius:16px;background:linear-gradient(145deg,rgba(255,255,255,.68),rgba(255,255,255,.24));display:grid;place-items:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 12px 28px rgba(36,20,12,.13);overflow:hidden}.wr-mark img{width:88%;height:88%;object-fit:contain;filter:drop-shadow(0 4px 9px rgba(0,0,0,.12))}.wr-title h3{margin:0;font-size:17px;font-weight:850;letter-spacing:-.035em}.wr-title small{display:block;margin-top:1px;color:var(--muted);font-size:12px;font-weight:650}.wr-close{width:36px;height:36px;border:1px solid rgba(255,255,255,.46);border-radius:14px;background:rgba(255,255,255,.28);color:rgba(24,18,15,.72);font-size:21px;line-height:1;cursor:pointer;backdrop-filter:blur(16px);transition:.16s ease}.wr-close:hover{background:rgba(255,255,255,.48);color:#160f0c;transform:scale(1.04)}
    .wr-tabs{margin:0 17px 12px;padding:4px;border-radius:18px;background:rgba(255,255,255,.26);border:1px solid rgba(255,255,255,.42);display:grid;grid-template-columns:1fr 1fr;gap:4px;box-shadow:inset 0 1px 0 rgba(255,255,255,.50)}.wr-tab{height:38px;border:0;border-radius:14px;background:transparent;color:rgba(24,18,15,.54);font-weight:780;cursor:pointer;transition:.18s ease}.wr-tab.active{background:rgba(255,255,255,.62);color:#18120f;box-shadow:0 10px 24px rgba(28,18,12,.10),inset 0 1px 0 rgba(255,255,255,.82)}
    .wr-view{position:relative;z-index:1;display:none;min-height:0;overflow:auto;padding:0 17px 14px}.wr-view.active{display:block}.wr-chat-log{display:flex;flex-direction:column;gap:10px;padding:2px 0 10px}.wr-row{display:flex;align-items:flex-end;gap:8px}.wr-avatar{width:28px;height:28px;border-radius:11px;background:linear-gradient(145deg,color-mix(in srgb,var(--accent) 90%,transparent),color-mix(in srgb,var(--accent) 58%,transparent));display:grid;place-items:center;overflow:hidden;flex:0 0 auto}.wr-avatar img{width:78%;height:78%;object-fit:contain}.wr-dot[data-logo-fallback="true"]::before,.wr-mark[data-logo-fallback="true"]::before,.wr-avatar[data-logo-fallback="true"]::before{content:"✦";font-weight:950;color:var(--accent);font-size:22px}.wr-avatar[data-logo-fallback="true"]::before{color:#fff;font-size:15px}.wr-msg{max-width:86%;padding:11px 13px;border-radius:18px;font-size:14px;line-height:1.45;white-space:pre-wrap;box-shadow:0 10px 26px rgba(28,18,12,.08)}.wr-msg.bot{background:rgba(255,255,255,.54);border:1px solid rgba(255,255,255,.56);border-bottom-left-radius:7px}.wr-msg.user{align-self:flex-end;background:linear-gradient(145deg,var(--accent),color-mix(in srgb,var(--accent) 65%,white));color:white;border-bottom-right-radius:7px}.wr-products{display:grid;gap:10px;margin:3px 0 8px 36px}.wr-product{display:flex;gap:10px;padding:10px;border-radius:15px;background:#fff;border:1px solid rgba(24,18,15,.12)}.wr-product img{width:54px;height:54px;object-fit:cover;border-radius:9px}.wr-product-info{min-width:0;flex:1}.wr-product-title{font-size:13px;font-weight:800;line-height:1.3}.wr-product-price{font-size:12px;color:var(--muted);margin-top:3px}.wr-product-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:7px}.wr-product-actions a,.wr-product-actions button{border:0;border-radius:9px;background:#f4ece7;color:#4b2417;font-weight:700;font-size:11px;font-family:inherit;padding:7px 9px;cursor:pointer;text-decoration:none}.wr-product-actions button{background:var(--accent);color:white}.wr-product-actions button:disabled{opacity:.55;cursor:wait}
    .wr-commerce-card{display:grid;grid-template-columns:82px minmax(0,1fr);gap:12px;padding:12px;border-radius:20px;border-color:rgba(24,18,15,.08);box-shadow:0 9px 25px rgba(35,20,12,.08);transition:border-color .22s ease,box-shadow .22s ease,transform .22s ease}.wr-commerce-card:hover{transform:translateY(-1px);box-shadow:0 13px 29px rgba(35,20,12,.11)}.wr-product-media{width:82px;height:82px;overflow:hidden;border-radius:14px;background:linear-gradient(145deg,#fff8f2,#f5e4d9);display:grid;place-items:center}.wr-product-media img{display:block;width:100%;height:100%;object-fit:cover;border-radius:0}.wr-product-media-fallback{display:grid;place-items:center;gap:1px;color:#a76f57;text-align:center}.wr-product-media-fallback span{font-size:27px;line-height:1}.wr-product-media-fallback small{font-size:10px;font-weight:750;letter-spacing:.02em}.wr-commerce-card .wr-product-info{display:flex;flex-direction:column;justify-content:center}.wr-commerce-card .wr-product-title{font-size:14px;line-height:1.35;overflow-wrap:anywhere}.wr-commerce-card .wr-product-price{color:#2f211b;font-size:15px;font-weight:850;margin-top:7px}.wr-commerce-card .wr-product-actions{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.35fr);gap:8px;margin-top:0}.wr-commerce-card .wr-product-actions a,.wr-commerce-card .wr-product-actions button{min-height:42px;padding:10px 11px;border-radius:12px;font-size:12px;line-height:1.25;display:flex;align-items:center;justify-content:center;text-align:center}.wr-commerce-card .wr-product-actions a{background:#f6f1ed;color:#3d2d25}.wr-commerce-card .wr-product-actions button{background:var(--accent);color:white;position:relative;transition:background .2s ease,transform .2s ease}.wr-commerce-card .wr-product-actions button:hover:not(:disabled){transform:translateY(-1px)}.wr-commerce-card .wr-product-actions button[data-cart-state="loading"]{opacity:1;padding-left:29px}.wr-commerce-card .wr-product-actions button[data-cart-state="loading"]:before{content:"";position:absolute;left:12px;width:12px;height:12px;border:2px solid rgba(255,255,255,.45);border-top-color:white;border-radius:50%;animation:wrCartSpin .7s linear infinite}.wr-commerce-card .wr-product-actions button[data-cart-state="added"]{background:#24754b;opacity:1;cursor:default}.wr-commerce-card.is-added{border-color:rgba(36,117,75,.38);animation:wrCartAdded .45s ease}.wr-commerce-card .wr-product-actions select{grid-column:1/-1;width:100%;min-height:42px;padding:8px 10px;border:1px solid rgba(24,18,15,.2);border-radius:12px;background:white;font:inherit;color:var(--ink)}.wr-commerce-card .wr-product-actions [data-rose-cart-link="true"]{grid-column:1/-1;background:#eaf4ed;color:#175334;font-weight:800}@keyframes wrCartSpin{to{transform:rotate(1turn)}}@keyframes wrCartAdded{50%{transform:scale(1.018);box-shadow:0 0 0 4px rgba(36,117,75,.12)}}@media (prefers-reduced-motion:reduce){.wr-commerce-card,.wr-commerce-card .wr-product-actions button{transition:none}.wr-commerce-card.is-added,.wr-commerce-card .wr-product-actions button[data-cart-state="loading"]:before{animation:none}}
    .wr-voice{height:100%;min-height:330px;display:grid;place-items:center;text-align:center;padding:18px 12px 26px}.wr-orb{width:164px;height:164px;margin:0 auto 22px;border-radius:50%;background:radial-gradient(circle at 35% 27%,rgba(255,255,255,.95),rgba(255,245,236,.52) 22%,color-mix(in srgb,var(--accent) 36%,transparent) 48%,color-mix(in srgb,var(--accent) 62%,transparent) 78%);box-shadow:inset 0 2px 8px rgba(255,255,255,.9),inset 0 -18px 32px rgba(129,44,17,.15),0 24px 74px color-mix(in srgb,var(--accent) 26%,transparent),0 0 0 1px rgba(255,255,255,.72);position:relative;overflow:hidden;transform-origin:50% 58%}.wr-orb:before{content:"";position:absolute;inset:18px;border-radius:50%;background:radial-gradient(circle at 35% 20%,rgba(255,255,255,.86),transparent 34%);filter:blur(2px)}.wr-orb:after{content:"";position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 20deg,transparent,rgba(255,255,255,.45),transparent,color-mix(in srgb,var(--accent) 25%,transparent),transparent);animation:wrSpin 6s linear infinite;opacity:.72}@keyframes wrSpin{to{transform:rotate(1turn)}}.wr-orb.live{animation:wrPulse 1.8s ease-in-out infinite}.wr-orb.speaking{animation:wrSpeak 1.05s cubic-bezier(.35,0,.25,1) infinite;box-shadow:inset 0 2px 8px rgba(255,255,255,.9),0 28px 94px color-mix(in srgb,var(--accent) 42%,transparent),0 0 0 12px color-mix(in srgb,var(--accent) 8%,transparent)}@keyframes wrPulse{50%{transform:scale(1.035);filter:saturate(1.12)}}@keyframes wrSpeak{0%,100%{transform:translateY(0) scale(1);border-radius:50%}22%{transform:translateY(-5px) scale(1.035,.965);border-radius:48% 52% 47% 53%}48%{transform:translateY(3px) scale(.982,1.026);border-radius:54% 46% 52% 48%}72%{transform:translateY(-2px) scale(1.018,.99);border-radius:49% 51% 55% 45%}}.wr-panel.speaking .wr-status{animation:wrTextBreathe 1.05s ease-in-out infinite}@keyframes wrTextBreathe{50%{opacity:.72;transform:translateY(-1px)}}.wr-status{font-size:23px;font-weight:860;letter-spacing:-.05em;margin-bottom:7px}.wr-note{font-size:13px;color:var(--muted);line-height:1.45;margin-bottom:18px}.wr-primary,.wr-secondary{height:48px;border:0;border-radius:999px;padding:0 22px;font-weight:860;cursor:pointer}.wr-primary{color:white;background:linear-gradient(145deg,var(--accent),color-mix(in srgb,var(--accent) 70%,white));box-shadow:0 16px 34px color-mix(in srgb,var(--accent) 25%,transparent),inset 0 1px 0 rgba(255,255,255,.28)}.wr-secondary{background:rgba(255,255,255,.44);border:1px solid rgba(255,255,255,.56);color:#211612}.wr-live-transcript{display:none;margin:18px auto 0;width:min(292px,100%);border-radius:22px;padding:12px;background:rgba(255,255,255,.30);border:1px solid rgba(255,255,255,.48);box-shadow:inset 0 1px 0 rgba(255,255,255,.55);text-align:left}.wr-live-transcript.has-lines{display:none}.wr-live-label{font-size:11px;text-transform:uppercase;letter-spacing:.14em;font-weight:900;color:rgba(24,18,15,.46);margin-bottom:8px}.wr-live-lines{display:flex;flex-direction:column;gap:6px;max-height:96px;overflow:auto}.wr-live-line{font-size:12px;line-height:1.35;color:rgba(24,18,15,.78);padding:7px 9px;border-radius:13px;background:rgba(255,255,255,.34)}.wr-live-line.user{background:color-mix(in srgb,var(--accent) 14%,transparent);color:#442014}.wr-compose{display:none;align-items:center;gap:8px;margin:0 17px 17px;padding:8px;border-radius:22px;background:rgba(255,255,255,.36);border:1px solid rgba(255,255,255,.52);box-shadow:inset 0 1px 0 rgba(255,255,255,.55)}.wr-input{flex:1;height:38px;border:0;background:transparent;outline:0;color:var(--ink);font-size:14px;padding:0 8px}.wr-input::placeholder{color:rgba(24,18,15,.44)}.wr-send{width:38px;height:38px;border:0;border-radius:15px;background:linear-gradient(145deg,var(--accent),color-mix(in srgb,var(--accent) 70%,white));color:white;display:grid;place-items:center;cursor:pointer}.wr-send svg{width:18px;height:18px}.wr-toast{position:absolute;left:17px;right:17px;bottom:78px;padding:10px 12px;border-radius:16px;background:rgba(24,18,15,.78);color:white;font-size:12px;text-align:center;opacity:0;transform:translateY(6px);pointer-events:none;transition:.16s ease}.wr-toast.show{opacity:1;transform:none}.wr-fallback{display:inline-block;margin-top:5px;color:#9a3210;font-weight:850;text-decoration:underline;text-underline-offset:2px}
    @media (max-width:520px){.wr-ai{right:12px;bottom:12px}.wr-panel{width:calc(100vw - 24px);height:min(620px,calc(100vh - 24px));border-radius:34px}.wr-fab{width:70px;height:70px;border-radius:25px}.wr-orb{width:146px;height:146px}}
  `;

  const style = document.createElement("style");
  style.textContent = css + `
    .wr-guide-status{margin:2px 12px 8px 36px;padding:0;color:#757575;font-size:11px;line-height:1.6;font-weight:400;background:none;border:0;box-shadow:none}

    .wr-guide-plan{width:100%;max-width:100%;padding:15px 16px!important}
    .wr-guide-step-button{all:unset;cursor:pointer;color:inherit;font:inherit;display:inline;text-align:left}
    .wr-guide-step-button:focus-visible{outline:2px solid #e87542;outline-offset:3px;border-radius:3px}
    .wr-guide-step-error{display:block;margin-top:3px;color:#9a6b58;font-size:11px;font-weight:400;line-height:1.4}
    .wr-guide-plan-row{transition:opacity .45s ease,transform .45s ease}
    .wr-guide-plan-row.wr-guide-fading{opacity:0;transform:translateY(-4px)}
    .wr-guide-complete{display:flex;align-items:center;gap:9px;font-size:14px}
    .wr-guide-complete-check{color:#64816b;font-size:20px}
    @media(prefers-reduced-motion:reduce){.wr-guide-plan-row{transition:none}}
    .wr-guide-plan-intro{margin:0 0 12px;font-weight:550;line-height:1.45}
    .wr-guide-plan-list{margin:0;padding-left:21px;display:grid;gap:11px}
    .wr-guide-plan-list li{padding-left:3px;color:#91867e;font-size:13px;line-height:1.4;transition:color .2s ease}
    .wr-guide-plan-list li[data-state="current"]{color:#a7441e;font-weight:650}
    .wr-guide-plan-list li[data-state="current"]::marker{color:#e87542;font-weight:700}
    .wr-guide-plan-list li[data-state="done"]{color:#77736f}
    .wr-guide-plan-list li[data-state="done"]::marker{content:"✓  ";color:#9c958e}
    .wr-guide-status-line{font-size:11px;line-height:1.6;font-weight:400;letter-spacing:.01em}
    .wr-guide-actions,.wr-guide-choices{display:flex;flex-wrap:wrap;gap:8px;margin-top:5px}
    .wr-guide-actions button,.wr-guide-choices button{font:inherit;font-size:12px;color:#675b54;background:transparent;border:0;padding:4px 0;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
    .wr-guide-actions button:focus-visible,.wr-guide-compact-bar button:focus-visible,.wr-guide-choices button:focus-visible{outline:2px solid #d76632;outline-offset:3px}
    .wr-ai.wr-guide-left:not(.inline) .wr-panel{position:fixed;left:12px;right:auto;bottom:12px;top:auto;max-height:calc(100dvh - 24px)}
    .wr-guide-actions{margin:0 12px 2px 36px}
    .wr-ai.wr-guide-compact:before,.wr-ai.wr-guide-left:before{display:none}
    .wr-ai.wr-guide-compact .wr-panel,.wr-ai.wr-guide-compact .wr-fab{display:none!important}
    .wr-guide-compact-bar{position:fixed;left:12px;right:12px;bottom:12px;display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:18px;background:#fff7f1;border:1px solid #f3d5c3;box-shadow:0 6px 24px #39271b18;font-size:12px}
    .wr-guide-compact-text{flex:1;min-width:0;line-height:1.35}
    .wr-guide-compact-bar button{flex:none;border:0;background:transparent;color:#91451f;font:600 12px system-ui;padding:8px 2px;cursor:pointer}
    .wr-ai.desktop-side-panel .wr-tabs{grid-template-columns:repeat(3,minmax(0,1fr))}
    .wr-tools{display:grid;align-content:start;gap:0;padding:0 0 24px;text-align:left}
    .wr-tools h4{margin:0;font-size:17px;letter-spacing:-.035em;line-height:1.25}
    .wr-tools p{margin:6px 0 0;color:#77716c;font-size:12px;line-height:1.5}
    .wr-tools-section{padding:22px 0;border-bottom:1px solid #efedea}
    .wr-tools-section:first-child{padding-top:4px}
    .wr-tools-section:last-child{border-bottom:0}
    .wr-tools-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}
    .wr-rescan{border:0;background:transparent;color:#8e6a5b;font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;padding:6px}
    .wr-rescan:hover,.wr-rescan:focus-visible{text-decoration:underline;outline-offset:3px}
    .wr-scan-summary{margin-bottom:16px!important}
    .wr-suggestions{display:grid;gap:8px;margin-top:13px}
    .wr-suggested-tool{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:12px 13px;border:1px solid #ebe7e3;border-radius:13px;background:#fff;color:#27221e;text-align:left;text-decoration:none;font:inherit;cursor:pointer;transition:border-color .15s,background .15s,transform .15s}
    .wr-suggested-tool:hover,.wr-suggested-tool:focus-visible{border-color:#d9aa91;background:#fffaf7;outline:2px solid transparent;transform:translateY(-1px)}
    .wr-suggested-tool.wr-tool-featured{min-height:86px;border-color:#ead0c0;background:#fff9f5}
    .wr-tool-icon{display:grid;place-items:center;flex:none;width:34px;height:34px;border-radius:11px;background:#f5f1ed;color:#8b6958;font-size:17px;font-weight:600}
    .wr-tool-featured .wr-tool-icon{background:#ffebe0;color:#d96136}
    .wr-tool-copy{flex:1;min-width:0}
    .wr-tool-kicker{display:block;margin-bottom:4px;color:#a55b3c;font-size:10px;font-weight:800;letter-spacing:.075em;text-transform:uppercase}
    .wr-suggested-tool strong,.wr-suggested-tool small{display:block}
    .wr-suggested-tool strong{font-size:13px;font-weight:750;line-height:1.3}
    .wr-suggested-tool small{margin-top:4px;color:#827a74;font-size:11px;font-weight:500;line-height:1.35}
    .wr-suggested-arrow{flex:none;color:#a98270;font-size:19px}
    .wr-tools-label{font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:800;color:#85817d;margin-bottom:11px}
    .wr-tool-options{font-size:12px;color:#77716c}
    .wr-tool-options summary{cursor:pointer;list-style:none;font-weight:650}
    .wr-tool-options summary::-webkit-details-marker{display:none}
    .wr-tool-options summary:after{content:"⌄";float:right;font-size:15px;line-height:1}
    .wr-tool-options[open] summary:after{transform:rotate(180deg)}
    .wr-tool-options .wr-tool-setting{margin-top:17px}
    .wr-tool-setting{display:flex;align-items:flex-start;gap:10px;cursor:pointer;line-height:1.45;font-size:12px;color:#77716c}
    .wr-tool-setting strong{display:block;margin-bottom:3px;color:var(--ink);font-size:13px}
    .wr-tool-review{display:grid;gap:10px}.wr-tool-review-row{display:grid;gap:7px;padding:12px;border:1px solid #e5dfda;border-radius:12px;background:#fff}.wr-tool-review-row label{font-size:12px;font-weight:700}.wr-tool-review-row input[type="text"],.wr-tool-review-row input[type="url"]{box-sizing:border-box;width:100%;padding:8px;border:1px solid #d9d3cd;border-radius:8px}.wr-tool-review-actions{display:flex;gap:8px;flex-wrap:wrap}.wr-tool-review-actions button{padding:7px 10px;border:1px solid #d9d3cd;border-radius:8px;background:white;color:#342921;cursor:pointer}.wr-tool-review-actions button:hover,.wr-tool-review-actions button:focus-visible{border-color:#a64b2e}.wr-tool-note{font-size:11px!important}.wr-tool-health{font-size:11px;color:#6c6863}.wr-tool-health[data-state="error"]{color:#ad3427}.wr-tool-health[data-state="ok"]{color:#247a52}.wr-tool-review-count{font-size:12px!important;font-weight:700;color:#443930!important}.wr-tool-review-empty{padding:15px;border:1px dashed #d9d3cd;border-radius:10px;color:#6c6863;font-size:12px}
    .wr-chat-context{display:flex;align-items:center;gap:7px;margin:1px 0 13px;color:#67635f;font-size:11px;font-weight:650}.wr-chat-context:before{content:"";width:7px;height:7px;border-radius:50%;background:#298457;box-shadow:0 0 0 3px #dceee3}.wr-chat-starters{display:flex;flex-wrap:wrap;gap:7px;margin:3px 0 14px 36px}.wr-chat-starters button{border:1px solid #e6ded8;background:#fff;color:#443930;border-radius:999px;padding:8px 10px;font:650 11px/1.3 inherit;cursor:pointer}.wr-chat-starters button:hover,.wr-chat-starters button:focus-visible{border-color:var(--accent);outline-offset:2px}
    .wr-chat-recovery{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 8px 36px}.wr-chat-recovery button{border:1px solid #e6ded8;background:#fff;color:#443930;border-radius:10px;padding:9px 11px;font:650 11px/1.3 inherit;cursor:pointer}.wr-chat-recovery button:hover,.wr-chat-recovery button:focus-visible{border-color:var(--accent);outline-offset:2px}
    .wr-tool-setting input{width:17px;height:17px;flex:0 0 auto;margin:1px 0 0;accent-color:var(--accent)}
    @media(min-width:760px){
      .wr-ai.desktop-side-panel:not(.inline):not(.contained){right:0;bottom:0}
      .wr-ai.desktop-side-panel:not(.inline):not(.contained) .wr-panel{position:fixed;top:0;right:0;bottom:0;width:min(440px,100vw);height:100dvh;border-radius:24px 0 0 24px}
      .wr-ai.desktop-side-panel:not(.inline):not(.contained) .wr-panel:after{border-radius:23px 0 0 23px}
      .wr-ai.desktop-side-panel .wr-head{padding:24px 22px 18px}
      .wr-ai.desktop-side-panel .wr-tabs{margin:0 22px 18px}
      .wr-ai.desktop-side-panel .wr-view{padding:0 22px 18px}
      .wr-ai.desktop-side-panel .wr-compose{margin:0 22px 22px}
      .wr-ai.desktop-side-panel .wr-chat-log{gap:14px}
      .wr-ai.desktop-side-panel:not(.inline) .wr-panel,.wr-ai.desktop-side-panel.inline.corner .wr-panel{background:#fff;border:0;box-shadow:-18px 0 50px rgba(30,25,20,.16);border-radius:18px 0 0 18px}
      .wr-ai.desktop-side-panel:not(.inline) .wr-panel:before,.wr-ai.desktop-side-panel:not(.inline) .wr-panel:after,.wr-ai.desktop-side-panel.inline.corner .wr-panel:before,.wr-ai.desktop-side-panel.inline.corner .wr-panel:after{display:none}
      .wr-ai.desktop-side-panel:not(.inline) .wr-head,.wr-ai.desktop-side-panel.inline.corner .wr-head{padding:20px 22px;border-bottom:1px solid #eeece8}
      .wr-ai.desktop-side-panel:not(.inline) .wr-mark,.wr-ai.desktop-side-panel.inline.corner .wr-mark{width:38px;height:38px;border-radius:10px;background:#faf6f2;box-shadow:none}
      .wr-ai.desktop-side-panel:not(.inline) .wr-title small,.wr-ai.desktop-side-panel.inline.corner .wr-title small{color:#85817d}
      .wr-ai.desktop-side-panel:not(.inline) .wr-close,.wr-ai.desktop-side-panel.inline.corner .wr-close{border:0;background:#f5f4f2;border-radius:9px;box-shadow:none}
      .wr-ai.desktop-side-panel:not(.inline) .wr-tabs,.wr-ai.desktop-side-panel.inline.corner .wr-tabs{margin:0;padding:0 22px;border:0;border-bottom:1px solid #eeece8;border-radius:0;background:#fff;box-shadow:none;gap:20px}
      .wr-ai.desktop-side-panel:not(.inline) .wr-tab,.wr-ai.desktop-side-panel.inline.corner .wr-tab{height:49px;border-radius:0;box-shadow:none;background:transparent;font-size:13px;color:#77716c;border-bottom:2px solid transparent}
      .wr-ai.desktop-side-panel:not(.inline) .wr-tab.active,.wr-ai.desktop-side-panel.inline.corner .wr-tab.active{color:#211c18;border-color:var(--accent);box-shadow:none}
      .wr-ai.desktop-side-panel:not(.inline) .wr-view,.wr-ai.desktop-side-panel.inline.corner .wr-view{padding:18px 22px;background:#fff}
      .wr-ai.desktop-side-panel:not(.inline) .wr-msg.bot,.wr-ai.desktop-side-panel.inline.corner .wr-msg.bot{background:#f5f4f2;border:0;border-radius:14px;border-bottom-left-radius:4px;box-shadow:none}
      .wr-ai.desktop-side-panel:not(.inline) .wr-msg.user,.wr-ai.desktop-side-panel.inline.corner .wr-msg.user{background:var(--accent);border-radius:14px;border-bottom-right-radius:4px;box-shadow:none}
      .wr-ai.desktop-side-panel:not(.inline) .wr-compose,.wr-ai.desktop-side-panel.inline.corner .wr-compose{margin:0 22px 20px;padding:6px;border:1px solid #dedbd7;border-radius:14px;background:#fff;box-shadow:none}
      .wr-ai.desktop-side-panel:not(.inline) .wr-send,.wr-ai.desktop-side-panel.inline.corner .wr-send{border-radius:9px;background:var(--accent)}
    }
    @media(max-width:759px){.wr-ai.desktop-side-panel .wr-tab[data-view="tools"]{display:none}.wr-ai.desktop-side-panel .wr-tabs{grid-template-columns:1fr 1fr}}
  `;
  style.textContent += `
    .wr-panel-size{display:flex;gap:4px;margin-left:auto}.wr-panel-size button{font:600 11px system-ui;border:1px solid #e6ded8;background:#fff;color:#443930;border-radius:7px;padding:6px 8px;cursor:pointer}.wr-panel-size button[aria-pressed="true"]{border-color:var(--accent);color:var(--accent)}
    @media(min-width:760px){.wr-ai.desktop-side-panel.wr-size-compact:not(.inline) .wr-panel{width:400px;grid-template-columns:minmax(0,1fr)}.wr-ai.wr-size-compact .wr-panel>*,.wr-ai.wr-size-compact .wr-input{min-width:0}.wr-ai.wr-size-compact .wr-top{display:grid;grid-template-columns:minmax(0,1fr) 36px;gap:10px}.wr-ai.wr-size-compact .wr-brand{min-width:0}.wr-ai.wr-size-compact .wr-mark{flex-shrink:0}.wr-ai.wr-size-compact .wr-panel-size{grid-column:1/-1;grid-row:2;margin-left:0}.wr-ai.wr-size-compact .wr-close{grid-column:2;grid-row:1}.wr-ai.desktop-side-panel.wr-size-half:not(.inline) .wr-panel{width:clamp(440px,50vw,780px)}.wr-ai.desktop-side-panel.wr-size-full:not(.inline) .wr-panel{width:100vw;border-radius:0}.wr-ai.desktop-side-panel.wr-guide-left.wr-size-full .wr-panel{left:0}}
  `;
  style.textContent += `
    @media(min-width:760px){
      .wr-ai.desktop-side-panel.wr-size-compact:not(.inline) .wr-panel{background:#fbf8f5;box-shadow:-18px 0 55px rgba(67,38,22,.15);border-left:1px solid #f1e6dd}
      .wr-ai.desktop-side-panel.wr-size-compact:not(.inline) .wr-head{padding:22px 22px 15px;background:radial-gradient(circle at 8% 10%,#ffe4d2 0,transparent 40%),linear-gradient(120deg,#fff9f3,#fff4ed);border-bottom-color:#f1e2d8}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-title h3{font-size:19px;letter-spacing:-.04em}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-title small{font-size:11px;color:#916f60}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-panel-size{width:max-content;gap:1px;padding:3px;background:#f1e4db;border-radius:11px}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-panel-size button{padding:7px 10px;border:0;border-radius:8px;background:transparent;color:#725a4e;font-size:11px}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-panel-size button[aria-pressed="true"]{background:#fff;color:#bb4c27;box-shadow:0 2px 8px rgba(72,37,20,.12)}
      .wr-ai.desktop-side-panel.wr-size-compact:not(.inline) .wr-tabs{background:#fff9f5;border-bottom-color:#f1e6dd}
      .wr-ai.desktop-side-panel.wr-size-compact:not(.inline) .wr-view{background:#fbf8f5}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-chat-context{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:11px;color:#846e61}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-chat-log .wr-row:first-child{align-items:flex-start;margin:7px 0 5px}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-chat-log .wr-row:first-child .wr-msg{max-width:calc(100% - 36px);padding:16px 17px;border:1px solid #f4d5c2;border-radius:17px 17px 17px 5px;background:linear-gradient(135deg,#fff2e7,#fffaf6);color:#473226;font-size:14px;font-weight:650;box-shadow:0 8px 24px rgba(100,54,27,.06)}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-chat-log .wr-row:first-child .wr-msg:before{content:"ROSE CAN HELP";display:block;margin-bottom:7px;color:#bf5730;font-size:9px;font-weight:800;letter-spacing:.16em}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-chat-starters{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0 20px 36px}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-chat-starters button{min-height:72px;padding:12px 13px;border:1px solid #ead8cc;border-radius:14px;background:#fff;color:#493429;text-align:left;font-size:12px;font-weight:750;box-shadow:0 6px 18px rgba(89,46,23,.05)}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-chat-starters button:first-child{background:#fff4eb;border-color:#f1cdb8}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-chat-starters button:after{content:"↗";display:block;margin-top:8px;color:#d66537;font-size:16px;line-height:1}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-chat-starters button:hover,.wr-ai.desktop-side-panel.wr-size-compact .wr-chat-starters button:focus-visible{border-color:#e69266;box-shadow:0 8px 24px rgba(140,68,29,.12);transform:translateY(-1px)}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-offer-preview{margin:2px 0 20px 36px;padding:16px;border:1px solid #e9d9ce;border-radius:16px;background:#fff;box-shadow:0 9px 25px rgba(88,45,23,.06)}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-offer-preview small{display:block;color:#a0664c;font-size:10px;font-weight:850;letter-spacing:.11em;text-transform:uppercase}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-offer-preview strong{display:block;margin:7px 0 3px;color:#28201c;font-size:25px;font-weight:850;letter-spacing:-.05em}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-offer-preview span{display:block;color:#756960;font-size:12px;line-height:1.4}
      .wr-ai.desktop-side-panel.wr-size-compact .wr-offer-preview button{margin-top:12px;border:0;border-radius:9px;background:#ff5722;color:#fff;padding:9px 12px;font:750 11px system-ui;cursor:pointer}
      .wr-ai.desktop-side-panel.wr-size-compact:not(.inline) .wr-msg.bot{background:#fff;border:1px solid #f0e5de;box-shadow:0 5px 16px rgba(75,44,25,.04)}
      .wr-ai.desktop-side-panel.wr-size-compact:not(.inline) .wr-compose{border-color:#eadbd1;box-shadow:0 10px 28px rgba(79,44,24,.08)}
    }
  `;
  style.textContent += `
    .wr-ai.wr-minimal .wr-tabs,.wr-ai.wr-minimal .wr-panel-size,.wr-ai.wr-minimal .wr-chat-starters,.wr-ai.wr-minimal .wr-offer-preview{display:none!important}
    .wr-ai.wr-minimal .wr-top{display:grid;grid-template-columns:minmax(0,1fr) 34px 36px;gap:7px}
    .wr-ai.wr-minimal .wr-options{grid-column:2;grid-row:1;width:34px;height:34px;border:0;border-radius:9px;background:#f7eae1;color:#62483b;font-size:20px;line-height:1;cursor:pointer}
    .wr-ai.wr-minimal .wr-close{grid-column:3;grid-row:1}
    .wr-ai.wr-minimal .wr-head{position:relative;z-index:5}
    .wr-ai.wr-minimal .wr-options-menu{position:absolute;right:14px;top:58px;min-width:240px;padding:8px;border:1px solid #ead8cc;border-radius:12px;background:#fff;box-shadow:0 16px 36px rgba(47,26,14,.18);z-index:8}
    .wr-ai.wr-minimal .wr-options-menu[hidden]{display:none}
    .wr-ai.wr-minimal .wr-options-menu small{display:block;padding:6px 9px;color:#91756a;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em}
    .wr-ai.wr-minimal .wr-options-menu button{display:block;width:100%;padding:9px;border:0;border-radius:8px;background:transparent;color:#392d27;text-align:left;font:650 12px system-ui;cursor:pointer}
    .wr-ai.wr-minimal .wr-options-menu button:hover,.wr-ai.wr-minimal .wr-options-menu button[aria-checked="true"]{background:#fff0e7;color:#b54d29}
    .wr-ai.wr-minimal .wr-options-menu .wr-menu-map{margin-top:6px;border-top:1px solid #f1e8e2;border-radius:0}
    .wr-ai.wr-minimal .wr-options-menu .wr-chatgpt-note{padding:4px 9px 7px;color:#806e64;font:11px/1.35 system-ui}
    .wr-ai.wr-minimal .wr-options-menu .wr-chatgpt-button{border-top:1px solid #f1e8e2;border-radius:0}
    .wr-ai.wr-minimal .wr-chat-context{margin-top:6px}
    .wr-ai.wr-minimal .wr-chat-log .wr-row:first-child .wr-msg{font-weight:550}
  `;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.className = (cfg.inline ? "wr-ai inline" : (cfg.contained ? "wr-ai contained" : "wr-ai")) + (cfg.desktopSidePanel ? " desktop-side-panel" : "") + (host?.minimalUI ? " wr-minimal" : "");
  if (cfg.partnerDelivery) root.classList.add('wr-awaiting-activation');
  root.innerHTML = `
    <button class="wr-fab" aria-label="Open Rose assistant"><span class="wr-dot"><img src="${cfg.logo}" alt=""></span></button>
    <div class="wr-panel" role="region" aria-label="${cfg.title}">
      <div class="wr-head"><div class="wr-top"><div class="wr-brand"><div class="wr-mark"><img src="${cfg.logo}" alt=""></div><div class="wr-title"><h3>${cfg.title}</h3><small>${cfg.subtitle}</small></div></div>${cfg.desktopSidePanel ? '<div class="wr-panel-size" aria-label="Panel size"><button type="button" data-size="compact" aria-label="Compact panel">Compact</button><button type="button" data-size="half" aria-label="Half-width panel">Half</button><button type="button" data-size="full" aria-label="Full-width panel">Full</button></div>' : ''}<button class="wr-close" aria-label="Close">×</button></div></div>
      <div class="wr-tabs" role="tablist"><button class="wr-tab" data-view="chat">Chat</button><button class="wr-tab active" data-view="voice">Voice</button>${cfg.desktopSidePanel ? '<button class="wr-tab" data-view="tools">Tools</button>' : ''}</div>
      <div class="wr-view" role="tabpanel" aria-label="Chat" data-view="chat"><div class="wr-chat-context" aria-label="Site context">Looking at this page</div><div class="wr-chat-log" role="log" aria-live="polite" aria-relevant="additions"><div class="wr-row"><div class="wr-avatar"><img src="${cfg.logo}" alt=""></div><div class="wr-msg bot">${cfg.greeting}</div></div></div><div class="wr-chat-starters" aria-label="Suggested tasks"></div></div>
      <div class="wr-view active" role="tabpanel" aria-label="Voice" data-view="voice"><div class="wr-voice"><div><div class="wr-orb"></div><div class="wr-status">Ready when you are</div><div class="wr-note">Tap start and speak naturally.</div><button class="wr-primary wr-start-voice">Start talking</button><button class="wr-secondary wr-end-voice" style="display:none">End</button><div class="wr-live-transcript" aria-live="polite"><div class="wr-live-label">Conversation</div><div class="wr-live-lines"></div></div></div></div></div>
      ${cfg.desktopSidePanel ? '<div class="wr-view" role="tabpanel" aria-label="Tools" data-view="tools"><div class="wr-tools"><div class="wr-tools-section"><div class="wr-tools-heading"><h4>Ready on this site</h4><button type="button" class="wr-rescan" aria-label="Refresh site tools">Refresh</button></div><p class="wr-scan-summary" aria-live="polite">Finding useful paths…</p><div class="wr-suggestions"></div></div><div class="wr-tools-section"><details class="wr-tool-options"><summary>Navigation settings</summary><label class="wr-tool-setting"><input type="checkbox" class="wr-auto-open" checked><span><strong>Open a clear match automatically</strong>When Rose finds one matching page, go there for me.</span></label></details></div></div></div>' : ''}
      <div class="wr-compose"><input class="wr-input" placeholder="${cfg.placeholder}"><button class="wr-send" aria-label="Send"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12h12M12 7l5 5-5 5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><div class="wr-toast"></div>
    </div>`;
  const mount = cfg.mount ? document.querySelector(cfg.mount) : null;
  (mount || document.body).appendChild(root);

  const $ = sel => root.querySelector(sel);
  const $$ = sel => Array.from(root.querySelectorAll(sel));
  const panel = $(".wr-panel");
  const fab = $(".wr-fab");
  const input = $(".wr-input");
  const log = $(".wr-chat-log");
  const chatContext = $(".wr-chat-context");
  const chatStarters = $(".wr-chat-starters");
  if (host?.minimalUI) {
    const options = document.createElement('button'); options.type = 'button'; options.className = 'wr-options'; options.setAttribute('aria-label','Rose options'); options.setAttribute('aria-expanded','false'); options.textContent = '⋯';
    const menu = document.createElement('div'); menu.className = 'wr-options-menu'; menu.hidden = true; menu.setAttribute('role','menu');
    const label = document.createElement('small'); label.textContent = 'Panel width'; menu.append(label);
    for (const [size, text] of [['compact','Compact'],['half','Half'],['full','Full']]) {
      const choice = document.createElement('button'); choice.type = 'button'; choice.setAttribute('role','menuitemradio'); choice.dataset.menuSize = size; choice.textContent = text;
      choice.addEventListener('click', () => { setPanelSize(size); menu.hidden = true; options.setAttribute('aria-expanded','false'); }); menu.append(choice);
    }
    const map = document.createElement('button'); map.type = 'button'; map.setAttribute('role','menuitem'); map.className = 'wr-menu-map'; map.textContent = 'Site map';
    map.addEventListener('click', () => { setView($('.wr-view[data-view="tools"]')?.classList.contains('active') ? 'chat' : 'tools'); menu.hidden = true; options.setAttribute('aria-expanded','false'); }); menu.append(map);
    if (host.chatgpt) {
      const account = document.createElement('button'); account.type = 'button'; account.className = 'wr-chatgpt-button'; account.textContent = 'ChatGPT'; menu.append(account);
      const note = document.createElement('div'); note.className = 'wr-chatgpt-note'; note.setAttribute('role','status'); menu.append(note);
      const update = async () => {
        try {
          const state = await host.chatgpt.status();
          account.disabled = !state.available || state.connecting;
          account.textContent = state.connected ? 'Disconnect ChatGPT' : state.connecting ? 'Connecting to ChatGPT…' : 'Continue with ChatGPT';
          note.textContent = !state.available ? state.reason : state.connected ? `Using ChatGPT plan${state.email ? ' · '+state.email : ''}. Manage usage in ChatGPT settings.` : 'Rose sends your chat and the current page address, title, description, and headings to OpenAI.';
          if (state.connected) $('.wr-title small').textContent = 'Using ChatGPT plan';
          else if ($('.wr-title small').textContent === 'Using ChatGPT plan') $('.wr-title small').textContent = cfg.subtitle;
        } catch (error) { note.textContent = error.message; }
      };
      account.addEventListener('click', async event => {
        if (!event.isTrusted) return;
        account.disabled = true;
        try { const state = await host.chatgpt.status(); if (state.connected) await host.chatgpt.signout(); else await host.chatgpt.connect(); }
        catch (error) { note.textContent = error.message; }
        await update();
        if (account.textContent !== 'Connecting to ChatGPT…') return;
        let tries = 0;
        const poll = setInterval(async () => { await update(); if (++tries >= 120 || account.textContent !== 'Connecting to ChatGPT…') clearInterval(poll); }, 2000);
      });
      options.addEventListener('click', update);
      update();
    }
    options.addEventListener('click', () => { menu.hidden = !menu.hidden; options.setAttribute('aria-expanded',String(!menu.hidden)); map.textContent = $('.wr-view[data-view="tools"]')?.classList.contains('active') ? 'Back to chat' : 'Site map'; root.querySelectorAll('[data-menu-size]').forEach(item => item.setAttribute('aria-checked',String(root.classList.contains('wr-size-' + item.dataset.menuSize)))); });
    menu.addEventListener('keydown', event => { if (event.key === 'Escape') { menu.hidden = true; options.setAttribute('aria-expanded','false'); options.focus(); } });
    document.addEventListener('pointerdown', event => { if (!menu.hidden && !menu.contains(event.target) && event.target !== options) { menu.hidden = true; options.setAttribute('aria-expanded','false'); } });
    $('.wr-top').insertBefore(options,$('.wr-close')); $('.wr-head').append(menu);
  }
  let chatId = null;
  const siteSessionKey = `rose-site-chat:${cfg.businessId || location.hostname}`;
  const toolScanKey = `rose-site-tools:${cfg.businessId || location.hostname}`;
  const toolDraftKey = `rose-tool-draft:${cfg.businessId || location.hostname}`;
  const toolMetricsKey = `rose-tool-metrics:${cfg.businessId || location.hostname}`;
  let publishedTools = [];
  let suggestedTools = [];
  let reviewTools = [];
  let hasToolDraft = false;
  let toolsConfigLoaded = false;
  let toolScanBusy = false;
  let toolsConfigLocation = null;
  try { const url = new URL(cfg.toolsConfigUrl, location.href); if (cfg.toolsConfigUrl && url.origin === location.origin && /^https?:$/.test(url.protocol)) toolsConfigLocation = url; } catch {}
  const toolsReady = toolsConfigLocation ? fetch(toolsConfigLocation, { credentials: "omit" })
    .then(response => response.ok ? response.json() : null)
    .then(config => { toolsConfigLoaded = config?.version === 1 && Array.isArray(config.tools); publishedTools = normalizeToolConfig(config); renderToolSuggestions(); })
    .catch(() => { /* Live page suggestions remain available. */ }) : Promise.resolve();
  let installedWorkflows = [];
  let installedMapLoaded = false;
  const installedMapReady = host?.mapping ? host.api('/api/rose-site-guidance').then(data => { installedWorkflows = data.workflows || []; }).catch(() => {}).finally(() => { installedMapLoaded = true; }) : cfg.apiBase && cfg.businessId ? fetch(`${cfg.apiBase}/api/rose-site-guidance`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessId: cfg.businessId, pageUrl: location.origin + location.pathname }),
    signal: AbortSignal.timeout(5000)
  }).then(response => response.ok ? response.json() : null).then(data => {
    installedWorkflows = (Array.isArray(data?.workflows) ? data.workflows : []).slice(0, 12).filter(item => {
      try { const url = new URL(item.url); return url.origin === location.origin && url.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '') && typeof item.scope === 'string' && typeof item.target === 'string' && Array.isArray(item.steps); } catch { return false; }
    });
  }).catch(() => {}).finally(() => { installedMapLoaded = true; }) : Promise.resolve().then(() => { installedMapLoaded = true; });
  function mappedWorkflowFor(scope) {
    return installedWorkflows.find(item => { try { return scope.matches(item.scope); } catch { return false; } });
  }
  const autoOpenKey = `rose-auto-open:${cfg.businessId || location.hostname}`;
  const visitorAllowsAutoOpen = () => {
    try { return !cfg.desktopSidePanel || localStorage.getItem(autoOpenKey) !== "false"; } catch { return true; }
  };
  let shoppingHistory = [];
  let lastProducts = [];
  let lastSitePages = [];
  let lastNavigationChoices = [];
  let pendingNavigation = null;
  let pendingTaskGuide = null;
  let guideActivity = null;
  let activeSpotlight = null;
  let guideForm = null;
  let activatedGuideControl = null, completionGuideControl = null;
  let guideTimer = null;
  let guideObserver = null;
  let guideEpoch = 0;
  let retellClient = null;
  let voiceBusy = false;

  root.querySelectorAll("img").forEach(img => img.addEventListener("error", () => {
    img.style.display = "none";
    img.parentElement?.setAttribute("data-logo-fallback", "true");
  }));
  fab.addEventListener("click", () => { setView(cfg.desktopSidePanel && matchMedia("(min-width:760px)").matches ? "chat" : cfg.defaultView); panel.classList.add("open"); fab.style.display = "none"; });
  $(".wr-close").addEventListener("click", () => { if (pendingTaskGuide?.toolId && !pendingTaskGuide.metricFinished) toolMetric(pendingTaskGuide.toolId, "abandoned"); cancelGuideWork(); pendingTaskGuide = null; clearSpotlight(); if (guideActivity) updateGuideActivity({ current: "Guidance stopped", footer: "" }); saveSiteSession(); clearSpotlight(); try { retellClient?.stopCall(); } catch {} voiceBusy = false; $(".wr-start-voice").disabled = false; panel.classList.remove("open"); fab.style.display = "grid"; fab.focus(); });
  $$(".wr-tab").forEach(t => t.addEventListener("click", () => setView(t.dataset.view)));
  if (cfg.desktopSidePanel) {
    queueMicrotask(renderToolSuggestions);
    if (cfg.toolsReview) {
      try { const saved = localStorage.getItem(toolDraftKey); hasToolDraft = saved !== null; if (hasToolDraft) reviewTools = normalizeToolConfig(JSON.parse(saved)); } catch {}
      toolsReady.then(() => { if (!hasToolDraft) reviewTools = publishedTools.map(item => ({ ...item })); renderToolReview(); renderToolSuggestions(); });
    }
    $(".wr-rescan").addEventListener("click", renderToolSuggestions);
    if (host?.mapping) {
      const section = document.createElement('div'); section.className = 'wr-tools-section';
      const heading = document.createElement('h4'); heading.textContent = 'Site map';
      const status = document.createElement('p'); status.setAttribute('aria-live','polite'); status.className = 'wr-map-status'; status.textContent = 'Connecting to Rose’s mapper…';
      const refresh = document.createElement('button'); refresh.type = 'button'; refresh.className = 'wr-rescan'; refresh.textContent = 'Refresh site map';
      refresh.addEventListener('click', () => host.refreshMap(true)); section.append(heading,status,refresh); $('.wr-tools').prepend(section);
      host.onMapStatus = data => {
        const map = data.map || {}, job = data.job || {};
        refresh.disabled = job.status === 'running';
        status.textContent = data.error || (job.status === 'failed' ? `Mapping stopped: ${job.error}.` : job.status === 'running' ? `Mapping public pages: ${map.pages || job.scanned || 0} pages found. ${job.phase === 'html' ? 'Discovering links…' : 'Exploring page controls…'}` : `${map.pages || 0} pages · ${map.states || 0} observed states. ${map.coverage === 'observed' ? 'Scan complete.' : 'Partial coverage; some pages or controls could not be explored.'}`);
      };
    }
    $(".wr-auto-open").checked = visitorAllowsAutoOpen();
    $(".wr-auto-open").addEventListener("change", event => {
      try { localStorage.setItem(autoOpenKey, String(event.target.checked)); } catch {}
    });
    addEventListener("resize", () => {
      if (!host?.minimalUI && !matchMedia("(min-width:760px)").matches && $(".wr-view[data-view='tools']")?.classList.contains("active")) setView("chat");
    });
  }

  function setView(view) {
    view = view === "tools" && cfg.desktopSidePanel && (host?.minimalUI || matchMedia("(min-width:760px)").matches) ? "tools" : (view === "chat" ? "chat" : "voice");
    if (view === "tools") queueMicrotask(renderToolSuggestions);
    $$(".wr-tab").forEach(t => { const active = t.dataset.view === view; t.classList.toggle("active", active); t.setAttribute("role", "tab"); t.setAttribute("aria-selected", String(active)); t.tabIndex = active ? 0 : -1; t.id = `wr-tab-${t.dataset.view}`; t.setAttribute("aria-controls", `wr-panel-${t.dataset.view}`); });
    $$(".wr-view").forEach(v => { const active = v.dataset.view === view; v.classList.toggle("active", active); v.hidden = !active; v.id = `wr-panel-${v.dataset.view}`; v.setAttribute("aria-labelledby", `wr-tab-${v.dataset.view}`); });
    $(".wr-compose").style.display = view === "chat" ? "flex" : "none";
  }
  const setPanelSize = size => {
    root.classList.toggle('wr-size-compact', size === 'compact');
    root.classList.toggle('wr-size-half', size === 'half'); root.classList.toggle('wr-size-full', size === 'full');
    root.querySelectorAll('[data-size]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.size === size)));
    host?.onSize?.(size);
  };
  root.querySelectorAll('[data-size]').forEach(button => button.addEventListener('click', () => setPanelSize(button.dataset.size)));
  setPanelSize(cfg.panelSize);
  if (host) {
    host.controller = {
      open() { setView('chat'); panel.classList.add('open'); fab.style.display = 'none'; host.onOpen?.(); },
      close() { $('.wr-close').click(); },
    };
    $('.wr-close').addEventListener('click', () => host.onClose?.());
    if (!host.voiceEnabled) { $('.wr-start-voice').disabled = true; $('.wr-note').textContent = 'Voice is not connected in the extension yet. Use Chat for website guidance.'; }
  }
  setView(cfg.defaultView);
  $(".wr-tabs").addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const tabs = $$(".wr-tab").filter(tab => getComputedStyle(tab).display !== "none");
    const current = tabs.indexOf(document.activeElement); if (current < 0) return;
    event.preventDefault();
    const index = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    setView(tabs[index].dataset.view); tabs[index].focus();
  });
  function addMsg(role, text) {
    if (role === "bot") {
      const row = document.createElement("div");
      row.className = "wr-row";
      row.innerHTML = `<div class="wr-avatar"><img src="${cfg.logo}" alt=""></div>`;
      const bubble = document.createElement("div");
      bubble.className = "wr-msg bot";
      bubble.textContent = text;
      row.appendChild(bubble);
      log.appendChild(row);
      log.parentElement.scrollTop = log.parentElement.scrollHeight;
      return bubble;
    }
    const el = document.createElement("div");
    el.className = "wr-msg user";
    el.textContent = text;
    log.appendChild(el);
    log.parentElement.scrollTop = log.parentElement.scrollHeight;
    return el;
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(siteSessionKey) || "{}");
    if(globalThis.__roseSiteGuide && saved.siteGuideVersion!==globalThis.__roseSiteGuide.version){saved.pendingTaskGuide=null;saved.guideActivity=null;saved.pendingNavigation=null;}
    chatId = typeof saved.chatId === "string" ? saved.chatId : null;
    shoppingHistory = Array.isArray(saved.messages) ? saved.messages.slice(-12) : [];
    shoppingHistory.forEach(message => addMsg(message.role === "user" ? "user" : "bot", String(message.text || "").slice(0, 1600)));
    lastProducts = Array.isArray(saved.products) ? saved.products.filter(product => product.provider === commerceProvider() && (product.provider !== "native" || product.url === location.href)).slice(0, 4) : [];
    renderProducts(lastProducts);
    lastSitePages = Array.isArray(saved.sitePages) ? saved.sitePages.slice(0, 4) : [];
    renderSitePages(lastSitePages);
    lastNavigationChoices = Array.isArray(saved.navigationChoices) ? saved.navigationChoices.filter(choice => !choice.provider || lastProducts.some(product => product.url === choice.url)).slice(0, 4) : [];
    pendingTaskGuide = saved.pendingTaskGuide && Date.now() - Number(saved.pendingTaskGuide.at) < 30 * 60 * 1000 ? saved.pendingTaskGuide : null;
    guideActivity = saved.guideActivity && Array.isArray(saved.guideActivity.steps) && Date.now() - Number(saved.guideActivity.at) < 30 * 60 * 1000 ? saved.guideActivity : null;
    if (!pendingTaskGuide && guideActivity?.completedPath && guideActivity.completedPath !== `${location.pathname}${location.search}`) guideActivity = null;
    if (guideActivity?.pendingUrl) {
      const arrived = taskGuideUrl(guideActivity.pendingUrl);
      if (arrived && arrived.href === location.href) {
        guideActivity.steps.push(`Opened ${guideActivity.pendingLabel}`);
        guideActivity.current = "Looking for the next step…";
      } else {
        guideActivity.current = "That page did not open as expected. Choose another section or resume.";
        if (pendingTaskGuide) pendingTaskGuide.paused = true;
      }
      guideActivity.pendingUrl = null;
      guideActivity.pendingLabel = null;
    }
    renderGuideActivity();
    pendingNavigation = saved.pendingNavigation || null;
    if (pendingNavigation && Date.now() - Number(pendingNavigation.at) < 120000) {
      const destination = safePageUrl(pendingNavigation.url);
      if (destination && destination.pathname === location.pathname && destination.search === location.search) {
        const message = `You're on ${String(pendingNavigation.title || document.title || "the page").slice(0, 100)}.`;
        addMsg("bot", message);
        shoppingHistory.push({ role: "bot", text: message });
        setView(pendingNavigation.view === "voice" ? "voice" : "chat");
        if (pendingNavigation.view === "voice") {
          $(".wr-status").textContent = "Page opened";
          $(".wr-note").textContent = "Tap Start talking to continue.";
        }
        panel.classList.add("open");
        fab.style.display = "none";
        reportCapabilityOutcome({ id: "navigation:page", kind: "navigation", label: "Open requested page", status: "verified" });
      }
    }
    pendingNavigation = null;
    saveSiteSession();
    if (pendingTaskGuide) {
      setView(pendingTaskGuide.view);
      panel.classList.add("open");
      fab.style.display = "none";
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(resumeTaskGuide, 400), { once: true });
      else setTimeout(resumeTaskGuide, 400);
    }
  } catch { /* Storage can be disabled. */ }
  function saveSiteSession() {
    try { sessionStorage.setItem(siteSessionKey, JSON.stringify({ siteGuideVersion:globalThis.__roseSiteGuide?.version || null, chatId, messages: shoppingHistory.slice(-12), products: lastProducts, sitePages: lastSitePages, navigationChoices: lastNavigationChoices, pendingNavigation, pendingTaskGuide, guideActivity })); } catch { /* Storage can be disabled. */ }
  }
  function showContactFallback(target, message) {
    target.textContent = message;
    if (!fallbackHref) return;
    const link = document.createElement("a");
    link.className = "wr-fallback";
    link.href = fallbackHref;
    link.textContent = "Contact the team directly";
    target.appendChild(document.createElement("br"));
    target.appendChild(link);
  }
  function currentPageContext() {
    const description = document.querySelector('meta[name="description"]')?.content || "";
    const headings = [...document.querySelectorAll("main h1, main h2, h1")].slice(0, 6).map(el => el.textContent.trim()).filter(Boolean);
    const controls = widgetOptions.siteControls ? discoverSiteControls().slice(0, 16).map(control => ({ id: control.id, kind: control.kind, label: control.label, options: control.options?.slice(0, 8) })) : [];
    const links = [...document.querySelectorAll("nav a[href], header a[href], main a[href]")].filter(link => !root.contains(link) && visibleSiteControl(link)).slice(0, 30).flatMap(link => {
      const url = toolUrl(link.href);
      const title = controlLabel(link);
      return url && title ? [{ title: title.slice(0, 60), url: `${url.origin}${url.pathname}` }] : [];
    }).slice(0, 12);
    return { url: `${location.origin}${location.pathname}`, title: document.title.slice(0, 180), description: description.slice(0, 400), headings: headings.join(" | ").slice(0, 600), controls, links };
  }
  function safePageUrl(value) {
    try {
      const url = new URL(value, location.href);
      if (!/^https?:$/.test(url.protocol) || url.hostname.replace(/^www\./, "").toLowerCase() !== location.hostname.replace(/^www\./, "").toLowerCase()) return null;
      if (/^\/(?:account|admin|cart|checkout|checkouts|orders)(?:\/|$)/i.test(url.pathname)) return null;
      return url;
    } catch { return null; }
  }
  function navigationRequested(message) {
    if (/\b(?:what time|when|hours?|are you|is it|do you|which days)\b.{0,60}\bopen\b/i.test(message) ||
        /^\s*open(?:ing)? hours\s*[?.!]?\s*$/i.test(message)) return false;
    return widgetOptions.navigation && /\b(?:open|visit|go to|take me to|navigate to)\b/i.test(message);
  }
  function navigateTo(page, view = "chat") {
    if (!widgetOptions.navigation) return false;
    const destination = safePageUrl(page?.url);
    if (!destination) return false;
    pendingNavigation = { url: destination.href, title: page.title || "the page", view, at: Date.now() };
    saveSiteSession();
    location.assign(destination.href);
    return true;
  }
  function priorNavigationChoice(message) {
    if (!navigationRequested(message)) return null;
    const ordinal = /\b(?:the\s+)?(first|second|third|fourth|1st|2nd|3rd|4th|#?[1-4])\s+(?:one|option|result|page|product)?\b/i.exec(message)?.[1]?.toLowerCase();
    if (!ordinal) return null;
    const index = { first: 0, "1st": 0, "1": 0, "#1": 0, second: 1, "2nd": 1, "2": 1, "#2": 1, third: 2, "3rd": 2, "3": 2, "#3": 2, fourth: 3, "4th": 3, "4": 3, "#4": 3 }[ordinal];
    return /product/i.test(message) ? lastProducts[index] || null : /page/i.test(message) ? lastSitePages[index] || null : lastNavigationChoices[index] || null;
  }
  function currentPageLinks(message) {
    const skip = new Set("a an and can could for from go i is me my navigate of on open page please show take the to visit want where you your".split(" "));
    const words = [...new Set(String(message).toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(word => word.length > 2 && !skip.has(word)))].slice(0, 8);
    if (!words.length) return [];
    const links = new Map();
    for (const anchor of document.querySelectorAll("a[href]")) {
      if (root.contains(anchor)) continue;
      const url = safePageUrl(anchor.href);
      if (!url || url.href === location.href) continue;
      const title = (anchor.textContent || anchor.getAttribute("aria-label") || anchor.getAttribute("title") || "").replace(/\s+/g, " ").trim().slice(0, 120);
      if (!title) continue;
      const label = title.toLowerCase();
      const path = url.pathname.toLowerCase();
      const score = words.reduce((n, word) => n + (label.includes(word) ? 3 : 0) + (path.includes(word) ? 1 : 0), 0);
      if (score && (!links.has(url.href) || links.get(url.href).score < score)) links.set(url.href, { url: url.href, title, score });
    }
    return [...links.values()].sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, 4).map(({ url, title, score }) => ({ url, title, score }));
  }
  function toolUrl(value) {
    try {
      const url = new URL(value, location.href);
      if (!/^https?:$/.test(url.protocol) || url.origin !== location.origin) return null;
      if (/\b(?:delete|remove|logout|signout|unsubscribe|checkout|purchase|pay|submit)\b/i.test(`${url.pathname} ${url.search} ${url.hash}`)) return null;
      if (/^\/(?:admin|cart|checkout|checkouts)(?:\/|$)/i.test(url.pathname)) return null;
      return url;
    } catch { return null; }
  }
  function toolScore(label, path = "") {
    // Navigation prominence and task words are proxies for usefulness; no visitor usage data is read here.
    const words = controlWords(`${label} ${path}`);
    if (/\b(?:delete|remove|logout|sign out|buy|purchase|checkout|pay now|submit)\b/.test(words)) return 0;
    if (/\b(?:password|security|two factor|2fa)\b/.test(words)) return 100;
    if (/\b(?:settings|preferences|account|profile)\b/.test(words)) return 92;
    if (/\b(?:help center|support|faq|knowledge base)\b/.test(words) || /^help$/.test(words)) return 86;
    if (/\b(?:orders?|track|billing|invoices?|subscription)\b/.test(words)) return 82;
    if (/\b(?:search|filters?|sort|size|category|returns?|shipping)\b/.test(words)) return 76;
    if (/\b(?:setup|getting started|onboarding|pricing|plans?)\b/.test(words)) return 68;
    if (/\b(?:features?|services?|how .* works)\b/.test(words)) return 50;
    return 0;
  }
  function toolTitleKey(title) { return controlWords(title).split(" ").filter(word => !["my", "your", "the"].includes(word)).join(" "); }
  function normalizeToolConfig(config) {
    if (!config || config.version !== 1 || !Array.isArray(config.tools)) return [];
    const seen = new Set();
    return config.tools.slice(0, 40).flatMap((item, index) => {
      const url = toolUrl(item?.url);
      const title = String(item?.title || "").replace(/\s+/g, " ").trim().slice(0, 60);
      if (!url || !title) return [];
      const selector = String(item?.target || "").trim().slice(0, 160);
      try { if (selector) document.createDocumentFragment().querySelector(selector); } catch { return []; }
      const identity=`${url.href}|${selector}|${item.id || title}`;if(seen.has(identity))return [];seen.add(identity);
      return [{ completion:item.completion || "", field:item.field || "", steps:Array.isArray(item.steps)?item.steps:[], aliases: Array.isArray(item.aliases) ? item.aliases.filter(value=>typeof value === "string").slice(0,8).map(value=>value.slice(0,100)) : [], id: String(item.id || `tool-${index}`).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48) || `tool-${index}`, kind: "published", title, url: url.href, target: selector, enabled: item.enabled !== false, pinned: item.pinned === true, score: 200 - index, health: item.health && ["ok", "error", "unknown"].includes(item.health.state) ? { state: item.health.state, text: String(item.health.text || "").slice(0, 120) } : null }];
    });
  }
  function toolMetric(id, event) {
    if (!id || !["starts", "reached", "verified", "unconfirmed", "failed", "abandoned"].includes(event)) return;
    // Browser-local aggregate counters. No goal text, form values or account details are stored.
    try {
      const all = JSON.parse(localStorage.getItem(toolMetricsKey) || "{}");
      const entry = all[id] && typeof all[id] === "object" ? all[id] : {};
      entry[event] = Math.min(1000000, (Number(entry[event]) || 0) + 1);
      all[id] = entry;
      localStorage.setItem(toolMetricsKey, JSON.stringify(all));
    } catch {}
    // Published tools also contribute anonymous, site-level counts in the owner's action report.
    if (cfg.toolsReview || !cfg.apiBase || !cfg.businessId || !publishedTools.some(item => item.id === id)) return;
    settingsReady.then(() => fetch(`${cfg.apiBase}/api/rose-site-capabilities`, {
      method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
      body: JSON.stringify({ businessId: cfg.businessId, pageUrl: `${location.origin}/`, controls: [], result: { id: `tool:${id}`, kind: "tool", label: id, status: event === "starts" ? "started" : event } }),
    }).catch(() => {}));
  }
  function toolRank(item) {
    let counts = {};
    try { counts = JSON.parse(localStorage.getItem(toolMetricsKey) || "{}")[item.id || `page:${new URL(item.url).pathname}${new URL(item.url).hash}`] || {}; } catch {}
    return item.score + Math.min(12, (counts.verified || 0) * 4 + (counts.reached || 0)) - Math.min(12, (counts.failed || 0) * 4 + (counts.abandoned || 0) * 2);
  }
  function toolHealth(item) {
    const url = toolUrl(item.url);
    if (!url) return { state: "error", text: "Invalid or unsafe destination" };
    try { if (item.target) document.createDocumentFragment().querySelector(item.target); }
    catch { return { state: "error", text: "Invalid target selector" }; }
    if (url.pathname === location.pathname && url.search === location.search && item.target) {
      return document.querySelector(item.target) ? { state: "ok", text: "Target found on this page" } : { state: "error", text: "Target missing on this page" };
    }
    return { state: "unknown", text: item.target ? "Target needs a check on its destination" : "Destination needs a check" };
  }
  function saveToolDraft() {
    hasToolDraft = true;
    try { localStorage.setItem(toolDraftKey, JSON.stringify({ version: 1, tools: reviewTools })); } catch {}
  }
  function renderToolReview() {
    if (!cfg.toolsReview || !cfg.desktopSidePanel) return;
    let section = $(".wr-tool-review-section");
    if (!section) {
      section = document.createElement("section");
      section.className = "wr-tools-section wr-tool-review-section";
      section.innerHTML = '<h4>Review site tools</h4><p class="wr-tool-note">Your edits are a browser draft. Visitors see the hosted catalog after you export and publish it.</p><p class="wr-tool-review-count"></p><div class="wr-tool-review-actions"><button type="button" class="wr-scan-site">Scan public pages</button><button type="button" class="wr-check-tools">Check links</button><button type="button" class="wr-add-tool">Add tool</button><button type="button" class="wr-load-tools">Reload published</button><button type="button" class="wr-export-tools">Export JSON</button></div><p class="wr-review-status" aria-live="polite"></p><div class="wr-tool-review"></div>';
      $(".wr-tools").append(section);
      section.querySelector(".wr-scan-site").addEventListener("click", scanPublicSite);
      section.querySelector(".wr-check-tools").addEventListener("click", checkReviewedTools);
      section.querySelector(".wr-add-tool").addEventListener("click", () => {
        if (reviewTools.length >= 40) return;
        reviewTools.push({ id: `manual-${Date.now()}`, title: "New tool", url: location.href, target: "", enabled: false, pinned: false });
        saveToolDraft(); renderToolReview();
      });
      section.querySelector(".wr-load-tools").addEventListener("click", async () => {
        await toolsReady;
        if (!toolsConfigLoaded) { section.querySelector(".wr-review-status").textContent = "Hosted catalog unavailable. Your browser draft is unchanged."; return; }
        reviewTools = publishedTools.map(item => ({ ...item }));
        saveToolDraft(); renderToolReview(); renderToolSuggestions();
        section.querySelector(".wr-review-status").textContent = `Loaded ${reviewTools.length} tools from the hosted catalog into this browser draft.`;
      });
      section.querySelector(".wr-export-tools").addEventListener("click", () => {
        const invalid = reviewTools.filter(item => {
          if (item.enabled === false) return false;
          if (!item.title.trim() || !toolUrl(item.url)) return true;
          try { if (item.target) document.createDocumentFragment().querySelector(item.target); return false; } catch { return true; }
        });
        if (invalid.length) { section.querySelector(".wr-review-status").textContent = `Fix ${invalid.length} invalid visible tool${invalid.length === 1 ? "" : "s"} before exporting.`; return; }
        const blob = new Blob([JSON.stringify({ version: 1, tools: reviewTools.map(({ id, title, url, target, enabled, pinned }) => ({ id, title, url, target, enabled, pinned })) }, null, 2)], { type: "application/json" });
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "rose-tools.json"; link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        section.querySelector(".wr-review-status").textContent = "JSON exported. Replace the hosted catalog to publish these changes.";
      });
    }
    const visible = reviewTools.filter(item => item.enabled !== false).length;
    section.querySelector(".wr-tool-review-count").textContent = `${visible} shown to visitors · ${reviewTools.length - visible} hidden · ${hasToolDraft ? "Browser draft" : "Hosted catalog preview"}`;
    section.querySelector(".wr-load-tools").disabled = !toolsConfigLoaded;
    const list = section.querySelector(".wr-tool-review");
    list.replaceChildren();
    if (!reviewTools.length) {
      const empty = document.createElement("div"); empty.className = "wr-tool-review-empty";
      empty.textContent = "No reviewed tools yet. Scan public pages or add a tool for an account task.";
      list.append(empty);
    }
    for (const item of reviewTools) {
      const row = document.createElement("div"); row.className = "wr-tool-review-row";
      const enabled = document.createElement("label");
      const check = document.createElement("input"); check.type = "checkbox"; check.checked = item.enabled !== false;
      check.addEventListener("change", () => { item.enabled = check.checked; saveToolDraft(); renderToolReview(); renderToolSuggestions(); });
      enabled.append(check, " Show to visitors");
      const pinned = document.createElement("label");
      const pin = document.createElement("input"); pin.type = "checkbox"; pin.checked = item.pinned === true;
      pin.addEventListener("change", () => { item.pinned = pin.checked; saveToolDraft(); renderToolSuggestions(); });
      pinned.append(pin, " Pin near top");
      const field = (label, key, type = "text") => {
        const wrapper = document.createElement("label"); wrapper.textContent = label;
        const input = document.createElement("input"); input.type = type; input.value = item[key] || "";
        input.addEventListener("change", () => { item[key] = input.value.trim(); if (key === "url" || key === "target") delete item.health; saveToolDraft(); renderToolReview(); renderToolSuggestions(); });
        wrapper.append(input); return wrapper;
      };
      const health = item.health || toolHealth(item);
      const status = document.createElement("small"); status.className = "wr-tool-health"; status.dataset.state = health.state; status.textContent = health.text;
      const metrics = document.createElement("small"); metrics.className = "wr-tool-health";
      let counts = {}; try { counts = JSON.parse(localStorage.getItem(toolMetricsKey) || "{}")[item.id] || {}; } catch {}
      metrics.textContent = `${counts.starts || 0} starts · ${counts.reached || 0} pages reached · ${counts.verified || 0} control responses · ${counts.failed || 0} failed · ${counts.abandoned || 0} left guide`;
      const actions = document.createElement("div"); actions.className = "wr-tool-review-actions";
      const test = document.createElement("button"); test.type = "button"; test.textContent = "Test guide"; test.addEventListener("click", () => launchSuggestedTool(item));
      const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "Remove"; remove.addEventListener("click", () => { reviewTools = reviewTools.filter(entry => entry !== item); saveToolDraft(); renderToolReview(); renderToolSuggestions(); });
      actions.append(test, remove);
      row.append(enabled, pinned, field("Name", "title"), field("Destination", "url", "url"), field("Target CSS selector (optional)", "target"), status, metrics, actions);
      list.append(row);
    }
  }
  async function scanPublicSite() {
    if (toolScanBusy) return;
    toolScanBusy = true;
    const status = $(".wr-review-status");
    status.textContent = "Scanning public same-site pages…";
    const publicPage = value => {
      const url = toolUrl(value);
      if (!url || url.search || /\b(?:account|profile|security|password|login|sign.?in|member|private)\b/i.test(url.pathname)) return null;
      url.hash = "";
      return url;
    };
    const pages = new Set();
    const enqueue = value => { const url = publicPage(value); if (url && pages.size < 60) pages.add(url.href); };
    enqueue(location.href); enqueue(new URL("/", location.origin).href);
    try {
      const response = await fetch(new URL("/sitemap.xml", location.origin), { credentials: "omit" });
      if (response.ok && /xml/i.test(response.headers.get("content-type") || "")) {
        const xml = new DOMParser().parseFromString(await response.text(), "application/xml");
        for (const node of [...xml.querySelectorAll("loc")].slice(0, 100)) {
          enqueue(node.textContent);
        }
      }
    } catch {}
    for (const link of [...document.querySelectorAll("a[href]")].slice(0, 200)) {
      enqueue(link.href);
    }
    const found = new Map(reviewTools.map(item => [item.url, item]));
    let checked = 0, attempted = 0;
    for (const href of pages) {
      if (attempted >= 16) break;
      attempted++;
      try {
        const response = await fetch(href, { credentials: "omit", signal: AbortSignal.timeout(4500) });
        if (!response.ok || !publicPage(response.url) || !/text\/html/i.test(response.headers.get("content-type") || "")) continue;
        const doc = new DOMParser().parseFromString(await response.text(), "text/html"); checked++;
        for (const link of [...doc.querySelectorAll("a[href]")].slice(0, 160)) {
          const url = toolUrl(new URL(link.getAttribute("href"), href).href);
          const title = controlLabel(link).slice(0, 60);
          if (!url || url.search || !title) continue;
          enqueue(url.href);
          if (!toolScore(title, url.pathname) || found.has(url.href)) continue;
          found.set(url.href, { id: `scan-${found.size}`, title, url: url.href, target: "", enabled: false, pinned: false });
          if (found.size >= 40) break;
        }
      } catch {}
      if (found.size >= 40) break;
    }
    reviewTools = [...found.values()].slice(0, 40);
    saveToolDraft(); renderToolReview(); renderToolSuggestions();
    status.textContent = `Checked ${checked} public pages${pages.size > attempted ? ` of ${pages.size} discovered` : ""}. New suggestions are hidden until you review them.`;
    toolScanBusy = false;
  }
  async function checkReviewedTools() {
    if (toolScanBusy) return;
    toolScanBusy = true;
    const status = $(".wr-review-status"); status.textContent = "Checking reviewed destinations…";
    let checked = 0, failed = 0;
    for (const item of reviewTools) {
      const url = toolUrl(item.url);
      if (!url) { item.health = { state: "error", text: "Invalid or unsafe destination" }; failed++; continue; }
      if (toolHealth(item).text === "Invalid target selector") { item.health = { state: "error", text: "Invalid target selector" }; failed++; continue; }
      if (url.pathname === location.pathname && url.search === location.search && item.target) {
        item.health = toolHealth(item); checked++; if (item.health.state === "error") failed++; continue;
      }
      try {
        const response = await fetch(url.href, { credentials: "omit", signal: AbortSignal.timeout(4500) });
        if (!response.ok || !/text\/html/i.test(response.headers.get("content-type") || "")) throw new Error("Page unavailable");
        const finalUrl = toolUrl(response.url);
        if (!finalUrl || finalUrl.pathname !== url.pathname) {
          item.health = { state: "unknown", text: "Redirected; test the guide while signed in" }; checked++; continue;
        }
        const doc = new DOMParser().parseFromString(await response.text(), "text/html");
        let target = null;
        if (item.target) target = doc.querySelector(item.target);
        item.health = item.target && !target ? { state: "unknown", text: "Target missing from public HTML; test while signed in" } : { state: "ok", text: item.target ? "Page and target found in public HTML" : "Page responds" };
        checked++;
        if (item.health.state === "error") failed++;
      } catch {
        item.health = { state: "unknown", text: "Could not check public HTML; test the guide while signed in" }; checked++;
      }
    }
    saveToolDraft(); renderToolReview();
    const manual = reviewTools.filter(item => item.health?.state === "unknown").length;
    status.textContent = `Checked ${checked} tools; ${failed} invalid, ${manual} need a guide test. Sign-in areas require a manual test.`;
    toolScanBusy = false;
  }
  function toolControlTitle(control) {
    const label = control.element.labels?.[0];
    if (!label) return control.label;
    const copy = label.cloneNode(true);
    copy.querySelectorAll("input,select,option,button").forEach(element => element.remove());
    return copy.textContent.replace(/\s+/g, " ").trim() || control.label;
  }
  function renderToolSuggestions() {
    const list = $(".wr-suggestions");
    if (!list) {
      if (!chatStarters || pendingTaskGuide || shoppingHistory.some(message=>message.role === 'user')) return;
      chatStarters.replaceChildren();
      for (const item of publishedTools.filter(item=>item.enabled !== false && item.pinned && toolUrl(item.url)).slice(0,3)) {
        const button=document.createElement('button');button.type='button';button.textContent=item.title;
        button.addEventListener('click',()=>launchSuggestedTool(item));chatStarters.append(button);
      }
      return;
    }
    const current = new Map();
    const add = candidate => {
      const previous = current.get(candidate.key);
      if (!previous || candidate.score > previous.score) current.set(candidate.key, candidate);
    };
    for (const anchor of document.querySelectorAll("a[href]")) {
      if (root.contains(anchor) || !visibleSiteControl(anchor)) continue;
      if (anchor.querySelector("img") && anchor.closest("nav, header")) continue;
      const url = toolUrl(anchor.href);
      if (!url || url.href === location.href || url.hash === "#" || url.hash === "#top") continue;
      const title = controlLabel(anchor).slice(0, 60);
      if (!title) continue;
      const score = toolScore(title, `${url.pathname} ${url.hash}`);
      if (!score) continue;
      const inNavigation = !!anchor.closest("nav, header, [role='navigation']");
      add({ key: url.href, kind: "link", title, url: url.href, detail: inNavigation ? "Site navigation" : "Page link", score: score + (inNavigation ? 12 : 0) });
    }
    for (const heading of document.querySelectorAll("h2")) {
      if (root.contains(heading) || !visibleSiteControl(heading)) continue;
      const section = heading.closest("[id]");
      if (!section?.id || section === document.body) continue;
      const url = toolUrl(`#${encodeURIComponent(section.id)}`);
      if (!url || url.href === location.href) continue;
      const title = heading.textContent.replace(/\s+/g, " ").trim().slice(0, 60);
      const score = toolScore(title);
      if (score) add({ key: url.href, kind: "link", title, url: url.href, detail: "Section on this page", score: score - 4 });
    }
    if (widgetOptions.siteControls) for (const control of discoverSiteControls()) {
      if (!/^(?:search|select|choice|toggle)$/.test(control.kind)) continue;
      const title = toolControlTitle(control).slice(0, 60);
      const score = toolScore(title) || (control.kind === "search" ? 80 : 0);
      if (!score) continue;
      add({ key: `control:${control.id}`, kind: "control", title, detail: "Control on this page", element: control.element, score: score + (control.kind === "search" ? 18 : 8) });
    }
    for (const element of document.querySelectorAll("button,[role='button']")) {
      if (root.contains(element) || !visibleSiteControl(element)) continue;
      const title = controlLabel(element).slice(0, 60);
      if (!/^(?:change|reset|update) (?:my )?password\b/i.test(title)) continue;
      add({ key: `guide:${controlWords(title)}`, kind: "guide", title, detail: "Rose can point to this control", score: 120 });
    }
    let remembered = [];
    try {
      const saved = JSON.parse(sessionStorage.getItem(toolScanKey) || "{}");
      if (Date.now() - Number(saved.at) < 30 * 60 * 1000 && Array.isArray(saved.tools)) remembered = saved.tools.slice(0, 30);
    } catch {}
    const links = new Map();
    for (const item of remembered) {
      const url = toolUrl(item?.url);
      if (!url || typeof item.title !== "string" || typeof item.score !== "number") continue;
      const score = toolScore(item.title, `${url.pathname} ${url.hash}`);
      if (!score) continue;
      links.set(url.href, { key: url.href, kind: "link", title: item.title.slice(0, 60), url: url.href, detail: "Found earlier on this site", score: Math.min(120, score + 12, item.score), seenOn: Array.isArray(item.seenOn) ? item.seenOn.slice(0, 8) : [] });
    }
    for (const item of current.values()) {
      if (item.kind !== "link") continue;
      const previous = links.get(item.key);
      const seenOn = [...new Set([...(previous?.seenOn || []), location.pathname])].slice(-8);
      links.set(item.key, { ...item, score: Math.max(item.score, previous?.score || 0), seenOn });
    }
    try { sessionStorage.setItem(toolScanKey, JSON.stringify({ at: Date.now(), tools: [...links.values()].slice(0, 30).map(({ title, url, score, seenOn }) => ({ title, url, score, seenOn })) })); } catch {}
    const configured = cfg.toolsReview ? reviewTools : publishedTools;
    const hiddenUrls = new Set(configured.filter(item => item.enabled === false).map(item => item.url));
    const published = configured.filter(item => item.enabled !== false && toolUrl(item.url)).map(item => ({ ...item, detail: item.target ? "Guided task" : "Site page", score: item.pinned ? 300 : item.score || 180 }));
    const suggestions = [...published, ...links.values(), ...[...current.values()].filter(item => item.kind === "control" || item.kind === "guide")]
      .filter(item => item.kind !== "link" || item.url !== location.href)
      .filter(item => !hiddenUrls.has(item.url) || item.kind === "published")
      .filter((item, index, all) => !item.url || all.findIndex(other => other.url === item.url && other.target === item.target) === index)
      .filter((item, index, all) => all.findIndex(other => toolTitleKey(other.title) === toolTitleKey(item.title)) === index)
      .sort((a, b) => (toolRank(b) + Math.min(3, b.seenOn?.length || 0) * 4) - (toolRank(a) + Math.min(3, a.seenOn?.length || 0) * 4) || a.title.localeCompare(b.title))
      .slice(0, 5);
    suggestedTools = suggestions;
    list.replaceChildren();
    $(".wr-scan-summary").textContent = suggestions.length ? "Shortcuts found on this site." : "No shortcuts found on this site yet.";
    for (const item of suggestions) {
      const row = document.createElement("button");
      const guided = !!item.target || item.kind === "guide";
      row.className = `wr-suggested-tool${guided ? " wr-tool-featured" : ""}`;
      row.type = "button";
      row.addEventListener("click", () => launchSuggestedTool(item));
      const icon = document.createElement("span");
      icon.className = "wr-tool-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = guided ? "✦" : item.kind === "control" ? "◎" : "↗";
      const copy = document.createElement("span");
      copy.className = "wr-tool-copy";
      if (guided) {
        const kicker = document.createElement("span");
        kicker.className = "wr-tool-kicker";
        kicker.textContent = "Guided by Rose";
        copy.append(kicker);
      }
      const title = document.createElement("strong");
      title.textContent = guided || /^(?:open|view|find|check|manage|change|track|search|update|browse|go to)\b/i.test(item.title)
        ? item.title
        : /^orders?$/i.test(item.title) ? "View orders"
        : /^(?:help|help center|support)$/i.test(item.title) ? "Find help"
        : /^account settings$/i.test(item.title) ? "Manage account settings"
        : `Open ${item.title}`;
      const detail = document.createElement("small");
      const destination = item.url ? toolUrl(item.url) : null;
      detail.textContent = guided ? "Rose opens the page and points to the next step"
        : item.kind === "control" ? "Rose highlights it on this page"
        : destination?.pathname === location.pathname && destination.hash ? "Jump to this section"
        : "Open this page";
      copy.append(title, detail);
      const arrow = document.createElement("span");
      arrow.className = "wr-suggested-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "›";
      row.append(icon, copy, arrow);
      list.appendChild(row);
    }
    if (chatContext) chatContext.textContent = `Looking at ${document.title.replace(/\s+/g, " ").trim().slice(0, 55) || location.hostname}`;
    if (chatStarters) {
      chatStarters.replaceChildren();
      const shoppingPage = !!document.querySelector('[data-component-type="s-search-result"],.product-card,.product-item,.product_pod,[itemtype$="/Product"]');
      chatStarters.parentElement?.querySelector('.wr-offer-preview')?.remove();
      if (host?.minimalUI) {
        const greeting = root.querySelector('.wr-chat-log .wr-row:first-child .wr-msg');
        if (shoppingPage && greeting?.textContent === cfg.greeting) greeting.textContent = 'Ask me to find the cheapest product here, compare options with 4★ ratings, or guide you around this site.';
        return;
      }
      if (shoppingPage) {
        const greeting = root.querySelector('.wr-chat-log .wr-row:first-child .wr-msg');
        if (greeting?.textContent === cfg.greeting) greeting.textContent = 'I can compare the products shown here and take you to a match.';
        for (const [title, question] of [['Find lowest price','Find the cheapest product on this page'],['Cheapest 4★ & up','Find the cheapest product with at least 4 stars']]) {
          const button = document.createElement('button'); button.type = 'button'; button.textContent = title;
          button.addEventListener('click', () => { input.value = question; submitChat(); }); chatStarters.append(button);
        }
        liveProductInventory().then(inventory => {
          if (!chatStarters.isConnected || location.href !== inventory?.url && location.origin + location.pathname !== inventory?.url) return;
          const offers = (inventory.products || []).filter(item => Number.isFinite(item.price));
          if (!offers.length || new Set(offers.map(item => item.currency)).size !== 1) return;
          const cheapest = offers.reduce((best, item) => item.price < best.price ? item : best);
          const preview = document.createElement('div'); preview.className = 'wr-offer-preview';
          const kicker = document.createElement('small'); kicker.textContent = `Lowest visible price · ${offers.length} offers`;
          const price = document.createElement('strong'); price.textContent = cheapest.displayPrice;
          const title = document.createElement('span'); title.textContent = cheapest.title;
          const open = document.createElement('button'); open.type = 'button'; open.textContent = 'Open product ↗';
          open.addEventListener('click', () => navigateTo(cheapest));
          preview.append(kicker, price, title, open);
          chatStarters.after(preview);
        }).catch(() => {});
      } else if (!pendingTaskGuide && !shoppingHistory.some(message => message.role === "user")) for (const item of suggestions.slice(0, 3)) {
        const button = document.createElement("button"); button.type = "button"; button.textContent = item.title;
        button.addEventListener("click", () => launchSuggestedTool(item)); chatStarters.append(button);
      }
    }
  }
  function launchSuggestedTool(item, view = "chat") {
    document.dispatchEvent(new CustomEvent("atlas:guide-navigation"));
    chatStarters?.replaceChildren();
    if (item.kind === "guide") {
      setView("chat"); input.value = `How do I ${item.title.charAt(0).toLowerCase()}${item.title.slice(1)}?`; submitChat(); return;
    }
    if (item.kind === "control") {
      if (visibleSiteControl(item.element)) showSpotlight(item.element, item.title);
      else renderToolSuggestions();
      return;
    }
    const destination = toolUrl(item.url) || (item.kind === "mapped-page" ? safePageUrl(item.url) : null);
    if (!destination) { $(".wr-scan-summary").textContent = "This destination is unavailable. Rescan or ask Rose for another route."; return; }
    const id = item.id || `page:${destination.pathname}${destination.hash}`;
    const guideGoal = String(item.goal || item.title || "").trim().slice(0, 200);
    toolMetric(id, "starts");
    cancelGuideWork(); clearSpotlight(); guideForm = null; activatedGuideControl = null; completionGuideControl = null;
    pendingTaskGuide = { goal: guideGoal, destinationTitle: item.title, mappedPage: item.kind === "mapped-page", toolId: id, expectedUrl: destination.href, targetSelector: item.target || "", completion:item.completion || "", fieldSelector:item.field || "", steps:item.steps || [], view, at: Date.now(), visited: [], phase: "seeking" };
    guideActivity = { goal: guideGoal, at: Date.now(), steps: [], current: "Opening the right page…", footer: "" };
    setView(view); panel.classList.add("open"); fab.style.display = "none";
    renderGuideActivity(); saveSiteSession();
    advanceTaskGuide();
  }
  const controlWords = value => String(value || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  function visibleSiteControl(element) {
    if (!element || root.contains(element) || element.disabled || element.closest('[hidden], [aria-hidden="true"], [inert]')) return false;
    const style = getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
  }
  function controlLabel(element) {
    const labels = [...(element.labels || [])].map(label => label.textContent).join(" ");
    const explicit = element.getAttribute("aria-label") || element.getAttribute("title") || labels || element.closest("fieldset")?.querySelector("legend")?.textContent || element.getAttribute("placeholder") || "";
    return String(explicit || element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 100);
  }
  function safeControl(element) {
    const context = `${controlLabel(element)} ${element.name || ""} ${element.id || ""} ${element.closest("form")?.action || ""}`;
    return !/\b(?:password|payment|credit|card number|checkout|purchase|place order|complete order|confirm order|pay|delete|remove|unsubscribe|subscribe|consent|privacy|login|logout|sign in|sign out|sign up|register|email|phone|address|book|reserve|upload|send)\b/i.test(context);
  }
  function clearSpotlight(keepCompact = false) {
    if (!keepCompact) restoreGuidePanel();
    if (!activeSpotlight) return;
    cancelAnimationFrame(activeSpotlight.frame);
    document.removeEventListener("keydown", activeSpotlight.onKeydown);
    activeSpotlight.element.removeEventListener("click", activeSpotlight.onClick, true);
    if (activeSpotlight.temporaryTabIndex) activeSpotlight.element.removeAttribute("tabindex");
    activeSpotlight.layer.remove();
    activeSpotlight.style.remove();
    activeSpotlight = null;
  }
  // A guide owns its timers and observers. Pausing invalidates every queued step.
  function cancelGuideWork() {
    guideEpoch++;
    clearTimeout(guideTimer);
    guideObserver?.disconnect();
    guideObserver = null;
  }
  function guideAfterLayout(callback, delay = 220) {
    cancelGuideWork();
    const epoch = guideEpoch;
    const started = performance.now();
    const finish = () => {
      if (epoch !== guideEpoch || pendingTaskGuide?.paused) return;
      guideObserver?.disconnect();
      guideObserver = null;
      callback();
    };
    guideObserver = new MutationObserver(records => {
      if (!records.some(record => !root.contains(record.target) && !record.target.closest?.('[data-rose-spotlight]'))) return;
      clearTimeout(guideTimer);
      guideTimer = setTimeout(finish, Math.min(delay, Math.max(0, 1400 - (performance.now() - started))));
    });
    guideObserver.observe(document.body, { childList: true, subtree: true });
    guideTimer = setTimeout(finish, delay);
  }
  function guideStatus(text) {
    if (!guideActivity) guideActivity = { steps: [], at: Date.now(), goal: "" };
    updateGuideActivity({ current: text });
    const compact = root.querySelector('.wr-guide-compact-text');
    if (compact) compact.textContent = text || "Rose guide";
    const action = root.querySelector('.wr-guide-compact-bar button');
    if (action && pendingTaskGuide) action.textContent = pendingTaskGuide.paused ? 'Resume guide' : 'Focus target';
  }
  function restoreGuidePanel() {
    root.classList.remove('wr-guide-left', 'wr-guide-compact');
    root.querySelector('.wr-guide-compact-bar')?.remove();
  }
  function keepTargetVisible(element) {
    if (!panel.classList.contains('open') || cfg.inline) return;
    const target = element.getBoundingClientRect();
    const overlaps = rect => target.left < rect.right + 12 && target.right > rect.left - 12 && target.top < rect.bottom + 12 && target.bottom > rect.top - 12;
    if (root.classList.contains('wr-guide-compact')) {
      const bar = root.querySelector('.wr-guide-compact-bar');
      if (bar) {
        const viewport = window.visualViewport;
        const top = viewport?.offsetTop || 0;
        const height = viewport?.height || innerHeight;
        bar.style.top = target.top - top > height / 2 ? `${top + 10}px` : 'auto';
        bar.style.bottom = target.top - top > height / 2 ? 'auto' : `${Math.max(10, innerHeight - top - height + 10)}px`;
      }
      return;
    }
    if (!overlaps(panel.getBoundingClientRect())) return;
    if (innerWidth >= 850 && !cfg.contained) {
      root.classList.add('wr-guide-left');
      if (!overlaps(panel.getBoundingClientRect())) return;
      root.classList.remove('wr-guide-left');
    }
    root.classList.add('wr-guide-compact');
    const bar = document.createElement('div');
    bar.className = 'wr-guide-compact-bar';
    const text = document.createElement('span');
    text.className = 'wr-guide-compact-text';
    text.textContent = `Highlighted ${controlLabel(element)}`;
    const focus = document.createElement('button');
    focus.textContent = 'Focus target';
    focus.addEventListener('click', () => pendingTaskGuide?.paused ? resumeGuide() : focusGuideTarget());
    const chat = document.createElement('button');
    chat.textContent = 'Show chat';
    chat.addEventListener('click', () => { pauseGuide(); restoreGuidePanel(); setView('chat'); input.focus(); });
    bar.append(text, focus, chat);
    root.appendChild(bar);
    // Move keyboard focus out of a chat panel we just hid.
    if (panel.contains(document.activeElement)) focus.focus({ preventScroll: true });
    keepTargetVisible(element);
  }
  function focusGuideTarget() {
    const target = activeSpotlight?.element;
    if (!target || !visibleSiteControl(target)) return;
    if (!target.matches('a[href],button,input,select,textarea,[tabindex],summary')) {
      target.setAttribute('tabindex', '-1');
      activeSpotlight.temporaryTabIndex = true;
    }
    target.focus({ preventScroll: true });
  }
  function pauseGuide() {
    if (!activeSpotlight && (!pendingTaskGuide || pendingTaskGuide.paused)) return;
    cancelGuideWork();
    if (pendingTaskGuide) pendingTaskGuide.paused = true;
    const scrollingTarget = activeSpotlight?.element;
    clearSpotlight(true);
    // Stop only scrolling started by this guide; never pull the visitor back.
    if (scrollingTarget) {
      for (let node = scrollingTarget.parentElement; node; node = node.parentElement) {
        if (node.scrollHeight > node.clientHeight) node.scrollTo({ top: node.scrollTop, left: node.scrollLeft, behavior: 'instant' });
      }
      window.scrollTo({ top: scrollY, left: scrollX, behavior: 'instant' });
    }
    guideStatus('Guidance paused');
  }
  function resumeGuide() {
    if (!pendingTaskGuide) return;
    pendingTaskGuide.paused = false;
    if (guideForm && visibleSiteControl(guideForm.scope)) { showFormStep(pendingTaskGuide.formIndex || 0); return; }
    guideForm = null;
    pendingTaskGuide.phase = 'seeking';
    pendingTaskGuide.scanWaited = false;
    guideStatus('Finding the next step…');
    guideAfterLayout(advanceTaskGuide);
  }
  function recoverGuide(message, choices = []) {
    cancelGuideWork();
    clearSpotlight();
    if (pendingTaskGuide?.toolId && !pendingTaskGuide.metricFinished) { toolMetric(pendingTaskGuide.toolId, "failed"); pendingTaskGuide.metricFinished = true; }
    if (pendingTaskGuide) { pendingTaskGuide.paused = true; pendingTaskGuide.phase = 'recovery'; }
    guideStatus(message);
    renderGuideChoices(choices);
  }
  function renderGuideChoices(choices) {
    root.querySelector('.wr-guide-choices')?.remove();
    if (!choices.length) return;
    const list = document.createElement('div');
    list.className = 'wr-guide-choices';
    for (const choice of choices.slice(0, 3)) {
      const button = document.createElement('button');
      button.textContent = choice.label;
      button.addEventListener('click', () => {
        list.remove();
        if (!pendingTaskGuide) return;
        pendingTaskGuide.paused = false;
        if (choice.element) {
          if (!visibleSiteControl(choice.element)) { recoverGuide('That control moved. Try again or choose another section.'); return; }
          presentGuideTarget(choice);
        } else queueGuideRoute(choice);
      });
      list.appendChild(button);
    }
    log.appendChild(list);
  }
  function ensureGuidePlan() {
    if (!guideActivity.plan) guideActivity.plan = { title: "Let's do this step by step", items: [] };
    return guideActivity.plan;
  }
  function planStep(key, label, state = 'current') {
    const plan = ensureGuidePlan();
    let step = plan.items.find(item => item.key === key);
    if (!step) { step = { key, label, state }; plan.items.push(step); }
    if (state === 'current') for (const item of plan.items) if (item.state === 'current') item.state = 'done';
    step.label = label;
    step.state = state;
    return step;
  }
  function prepareFormPlan(scope) {
    let fields = [...scope.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]),select,textarea')].filter(field => !field.disabled && !field.readOnly && controlLabel(field) && (!visibleSiteControl(scope) || visibleSiteControl(field)));
    const mapped = mappedWorkflowFor(scope);
    if (mapped) {
      try {
        const ordered = mapped.steps.filter(step => step.kind === 'field').map(step => scope.querySelector(step.selector));
        // Reuse saved order only when every target still matches the live form.
        if (ordered.length === fields.length && new Set(ordered).size === fields.length && ordered.every(field => fields.includes(field))) fields = ordered;
      } catch { /* A changed page falls back to the current controls. */ }
    }
    const submit = scope.querySelector('button[type="submit"],input[type="submit"],[data-rose-guide-submit]');
    if (!fields.length || !submit) return null;
    const form = { scope, fields, submit };
    for (const [index, field] of fields.entries()) {
      const label = controlLabel(field).toLowerCase();
      const instruction = /confirm.*password/.test(label) ? 'Confirm your new password' : /current password/.test(label) ? 'Enter your current password' : /new password/.test(label) ? 'Enter your new password' : `${field.matches('select,[type="checkbox"],[type="radio"]') ? 'Choose' : 'Enter'} ${label}`;
      planStep(`field:${index}`, instruction, 'upcoming');
    }
    planStep('submit', controlLabel(submit) || 'Submit the form', 'upcoming');
    return form;
  }
  function guideFieldError(field) {
    if (field.validity.valid) return '';
    if (field.validity.valueMissing) return 'Complete this field.';
    if (field.validity.customError && /confirm.*password/i.test(controlLabel(field))) return 'The passwords need to match.';
    if (field.validity.tooShort) return `Use at least ${field.minLength} characters.`;
    return 'Check this field.';
  }
  function updateGuideFieldError(field) {
    const index = guideForm?.fields.indexOf(field) ?? -1;
    if (index < 0) return;
    const item = ensureGuidePlan().items.find(item => item.key === `field:${index}`);
    if (item) item.error = guideFieldError(field);
    renderGuidePlan();
  }
  document.addEventListener('invalid', event => {
    if (guideForm?.scope.contains(event.target)) updateGuideFieldError(event.target);
  }, true);
  document.addEventListener('input', event => {
    const index = guideForm?.fields.indexOf(event.target) ?? -1;
    if (index < 0) return;
    const item = ensureGuidePlan().items.find(item => item.key === `field:${index}`);
    if (item?.error) updateGuideFieldError(event.target);
  }, true);
  function formFieldFinished(field) {
    // Only completion booleans are used; field values never enter the guide/session/chat.
    return field.matches('[type="checkbox"],[type="radio"]') ? (!field.required || field.checked) : (!field.required || field.value.length > 0) && field.validity.valid;
  }
  function guideFormIndex(element) {
    if (!guideForm) return -1;
    return element === guideForm.submit ? guideForm.fields.length : guideForm.fields.indexOf(element);
  }
  function showFormStep(index) {
    if (!pendingTaskGuide || pendingTaskGuide.paused || !guideForm || !visibleSiteControl(guideForm.scope)) return;
    const form = guideForm;
    if (index === form.fields.length) { const unfinished = form.fields.findIndex(field => !formFieldFinished(field)); if (unfinished >= 0) index = unfinished; }
    const element = form.fields[index] || form.submit;
    for (const [n, field] of form.fields.entries()) {
      const item = ensureGuidePlan().items.find(item => item.key === `field:${n}`);
      item.state = n === index ? 'current' : formFieldFinished(field) ? 'done' : 'upcoming';
    }
    ensureGuidePlan().items.find(item => item.key === 'submit').state = index === form.fields.length ? 'current' : 'upcoming';
    pendingTaskGuide.phase = 'form';
    pendingTaskGuide.formIndex = index;
    if (!visibleSiteControl(element)) {
      clearSpotlight(true);
      guideStatus('Complete the required fields to enable the final step.');
      return;
    }
    showSpotlight(element, controlLabel(element));
    guideStatus('');
  }
  function startFormGuide(dialog) {
    guideForm?.observer?.disconnect();
    guideForm = prepareFormPlan(dialog);
    if (!guideForm) return false;
    cancelGuideWork();
    const opening = ensureGuidePlan().items.find(item => item.key === 'open');
    if (opening) opening.state = 'done';
    pendingTaskGuide.phase = 'form';
    const preferred = pendingTaskGuide.fieldSelector ? guideForm.fields.findIndex(field=>field.matches(pendingTaskGuide.fieldSelector)) : 0;
    showFormStep(Math.max(0,preferred));
    const form = guideForm;
    form.observer = new MutationObserver(() => {
      if (guideForm !== form || !pendingTaskGuide) { form.observer.disconnect(); return; }
      const fields = [...form.scope.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]),select,textarea')].filter(field => !field.disabled && !field.readOnly && controlLabel(field) && visibleSiteControl(field));
      if (fields.length === form.fields.length && fields.every(field => form.fields.includes(field))) return;
      const active = form.fields[pendingTaskGuide.formIndex];
      const previous = new Map(form.fields.map((field, i) => [field, ensureGuidePlan().items.find(item => item.key === `field:${i}`)]));
      const plan = ensureGuidePlan();
      plan.items = plan.items.filter(item => !item.key.startsWith('field:') && item.key !== 'submit');
      form.fields = fields;
      fields.forEach((field, i) => {
        const label = controlLabel(field).toLowerCase();
        const step = planStep(`field:${i}`, previous.get(field)?.label || `Enter ${label}`, 'upcoming');
        step.error = previous.get(field)?.error || '';
      });
      planStep('submit', controlLabel(form.submit) || 'Submit the form', 'upcoming');
      if (!pendingTaskGuide.paused) showFormStep(Math.max(0, fields.indexOf(active)));
      else { renderGuidePlan(); saveSiteSession(); }
    });
    form.observer.observe(dialog, { childList:true, subtree:true, attributes:true, attributeFilter:['hidden','disabled','style','class'] });
    return true;
  }
  function renderGuidePlan() {
    const plan = guideActivity?.plan;
    let row = log.querySelector('.wr-guide-plan-row');
    if (!plan) { row?.remove(); return; }
    if (!row) {
      row = document.createElement('div'); row.className = 'wr-row wr-guide-plan-row';
      const avatar = document.createElement('div'); avatar.className = 'wr-avatar';
      const img = document.createElement('img'); img.src = cfg.logo; img.alt = ''; avatar.appendChild(img);
      const bubble = document.createElement('div'); bubble.className = 'wr-msg bot wr-guide-plan';
      const intro = document.createElement('p'); intro.className = 'wr-guide-plan-intro'; intro.textContent = plan.title;
      const list = document.createElement('ol'); list.className = 'wr-guide-plan-list';
      bubble.append(intro, list); row.append(avatar, bubble);
      const status = log.querySelector('.wr-guide-status');
      if (status) status.before(row); else log.appendChild(row);
    }
    const list = row.querySelector('ol');
    for (const [index, step] of plan.items.entries()) {
      let item = list.children[index];
      if (!item) { item = document.createElement('li'); list.appendChild(item); }
      item.dataset.state = step.state;
      if (step.state === 'current') item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
      const fieldIndex = step.key.startsWith('field:') ? Number(step.key.slice(6)) : step.key === 'submit' ? guideForm?.fields.length : -1;
      const clickable = guideForm && fieldIndex >= 0 && pendingTaskGuide?.phase === 'form';
      if (item.dataset.label !== step.label || !!item.querySelector('button') !== !!clickable) {
      item.replaceChildren(); item.dataset.label = step.label;
      if (clickable) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'wr-guide-step-button'; button.textContent = step.label;
        button.addEventListener('click', () => {
          if (!pendingTaskGuide || !guideForm) return;
          pendingTaskGuide.paused = false; showFormStep(fieldIndex);
          const target = guideForm.fields[pendingTaskGuide.formIndex] || guideForm.submit;
          target.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
          target.focus({preventScroll:true});
        });
        item.appendChild(button);
      } else item.appendChild(document.createTextNode(step.label));
      }
      item.querySelector('.wr-guide-step-error')?.remove();
      if (step.error) { const error = document.createElement('small'); error.className = 'wr-guide-step-error'; error.textContent = step.error; item.appendChild(error); }
    }
    while (list.children.length > plan.items.length) list.lastElementChild.remove();
    const current = plan.items.findIndex(item => item.state === 'current');
    row.querySelector('.wr-guide-plan').setAttribute('aria-label', current >= 0 ? `Step ${current + 1} of ${plan.items.length}` : 'Guidance steps');
  }
  document.addEventListener('focusout', event => {
    if (!guideForm || pendingTaskGuide?.phase !== 'form' || pendingTaskGuide.paused) return;
    const index = guideForm.fields.indexOf(event.target);
    if (index < 0) return;
    updateGuideFieldError(event.target);
    if (!formFieldFinished(event.target)) return;
    // Let the browser finish moving focus; never move focus or type on the visitor's behalf.
    requestAnimationFrame(() => {
      if (!guideForm || !pendingTaskGuide || pendingTaskGuide.paused || pendingTaskGuide.phase !== 'form') return;
      const focused = guideFormIndex(document.activeElement);
      showFormStep(focused >= 0 ? focused : Math.min(index + 1, guideForm.fields.length));
    });
  }, true);
  function queueGuideRoute(next) {
    const task = pendingTaskGuide;
    if (!task || task.paused) return;
    if (next.element) {
      if (!visibleSiteControl(next.element)) { recoverGuide('That menu is no longer available. Resume to check again.'); return; }
      task.phase = 'route-control'; task.nextRoute = { label: next.label, key: next.key };
      task.targetLabel = next.label;
      planStep(next.key, `Open ${next.label}`); showSpotlight(next.element, next.label); guideStatus(''); saveSiteSession(); return;
    }
    const link = [...document.querySelectorAll('a[href]')].find(link => link.href === next.url && visibleSiteControl(link));
    if (!link || task.visited.includes(next.url)) { recoverGuide('That route is no longer available. Choose another section.'); return; }
    planStep(`route:${next.url}`, `Open ${next.label}`);
    task.phase = 'route'; task.nextRoute = { url: next.url, label: next.label };
    showSpotlight(link, next.label);
    guideStatus('');
  }
  function presentGuideTarget(target) {
    if (!pendingTaskGuide || pendingTaskGuide.paused) return;
    if (target.element.matches('form') && startFormGuide(target.element)) return;
    if (pendingTaskGuide.completion === 'page') {
      finishGuideStep(`Opened ${pendingTaskGuide.destinationTitle || target.label}.`); showSpotlight(target.element,target.label); return;
    }
    // A requested tab can already be open after hash navigation. Do not ask
    // the visitor to click it again or leave an unrelated guide resumable.
    if (target.element.matches('[role="tab"][aria-selected="true"]')) {
      finishGuideStep(`${target.label} is open.`);
      showSpotlight(target.element, target.label);
      return;
    }
    if (target.workflow && !target.workflow.steps.some(step => step.kind === 'open')) {
      try { const scope = document.querySelector(target.workflow.scope); if (scope && visibleSiteControl(scope) && startFormGuide(scope)) return; } catch {}
    }

    pendingTaskGuide.phase = 'target';
    pendingTaskGuide.targetLabel = target.label;
    pendingTaskGuide.targetUrl = target.element.matches('a[href]') ? taskGuideUrl(target.element.href)?.href : null;
    if (!guideActivity) guideActivity = { goal: pendingTaskGuide.goal, at: Date.now(), steps: [], current: '' };
    if (guideActivity.steps.at(-1) !== `Found ${target.label}`) guideActivity.steps.push(`Found ${target.label}`);
    planStep('open', `Open ${target.label}`);
    const dialogId = target.element.getAttribute('aria-controls');
    const controlled = dialogId && document.getElementById(dialogId);
    if (controlled?.matches('dialog,[role="dialog"],form')) prepareFormPlan(controlled);
    showSpotlight(target.element, target.label);
    guideStatus('');
    if (!pendingTaskGuide.presented) {
      pendingTaskGuide.presented = true;
      if (pendingTaskGuide.view === 'voice') $(".wr-note").textContent = `Follow the highlighted control on the page. Start with ${target.label}.`;
    }
    saveSiteSession();
  }
  function finishGuideStep(text) {
    activatedGuideControl = null; completionGuideControl = null;
    cancelGuideWork();
    if (pendingTaskGuide?.toolId && (!pendingTaskGuide.metricFinished || pendingTaskGuide.metricFinished === "unconfirmed")) toolMetric(pendingTaskGuide.toolId, "verified");
    if (guideActivity?.plan) for (const item of guideActivity.plan.items) if (item.state === 'current') item.state = 'done';
    if (guideActivity) guideActivity.completedPath = `${location.pathname}${location.search}`;
    pendingTaskGuide = null;
    guideForm?.observer?.disconnect();
    guideForm = null;
    clearSpotlight(true);
    guideStatus(text);
    const focus = root.querySelector('.wr-guide-compact-bar button');
    if (focus?.textContent === 'Focus target') focus.remove();
    if (text === 'All steps complete.') {
      const activity = guideActivity;
      const row = log.querySelector('.wr-guide-plan-row');
      const bubble = row?.querySelector('.wr-guide-plan');
      if (bubble) {
        bubble.replaceChildren(); bubble.setAttribute('role','status'); bubble.setAttribute('aria-label','Task complete');
        const message = document.createElement('div'); message.className = 'wr-guide-complete';
        const check = document.createElement('span'); check.className = 'wr-guide-complete-check'; check.textContent = '✓'; check.setAttribute('aria-hidden','true');
        message.append(check, document.createTextNode("All done. You're set.")); bubble.appendChild(message);
        log.querySelector('.wr-guide-status')?.replaceChildren();
        // Do not restore an already completed checklist after reload.
        activity.plan = null; activity.steps = []; activity.current = ''; saveSiteSession();
        setTimeout(() => {
          if (guideActivity !== activity) return;
          row.classList.add('wr-guide-fading');
          setTimeout(() => { if (guideActivity === activity) { row.remove(); log.querySelector('.wr-guide-status')?.remove(); } }, 450);
        }, 3500);
      }
    }
  }
  function watchGuideActivation(element) {
    if (!pendingTaskGuide) { clearSpotlight(); return; }
    const task = pendingTaskGuide;
    if (task.phase === 'route' && task.nextRoute) {
      const next = task.nextRoute;
      task.visited = [...new Set([...task.visited, location.href])];
      task.phase = 'seeking'; task.scanWaited = false;
      updateGuideActivity({ pendingUrl: next.url, pendingLabel: next.label });
      clearSpotlight();
      return;
    }
    if (task.phase === 'form' && guideForm) {
      if (element !== guideForm.submit) return;
      if (guideForm.fields.some(field => !formFieldFinished(field))) return;
      clearSpotlight(true);
      task.phase = 'submitted';
      if (task.toolId && !task.metricFinished) { toolMetric(task.toolId, "unconfirmed"); task.metricFinished = "unconfirmed"; }
      guideStatus("Submitted — check the site's confirmation.");
      return;
    }
    const routeControl = task.phase === 'route-control';
    const controlled = document.getElementById(element.getAttribute('aria-controls') || '');
    const wasControlledVisible = controlled && visibleSiteControl(controlled);
    const sequenceIndex = task.steps?.indexOf(element.id) ?? -1;
    const nextControlId = sequenceIndex >= 0 ? task.steps[sequenceIndex+1] : element.getAttribute('data-rose-guide-next');
    completionGuideControl = element.hasAttribute('data-rose-guide-complete') ? element : null;
    activatedGuideControl = element;
    const beforeUrl = location.href;
    const beforeValue = element.matches('select,input') ? element.value : null;
    const beforeChecked = element.checked;
    const beforeExpanded = element.getAttribute('aria-expanded');
    const beforeSelected = element.getAttribute('aria-selected');
    const dialogs = new Set([...document.querySelectorAll('dialog[open],[role="dialog"],[aria-modal="true"]')].filter(visibleSiteControl));
    task.phase = 'awaiting';
    task.fromUrl = beforeUrl;
    clearSpotlight(true);
    guideStatus('Waiting for the page to respond…');
    cancelGuideWork();
    const started = performance.now();
    const check = () => {
      if (pendingTaskGuide !== task || task.paused) return;
      // Follow site-authored steps only after their control becomes visible.
      // This also handles dialogs that replace their contents without opening a new element.
      if (nextControlId) {
        const next = document.getElementById(nextControlId);
        if (next && !root.contains(next) && visibleSiteControl(next)) {
          task.phase = 'target'; task.targetLabel = controlLabel(next);
          completionGuideControl = null;
          planStep(`control:${nextControlId}`, `Choose ${task.targetLabel}`);
          showSpotlight(next, task.targetLabel); guideStatus(''); saveSiteSession(); return;
        }
        if (performance.now() - started >= 3500) {
          recoverGuide("The next step didn't appear. Check the dialog or resume the guide."); return;
        }
        guideTimer = setTimeout(check, 100); return;
      }
      const dialog = [...document.querySelectorAll('dialog[open],[role="dialog"],[aria-modal="true"]')].find(item => visibleSiteControl(item) && !dialogs.has(item));
      if (dialog) {
        if (task.completion === "open") { finishGuideStep(`${task.targetLabel} is open.`); return; }
        if (startFormGuide(dialog)) return;
        finishGuideStep(`${task.targetLabel} opened. Continue in the dialog.`);
        // Respect the site's existing focus management and never focus a sensitive field.
        if (!dialog.contains(document.activeElement)) {
          const hadTabIndex = dialog.hasAttribute('tabindex');
          if (!hadTabIndex) dialog.setAttribute('tabindex', '-1');
          dialog.focus({ preventScroll: true });
          if (!hadTabIndex) dialog.addEventListener('blur', () => dialog.removeAttribute('tabindex'), { once: true });
        }
        return;
      }
      if ((beforeValue !== null && (element.value !== beforeValue || element.checked !== beforeChecked))) {
        finishGuideStep(`${task.targetLabel} updated.`);
        return;
      }
      if (location.href !== beforeUrl || (!wasControlledVisible && controlled && visibleSiteControl(controlled)) || (beforeExpanded !== null && element.getAttribute('aria-expanded') !== beforeExpanded) || (beforeSelected !== 'true' && element.getAttribute('aria-selected') === 'true') || (element.matches('summary') && element.parentElement?.open)) {
        if (routeControl) { task.visited.push(task.nextRoute.key); task.phase = 'seeking'; task.scanWaited = false; task.nextRoute = null; saveSiteSession(); guideAfterLayout(advanceTaskGuide); return; }
        finishGuideStep(`${task.targetLabel} opened.`);
        return;
      }
      if (performance.now() - started >= 3500) {
        recoverGuide("I couldn't confirm that opened. Check the page, or try the guide again.");
        return;
      }
      guideTimer = setTimeout(check, 100);
    };
    // The target's own handlers and default action run before we inspect the outcome.
    guideTimer = setTimeout(check, 60);
  }
  document.addEventListener('rose:guide-complete', event => {
    if (pendingTaskGuide?.phase === 'awaiting' && event.target.matches?.('dialog') && activatedGuideControl?.getAttribute?.('aria-controls') === event.target.id) { finishGuideStep('All steps complete.'); return; }
    if (pendingTaskGuide?.phase === 'awaiting' && completionGuideControl && event.detail?.control === completionGuideControl) { finishGuideStep('All steps complete.'); return; }
    if (guideForm && event.target === guideForm.scope && ['submitted','form'].includes(pendingTaskGuide?.phase)) finishGuideStep('All steps complete.');
  });
  document.addEventListener('close', event => {
    if (!pendingTaskGuide || !event.target.matches?.('dialog')) return;
    if (guideForm?.scope !== event.target && !event.target.contains(activeSpotlight?.element) && activatedGuideControl?.getAttribute?.('aria-controls') !== event.target.id) return;
    cancelGuideWork(); pendingTaskGuide = null;
    guideForm?.observer?.disconnect(); guideForm = null; clearSpotlight();
    guideStatus('Step closed. Ask Rose whenever you want to start again.'); saveSiteSession();
  }, true);
  document.addEventListener('pointerdown', event => {
    if (root.contains(event.target) || activeSpotlight?.element.contains(event.target) || (guideForm && guideForm.scope.contains(event.target))) return;
    // Let the visitor finish in a dialog after activating the target.
    if (pendingTaskGuide?.phase === 'awaiting') return;
    pauseGuide();
  }, true);
  document.addEventListener('focusin', event => {
    if (guideForm && guideForm.scope.contains(event.target)) {
      const index = guideFormIndex(event.target);
      if (index >= 0 && pendingTaskGuide?.phase === 'form' && !pendingTaskGuide.paused && index !== pendingTaskGuide.formIndex) showFormStep(index);
      return;
    }
    if (activeSpotlight && !root.contains(event.target) && event.target !== activeSpotlight.element && pendingTaskGuide?.phase !== 'awaiting') pauseGuide();
  }, true);
  document.addEventListener('input', event => {
    if (guideForm?.scope.contains(event.target)) return;
    if (pendingTaskGuide?.phase === 'awaiting' && !root.contains(event.target)) return;
    pauseGuide();
  }, true);
  for (const type of ['wheel', 'touchmove']) document.addEventListener(type, event => {
    if (!root.contains(event.target) && pendingTaskGuide?.phase !== 'awaiting') pauseGuide();
  }, { capture: true, passive: true });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { pauseGuide(); return; }
    if (event.altKey && event.shiftKey && event.code === 'KeyG' && activeSpotlight) { event.preventDefault(); focusGuideTarget(); return; }
    if (root.contains(event.target) || event.target === activeSpotlight?.element || guideForm?.scope.contains(event.target)) return;
    if (['PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp', ' '].includes(event.key) || (event.key.length === 1 && event.target.matches?.('input,textarea,[contenteditable="true"]'))) pauseGuide();
  }, true);
  function guidanceIntent(message) {
    const match = /^(?:please\s+)?(show me where|highlight|point me to|point to|where is)\s+(.+?)[?.!]*$/i.exec(String(message).trim());
    return match ? { command: match[1].toLowerCase(), target: match[2].replace(/^(?:the|a|an)\s+/i, "").trim() } : null;
  }
  function guidanceCandidates(query) {
    if (/^\/(?:account|admin|cart|checkout|checkouts|orders|password)(?:\/|$)/i.test(location.pathname)) return [];
    const ignored = new Set(["the", "a", "an", "button", "link", "field", "section", "selector", "option", "on", "this", "page", "please", "to", "my", "choose", "change", "set", "find"]);
    const words = controlWords(query).split(" ").filter(word => word.length > 1 && !ignored.has(word));
    if (!words.length) return [];
    const selector = 'a[href], button, select, input:not([type="hidden"]):not([type="password"]):not([type="email"]):not([type="tel"]):not([type="submit"]), [role="button"], [role="tab"], summary, h1, h2, h3';
    return [...document.querySelectorAll(selector)].flatMap(element => {
      if (!visibleSiteControl(element) || !safeControl(element)) return [];
      // Highlighting a visible web link does not navigate or grant access to its destination.
      if (element.matches("a[href]") && !/^https?:$/.test(new URL(element.href, location.href).protocol)) return [];
      const label = controlWords(controlLabel(element));
      if (!label || !words.every(word => label.split(" ").some(part => part === word || part.startsWith(word)))) return [];
      const score = label === words.join(" ") ? 100 : 20 + words.length * 10 - label.split(" ").length;
      return [{ element, label: controlLabel(element), score }];
    }).sort((a, b) => b.score - a.score);
  }
  function showSpotlight(element, label) {
    clearSpotlight();
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const style = document.createElement("style");
    style.textContent = `
      @property --rose-orbit-angle{syntax:"<angle>";initial-value:0deg;inherits:true}
      .rose-spotlight{--rose-orbit-angle:0deg;position:fixed;z-index:2147482999;pointer-events:none;box-sizing:border-box;border:1px solid rgba(255,139,91,.28);box-shadow:0 0 12px 2px rgba(255,120,61,.1);opacity:0;transition:opacity .3s ease}
      .rose-spotlight::before,.rose-spotlight::after{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:2px;background:conic-gradient(from var(--rose-orbit-angle),rgba(255,106,53,.12) 0deg,rgba(255,125,68,.3) 65deg,#ff934f 110deg,#ffe4b8 142deg,#ffb66e 160deg,rgba(255,111,57,.2) 205deg,rgba(255,111,57,.12) 245deg,#ffad77 290deg,rgba(255,120,61,.45) 315deg,rgba(255,106,53,.12) 360deg);mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask-composite:exclude;pointer-events:none}
      .rose-spotlight::before{inset:-4px;padding:6px;filter:blur(5px);opacity:.85}
      .rose-spotlight.ready{opacity:1;animation:rose-guidance-orbit 3.6s linear infinite}
      @keyframes rose-guidance-orbit{to{--rose-orbit-angle:360deg}}
      @media(prefers-reduced-motion:reduce){.rose-spotlight,.rose-spotlight.ready{animation:none;transition:none;--rose-orbit-angle:135deg}}
    `;
    const layer = document.createElement("div");
    layer.className = "rose-spotlight";
    layer.dataset.roseSpotlight = "true";
    layer.dataset.roseTarget = label;
    layer.setAttribute("aria-hidden", "true");
    const radius = parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;
    layer.style.borderRadius = `${Math.max(5, radius + 4)}px`;
    document.head.appendChild(style);
    (element.closest("dialog[open]") || document.body).appendChild(layer);
    const onKeydown = event => { if (event.key === "Escape") clearSpotlight(); };
    const onClick = () => watchGuideActivation(element);
    document.addEventListener("keydown", onKeydown);
    element.addEventListener("click", onClick, true);
    const state = { layer, style, element, frame: 0, onKeydown, onClick };
    activeSpotlight = state;
    let lastRect = null;
    let stableSince = performance.now();
    let scrollStarted = false;
    let missingSince = 0;
    const update = () => {
      if (activeSpotlight !== state) return;
      if (!element.isConnected || !visibleSiteControl(element)) {
        layer.classList.remove('ready');
        if (!missingSince) missingSince = performance.now();
        if (performance.now() - missingSince > 450) {
          const replacements = [...document.querySelectorAll('a[href],button,select,input:not([type="password"]),[role="button"],[role="tab"],summary,h1,h2,h3')].filter(candidate => visibleSiteControl(candidate) && controlLabel(candidate) === label);
          if (replacements.length === 1) showSpotlight(replacements[0], label);
          else recoverGuide('That control is no longer visible. Try again or choose another section.', taskGuideRoutes(pendingTaskGuide?.goal || '', pendingTaskGuide?.visited || []));
          return;
        }
        state.frame = requestAnimationFrame(update);
        return;
      }
      missingSince = 0;
      const blockingDialog = [...document.querySelectorAll('dialog[open],[role="dialog"][aria-modal="true"],[aria-modal="true"]')].find(dialog => visibleSiteControl(dialog) && !dialog.contains(element));
      if (blockingDialog) {
        pauseGuide();
        guideStatus('Guidance paused while a dialog is open.');
        keepTargetVisible(blockingDialog);
        return;
      }
      const rect = element.getBoundingClientRect();
      const stable = lastRect && Math.abs(rect.top - lastRect.top) < .5 && Math.abs(rect.left - lastRect.left) < .5 && Math.abs(rect.width - lastRect.width) < .5 && Math.abs(rect.height - lastRect.height) < .5;
      if (!stable) stableSince = performance.now();
      layer.style.left = `${rect.left - 4}px`;
      layer.style.top = `${rect.top - 4}px`;
      layer.style.width = `${rect.width + 8}px`;
      layer.style.height = `${rect.height + 8}px`;
      const inViewport = rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
      if (scrollStarted && inViewport && (reducedMotion || performance.now() - stableSince >= 180)) {
        keepTargetVisible(element);
        if (!layer.classList.contains('ready')) {
          layer.classList.add('ready');
          renderGuideActivity();
        }
      }
      if (layer.classList.contains('ready') && (rect.bottom < 0 || rect.top > innerHeight)) { pauseGuide(); return; }
      lastRect = rect;
      state.frame = requestAnimationFrame(update);
    };
    guideAfterLayout(() => {
      if (activeSpotlight !== state) return;
      element.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "center", inline: "nearest" });
      scrollStarted = true;
      stableSince = performance.now();
    });
    state.frame = requestAnimationFrame(update);
  }
  function handleGuidanceRequest(message, view = "chat") {
    const intent = guidanceIntent(message);
    if (!intent) return false;
    const matches = guidanceCandidates(intent.target);
    if (!matches.length && intent.command === "where is") return false;
    const reply = !matches.length ? `I couldn't find ${intent.target.slice(0, 80)} on this page.`
      : matches[1]?.score === matches[0].score ? `I found several matches for ${intent.target.slice(0, 80)}. Please name the one you want more specifically.`
      : `I highlighted ${matches[0].label}.`;
    if (matches.length && matches[1]?.score !== matches[0].score) {
      cancelGuideWork();
      pendingTaskGuide = { goal: intent.target, direct: true, view, at: Date.now(), visited: [], phase: 'target', targetLabel: matches[0].label };
      guideActivity = { goal: intent.target, at: Date.now(), steps: [`Found ${matches[0].label}`], current: '' };
      showSpotlight(matches[0].element, matches[0].label);
      renderGuideActivity();
      saveSiteSession();
    }
    addMsg("bot", reply);
    if (view === "voice") $(".wr-note").textContent = reply;
    return true;
  }
  function taskGuideIntent(message) {
    const match = /^(?:how (?:do|can) i|help me|show me how to|can you (?:help me|show me how to)|where (?:do|can) i|i (?:need|want|would like) to)\s+(.+?)[?.!]*$/i.exec(String(message).trim());
    return match?.[1]?.trim().slice(0, 120) || null;
  }
  function taskGuideUrl(value) {
    try {
      const url = new URL(value, location.href);
      if (!/^https?:$/.test(url.protocol) || url.origin !== location.origin) return null;
      if (/^\/(?:admin|cart|checkout|checkouts|orders)(?:\/|$)/i.test(url.pathname)) return null;
      return url;
    } catch { return null; }
  }
  function taskGuideWords(goal) {
    const ignored = new Set(["i", "my", "me", "the", "a", "an", "to", "do", "can", "how", "where", "please", "on", "this", "site", "website"]);
    return controlWords(goal).split(" ").filter(word => word.length > 1 && !ignored.has(word));
  }
  function taskGuideHints(goal) {
    const text = controlWords(goal);
    if (/\b(password|passcode|two factor|2fa|security)\b/.test(text)) return ["security", "settings", "account", "profile"];
    if (/\b(email|username|profile|name)\b/.test(text)) return ["profile", "account", "settings"];
    if (/\b(notification|alert|preference)\b/.test(text)) return ["notifications", "preferences", "settings", "account"];
    if (/\b(billing|payment|invoice|subscription)\b/.test(text)) return ["billing", "subscription", "settings", "account"];
    return [];
  }
  function taskGuideTargets(goal) {
    const wordsFromGoal = taskGuideWords(goal);
    const mapped = installedWorkflows.flatMap(workflow => {
      if (!wordsFromGoal.length || !wordsFromGoal.every(word => controlWords(workflow.title).includes(word))) return [];
      try {
        const matches = document.querySelectorAll(workflow.target);
        if (matches.length !== 1 || !visibleSiteControl(matches[0])) return [];
        return [{ element: matches[0], label: workflow.title, score: 200, workflow }];
      } catch { return []; }
    });
    if (mapped.length) return mapped;

    const words = taskGuideWords(goal);
    if (!words.length) return [];
    return [...document.querySelectorAll('a[href], button, [role="button"], [role="tab"], summary')].flatMap(element => {
      if (!visibleSiteControl(element) || element.matches('[type="submit"], [disabled]')) return [];
      if (element.matches("a[href]") && !taskGuideUrl(element.href)) return [];
      const label = controlWords(controlLabel(element));
      if (!label || /\b(?:delete|remove|purchase|checkout|pay now|confirm order)\b/.test(label)) return [];
      const parts = label.split(" ");
      if (!words.every(word => parts.some(part => part === word || part.startsWith(word)))) return [];
      const score = label === words.join(" ") ? 100 : 30 + words.length * 10 - parts.length;
      return [{ element, label: controlLabel(element), score }];
    }).sort((a, b) => b.score - a.score);
  }
  function taskGuideRoutes(goal, visited) {
    const hints = taskGuideHints(goal);
    if (!hints.length) return [];
    const routes = new Map();
    for (const element of document.querySelectorAll('button[aria-controls],button[aria-expanded],button[aria-haspopup],summary,[role="tab"]')) {
      if (!visibleSiteControl(element) || element.getAttribute('aria-expanded') === 'true' || element.getAttribute('aria-selected') === 'true' || (element.matches('summary') && element.parentElement?.open)) continue;
      const label = controlLabel(element), key = `control:${label}`;
      if (visited.includes(key)) continue;
      const parts = controlWords(label).split(' ');
      const score = hints.reduce((best, hint, index) => Math.max(best, parts.includes(hint) ? 20 - index * 3 : 0), 0);
      if (score) routes.set(key, { element, label, score, key });
    }
    for (const element of document.querySelectorAll("a[href]")) {
      if (!visibleSiteControl(element)) continue;
      const url = taskGuideUrl(element.href);
      if (!url || visited.includes(url.href) || url.href === location.href) continue;
      const label = controlWords(controlLabel(element));
      const path = controlWords(url.pathname);
      const score = hints.reduce((best, hint, index) => Math.max(best, label.split(" ").includes(hint) ? 20 - index * 3 : path.split(" ").includes(hint) ? 5 - index : 0), 0);
      if (!score) continue;
      const existing = routes.get(url.href);
      if (!existing || score > existing.score) routes.set(url.href, { url: url.href, label: controlLabel(element) || url.pathname, score });
    }
    return [...routes.values()].sort((a, b) => b.score - a.score);
  }
  function renderGuideActivity() {
    let status = log.querySelector(".wr-guide-status");
    if (!guideActivity || !Array.isArray(guideActivity.steps)) { status?.remove(); root.querySelector('.wr-guide-actions')?.remove(); return; }
    if (!status) {
      status = document.createElement("div");
      status.className = "wr-guide-status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      status.setAttribute("aria-atomic", "false");
      status.setAttribute("aria-relevant", "additions text");
      status.setAttribute("aria-label", "Navigation status");
      log.appendChild(status);
    }
    renderGuidePlan();
    const labels = guideActivity.plan ? [guideActivity.current].filter(Boolean) : [...guideActivity.steps.slice(-5), guideActivity.current].filter(Boolean);
    labels.forEach((label, index) => {
      let line = status.children[index];
      if (!line) { line = document.createElement("div"); line.className = "wr-guide-status-line"; status.appendChild(line); }
      if (line.textContent !== label) line.textContent = label;
    });
    while (status.children.length > labels.length) status.lastElementChild.remove();
    root.querySelector('.wr-guide-actions')?.remove();
    if (pendingTaskGuide || activeSpotlight) {
      const actions = document.createElement('div');
      actions.className = 'wr-guide-actions';
      const addAction = (label, handler) => { const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.addEventListener('click', handler); actions.appendChild(button); };
      if (pendingTaskGuide?.paused) addAction('Resume guide', resumeGuide);
      else {
        if (activeSpotlight) { addAction('Focus highlighted control', focusGuideTarget); actions.lastChild.setAttribute('aria-keyshortcuts', 'Alt+Shift+G'); }
        addAction('Pause guide', pauseGuide);
      }
      status.after(actions);
    }
    log.parentElement.scrollTop = log.parentElement.scrollHeight;
  }
  function updateGuideActivity(changes) {
    if (!guideActivity) return;
    Object.assign(guideActivity, changes);
    renderGuideActivity();
    saveSiteSession();
  }
  function taskGuideSay(message, view = "chat") {
    addMsg("bot", message);
    renderGuideActivity();
    shoppingHistory.push({ role: "bot", text: message });
    saveSiteSession();
    if (view === "voice") $(".wr-note").textContent = message;
  }
  function advanceTaskGuide() {
    const task = pendingTaskGuide;
    if (!task || task.paused || typeof task.goal !== "string") return false;
    if (!installedMapLoaded) {
      if (!task.waitingForMap) { task.waitingForMap = true; installedMapReady.then(() => { if (pendingTaskGuide === task && !task.paused) advanceTaskGuide(); }); }
      return true;
    }

    if (task.toolId && task.expectedUrl) {
      const destination = toolUrl(task.expectedUrl) || (task.mappedPage ? safePageUrl(task.expectedUrl) : null);
      if (!destination) { recoverGuide("That destination is unavailable. Ask Rose for another route."); return true; }
      if (destination.pathname !== location.pathname || destination.search !== location.search || (destination.hash && destination.hash !== location.hash)) {
        if (task.routeAttempted) { recoverGuide("The expected page did not open. Check the link or ask Rose for another route."); return true; }
        task.routeAttempted = true; saveSiteSession();
        if (destination.pathname === location.pathname && destination.search === location.search) { location.hash = destination.hash; guideAfterLayout(advanceTaskGuide); }
        else location.assign(destination.href);
        return true;
      }
      if (!task.destinationReached) { task.destinationReached = true; toolMetric(task.toolId, "reached"); saveSiteSession(); }
      if (task.targetSelector) {
        let target = null;
        try { target = document.querySelector(task.targetSelector); } catch {}
        if (target && visibleSiteControl(target)) { presentGuideTarget({ element: target, label: controlLabel(target) || task.goal }); return true; }
        if (!task.scanWaited) { task.scanWaited = true; guideAfterLayout(advanceTaskGuide, 650); return true; }
        recoverGuide("The page opened, but the expected control is missing. The site owner should review this tool."); return true;
      }
      if (task.routeAttempted || destination.href === location.href) {
        if (task.mappedPage && !task.presented) {
          const targets = taskGuideTargets(task.goal);
          if (targets.length && targets[0].score !== targets[1]?.score) { presentGuideTarget(targets[0]); return true; }
          if (targets.length > 1) { recoverGuide("I found several matching controls. Choose one:", targets); return true; }
        }
        pendingTaskGuide = null;
        guideActivity = null;
        renderGuideActivity();
        taskGuideSay(`Opened ${task.destinationTitle || task.goal}.`, task.view);
        return true;
      }
    }
    if (task.phase === 'awaiting') {
      if (task.fromUrl !== location.href && (!task.targetUrl || taskGuideUrl(task.targetUrl)?.href === location.href)) finishGuideStep(`${task.targetLabel} opened.`);
      else recoverGuide("The page changed before I could confirm the action. Check it, or resume the guide.");
      return true;
    }
    const targets = task.direct ? guidanceCandidates(task.goal) : taskGuideTargets(task.goal);
    if (targets.length && targets[0].score !== targets[1]?.score) { presentGuideTarget(targets[0]); return true; }
    if (targets.length > 1) { recoverGuide('I found several matching controls. Choose one:', targets); return true; }
    // Give hydrated pages one bounded chance to finish loading before offering recovery.
    if (!task.scanWaited) {
      task.scanWaited = true;
      guideAfterLayout(advanceTaskGuide, 650);
      return true;
    }
    const visited = Array.isArray(task.visited) ? task.visited : [];
    const routes = task.direct ? [] : taskGuideRoutes(task.goal, visited);
    if (routes.length && routes[0].score !== routes[1]?.score && visited.length < 5) { queueGuideRoute(routes[0]); return true; }
    const message = routes.length > 1 ? 'I found several possible routes. Choose a section:'
      : /\b(?:sign.?in|log.?in)\b/i.test(location.pathname) ? 'Sign in yourself, then resume the guide.'
      : "I couldn't find the next step. Open another section, then resume the guide.";
    recoverGuide(message, routes);
    return true;
  }
  function resumeTaskGuide() {
    if (!pendingTaskGuide || pendingTaskGuide.paused) return;
    guideAfterLayout(advanceTaskGuide);
  }
  function handleTaskGuideRequest(message, view = "chat") {
    if (/^(?:resume|continue)(?: the)?(?: guide| guidance)?[.!]?$/i.test(String(message).trim()) && pendingTaskGuide) { resumeGuide(); return true; }
    if (/^(?:pause|stop)(?: the)?(?: guide| guidance)?[.!]?$/i.test(String(message).trim()) && (pendingTaskGuide || activeSpotlight)) { pauseGuide(); return true; }
    const goal = taskGuideIntent(message);
    if (!goal || (installedMapLoaded && !taskGuideHints(goal).length && !taskGuideTargets(goal).length)) return false;
    cancelGuideWork();
    clearSpotlight();
    root.querySelector('.wr-guide-choices')?.remove();
    guideForm = null;
    log.querySelector('.wr-guide-plan-row')?.remove();
    pendingTaskGuide = { goal, view, at: Date.now(), visited: [], phase: 'seeking' };
    guideActivity = { goal: String(message).trim().slice(0, 160), at: Date.now(), steps: [], current: "Looking for the right page…", footer: "" };
    renderGuideActivity();
    saveSiteSession();
    guideAfterLayout(advanceTaskGuide);
    return true;
  }
  function discoverSiteControls() {
    if (/^\/(?:account|admin|cart|checkout|checkouts|orders|password)(?:\/|$)/i.test(location.pathname)) return [];
    const controls = [];
    for (const element of document.querySelectorAll('input[type="search"], input[role="searchbox"], form[role="search"] input:not([type="hidden"]), input[name="s"], input[name="q"]')) {
      if (visibleSiteControl(element) && safeControl(element) && (element.type === "search" || element.getAttribute("role") === "searchbox" || element.closest('form[role="search"]') || /search/i.test(`${controlLabel(element)} ${element.form?.action || ""}`)) && (element.form || element.closest("form"))) controls.push({ kind: "search", element, label: controlLabel(element) || "Site search" });
    }
    for (const element of document.querySelectorAll("select")) {
      if (!visibleSiteControl(element) || !safeControl(element) || element.multiple) continue;
      const label = controlLabel(element);
      if (!/\b(?:sort|filter|size|color|colour|variant|quantity|style|material|category|brand|price)\b/i.test(`${label} ${element.name || ""}`) && !element.closest('form.cart, form.variations_form, [class*="filter"], [class*="facet"]')) continue;
      const options = [...element.options].filter(option => !option.disabled && option.value).map(option => option.textContent.trim()).filter(Boolean);
      if (options.length) controls.push({ kind: "select", element, label: label || "Options", options: options.slice(0, 30) });
    }
    for (const element of document.querySelectorAll('input[type="checkbox"], input[type="radio"]')) {
      if (!visibleSiteControl(element) || !safeControl(element)) continue;
      const container = element.closest('[class*="filter"], [id*="filter"], [class*="facet"], [id*="facet"], form.cart, form.variations_form, [role="group"]');
      if (!container) continue;
      const label = controlLabel(element);
      if (label) controls.push({ kind: "choice", element, label });
    }
    for (const element of document.querySelectorAll('button[aria-expanded], button[aria-controls], button[aria-haspopup], [role="tab"], summary')) {
      if (!visibleSiteControl(element) || !safeControl(element) || element.type === "submit") continue;
      const label = controlLabel(element);
      if (label) controls.push({ kind: "toggle", element, label });
    }
    const counts = new Map();
    return controls.slice(0, 80).map(control => {
      const base = `${control.kind}:${controlWords(control.label).slice(0, 70)}`;
      const ordinal = counts.get(base) || 0;
      counts.set(base, ordinal + 1);
      return { ...control, id: `${base}:${ordinal}` };
    });
  }
  async function reportCapabilityOutcome(result = null) {
    await settingsReady;
    if (!cfg.apiBase || !cfg.businessId || (!widgetOptions.siteControls && !result)) return;
    const controls = widgetOptions.siteControls ? discoverSiteControls().slice(0, 24).map(control => ({ id: control.id, kind: control.kind, label: control.label, options: control.options?.slice(0, 12) || [] })) : [];
    try {
      await fetch(`${cfg.apiBase}/api/rose-site-capabilities`, {
        method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
        body: JSON.stringify({ businessId: cfg.businessId, pageUrl: location.href, controls, result }),
      });
    } catch { /* Capability memory should not interrupt the visitor. */ }
  }
  function siteControlIntent(message) {
    const search = /\b(?:search (?:this |the )?(?:site|website) for|look up on (?:this |the )?(?:site|website))\s+(.+)/i.exec(message);
    if (search) return { kind: "search", target: search[1].trim() };
    if (/\b(?:filter by|sort by|set (?:the )?\w+ to|choose (?:the )?\w+|select (?:the )?\w+|show (?:the )?(?:filters?|menu|reviews?|details?)|open (?:the )?(?:filters?|menu|reviews?|details?)|close (?:the )?(?:filters?|menu|reviews?|details?))\b/i.test(message)) return { kind: "control", target: message };
    return null;
  }
  function siteControlCandidates(intent, controls) {
    const target = controlWords(intent.target);
    if (intent.kind === "search") return controls.filter(control => control.kind === "search").map(control => ({ control, score: 1 }));
    const words = target.split(" ").filter(word => word.length > 2 && !["choose", "select", "filter", "sort", "show", "open", "close", "set", "the", "to", "by", "for", "please", "option", "options"].includes(word));
    const matchCount = label => { const tokens = controlWords(label).split(" "); return words.filter(word => tokens.includes(word)).length; };
    return controls.flatMap(control => {
      if (control.kind === "search") return [];
      const label = controlWords(control.label);
      if (control.kind === "toggle") {
        if (!/\b(?:show|open|close|hide)\b/i.test(intent.target)) return [];
        const score = matchCount(label);
        return score ? [{ control, score }] : [];
      }
      if (control.kind === "choice") {
        const score = matchCount(label);
        return score ? [{ control, score }] : [];
      }
      const matches = [...control.element.options].filter(option => !option.disabled && option.value).map(option => ({ option, label: controlWords(option.textContent) }));
      const optionPhrase = target.replace(/^(?:sort|filter) by |^(?:choose|select) |^set (?:the )?\w+ to /, "");
      const ranked = matches.map(match => ({ ...match, score: matchCount(match.label) + (optionPhrase.length > 2 && match.label === optionPhrase ? 5 : 0) })).sort((a, b) => b.score - a.score);
      if (!ranked[0]?.score || ranked[0].score === (ranked[1]?.score || 0)) return [];
      const labelScore = matchCount(label);
      return [{ control, option: ranked[0].option, score: ranked[0].score + labelScore }];
    }).sort((a, b) => b.score - a.score);
  }
  function visibleProductResults() {
    const scope = document.querySelector('main, [role="main"]') || document.body;
    const links = [...scope.querySelectorAll('a[href*="/products/"], a[href*="/product/"], li.product a[href], [data-product-id] a[href], .product-card a[href]')]
      .filter(link => !root.contains(link) && visibleSiteControl(link));
    const products = [];
    const seen = new Set();
    for (const link of links) {
      const url = safePageUrl(link.href);
      if (!url || seen.has(url.pathname)) continue;
      seen.add(url.pathname);
      products.push(url.pathname);
      if (products.length === 40) break;
    }
    return products.length ? products.join("|") : "";
  }
  async function productResultsChanged(before) {
    if (!before) return false;
    for (let attempt = 0; attempt < 12; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const after = visibleProductResults();
      if (after && after !== before) return true;
    }
    return false;
  }
  function changesProductResults(control) {
    const details = `${control.label} ${control.element.name || ""} ${control.element.closest('[class*="filter"], [class*="facet"]')?.className || ""}`;
    return /\b(?:sort|filter|facet|category|brand|price)\b/i.test(details) || control.kind === "choice";
  }
  let pendingSiteControlChoices = [];
  function siteControlOrdinal(message) {
    const match = /\b(first|second|third|fourth|1st|2nd|3rd|4th|#?[1-4])\b/i.exec(message)?.[1]?.toLowerCase();
    return match ? { first: 0, "1st": 0, "1": 0, "#1": 0, second: 1, "2nd": 1, "2": 1, "#2": 1, third: 2, "3rd": 2, "3": 2, "#3": 2, fourth: 3, "4th": 3, "4": 3, "#4": 3 }[match] : null;
  }
  async function handleSiteControlRequest(message, view = "chat") {
    const ordinal = pendingSiteControlChoices.length ? siteControlOrdinal(message) : null;
    const followup = ordinal != null && !/\b(?:product|page|cart|basket)\b/i.test(message);
    const intent = followup ? pendingSiteControlChoices[ordinal]?.intent : siteControlIntent(message);
    if (!intent) return false;
    const respond = text => { addMsg("bot", text); if (view === "voice") $(".wr-note").textContent = text; };
    if (!widgetOptions.siteControls) { respond("Website controls are turned off for this site."); return true; }
    const candidates = followup ? [] : siteControlCandidates(intent, discoverSiteControls());
    const best = followup ? pendingSiteControlChoices[ordinal]?.candidate : candidates[0];
    if (!best) {
      if (/\b(?:choose|select)\b/i.test(message) && !/\b(?:filter|sort|size|color|colour|option)\b/i.test(message)) return false;
      respond("I couldn't find that control on this page. Try opening the relevant page first.");
      return true;
    }
    if (candidates[1] && candidates[1].score === best.score) {
      pendingSiteControlChoices = candidates.filter(item => item.score === best.score).slice(0, 4).map(candidate => ({ candidate, intent }));
      respond(`I found more than one match: ${pendingSiteControlChoices.map((item, index) => `${index + 1}. ${item.candidate.control.label}`).join(", ")}. Say first, second, or name the control.`);
      return true;
    }
    pendingSiteControlChoices = [];
    const { control, option } = best;
    const element = control.element;
    const record = (status, reason = "") => { reportCapabilityOutcome({ id: control.id, kind: control.kind, label: control.label, status, reason }); };
    if (!visibleSiteControl(element) || !safeControl(element)) { respond("That control is no longer available on this page."); record("failed", "Control became unavailable or unsafe to use."); return true; }
    if (control.kind === "search") {
      const form = element.form || element.closest("form");
      const action = form && new URL(form.action || location.href, location.href);
      if (!form || !action || action.origin !== location.origin || form.method.toLowerCase() !== "get" || form.querySelector('input[type="password"], input[type="email"], input[type="tel"]')) { respond("I couldn't use this site's search form."); return true; }
      element.value = intent.target.slice(0, 120);
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      respond(`Searching the site for ${intent.target.slice(0, 80)}.`);
      record("submitted");
      form.requestSubmit();
      return true;
    }
    if (control.kind === "select" && option) {
      const checksResults = changesProductResults(control);
      const beforeResults = checksResults ? visibleProductResults() : "";
      element.value = option.value;
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      const resultsChanged = checksResults && await productResultsChanged(beforeResults);
      const selected = element.value === option.value;
      const status = !selected ? "failed" : checksResults && !resultsChanged ? "ambiguous" : "verified";
      respond(!selected ? "The site did not keep that selection." : status === "ambiguous" ? `Selected ${option.textContent.trim()}, but I couldn't confirm that the product results changed.` : `Selected ${option.textContent.trim()} for ${control.label}.`);
      record(status, status === "ambiguous" ? "The control changed, but product results could not be confirmed." : selected ? "" : "The site did not keep the selected option.");
      return true;
    }
    if (control.kind === "choice") {
      const beforeResults = visibleProductResults();
      element.checked = true;
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      const resultsChanged = await productResultsChanged(beforeResults);
      const status = !element.checked ? "failed" : !resultsChanged ? "ambiguous" : "verified";
      respond(status === "verified" ? `Filtered products by ${control.label}.` : status === "ambiguous" ? `Selected ${control.label}, but I couldn't confirm that the product results changed.` : "The site did not keep that selection.");
      record(status, status === "ambiguous" ? "The choice changed, but product results could not be confirmed." : element.checked ? "" : "The site did not keep the selected choice.");
      return true;
    }
    if (control.kind === "toggle") {
      const closing = /\b(?:close|hide)\b/i.test(message);
      const expanded = element.getAttribute("aria-expanded");
      if (expanded !== null && (expanded === "true") === !closing) { respond(`${control.label} is already ${closing ? "closed" : "open"}.`); return true; }
      element.click();
      await new Promise(resolve => setTimeout(resolve, 60));
      const state = element.tagName === "SUMMARY" ? element.closest("details")?.open : element.getAttribute("aria-expanded") === "true" || element.getAttribute("aria-selected") === "true";
      const targetId = element.getAttribute("aria-controls");
      const target = targetId && document.getElementById(targetId);
      const targetMatches = !target || (target.getClientRects().length > 0 && getComputedStyle(target).visibility !== "hidden") === !closing;
      const verified = state === !closing && targetMatches;
      respond(verified ? `${control.label} is ${closing ? "closed" : "open"}.` : `I activated ${control.label}, but couldn't confirm the page changed.`);
      record(verified ? "verified" : "failed", verified ? "" : "The page did not confirm the menu or detail state changed.");
      return true;
    }
    return false;
  }
  function shoppingQuery(message) {
    const words = String(message).toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").split(/\s+/);
    const skip = new Set("i im need want looking for find show open go visit take me a an the some best good fit please can you do does have under below less than dollars dollar with to my your something and or in on of that is are what which would like buy get shop shopping product products recommend recommendation add put place cart basket bag into price prices cost costs stock availability available much".split(" "));
    return words.filter(word => word.length > 2 && !skip.has(word) && !/^\d+$/.test(word)).slice(0, 5).join(" ");
  }
  function wantsProducts(message) {
    if (navigationRequested(message) && /\b(?:shipping|delivery|returns?|refunds?|privacy|terms|contact|faq|about|size guide|sizing)\b/i.test(message)) return false;
    if (/\b(?:shipping|delivery|returns?|refunds?|privacy|terms|contact|faq|hours?|warranty|policy)\b/i.test(message) && !/\b(?:find|show|recommend|buy|add|product|item)\b/i.test(message)) return false;
    return /\b(find|show|open|visit|look|search|shop|buy|recommend|product|item|best|fit|need|want|add|put|price|prices|cost|costs|stock|available|availability)\b/i.test(message) || /\bhow much\b/i.test(message);
  }
  function shopRoot() {
    return window.Shopify?.routes?.root || "/";
  }
  function commerceProvider() {
    if (typeof window.RoseCommerce?.searchProducts === "function" && typeof window.RoseCommerce?.addItem === "function") return "custom";
    if (window.Shopify?.routes?.root) return "shopify";
    if (document.body.classList.contains("woocommerce") || document.querySelector("form.cart, .woocommerce, [class*=woocommerce]")) return "woocommerce";
    return "native";
  }
  function productBudget(message) {
    const match = message.match(/(?:under|below|less than|max(?:imum)?|up to)\s*\$?\s*(\d+(?:\.\d{1,2})?)/i);
    return match ? Number(match[1]) : Infinity;
  }
  function normalizeProducts(items, provider, message) {
    return (Array.isArray(items) ? items : []).filter(item => item && typeof item === "object").map(item => {
      const url = safePageUrl(item.url || item.permalink);
      const price = item.price == null || item.price === "" ? NaN : Number(item.price);
      const currency = /^[A-Z]{3}$/.test(String(item.currency || "")) ? item.currency : "USD";
      return url && url.origin === location.origin && item.id != null && item.title && item.available !== false && (Number.isFinite(price) ? price <= productBudget(message) : productBudget(message) === Infinity)
        ? { provider, id: item.id, handle: item.handle, title: String(item.title).slice(0, 120), url: url.href, image: item.image || "", price: Number.isFinite(price) ? price : null, currency, available: typeof item.available === "boolean" ? item.available : null, needsOptions: Boolean(item.needsOptions) }
        : null;
    }).filter(Boolean).slice(0, 4);
  }
  async function findProducts(message) {
    if (!cfg.shopping || !wantsProducts(message)) return [];
    const query = shoppingQuery(message);
    const provider = commerceProvider();
    if (provider === "native") return findNativeProduct(message);
    if (!query) return [];
    if (provider === "custom") return normalizeProducts(await window.RoseCommerce.searchProducts(query), provider, message);
    if (provider === "woocommerce") {
      const url = new URL("/wp-json/wc/store/v1/products", location.origin);
      url.searchParams.set("search", query);
      url.searchParams.set("per_page", "6");
      const response = await fetch(url, { credentials: "same-origin" });
      if (!response.ok) throw new Error("Product search unavailable");
      const items = await response.json();
      return normalizeProducts(items.map(item => ({
        id: item.id, title: item.name, url: item.permalink, image: item.images?.[0]?.src,
        price: Number(item.prices?.price) / 10 ** Number(item.prices?.currency_minor_unit || 0),
        currency: item.prices?.currency_code, available: item.is_in_stock && item.is_purchasable,
        needsOptions: item.type !== "simple" || item.has_options,
      })), provider, message);
    }
    return findShopifyProducts(message);
  }
  function findNativeProduct(message) {
    const form = nativeProductForm();
    if (!form) return [];
    const title = document.querySelector('h1.product_title, [itemprop="name"], main h1, h1')?.textContent?.trim();
    if (!title) return [];
    const query = shoppingQuery(message).toLowerCase();
    if (query && !query.split(" ").some(word => title.toLowerCase().includes(word)) && !/\b(?:this|current)\s+(?:product|item)\b/i.test(message)) return [];
    const priceText = document.querySelector('[itemprop="price"]')?.getAttribute("content") || document.querySelector('.product .price, .product-price')?.textContent || "";
    const price = priceText ? Number(String(priceText).replace(/[^\d.]/g, "")) : NaN;
    return [{ provider: "native", title: title.slice(0, 120), url: location.href, image: "", price: Number.isFinite(price) ? price : null, currency: "USD" }];
  }
  function nativeProductForm() {
    const forms = [...document.querySelectorAll('form.cart, form[action*="/cart/add"], form[action*="add-to-cart"]')].filter(form => !root.contains(form) && form.querySelector('button[type="submit"], input[type="submit"]'));
    return forms.length === 1 ? forms[0] : null;
  }
  async function findShopifyProducts(message) {
    if (!cfg.shopping || !wantsProducts(message)) return [];
    const query = shoppingQuery(message);
    if (!query) return [];
    const url = new URL(shopRoot() + "search/suggest.json", location.origin);
    url.searchParams.set("q", query);
    url.searchParams.set("resources[type]", "product");
    url.searchParams.set("resources[limit]", "6");
    const response = await fetch(url, { credentials: "same-origin" });
    if (!response.ok) throw new Error("Product search unavailable");
    const data = await response.json();
    return (data.resources?.results?.products || []).filter(p => p.available && Number(p.price) <= productBudget(message)).slice(0, 4).map(p => ({
      provider: "shopify", title: String(p.title || "").slice(0, 120), handle: String(p.handle || ""),
      url: new URL(p.url || `/products/${p.handle}`, location.origin).pathname,
      image: p.image || p.featured_image?.url || "", price: Number(p.price), currency: window.Shopify?.currency?.active || "USD", available: p.available === true,
    }));
  }
  function renderProducts(products) {
    if (!products.length) return;
    const list = document.createElement("div");
    list.className = "wr-products";
    for (const product of products) {
      const card = document.createElement("div");
      card.className = "wr-product wr-commerce-card";
      const media = document.createElement("div");
      media.className = "wr-product-media";
      if (product.image) {
        const img = document.createElement("img");
        img.src = product.image;
        img.alt = "";
        img.loading = "lazy";
        img.addEventListener("error", () => {
          img.remove();
          media.innerHTML = '<div class="wr-product-media-fallback" aria-hidden="true"><span>◈</span><small>Product</small></div>';
        }, { once: true });
        media.appendChild(img);
      } else {
        media.innerHTML = '<div class="wr-product-media-fallback" aria-hidden="true"><span>◈</span><small>Product</small></div>';
      }
      card.appendChild(media);
      const info = document.createElement("div");
      info.className = "wr-product-info";
      const title = document.createElement("div");
      title.className = "wr-product-title";
      title.textContent = product.title;
      info.appendChild(title);
      if (Number.isFinite(product.price)) {
        const price = document.createElement("div");
        price.className = "wr-product-price";
        price.textContent = new Intl.NumberFormat(undefined, { style: "currency", currency: product.currency || "USD" }).format(product.price);
        info.appendChild(price);
      }
      const actions = document.createElement("div");
      actions.className = "wr-product-actions";
      const link = document.createElement("a");
      link.href = product.url;
      link.textContent = "View product";
      link.addEventListener("click", event => {
        if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (!widgetOptions.navigation) return;
        event.preventDefault();
        navigateTo(product, root.querySelector('.wr-tab.active')?.dataset.view);
      });
      actions.appendChild(link);
      if (widgetOptions.cartActions) {
        const add = document.createElement("button");
        add.type = "button";
        add.textContent = "Add to cart";
        add.dataset.cartState = "idle";
        add.setAttribute("aria-live", "polite");
        add.addEventListener("click", () => addProduct(product, add));
        actions.appendChild(add);
      }
      card.appendChild(info);
      card.appendChild(actions);
      list.appendChild(card);
    }
    log.appendChild(list);
    log.parentElement.scrollTop = log.parentElement.scrollHeight;
    return list;
  }
  function cartRequested(message) {
    return /\b(?:add|put|place)\b[\s\S]{0,90}\b(?:cart|basket|bag)\b/i.test(message);
  }
  function cartChoice(message, products) {
    if (!products.length) return null;
    const ordinal = /\b(first|second|third|fourth|1st|2nd|3rd|4th|#?[1-4])\b/i.exec(message)?.[1]?.toLowerCase();
    if (ordinal) {
      const index = { first: 0, "1st": 0, "1": 0, "#1": 0, second: 1, "2nd": 1, "2": 1, "#2": 1, third: 2, "3rd": 2, "3": 2, "#3": 2, fourth: 3, "4th": 3, "4": 3, "#4": 3 }[ordinal];
      return products[index] || null;
    }
    const words = shoppingQuery(message).split(" ").filter(word => word.length > 2 && !["this", "that", "one", "item"].includes(word));
    if (words.length) {
      const ranked = products.map(product => ({ product, score: words.filter(word => product.title.toLowerCase().includes(word)).length })).sort((a, b) => b.score - a.score);
      if (ranked[0].score > 0 && ranked[0].score > (ranked[1]?.score || 0)) return ranked[0].product;
      return null;
    }
    return products.length === 1 ? products[0] : null;
  }
  async function handleCartRequest(message, view = "chat") {
    if (!cartRequested(message)) return false;
    if (!cfg.shopping || !widgetOptions.cartActions) {
      addMsg("bot", "Cart actions are turned off for this site.");
      return true;
    }
    let products = lastProducts;
    let product = cartChoice(message, products);
    if (!product) {
      const found = await findProducts(message).catch(() => []);
      if (found.length) {
        products = found;
        lastProducts = found;
        lastNavigationChoices = found;
        renderProducts(found);
        saveSiteSession();
        product = cartChoice(message, found);
      }
    }
    if (!product) {
      const note = products.length > 1 ? "Which product should I add? Say its name or number." : "I could not identify a product to add. Tell me its name first.";
      addMsg("bot", note);
      if (view === "voice") { $(".wr-note").textContent = note; root.querySelector('.wr-tab[data-view="chat"]').textContent = "Chat • choose product"; }
      return true;
    }
    const cards = [...log.querySelectorAll(".wr-product")];
    let button = cards.reverse().find(card => card.querySelector(".wr-product-title")?.textContent === product.title && card.querySelector('a[href]')?.href === new URL(product.url, location.href).href)?.querySelector("button");
    if (!button) button = renderProducts([product])?.querySelector("button");
    if (!button) return true;
    const note = `Adding ${product.title} to the cart…`;
    const statusMessage = addMsg("bot", note);
    if (view === "voice") $(".wr-note").textContent = note;
    await addProduct(product, button);
    const result = button.textContent === "Added ✓" ? `${product.title} was added to the cart.` : button.textContent === "Submitted to store" ? "The store form was submitted. Check the cart to confirm." : button.textContent === "Add selected" ? "Choose the product option in Chat, then add it." : "I could not confirm the cart change. Use the product controls shown in Chat.";
    statusMessage.textContent = result;
    if (view === "voice") $(".wr-note").textContent = result;
    return true;
  }
  let actionInFlight = false;
  function visitorTaskGoal(message) {
    // A published site catalog works with the native corner widget too.
    if ((!cfg.desktopSidePanel && !toolsConfigLocation) || !widgetOptions.navigation) return null;
    const text = String(message || "").trim().replace(/^please\s+/i, "").replace(/^where['’]?s\b/i, "where is");
    if (publishedTools.some(item=>item.enabled !== false && [item.title,...(item.aliases || [])].some(title=>controlWords(title) === controlWords(text)))) return text.slice(0,160);
    const forgotten = /^i (?:forgot|have forgotten|lost) (?:my |the )?(.+?)[?.!]*$/i.exec(text);
    if (forgotten) return `reset ${forgotten[1]}`;
    const match = /^(?:(?:how|where) (?:do|can) i|where (?:are|is)(?: (?:my|the))?|can you (?:help me|show me|find|open)|i (?:need|want|would like) to|i can'?t find|help me|show me|take me to|check|find|open|view|see|track|change|reset|update|manage|get)\s+(.+?)[?.!]*$/i.exec(text);
    if (match?.[1]) return match[1].trim().slice(0, 160);
    const outcome = /^i (?:need|want) (?!to\b)(.+?)[?.!]*$/i.exec(text);
    if (outcome?.[1]) return outcome[1].trim().slice(0, 160);
    const followup = /[.!]\s+(?:where|how) (?:do|can|should) i\s+([^?.!]+)/i.exec(text);
    if (followup && !/\b(?:it|them|that|this)\b/i.test(followup[1])) return followup[1].trim().slice(0, 160);
    if (/^(?:hi|hello|thanks|thank you|yes|no|okay)[.!?]*$/i.test(text)) return null;
    if (/^(?:what|which|who|can i|i(?:'m|'ve| have| found)|someone)\b/i.test(text) || /\b(?:how|where) (?:do|can|should) i\b/i.test(text)) return text.slice(0, 160);
    return null;
  }
  function visitorTaskWords(value, includeHelp = false) {
    const ignored = new Set(["a add an and are ask before can could do does ever experienced expert for found from have here how i if in into is it me my never of on or our own please should someone the their this those to took want what when where which who will with without would you your show find check view see open get go take help need past previous recent pas about site website change reset update manage track status detail affecting other".split(" "), [location.hostname.split(".").slice(-2)[0]]].flat());
    const normalize = word => {
      const aliases = { beginning: "start", begin: "start", started: "start", starting: "start", getting: "start", beginners: "start", beginner: "start", new: "first", create: "write", creating: "write", contribution: "contribute", contributing: "contribute", contributions: "contribute", docs: "document", documentation: "document", documents: "document", writing: "write", wrote: "write", editing: "edit", edited: "edit", edits: "edit", editors: "editor", uploaded: "upload", uploading: "upload", images: "image", photo: "image", photos: "image", picture: "image", pictures: "image", citations: "cite", citation: "cite", citing: "cite", sources: "source", searching: "search", translated: "translate", translating: "translate", translation: "translate", licensing: "license", licenses: "license", reuse: "license", copyright: "license", guidelines: "guideline", rules: "guideline", referencing: "cite", practicing: "sandbox", practice: "sandbox", vandalized: "vandalism", undo: "revert", reverting: "revert", cleanup: "clean", cleaning: "clean", experienced: "expert", assistance: "help", advice: "help", questions: "question", readers: "reader", recording: "trace", recordings: "trace", gpx: "trace", gps: "trace", pages: "article", page: "article" };
      return aliases[word] || (word.length > 4 && word.endsWith("s") && !/(?:ss|us)$/.test(word) ? word.slice(0, -1) : word);
    };
    return [...new Set(controlWords(value).split(" ").map(normalize).filter(word => word.length > 2 && (!ignored.has(word) || (includeHelp && word === "help"))))];
  }
  function visitorTaskLinks(doc = document, base = location.href) {
    const links = new Map();
    for (const anchor of doc.querySelectorAll("main a[href], article a[href], [role='main'] a[href], #mw-content-text a[href]")) {
      if (doc === document && (root.contains(anchor) || !visibleSiteControl(anchor))) continue;
      let url;
      try { url = toolUrl(new URL(anchor.getAttribute("href"), base).href); } catch { continue; }
      if (!url || url.href === location.href || url.searchParams.has("action") || url.searchParams.has("veaction") || url.searchParams.has("oldid") || /\.(?:txt|pdf|xml|json|csv|jpe?g|png|gif|svg|webp|zip)$/i.test(url.pathname) || (doc !== document && /\/wiki\/(?:[a-z]{2,3}|[A-Z]{2}|[A-Z][a-z]):/.test(url.pathname))) continue;
      const title = (anchor.textContent || controlLabel(anchor)).replace(/\s+/g, " ").trim().slice(0, 60);
      if (!title) continue;
      const context = (anchor.getAttribute("title") || "") + " " + (anchor.closest("li, p")?.textContent.replace(/\s+/g, " ").trim().slice(0, 180) || "");
      const item = { key: url.href, kind: "link", title, url: url.href, detail: "Page link", context, redirect: anchor.classList.contains("mw-redirect"), inNavigation: !!anchor.closest("nav, header, [role='navigation']"), score: 0 };
      const previous = links.get(url.href);
      if (!previous || title.length > previous.title.length || (title.length === previous.title.length && context.length < previous.context.length)) links.set(url.href, item);
    }
    return [...links.values()];
  }
  async function discoverVisitorTaskLinks(goal, startingLinks) {
    const publicHub = item => {
      const url = toolUrl(item?.url);
      if (!url || url.search || /\/wiki\/(?:[a-z]{2,3}|[A-Z]{2}|[A-Z][a-z]):/.test(url.pathname) || /\.(?:pdf|xml|json|jpe?g|png|svg|zip)$/i.test(url.pathname) || /\b(?:account|profile|security|password|login|sign.?in|member|private|checkout|cart)\b/i.test(url.pathname)) return null;
      if (url.pathname === location.pathname) return null;
      url.hash = "";
      return url;
    };
    const words = visitorTaskWords(goal);
    const hubScore = item => {
      const url = publicHub(item);
      if (!url) return -1;
      const label = item.title + " " + url.pathname;
      const terms = visitorTaskWords(label);
      const overlap = words.filter(word => terms.includes(word)).length;
      return overlap * 5 + (/\b(?:help|guide|using|feature|docs|documentation|issues?|community|writing|learn|start|browse|map)\b|contribut/i.test(label) ? 2 : 0);
    };
    const seen = new Set([location.href]);
    const fetchPage = async item => {
      const url = publicHub(item);
      if (!url || seen.has(url.href)) return [];
      seen.add(url.href);
      try {
        const response = await fetch(url.href, { credentials: "omit", signal: AbortSignal.timeout(2200) });
        if (!response.ok || !/text\/html/i.test(response.headers.get("content-type") || "") || Number(response.headers.get("content-length") || 0) > 1200000 || !toolUrl(response.url)) return [];
        const html = await response.text();
        if (html.length > 1200000) return [];
        return visitorTaskLinks(new DOMParser().parseFromString(html, "text/html"), response.url).slice(0, 350);
      } catch { return []; }
    };
    const uniqueHubs = items => items.filter((item, index, all) => {
      const url = publicHub(item);
      return url && all.findIndex(other => publicHub(other)?.href === url.href) === index;
    });
    const hubs = uniqueHubs(startingLinks).sort((a, b) => hubScore(b) - hubScore(a)).slice(0, 4);
    const first = (await Promise.all(hubs.map(fetchPage))).flat();
    const secondHubs = uniqueHubs(first).filter(item => !seen.has(publicHub(item).href))
      .sort((a, b) => hubScore(b) - hubScore(a)).slice(0, 2);
    const second = (await Promise.all(secondHubs.map(fetchPage))).flat();
    return [...first, ...second].filter((item, index, all) => all.findIndex(other => other.url === item.url) === index);
  }
  async function handleVisitorTaskRequest(message, view = "chat") {
    const goal = visitorTaskGoal(message);
    if (!goal) return false;
    await toolsReady;
    renderToolSuggestions();
    const words = visitorTaskWords(goal);
    if (!words.length) return false;
    const supportRequest = /\b(?:help|support|advice|assistance)\b/i.test(goal);
    const contextGoalWords = supportRequest ? visitorTaskWords(goal, true) : [];
    const configured = cfg.toolsReview ? reviewTools : publishedTools;
    const currentLinks = visitorTaskLinks();
    const candidates = [...configured.filter(item => item.enabled !== false && toolUrl(item.url)), ...currentLinks, ...suggestedTools]
      .filter((item, index, all) => all.findIndex(other => (other.id && other.id === item.id) || (other.url && other.url === item.url && other.target === item.target)) === index);
    const rank = items => items.map(item => {
      const titleWords = visitorTaskWords([item.title,...(item.aliases || [])].join(" "));
      const contextWords = visitorTaskWords(item.context || "");
      const pathWords = visitorTaskWords(item.url ? `${new URL(item.url).pathname} ${new URL(item.url).hash}` : "");
      const titleMatches = words.filter(word => titleWords.includes(word)).length;
      const titleMatchScore = words.reduce((score, word) => score + (titleWords.includes(word) ? word === "article" ? 1 : word === "sandbox" ? 9 : 5 : 0), 0);
      const pathMatches = words.filter(word => !titleWords.includes(word) && pathWords.includes(word)).length;
      const contextMatches = words.filter(word => !titleWords.includes(word) && !pathWords.includes(word) && contextWords.includes(word)).length;
      const primaryIntent = words.includes("first") ? "first" : words[0];
      const intentMatch = titleWords.includes(primaryIntent) ? 8 : pathWords.includes(primaryIntent) ? 3 : 0;
      const titlePhrase = titleWords.join(" ");
      const goalPhrase = words.join(" ");
      const orderedMatch = titleWords.length > 1 && goalPhrase.includes(titlePhrase) ? 4 : 0;
      const isHowToGuide = /^how (?:do|can) i\b/i.test(message) && /(?:help|guide|tutorial)/i.test(new URL(item.url || location.href).pathname) ? 2 : 0;
      const anchorDetour = item.url && new URL(item.url).hash ? -2 : 0;
      const introductoryDetour = /^how (?:do|can) i\b/i.test(message) && /\bintroduction\b/i.test(item.title) ? -3 : 0;
      const knownRedirect = item.redirect ? -8 : 0;
      const mainContent = item.inNavigation === true ? -1 : item.inNavigation === false ? 2 : 0;
      const supportContext = supportRequest ? visitorTaskWords(item.context || "", true) : [];
      const supportMatches = contextGoalWords.filter(word => supportContext.includes(word)).length;
      const contextOnly = !titleMatches && supportMatches >= 2 && supportContext.length <= 15 && supportMatches / contextGoalWords.length >= 0.6;
      return { item, score: titleMatchScore + pathMatches * 2 + contextMatches + intentMatch + (contextOnly ? supportMatches * 3 : 0) + orderedMatch + isHowToGuide + anchorDetour + introductoryDetour + knownRedirect + mainContent + (item.target ? 2 : 0), titleMatches, matched: titleMatches + pathMatches + contextMatches, contextOnly };
    }).filter(match => (match.titleMatches || match.contextOnly) && (match.contextOnly || (match.matched >= (words.length === 1 ? 1 : Math.min(2, words.length)) && match.matched / words.length >= 0.6)))
      .sort((a, b) => b.score - a.score || toolRank(b.item) - toolRank(a.item));
    let ranked = rank(candidates);
    if (!ranked.length && (host?.mapping || cfg.apiBase && cfg.businessId)) {
      const status = addMsg("bot", "Looking through this site's map…");
      let mapped = [];
      try {
        const result = await api("/api/rose-site-navigation", {
          query: message, businessId: cfg.businessId, pageUrl: location.origin + location.pathname
        });
        if (host?.mapping && !result.pages?.length && result.job?.status === 'running') {
          status.textContent = 'Rose is still mapping this site. Try again shortly; you can already ask about visible controls and products on this page.';
          return true;
        }
        mapped = (result.pages || []).filter(item => safePageUrl(item.url) && item.title)
          .map(item => ({ ...item, kind: "mapped-page", goal: message })).slice(0, 3);
      } catch {}
      status.closest(".wr-row")?.remove();
      if (mapped.length) {
        const first = mapped[0], second = mapped[1];
        const clearMatch = first.autoOpenEligible !== false && first.matchScore >= 12 && first.matchedTerms >= 2 &&
          first.matchedTerms / Math.max(1, first.queryTerms) >= 0.5 &&
          (!second || first.matchScore - second.matchScore >= 5);
        if (clearMatch && widgetOptions.autoOpen && visitorAllowsAutoOpen()) {
          launchSuggestedTool(first, view);
        } else {
          addMsg("bot", mapped.length === 1 ? "I found a page that may help:" : "These pages may help. Which one do you want?");
          const actions = document.createElement("div"); actions.className = "wr-chat-recovery";
          for (const item of mapped) {
            const button = document.createElement("button"); button.type = "button"; button.textContent = item.title;
            button.addEventListener("click", () => { actions.remove(); launchSuggestedTool(item, view); });
            actions.append(button);
          }
          log.append(actions);
        }
        return true;
      }
    }
    if (!ranked.length) {
      const status = addMsg("bot", "Checking this site's public help pages…");
      const discovered = await discoverVisitorTaskLinks(goal, currentLinks);
      status?.closest(".wr-row")?.remove();
      ranked = rank([...candidates, ...discovered].filter((item, index, all) =>
        all.findIndex(other => (other.id && other.id === item.id) || (other.url && other.url === item.url && other.target === item.target)) === index));
    }
    if (!ranked.length) return false;
    if (ranked[1] && ranked[0].score === ranked[1].score) {
      addMsg("bot", "I found a few places that could help. Which one do you mean?");
      const actions = document.createElement("div"); actions.className = "wr-chat-recovery";
      for (const { item } of ranked.slice(0, 3)) {
        const button = document.createElement("button"); button.type = "button"; button.textContent = item.title;
        button.addEventListener("click", () => { actions.remove(); launchSuggestedTool(item, view); });
        actions.append(button);
      }
      log.append(actions);
      return true;
    }
    launchSuggestedTool(ranked[0].item, view);
    return true;
  }
  async function executeRequestedAction(message, view = "chat") {
    if (globalThis.__roseSiteGuide) {
      if (/^(?:resume|continue|pause|stop)(?: the)?(?: guide| guidance)?[.!]?$/i.test(String(message).trim()) && (pendingTaskGuide || activeSpotlight)) return {handled:handleTaskGuideRequest(message,view),type:'guide-control'};
      try {
        const result=await globalThis.__roseSiteGuide.resolve(message);
        if(!result)return {handled:false};
        if(result.type==='guide'){launchSuggestedTool(result.tool,view);return {handled:true,type:'site-task'};}
        cancelGuideWork();pendingTaskGuide=null;guideForm?.observer?.disconnect();guideForm=null;clearSpotlight();guideActivity=null;
        log.querySelectorAll('.wr-guide-plan-row,.wr-guide-status,.wr-guide-choices').forEach(el=>el.remove());saveSiteSession();
        if(result.type==='back')document.dispatchEvent(new CustomEvent('atlas:guide-back'));
        if(result.type==='dismiss')document.dispatchEvent(new CustomEvent('atlas:guide-navigation'));
        if(result.type==='end-voice'){const active=voiceBusy;retellClient?.stopCall();result.message=active?'Voice conversation ended.':'No voice call is running.';}
        addMsg('bot',result.message);
        const choices=document.createElement('div');choices.className='wr-chat-recovery';
        for(const tool of result.choices||[]){const button=document.createElement('button');button.type='button';button.textContent=tool.title;button.addEventListener('click',()=>{choices.remove();launchSuggestedTool(tool,view);});choices.append(button);}
        if(choices.childElementCount)log.append(choices);
        return {handled:true,type:result.type};
      }catch(error){addMsg('bot','Atlas shortcuts could not load. Refresh to retry; the sidebar and page controls still work.');return {handled:true,type:'catalog-error'};}
    }
    const actionable = (pendingTaskGuide && /^(?:resume|continue|pause|stop)(?: the)?(?: guide| guidance)?[.!]?$/i.test(String(message).trim())) || guidanceIntent(message) || taskGuideIntent(message) || visitorTaskGoal(message) || cartRequested(message) || siteControlIntent(message) || (pendingSiteControlChoices.length && siteControlOrdinal(message) != null) || priorNavigationChoice(message);
    if (!actionable) return { handled: false };
    if (actionInFlight) {
      addMsg("bot", "I'm finishing the previous action. Please try again in a moment.");
      return { handled: true, type: "busy" };
    }
    actionInFlight = true;
    try {
      if (host?.preferLiveGuidance && (taskGuideIntent(message) && (taskGuideTargets(taskGuideIntent(message)).length || taskGuideRoutes(taskGuideIntent(message), []).length)) && handleTaskGuideRequest(message, view)) return { handled: true, type: 'task-guidance' };
      if (await handleVisitorTaskRequest(message, view)) return { handled: true, type: "site-task" };
      if (handleTaskGuideRequest(message, view)) return { handled: true, type: "task-guidance" };
      if (handleGuidanceRequest(message, view)) return { handled: true, type: "guidance" };
      if (await handleCartRequest(message, view)) return { handled: true, type: "cart" };
      if (await handleSiteControlRequest(message, view)) return { handled: true, type: "control" };
      const prior = priorNavigationChoice(message);
      if (prior && navigateTo(prior, view)) return { handled: true, type: "navigation" };
      return { handled: false };
    } finally { actionInFlight = false; }
  }
  function renderSitePages(pages) {
    if (!widgetOptions.navigation) return;
    const valid = (pages || []).filter(page => safePageUrl(page?.url)).slice(0, 4);
    if (!valid.length) return;
    const list = document.createElement("div");
    list.className = "wr-products";
    list.dataset.rosePageResults = "true";
    for (const page of valid) {
      const card = document.createElement("div");
      card.className = "wr-product";
      const info = document.createElement("div");
      info.className = "wr-product-info";
      const title = document.createElement("div");
      title.className = "wr-product-title";
      title.textContent = String(page.title || "Website page").slice(0, 120);
      info.appendChild(title);
      if (page.description) {
        const detail = document.createElement("div");
        detail.className = "wr-product-price";
        detail.textContent = String(page.description).slice(0, 150);
        info.appendChild(detail);
      }
      const actions = document.createElement("div");
      actions.className = "wr-product-actions";
      const link = document.createElement("a");
      link.href = page.url;
      link.textContent = "Open page";
      link.addEventListener("click", event => {
        if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        navigateTo(page, root.querySelector('.wr-tab.active')?.dataset.view);
      });
      actions.appendChild(link);
      info.appendChild(actions);
      card.appendChild(info);
      list.appendChild(card);
    }
    log.appendChild(list);
    log.parentElement.scrollTop = log.parentElement.scrollHeight;
  }
  function showCartLink(button, url) {
    const destination = new URL(url || "/cart", location.origin);
    if (destination.origin !== location.origin) return;
    const existing = button.parentElement.querySelector('[data-rose-cart-link="true"]');
    if (existing) { existing.href = destination.href; return; }
    const cart = document.createElement("a");
    cart.href = destination.href;
    cart.textContent = "View cart";
    cart.dataset.roseCartLink = "true";
    button.parentElement.appendChild(cart);
  }
  function recordCartOutcome(product, status, reason = "") {
    reportCapabilityOutcome({ id: `cart:${product.provider}`, kind: "cart", label: `Add to cart (${product.provider})`, status, reason: String(reason).slice(0, 180) });
  }
  function setCartButtonState(button, state, label) {
    button.dataset.cartState = state;
    button.textContent = label;
    button.setAttribute("aria-busy", state === "loading" ? "true" : "false");
    button.closest(".wr-commerce-card")?.classList.toggle("is-added", state === "added");
  }
  async function addProduct(product, button) {
    await settingsReady;
    if (!widgetOptions.cartActions) return;
    if (product.needsOptions) {
      addMsg("bot", `Choose the options for ${product.title} on its product page, then use the store’s add to cart button.`);
      return;
    }
    if (product.provider === "shopify") return addShopifyProduct(product, button);
    button.disabled = true;
    setCartButtonState(button, "loading", "Adding…");
    try {
      if (product.provider === "woocommerce") {
        const cartUrl = new URL("/wp-json/wc/store/v1/cart", location.origin);
        const before = await fetch(cartUrl, { credentials: "same-origin" });
        if (!before.ok) throw new Error("The store cart is unavailable. Please use the product page.");
        const token = before.headers.get("Cart-Token");
        if (!token) throw new Error("The store did not provide a cart token. Please use the product page.");
        const prior = await before.json();
        const priorQuantity = (prior.items || []).filter(item => Number(item.id) === Number(product.id)).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        const response = await fetch(new URL("/wp-json/wc/store/v1/cart/add-item", location.origin), {
          method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "Cart-Token": token },
          body: JSON.stringify({ id: Number(product.id), quantity: 1 }),
        });
        const cart = await response.json().catch(() => ({}));
        const quantity = (cart.items || []).filter(item => Number(item.id) === Number(product.id)).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        if (!response.ok || quantity < priorQuantity + 1) throw new Error("The store could not confirm this item in the cart. Please check the cart.");
        setCartButtonState(button, "added", "Added ✓");
        const cartLink = document.querySelector('a[href*="/cart/"]:not(.wr-ai a)');
        showCartLink(button, cartLink?.href || "/cart/");
        recordCartOutcome(product, "verified");
      } else if (product.provider === "custom") {
        const priorCart = typeof window.RoseCommerce.getCart === "function" ? await window.RoseCommerce.getCart() : null;
        const priorQuantity = (priorCart?.items || []).filter(item => String(item.id) === String(product.id)).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        const result = await window.RoseCommerce.addItem({ product, quantity: 1 });
        if (!result || result.ok !== true) throw new Error("The store could not confirm this item in the cart.");
        if (typeof window.RoseCommerce.getCart === "function") {
          const cart = await window.RoseCommerce.getCart();
          const quantity = (cart?.items || []).filter(item => String(item.id) === String(product.id)).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
          if (quantity < priorQuantity + 1) throw new Error("The store could not confirm this item in the cart.");
        }
        setCartButtonState(button, "added", "Added ✓");
        if (result.cartUrl) showCartLink(button, result.cartUrl);
        recordCartOutcome(product, "verified");
      } else if (product.provider === "native") {
        const form = nativeProductForm();
        const action = form && new URL(form.action || location.href, location.href);
        const submit = form?.querySelector('button[type="submit"], input[type="submit"]');
        if (!form || new URL(product.url).href !== location.href || !action || action.origin !== location.origin || !submit || submit.disabled) throw new Error("Open this product page to choose options and add the item.");
        if (!form.reportValidity()) throw new Error("Choose the required product options on the page first.");
        const unchosen = [...form.querySelectorAll("select")].some(select => !select.value);
        if (unchosen) throw new Error("Choose the product options on the page first.");
        setCartButtonState(button, "submitted", "Submitted to store");
        form.requestSubmit(submit);
        recordCartOutcome(product, "submitted", "The store form was submitted; cart contents could not be confirmed.");
        addMsg("bot", "I submitted the store’s product form. Check the cart to confirm it was added.");
      }
    } catch (error) {
      button.disabled = false;
      setCartButtonState(button, "idle", "Add to cart");
      recordCartOutcome(product, "failed", error.message);
      addMsg("bot", error.message);
    }
  }
  async function addShopifyProduct(product, button) {
    await settingsReady;
    if (!widgetOptions.cartActions) return;
    button.disabled = true;
    setCartButtonState(button, "loading", "Checking options…");
    try {
      if (!/^[a-z0-9-]+$/.test(product.handle)) throw new Error("Open the product page to choose options.");
      const detail = await fetch(new URL(shopRoot() + `products/${product.handle}.js`, location.origin), { credentials: "same-origin" });
      if (!detail.ok) throw new Error("Open the product page to choose options.");
      const full = await detail.json();
      const variants = (full.variants || []).filter(v => v.available && !v.requires_selling_plan);
      if (!variants.length) throw new Error("This item needs options that must be chosen on its product page.");
      let selected = variants[0];
      if (variants.length > 1) {
        let picker = button.parentElement.querySelector("select");
        if (!picker) {
          picker = document.createElement("select");
          picker.setAttribute("aria-label", `Choose options for ${product.title}`);
          variants.forEach(variant => {
            const option = document.createElement("option");
            option.value = String(variant.id);
            option.textContent = variant.title;
            picker.appendChild(option);
          });
          button.parentElement.insertBefore(picker, button);
          button.disabled = false;
          setCartButtonState(button, "idle", "Add selected");
          return;
        }
        selected = variants.find(variant => String(variant.id) === picker.value);
        if (!selected) throw new Error("Please choose an available option.");
      }
      const cartUrl = new URL(shopRoot() + "cart.js", location.origin);
      const before = await fetch(cartUrl, { credentials: "same-origin" });
      const priorCart = before.ok ? await before.json() : null;
      const priorQuantity = (priorCart?.items || []).filter(item => String(item.id) === String(selected.id)).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      const response = await fetch(new URL(shopRoot() + "cart/add.js", location.origin), {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ id: selected.id, quantity: 1 }] }),
      });
      if (!response.ok) throw new Error("The store could not add that item. Please use the product page.");
      const cartResponse = await fetch(cartUrl, { credentials: "same-origin" });
      const cartState = cartResponse.ok ? await cartResponse.json() : null;
      const quantity = (cartState?.items || []).filter(item => String(item.id) === String(selected.id)).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      if (quantity < priorQuantity + 1) throw new Error("The store could not confirm this item in the cart. Please check the cart.");
      setCartButtonState(button, "added", "Added ✓");
      showCartLink(button, new URL(shopRoot() + "cart", location.origin));
      recordCartOutcome(product, "verified");
    } catch (error) {
      button.disabled = false;
      setCartButtonState(button, "idle", "Add to cart");
      recordCartOutcome(product, "failed", error.message);
      addMsg("bot", error.message);
    }
  }
  function voiceSpeaker(role) {
    return /agent|assistant|bot|rose/i.test(role || "") ? "bot" : "user";
  }
  function clearVoiceTranscriptBubbles() {
    log?.querySelectorAll('[data-voice-transcript="true"]').forEach(el => {
      const row = el.closest('.wr-row');
      if (row) row.remove();
      else el.remove();
    });
  }
  function addVoiceParagraph(speaker, text) {
    const clean = String(text || "").trim();
    if (!clean) return;
    const bubble = addMsg(speaker, clean);
    bubble.dataset.voiceTranscript = "true";
    bubble.closest('.wr-row')?.setAttribute('data-voice-transcript', 'true');
  }
  let lastVoiceShoppingText = "";
  async function handleVoiceRequest(text) {
    await settingsReady;
    const normalized = String(text || "").trim().toLowerCase();
    const wantsNavigation = widgetOptions.voiceNavigation && navigationRequested(normalized);
    if (!normalized || normalized === lastVoiceShoppingText) return;
    if (!globalThis.__roseSiteGuide && (!cfg.shopping || !wantsProducts(normalized)) && !wantsNavigation && !siteControlIntent(normalized) && !taskGuideIntent(normalized) && !visitorTaskGoal(normalized) && !guidanceIntent(normalized) && !(pendingSiteControlChoices.length && siteControlOrdinal(normalized) != null)) return;
    lastVoiceShoppingText = normalized;
    try {
      if ((await executeRequestedAction(text, "voice")).handled) return;
      const products = cfg.shopping ? await findProducts(text).catch(() => []) : [];
      if (products.length) {
        lastProducts = products;
        renderProducts(products);
        saveSiteSession();
      }
      if (wantsNavigation) {
        const result = await api("/api/rose-site-navigation", { query: text, businessId: cfg.businessId, pageUrl: location.href, website: cfg.website || location.origin }).then(data => data.pages || []).catch(() => []);
        const pages = result.filter(page => safePageUrl(page?.url) && !products.some(product => safePageUrl(product.url)?.href === safePageUrl(page.url)?.href)).slice(0, 4);
        const siteChoices = pages.length ? pages : currentPageLinks(text).filter(page => !products.some(product => safePageUrl(product.url)?.href === safePageUrl(page.url)?.href));
        const choices = [...products, ...siteChoices];
        if (siteChoices.length) { lastSitePages = siteChoices; renderSitePages(siteChoices); saveSiteSession(); }
        lastNavigationChoices = choices; saveSiteSession();
        if (widgetOptions.autoOpen && visitorAllowsAutoOpen() && choices.length === 1 && navigateTo(choices[0], "voice")) return;
      } else if (products.length) { lastNavigationChoices = products; saveSiteSession(); }
      if (!products.length && !lastNavigationChoices.length) return;
      const chatTab = root.querySelector('.wr-tab[data-view="chat"]');
      if (chatTab) chatTab.textContent = products.length ? "Chat • products" : "Chat • pages";
    } catch (error) { console.warn("Rose voice navigation unavailable", error); }
  }
  function renderVoiceTranscriptItems(items) {
    const groups = [];
    for (const item of items || []) {
      const text = item?.content || item?.text || item?.transcript || item?.message;
      const clean = String(text || "").trim();
      if (!clean) continue;
      const speaker = voiceSpeaker(item?.role || item?.speaker || item?.source);
      const last = groups[groups.length - 1];
      if (last?.speaker === speaker) last.parts.push(clean);
      else groups.push({ speaker, parts: [clean] });
    }
    clearVoiceTranscriptBubbles();
    groups.forEach(g => addVoiceParagraph(g.speaker, g.parts.join("\n\n")));
    const live = root.querySelector('.wr-live-transcript');
    const lines = live?.querySelector('.wr-live-lines');
    if (lines) {
      lines.replaceChildren();
      for (const group of groups.slice(-2)) {
        const line = document.createElement('div');
        line.className = `wr-live-line ${group.speaker}`;
        line.textContent = `${group.speaker === 'user' ? 'You' : 'Rose'}: ${group.parts.join(' ').slice(0, 240)}`;
        lines.append(line);
      }
      live.classList.toggle('has-lines', groups.length > 0);
    }
    const last = [...groups].reverse().find(group=>group.speaker === "user");
    if (last) handleVoiceRequest(last.parts.join(" "));
  }
  function appendVoiceTranscript(role, text, partial = false) {
    const clean = String(text || "").trim();
    if (!clean || partial) return;
    const speaker = voiceSpeaker(role);
    addVoiceParagraph(speaker, clean);
    if (speaker === "user") handleVoiceRequest(clean);
  }
  function handleTranscriptUpdate(payload) {
    const items = Array.isArray(payload?.transcript) ? payload.transcript
      : Array.isArray(payload?.transcripts) ? payload.transcripts
      : Array.isArray(payload?.conversation) ? payload.conversation
      : Array.isArray(payload) ? payload : null;
    if (items) {
      renderVoiceTranscriptItems(items);
      return;
    }
    const text = payload?.content || payload?.text || payload?.transcript || payload?.message;
    const role = payload?.role || payload?.speaker || payload?.source || payload?.type;
    const key = `${role || ""}:${text || ""}`;
    if (text && handleTranscriptUpdate.lastKey !== key) {
      handleTranscriptUpdate.lastKey = key;
      appendVoiceTranscript(role, text, Boolean(payload?.is_final === false || payload?.final === false));
    }
  }
  async function api(path, body) {
    if (host?.api) return host.api(path, body);
    const r = await fetch(cfg.apiBase + path, { method: "POST", headers: { "Content-Type": "application/json", "bypass-tunnel-reminder": "1" }, body: JSON.stringify(body || {}) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { const error = new Error(data.error || "Request failed"); error.status = r.status; throw error; }
    return data;
  }
  function liveBusinessContext(){const current=globalThis.__atlasDemoContext?.();return current?`Current visible sample workspace state (takes precedence over starting values): ${JSON.stringify(current)}\nAvailable Atlas controls: ${(globalThis.__roseSiteGuide?.capabilities||[]).join("; ")}\n${cfg.businessContext}`:cfg.businessContext;}
  async function ensureChat() {
    if (chatId) return chatId;
    const data = await api("/api/chat/start", { page: `${location.origin}${location.pathname}`, businessId: cfg.businessId, ownerEmail: cfg.ownerEmail, businessName: cfg.businessName, website: cfg.website, businessContext: liveBusinessContext(), services: cfg.services, partnerDelivery: cfg.partnerDelivery });
    chatId = data.chatId;
    saveSiteSession();
    return chatId;
  }
  let pageInspectorReady;
  async function liveProductInventory() {
    if (host?.getInventory) return host.getInventory();
    if (globalThis.__roseInspect) return globalThis.__roseInspect();
    pageInspectorReady ||= new Promise((resolve, reject) => {
      if (!script?.src) { reject(new Error('Page scanner unavailable')); return; }
      const scanner = document.createElement('script');
      scanner.src = new URL('rose-page-inventory-runtime.js', script.src).href;
      scanner.onload = resolve; scanner.onerror = () => reject(new Error('Page scanner unavailable'));
      document.head.append(scanner);
    });
    await pageInspectorReady;
    return globalThis.__roseInspect();
  }
  async function handleCheapestProduct(message) {
    if (!/\b(?:cheapest|lowest[- ]priced?|least expensive)\b/i.test(message)) return false;
    if (/\b(?:shipping|delivery|coupon|total|prime|tomorrow|used|new|under|budget)\b/i.test(message)) {
      addMsg('bot', 'I can compare displayed product prices on this page, but cannot verify that extra price or delivery condition yet. Ask for the cheapest product on this page, optionally with a minimum star rating.'); return true;
    }
    const minimum = message.match(/(?:at least|minimum)\s*(\d(?:\.\d)?)\s*(?:stars?|out of 5)/i) || message.match(/(\d(?:\.\d)?)\s*(?:\+|stars? and (?:up|above))/i);
    if (/\bstars?|rating\b/i.test(message) && !minimum) { addMsg('bot', 'What minimum rating should I use? For example: “cheapest product with at least 4 stars”.'); return true; }
    let inventory;
    try { inventory = await liveProductInventory(); } catch { addMsg('bot', 'The live product scanner is unavailable on this page.'); return true; }
    const requested = message.match(/(?:cheapest|lowest[- ]priced?|least expensive)\s+(.+?)(?=\s+(?:on|with|that|and|for|in)\b|[?.!]|$)/i)?.[1] || '';
    const words = requested.toLowerCase().split(/\W+/).filter(word => word && !['the','a','an','product','products','item','items','one','option','result'].includes(word));
    const offers = inventory.products.filter(item => (!minimum || item.rating !== null && item.rating >= Number(minimum[1])) && words.every(word => item.title.toLowerCase().includes(word)));
    if (!offers.length) { addMsg('bot', 'I could not find readable product prices matching that request on this page. Load the product results and try again.'); return true; }
    if (new Set(offers.map(item => item.currency)).size !== 1) { addMsg('bot', 'These offers use different currencies, so I cannot rank them reliably. Choose one currency on the site and try again.'); return true; }
    offers.sort((a,b) => a.price - b.price);
    const lowest = offers.filter(item => item.price === offers[0].price);
    cancelGuideWork(); pendingTaskGuide = null; guideActivity = null; renderGuideActivity();
    addMsg('bot', `${lowest[0].title} — ${lowest[0].displayPrice}. Lowest displayed price among ${offers.length} readable matching offers on this page${minimum ? ` with at least ${minimum[1]} stars` : ''}.${lowest.length > 1 ? ` ${lowest.length} offers tie at this price.` : ''} Shipping and coupons are not included.${inventory.unreadableProducts ? ` ${inventory.unreadableProducts} product ${inventory.unreadableProducts === 1 ? 'card had' : 'cards had'} no comparable price.` : ''}`);
    const actions = document.createElement('div'); actions.className = 'wr-chat-recovery';
    for (const product of lowest.slice(0, 5)) {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = `Open ${product.title}`;
      button.addEventListener('click', () => navigateTo(product)); actions.append(button);
    }
    log.append(actions);
    const target = document.querySelector(lowest[0].selector);
    if (target) showSpotlight(target, lowest[0].title);
    lastNavigationChoices = lowest; saveSiteSession();
    return true;
  }
  async function submitChat(event) {
    await settingsReady;
    const content = input.value.trim();
    if (!content) return;
    input.value = "";
    addMsg("user", content);
    shoppingHistory.push({ role: "user", text: content }); saveSiteSession();
    chatStarters?.replaceChildren();
    if (await handleCheapestProduct(content)) return;
    if (host?.getWorkflows) installedWorkflows = await host.getWorkflows();
    const request = host?.normalizeRequest ? host.normalizeRequest(content) : content;
    if ((await executeRequestedAction(request)).handled) return;
    if (cfg.desktopSidePanel && navigationRequested(content)) {
      const localPages = currentPageLinks(content);
      if (localPages.length) {
        lastSitePages = localPages;
        lastNavigationChoices = localPages;
        saveSiteSession();
        if (widgetOptions.autoOpen && visitorAllowsAutoOpen() && (localPages.length === 1 || localPages[0].score > localPages[1].score)) {
          addMsg("bot", `Opening ${localPages[0].title}…`);
          navigateTo(localPages[0]);
        } else {
          addMsg("bot", "I found these pages. Choose where you want to go.");
          renderSitePages(localPages);
        }
        return;
      }
    }
    if (host?.fallbackReply) {
      const reply = await host.fallbackReply(content, currentPageContext(), !!event?.isTrusted); addMsg('bot', reply);
      shoppingHistory.push({ role: 'bot', text: reply }); saveSiteSession(); return;
    }
    const pending = addMsg("bot", "Looking into that…");
    try {
      let products = [];
      try { products = await findProducts(content); } catch (error) { console.warn("Rose product search unavailable", error); }
      const messageBody = { content, businessId: cfg.businessId, ownerEmail: cfg.ownerEmail, businessName: cfg.businessName, website: cfg.website, businessContext: liveBusinessContext(), services: cfg.services, pageContext: currentPageContext(), shoppingProducts: products };
      let id = await ensureChat();
      let data;
      try { data = await api("/api/chat/message", { ...messageBody, chatId: id }); }
      catch (error) {
        if (error.status !== 404) throw error;
        chatId = null; saveSiteSession();
        id = await ensureChat();
        data = await api("/api/chat/message", { ...messageBody, chatId: id });
      }
      pending.textContent = data.reply || "I can help with that.";
      shoppingHistory.push({ role: "bot", text: pending.textContent }); saveSiteSession();
      renderProducts(products);
      lastProducts = products; saveSiteSession();
      const mappedPages = (data.sitePages || []).filter(page => safePageUrl(page?.url) && !products.some(product => page.url.includes(product.url))).slice(0, 4);
      const sitePages = mappedPages.length || !navigationRequested(content) ? mappedPages : currentPageLinks(content).filter(page => !products.some(product => safePageUrl(product.url)?.href === safePageUrl(page.url)?.href));
      renderSitePages(sitePages);
      lastSitePages = sitePages; saveSiteSession();
      lastNavigationChoices = [...products, ...sitePages]; saveSiteSession();
      if (navigationRequested(content)) {
        const choices = lastNavigationChoices;
        if (widgetOptions.autoOpen && visitorAllowsAutoOpen() && choices.length === 1) navigateTo(choices[0]);
        else if (choices.length > 1 && !data.reply) pending.textContent = "I found a few matching pages. Choose one below, or say ‘open the second one’.";
      }
    } catch (e) {
      chatId = null; saveSiteSession();
      const links = navigationRequested(content) ? currentPageLinks(content) : [];
      if (links.length) {
        lastSitePages = links; saveSiteSession();
        lastNavigationChoices = links; saveSiteSession();
        pending.textContent = links.length === 1 ? "I found that page and am opening it." : "I found these pages. Choose one below.";
        renderSitePages(links);
        if (links.length === 1) navigateTo(links[0]);
      } else {
        const alternatives = (cfg.desktopSidePanel || toolsConfigLocation) ? publishedTools.filter(item => item.enabled !== false && toolUrl(item.url)).sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)).slice(0, 3) : [];
        if (alternatives.length) {
          pending.textContent = "I can't answer that right now. I can still guide you to:";
          const actions = document.createElement("div"); actions.className = "wr-chat-recovery";
          for (const item of alternatives) {
            const button = document.createElement("button"); button.type = "button"; button.textContent = item.title;
            button.addEventListener("click", () => launchSuggestedTool(item)); actions.append(button);
          }
          pending.closest(".wr-row")?.after(actions);
        } else showContactFallback(pending, "Rose is temporarily unavailable.");
      }
      console.error(e);
    }
  }

  $(".wr-send").addEventListener("click", submitChat);
  input.addEventListener("keydown", e => { if (e.key === "Enter") submitChat(e); });
  $(".wr-start-voice").addEventListener("click", async () => {
    const status = $(".wr-status"), note = $(".wr-note"), orb = $(".wr-orb"), startBtn = $(".wr-start-voice"), endBtn = $(".wr-end-voice");
    if (voiceBusy) return;
    voiceBusy = true;
    root.querySelector('.wr-live-lines')?.replaceChildren();
    root.querySelector('.wr-live-transcript')?.classList.remove('has-lines');
    startBtn.disabled = true;
    try { retellClient?.stopCall(); } catch {}
    try {
      status.textContent = "Connecting…";
      const [{ RetellClient }, { RoseV3VoiceClient }, call] = await Promise.all([
        import("https://esm.sh/retell-client-js-sdk@3.0.4"),
        import(`${String(cfg.apiBase || "").replace(/\/+$/, "")}/api/voice/start?module=voice`),
        api("/api/voice/start", { page: `${location.origin}${location.pathname}`, pageContext: currentPageContext(), businessId: cfg.businessId, ownerEmail: cfg.ownerEmail, businessName: cfg.businessName, website: cfg.website, businessContext: liveBusinessContext(), services: cfg.services, partnerDelivery: cfg.partnerDelivery })
      ]);
      retellClient = new RoseV3VoiceClient(RetellClient, cfg.apiBase);
      let speechReleaseTimer = null;
      const SPEECH_RELEASE_DELAY = 1150;
      const clearSpeechRelease = () => {
        if (speechReleaseTimer) clearTimeout(speechReleaseTimer);
        speechReleaseTimer = null;
      };
      const setRoseSpeaking = () => {
        clearSpeechRelease();
        panel.classList.add("speaking");
        status.textContent = "Rose is speaking";
        orb.classList.add("live", "speaking");
        orb.classList.remove("listening");
      };
      const setListening = () => {
        clearSpeechRelease();
        panel.classList.remove("speaking");
        status.textContent = "Listening";
        orb.classList.add("live", "listening");
        orb.classList.remove("speaking");
      };
      const easeBackToListening = () => {
        clearSpeechRelease();
        speechReleaseTimer = setTimeout(setListening, SPEECH_RELEASE_DELAY);
      };
      retellClient.on("call_started", () => { setListening(); note.textContent = "Speak naturally. Interrupt anytime."; startBtn.disabled = false; startBtn.style.display = "none"; endBtn.style.display = "inline-block"; });
      retellClient.on("update", handleTranscriptUpdate);
      retellClient.on("transcript", handleTranscriptUpdate);
      retellClient.on("conversation_updated", handleTranscriptUpdate);
      retellClient.on("agent_start_talking", setRoseSpeaking);
      retellClient.on("agent_stop_talking", easeBackToListening);
      retellClient.on("user_start_talking", setListening);
      retellClient.on("user_stop_talking", () => { clearSpeechRelease(); panel.classList.remove("speaking"); status.textContent = "Thinking"; orb.classList.remove("listening", "speaking"); });
      retellClient.on("transcript_error", () => { note.textContent = "Live transcript is unavailable. Voice is still connected."; });
      retellClient.on("call_ended", () => { voiceBusy = false; startBtn.disabled = false; clearSpeechRelease(); panel.classList.remove("speaking"); status.textContent = "Call ended"; note.textContent = "Start another conversation anytime."; orb.classList.remove("live", "listening", "speaking"); startBtn.style.display = "inline-block"; endBtn.style.display = "none"; });
      retellClient.on("error", err => { voiceBusy = false; startBtn.disabled = false; clearSpeechRelease(); panel.classList.remove("speaking"); console.error(err); status.textContent = "Voice connection failed"; note.textContent = "Voice couldn’t connect. Check microphone access, try again, or switch to Chat."; orb.classList.remove("live", "listening", "speaking"); startBtn.style.display = "inline-block"; endBtn.style.display = "none"; });
      await retellClient.startCall({ accessToken: call.accessToken, callId: call.callId, transport: call.transport, iceServers: call.ice_servers, monitorToken: call.monitorToken });
    } catch (err) {
      voiceBusy = false;
      startBtn.disabled = false;
      console.error(err);
      status.textContent = /NotAllowedError|PermissionDeniedError/.test(err?.name || '') ? "Microphone access needed" : "Voice unavailable";
      note.textContent = /NotAllowedError|PermissionDeniedError/.test(err?.name || '') ? "Allow microphone access in your browser, or switch to Chat for the same Atlas guidance." : "Voice couldn’t connect. Try again, or switch to Chat.";
      startBtn.style.display = "inline-block";
      endBtn.style.display = "none";
    }
  });
  $(".wr-end-voice").addEventListener("click", () => { try { retellClient?.stopCall(); } catch {} voiceBusy = false; $(".wr-start-voice").disabled = false; });
  if (host) { host.controller.open(); host.onReady?.(); }
  const observePageCapabilities = () => { if (discoverSiteControls().length) reportCapabilityOutcome(); };
  if (document.readyState === "complete") observePageCapabilities();
  else window.addEventListener("load", observePageCapabilities, { once: true });
})();
