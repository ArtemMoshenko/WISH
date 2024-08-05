function openSection(name) {
  $(".inputPhoneContainer").hide();
  $(".preVerifyPhoneContainer").hide();
  $(".verifyPhoneContainer").hide();

  $(`.${name}Container`).css({ display: "flex" });
}

function goToPreVerification() {
  let phone = $("#phone").val();
  if (
    phone
      .replaceAll(" ", "")
      .replaceAll("(", "")
      .replaceAll(")", "")
      .replaceAll("+", "")
      .replaceAll("-", "").length !== 11
  )
    return alert("Введите номер телефона");

  if (!$("#notificationAgreementCheckbox")[0].checked)
    return alert("Необходимо согласиться с получением важных уведомлений!");

  sessionStorage.setItem("phone", phone);
  $("#yourPhone").text(phone);

  openSection("preVerifyPhone");
}

function startFlashCall() {
  if (
    new Date().getTime() -
      Number(sessionStorage.getItem("startFlashCallTime")) -
      60 * 1000 <
      0 &&
    sessionStorage.getItem("startFlashCallTime") != null
  ) {
    openSection("verifyPhone");
    return showRestartTimer();
  }

  openSection("verifyPhone");
  $.ajax({
    url: "/auth/start-flash-call",
    method: "post",
    data: {
      phone: sessionStorage.getItem("phone"),
    },
    success: function (data) {
      if (data.status !== "ok") alert("Произошла ошибка!");
    },
  });
  setRestartTimer();
}

function setRestartTimer() {
  sessionStorage.setItem("startFlashCallTime", new Date().getTime());
  showRestartTimer();
}

function showRestartTimer() {
  const timer = setInterval(() => {
    const timeLeft =
      new Date().getTime() -
      Number(sessionStorage.getItem("startFlashCallTime")) -
      60 * 1000;
    $("#restartTimer").text(
      `Позвонить еще раз: ${Math.floor(-timeLeft / 1000)}`
    );
    // $("#restartTimer").css({ color: "gray" });
    $("#restartTimer").addClass("restartTimerDisabled");
    if (timeLeft > 0) {
      $("#restartTimer").text(`Позвонить еще раз`);
      // $("#restartTimer").css({ color: "#004daf" });
      $("#restartTimer").removeClass("restartTimerDisabled");
      clearInterval(timer);
    }
  }, 100);
}

$("#phone").mask("+7 (999) 999 99-99");

// Обработка поля ввода кода
const ELS_pinEntry = document.querySelectorAll(".pinEntry");
ELS_pinEntry.forEach((el) => {
  //   el.addEventListener("focusin", (evt) => {
  //     const EL_input = evt.currentTarget;
  //     if (EL_input.value.length >= 4) EL_input.select();
  //   });
  el.addEventListener("input", (evt) => {
    const EL_input = evt.currentTarget;
    if (EL_input.value.length >= 4) {
      EL_input.value = EL_input.value.slice(0, 4);
      if (sessionStorage.getItem("startFlashCallTime") !== "0") {
        sessionStorage.setItem("startFlashCallTime", 0);
        $.ajax({
          url: "/auth/check-code",
          method: "post",
          data: {
            code: EL_input.value,
            phone: sessionStorage.getItem("phone"),
          },
          success: function (data) {
            if (data.status === "ok" && data.is_verified) {
              const urlParams = new URLSearchParams(window.location.search);
              const station_id = urlParams.get("station_id");
              const from_url = urlParams.get("from_url");
              if (station_id) {
                window.location.href = `/station-map?station_id=${station_id}`;
              } else if (from_url) {
                window.location.href = from_url;
              } else {
                window.location.href = "/station-map";
              }
            } else {
              if (data.attempts_exceeded) {
                alert("Превышено количество попыток ввода кода");
                location.reload();
              } else if (data.timeout_exceeded) {
                alert("Время действия кода истекло");
                location.reload();
              } else {
                alert("Неверный код");
                EL_input.value = "";
                sessionStorage.setItem("startFlashCallTime", 1);
              }
            }
          },
        });
      }
    }
  });
});

// Восстановить поле ввода кода, если минута не прошла, а страницу обновили
if (
  new Date().getTime() -
    Number(sessionStorage.getItem("startFlashCallTime")) -
    60 * 1000 <
    0 &&
  sessionStorage.getItem("startFlashCallTime") != null
) {
  openSection("verifyPhone");
  showRestartTimer();
}

// VK ID
const VKID = window.VKIDSDK;

// GENERATING CODE VERIFIER
// function dec2hex(dec) {
//   return ("0" + dec.toString(16)).substr(-2);
// }
// function generateCodeVerifier() {
//   var array = new Uint32Array(56 / 2);
//   window.crypto.getRandomValues(array);
//   return Array.from(array, dec2hex).join("");
// }
function generateCodeVerifier() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
  const length = Math.floor(Math.random() * (129 - 43 + 1)) + 43;
  let result = '';
  for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/*  `code_verifier` - Случайно сгенерированная строка, новая на каждый запрос. 
    Может состоять из следующих символов алфавита: a-z, A-Z, 0-9, _, -. Длина от 43 до 128 символов. */
const codeVerifier = generateCodeVerifier()
document.cookie = `vkCodeVerifier=${codeVerifier}`

VKID.Config.init({
  app: "52095189",
  redirectUrl: "https://shareu.ru/auth/vk-id",
  codeVerifier: codeVerifier,
  // scope: 'phone',
  mode: VKID.ConfigAuthMode.InNewTab
});

// Создание экземпляра кнопки
const oneTap = new VKID.OneTap();
const container = document.getElementById("VkIdSdkOneTap");

if (container) {
  // Отрисовка кнопки в контейнере с именем приложения APP_NAME, светлой темой и на русском языке.
  oneTap
    .render({
      container: container,
      scheme: VKID.Scheme.LIGHT,
      lang: VKID.Languages.RUS,
    })
    .on(VKID.WidgetEvents.ERROR, (error) => {
      console.error(error);
    });
}
