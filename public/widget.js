(function () {
  if (typeof window === 'undefined') return;

  const API_CONFIG = {
    waitTime: {
      url: 'https://bb-ui.dev.sg.salondev.net/api/v1/Widget/External/Waittime',
      method: 'GET'
    },
    storeLink: {
      url: 'https://bb-ui.dev.sg.salondev.net/api/v1/Widget/External/StoreLink',
      method: 'GET'
    }
  };

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

  const OperationModeBitFlag = {
    Checkin: 1,
    Booking: 2
  };

  const pollingInterval = 10000; // TODO: change it to 5 minutes later (30 * 60 * 1000)

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

  function getCurrentDate(timezone = 'America/New_York') {
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

  function getCurrentTime(timezone = 'America/New_York') {
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

  function getCurrentWeekday(timezone = 'America/New_York') {
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
      return 'Unavailable';
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

  async function retryAsync(fn, callName = 'API Call') {
    const retries = 3;
    const initialDelay = 2000;
    const factor = 2;

    let attempt = 0;
    let delay = initialDelay;

    while (attempt < retries) {
      try {
        return await fn();
      } catch (error) {
        attempt++;
        console.warn(`${callName} - Attempt ${attempt} failed: ${error.message}`);
        if (attempt >= retries) {
          console.error(`${callName} failed after ${retries} attempts.`);
          throw error;
        }

        // Add jitter (random variation) to avoid synchronized retries
        const jitter = Math.random() * 200;
        console.log(`${callName} - Retrying in ${delay + jitter}ms...`);
        await new Promise(res => setTimeout(res, delay + jitter));
        delay *= factor; // Exponential backoff
      }
    }
  }

  function cleanupWidgetAttributes(element) {
    element.removeAttribute('data-has-time');
    element.removeAttribute('data-clickable');
    element.removeAttribute('href');
  }
  // helper functions end

  // fetch functions start
  async function fetchWaitTime(token) {
    return retryAsync(async () => {
      const headers = {
        "Accept": "application/json",
        "X-BookedBy-Widget-Context": token
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
    }, 'Fetch Wait Time');
  }

  async function fetchStoreLink(token) {
    return retryAsync(async () => {
      const headers = {
        "Accept": "application/json",
        "X-BookedBy-Widget-Context": token
      };

      const response = await fetch(API_CONFIG.storeLink.url, {
        method: API_CONFIG.storeLink.method,
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { storeLink: data.response };
    }, 'Fetch Store Link');
  }

  async function fetchWidgetData(token) {
    let waitTimeData = null;
    try {
      waitTimeData = await fetchWaitTime(token);
    } catch (error) {
      console.error('Failed to fetch wait time:', error);
    }

    let storeLink = null;
    // Only fetch the store link if wait time data is available
    if (waitTimeData !== null) {
      try {
        const storeLinkData = await fetchStoreLink(token);
        storeLink = storeLinkData.storeLink;
      } catch (error) {
        console.error('Failed to fetch store link:', error);
      }
    }

    return {
      waitTimeData,
      storeLink
    };
  }
  // fetch functions end

  // Auto-initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', async function () {
    function init() {
      const widgets = document.querySelectorAll('[data-widget="wait-time"]') || [];

      if (!widgets.length) {
        console.error('No wait time widgets found');
      }

      let stylesInjected = false;
      function injectStylesIfNeeded() {
        if (stylesInjected) return;
        const widgets = document.querySelectorAll('[data-widget="wait-time"]');
        
        const hasDefaultStylesWidget = Array.from(widgets).some(widget =>
          widget.getAttribute('data-use-default-styles') !== 'false'
        );
      
        if (hasDefaultStylesWidget) {
          const styleSheet = document.createElement("style");
          styleSheet.textContent = styles;
          document.head.appendChild(styleSheet);
          stylesInjected = true;
        }
      }

      const widgetPollingIntervals = new WeakMap();

      function cleanupPollingInterval(element) {
        const interval = widgetPollingIntervals.get(element);
        if (interval) {
          clearInterval(interval);
          widgetPollingIntervals.delete(element);
        }
      }

      function cleanupAllPollingIntervals() {
        const widgets = document.querySelectorAll('[data-widget="wait-time"]') || [];
        widgets.forEach(cleanupPollingInterval);
      }

      function initializeNewWidgets() {
        const newWidgets = document.querySelectorAll('[data-widget="wait-time"]:not([data-initialized="true"])');
        newWidgets.forEach(widget => {
          const token = widget.getAttribute('data-token');
          if (token) {
            updateWidget(widget, token);
          } else {
            console.error('Widget token not found');
          }
        });
      }

      function observeDOMChanges() {
        const observer = new MutationObserver(mutationsList => {
          const hasNewWidgets = mutationsList.some(mutation => {
            if (mutation.type === 'childList') {
              // Check for removed widgets to cleanup polling
              mutation.removedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const widgets = node.querySelectorAll('[data-widget="wait-time"]');
                  widgets.forEach(cleanupPollingInterval);
                  // Also check if the removed node itself is a widget
                  if (node.matches('[data-widget="wait-time"]')) {
                    cleanupPollingInterval(node);
                  }
                }
              });

              return Array.from(mutation.addedNodes).some(node => {
                if (node.nodeType !== 1) return false;
                const isWidget = node.matches('[data-widget="wait-time"]') ||
                  node.querySelector('[data-widget="wait-time"]');
                return isWidget;
              });
            }
            return false;
          });

          if (hasNewWidgets) {
            injectStylesIfNeeded();
            initializeNewWidgets();
          }
        });

        const config = { childList: true, subtree: true };
        observer.observe(document.body, config);

        // TODO: do we need it here?
        window.addEventListener('unload', () => {
          observer.disconnect();
          cleanupAllPollingIntervals();
        });
      }

      injectStylesIfNeeded();
      initializeNewWidgets();

      observeDOMChanges()

      function updateWidgetContent(element, waitTimeData) {
        const {
          waitTime: { waitTime, existsAvailableProvider, reason },
          schedule: { weeklySchedule, scheduleExceptions },
          storeTimeZone,
          operatingMode,
          bookingGroupOperationMode
        } = waitTimeData;

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
        const { isCheckinOnly } = getOperationModeStatus(operatingMode, bookingGroupOperationMode);

        if (isCheckinOnly) {
          const statusString = getStatusString(storeScheduleMetadata, intervals, existsAvailableProvider);
          if (!statusString) {
            cleanupWidgetAttributes(element);
          }
          element.textContent = statusString;
          return;
        }


        // TODO: why we do not have it in the BB?
        const statusString = getStatusString(storeScheduleMetadata, intervals, existsAvailableProvider);
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
      }

      async function updateWidget(element, token) {
        cleanupPollingInterval(element);

        if (element.dataset.initialized === "true") return;

        try {
          const initialData = await fetchWidgetData(token);
          if (!initialData.waitTimeData) return;
          element.dataset.initialized = "true";

          element.setAttribute('data-has-time', 'true');
          if (initialData.storeLink) {
            element.setAttribute('data-clickable', 'true');
            element.href = initialData.storeLink;
          } else {
            element.removeAttribute('data-clickable');
            element.removeAttribute('href');
          }

          updateWidgetContent(element, initialData.waitTimeData);

          // Setup polling for wait time only
          const interval = setInterval(async () => {
            try {
              const waitTimeData = await fetchWaitTime(token);
              if (!waitTimeData) return;
              updateWidgetContent(element, waitTimeData);
            } catch (error) {
              console.error('Error updating widget data:', error);
              cleanupPollingInterval(element);
            }
          }, pollingInterval);

          widgetPollingIntervals.set(element, interval);
        } catch (error) {
          cleanupWidgetAttributes(element);
          element.textContent = '';
          cleanupPollingInterval(element);
          console.error(`Unexpected error in updateWidget: ${error.message}`, error);
        }
      }
    }

    init();
  });
})();
