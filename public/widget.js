(function() {
    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        function init() {
            console.log('DOM ready');
            const widgetData = document.getElementById('widget-data');
            const targetElement = document.getElementById('wait-time-widget');
            
            if (!widgetData || !targetElement) {
                console.error('Required elements not found:', { widgetData, targetElement });
                return;
            }

            console.log('Widget initialization started');

            const config = {
                token: widgetData.dataset.token,
                elementId: targetElement.id
            };
            
            if (!config.token || !config.elementId) {
                console.error('Widget configuration is missing required data attributes');
                return;
            }

            const pollingInterval = 5000;
            const retryAttempts = 3;
            const retryDelay = 5000;

            let pollInterval;
            let retryCount = 0;
            let initializeTimeout;
            let pendingFetch = null;

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
                url: 'https://bb-ui.dev.sg.salondev.net/api/v1/Checkin/Waittime/Stores',
                method: 'POST',
                mode: 'cors'
            };

            const MOCK_DATA = {
                enabled: true,
                waitTimes: [5, 10, 15, 20, 25, 30],
                currentIndex: 0
            };

            function cleanup() {
                if (pollInterval) {
                    clearInterval(pollInterval);
                    pollInterval = null;
                }

                if (initializeTimeout) {
                    clearTimeout(initializeTimeout);
                    initializeTimeout = null;
                }

                if (pendingFetch) {
                    pendingFetch = null;
                }

                // Remove both event listeners
                window.removeEventListener('unload', cleanup);
                window.removeEventListener('beforeunload', cleanup);
                console.log('Widget cleanup completed');
            }

            async function fetchWaitTime() {
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

                    const payload = {
                        services: [],
                        storeUidList: [
                            "5012f7ba-a79b-4ce1-a84d-37236904bcc3",
                            "764d9f16-11ea-4c3c-9478-8949701b5033"
                        ]
                    };

                    const headers = {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json;charset=UTF-8',
                        'x-bookedby-context': config.token,
                        'Origin': 'https://bb-ui.dev.sg.salondev.net'
                    };

                    const response = await fetch(API_CONFIG.url, {
                        method: API_CONFIG.method,
                        headers: headers,
                        credentials: 'include',
                        mode: 'cors',
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        console.error('Response status:', response.status);
                        console.error('Response headers:', Object.fromEntries(response.headers));
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    const waitTimeValue = data.waitTime;

                    return {
                        waitTime: `${waitTimeValue} minutes`,
                        timestamp: new Date().toISOString()
                    };
                } catch (error) {
                    console.error('API Error:', error);
                    console.error('Error details:', {
                        message: error.message,
                        stack: error.stack,
                        type: error.name
                    });

                    if (retryCount < retryAttempts) {
                        retryCount++;
                        console.log(`Fetch attempt ${retryCount} failed, retrying in ${retryDelay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        return fetchWaitTime();
                    }
                    throw error;
                }
            }

            async function updateWidget(targetElement) {
                try {
                    if (!document.getElementById(config.elementId)) {
                        cleanup();
                        return;
                    }

                    const data = await fetchWaitTime();
                    retryCount = 0;

                    Object.assign(targetElement.style, WIDGET_CONFIG.styles.success);
                    targetElement.textContent = `Wait ${data.waitTime}`;
                    console.log('Widget data updated:', data);
                } catch (error) {
                    console.error('Failed to update widget:', error);
                }
            }

            function initializeWidget() {
                const targetElement = document.getElementById(config.elementId);
                if (!targetElement) {
                    console.log(`Target element with id '${config.elementId}' not found, retrying in ${pollingInterval}ms...`);
                    initializeTimeout = setTimeout(initializeWidget, pollingInterval);
                    return;
                }

                updateWidget(targetElement);

                pollInterval = setInterval(() => {
                    updateWidget(targetElement);
                }, pollingInterval);

                console.log('Wait Time widget polling started with token:', config.token);
            }

            initializeWidget();
            
            // Add cleanup on page unload with proper reference
            window.addEventListener('unload', cleanup);
            
            // Also clean up on beforeunload for better browser compatibility
            window.addEventListener('beforeunload', cleanup);
        }

        init();
    });
})();
