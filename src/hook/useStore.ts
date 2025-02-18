export default function useStore() {
    const setStoreData = (key: string, value: any) => {
        window.localStorage.setItem(key, JSON.stringify(value));
    };

    const getStoreData = (key: string) => {
        const data = window.localStorage.getItem(key);
        return data ? JSON.parse(data) : undefined;
    };

    const hasStoreData = (key: string) => {
        return !!window.localStorage.getItem(key);
    };
    return {
        setStoreData,
        getStoreData,
        hasStoreData,
    };
}
