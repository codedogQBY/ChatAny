import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { LanguageEnum, DARK_MODE, ThemeEnum, SessionModeEnum } from '@/types/index.d.ts';

export const useCommonStore = defineStore('common', () => {
    const language = ref(LanguageEnum.ZH_CN);
    const darkMode = ref(DARK_MODE.LIGHT);
    const themeColor = ref(ThemeEnum.GREEN);
    const sessionMode = ref(SessionModeEnum.LEFT);

    const getLanguage = computed(() => language.value);
    const getDarkMode = computed(() => darkMode.value);
    const getThemeColor = computed(() => themeColor.value);
    const getSessionMode = computed(() => sessionMode.value);

    const setLanguage = (val: LanguageEnum) => {
        language.value = val;
    };

    const setDarkMode = (val: DARK_MODE) => {
        darkMode.value = val;
        // 设置暗黑模式，html 根元素添加 class dark
        document.documentElement.classList.toggle('dark', val === DARK_MODE.DARK);
    };

    const setThemeColor = (val: ThemeEnum) => {
        themeColor.value = val;
        document.documentElement.classList.remove(
            'theme-green',
            'theme-rose',
            'theme-blue',
            'theme-zinc',
            'theme-orange',
            'theme-yellow',
            'theme-violet',
            'theme-red'
        );
        document.documentElement.classList.add(`theme-${val}`);
    };

    const setSessionMode = (val: SessionModeEnum) => {
        sessionMode.value = val;
    };

    return {
        getLanguage,
        getDarkMode,
        getThemeColor,
        getSessionMode,
        setLanguage,
        setDarkMode,
        setThemeColor,
        setSessionMode,
    };
});
