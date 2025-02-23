import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { LanguageEnum, DARK_MODE, ThemeEnum, SessionModeEnum } from '@/types';
import store from '@/hook/useStore';

interface CommonState {
    language: LanguageEnum;
    darkMode: DARK_MODE;
    themeColor: ThemeEnum;
    sessionMode: SessionModeEnum;
}

const defaultState: CommonState = {
    language: LanguageEnum.ZH_CN,
    darkMode: DARK_MODE.LIGHT,
    themeColor: ThemeEnum.GREEN,
    sessionMode: SessionModeEnum.LEFT,
};

export const useCommonStore = defineStore('common', () => {
    const language = ref<LanguageEnum>(defaultState.language);
    const darkMode = ref<DARK_MODE>(defaultState.darkMode);
    const themeColor = ref<ThemeEnum>(defaultState.themeColor);
    const sessionMode = ref<SessionModeEnum>(defaultState.sessionMode);

    const getLanguage = computed(() => language.value);
    const getDarkMode = computed(() => darkMode.value);
    const getThemeColor = computed(() => themeColor.value);
    const getSessionMode = computed(() => sessionMode.value);

    // 同步数据到本地存储
    const syncData = async () => {
        await store.set('common', {
            language: language.value,
            darkMode: darkMode.value,
            themeColor: themeColor.value,
            sessionMode: sessionMode.value,
        });
    };

    // 初始化数据
    const initializeStore = async () => {
        const savedState = await store.get<CommonState>('common');
        if (savedState) {
            language.value = savedState.language;
            darkMode.value = savedState.darkMode;
            themeColor.value = savedState.themeColor;
            sessionMode.value = savedState.sessionMode;
        } else {
            language.value = defaultState.language;
            darkMode.value = defaultState.darkMode;
            themeColor.value = defaultState.themeColor;
            sessionMode.value = defaultState.sessionMode;
            await syncData();
        }
        
        // 初始化主题和暗黑模式
        setDarkMode(darkMode.value);
        setThemeColor(themeColor.value);
    };

    const setLanguage = async (val: LanguageEnum) => {
        language.value = val;
        await syncData();
    };

    const setDarkMode = async (val: DARK_MODE) => {
        darkMode.value = val;
        // 设置暗黑模式，html 根元素添加 class dark
        document.documentElement.classList.toggle('dark', val === DARK_MODE.DARK);
        await syncData();
    };

    const setThemeColor = async (val: ThemeEnum) => {
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
        await syncData();
    };

    const setSessionMode = async (val: SessionModeEnum) => {
        sessionMode.value = val;
        await syncData();
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
        initializeStore,
    };
});
