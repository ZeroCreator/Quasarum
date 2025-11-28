class App {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('sidebarOverlay');
        this.currentChapter = 1;
        this.totalChapters = 9;
        
        this.init();
    }

    async init() {
        await this.loadTOC();
        this.bindEvents();
        this.loadChapter(this.currentChapter);
        this.updateFooterYear();
    }

    async loadTOC() {
        try {
            console.log('Loading TOC from: components/toc.html');

            const response = await fetch('assets/components/toc.html');
            if (!response.ok) {
                throw new Error(`TOC not found: ${response.status}`);
            }

            const tocHTML = await response.text();
            console.log('TOC HTML loaded:', tocHTML.length, 'characters');

            this.sidebar.innerHTML = tocHTML;
            console.log('TOC displayed successfully');

        } catch (error) {
            console.error('Ошибка загрузки оглавления:', error);
        }
    }

    bindEvents() {
        console.log('Binding events...');

        // Переключение меню
        document.getElementById('menuToggle').addEventListener('click', () => this.toggleMenu());
        this.overlay.addEventListener('click', () => this.toggleMenu());

        // Обработка ссылок в меню (делегирование событий)
        this.sidebar.addEventListener('click', (event) => {
            if (event.target.classList.contains('toc-link')) {
                event.preventDefault();
                const chapterNumber = event.target.dataset.chapter;
                console.log('TOC link clicked:', chapterNumber);
                this.navigateToChapter(chapterNumber);
            }
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', (event) => {
            const menuToggle = document.querySelector('.menu-toggle');
            if (!this.sidebar.contains(event.target) &&
                !menuToggle.contains(event.target) &&
                this.sidebar.classList.contains('active')) {
                this.toggleMenu();
            }
        });

        console.log('Events bound successfully');
    }

    toggleMenu() {
        this.sidebar.classList.toggle('active');
        this.overlay.classList.toggle('active');
    }

    navigateToChapter(chapter) {
        console.log('Navigating to chapter:', chapter);

        // Если chapter - число, обновляем currentChapter
        if (!isNaN(chapter)) {
            this.currentChapter = parseInt(chapter);
        }

        this.loadChapter(chapter);
        this.updateActiveMenuLink(chapter);

        // Закрыть меню на мобильных устройствах
        if (window.innerWidth <= 768) {
            this.toggleMenu();
        }
    }

    updateActiveMenuLink(chapter) {
        document.querySelectorAll('.toc-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-chapter="${chapter}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    async loadChapter(chapter) {
        try {
            console.log('Loading chapter:', chapter);

            let url;
            let isGallery = false;
            let isReferences = false;

            // Определяем тип страницы
            if (chapter === 'gallery') {
                url = 'chapters/gallery.html';
                isGallery = true;
            } else if (chapter === 'references') {
                url = 'chapters/references.html';
                isReferences = true;
            } else {
                url = `chapters/chapter${chapter}.html`;
            }

            // Пробуем разные пути
            const paths = [
                url,
                `./${url}`,
                `/${url}`
            ];

            let content = '';
            let loaded = false;

            for (const path of paths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        content = await response.text();
                        console.log('Chapter loaded from:', path);
                        loaded = true;
                        break;
                    }
                } catch (error) {
                    console.warn('Failed to load from:', path, error);
                }
            }

            if (!loaded) {
                throw new Error(`Could not load chapter ${chapter} from any path`);
            }

            document.getElementById('chapter-container').innerHTML = content;

            // Обновляем навигацию - передаем ВСЕ три параметра
            this.updateNavigationButtons(chapter, isGallery, isReferences);

            // Прокрутка к верху
            window.scrollTo({ top: 0, behavior: 'smooth' });

            console.log('Chapter loaded successfully');

        } catch (error) {
            console.error('Ошибка загрузки:', error);
            document.getElementById('chapter-container').innerHTML = `
                <div class="chapter-content">
                    <div class="chapter-main" style="text-align: center; padding: 60px 0;">
                        <h2 style="color: #ff6b6b; margin-bottom: 20px;">Ошибка загрузки</h2>
                        <p style="color: #b8b8d0; margin-bottom: 30px;">Не удалось загрузить содержимое. Пожалуйста, попробуйте позже.</p>
                        <p style="color: #8888aa; font-size: 14px; margin-bottom: 20px;">Ошибка: ${error.message}</p>
                        <button class="nav-button" onclick="app.loadChapter('${chapter}')">Попробовать снова</button>
                    </div>
                </div>
            `;
        }
    }

    updateNavigationButtons(currentChapter, isGallery = false, isReferences = false) {
        const prevButton = document.querySelector('.prev-button');
        const nextButton = document.querySelector('.next-button');
        const indicator = document.querySelector('.chapter-indicator');

        if (!prevButton || !nextButton || !indicator) return;

        // Для галереи
        if (isGallery) {
            prevButton.innerHTML = '← Материалы';
            prevButton.onclick = () => this.loadChapter('references');
            prevButton.disabled = false;

            nextButton.innerHTML = 'Следующая →';
            nextButton.disabled = true;
            nextButton.style.display = 'none';

            indicator.textContent = 'Галерея';
            return;
        }

        // Для страницы материалов
        if (isReferences) {
            prevButton.innerHTML = '← К главе 9';
            prevButton.onclick = () => this.loadChapter('9');
            prevButton.disabled = false;

            nextButton.innerHTML = 'Галерея →';
            nextButton.onclick = () => this.loadChapter('gallery');
            nextButton.disabled = false;
            nextButton.style.display = 'block';

            indicator.textContent = 'Использованные материалы';
            return;
        }

        // Для обычных глав
        const chapterNum = parseInt(currentChapter);

        // Предыдущая глава
        if (chapterNum > 1) {
            prevButton.innerHTML = '← Предыдущая глава';
            prevButton.onclick = () => this.loadChapter((chapterNum - 1).toString());
            prevButton.disabled = false;
        } else {
            prevButton.innerHTML = '← Предыдущая глава';
            prevButton.disabled = true;
        }

        // Следующая глава - ОСОБЫЙ СЛУЧАЙ ДЛЯ ГЛАВЫ 11
        if (chapterNum < 11) {
            nextButton.innerHTML = 'Следующая глава →';
            nextButton.onclick = () => this.loadChapter((chapterNum + 1).toString());
            nextButton.disabled = false;
            nextButton.style.display = 'block';
        } else if (chapterNum === 11) {
            // Для последней главы ведем к материалам
            nextButton.innerHTML = 'Материалы →';
            nextButton.onclick = () => this.loadChapter('references');
            nextButton.disabled = false;
            nextButton.style.display = 'block';
        } else {
            nextButton.innerHTML = 'Следующая глава →';
            nextButton.disabled = true;
            nextButton.style.display = 'block';
        }

        // Индикатор
        indicator.textContent = `Глава ${chapterNum} из 11`;
    }

    updateFooterYear() {
        const yearElement = document.querySelector('.footer-left');
        if (yearElement) {
            const currentYear = new Date().getFullYear();
            yearElement.textContent = `© ${currentYear} QUASARUM`;
        }
    }
}

// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    app = new App();
});
