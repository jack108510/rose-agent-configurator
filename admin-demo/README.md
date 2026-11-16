# Rose admin demo

A sample SaaS workspace showcasing the existing Rose guided-navigation software. Rose's runtime is copied unchanged from `../rose-guided-demo-site/wildrose-widget-client.js` and calls the existing live Rose chat/voice service. `rose-bridge.js` selects its existing isolated prospect-preview mode to prevent lead delivery. No replacement assistant or scripted chat is used.

The Atlas interface is fictional. Account details, API keys, integration connections, reset requests, invitations and webhook settings use browser-local sample state. No real credentials or customer data are included. User clicks drive the sample workflows; Rose's existing route/next-step attributes highlight each control.

Run `python3 -m http.server 8816 --bind 127.0.0.1 --directory dist` for a local preview.


Live demo: https://jack108510.github.io/rose-agent-configurator/admin-demo/
