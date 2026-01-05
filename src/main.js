import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import { useAuth } from "./composables/useAuth";
import { deferNonCriticalWork } from "./utils/performance";

const app = createApp(App).use(router);

// Initialize authentication (critical - do immediately)
const { init } = useAuth();
init();

// Setup service worker message handler for background sync (defer)
deferNonCriticalWork(() => {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.addEventListener("message", (event) => {
			if (event.data && event.data.type === "get-auth-token") {
				const token =
					localStorage.getItem("token") || localStorage.getItem("adminToken");
				if (event.ports && event.ports[0]) {
					event.ports[0].postMessage({ token });
				}
			} else if (event.data && event.data.type === "get-api-base") {
				const apiBase =
					import.meta.env.VITE_API_URL?.replace("/api", "") || "/api";
				if (event.ports && event.ports[0]) {
					event.ports[0].postMessage({ apiBase });
				}
			}
		});
	}
});

app.mount("#app");

// Initialize prefetching for critical routes after app is mounted (defer)
deferNonCriticalWork(() => {
	import("./composables/usePrefetch.js").then(({ usePrefetch }) => {
		// Store router on window for access outside component context
		window.__VUE_ROUTER__ = router;
		const { init } = usePrefetch(router);
		init();
	});
});
