(function() {
    if (typeof window === 'undefined') return;

    // Load Luxon Duration and DateTime
    let Duration, DateTime;
    const luxonLoaded = (async function loadLuxon() {
        try {
            const { Duration: LuxonDuration, DateTime: LuxonDateTime } = await import('https://cdn.skypack.dev/luxon?dts');
            Duration = LuxonDuration;
            DateTime = LuxonDateTime;
            return true;
        } catch (error) {
            console.error('Failed to load Luxon:', error);
            return false;
        }
    })();

    // Inject CSS styles
    const styles = `
        [data-widget="wait-time"] {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 35px;
            width: 120px;
            text-decoration: none;
        }
        [data-widget="wait-time"][data-has-time="true"] {
            color: #000000;
            font-size: 16px;
            background-color: #FFFFFF;
            border: 1px solid #000000;
            border-radius: 30px;
            transition: all 0.2s ease;
        }
        [data-widget="wait-time"][data-has-time="true"][data-clickable="true"] {
            cursor: pointer;
        }
        [data-widget="wait-time"][data-has-time="true"][data-clickable="true"]:hover {
            background-color: #f5f5f5;
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
        // Wait for Luxon to load before initializing
        await luxonLoaded;
        
        function init() {
            console.log('Widget init', {Duration, DateTime});
            const widgets = document.querySelectorAll('[data-widget="wait-time"]');
            
            if (!widgets.length) {
                console.error('No wait time widgets found');
                return;
            }

            const pollingInterval = 60000;
            const retryAttempts = 3;
            const baseDelay = 5000;
            const retryDelay = (attempt) => Math.min(baseDelay * 2 ** (attempt - 1), 30000);
            
            // Track intervals and timeouts for each widget
            const widgetStates = new Map();

            const API_CONFIG = {
                waitTime: {
                    url: 'https://bb-ui.dev.sg.salondev.net/api/v1/Widget/External/Waittime',
                    method: 'GET',
                    mode: 'cors'
                },
                storeLink: {
                    url: 'https://bb-ui.dev.sg.salondev.net/api/v1/Widget/External/StoreLink',
                    method: 'GET',
                    mode: 'cors'
                }
            };

            function cleanup() {
                for (const [, state] of widgetStates) {
                    if (state.pollInterval) {
                        clearInterval(state.pollInterval);
                    }
                    if (state.retryTimeout) {
                        clearTimeout(state.retryTimeout);
                    }
                }
                widgetStates.clear();
                window.removeEventListener('unload', cleanup);
                window.removeEventListener('beforeunload', cleanup);
            }

            function formatWaitTime(timeString) {
                if (!timeString) return '';
                const [hours, minutes] = timeString.split(':').map(Number);
                const totalMinutes = hours * 60 + minutes;

                if (hours > 0) {
                    return `${hours}h ${minutes > 0 ? minutes + 'min' : ''}`;
                }
                return `${totalMinutes} min`;
            }

            async function fetchStoreLink(token) {
                try {
                    const headers = {
                        'Accept': 'application/json',
                        'X-BookedBy-Widget-Context': token
                    };

                    const response = await fetch(API_CONFIG.storeLink.url, {
                        method: API_CONFIG.storeLink.method,
                        headers: headers
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    return {
                        storeLink: data.response
                    };
                } catch (error) {
                    throw error;
                }
            }

            async function fetchWaitTime(token) {
                // // Mock response
                // return new Promise((resolve) => {
                //     setTimeout(() => {
                //         resolve({
                //             waitTime: "00:00:04"
                //         });
                //     }, 100);
                // });
                
                try {
                    const headers = {
                        'Accept': 'application/json',
                        'X-BookedBy-Widget-Context': token
                    };

                    const response = await fetch(API_CONFIG.waitTime.url, {
                        method: API_CONFIG.waitTime.method,
                        headers: headers
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    return {
                        waitTime: data.response?.waitTime?.waitTime
                    };
                } catch (error) {
                    throw error;
                }
            }

            async function fetchWidgetData(token) {
                try {
                    const waitTimeData = await fetchWaitTime(token);
                    
                    let storeLink = null;
                    try {
                        const storeLinkData = await fetchStoreLink(token);
                        storeLink = storeLinkData.storeLink;
                    } catch (error) {
                        console.error('Failed to fetch store link:', error);
                    }

                    return {
                        waitTime: waitTimeData.waitTime,
                        storeLink: storeLink
                    };
                } catch (error) {
                    throw error;
                }
            }

            async function updateWidget(element, attempt = 1) {
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

                    const token = element.getAttribute('data-token');
                    if (!token) {
                        console.error('Widget token not found');
                        element.removeAttribute('data-has-time');
                        element.removeAttribute('data-clickable');
                        return;
                    }

                    const data = await fetchWidgetData(token);
                    
                    if (data.waitTime) {
                        element.setAttribute('data-has-time', 'true');
                        element.textContent = `${formatWaitTime(data.waitTime)} wait`;
                        
                        if (data.storeLink) {
                            element.setAttribute('data-clickable', 'true');
                            element.href = data.storeLink;
                        } else {
                            element.removeAttribute('data-clickable');
                            element.removeAttribute('href');
                        }
                    } else {
                        element.removeAttribute('data-clickable');
                        element.removeAttribute('href');
                        element.textContent = 'Closed';
                    }
                } catch (error) {
                    element.removeAttribute('data-has-time');
                    element.removeAttribute('data-clickable');
                    element.removeAttribute('href');
                    element.textContent = '';
                    
                    if (error?.response?.userMessage) {
                        console.error('Failed to update widget:', error.response.userMessage);
                    }

                    const state = widgetStates.get(element);
                    if (state && attempt < retryAttempts) {
                        const delay = retryDelay(attempt);
                        console.log(`Retrying in ${delay}ms (attempt ${attempt + 1}/${retryAttempts})`);
                        state.retryTimeout = setTimeout(() => {
                            updateWidget(element, attempt + 1);
                        }, delay);
                    } else if (state?.pollInterval) {
                        clearInterval(state.pollInterval);
                    }
                }
            }

            function initializeWidget(element) {
                const token = element.getAttribute('data-token');
                if (!token) {
                    console.error('Widget token not found');
                    return;
                }

                const state = {
                    pollInterval: null,
                    retryTimeout: null
                };
                widgetStates.set(element, state);

                updateWidget(element);

                // Set up polling for this widget
                state.pollInterval = setInterval(() => updateWidget(element), pollingInterval);
            }

            widgets.forEach(initializeWidget);

            window.addEventListener('unload', cleanup);
            window.addEventListener('beforeunload', cleanup);
        }

        init();
    });
})();
