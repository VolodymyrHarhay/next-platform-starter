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

  const WIDGET_SELECTOR = '[data-widget="wait-time"]';
  const UNINITIALIZED_WIDGET_SELECTOR = '[data-widget="wait-time"]:not([data-initialized="true"])';
  const pollingInterval = 5 * 60 * 1000;

  const OperationModeBitFlag = {
    Checkin: 1,
    Booking: 2
  };

  const activeIntervals = new Set();

  const styles = `
  [data-widget="wait-time"][data-use-default-styles="true"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 35px;
      width: 135px;
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
  
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  const timeUtils = {
    getCurrentDate(timezone = 'America/New_York') {
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
      return `${dateParts.year}-${dateParts.month}-${dateParts.day}T00:00:00`;
    },

    getCurrentTime(timezone = 'America/New_York') {
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
      const hours = timeParts.hour.padStart(2, '0');
      return `${hours}:${timeParts.minute}:${timeParts.second}`;
    },

    getCurrentWeekday(timezone = 'America/New_York') {
      const date = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone });
      const utcDate = new Date(formatter.format(date));
      const day = utcDate.getDay();
      return day === 0 ? 7 : day;
    }
  };

  const apiUtils = {
    async retryAsync(fn, callName = 'API Call') {
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
          const jitter = Math.random() * 200;
          console.log(`${callName} - Retrying in ${delay + jitter}ms...`);
          await new Promise(res => setTimeout(res, delay + jitter));
          delay *= factor;
        }
      }
    },

    async fetchWaitTime(token) {
      return this.retryAsync(async () => {
        const response = await fetch(API_CONFIG.waitTime.url, {
          method: API_CONFIG.waitTime.method,
          headers: {
            "Accept": "application/json",
            "X-BookedBy-Widget-Context": token
          }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.response;
      }, 'Wait Time API Call');
    },

    async fetchStoreLink(token) {
      return this.retryAsync(async () => {
        const response = await fetch(API_CONFIG.storeLink.url, {
          method: API_CONFIG.storeLink.method,
          headers: {
            "Accept": "application/json",
            "X-BookedBy-Widget-Context": token
          }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return { storeLink: data.response };
      }, 'Store Link API Call');
    },

    async fetchWidgetData(token) {
      let waitTimeData = null;
      try {
        waitTimeData = await this.fetchWaitTime(token);
      } catch (error) {
        console.error('Failed to fetch wait time:', error);
      }

      let storeLink = null;
      if (waitTimeData !== null) {
        try {
          const storeLinkData = await this.fetchStoreLink(token);
          storeLink = storeLinkData.storeLink;
        } catch (error) {
          console.error('Failed to fetch store link:', error);
        }
      }

      return { waitTimeData, storeLink };
    }
  };

  const widgetManager = {
    cleanupPollingInterval(element) {
      const intervalId = Number(element.dataset.intervalId);
      if (intervalId) {
        clearInterval(intervalId);
        activeIntervals.delete(intervalId);
        delete element.dataset.intervalId;
      }
    },

    cleanupAllPollingIntervals() {
      for (const intervalId of activeIntervals) {
        clearInterval(intervalId);
      }
      activeIntervals.clear();
    },

    cleanupWidgetAttributes(element) {
      element.removeAttribute('data-has-time');
      element.removeAttribute('data-clickable');
    },

    initializeWidgetAttributes(element, storeLink = null) {
      element.setAttribute('data-has-time', 'true');
      element.role = storeLink ? 'button' : null;
      element.tabIndex = storeLink ? '0' : null;
      element.onclick = storeLink ? () => window.open(storeLink, '_blank', 'noopener,noreferrer') : null;
      element.setAttribute('data-clickable', storeLink ? 'true' : 'false');
    }
  };

  const contentManager = {
    getOperationModeStatus(operatingMode, bookingGroupOperationMode) {
      const isBookingGroupAllowed = Boolean((bookingGroupOperationMode || 0) & OperationModeBitFlag.Booking);
      const isCheckinGroupAllowed = Boolean((bookingGroupOperationMode || 0) & OperationModeBitFlag.Checkin);
      const isBookingAllowed = Boolean((operatingMode || 0) & OperationModeBitFlag.Booking);
      const isCheckinAllowed = Boolean((operatingMode || 0) & OperationModeBitFlag.Checkin);

      return {
        isCheckinOnly: (!isBookingGroupAllowed || !isBookingAllowed) && isCheckinGroupAllowed && isCheckinAllowed
      };
    },

    getCurrentDaySchedule(currentDate, weeklySchedule, scheduleExceptions) {
      const exception = scheduleExceptions?.find(({ date }) => date === currentDate);

      if (exception) {
        return exception;
      }

      const currentWeekday = timeUtils.getCurrentWeekday();
      const regularSchedule = weeklySchedule?.find(schedule => schedule.weekday === currentWeekday);
      return regularSchedule;
    },

    formatWaitTime(timeString) {
      if (!timeString) return '';
      const [hours, minutes] = timeString.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;

      if (hours > 0) {
        return `${hours}h ${minutes > 0 ? minutes + 'min' : ''}`;
      }
      return `${totalMinutes} min`;
    },

    formatToUSTime(timeString) {
      if (!timeString) return '';
      const [hours, minutes] = timeString.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    },

    getStatusString(scheduleMetadata, intervals, existsAvailableProvider) {
      const { isOpen, closedAtDate, closedAlready, beforeOpen, onBreak } = scheduleMetadata;

      if (closedAtDate || closedAlready) {
        return 'Closed';
      }

      if (beforeOpen) {
        const startTime = contentManager.formatToUSTime(intervals[0].start);
        return `Opens ${startTime}`;
      }

      if (onBreak) {
        const startTime = contentManager.formatToUSTime(intervals[1].start);
        return `Opens ${startTime}`;
      }

      if (isOpen && !existsAvailableProvider) {
        return 'Unavailable';
      }

      return '';
    },

    getStoreScheduleMetadata(intervals, time) {
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
    },

    updateWidgetContent(element, waitTimeData) {
      const {
        waitTime: { waitTime, existsAvailableProvider, reason },
        schedule: { weeklySchedule, scheduleExceptions },
        storeTimeZone,
        operatingMode,
        bookingGroupOperationMode
      } = waitTimeData;

      const currentDate = timeUtils.getCurrentDate(storeTimeZone);
      const currentTime = timeUtils.getCurrentTime(storeTimeZone);
      const daySchedule = contentManager.getCurrentDaySchedule(
        currentDate,
        weeklySchedule,
        scheduleExceptions
      );
      const { fromTime1, toTime1, fromTime2, toTime2 } = daySchedule;
      const intervals = [
        { start: fromTime1, end: toTime1 },
        { start: fromTime2, end: toTime2 }
      ].filter((item) => !!item.start && !!item.end);

      const storeScheduleMetadata = contentManager.getStoreScheduleMetadata(intervals, currentTime);
      const { isCheckinOnly } = contentManager.getOperationModeStatus(operatingMode, bookingGroupOperationMode);

      if (isCheckinOnly) {
        const statusString = contentManager.getStatusString(storeScheduleMetadata, intervals, existsAvailableProvider);
        if (!statusString) {
          widgetManager.cleanupWidgetAttributes(element);
        }
        element.textContent = statusString;
        return;
      }

      const availableReason = 6;
      const checkinAllowed = storeScheduleMetadata.isOpen && reason === availableReason;

      if (checkinAllowed && waitTime) {
        element.textContent = `${contentManager.formatWaitTime(waitTime)} wait`;
      } else {
        widgetManager.cleanupWidgetAttributes(element);
      }

    }
  };

  document.addEventListener('DOMContentLoaded', async function () {
    function init() {
      const widgets = document.querySelectorAll(WIDGET_SELECTOR) || [];

      if (!widgets.length) {
        console.error('No wait time widgets found');
      }

      function initializeNewWidgets() {
        const newWidgets = document.querySelectorAll(UNINITIALIZED_WIDGET_SELECTOR) || [];
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
                  const widgets = node.querySelectorAll(WIDGET_SELECTOR);
                  widgets.forEach(widgetManager.cleanupPollingInterval);
                  // Also check if the removed node itself is a widget
                  if (node.matches(WIDGET_SELECTOR)) {
                    widgetManager.cleanupPollingInterval(node);
                  }
                }
              });

              return Array.from(mutation.addedNodes).some(node => {
                if (node.nodeType !== 1) return false;
                const isWidget = node.matches(WIDGET_SELECTOR) ||
                  node.querySelector(WIDGET_SELECTOR);
                return isWidget;
              });
            }
            return false;
          });

          if (hasNewWidgets) {
            initializeNewWidgets();
          }
        });

        const config = { childList: true, subtree: true };
        observer.observe(document.body, config);

        window.addEventListener('unload', () => {
          observer.disconnect();
          widgetManager.cleanupAllPollingIntervals();
        });
      }

      // Initial setup
      initializeNewWidgets();
      observeDOMChanges();

      async function updateWidget(element, token) {
        if (element.dataset.initialized === "true") return;
        
        // Only cleanup if there's an existing interval
        if (element.dataset.intervalId) {
          widgetManager.cleanupPollingInterval(element);
        }

        try {
          const initialData = await apiUtils.fetchWidgetData(token);
          if (!initialData.waitTimeData) return;
          element.dataset.initialized = "true";

          widgetManager.initializeWidgetAttributes(element, initialData.storeLink);
          contentManager.updateWidgetContent(element, initialData.waitTimeData);

          // Setup polling for wait time only
          const interval = setInterval(async () => {
            try {
              const waitTimeData = await apiUtils.fetchWaitTime(token);
              if (!waitTimeData) return;
              contentManager.updateWidgetContent(element, waitTimeData);
            } catch (error) {
              if (error?.response?.userMessage) {
                console.error('Error updating widget data:', error.response.userMessage);
              } else {
                console.error('Error updating widget data:', error);
              }
              widgetManager.cleanupPollingInterval(element);
            }
          }, pollingInterval);

          // Store interval ID in dataset and track it
          element.dataset.intervalId = interval;
          activeIntervals.add(interval);
        } catch (error) {
          widgetManager.cleanupWidgetAttributes(element);
          element.textContent = '';
          if (element.dataset.intervalId) {
            widgetManager.cleanupPollingInterval(element);
          }
          if (error?.response?.userMessage) {
            console.error('Unexpected error in updateWidget:', error.response.userMessage);
          } else {
            console.error('Unexpected error in updateWidget:', error.message, error);
          }
        }
      }
    }

    init();
  });
})();
