(function() {
    if (typeof window === 'undefined') return;

    const styles = `
        [data-widget="wait-time"][data-use-default-styles="true"] {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 35px;
            width: 135px;
            text-decoration: none;
            cursor: default;
        }
        [data-widget="wait-time"][data-use-default-styles="true"][data-has-time="true"] {
            color: #000000;
            font-size: 16px;
            background-color: #FFFFFF;
            border: 1px solid #000000;
            border-radius: 30px;
            transition: all 0.2s ease;
            cursor: default;
        }
        [data-widget="wait-time"][data-use-default-styles="true"][data-has-time="true"][data-clickable="true"] {
            cursor: pointer;
        }
        [data-widget="wait-time"][data-use-default-styles="true"][data-has-time="true"][data-clickable="true"]:hover {
            background-color: #f5f5f5;
        }
    `;

    // Only inject styles if there's at least one widget using default styles
    const widgets = document.querySelectorAll('[data-widget="wait-time"]');
    const hasDefaultStylesWidget = Array.from(widgets).some(widget => 
        widget.getAttribute('data-use-default-styles') !== 'false'
    );

    if (hasDefaultStylesWidget) {
        const styleSheet = document.createElement("style");
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    const OperationModeBitFlag = {
        Checkin: 1,
        Booking: 2
      };

    // helper functions start
    function getOperationModeStatus(operatingMode, bookingGroupOperationMode) {
        const isBookingGroupAllowed = Boolean((bookingGroupOperationMode || 0) & OperationModeBitFlag.Booking);
        const isCheckinGroupAllowed = Boolean((bookingGroupOperationMode || 0) & OperationModeBitFlag.Checkin);
        const isBookingAllowed = Boolean((operatingMode || 0) & OperationModeBitFlag.Booking);
        const isCheckinAllowed = Boolean((operatingMode || 0) & OperationModeBitFlag.Checkin);

        return {
            isCheckinOnly: (!isBookingGroupAllowed || !isBookingAllowed) && isCheckinGroupAllowed && isCheckinAllowed
        };
    }

    function getCurrentDate(timezone = 'America/Los_Angeles') {
        const date = new Date();
        
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        const parts = formatter.formatToParts(date);
        const dateParts = {};
        
        parts.forEach(part => {
            if (part.type !== 'literal') {
                dateParts[part.type] = part.value;
            }
        });
        
        // Return in YYYY-MM-DDT00:00:00 format
        return `${dateParts.year}-${dateParts.month}-${dateParts.day}T00:00:00`;
    }

    function getCurrentTime(timezone = 'America/Los_Angeles') {
        const date = new Date();
        
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const parts = formatter.formatToParts(date);
        const timeParts = {};
        
        parts.forEach(part => {
            if (part.type !== 'literal') {
                timeParts[part.type] = part.value;
            }
        });

        // Ensure hours are always 2 digits
        const hours = timeParts.hour.padStart(2, '0');
        const minutes = timeParts.minute;
        const seconds = timeParts.second;

        return `${hours}:${minutes}:${seconds}`;
    }

    function getCurrentWeekday(timezone = 'America/Los_Angeles') {
        const date = new Date();
        
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
        });

        const utcDate = new Date(formatter.format(date));
        const day = utcDate.getDay();
        return day === 0 ? 7 : day; // Convert Sunday from 0 to 7
    }

    function getCurrentDaySchedule(currentDate, weeklySchedule, scheduleExceptions) {
        const exception = scheduleExceptions?.find(({ date }) => date === currentDate);

        if (exception) {
            return exception;
        }

        const currentWeekday = getCurrentWeekday();
        const regularSchedule = weeklySchedule?.find(schedule => schedule.weekday === currentWeekday);
        return regularSchedule;
    }

    function formatWaitTime(timeString) {
        console.log('Formatting time:', timeString);
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;

        if (hours > 0) {
            return `${hours}h ${minutes > 0 ? minutes + 'min' : ''}`;
        }
        return `${totalMinutes} min`;
    }

    function formatToUSTime(timeString) {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    function getStatusString(scheduleMetadata, intervals, existsAvailableProvider) {
        const { isOpen, closedAtDate, closedAlready, beforeOpen, onBreak } = scheduleMetadata;

        if (closedAtDate || closedAlready) {
            return 'Closed';
        }

        if (beforeOpen) {
            const startTime = formatToUSTime(intervals[0].start);
            return `Opens ${startTime}`;
        }

        if (onBreak) {
            const startTime = formatToUSTime(intervals[1].start);
            return `Opens ${startTime}`;
        }

        if (isOpen && !existsAvailableProvider) {
            return 'Call store';
          }

        return '';
    }

    function getStoreScheduleMetadata(intervals, time) {
        // Convert HH:mm:ss to comparable number (seconds since midnight)
        function timeToSeconds(timeStr) {
            const [hours, minutes, seconds] = timeStr.split(':').map(Number);
            return hours * 3600 + minutes * 60 + seconds;
        }

        const currentTimeSeconds = timeToSeconds(time);
        
        const workingInterval = intervals.find(({ start, end }) => {
            const startSeconds = timeToSeconds(start);
            const endSeconds = timeToSeconds(end);
            return currentTimeSeconds >= startSeconds && currentTimeSeconds <= endSeconds;
        });

        const isOpen = !!workingInterval;

        const beforeOpen = !isOpen && intervals[0] && currentTimeSeconds < timeToSeconds(intervals[0].start);

        // Check if closing soon (within 1 hour)
        const closingSoon = workingInterval && 
            (timeToSeconds(workingInterval.end) - currentTimeSeconds <= 3600);

        const onBreak = intervals.length === 2 && 
            currentTimeSeconds >= timeToSeconds(intervals[0].end) && 
            currentTimeSeconds <= timeToSeconds(intervals[1].start);

        const closedAtDate = intervals.length === 0;

        const closedAlready = intervals.length > 0 && 
            currentTimeSeconds > timeToSeconds(intervals[intervals.length - 1].end);

        return {
            isOpen,
            beforeOpen,
            closingSoon,
            onBreak,
            closedAtDate,
            closedAlready,
            currentInterval: workingInterval || null
        };
    }

    function cleanupWidgetAttributes(element) {
        element.removeAttribute('data-has-time');
        element.removeAttribute('data-clickable');
        element.removeAttribute('href');
    }
    // helper functions end

    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
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

            async function fetchWaitTime(token) {

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
                    return data.response;

                } catch (error) {
                    throw error;
                }
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
                        waitTimeData,
                        storeLink
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
                        cleanupWidgetAttributes(element);
                        return;
                    }

                    const data = await fetchWidgetData(token);
                    const { 
                        waitTime: { waitTime, existsAvailableProvider, reason }, 
                        schedule: { weeklySchedule, scheduleExceptions }, 
                        storeTimeZone, 
                        operatingMode,
                        bookingGroupOperationMode
                    } = data.waitTimeData;

                    const currentDate = getCurrentDate(storeTimeZone);
                    const currentTime = getCurrentTime(storeTimeZone);
                    const daySchedule = getCurrentDaySchedule(
                        currentDate, 
                        weeklySchedule, 
                        scheduleExceptions
                    );
                    const { fromTime1, toTime1, fromTime2, toTime2 } = daySchedule;
                    const intervals = [
                        { start: fromTime1, end: toTime1 },
                        { start: fromTime2, end: toTime2 }
                    ].filter((item) => !!item.start && !!item.end);

                    const storeScheduleMetadata = getStoreScheduleMetadata(intervals, currentTime);
                    

                    element.setAttribute('data-has-time', 'true');
                    if (data.storeLink) {
                        element.setAttribute('data-clickable', 'true');
                        element.href = data.storeLink;
                    } else {
                        element.removeAttribute('data-clickable');
                        element.removeAttribute('href');
                    }

                    const { isCheckinOnly } = getOperationModeStatus(operatingMode, bookingGroupOperationMode);

                    if (isCheckinOnly) {
                        const statusString = getStatusString(storeScheduleMetadata, intervals, existsAvailableProvider);
                        if (!statusString) {
                            cleanupWidgetAttributes(element);
                        }
                        element.textContent = statusString;
                        return;
                    }

                    // TODO: do we need it?
                    const statusString = getStatusString(storeScheduleMetadata, intervals, existsAvailableProvider);
                    console.log({statusString});
                    if (statusString) {
                        element.textContent = statusString;
                        return;
                    }

                    const availableReason = 6;
                    const checkinAllowed = storeScheduleMetadata.isOpen && reason === availableReason;

                    if (checkinAllowed && waitTime) {
                        element.textContent = `${formatWaitTime(waitTime)} wait`;
                    } else {
                        cleanupWidgetAttributes(element);
                    }
                } catch (error) {
                    cleanupWidgetAttributes(element);
                    element.textContent = '';
                    
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
