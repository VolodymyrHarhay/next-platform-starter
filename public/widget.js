(function() {
    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        function init() {
            console.log('DOM ready');
            const widgets = document.getElementsByClassName('waitTimeWidget');
            
            if (!widgets.length) {
                console.error('No wait time widgets found');
                return;
            }

            console.log(`Found ${widgets.length} widgets`);

            const pollingInterval = 5000;
            const retryAttempts = 3;
            const retryDelay = 5000;

            // Track intervals and timeouts for each widget
            const widgetStates = new Map();

            const WIDGET_CONFIG = {
                styles: {
                    success: {
                        color: 'green',
                        fontSize: '16px',
                        padding: '20px',
                        backgroundColor: 'lightyellow',
                        border: '2px solid #ccc',
                        borderRadius: '50%',
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        lineHeight: '1.2'
                    }
                }
            };

            const API_CONFIG = {
                url: 'https://bb-ui.dev.sg.salondev.net/api/v1/Widget/Waittime/External',
                method: 'GET',
                mode: 'cors'
            };

            const MOCK_DATA = {
                enabled: false,
                waitTimes: [5, 10, 15, 20, 25, 30],
                currentIndex: 0
            };

            function cleanup() {
                // Clean up all widget intervals and timeouts
                for (const [, state] of widgetStates) {
                    if (state.pollInterval) {
                        clearInterval(state.pollInterval);
                    }
                    if (state.retryTimeout) {
                        clearTimeout(state.retryTimeout);
                    }
                }
                widgetStates.clear();

                // Remove event listeners
                window.removeEventListener('unload', cleanup);
                window.removeEventListener('beforeunload', cleanup);
                console.log('All widgets cleaned up');
            }

            async function fetchWaitTime(token) {
                try {
                    if (MOCK_DATA.enabled) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                        const waitTime = MOCK_DATA.waitTimes[MOCK_DATA.currentIndex];
                        MOCK_DATA.currentIndex = (MOCK_DATA.currentIndex + 1) % MOCK_DATA.waitTimes.length;
                        return {
                            waitTime: `${waitTime} minutes`,
                            timestamp: new Date().toISOString()
                        };
                    }

                    const headers = {
                        'Accept': 'application/json',
                        'X-BookedBy-Widget-Context': token
                    };

                    const response = await fetch(API_CONFIG.url, {
                        method: API_CONFIG.method,
                        headers: headers,
                        // credentials: 'include',
                        // mode: 'cors'
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    return {
                        waitTime: data.response.waitTime,
                        timestamp: data.response.waitTimeGeneratedAt
                    };
                } catch (error) {
                    console.error('API Error:', error);
                    throw error;
                }
            }

            async function updateWidget(element, retryCount = 0) {
                try {
                    if (!document.body.contains(element)) {
                        const state = widgetStates.get(element);
                        if (state) {
                            if (state.pollInterval) clearInterval(state.pollInterval);
                            if (state.retryTimeout) clearTimeout(state.retryTimeout);
                            widgetStates.delete(element);
                        }
                        return;
                    }

                    const token = element.dataset.token;
                    if (!token) {
                        console.error('Widget is missing token:', element);
                        return;
                    }

                    const data = await fetchWaitTime(token);
                    Object.assign(element.style, WIDGET_CONFIG.styles.success);
                    element.textContent = `Wait ${data.waitTime}`;
                    console.log('Widget updated:', { token, data });
                } catch (error) {
                    console.error('Failed to update widget:', error);
                    if (retryCount < retryAttempts) {
                        console.log(`Retry ${retryCount + 1}/${retryAttempts} in ${retryDelay}ms...`);
                        const state = widgetStates.get(element);
                        if (state) {
                            // Clear any existing retry timeout
                            if (state.retryTimeout) {
                                clearTimeout(state.retryTimeout);
                            }
                            // Set new retry timeout
                            state.retryTimeout = setTimeout(() => updateWidget(element, retryCount + 1), retryDelay);
                        }
                    }
                }
            }

            function initializeWidget(element) {
                const token = element.dataset.token;
                if (!token) {
                    console.error('Widget is missing token:', element);
                    return;
                }

                // Initialize state for this widget
                const state = {
                    pollInterval: null,
                    retryTimeout: null
                };
                widgetStates.set(element, state);

                // Initial update
                updateWidget(element);

                // Set up polling for this widget
                state.pollInterval = setInterval(() => updateWidget(element), pollingInterval);
                console.log('Widget initialized with token:', token);
            }

            // Initialize all widgets
            Array.from(widgets).forEach(initializeWidget);

            // Set up cleanup
            window.addEventListener('unload', cleanup);
            window.addEventListener('beforeunload', cleanup);
        }

        init();
    });
})();
