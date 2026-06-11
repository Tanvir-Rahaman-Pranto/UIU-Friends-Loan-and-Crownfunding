function setSort(btn) {
    document.querySelectorAll('.sort-btn').forEach(function(b) {
        b.classList.remove('active');
    });
    btn.classList.add('active');
}

function markHelpful(btn) {
    var icon = btn.querySelector('.material-symbols-outlined');
    if (btn.classList.contains('liked')) {
        btn.classList.remove('liked');
        btn.style.color = '';
        icon.style.fontVariationSettings = "'FILL' 0";
    } else {
        btn.classList.add('liked');
        btn.style.color = '#1E3A8A';
        icon.style.fontVariationSettings = "'FILL' 1";
    }
}
