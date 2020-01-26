// manage classes
function hasClass(elem, cls) {
  return !!elem.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
}

// add class + remove additional spaces
function addClass(elem, cls) {
  let reg = new RegExp("(\\s\\s)");
  if (!hasClass(elem, cls)) {
    elem.className += " " + cls;
  }
  elem.className = elem.className.replace(reg, " ");
}

// remove class + remove additional spaces + previous click element
function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    let reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
    ele.className = ele.className.replace(reg, " ");
    reg = new RegExp("(\\s\\s)");
    ele.className = ele.className.replace(reg, " ");
  }
}

// browser compatible EventListener
let addListener = function(element, eventType, handler, capture) {
  if (capture === undefined) {
    capture = false;
  }
  if (element.addEventListener) {
    element.addEventListener(eventType, handler, capture);
  } else if (element.attachEvent) {
    element.attachEvent("on" + eventType, handler);
  }
};

// co-ordinates of clicked element
let getPosition = function(element) {
  let xP = element.offsetLeft + element.clientLeft;
  let yP = element.offsetTop + element.clientTop;
  return { x: xP, y: yP };
};

// PROTOTYPE for Date obj

Date.prototype.getCurrentDate = function() {
  // return current date yyyy-mm-dd
  let d = new Date();
  let n = d.toLocaleDateString("sv-SE");
  return n;
};

Date.prototype.getDatePart = function(dateString) {
  // return date
  let selectedDateArr = dateString.split(" ");
  return selectedDateArr[0];
};

Date.prototype.getSelectedDate = function(dateString) {
  // Get selected Date
  let selectedDate = this.getDatePart(dateString);
  return new Date(selectedDate);
};

const CalendarComponent = {
  dayArr: ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"],
  monthArr: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ],

  initCalendar(e) {
    if (e === undefined) {
      return false;
    }

    // ensure the calendar obj accessable
    this.renderCalendar(e);

    // click event to display calendar
    addListener(e, "click", function(e) {
      let pc = CalendarComponent;
      pc.form = e;
      pc.activateCalendar(e);
    });
  },

  updateForm(e) {
    // update form and display date
    let currentForm = this.form.srcElement;
    let clickedDay = e.srcElement;
    let selectedDateArr = currentForm.value.split(" ");
    let dp = document.getElementById("dp_datepicker");
    let dpSelected = dp.getElementsByClassName("selected");

    if (selectedDateArr.length > 1) {
      selectedDateArr[0] = clickedDay.attributes["data-date"].value;
      currentForm.value = selectedDateArr.join(" ");
    } else {
      currentForm.value = clickedDay.attributes["data-date"].value;
    }

    if (dpSelected.length === 1) {
      removeClass(dpSelected[0], "selected");
    }

    addClass(clickedDay, "selected");
    this.hideCalendar();
  },

  addEventToDays(e) {
    //  click event for day
    let that = this;
    let form = e;
    let dayDivs = document.getElementsByClassName("dpDay");
    let i = 0;

    while (i < dayDivs.length) {
      addListener(dayDivs[i], "click", function(e) {
        that.updateForm(e, form);
      });
      i++;
    }
  },

  addEventChangeMonth(e) {
    //  click event for month
    let prev = document.getElementById("dpPrev");
    let next = document.getElementById("dpNext");

    if (prev.getAttribute("data-click") !== "on") {
      addListener(prev, "click", function() {
        let dp = CalendarComponent;
        let monthHead = document.getElementById("dpMonth");
        let month = new Date(monthHead.attributes["data-date"].value);
        month = month.toLocaleDateString("sv-SE");

        let dateArr = month.split("-");

        if (parseInt(dateArr[1], 10) === 1) {
          dateArr[1] = 12;
          dateArr[0]--;
        } else {
          dateArr[1]--;
        }

        if (parseInt(dateArr[1], 10) < 10) {
          dateArr[1] = "0" + parseInt(dateArr[1], 10);
        }

        month = dateArr.join("-");
        monthHead.setAttribute("data-date", month);
        dp.fillData(month, e);
      });

      addListener(next, "click", function() {
        let dp = CalendarComponent;
        let monthHead = document.getElementById("dpMonth");
        let month = new Date(monthHead.attributes["data-date"].value);
        month = month.toLocaleDateString("sv-SE");

        let dateArr = month.split("-");

        if (parseInt(dateArr[1], 10) === 12) {
          dateArr[1] = 1;
          dateArr[0]++;
        } else {
          dateArr[1]++;
        }

        if (parseInt(dateArr[1], 10) < 10) {
          dateArr[1] = "0" + parseInt(dateArr[1], 10);
        }

        month = dateArr.join("-");
        monthHead.setAttribute("data-date", month);
        dp.fillData(month, e);
      });
    }

    prev.setAttribute("data-click", "on");
  },

  getDisplayDate(e) {
    let d = new Date();
    let selectedDate = d.getDatePart(e.target.value);
    let currentDate = d.getCurrentDate();
    let showDate = selectedDate;
    if (selectedDate === "") {
      showDate = currentDate;
    }
    return showDate;
  },

  fillData(showDate, e) {
    let d = new Date();
    let selectedDateJS = d.getSelectedDate(e.target.value);
    let showDateJS = new Date(showDate);
    let firstDay = showDateJS.getFullYear() + "-" + (showDateJS.getMonth() + 1) + "-01"  ;
    let firstDayJS = new Date(firstDay);
    let currDay = firstDayJS.getDay(); // 1 is monday
    let startDayJS = firstDayJS;

    if (firstDayJS.getDay() !== 1) {
      if (firstDayJS.getDay() === 0) {
        currDay = 7;
      }
      // Calculate days to monday
      let daysUntilMonday = -currDay + 1;
      // Find the first monday to display
      startDayJS.setTime(
        Date.parse(firstDayJS.toLocaleDateString("sv-SE")) +
          daysUntilMonday * 24 * 3600 * 1000
      );
    }

    let monthHead = document.getElementById("dpMonth");
    let currMonthStyle = false;
    let hide = false;

    monthHead.innerHTML =
      showDateJS.getFullYear() + " " + this.monthArr[showDateJS.getMonth()];
    monthHead.setAttribute("data-date", showDateJS);

    for (let i = 0; i < 42; i++) {
      let dpDay = document.getElementById("dpDay_" + i);
      currMonthStyle = true;

      removeClass(dpDay, "other_month");

      if (startDayJS.getMonth() !== showDateJS.getMonth()) {
        addClass(dpDay, "other_month");
        currMonthStyle = false;
      }
      removeClass(dpDay, "today");

      if (startDayJS.toLocaleDateString() === d.toLocaleDateString()) {
        addClass(dpDay, "today");
      }

      removeClass(dpDay, "selected");

      if (
        startDayJS.toLocaleDateString() === selectedDateJS.toLocaleDateString()
      ) {
        addClass(dpDay, "selected");
      }

      if (!currMonthStyle && i === 35) {
        hide = true;
      }

      if (!hide) {
        dpDay.style.display = "flex";
        dpDay.innerHTML = startDayJS.getDate();
        dpDay.setAttribute("data-date", startDayJS.toLocaleDateString("sv-SE"));
      } else {
        dpDay.style.display = "none";
      }

      startDayJS.setTime(
        Date.parse(firstDayJS.toLocaleDateString("sv-SE")) +
          1 * 24 * 3600 * 1000
      );
    }
  },

  activateCalendar(e) {
    let showDate = this.getDisplayDate(e);
    let dc = document.getElementById("dpContainer");

    // Get the position of the form field
    let pos = getPosition(e.target);

    // toggle
    if (dc.style.display === "flex") {
      dc.style.display = "none";
      return false;
    }

    this.fillData(showDate, e);

    dc.style.display = "flex";

    // Add click events to each day
    this.addEventToDays(e);

    // Add month change click events
    this.addEventChangeMonth(e);
  },

  renderCalendar() {
    let dc = document.getElementById("dpContainer");

    if (dc === null) {
      let elem = document.createElement("div");
      elem.style.display = "none";
      elem.className = "dpParentContainer";
      elem.id = "dpContainer";
      elem.innerHTML = this.getTemplate();
      // Add our component to the DOM
      document.body.appendChild(elem);
    }
    return false;
  },

  hideCalendar() {
    let dc = document.getElementById("dpContainer");
    dc.style.display = "none";
  },

  getTemplate() {
    let monthHead = `
      <div id="dpPrev" class="dpNav">
        &lsaquo;
      </div>
      <div id="dpMonth" class="dpMonth">
      </div>
      <div id="dpNext" class="dpNav">
        &rsaquo;
      </div>
    `;

    let dayList = "";

    for (let i = 0; i < 7; i++) {
      // add value to variable
      dayList += '<div class="dpDayCol">' + this.dayArr[i] + "</div>";
    }

    for (let i = 0; i < 42; i++) {
      // add value to variable
      dayList += '<div class="dpDay" id="dpDay_' + i + '" data-date=""></div>';
    }

    let dpString =
      '<div id="dp_datepicker" class="dp_datepicker"><div id="dpHead" class="dpHead">' +
      monthHead +
      '</div><div id="dpBody" class="dpBody">' +
      dayList +
      "</div></div>";

    return dpString;
  }
};

// create CalendarComponent obj
// loop all elements "datepicker"
// initiate CalendarComponent

let dp = CalendarComponent;
let calendarObj = document.getElementsByClassName("datepicker");
let i = 0;
while (i < calendarObj.length) {
  dp.initCalendar(calendarObj[i]);
  i++;
}
