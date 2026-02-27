(function () {
    try {
        const savedTheme = localStorage.getItem('theme');
        const supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
        if (savedTheme === 'dark' || (!savedTheme && supportDarkMode)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    } catch (e) { }
})();
