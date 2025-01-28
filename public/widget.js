(function() {
    if (typeof window === 'undefined') return;

    // Inject CSS styles
    const styles = `
        [data-widget="wait-time"] {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: fit-content;
            min-height: 35px;
            min-width: 100px;
        }
        [data-widget="wait-time"][data-has-time="true"] {
            color: #000000;
            font-size: 16px;
            padding: 5px 20px;
            background-color: #FFFFFF;
            border: 1px solid #000000;
            border-radius: 30px;
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        function init() {
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
                url: 'https://bb-ui.dev.sg.salondev.net/api/v1/Widget/Waittime/External',
                method: 'GET',
                mode: 'cors'
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

            async function fetchWaitTime(token) {
                try {
                    const headers = {
                        'Accept': 'application/json',
                        'X-BookedBy-Widget-Context': token
                    };

                    const response = await fetch(API_CONFIG.url, {
                        method: API_CONFIG.method,
                        headers: headers
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        const error = new Error('Failed to fetch wait time');
                        error.response = data;
                        throw error;
                    }

                    return {
                        waitTime: data.response?.waitTime
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
                        return;
                    }

                    const data = await fetchWaitTime(token);
                    element.setAttribute('data-has-time', 'true');
                    if (data.waitTime) {
                        element.textContent = `${formatWaitTime(data.waitTime)} wait`;
                    } else {
                        element.textContent = 'Closed';
                    }
                } catch (error) {
                    element.removeAttribute('data-has-time');
                    
                    if (error?.response?.userMessage) {
                        console.error('Failed to update widget:', error.response.userMessage);
                    } else {
                        console.error('Failed to update widget:', error);
                    }

                    const state = widgetStates.get(element);
                    if (state && attempt < retryAttempts) {
                        const delay = retryDelay(attempt);
                        console.log(`Retrying in ${delay}ms (attempt ${attempt + 1}/${retryAttempts})`);
                        state.retryTimeout = setTimeout(() => {
                            updateWidget(element, attempt + 1);
                        }, delay);
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
