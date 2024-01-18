class Main {
    // Theme konstans
    readonly colorThemeKey = "color-theme";
    readonly colorThemeDarkValue = "dark";
    readonly colorThemeLightValue = "light";
    currenColorTheme = "";

    // Olvasási idö konstans
    readonly wordsPerMinute = 220; // Words per minute https://scholarwithin.com/average-reading-speed

    // Keresés konstansok
    readonly searchIndexedNodes = "section";
    readonly indexedIdsKey = "indexedIds"; // Kereséshez indexelt tartalom id-jei
    readonly searchHighlightMask: string = "<mark>$1</mark>";

    // Szerző konstans
    readonly authorSourceUrl = "https://jsonplaceholder.typicode.com/users";

    init() {
        this.initTheme();
        this.initSearchAndWordCount();
        this.initAuthor();
    }

    initTheme() {
        let storedColorTheme = localStorage.getItem(gMain.colorThemeKey);
        let currentColorTheme = "";

        if (!storedColorTheme
            || (storedColorTheme !== this.colorThemeDarkValue
                && storedColorTheme !== this.colorThemeLightValue)) {
            if (window.matchMedia) {
                if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                    currentColorTheme = this.colorThemeDarkValue;
                } else {
                    currentColorTheme = this.colorThemeLightValue;
                }
            } else {
                currentColorTheme = this.colorThemeLightValue;
            }
        } else {
            currentColorTheme = storedColorTheme;
        }

        this.switchColorTheme();

        document.getElementById("color-theme-switcher").addEventListener("click", () => {
            this.switchColorTheme()
        });
    }

    initSearchAndWordCount() {
        let sections = document.getElementsByTagName(this.searchIndexedNodes);
        let sectionCount = sections.length;
        let indexedIds = [];
        let sectionId = "";
        let sectionTextContent = "";
        let sectionHtmlContent = "";
        let wordCount = 0;
        for (let i = 0; i < sectionCount; i++) {
            sectionId = sections[i].id;
            indexedIds.push(sectionId);
            sectionTextContent = sections[i].innerText;
            wordCount += sectionTextContent.trim().split(/\s+/).length;
            sectionHtmlContent = sections[i].innerHTML;
            localStorage.setItem(sectionId, sectionHtmlContent);
        }
        localStorage.setItem(this.indexedIdsKey, indexedIds.join(","));
        this.updateReadTime(wordCount);

        document.getElementById("searchbutton").addEventListener("click", () => {
            this.handleSearch();
        });

        document.getElementById("searchtext").addEventListener("change", () => {
            this.handleSearch();
        });
    };

    initAuthor() {
        fetch(this.authorSourceUrl)
            .then((response) => response.json())
            .then((authors) => {
                this.updateAuthor(authors)
            });
    }

    updateAuthor(authors) {
        let authorsCount = authors.length;
        if (authorsCount && authorsCount > 0) {
            let authorIndex = Math.floor(Math.random() * authorsCount);
            let author = authors[authorIndex];

            const authorHtmlObj = document.getElementById("hazi-szerzo");
            authorHtmlObj.getElementsByClassName("name")[0].innerHTML = author.name.trim();
            const authorEmailObj = authorHtmlObj.getElementsByTagName('a')[0];
            authorEmailObj.href = "mailto: " + author.email.trim();
            authorEmailObj.innerHTML = author.email.trim();
            authorHtmlObj.getElementsByClassName("address")[0].innerHTML = author.address.zipcode.trim()
                + ' ' + author.address.city.trim()
                + ' ' + author.address.street.trim()
                + ' ' + author.address.suite.trim();
            authorHtmlObj.getElementsByClassName("phone")[0].innerHTML = author.phone;
            authorHtmlObj.getElementsByClassName("company")[0].innerHTML = author.company.name;
            authorHtmlObj.style.display = "block";
        }
    }

    switchColorTheme() {
        let newColorTheme = "";

        if (!this.currenColorTheme) {
            this.currenColorTheme = document.querySelector("body").getAttribute("data-" + this.colorThemeKey);
        }

        if (this.currenColorTheme === this.colorThemeLightValue) {
            newColorTheme = this.colorThemeDarkValue;
        } else if (this.currenColorTheme === this.colorThemeDarkValue) {
            newColorTheme = this.colorThemeLightValue;
        } else {
            newColorTheme = this.colorThemeLightValue;
        }

        const colorThemeSwitcherButton = document.getElementById("color-theme-switcher");
        document.querySelector("body").setAttribute("data-" + this.colorThemeKey, newColorTheme);

        if (newColorTheme === this.colorThemeLightValue) {
            colorThemeSwitcherButton.setAttribute("title", "Váltás sötét módra");
            colorThemeSwitcherButton.innerHTML = "<em class=\"fa fa-moon\"></em>";
        } else {
            colorThemeSwitcherButton.setAttribute("title", "Váltás világos módra");
            colorThemeSwitcherButton.innerHTML = "<em class=\"fa fa-sun-o\"></em>";
        }
        localStorage.setItem(this.colorThemeKey, newColorTheme);
        this.currenColorTheme = newColorTheme;
    };

    updateReadTime(wordCount: number) {
        const readTimeInSeconds = Math.round(wordCount / this.wordsPerMinute * 60);
        const hours = Math.floor(readTimeInSeconds / 3600);
        const minutes = Math.floor((readTimeInSeconds % 3600) / 60);
        const seconds = Math.floor(readTimeInSeconds % 60);
        const readTimeText = (hours > 0 ? hours + " óra " : "")
            + (minutes > 0 ? minutes + " perc " : "")
            + (seconds > 0 ? seconds + " másodperc " : "")
            + "(" + wordCount + " szó)";
        const readTime = document.getElementById("readtime");
        readTime.innerText = readTimeText;
    };

    handleSearch() {
        const searchTextObj = document.getElementById("searchtext") as HTMLInputElement;
        const searchText = searchTextObj.value.trim();
        const regEx = new RegExp("(" + searchText + ")(?!([^<]+)?>)", "gi");
        let indexedId = "";
        let sectionHtmlContent = "";
        let section;
        let indexedIds = localStorage.getItem(this.indexedIdsKey);
        let indexedIdArray = indexedIds.split(",");
        let newHtmlContent;

        if (searchText.length === 0) {
            for (let i = 0; i < indexedIdArray.length; i++) {
                indexedId = indexedIdArray[i];
                sectionHtmlContent = localStorage.getItem(indexedId);
                section = document.getElementById(indexedId);
                section.innerHTML = sectionHtmlContent;
            }
        } else {
            for (let i = 0; i < indexedIdArray.length; i++) {
                indexedId = indexedIdArray[i];
                sectionHtmlContent = localStorage.getItem(indexedId);
                section = document.getElementById(indexedId);
                newHtmlContent = sectionHtmlContent.replace(regEx, this.searchHighlightMask);
                section.innerHTML = newHtmlContent;
            }
        }
    };
}

const gMain = new Main();

window.addEventListener("load",() => {
    gMain.init();
});

