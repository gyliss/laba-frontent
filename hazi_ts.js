var Main = /** @class */ (function () {
    function Main() {
        // Theme konstans
        this.colorThemeKey = 'color-theme';
        this.colorThemeDarkValue = 'dark';
        this.colorThemeLightValue = 'light';
        this.currenColorTheme = '';
        // Olvasási idö konstans
        this.wordsPerMinute = 220; // Words per minute https://scholarwithin.com/average-reading-speed
        this.searchIndexedNodes = 'section';
        this.indexedIdsKey = 'indexedIds'; // Kereséshez indexelt tartalom id-jei
        this.searchHighlightMask = '<mark>$1</mark>';
        // Szerző konstans
        this.authorSourceUrl = 'https://jsonplaceholder.typicode.com/users';
    }
    Main.prototype.initTheme = function () {
        var storedColorTheme = localStorage.getItem(gMain.colorThemeKey);
        var currentColorTheme = '';
        if (!storedColorTheme
            || (storedColorTheme !== this.colorThemeDarkValue
                && storedColorTheme !== this.colorThemeLightValue)) {
            if (window.matchMedia) {
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    currentColorTheme = this.colorThemeDarkValue;
                }
                else {
                    currentColorTheme = this.colorThemeLightValue;
                }
            }
            else {
                currentColorTheme = this.colorThemeLightValue;
            }
        }
        else {
            currentColorTheme = storedColorTheme;
        }
        this.switchColorTheme();
    };
    Main.prototype.initSearch = function () {
        var sections = document.getElementsByTagName(this.searchIndexedNodes);
        var sectionCount = sections.length;
        var indexedIds = [];
        var sectionId = '';
        var sectionTextContent = '';
        var sectionHtmlContent = '';
        var wordCount = 0;
        for (var i = 0; i < sectionCount; i++) {
            sectionId = sections[i].id;
            indexedIds.push(sectionId);
            sectionTextContent = sections[i].innerText;
            wordCount += sectionTextContent.trim().split(/\s+/).length;
            sectionHtmlContent = sections[i].innerHTML;
            localStorage.setItem(sectionId, sectionHtmlContent);
        }
        localStorage.setItem(this.indexedIdsKey, indexedIds.join(','));
        this.updateReadTime(wordCount);
    };
    ;
    Main.prototype.initAuthor = function () {
        var _this = this;
        fetch(this.authorSourceUrl)
            .then(function (response) { return response.json(); })
            .then(function (authors) {
            _this.updateAuthor(authors);
        });
    };
    Main.prototype.updateAuthor = function (authors) {
        var authorsCount = authors.length;
        if (authorsCount && authorsCount > 0) {
            var authorIndex = Math.floor(Math.random() * authorsCount);
            var author = authors[authorIndex];
            var authorHtmlObj = document.getElementById('author');
            authorHtmlObj.getElementsByClassName('name')[0].innerHTML = author.name.trim();
            var authorEmailObj = authorHtmlObj.getElementsByTagName('a')[0];
            authorEmailObj.href = 'mailto: ' + author.email.trim();
            authorEmailObj.innerHTML = author.email.trim();
            authorHtmlObj.getElementsByClassName('address')[0].innerHTML = author.address.zipcode.trim()
                + ' ' + author.address.city.trim()
                + ' ' + author.address.street.trim()
                + ' ' + author.address.suite.trim();
            authorHtmlObj.getElementsByClassName('phone')[0].innerHTML = author.phone;
            authorHtmlObj.getElementsByClassName('company')[0].innerHTML = author.company.name;
            authorHtmlObj.style.display = 'block';
        }
    };
    Main.prototype.switchColorTheme = function () {
        var newColorTheme = '';
        if (!this.currenColorTheme) {
            this.currenColorTheme = document.querySelector("body").getAttribute('data-' + this.colorThemeKey);
        }
        if (this.currenColorTheme === this.colorThemeLightValue) {
            newColorTheme = this.colorThemeDarkValue;
        }
        else if (this.currenColorTheme === this.colorThemeDarkValue) {
            newColorTheme = this.colorThemeLightValue;
        }
        else {
            newColorTheme = this.colorThemeLightValue;
        }
        var colorThemeSwitcherButton = document.getElementById("color-theme-switcher");
        document.querySelector("body").setAttribute('data-' + this.colorThemeKey, newColorTheme);
        if (newColorTheme === this.colorThemeLightValue) {
            colorThemeSwitcherButton.setAttribute('title', 'Váltás sötét módra');
            colorThemeSwitcherButton.innerHTML = "<em class=\"fa fa-moon\"></em>";
        }
        else {
            colorThemeSwitcherButton.setAttribute('title', 'Váltás világos módra');
            colorThemeSwitcherButton.innerHTML = "<em class=\"fa fa-sun-o\"></em>";
        }
        localStorage.setItem(this.colorThemeKey, newColorTheme);
        this.currenColorTheme = newColorTheme;
    };
    ;
    Main.prototype.updateReadTime = function (wordCount) {
        var readTimeInSeconds = Math.round(wordCount / this.wordsPerMinute * 60);
        var hours = Math.floor(readTimeInSeconds / 3600);
        var minutes = Math.floor((readTimeInSeconds % 3600) / 60);
        var seconds = Math.floor(readTimeInSeconds % 60);
        var readTimeText = (hours > 0 ? hours + ' óra ' : '')
            + (minutes > 0 ? minutes + ' perc ' : '')
            + (seconds > 0 ? seconds + ' másodperc ' : '')
            + '(' + wordCount + ' szó)';
        var readTime = document.getElementById('readtime');
        readTime.innerText = readTimeText;
    };
    ;
    Main.prototype.handleSearch = function (searchString) {
        var regEx = new RegExp('(' + searchString + ')', 'gi');
        var indexedId = '';
        var sectionHtmlContent = '';
        var section;
        var indexedIds = localStorage.getItem(this.indexedIdsKey);
        var indexedIdArray = indexedIds.split(',');
        var newHtmlContent;
        for (var i = 0; i < indexedIdArray.length; i++) {
            indexedId = indexedIdArray[i];
            sectionHtmlContent = localStorage.getItem(indexedId);
            section = document.getElementById(indexedId);
            if (!searchString || searchString === '') {
                newHtmlContent = sectionHtmlContent;
            }
            else {
                newHtmlContent = sectionHtmlContent.replace(regEx, this.searchHighlightMask);
            }
            section.innerHTML = newHtmlContent;
        }
    };
    ;
    return Main;
}());
var gMain = new Main();
window.addEventListener('load', function () {
    gMain.initTheme();
    gMain.initSearch();
    gMain.initAuthor();
    document.getElementById('color-theme-switcher').addEventListener("click", function () {
        gMain.switchColorTheme();
    });
});
