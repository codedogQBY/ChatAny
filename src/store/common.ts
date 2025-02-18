import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { LanguageEnum, DARK_MODE, ThemeEnum, SessionModeEnum } from '@/types/index.d.ts';
import useStore from '@/hook/useStore';

export const useCommonStore = defineStore('common', () => {
    const { setStoreData, getStoreData, hasStoreData } = useStore();
    if (!hasStoreData('common')) {
        setStoreData('common', {
            language: LanguageEnum.ZH_CN,
            darkMode: DARK_MODE.LIGHT,
            themeColor: ThemeEnum.GREEN,
            sessionMode: SessionModeEnum.LEFT,
        });
    }

    const storeData = getStoreData('common');

    const language = ref(storeData.language);
    const darkMode = ref(storeData.darkMode);
    const themeColor = ref(storeData.themeColor);
    const sessionMode = ref(storeData.sessionMode);

    const getLanguage = computed(() => language.value);
    const getDarkMode = computed(() => darkMode.value);
    const getThemeColor = computed(() => themeColor.value);
    const getSessionMode = computed(() => sessionMode.value);

    const setLanguage = (val: LanguageEnum) => {
        language.value = val;
        setStoreData('common', {
            ...storeData,
            language: val,
        });
    };

    const setDarkMode = (val: DARK_MODE) => {
        darkMode.value = val;
        setStoreData('common', {
            ...storeData,
            darkMode: val,
        });
        // 设置暗黑模式，html 根元素添加 class dark
        document.documentElement.classList.toggle('dark', val === DARK_MODE.DARK);
    };

    const setThemeColor = (val: ThemeEnum) => {
        themeColor.value = val;
        setStoreData('common', {
            ...storeData,
            themeColor: val,
        });
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
        setStoreData('common', {
            ...storeData,
            sessionMode: val,
        });
        sessionMode.value = val;
    };

    // 初始化
    setDarkMode(darkMode.value);
    setThemeColor(themeColor.value);
    setLanguage(language.value);
    setSessionMode(sessionMode.value);

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
