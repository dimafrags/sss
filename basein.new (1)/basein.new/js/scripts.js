$(document).ready(function() {
    // Функция для форматования цифр в виде <span> для таймера
    function formatTime(num) {
        return "<span>" + ("00" + num).substr(-2)[0] + "</span><span>" + ("00" + num).substr(-2)[1] + "</span>";
    }

    // Обработка клика по якорям
    $("a[href^='#']").click(function() {
        var href = $(this).attr("href");
        var title = $(this).parent().find("h3").text();
        $("#order_form select[name='type'] option[value='" + title + "']").prop("selected", true);
        $("html, body").animate({
            scrollTop: $(href).offset().top + "px"
        }, 500); // Добавлено анимацию с длительностью 500мс
        return false;
    });

    // Функция таймера
    function updateTimer() {
        var now = new Date();
        var endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 0); // Устанавливаем время до 23:59:59

        // Если текущий час больше или равен концу дня, переходим на следующий день
        if (now >= endOfDay) {
            endOfDay.setDate(endOfDay.getDate() + 1);
        }

        var diffSeconds = Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
        var hours = Math.floor(diffSeconds / 3600);
        diffSeconds -= hours * 3600;
        var minutes = Math.floor(diffSeconds / 60);
        var seconds = diffSeconds % 60;

        // Обновляем таймер
        $(".timer .hours").html(formatTime(hours));
        $(".timer .minutes").html(formatTime(minutes));
        $(".timer .seconds").html(formatTime(seconds));

        // Поновляем таймер каждые 200мс
        setTimeout(updateTimer, 200);
    }

    // Запускаем таймер
    updateTimer();
});

// Инициализация Owl Carousel при загрузке страницы
$(window).on("load", function() {
    $(".reviews_list4").owlCarousel({
        items: 1,
        loop: true,
        autoHeight: true,
        smartSpeed: 300,
        mouseDrag: false,
        pullDrag: false,
        nav: true,
        navText: ["<", ">"] // Простые стрелки
    });
});

document.addEventListener('DOMContentLoaded', function() {
    $('select[name="comment"]').on('change', function() {
        var count = $(this).find('option:selected').data('count');
        var prise = $(this).find('option:selected').data('prise');
        var product_id = $(this).find('option:selected').data('productid');
        $('input[name="count"]').val(count);
        $('input[name="product_price"]').val(prise);
        $('input[name="product_id"]').val(product_id);
    });

    $('form#order_form').on('submit', function(e) {
        var price = $('#product_price').val();
        var event_id = Date.now() + Math.random().toString(36).substr(2, 9);
        fbq('track', 'Purchase', {
            currency: 'UAH',
            value: parseFloat(price),
            event_id: event_id
        });

        let url = window.location.href;
        document.getElementById('page_url').value = url;
        document.getElementById('page_title').value = document.title;

        let utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
        utms.forEach(function(utm) {
            let val = getUTM(utm);
            if (document.getElementById(utm)) {
                document.getElementById(utm).value = val || '';
            }
        });

        let name = $('input[name="name"]').val().trim();
        let phone = $('input[name="phone"]').val();
        let nameError = document.getElementById('name-error');
        let phoneError = document.getElementById('phone-error');

        if (!name || !/^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'ʼ\- ]*[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'ʼ][a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'ʼ\- ]*$/u.test(name)) {
            nameError.classList.add('active');
            $('input[name="name"]').focus();
            e.preventDefault();
            return false;
        } else {
            nameError.classList.remove('active');
        }

        if (!/^\+38\s*\([0]\d{2}\)\s*\d{3}\s*-\s*\d{2}\s*-\s*\d{2}$/.test(phone) && phone.length > 4) {
            phoneError.classList.add('active');
            $('input[name="phone"]').focus();
            e.preventDefault();
            return false;
        } else {
            phoneError.classList.remove('active');
        }
    });

    $('input[name="name"]').on('input', function() {
        let val = this.value;
        val = val.replace(/[^a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'ʼ\s\-]/g, '');
        val = val.slice(0, 25);
        this.value = val;

        let errorElement = document.getElementById('name-error');
        if (!val.trim() || !/^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'ʼ\- ]*[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'ʼ][a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'ʼ\- ]*$/u.test(val.trim())) {
            errorElement.classList.add('active');
        } else {
            errorElement.classList.remove('active');
        }
    });

    $('input[name="phone"]').on('input', function() {
        let val = this.value;
        let errorElement = document.getElementById('phone-error');
        if (val.length > 4 && !/^\+38\s*\([0]/.test(val)) {
            errorElement.classList.add('active');
        } else {
            errorElement.classList.remove('active');
        }
    });

    Inputmask("+38 (999) 999-99-99", {
        placeholder: '+38 (___) ___-__-__',
        showMaskOnHover: false,
        keepStatic: true
    }).mask(document.querySelector('input[name="phone"]'));

    $('input[name="phone"]').on('focus', function() {
        if (!this.value || this.value === '+38 (') {
            this.value = '+38 (';
        }
    });

    $('input[name="phone"]').on('blur', function() {
        let val = this.value;
        let errorElement = document.getElementById('phone-error');
        if (!val || val === '+38 (' || !/^\+38\s*\([0]\d{2}\)\s*\d{3}\s*-\s*\d{2}\s*-\s*\d{2}$/.test(val)) {
            errorElement.classList.add('active');
        } else {
            errorElement.classList.remove('active');
        }
    });
});

// Функция для получения UTM-меток
function getUTM(name) {
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    let results = regex.exec(window.location.href);
    if (!results) return '';
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}